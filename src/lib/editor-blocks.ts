// Custom blocks for GrapesJS Visual Editor

export interface BlockConfig {
  id: string
  label: string
  category: string
  content: string
  media?: string
}

export const customBlocks: BlockConfig[] = [
  // Hero Section
  {
    id: 'hero-section',
    label: '히어로 섹션',
    category: 'UniPivot 블록',
    content: `
      <section class="hero-section" style="padding: 80px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
        <div style="max-width: 800px; margin: 0 auto;">
          <h1 style="color: white; font-size: 48px; font-weight: bold; margin-bottom: 20px;">
            제목을 입력하세요
          </h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 20px; line-height: 1.6; margin-bottom: 30px;">
            서브 텍스트를 입력하세요. 방문자에게 전달하고 싶은 메시지를 작성하세요.
          </p>
          <a href="#" style="display: inline-block; padding: 16px 32px; background: white; color: #667eea; font-weight: bold; border-radius: 8px; text-decoration: none;">
            버튼 텍스트
          </a>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="6" y1="9" x2="18" y2="9" stroke="currentColor" stroke-width="2"/><line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" stroke-width="1.5"/></svg>',
  },

  // Program Grid
  {
    id: 'program-grid',
    label: '프로그램 그리드',
    category: 'UniPivot 블록',
    content: `
      <section style="padding: 60px 20px; background: #f8fafc;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 36px; font-weight: bold; margin-bottom: 40px; color: #1e293b;">
            프로그램
          </h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
            <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="width: 48px; height: 48px; background: #eef2ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 24px;">📚</span>
              </div>
              <h3 style="font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">독서 모임</h3>
              <p style="color: #64748b; line-height: 1.6;">함께 책을 읽고 토론하며 새로운 관점을 배웁니다.</p>
            </div>
            <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="width: 48px; height: 48px; background: #fef3c7; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 24px;">🎓</span>
              </div>
              <h3 style="font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">세미나</h3>
              <p style="color: #64748b; line-height: 1.6;">전문가와 함께하는 깊이 있는 학습의 기회입니다.</p>
            </div>
            <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="width: 48px; height: 48px; background: #dcfce7; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 24px;">🤝</span>
              </div>
              <h3 style="font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">네트워킹</h3>
              <p style="color: #64748b; line-height: 1.6;">다양한 배경의 사람들과 교류하며 성장합니다.</p>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="3" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><rect x="9" y="3" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><rect x="16" y="3" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><rect x="2" y="15" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><rect x="9" y="15" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><rect x="16" y="15" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  },

  // CTA Banner
  {
    id: 'cta-banner',
    label: 'CTA 배너',
    category: 'UniPivot 블록',
    content: `
      <section style="padding: 60px 20px; background: #1e293b;">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
          <h2 style="color: white; font-size: 32px; font-weight: bold; margin-bottom: 16px;">
            지금 바로 시작하세요
          </h2>
          <p style="color: #94a3b8; font-size: 18px; margin-bottom: 30px;">
            새로운 경험과 만남이 여러분을 기다리고 있습니다.
          </p>
          <div style="display: flex; gap: 16px; justify-content: center;">
            <a href="#" style="display: inline-block; padding: 14px 28px; background: #6366f1; color: white; font-weight: bold; border-radius: 8px; text-decoration: none;">
              참여 신청
            </a>
            <a href="#" style="display: inline-block; padding: 14px 28px; background: transparent; color: white; font-weight: bold; border-radius: 8px; text-decoration: none; border: 2px solid #475569;">
              더 알아보기
            </a>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" stroke-width="2"/><rect x="14" y="12" width="6" height="3" rx="1" fill="currentColor"/></svg>',
  },

  // Contact Form
  {
    id: 'contact-form',
    label: '문의 폼',
    category: 'UniPivot 블록',
    content: `
      <section style="padding: 60px 20px; background: white;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 32px; font-weight: bold; margin-bottom: 8px; color: #1e293b;">
            문의하기
          </h2>
          <p style="text-align: center; color: #64748b; margin-bottom: 40px;">
            궁금한 점이 있으시면 언제든 연락주세요.
          </p>
          <form style="display: flex; flex-direction: column; gap: 20px;">
            <div>
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">이름</label>
              <input type="text" placeholder="홍길동" style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 16px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">이메일</label>
              <input type="email" placeholder="example@email.com" style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 16px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-weight: 500; color: #374151; margin-bottom: 8px;">메시지</label>
              <textarea placeholder="문의 내용을 입력하세요" rows="5" style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 16px; resize: vertical; box-sizing: border-box;"></textarea>
            </div>
            <button type="submit" style="width: 100%; padding: 14px; background: #6366f1; color: white; font-weight: bold; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
              전송하기
            </button>
          </form>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="6" y1="8" x2="18" y2="8" stroke="currentColor" stroke-width="1.5"/><line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" stroke-width="1.5"/><rect x="6" y="15" width="12" height="3" rx="1" fill="currentColor"/></svg>',
  },

  // Social Links
  {
    id: 'social-links',
    label: 'SNS 링크',
    category: 'UniPivot 블록',
    content: `
      <section style="padding: 40px 20px; background: #f1f5f9;">
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
          <h3 style="font-size: 18px; color: #64748b; margin-bottom: 20px;">Follow Us</h3>
          <div style="display: flex; gap: 16px; justify-content: center;">
            <a href="#" style="width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <span style="font-size: 20px;">📘</span>
            </a>
            <a href="#" style="width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <span style="font-size: 20px;">📸</span>
            </a>
            <a href="#" style="width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <span style="font-size: 20px;">🐦</span>
            </a>
            <a href="#" style="width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <span style="font-size: 20px;">▶️</span>
            </a>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="6" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8.6" y1="10.5" x2="15.4" y2="7.5" stroke="currentColor" stroke-width="2"/><line x1="8.6" y1="13.5" x2="15.4" y2="16.5" stroke="currentColor" stroke-width="2"/></svg>',
  },

  // Text Section with Image
  {
    id: 'text-image-section',
    label: '텍스트+이미지',
    category: 'UniPivot 블록',
    content: `
      <section style="padding: 60px 20px; background: white;">
        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
          <div>
            <h2 style="font-size: 36px; font-weight: bold; color: #1e293b; margin-bottom: 20px;">
              제목을 입력하세요
            </h2>
            <p style="color: #64748b; font-size: 18px; line-height: 1.8; margin-bottom: 24px;">
              본문 내용을 입력하세요. 서비스나 프로그램에 대한 설명을 작성해주세요.
              방문자에게 전달하고 싶은 핵심 메시지를 담아주세요.
            </p>
            <a href="#" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; font-weight: 500; border-radius: 8px; text-decoration: none;">
              자세히 보기
            </a>
          </div>
          <div style="background: #f1f5f9; border-radius: 16px; height: 400px; display: flex; align-items: center; justify-content: center;">
            <span style="color: #94a3b8; font-size: 14px;">이미지 영역 (클릭하여 편집)</span>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="8" height="4" fill="none" stroke="currentColor" stroke-width="2"/><rect x="2" y="10" width="8" height="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="2" y="14" width="6" height="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="13" y="4" width="9" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  },

  // Statistics Section
  {
    id: 'stats-section',
    label: '통계 섹션',
    category: 'UniPivot 블록',
    content: `
      <section style="padding: 60px 20px; background: #6366f1;">
        <div style="max-width: 1000px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; text-align: center;">
            <div>
              <div style="font-size: 48px; font-weight: bold; color: white; margin-bottom: 8px;">500+</div>
              <div style="color: rgba(255,255,255,0.8);">참여 회원</div>
            </div>
            <div>
              <div style="font-size: 48px; font-weight: bold; color: white; margin-bottom: 8px;">50+</div>
              <div style="color: rgba(255,255,255,0.8);">진행 프로그램</div>
            </div>
            <div>
              <div style="font-size: 48px; font-weight: bold; color: white; margin-bottom: 8px;">30+</div>
              <div style="color: rgba(255,255,255,0.8);">협력 기관</div>
            </div>
            <div>
              <div style="font-size: 48px; font-weight: bold; color: white; margin-bottom: 8px;">5년</div>
              <div style="color: rgba(255,255,255,0.8);">운영 기간</div>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="14" width="4" height="6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="10" y="10" width="4" height="10" fill="none" stroke="currentColor" stroke-width="2"/><rect x="17" y="6" width="4" height="14" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  },

  // Testimonials
  {
    id: 'testimonials',
    label: '후기/추천',
    category: 'UniPivot 블록',
    content: `
      <section style="padding: 60px 20px; background: #f8fafc;">
        <div style="max-width: 1000px; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 32px; font-weight: bold; color: #1e293b; margin-bottom: 40px;">
            참여자 후기
          </h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
            <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <p style="color: #64748b; font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
                "프로그램에 참여하면서 새로운 시각을 얻을 수 있었습니다. 다양한 배경의 사람들과 교류하며 많이 배웠어요."
              </p>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 48px; height: 48px; background: #e2e8f0; border-radius: 50%;"></div>
                <div>
                  <div style="font-weight: 600; color: #1e293b;">홍길동</div>
                  <div style="font-size: 14px; color: #94a3b8;">독서모임 참여자</div>
                </div>
              </div>
            </div>
            <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <p style="color: #64748b; font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
                "전문적인 강연과 네트워킹 기회가 정말 좋았습니다. 앞으로도 계속 참여하고 싶어요."
              </p>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 48px; height: 48px; background: #e2e8f0; border-radius: 50%;"></div>
                <div>
                  <div style="font-weight: 600; color: #1e293b;">김영희</div>
                  <div style="font-size: 14px; color: #94a3b8;">세미나 참여자</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 11a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 11a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 10V6" stroke="currentColor" stroke-width="2"/><path d="M17 10V6" stroke="currentColor" stroke-width="2"/></svg>',
  },
]
