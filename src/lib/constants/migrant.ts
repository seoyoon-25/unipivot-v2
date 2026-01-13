// 이주민 카테고리 정의
export const MIGRANT_CATEGORIES = {
  DEFECTOR: {
    value: 'DEFECTOR',
    label: '북한이탈주민',
    labelShort: '탈북민',
    color: 'blue',
    icon: 'MapPin',
  },
  MARRIAGE_IMMIGRANT: {
    value: 'MARRIAGE_IMMIGRANT',
    label: '결혼이민자',
    labelShort: '결혼이민',
    color: 'pink',
    icon: 'Heart',
  },
  MIGRANT_WORKER: {
    value: 'MIGRANT_WORKER',
    label: '외국인근로자',
    labelShort: '외국인근로',
    color: 'orange',
    icon: 'Briefcase',
  },
  INTERNATIONAL_STUDENT: {
    value: 'INTERNATIONAL_STUDENT',
    label: '유학생',
    labelShort: '유학생',
    color: 'purple',
    icon: 'GraduationCap',
  },
  REFUGEE: {
    value: 'REFUGEE',
    label: '난민',
    labelShort: '난민',
    color: 'red',
    icon: 'Shield',
  },
  OVERSEAS_KOREAN: {
    value: 'OVERSEAS_KOREAN',
    label: '재외동포',
    labelShort: '재외동포',
    color: 'green',
    icon: 'Globe',
  },
  MULTICULTURAL_CHILD: {
    value: 'MULTICULTURAL_CHILD',
    label: '다문화가정 자녀',
    labelShort: '다문화자녀',
    color: 'yellow',
    icon: 'Users',
  },
  NATURALIZED: {
    value: 'NATURALIZED',
    label: '귀화자',
    labelShort: '귀화자',
    color: 'teal',
    icon: 'UserCheck',
  },
  KOREAN: {
    value: 'KOREAN',
    label: '내국인',
    labelShort: '내국인',
    color: 'gray',
    icon: 'User',
  },
} as const

export type MigrantCategoryValue = keyof typeof MIGRANT_CATEGORIES

// 카테고리 배열 (UI 선택용)
export const MIGRANT_CATEGORY_LIST = Object.values(MIGRANT_CATEGORIES)

// 이주배경 카테고리만 (내국인 제외)
export const MIGRANT_BACKGROUND_CATEGORIES = MIGRANT_CATEGORY_LIST.filter(
  (cat) => cat.value !== 'KOREAN'
)

// 출신 국가 목록
export const ORIGIN_COUNTRIES = [
  { value: 'NORTH_KOREA', label: '북한', region: 'ASIA' },
  { value: 'CHINA', label: '중국', region: 'ASIA' },
  { value: 'VIETNAM', label: '베트남', region: 'ASIA' },
  { value: 'PHILIPPINES', label: '필리핀', region: 'ASIA' },
  { value: 'THAILAND', label: '태국', region: 'ASIA' },
  { value: 'CAMBODIA', label: '캄보디아', region: 'ASIA' },
  { value: 'INDONESIA', label: '인도네시아', region: 'ASIA' },
  { value: 'NEPAL', label: '네팔', region: 'ASIA' },
  { value: 'MYANMAR', label: '미얀마', region: 'ASIA' },
  { value: 'SRI_LANKA', label: '스리랑카', region: 'ASIA' },
  { value: 'BANGLADESH', label: '방글라데시', region: 'ASIA' },
  { value: 'PAKISTAN', label: '파키스탄', region: 'ASIA' },
  { value: 'INDIA', label: '인도', region: 'ASIA' },
  { value: 'MONGOLIA', label: '몽골', region: 'ASIA' },
  { value: 'UZBEKISTAN', label: '우즈베키스탄', region: 'CENTRAL_ASIA' },
  { value: 'KAZAKHSTAN', label: '카자흐스탄', region: 'CENTRAL_ASIA' },
  { value: 'KYRGYZSTAN', label: '키르기스스탄', region: 'CENTRAL_ASIA' },
  { value: 'JAPAN', label: '일본', region: 'ASIA' },
  { value: 'USA', label: '미국', region: 'AMERICA' },
  { value: 'RUSSIA', label: '러시아', region: 'EUROPE' },
  { value: 'OTHER', label: '기타', region: 'OTHER' },
] as const

// 연구동향 카테고리 (확장)
export const RESEARCH_CATEGORIES = [
  { value: '', label: '전체' },
  // 기존 북한/통일 분야
  { value: '정치·외교', label: '정치·외교' },
  { value: '경제·사회', label: '경제·사회' },
  { value: '북한사회', label: '북한사회' },
  { value: '탈북민', label: '탈북민' },
  { value: '통일교육', label: '통일교육' },
  { value: '인권', label: '인권' },
  // 확장: 다문화/이주 분야
  { value: '다문화', label: '다문화' },
  { value: '결혼이민', label: '결혼이민' },
  { value: '외국인근로자', label: '외국인근로자' },
  { value: '유학생', label: '유학생' },
  { value: '난민', label: '난민' },
  { value: '이주정책', label: '이주정책' },
  { value: '사회통합', label: '사회통합' },
] as const

// 전문가 대상 그룹 (targetExpertise용)
export const EXPERTISE_TARGET_GROUPS = MIGRANT_BACKGROUND_CATEGORIES.map(
  (cat) => ({
    value: cat.value,
    label: cat.label,
  })
)

// 카테고리별 추가 필드 정의
export const CATEGORY_SPECIFIC_FIELDS = {
  DEFECTOR: {
    fields: ['defectionYear', 'settlementYear', 'hometown'],
    labels: {
      defectionYear: '탈북년도',
      settlementYear: '정착년도',
      hometown: '고향 (북한 지역)',
    },
  },
  MARRIAGE_IMMIGRANT: {
    fields: ['arrivalYear', 'originCountry'],
    labels: {
      arrivalYear: '입국년도',
      originCountry: '출신국가',
    },
  },
  MIGRANT_WORKER: {
    fields: ['arrivalYear', 'originCountry'],
    labels: {
      arrivalYear: '입국년도',
      originCountry: '출신국가',
    },
  },
  INTERNATIONAL_STUDENT: {
    fields: ['arrivalYear', 'originCountry'],
    labels: {
      arrivalYear: '입국년도',
      originCountry: '출신국가',
    },
  },
  REFUGEE: {
    fields: ['arrivalYear', 'originCountry'],
    labels: {
      arrivalYear: '입국년도',
      originCountry: '출신국가',
    },
  },
  OVERSEAS_KOREAN: {
    fields: ['arrivalYear', 'originCountry'],
    labels: {
      arrivalYear: '입국년도',
      originCountry: '출신국가',
    },
  },
  MULTICULTURAL_CHILD: {
    fields: ['originCountry'],
    labels: {
      originCountry: '부모 출신국가',
    },
  },
  NATURALIZED: {
    fields: ['arrivalYear', 'originCountry'],
    labels: {
      arrivalYear: '귀화년도',
      originCountry: '이전 국적',
    },
  },
  KOREAN: {
    fields: [],
    labels: {},
  },
} as const

// 크롤링 키워드 (연구 동향용)
export const RESEARCH_CRAWLING_KEYWORDS = [
  // 기존: 북한이탈주민
  '북한이탈주민',
  '탈북민',
  '탈북자',
  '새터민',
  // 확장: 다문화/이주
  '다문화',
  '결혼이민',
  '이주여성',
  '외국인근로자',
  '이주노동자',
  '유학생',
  '난민',
  '고려인',
  '조선족',
  '재외동포',
  '귀화',
  '이민자',
  '사회통합',
] as const

// 헬퍼 함수들
export function getMigrantCategoryLabel(value: string | null | undefined): string {
  if (!value) return '-'
  return MIGRANT_CATEGORIES[value as MigrantCategoryValue]?.label || value
}

export function getMigrantCategoryLabelShort(value: string | null | undefined): string {
  if (!value) return '-'
  return MIGRANT_CATEGORIES[value as MigrantCategoryValue]?.labelShort || value
}

export function getMigrantCategoryColor(value: string | null | undefined): string {
  if (!value) return 'gray'
  return MIGRANT_CATEGORIES[value as MigrantCategoryValue]?.color || 'gray'
}

export function getMigrantCategoryIcon(value: string | null | undefined): string {
  if (!value) return 'User'
  return MIGRANT_CATEGORIES[value as MigrantCategoryValue]?.icon || 'User'
}

export function getOriginCountryLabel(value: string | null | undefined): string {
  if (!value) return '-'
  return ORIGIN_COUNTRIES.find((c) => c.value === value)?.label || value
}

// 기존 origin 값을 originCategory로 변환
export function convertOriginToCategory(origin: string | null | undefined): string | null {
  if (!origin) return null
  switch (origin) {
    case 'NORTH':
      return 'DEFECTOR'
    case 'SOUTH':
      return 'KOREAN'
    case 'OVERSEAS':
      return null // 구체적인 카테고리 필요
    default:
      return null
  }
}

// originCategory를 기존 origin으로 변환 (하위 호환)
export function convertCategoryToOrigin(category: string | null | undefined): string {
  if (!category) return 'SOUTH'
  switch (category) {
    case 'DEFECTOR':
      return 'NORTH'
    case 'KOREAN':
      return 'SOUTH'
    default:
      return 'OVERSEAS'
  }
}

// 카테고리별 색상 클래스 반환 (Tailwind)
export function getCategoryColorClasses(value: string | null | undefined): {
  bg: string
  text: string
  border: string
} {
  const color = getMigrantCategoryColor(value)
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  }
  return colorMap[color] || colorMap.gray
}
