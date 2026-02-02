export function initKakao() {
  if (typeof window !== 'undefined' && !window.Kakao?.isInitialized()) {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
    if (key) {
      window.Kakao?.init(key)
    }
  }
}

export interface KakaoShareParams {
  title: string
  description: string
  imageUrl?: string
  link: string
  buttonText?: string
}

export function shareToKakao(params: KakaoShareParams) {
  if (typeof window === 'undefined' || !window.Kakao) {
    return
  }

  initKakao()

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: params.title,
      description: params.description,
      imageUrl:
        params.imageUrl || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/og-image.png`,
      link: {
        mobileWebUrl: params.link,
        webUrl: params.link,
      },
    },
    buttons: [
      {
        title: params.buttonText || '자세히 보기',
        link: {
          mobileWebUrl: params.link,
          webUrl: params.link,
        },
      },
    ],
  })
}

// Window.Kakao type is declared in src/components/common/ShareButton.tsx
