const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/src/__tests__/**/*.{ts,tsx}'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
  collectCoverageFrom: [
    'src/lib/utils/attendance.ts',
    'src/lib/utils/badges.ts',
    'src/lib/utils/deposit-calculator.ts',
    'src/lib/utils/qr.ts',
    'src/lib/utils/review.ts',
    'src/lib/sanitize.ts',
    'src/lib/google-calendar.ts',
    'src/components/club/rating/**/*.{ts,tsx}',
    'src/components/club/social/FollowButton.tsx',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 60,
      statements: 60,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
