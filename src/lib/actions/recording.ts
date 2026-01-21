'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 전사 파일 처리
export async function processTranscription(
  sessionId: string,
  formData: FormData
) {
  const userSession = await getServerSession(authOptions)
  if (!userSession?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: '파일이 필요합니다.' }
  }

  try {
    // 1. 텍스트 파싱
    let transcriptText = ''
    const fileName = file.name.toLowerCase()

    if (fileName.endsWith('.json')) {
      const fileContent = await file.text()
      try {
        const data = JSON.parse(fileContent)
        if (Array.isArray(data.transcription)) {
          transcriptText = data.transcription
            .map((t: any) => `[${t.speaker || '화자'}] ${t.timestamp || ''}\n${t.text}`)
            .join('\n\n')
        } else if (typeof data === 'string') {
          transcriptText = data
        } else {
          transcriptText = JSON.stringify(data, null, 2)
        }
      } catch {
        transcriptText = fileContent
      }
    } else if (fileName.endsWith('.txt')) {
      transcriptText = await file.text()
    } else {
      // 다른 형식은 그대로 텍스트로 시도
      transcriptText = await file.text()
    }

    if (!transcriptText.trim()) {
      return { error: '전사 내용을 추출할 수 없습니다.' }
    }

    // 2. AI로 블로그 변환
    const blogContent = await convertToBlogPost(transcriptText)

    // 3. DB 저장
    const recording = await prisma.sessionRecording.create({
      data: {
        sessionId,
        originalFileName: file.name,
        originalFileUrl: `local://${file.name}`, // 로컬 저장 표시
        uploadedBy: userSession.user.id,
        transcriptRaw: transcriptText,
        transcriptClean: blogContent.content
      }
    })

    // 5. 블로그 초안 생성
    if (blogContent.content) {
      await prisma.sessionBlogPost.create({
        data: {
          recordingId: recording.id,
          title: blogContent.title || `${sessionId} 모임 기록`,
          content: blogContent.content,
          excerpt: blogContent.excerpt
        }
      })
    }

    return { success: true, recordingId: recording.id }
  } catch (error) {
    console.error('전사 처리 오류:', error)
    return { error: '전사 처리 중 오류가 발생했습니다.' }
  }
}

// AI로 블로그 포스트 변환
async function convertToBlogPost(transcript: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    return {
      title: '모임 기록',
      content: transcript,
      excerpt: transcript.slice(0, 200)
    }
  }

  const prompt = `다음은 클로바노트로 전사된 독서모임 녹취록입니다.
이를 블로그 글로 변환해주세요.

[전사 내용]
${transcript.slice(0, 10000)}

요구사항:
1. 개인정보 제거
   - 전화번호, 이메일, 주소
   - 회사명, 직급
   - 실명 (참가자A, B로 익명화)

2. 민감 내용 필터링
   - 정치/종교 논쟁
   - 개인적 고민/건강 문제
   - 비방성 발언

3. 구조화
   - 제목 (자동 생성)
   - 오늘의 주제
   - 주요 토론 내용 (테마별 분류)
   - 핵심 인사이트 (3-5개)
   - 다음 모임 예고

4. 발언자 익명화
   - "참가자1" → "참가자A"
   - 또는 "한 참가자는...", "다른 참가자는..."

5. 톤
   - 객관적이고 중립적
   - 긍정적인 분위기
   - 블로그 독자가 읽기 좋게

마크다운 형식으로 작성해주세요.
응답 형식:
---
title: 제목
excerpt: 200자 이내 요약
---
본문 내용`

  try {
    let response: string = ''

    if (process.env.ANTHROPIC_API_KEY) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const data = await res.json()
      response = data.content?.[0]?.text || ''
    } else if (process.env.OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const data = await res.json()
      response = data.choices?.[0]?.message?.content || ''
    }

    // 메타데이터 파싱
    const titleMatch = response.match(/title:\s*(.+)/i)
    const excerptMatch = response.match(/excerpt:\s*(.+)/i)
    const contentMatch = response.match(/---[\s\S]*?---\s*([\s\S]*)/i)

    return {
      title: titleMatch?.[1]?.trim() || '모임 기록',
      excerpt: excerptMatch?.[1]?.trim() || response.slice(0, 200),
      content: contentMatch?.[1]?.trim() || response
    }
  } catch (error) {
    console.error('AI 변환 오류:', error)
    return {
      title: '모임 기록',
      content: transcript,
      excerpt: transcript.slice(0, 200)
    }
  }
}

// 녹음 조회
export async function getSessionRecordings(sessionId: string) {
  return await prisma.sessionRecording.findMany({
    where: { sessionId },
    include: {
      blogPost: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

// 블로그 포스트 조회
export async function getBlogPost(recordingId: string) {
  return await prisma.sessionBlogPost.findUnique({
    where: { recordingId },
    include: {
      recording: {
        include: {
          session: {
            include: { program: true }
          }
        }
      }
    }
  })
}

// 블로그 포스트 업데이트
export async function updateBlogPost(
  postId: string,
  data: {
    title?: string
    content?: string
    excerpt?: string
    status?: string
  }
) {
  return await prisma.sessionBlogPost.update({
    where: { id: postId },
    data
  })
}

// 블로그 발행
export async function publishBlogPost(postId: string) {
  const post = await prisma.sessionBlogPost.update({
    where: { id: postId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      shareUrl: `/blog/${postId}`
    }
  })

  return post
}

