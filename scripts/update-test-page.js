const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newContent = `
<section class="hero-section" style="padding: 100px 20px; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3d7ab5 100%); text-align: center; position: relative; overflow: hidden;">
  <div style="max-width: 900px; margin: 0 auto; position: relative; z-index: 1;">
    <span style="display: inline-block; padding: 8px 16px; background: rgba(255,255,255,0.2); border-radius: 20px; color: white; font-size: 14px; margin-bottom: 20px;">🌏 남북청년 교류 플랫폼</span>
    <h1 style="color: white; font-size: 52px; font-weight: bold; margin-bottom: 24px; line-height: 1.2;">
      함께 만들어가는<br/>새로운 한반도
    </h1>
    <p style="color: rgba(255,255,255,0.9); font-size: 20px; line-height: 1.8; margin-bottom: 40px; max-width: 600px; margin-left: auto; margin-right: auto;">
      UniPivot은 남북 청년들이 함께 배우고, 교류하며, 미래를 준비하는 커뮤니티입니다.
    </p>
    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
      <a href="/register" style="display: inline-block; padding: 16px 36px; background: white; color: #1e3a5f; font-weight: bold; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
        지금 참여하기
      </a>
      <a href="/about" style="display: inline-block; padding: 16px 36px; background: transparent; color: white; font-weight: bold; border-radius: 50px; text-decoration: none; border: 2px solid rgba(255,255,255,0.5);">
        더 알아보기
      </a>
    </div>
  </div>
</section>

<section style="padding: 80px 20px; background: white;">
  <div style="max-width: 1200px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 60px;">
      <span style="color: #3d7ab5; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Our Programs</span>
      <h2 style="font-size: 40px; font-weight: bold; color: #1e293b; margin-top: 12px;">
        다양한 프로그램
      </h2>
      <p style="color: #64748b; font-size: 18px; margin-top: 16px; max-width: 500px; margin-left: auto; margin-right: auto;">
        여러분의 성장을 위한 다양한 프로그램을 준비했습니다
      </p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 24px; padding: 32px;">
        <div style="width: 64px; height: 64px; background: #3d7ab5; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
          <span style="font-size: 28px;">📚</span>
        </div>
        <h3 style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 12px;">독서 모임</h3>
        <p style="color: #64748b; line-height: 1.7; margin-bottom: 20px;">매주 선정된 도서를 함께 읽고 토론하며 다양한 시각을 나눕니다.</p>
        <a href="/bookclub" style="color: #3d7ab5; font-weight: 600; text-decoration: none;">자세히 보기 →</a>
      </div>
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 24px; padding: 32px;">
        <div style="width: 64px; height: 64px; background: #f59e0b; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
          <span style="font-size: 28px;">🎓</span>
        </div>
        <h3 style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 12px;">세미나</h3>
        <p style="color: #64748b; line-height: 1.7; margin-bottom: 20px;">각 분야 전문가들과 함께하는 깊이 있는 학습과 토론의 장입니다.</p>
        <a href="/seminar" style="color: #f59e0b; font-weight: 600; text-decoration: none;">자세히 보기 →</a>
      </div>
      <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 24px; padding: 32px;">
        <div style="width: 64px; height: 64px; background: #22c55e; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
          <span style="font-size: 28px;">✈️</span>
        </div>
        <h3 style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 12px;">K-Move</h3>
        <p style="color: #64748b; line-height: 1.7; margin-bottom: 20px;">해외 취업과 글로벌 역량 강화를 위한 특별 프로그램입니다.</p>
        <a href="/kmove" style="color: #22c55e; font-weight: 600; text-decoration: none;">자세히 보기 →</a>
      </div>
    </div>
  </div>
</section>

<section style="padding: 80px 20px; background: #1e3a5f;">
  <div style="max-width: 1000px; margin: 0 auto;">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 40px; text-align: center;">
      <div>
        <div style="font-size: 56px; font-weight: bold; color: white; margin-bottom: 8px;">500+</div>
        <div style="color: rgba(255,255,255,0.7); font-size: 16px;">활동 회원</div>
      </div>
      <div>
        <div style="font-size: 56px; font-weight: bold; color: white; margin-bottom: 8px;">50+</div>
        <div style="color: rgba(255,255,255,0.7); font-size: 16px;">진행 프로그램</div>
      </div>
      <div>
        <div style="font-size: 56px; font-weight: bold; color: white; margin-bottom: 8px;">30+</div>
        <div style="color: rgba(255,255,255,0.7); font-size: 16px;">협력 기관</div>
      </div>
      <div>
        <div style="font-size: 56px; font-weight: bold; color: white; margin-bottom: 8px;">5년</div>
        <div style="color: rgba(255,255,255,0.7); font-size: 16px;">운영 기간</div>
      </div>
    </div>
  </div>
</section>

<section style="padding: 80px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <div style="max-width: 800px; margin: 0 auto; text-align: center;">
    <h2 style="color: white; font-size: 36px; font-weight: bold; margin-bottom: 20px;">
      새로운 시작을 함께 하세요
    </h2>
    <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin-bottom: 40px; line-height: 1.7;">
      UniPivot과 함께 남북 청년 교류의 새로운 장을 열어보세요.<br/>
      지금 가입하시면 다양한 프로그램에 참여하실 수 있습니다.
    </p>
    <a href="/register" style="display: inline-block; padding: 18px 48px; background: white; color: #667eea; font-weight: bold; font-size: 18px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
      무료로 시작하기
    </a>
  </div>
</section>
`;

async function updatePage() {
  try {
    const page = await prisma.pageContent.update({
      where: { id: 'test-page-001' },
      data: {
        title: '유니피벗 소개 (편집됨)',
        content: newContent,
        metaTitle: 'UniPivot - 남북청년 교류 플랫폼',
        metaDesc: '남북 청년들이 함께 배우고 교류하며 미래를 준비하는 커뮤니티 UniPivot입니다.',
        isPublished: true,
        updatedAt: new Date()
      }
    });
    console.log('✅ 페이지 업데이트 완료:', page.title);
    console.log('   Content length:', page.content?.length);
    console.log('   Published:', page.isPublished);
  } catch (e) {
    console.error('❌ 오류:', e);
  } finally {
    await prisma.$disconnect();
  }
}

updatePage();
