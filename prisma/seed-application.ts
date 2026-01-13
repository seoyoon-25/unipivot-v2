import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const notificationTemplates = [
  {
    type: 'ACCEPT',
    name: '합격 안내',
    subject: '[{프로그램명}] 참가 신청 결과 안내',
    content: `안녕하세요 {이름}님,

{프로그램명} 참가 신청이 승인되었습니다!

■ 프로그램: {프로그램명}
■ 시작일: {시작일}
■ 장소: {장소}

{비용안내}

■ 입금 계좌: 국민은행 810101-04-352077 (유니피벗)
■ 입금 기한: {입금기한}
■ 입금자명: 반드시 신청자 본인 이름으로 입금해 주세요.

문의사항이 있으시면 언제든 연락 주세요.

감사합니다.
유니피벗 드림`,
    isDefault: true,
  },
  {
    type: 'ADDITIONAL',
    name: '추가 합격 안내',
    subject: '[{프로그램명}] 추가 합격 안내',
    content: `안녕하세요 {이름}님,

{프로그램명} 추가 합격되셨습니다!

기존 합격자 중 취소자가 발생하여 추가 합격 안내드립니다.

■ 프로그램: {프로그램명}
■ 시작일: {시작일}
■ 장소: {장소}

{비용안내}

■ 입금 계좌: 국민은행 810101-04-352077 (유니피벗)
■ 입금 기한: {입금기한}

빠른 회신 부탁드립니다.

감사합니다.
유니피벗 드림`,
    isDefault: true,
  },
  {
    type: 'REJECT',
    name: '불합격 안내',
    subject: '[{프로그램명}] 참가 신청 결과 안내',
    content: `안녕하세요 {이름}님,

{프로그램명}에 관심을 가져주셔서 감사합니다.

아쉽게도 이번에는 함께하지 못하게 되었습니다.
정원 대비 많은 분들이 신청해 주셔서 불가피하게
선발하게 된 점 양해 부탁드립니다.

다음 기수에서 꼭 다시 만나뵙길 바랍니다.

감사합니다.
유니피벗 드림`,
    isDefault: true,
  },
  {
    type: 'DEPOSIT',
    name: '보증금 입금 안내',
    subject: '[{프로그램명}] 보증금 입금 안내',
    content: `안녕하세요 {이름}님,

{프로그램명} 보증금 입금 안내드립니다.

■ 금액: {금액}원
■ 입금 계좌: 국민은행 810101-04-352077 (유니피벗)
■ 입금 기한: {입금기한}
■ 입금자명: {이름}

기한 내 미입금 시 참가가 취소될 수 있습니다.

감사합니다.
유니피벗 드림`,
    isDefault: true,
  },
  {
    type: 'BOOK_SURVEY',
    name: '책 수령 방식 조사',
    subject: '[{프로그램명}] 책 수령 방식 조사',
    content: `안녕하세요 {이름}님,

{프로그램명} 참가 확정을 축하드립니다!

독서모임 진행을 위해 책을 보내드리려고 합니다.
아래 링크에서 책 수령 방식을 선택해 주세요.

📚 책 수령 조사: {조사링크}

- 종이책 (교보문고 선물하기)
- ebook (원하는 업체 선택)
- 이미 책을 보유하고 있음

{마감일}까지 응답 부탁드립니다.

감사합니다.
유니피벗 드림`,
    isDefault: true,
  },
  {
    type: 'REMINDER',
    name: '신청 마감 임박 알림',
    subject: '[{프로그램명}] 신청 마감 D-{일수} 안내',
    content: `안녕하세요 {이름}님,

관심 표시해 주신 {프로그램명}의
신청 마감이 {일수}일 남았습니다!

■ 프로그램: {프로그램명}
■ 신청 마감: {마감일}
■ 현재 신청: {신청자수}명

👉 지금 신청하기: {신청링크}

감사합니다.
유니피벗 드림`,
    isDefault: true,
  },
  {
    type: 'NEW_PROGRAM',
    name: '새 프로그램 오픈 알림',
    subject: '[유니피벗] 새로운 프로그램이 오픈했습니다!',
    content: `안녕하세요 {이름}님,

유니피벗에서 새로운 프로그램을 오픈했습니다!

■ 프로그램: {프로그램명}
■ 모집 기간: {모집시작} ~ {모집마감}
■ 진행 기간: {시작일} ~ {종료일}
■ 장소: {장소}
■ 비용: {비용}

👉 자세히 보기: {링크}

많은 관심과 참여 부탁드립니다!

감사합니다.
유니피벗 드림`,
    isDefault: true,
  },
]

const systemSettings = [
  {
    key: 'BANK_ACCOUNT_BANK',
    value: '국민은행',
    description: '입금 계좌 - 은행명',
  },
  {
    key: 'BANK_ACCOUNT_NUMBER',
    value: '810101-04-352077',
    description: '입금 계좌 - 계좌번호',
  },
  {
    key: 'BANK_ACCOUNT_HOLDER',
    value: '유니피벗',
    description: '입금 계좌 - 예금주',
  },
  {
    key: 'BANK_ACCOUNT_FULL',
    value: '국민은행 810101-04-352077 (유니피벗)',
    description: '입금 계좌 - 전체 정보',
  },
  {
    key: 'DEPOSIT_REMINDER_DAYS',
    value: '3',
    description: '합격 후 보증금 미입금 리마인더 발송일',
  },
  {
    key: 'DEADLINE_REMINDER_DAYS',
    value: '3,1',
    description: '신청 마감 임박 알림 발송일 (콤마 구분)',
  },
  {
    key: 'NEW_PROGRAM_NOTIFY_EMAIL',
    value: 'true',
    description: '새 프로그램 오픈 시 이메일 알림 발송',
  },
  {
    key: 'NEW_PROGRAM_NOTIFY_SMS',
    value: 'false',
    description: '새 프로그램 오픈 시 SMS 알림 발송',
  },
]

const defaultApplicationForm = {
  name: '기본 신청서 양식',
  description: '프로그램 신청 기본 양식',
  isDefault: true,
  fields: JSON.stringify([
    { id: 'name', label: '이름', type: 'text', required: true, system: true },
    { id: 'phone', label: '연락처', type: 'tel', required: true, system: true },
    { id: 'email', label: '이메일', type: 'email', required: true, system: true },
    { id: 'hometown', label: '고향', type: 'text', required: true },
    { id: 'residence', label: '거주지역', type: 'text', required: true },
    { id: 'motivation', label: '신청 동기', type: 'textarea', required: true },
    {
      id: 'source',
      label: '신청 경로',
      type: 'radio',
      required: true,
      options: [
        { value: 'EXISTING_MEMBER', label: '기존회원' },
        { value: 'HANA_FOUNDATION', label: '남북하나재단 공지' },
        { value: 'SNS', label: '인스타그램, Facebook 등 SNS 홍보' },
        { value: 'KAKAO_GROUP', label: '관련 카톡방' },
        { value: 'KAKAO_CHANNEL', label: '카카오채널 또는 문자 메시지' },
        { value: 'REFERRAL', label: '지인추천' },
      ],
    },
    {
      id: 'referrer',
      label: '추천인 이름',
      type: 'text',
      required: false,
      conditional: { field: 'source', value: 'REFERRAL' },
    },
    { id: 'facePrivacy', label: '사진 촬영 시 얼굴 비공개 희망', type: 'checkbox', required: false },
    { id: 'privacyAgreed', label: '개인정보 수집 및 이용에 동의합니다 (필수)', type: 'checkbox', required: true, system: true },
  ]),
}

async function seedApplicationSystem() {
  console.log('🌱 Seeding application system data...')

  // Notification Templates
  console.log('📧 Creating notification templates...')
  for (const template of notificationTemplates) {
    await prisma.notificationTemplate.upsert({
      where: {
        id: `default-${template.type.toLowerCase()}`,
      },
      update: template,
      create: {
        id: `default-${template.type.toLowerCase()}`,
        ...template,
      },
    })
    console.log(`  ✓ ${template.name}`)
  }

  // System Settings
  console.log('⚙️ Creating system settings...')
  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting,
    })
    console.log(`  ✓ ${setting.key}`)
  }

  // Default Application Form
  console.log('📝 Creating default application form...')
  await prisma.applicationForm.upsert({
    where: { id: 'default-form' },
    update: defaultApplicationForm,
    create: {
      id: 'default-form',
      ...defaultApplicationForm,
    },
  })
  console.log('  ✓ 기본 신청서 양식')

  console.log('\n✅ Application system seeding completed!')
}

seedApplicationSystem()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
