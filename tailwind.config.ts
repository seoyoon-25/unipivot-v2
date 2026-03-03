import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'text-primary-dark',
    'border-border',
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				dark: '#E55A2B',
  				light: '#FFF4EE',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			// Club Design System - Warm Knowledge Hub
  			club: {
  				// Primary - Warm Indigo
  				primary: {
  					50: '#eef2ff',
  					100: '#e0e7ff',
  					200: '#c7d2fe',
  					300: '#a5b4fc',
  					400: '#818cf8',
  					500: '#6366f1',
  					600: '#4f46e5',
  					700: '#4338ca',
  					800: '#3730a3',
  					900: '#312e81',
  				},
  				// Accent - Warm Amber
  				accent: {
  					50: '#fffbeb',
  					100: '#fef3c7',
  					200: '#fde68a',
  					300: '#fcd34d',
  					400: '#fbbf24',
  					500: '#f59e0b',
  					600: '#d97706',
  					700: '#b45309',
  					800: '#92400e',
  					900: '#78350f',
  				},
  				// Neutral - Warm Gray (stone)
  				gray: {
  					50: '#fafaf9',
  					100: '#f5f5f4',
  					200: '#e7e5e4',
  					300: '#d6d3d1',
  					400: '#a8a29e',
  					500: '#78716c',
  					600: '#57534e',
  					700: '#44403c',
  					800: '#292524',
  					900: '#1c1917',
  				},
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			pretendard: [
  				'Pretendard Variable',
  				'Pretendard',
  				'Pretendard Fallback',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'system-ui',
  				'Roboto',
  				'Helvetica Neue',
  				'Segoe UI',
  				'Apple SD Gothic Neo',
  				'Noto Sans KR',
  				'Malgun Gothic',
  				'sans-serif'
  			],
  			sans: [
  				'Pretendard Variable',
  				'Pretendard',
  				'Pretendard Fallback',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'system-ui',
  				'Roboto',
  				'Helvetica Neue',
  				'Segoe UI',
  				'Apple SD Gothic Neo',
  				'Noto Sans KR',
  				'Malgun Gothic',
  				'sans-serif'
  			]
  		},
  		animation: {
  			'fade-up': 'fadeUp 0.6s ease-out forwards',
  			'fade-in': 'fadeIn 0.6s ease-out forwards',
  			'slide-down': 'slideDown 0.3s ease-out forwards',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			// Club animations
  			'club-fade-in': 'clubFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'club-fade-up': 'clubFadeUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'club-slide-right': 'clubSlideRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'club-pulse-glow': 'clubPulseGlow 4s ease-in-out infinite',
  		},
  		keyframes: {
  			fadeUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideDown: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			// Club keyframes
  			clubFadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' }
  			},
  			clubFadeUp: {
  				'0%': { opacity: '0', transform: 'translateY(16px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			clubSlideRight: {
  				'0%': { opacity: '0', transform: 'translateX(12px)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' }
  			},
  			clubPulseGlow: {
  				'0%, 100%': { opacity: '0.5' },
  				'50%': { opacity: '0.8' }
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
      require("tailwindcss-animate")
],
}

export default config
