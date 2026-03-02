module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#4F46E5', light: '#EEF2FF' },
        secondary: '#0EA5E9',
        accent: '#F59E0B',
        success: '#10B981',
        neutral: {
          900: '#111827', 500: '#6B7280', 100: '#F9FAFB',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        hero: '20px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',
        hover: '0 8px 32px rgba(79,70,229,0.15)',
      },
    },
  },
  plugins: [],
}
