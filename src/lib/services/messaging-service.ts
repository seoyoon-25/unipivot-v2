import crypto from 'crypto'
import prisma from '@/lib/db'

// 메시지 발송 결과
interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

// 알림톡 템플릿 변수
interface TemplateVariables {
  [key: string]: string | number
}

// 수신자 정보
interface Recipient {
  phone: string
  name?: string
  variables?: TemplateVariables
}

// 발송 옵션
interface SendOptions {
  templateCode?: string // 알림톡 템플릿 코드
  subject?: string // 이메일/LMS 제목
  fallbackToSMS?: boolean // 알림톡 실패 시 SMS로 대체
}

// 메시지 채널
type MessageChannel = 'KAKAO' | 'SMS' | 'LMS' | 'EMAIL'

// Solapi API 헤더 생성
function getSolapiAuthHeader(): Record<string, string> {
  const apiKey = process.env.SOLAPI_API_KEY
  const apiSecret = process.env.SOLAPI_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('Solapi API credentials not configured')
  }

  const date = new Date().toISOString()
  const salt = crypto.randomBytes(32).toString('hex')
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex')

  return {
    'Content-Type': 'application/json',
    Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
  }
}

// NCloud SENS API 시그니처 생성
function getNCloudSignature(
  method: string,
  url: string,
  timestamp: string
): string {
  const accessKey = process.env.NCLOUD_ACCESS_KEY
  const secretKey = process.env.NCLOUD_SECRET_KEY

  if (!accessKey || !secretKey) {
    throw new Error('NCloud API credentials not configured')
  }

  const space = ' '
  const newLine = '\n'
  const message = [method, space, url, newLine, timestamp, newLine, accessKey].join('')

  return crypto.createHmac('sha256', secretKey).update(message).digest('base64')
}

// 템플릿 변수 치환
function replaceTemplateVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`#{${key}}`, 'g'), String(value))
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
  }
  return result
}

// Solapi로 알림톡 발송
async function sendKakaoViaSolapi(
  recipients: Recipient[],
  templateCode: string,
  content: string,
  options: SendOptions = {}
): Promise<SendResult[]> {
  const pfId = process.env.SOLAPI_PFID
  const senderPhone = process.env.SOLAPI_SENDER_PHONE

  if (!pfId || !senderPhone) {
    throw new Error('Solapi Kakao settings not configured')
  }

  const messages = recipients.map((recipient) => ({
    to: recipient.phone.replace(/[^0-9]/g, ''),
    from: senderPhone,
    kakaoOptions: {
      pfId,
      templateId: templateCode,
      variables: recipient.variables || {},
    },
  }))

  try {
    const response = await fetch('https://api.solapi.com/messages/v4/send-many', {
      method: 'POST',
      headers: getSolapiAuthHeader(),
      body: JSON.stringify({ messages }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Solapi error:', data)
      return recipients.map(() => ({
        success: false,
        error: data.message || 'Solapi API error',
      }))
    }

    return recipients.map((_, index) => ({
      success: true,
      messageId: data.groupId || `solapi-${Date.now()}-${index}`,
    }))
  } catch (error) {
    console.error('Solapi request error:', error)
    return recipients.map(() => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }))
  }
}

// Solapi로 SMS/LMS 발송
async function sendSMSViaSolapi(
  recipients: Recipient[],
  content: string,
  options: SendOptions = {}
): Promise<SendResult[]> {
  const senderPhone = process.env.SOLAPI_SENDER_PHONE

  if (!senderPhone) {
    throw new Error('Solapi sender phone not configured')
  }

  const isLMS = content.length > 90 || options.subject

  const messages = recipients.map((recipient) => {
    const finalContent = recipient.variables
      ? replaceTemplateVariables(content, recipient.variables)
      : content

    return {
      to: recipient.phone.replace(/[^0-9]/g, ''),
      from: senderPhone,
      type: isLMS ? 'LMS' : 'SMS',
      text: finalContent,
      ...(isLMS && options.subject ? { subject: options.subject } : {}),
    }
  })

  try {
    const response = await fetch('https://api.solapi.com/messages/v4/send-many', {
      method: 'POST',
      headers: getSolapiAuthHeader(),
      body: JSON.stringify({ messages }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Solapi SMS error:', data)
      return recipients.map(() => ({
        success: false,
        error: data.message || 'Solapi API error',
      }))
    }

    return recipients.map((_, index) => ({
      success: true,
      messageId: data.groupId || `solapi-sms-${Date.now()}-${index}`,
    }))
  } catch (error) {
    console.error('Solapi SMS request error:', error)
    return recipients.map(() => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }))
  }
}

// NCloud SENS로 알림톡 발송
async function sendKakaoViaNCloud(
  recipients: Recipient[],
  templateCode: string,
  content: string,
  options: SendOptions = {}
): Promise<SendResult[]> {
  const serviceId = process.env.NCLOUD_KAKAO_SERVICE_ID
  const accessKey = process.env.NCLOUD_ACCESS_KEY
  const pfId = process.env.NCLOUD_PFID

  if (!serviceId || !accessKey || !pfId) {
    throw new Error('NCloud Kakao settings not configured')
  }

  const timestamp = Date.now().toString()
  const url = `/alimtalk/v2/services/${serviceId}/messages`
  const signature = getNCloudSignature('POST', url, timestamp)

  const messages = recipients.map((recipient) => {
    const finalContent = recipient.variables
      ? replaceTemplateVariables(content, recipient.variables)
      : content

    return {
      countryCode: '82',
      to: recipient.phone.replace(/[^0-9]/g, '').replace(/^0/, ''),
      content: finalContent,
    }
  })

  try {
    const response = await fetch(
      `https://sens.apigw.ntruss.com${url}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp': timestamp,
          'x-ncp-iam-access-key': accessKey,
          'x-ncp-apigw-signature-v2': signature,
        },
        body: JSON.stringify({
          plusFriendId: pfId,
          templateCode,
          messages,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('NCloud Kakao error:', data)
      return recipients.map(() => ({
        success: false,
        error: data.message || 'NCloud API error',
      }))
    }

    return recipients.map((_, index) => ({
      success: true,
      messageId: data.requestId || `ncloud-${Date.now()}-${index}`,
    }))
  } catch (error) {
    console.error('NCloud Kakao request error:', error)
    return recipients.map(() => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }))
  }
}

// 메시지 발송 로그 기록
async function logNotification(
  type: string,
  channel: MessageChannel,
  recipientId: string | null,
  recipientPhone: string,
  subject: string,
  content: string,
  status: 'PENDING' | 'SENT' | 'FAILED',
  errorMessage?: string
): Promise<void> {
  try {
    await prisma.notificationLog.create({
      data: {
        type,
        channel,
        recipientId,
        recipientPhone,
        subject,
        content,
        status,
        sentAt: status === 'SENT' ? new Date() : null,
        errorMessage,
      },
    })
  } catch (error) {
    console.error('Failed to log notification:', error)
  }
}

// 사용 가능한 메시징 서비스 확인
export function getAvailableProvider(): 'SOLAPI' | 'NCLOUD' | null {
  if (process.env.SOLAPI_API_KEY && process.env.SOLAPI_API_SECRET) {
    return 'SOLAPI'
  }
  if (process.env.NCLOUD_ACCESS_KEY && process.env.NCLOUD_SECRET_KEY) {
    return 'NCLOUD'
  }
  return null
}

// 알림톡 발송 (통합)
export async function sendKakaoNotification(
  recipients: Recipient[],
  templateCode: string,
  content: string,
  options: SendOptions = {}
): Promise<SendResult[]> {
  const provider = getAvailableProvider()

  if (!provider) {
    console.warn('No messaging provider configured, skipping Kakao notification')
    return recipients.map(() => ({
      success: false,
      error: 'No messaging provider configured',
    }))
  }

  let results: SendResult[]

  if (provider === 'SOLAPI') {
    results = await sendKakaoViaSolapi(recipients, templateCode, content, options)
  } else {
    results = await sendKakaoViaNCloud(recipients, templateCode, content, options)
  }

  // 실패한 경우 SMS로 대체 발송
  if (options.fallbackToSMS) {
    const failedIndices = results
      .map((r, i) => (r.success ? -1 : i))
      .filter((i) => i >= 0)

    if (failedIndices.length > 0) {
      const failedRecipients = failedIndices.map((i) => recipients[i])
      const smsResults = await sendSMS(failedRecipients, content, options)

      failedIndices.forEach((originalIndex, smsIndex) => {
        results[originalIndex] = smsResults[smsIndex]
      })
    }
  }

  // 로그 기록
  for (let i = 0; i < recipients.length; i++) {
    await logNotification(
      options.templateCode || 'KAKAO',
      'KAKAO',
      null,
      recipients[i].phone,
      options.subject || '알림톡',
      content,
      results[i].success ? 'SENT' : 'FAILED',
      results[i].error
    )
  }

  return results
}

// SMS 발송 (통합)
export async function sendSMS(
  recipients: Recipient[],
  content: string,
  options: SendOptions = {}
): Promise<SendResult[]> {
  const provider = getAvailableProvider()

  if (!provider) {
    console.warn('No messaging provider configured, skipping SMS')
    return recipients.map(() => ({
      success: false,
      error: 'No messaging provider configured',
    }))
  }

  const results = await sendSMSViaSolapi(recipients, content, options)

  // 로그 기록
  for (let i = 0; i < recipients.length; i++) {
    await logNotification(
      'SMS',
      content.length > 90 ? 'LMS' : 'SMS',
      null,
      recipients[i].phone,
      options.subject || 'SMS',
      content,
      results[i].success ? 'SENT' : 'FAILED',
      results[i].error
    )
  }

  return results
}

// 만족도 조사 알림톡 발송
export async function sendSurveyNotification(
  surveyId: string,
  programTitle: string,
  deadline: Date,
  recipients: Array<{ userId: string; name: string; phone: string }>
): Promise<{ sent: number; failed: number }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unipivot.org'
  const surveyUrl = `${appUrl}/survey/${surveyId}`
  const deadlineStr = deadline.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  })

  // 알림톡 템플릿 내용
  const content = `[UniPivot] 만족도 조사 안내

안녕하세요, #{name}님!

'${programTitle}' 프로그램에 참여해 주셔서 감사합니다.

프로그램 만족도 조사에 참여해 주세요.
설문 완료 후 보증금 반환이 진행됩니다.

응답 기한: ${deadlineStr}까지

▶ 설문 참여하기
${surveyUrl}

문의: admin@unipivot.org`

  const recipientList = recipients.map((r) => ({
    phone: r.phone,
    name: r.name,
    variables: {
      name: r.name,
      programTitle,
      deadline: deadlineStr,
      surveyUrl,
    },
  }))

  const results = await sendKakaoNotification(
    recipientList,
    'SURVEY_REQUEST', // 알림톡 템플릿 코드
    content,
    {
      subject: `[UniPivot] ${programTitle} 만족도 조사`,
      fallbackToSMS: true,
    }
  )

  // 인앱 알림도 생성
  for (const recipient of recipients) {
    try {
      await prisma.notification.create({
        data: {
          userId: recipient.userId,
          type: 'PROGRAM',
          title: '만족도 조사 안내',
          content: `'${programTitle}' 프로그램 만족도 조사에 참여해 주세요. (${deadlineStr}까지)`,
          link: `/survey/${surveyId}`,
        },
      })
    } catch (error) {
      console.error('Failed to create in-app notification:', error)
    }
  }

  const sent = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  return { sent, failed }
}

// 만족도 조사 리마인더 발송
export async function sendSurveyReminder(
  surveyId: string,
  programTitle: string,
  deadline: Date,
  recipients: Array<{ userId: string; name: string; phone: string }>
): Promise<{ sent: number; failed: number }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unipivot.org'
  const surveyUrl = `${appUrl}/survey/${surveyId}`
  const deadlineStr = deadline.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  })

  const content = `[UniPivot] 만족도 조사 마감 임박

안녕하세요, #{name}님!

'${programTitle}' 만족도 조사 응답 기한이 얼마 남지 않았습니다.

응답 기한: ${deadlineStr}까지

기한 내 미응답 시 보증금 반환이 지연될 수 있습니다.

▶ 설문 참여하기
${surveyUrl}`

  const recipientList = recipients.map((r) => ({
    phone: r.phone,
    name: r.name,
    variables: {
      name: r.name,
      programTitle,
      deadline: deadlineStr,
      surveyUrl,
    },
  }))

  const results = await sendKakaoNotification(
    recipientList,
    'SURVEY_REMINDER',
    content,
    {
      subject: `[UniPivot] ${programTitle} 만족도 조사 마감 임박`,
      fallbackToSMS: true,
    }
  )

  // 인앱 알림
  for (const recipient of recipients) {
    try {
      await prisma.notification.create({
        data: {
          userId: recipient.userId,
          type: 'PROGRAM',
          title: '만족도 조사 마감 임박',
          content: `'${programTitle}' 만족도 조사가 ${deadlineStr}에 마감됩니다. 서둘러 참여해 주세요!`,
          link: `/survey/${surveyId}`,
        },
      })
    } catch (error) {
      console.error('Failed to create reminder notification:', error)
    }
  }

  const sent = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  return { sent, failed }
}

// 보증금 반환 완료 알림
export async function sendRefundCompleteNotification(
  programTitle: string,
  refundAmount: number,
  recipients: Array<{ userId: string; name: string; phone: string }>
): Promise<{ sent: number; failed: number }> {
  const content = `[UniPivot] 보증금 반환 완료

안녕하세요, #{name}님!

'${programTitle}' 프로그램 보증금이 반환되었습니다.

반환 금액: ${refundAmount.toLocaleString()}원

계좌로 입금이 완료되었으니 확인해 주세요.

감사합니다.`

  const recipientList = recipients.map((r) => ({
    phone: r.phone,
    name: r.name,
    variables: {
      name: r.name,
      programTitle,
      refundAmount: refundAmount.toLocaleString(),
    },
  }))

  const results = await sendKakaoNotification(
    recipientList,
    'REFUND_COMPLETE',
    content,
    {
      subject: `[UniPivot] ${programTitle} 보증금 반환 완료`,
      fallbackToSMS: true,
    }
  )

  // 인앱 알림
  for (const recipient of recipients) {
    try {
      await prisma.notification.create({
        data: {
          userId: recipient.userId,
          type: 'PAYMENT',
          title: '보증금 반환 완료',
          content: `'${programTitle}' 프로그램 보증금 ${refundAmount.toLocaleString()}원이 반환되었습니다.`,
          link: `/my/programs`,
        },
      })
    } catch (error) {
      console.error('Failed to create refund notification:', error)
    }
  }

  const sent = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  return { sent, failed }
}
