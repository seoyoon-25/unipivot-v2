'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getBlogPost, updateBlogPost, publishBlogPost } from '@/lib/actions/recording'

interface BlogPost {
  id: string
  recordingId: string
  title: string
  content: string
  excerpt: string | null
  status: string
  publishedAt: Date | null
  shareUrl: string | null
  recording: {
    id: string
    originalFileName: string
    transcriptRaw: string | null
    session: {
      id: string
      sessionNo: number
      title: string | null
      program: {
        id: string
        title: string
      }
    }
  }
}

export default function BlogEditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const postId = params.postId as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [activeTab, setActiveTab] = useState('edit')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getBlogPost(postId)
        if (data) {
          setPost(data)
          setTitle(data.title)
          setContent(data.content)
          setExcerpt(data.excerpt || '')
        }
      } catch (error) {
        console.error('블로그 글 조회 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id && postId) {
      fetchPost()
    }
  }, [session?.user?.id, postId])

  const handleSave = async () => {
    if (!post) return

    setSaving(true)
    try {
      await updateBlogPost(post.id, { title, content, excerpt })
      alert('저장되었습니다.')
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!post) return

    if (!confirm('블로그 글을 발행하시겠습니까? 발행 후에도 수정이 가능합니다.')) {
      return
    }

    setPublishing(true)
    try {
      const result = await publishBlogPost(post.id)
      if (result.shareUrl) {
        setPost({ ...post, status: 'PUBLISHED', shareUrl: result.shareUrl })
        alert('발행되었습니다!')
      }
    } catch (error) {
      console.error('발행 오류:', error)
      alert('발행에 실패했습니다.')
    } finally {
      setPublishing(false)
    }
  }

  const handleCopyLink = () => {
    if (post?.shareUrl) {
      navigator.clipboard.writeText(`${window.location.origin}${post.shareUrl}`)
      alert('링크가 복사되었습니다.')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!session || !post) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <p className="text-center text-gray-500">블로그 글을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          &larr; 돌아가기
        </Button>
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">블로그 글 편집</h1>
          <p className="text-gray-500 text-sm mt-1">
            {post.recording.session.program.title} - {post.recording.session.sessionNo}회차
          </p>
        </div>
        <Badge
          variant={post.status === 'PUBLISHED' ? 'default' : 'outline'}
          className={post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : ''}
        >
          {post.status === 'PUBLISHED' ? '발행됨' : '초안'}
        </Badge>
      </div>

      {/* 발행된 경우 공유 링크 */}
      {post.status === 'PUBLISHED' && post.shareUrl && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">블로그가 발행되었습니다!</p>
                <p className="text-sm text-green-600">{`${window.location.origin}${post.shareUrl}`}</p>
              </div>
              <Button variant="outline" onClick={handleCopyLink}>
                링크 복사
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="edit">편집</TabsTrigger>
          <TabsTrigger value="preview">미리보기</TabsTrigger>
          <TabsTrigger value="original">원본 전사</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="블로그 글 제목"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">요약 (200자 이내)</Label>
                  <Input
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="블로그 글 요약"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500">{excerpt.length}/200자</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>본문 (마크다운)</CardTitle>
                <CardDescription>
                  마크다운 형식으로 작성하세요. # 제목, ## 소제목, **굵게**, *기울임*, - 목록 등
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-96 border rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="마크다운으로 본문을 작성하세요..."
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '임시저장'}
              </Button>
              {post.status !== 'PUBLISHED' && (
                <Button onClick={handlePublish} disabled={publishing}>
                  {publishing ? '발행 중...' : '발행하기'}
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>{title || '(제목 없음)'}</CardTitle>
              {excerpt && (
                <CardDescription>{excerpt}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {content}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="original">
          <Card>
            <CardHeader>
              <CardTitle>원본 전사 내용</CardTitle>
              <CardDescription>
                클로바노트에서 전사된 원본 텍스트입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              {post.recording.transcriptRaw ? (
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {post.recording.transcriptRaw}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500">원본 전사 내용이 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
