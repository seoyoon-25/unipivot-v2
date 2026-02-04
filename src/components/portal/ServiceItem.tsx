'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface ServiceItemProps {
  num: string
  title: string
  titleEn: string
  description: string
  link: string
  isExternal?: boolean
  isNew?: boolean
}

export default function ServiceItem({
  num,
  title,
  titleEn,
  description,
  link,
  isExternal,
  isNew,
}: ServiceItemProps) {
  const [hovered, setHovered] = useState(false)

  const className =
    'group block border-b-2 border-[#1a1a1a] transition-all duration-300 hover:bg-[#1a1a1a] hover:text-white'

  const content = (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8 md:py-10">
      <div className="flex items-center justify-between gap-4">
        {/* 좌측: 넘버 + 타이틀 */}
        <div className="flex items-center gap-6 md:gap-10 flex-1 min-w-0">
          <span className="text-sm text-[#999] group-hover:text-white/40 w-8 flex-shrink-0 transition-colors">
            {num}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
              <h2
                className={`relative text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight transition-transform duration-300 ${
                  hovered ? 'translate-x-2' : ''
                }`}
              >
                {/* 영문: 항상 흐름에 있어 너비 결정, 호버 시 숨김 */}
                <span className={`transition-opacity duration-300 ${hovered ? 'opacity-0' : 'opacity-100'}`}>
                  {titleEn}
                </span>
                {/* 한글: 항상 absolute로 위에 겹침, 호버 시 표시 */}
                <span className={`absolute left-0 top-0 whitespace-nowrap transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
                  {title}
                </span>
              </h2>
              {isNew && (
                <span className="px-3 py-1 bg-[#FF3B30] text-white text-xs font-bold rounded-full flex-shrink-0">
                  NEW
                </span>
              )}
              {isExternal && (
                <span className="text-xs text-[#999] group-hover:text-white/40 hidden md:block">
                  External
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-[#666] group-hover:text-white/60 transition-colors">
                {title}
              </p>
              <span className="text-[#ccc] group-hover:text-white/30">
                &mdash;
              </span>
              <p className="text-sm text-[#999] group-hover:text-white/40 transition-colors hidden md:block">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* 우측: 바로가기 */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <span
            className={`hidden md:block text-sm font-medium transition-all duration-300 ${
              hovered
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-4'
            }`}
          >
            바로가기
          </span>
          <div
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-current flex items-center justify-center transition-all duration-300 ${
              hovered ? 'scale-110' : ''
            }`}
          >
            <ArrowUpRight
              className={`w-5 h-5 transition-transform duration-300 ${
                hovered ? 'rotate-45' : ''
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  )

  if (isExternal) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      href={link}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {content}
    </Link>
  )
}
