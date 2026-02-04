export const MAIN_SERVICE = {
  id: 'home',
  title: '유니피벗',
  titleEn: 'UniPivot',
  subtitle: 'Main Platform',
  description: '남북청년이 함께 하나된 미래를 그립니다',
  tags: ['남북청년', '통일교육', '커뮤니티'],
  link: '/home',
  stats: {
    members: '500+',
    years: '10',
  },
}

export const SUB_SERVICES = [
  {
    id: 'club',
    num: '01',
    title: '유니클럽',
    titleEn: 'UNICLUB',
    description: '책을 읽고 함께 나누는 독서 커뮤니티',
    link: '/uniclub',
    isExternal: false,
    isNew: false,
  },
  {
    id: 'lab',
    num: '02',
    title: '유니연구소',
    titleEn: 'UNILAB',
    description: '연구와 아카이브, 지식의 공간',
    link: 'https://lab.bestcome.org',
    isExternal: true,
    isNew: false,
  },
  {
    id: 'diary',
    num: '03',
    title: '행복일기',
    titleEn: 'UNIDIARY',
    description: 'NVC 기반 마음을 기록하는 일기',
    link: 'https://diary.bestcome.org',
    isExternal: true,
    isNew: true,
  },
]

export const FOOTER_STATS = [
  { label: 'ESTABLISHED', value: '2015' },
  { label: 'MEMBERS', value: '500+' },
  { label: 'PROGRAMS', value: '100+' },
  { label: 'LOCATION', value: 'SEOUL' },
]
