'use client'

import { ArrowDown } from 'lucide-react'

export function HeroScrollButton() {
  const scrollToContent = () => {
    const element = document.getElementById('programs')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button
      onClick={scrollToContent}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors hero-fade-up"
      style={{ animationDelay: '0.8s' }}
    >
      <div className="hero-bounce">
        <ArrowDown className="w-6 h-6" />
      </div>
    </button>
  )
}
