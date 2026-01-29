'use client'

import { useEffect } from 'react'

export default function ScrollAnimation() {
  useEffect(() => {
    // Intersection Observer 옵션
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    // 콜백 함수
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          // 한 번만 실행
          observer.unobserve(entry.target)
        }
      })
    }

    // Observer 생성
    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // 관찰할 요소들 선택
    const animatedElements = document.querySelectorAll(
      '.animate-on-scroll, .slide-from-left, .slide-from-right, .scale-in, .fade-in'
    )

    // 모든 요소 관찰 시작
    animatedElements.forEach(el => observer.observe(el))

    // 클린업
    return () => {
      animatedElements.forEach(el => observer.unobserve(el))
      observer.disconnect()
    }
  }, [])

  return null
}

export { ScrollAnimation }
