'use client'

import { cn } from '@/lib/utils'

interface WalkingPeninsulaLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function WalkingPeninsulaLoader({
  size = 'md',
  text = '로딩중...',
  className
}: WalkingPeninsulaLoaderProps) {
  const sizeClasses = {
    sm: 'w-20 h-28',
    md: 'w-32 h-44',
    lg: 'w-44 h-60'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* 걷는 한반도 캐릭터 */}
        <svg
          viewBox="0 0 120 160"
          className="w-full h-full animate-walk-horizontal"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 그림자 필터 */}
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.2" />
            </filter>
            {/* 귀여운 블러시 그라데이션 */}
            <radialGradient id="blush" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFB6C1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFB6C1" stopOpacity="0" />
            </radialGradient>
            {/* 한반도 그라데이션 */}
            <linearGradient id="peninsulaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#74C69D" />
              <stop offset="50%" stopColor="#52B788" />
              <stop offset="100%" stopColor="#40916C" />
            </linearGradient>
          </defs>

          {/* 로딩중 텍스트 - 머리 위에 */}
          {text && (
            <text
              x="60"
              y="12"
              textAnchor="middle"
              className="animate-text-bounce"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                fill: '#1B4332',
              }}
            >
              {text}
            </text>
          )}

          {/* 전체 캐릭터 그룹 (좌우 이동 느낌) */}
          <g className="animate-peninsula-bounce" style={{ transformOrigin: '60px 75px' }}>
            {/* 한반도 본체 */}
            <g filter="url(#shadow)">
              {/* 한반도 실루엣 - 단순화된 귀여운 버전 */}
              <path
                d="M65 22
                   C68 22, 72 24, 75 28
                   C78 32, 80 36, 78 42
                   C76 46, 73 49, 70 52
                   C68 54, 66 56, 65 59
                   C64 62, 65 66, 68 69
                   C72 72, 76 74, 78 79
                   C80 84, 80 90, 77 96
                   C74 102, 68 106, 62 109
                   C58 111, 54 112, 50 111
                   C46 110, 43 107, 42 102
                   C41 98, 42 94, 45 90
                   C47 87, 48 84, 47 81
                   C46 78, 43 76, 40 74
                   C37 72, 34 69, 33 64
                   C32 59, 34 54, 38 50
                   C42 46, 48 44, 52 40
                   C55 37, 57 32, 58 28
                   C59 24, 62 22, 65 22
                   Z"
                fill="url(#peninsulaGradient)"
                stroke="#2D6A4F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* 왼쪽 팔 */}
            <g className="animate-arm-left" style={{ transformOrigin: '38px 65px' }}>
              <path
                d="M38 65
                   C32 70, 26 78, 22 88"
                fill="none"
                stroke="#52B788"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* 손 */}
              <circle cx="22" cy="90" r="5" fill="#40916C" stroke="#2D6A4F" strokeWidth="1.5" />
            </g>

            {/* 오른쪽 팔 */}
            <g className="animate-arm-right" style={{ transformOrigin: '82px 65px' }}>
              <path
                d="M82 65
                   C88 70, 94 78, 98 88"
                fill="none"
                stroke="#52B788"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* 손 */}
              <circle cx="98" cy="90" r="5" fill="#40916C" stroke="#2D6A4F" strokeWidth="1.5" />
            </g>

            {/* 귀여운 눈 */}
            <g className="animate-blink">
              {/* 왼쪽 눈 */}
              <ellipse cx="48" cy="64" rx="4" ry="5" fill="#1B4332" />
              <ellipse cx="46" cy="62" rx="1.5" ry="2" fill="white" />
              {/* 오른쪽 눈 */}
              <ellipse cx="64" cy="59" rx="4" ry="5" fill="#1B4332" />
              <ellipse cx="62" cy="57" rx="1.5" ry="2" fill="white" />
            </g>

            {/* 볼터치 */}
            <ellipse cx="40" cy="72" rx="6" ry="4" fill="url(#blush)" />
            <ellipse cx="70" cy="69" rx="6" ry="4" fill="url(#blush)" />

            {/* 귀여운 미소 */}
            <path
              d="M52 76 Q57 82, 62 76"
              fill="none"
              stroke="#1B4332"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* 다리 그룹 */}
          <g>
            {/* 왼쪽 다리 */}
            <g className="animate-leg-left" style={{ transformOrigin: '48px 109px' }}>
              <path
                d="M48 109
                   C46 116, 44 124, 42 134
                   C41 138, 40 142, 41 146"
                fill="none"
                stroke="#52B788"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* 발 */}
              <ellipse
                cx="41"
                cy="148"
                rx="9"
                ry="5"
                fill="#40916C"
                stroke="#2D6A4F"
                strokeWidth="2"
              />
              <ellipse cx="39" cy="146" rx="3" ry="2" fill="#52B788" opacity="0.5" />
            </g>

            {/* 오른쪽 다리 */}
            <g className="animate-leg-right" style={{ transformOrigin: '68px 109px' }}>
              <path
                d="M68 109
                   C70 116, 72 124, 74 134
                   C75 138, 76 142, 75 146"
                fill="none"
                stroke="#52B788"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* 발 */}
              <ellipse
                cx="75"
                cy="148"
                rx="9"
                ry="5"
                fill="#40916C"
                stroke="#2D6A4F"
                strokeWidth="2"
              />
              <ellipse cx="73" cy="146" rx="3" ry="2" fill="#52B788" opacity="0.5" />
            </g>
          </g>

          {/* 움직임 효과 (속도선) - 왼쪽에서 오른쪽 이동 느낌 */}
          <g className="animate-speed-lines" opacity="0.4">
            <line x1="5" y1="70" x2="15" y2="70" stroke="#74C69D" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="82" x2="14" y2="82" stroke="#74C69D" strokeWidth="2" strokeLinecap="round" />
            <line x1="5" y1="94" x2="15" y2="94" stroke="#74C69D" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes peninsula-bounce {
          0%, 100% {
            transform: translateY(0px) rotate(-1deg);
          }
          25% {
            transform: translateY(-3px) rotate(0deg);
          }
          50% {
            transform: translateY(0px) rotate(1deg);
          }
          75% {
            transform: translateY(-3px) rotate(0deg);
          }
        }

        @keyframes walk-horizontal {
          0%, 100% {
            transform: translateX(-3px);
          }
          50% {
            transform: translateX(3px);
          }
        }

        @keyframes leg-left {
          0%, 100% {
            transform: rotate(20deg) translateY(0px);
          }
          50% {
            transform: rotate(-20deg) translateY(2px);
          }
        }

        @keyframes leg-right {
          0%, 100% {
            transform: rotate(-20deg) translateY(2px);
          }
          50% {
            transform: rotate(20deg) translateY(0px);
          }
        }

        @keyframes arm-left {
          0%, 100% {
            transform: rotate(-15deg);
          }
          50% {
            transform: rotate(15deg);
          }
        }

        @keyframes arm-right {
          0%, 100% {
            transform: rotate(15deg);
          }
          50% {
            transform: rotate(-15deg);
          }
        }

        @keyframes blink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }

        @keyframes speed-lines {
          0%, 100% {
            opacity: 0.2;
            transform: translateX(0px);
          }
          50% {
            opacity: 0.6;
            transform: translateX(-5px);
          }
        }

        @keyframes text-bounce {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .animate-peninsula-bounce {
          animation: peninsula-bounce 1s ease-in-out infinite;
        }

        .animate-walk-horizontal {
          animation: walk-horizontal 1s ease-in-out infinite;
        }

        .animate-leg-left {
          animation: leg-left 1s ease-in-out infinite;
        }

        .animate-leg-right {
          animation: leg-right 1s ease-in-out infinite;
        }

        .animate-arm-left {
          animation: arm-left 1s ease-in-out infinite;
        }

        .animate-arm-right {
          animation: arm-right 1s ease-in-out infinite;
        }

        .animate-blink {
          animation: blink 3s ease-in-out infinite;
          transform-origin: center;
        }

        .animate-speed-lines {
          animation: speed-lines 1s ease-in-out infinite;
        }

        .animate-text-bounce {
          animation: text-bounce 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// 전체 화면 오버레이 버전
export function WalkingPeninsulaOverlay({
  text = '잠시만 기다려주세요...',
  className
}: {
  text?: string
  className?: string
}) {
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm',
      className
    )}>
      <WalkingPeninsulaLoader size="lg" text={text} />
    </div>
  )
}

// 인라인 버전 (버튼 등에 사용)
export function WalkingPeninsulaInline({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <WalkingPeninsulaLoader size="sm" text="" />
    </div>
  )
}
