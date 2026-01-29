import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 페이지 초기 데이터
  const pages = [
    {
      slug: 'about',
      title: '유니피벗 소개',
      description: '미션과 핵심 가치',
      isPublished: true,
      menuGroup: '소개',
      menuOrder: 1,
    },
    {
      slug: 'history',
      title: '연혁',
      description: '유니피벗 히스토리',
      isPublished: true,
      menuGroup: '소개',
      menuOrder: 2,
    },
    {
      slug: 'books',
      title: '읽고 싶은 책',
      description: '함께 읽고 싶은 책 공유',
      isPublished: false,  // 비공개로 시작
      unpublishedMessage: '페이지 준비 중입니다. 곧 함께 읽고 싶은 책을 공유할 수 있어요!',
      menuGroup: '소통마당',
      menuOrder: 3,
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  console.log('Pages seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
