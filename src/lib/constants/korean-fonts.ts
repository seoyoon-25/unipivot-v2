// 한글 웹폰트 설정
export interface KoreanFont {
  id: string
  name: string
  nameKo: string
  category: '고딕' | '명조' | '손글씨' | '디스플레이'
  weights: number[]
  cdn: string
  cssFamily: string
  description: string
  recommended?: boolean
}

export const KOREAN_FONTS: KoreanFont[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // 고딕 계열 (Sans-serif)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'pretendard',
    name: 'Pretendard',
    nameKo: '프리텐다드',
    category: '고딕',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    cdn: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css',
    cssFamily: "'Pretendard', sans-serif",
    description: '가독성이 뛰어난 모던 고딕체',
    recommended: true,
  },
  {
    id: 'noto_sans_kr',
    name: 'Noto Sans KR',
    nameKo: '노토 산스',
    category: '고딕',
    weights: [100, 300, 400, 500, 700, 900],
    cdn: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap',
    cssFamily: "'Noto Sans KR', sans-serif",
    description: '구글 표준 한글 고딕체',
    recommended: true,
  },
  {
    id: 'spoqa_han_sans_neo',
    name: 'Spoqa Han Sans Neo',
    nameKo: '스포카 한 산스 네오',
    category: '고딕',
    weights: [100, 300, 400, 500, 700],
    cdn: 'https://spoqa.github.io/spoqa-han-sans/css/SpoqaHanSansNeo.css',
    cssFamily: "'Spoqa Han Sans Neo', sans-serif",
    description: '깔끔하고 현대적인 고딕체',
    recommended: true,
  },
  {
    id: 'nanum_gothic',
    name: 'Nanum Gothic',
    nameKo: '나눔고딕',
    category: '고딕',
    weights: [400, 700, 800],
    cdn: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap',
    cssFamily: "'Nanum Gothic', sans-serif",
    description: '네이버 나눔 고딕체',
  },
  {
    id: 'nanum_square',
    name: 'NanumSquare',
    nameKo: '나눔스퀘어',
    category: '고딕',
    weights: [300, 400, 700, 800],
    cdn: 'https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css',
    cssFamily: "'NanumSquare', sans-serif",
    description: '네모난 느낌의 나눔 고딕',
  },
  {
    id: 'nanum_square_round',
    name: 'NanumSquareRound',
    nameKo: '나눔스퀘어라운드',
    category: '고딕',
    weights: [300, 400, 700, 800],
    cdn: 'https://cdn.jsdelivr.net/gh/innks/NanumSquareRound/nanumsquareround.css',
    cssFamily: "'NanumSquareRound', sans-serif",
    description: '둥근 느낌의 나눔 고딕',
  },
  {
    id: 'gmarket_sans',
    name: 'Gmarket Sans',
    nameKo: '지마켓 산스',
    category: '고딕',
    weights: [300, 500, 700],
    cdn: 'https://cdn.jsdelivr.net/gh/webfontworld/gmarket/GmarketSans.css',
    cssFamily: "'Gmarket Sans', sans-serif",
    description: '지마켓 브랜드 폰트',
  },
  {
    id: 'wanted_sans',
    name: 'Wanted Sans',
    nameKo: '원티드 산스',
    category: '고딕',
    weights: [400, 500, 600, 700, 800],
    cdn: 'https://cdn.jsdelivr.net/gh/niceplugin/WantedSansKR/wanted-sans.css',
    cssFamily: "'Wanted Sans', sans-serif",
    description: '원티드랩의 모던 고딕체',
  },
  {
    id: 'suit',
    name: 'SUIT',
    nameKo: '수트',
    category: '고딕',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    cdn: 'https://cdn.jsdelivr.net/gh/sun-typeface/SUIT/fonts/variable/woff2/SUIT-Variable.css',
    cssFamily: "'SUIT', sans-serif",
    description: '가변 폰트 지원 고딕체',
  },
  {
    id: 'paperlogy',
    name: 'Paperlogy',
    nameKo: '페이퍼로지',
    category: '고딕',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    cdn: 'https://cdn.jsdelivr.net/gh/niceplugin/Paperlogy/Paperlogy.css',
    cssFamily: "'Paperlogy', sans-serif",
    description: '깔끔한 문서용 고딕체',
  },
  {
    id: 'gothic_a1',
    name: 'Gothic A1',
    nameKo: '고딕 A1',
    category: '고딕',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    cdn: 'https://fonts.googleapis.com/css2?family=Gothic+A1:wght@100;200;300;400;500;600;700;800;900&display=swap',
    cssFamily: "'Gothic A1', sans-serif",
    description: '다양한 굵기의 고딕체',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 명조 계열 (Serif)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'noto_serif_kr',
    name: 'Noto Serif KR',
    nameKo: '노토 세리프',
    category: '명조',
    weights: [200, 300, 400, 500, 600, 700, 900],
    cdn: 'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400;500;600;700;900&display=swap',
    cssFamily: "'Noto Serif KR', serif",
    description: '구글 표준 한글 명조체',
    recommended: true,
  },
  {
    id: 'nanum_myeongjo',
    name: 'Nanum Myeongjo',
    nameKo: '나눔명조',
    category: '명조',
    weights: [400, 700, 800],
    cdn: 'https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap',
    cssFamily: "'Nanum Myeongjo', serif",
    description: '네이버 나눔 명조체',
  },
  {
    id: 'maruburi',
    name: 'MaruBuri',
    nameKo: '마루 부리',
    category: '명조',
    weights: [300, 400, 600, 700],
    cdn: 'https://cdn.jsdelivr.net/gh/webfontworld/MaruBuri/MaruBuri.css',
    cssFamily: "'MaruBuri', serif",
    description: '부드러운 현대 명조체',
    recommended: true,
  },
  {
    id: 'kopub_batang',
    name: 'KoPub Batang',
    nameKo: '코퍼브 바탕',
    category: '명조',
    weights: [300, 500, 700],
    cdn: 'https://cdn.jsdelivr.net/gh/niceplugin/KoPubFont/KoPubBatang.css',
    cssFamily: "'KoPub Batang', serif",
    description: '출판용 표준 명조체',
  },
  {
    id: 'ridibatang',
    name: 'RIDIBatang',
    nameKo: '리디바탕',
    category: '명조',
    weights: [400],
    cdn: 'https://cdn.jsdelivr.net/gh/niceplugin/RIDIBatang/RIDIBatang.css',
    cssFamily: "'RIDIBatang', serif",
    description: '리디북스 전자책 명조체',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 손글씨/캘리그래피 계열
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'nanum_pen',
    name: 'Nanum Pen Script',
    nameKo: '나눔펜',
    category: '손글씨',
    weights: [400],
    cdn: 'https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap',
    cssFamily: "'Nanum Pen Script', cursive",
    description: '펜으로 쓴 듯한 손글씨체',
  },
  {
    id: 'nanum_brush',
    name: 'Nanum Brush Script',
    nameKo: '나눔붓',
    category: '손글씨',
    weights: [400],
    cdn: 'https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&display=swap',
    cssFamily: "'Nanum Brush Script', cursive",
    description: '붓으로 쓴 듯한 손글씨체',
  },
  {
    id: 'uhbee_seulvely',
    name: 'UhBee SeulVely',
    nameKo: '어비 슬벨리체',
    category: '손글씨',
    weights: [400],
    cdn: 'https://cdn.jsdelivr.net/gh/niceplugin/UhBeeFonts/UhBeeSeulvely.css',
    cssFamily: "'UhBee SeulVely', cursive",
    description: '귀여운 손글씨체',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 디자인/특수 폰트
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'black_han_sans',
    name: 'Black Han Sans',
    nameKo: '블랙 한 산스',
    category: '디스플레이',
    weights: [400],
    cdn: 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap',
    cssFamily: "'Black Han Sans', sans-serif",
    description: '굵고 강렬한 제목용 폰트',
  },
  {
    id: 'do_hyeon',
    name: 'Do Hyeon',
    nameKo: '도현',
    category: '디스플레이',
    weights: [400],
    cdn: 'https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap',
    cssFamily: "'Do Hyeon', sans-serif",
    description: '배달의민족 도현체',
  },
  {
    id: 'jua',
    name: 'Jua',
    nameKo: '주아',
    category: '디스플레이',
    weights: [400],
    cdn: 'https://fonts.googleapis.com/css2?family=Jua&display=swap',
    cssFamily: "'Jua', sans-serif",
    description: '배달의민족 주아체',
  },
  {
    id: 'single_day',
    name: 'Single Day',
    nameKo: '싱글데이',
    category: '디스플레이',
    weights: [400],
    cdn: 'https://fonts.googleapis.com/css2?family=Single+Day&display=swap',
    cssFamily: "'Single Day', cursive",
    description: '귀여운 둥근 폰트',
  },
  {
    id: 'gaegu',
    name: 'Gaegu',
    nameKo: '개구',
    category: '디스플레이',
    weights: [300, 400, 700],
    cdn: 'https://fonts.googleapis.com/css2?family=Gaegu:wght@300;400;700&display=swap',
    cssFamily: "'Gaegu', cursive",
    description: '손글씨 느낌의 귀여운 폰트',
  },
  {
    id: 'poor_story',
    name: 'Poor Story',
    nameKo: '푸어스토리',
    category: '디스플레이',
    weights: [400],
    cdn: 'https://fonts.googleapis.com/css2?family=Poor+Story&display=swap',
    cssFamily: "'Poor Story', cursive",
    description: '낙서 느낌의 폰트',
  },
  {
    id: 'dongle',
    name: 'Dongle',
    nameKo: '동글',
    category: '디스플레이',
    weights: [300, 400, 700],
    cdn: 'https://fonts.googleapis.com/css2?family=Dongle:wght@300;400;700&display=swap',
    cssFamily: "'Dongle', sans-serif",
    description: '둥글둥글 귀여운 폰트',
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    nameKo: '선플라워',
    category: '디스플레이',
    weights: [300, 500, 700],
    cdn: 'https://fonts.googleapis.com/css2?family=Sunflower:wght@300;500;700&display=swap',
    cssFamily: "'Sunflower', sans-serif",
    description: '밝고 경쾌한 폰트',
  },
]

export const FONT_CATEGORIES = [
  { id: 'sans_serif', label: '고딕', labelEn: 'Sans-serif', value: '고딕' },
  { id: 'serif', label: '명조', labelEn: 'Serif', value: '명조' },
  { id: 'handwriting', label: '손글씨', labelEn: 'Handwriting', value: '손글씨' },
  { id: 'display', label: '디자인', labelEn: 'Display', value: '디스플레이' },
] as const

// 추천 폰트 가져오기
export const getRecommendedFonts = () => KOREAN_FONTS.filter((f) => f.recommended)

// 카테고리별 폰트 가져오기
export const getFontsByCategory = (category: string) =>
  KOREAN_FONTS.filter((f) => f.category === category)

// 폰트 ID로 폰트 정보 가져오기
export const getFontById = (id: string) => KOREAN_FONTS.find((f) => f.id === id)

// 폰트 이름으로 폰트 정보 가져오기
export const getFontByName = (name: string) => KOREAN_FONTS.find((f) => f.name === name)

// 기본 폰트 ID
export const DEFAULT_PRIMARY_FONT = 'pretendard'
export const DEFAULT_HEADING_FONT = 'pretendard'
