import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: '#FF5E10',
  				dark: '#E55A2B',
  				light: '#FFF4EE',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			dark: {
  				DEFAULT: '#1A1A1A',
  				secondary: '#2D2D2D',
  			},
  			light: {
  				DEFAULT: '#F2F2F2',
  				secondary: '#FAFAFA',
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
  			'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
  			'fade-in-down': 'fadeInDown 0.8s ease-out forwards',
  			'fade-in-left': 'fadeInLeft 0.8s ease-out forwards',
  			'fade-in-right': 'fadeInRight 0.8s ease-out forwards',
  			'slide-down': 'slideDown 0.3s ease-out forwards',
  			'slide-up': 'slideUp 0.5s ease-out forwards',
  			'scale-in': 'scaleIn 0.5s ease-out forwards',
  			'scale-up': 'scaleUp 0.5s ease-out forwards',
  			'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
  			'float': 'float 3s ease-in-out infinite',
  			'pulse-slow': 'pulse 3s ease-in-out infinite',
  			'spin-slow': 'spin 8s linear infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'text-reveal': 'textReveal 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards',
  			'line-grow': 'lineGrow 0.6s ease-out forwards',
  			'counter': 'counter 2s ease-out forwards',
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
  			fadeInUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(40px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			fadeInDown: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-40px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			fadeInLeft: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-40px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			fadeInRight: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(40px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
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
  			slideUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(100%)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.9)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			scaleUp: {
  				'0%': {
  					transform: 'scale(1)'
  				},
  				'50%': {
  					transform: 'scale(1.05)'
  				},
  				'100%': {
  					transform: 'scale(1)'
  				}
  			},
  			bounceSubtle: {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
  			textReveal: {
  				'0%': {
  					transform: 'translateY(100%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			lineGrow: {
  				'0%': {
  					transform: 'scaleX(0)',
  					transformOrigin: 'left'
  				},
  				'100%': {
  					transform: 'scaleX(1)',
  					transformOrigin: 'left'
  				}
  			},
  			counter: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
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
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		transitionTimingFunction: {
  			'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
  			'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  			'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
  		},
  		transitionDuration: {
  			'400': '400ms',
  			'600': '600ms',
  			'800': '800ms',
  			'1000': '1000ms',
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
