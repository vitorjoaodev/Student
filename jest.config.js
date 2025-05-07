/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.ts'],
  moduleNameMapper: {
    // Mapeia imports de CSS, imagens, etc.
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/client/src/__mocks__/fileMock.js',
    
    // Mapeia aliases do projeto
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@assets/(.*)$': '<rootDir>/attached_assets/$1',
    '^@components/(.*)$': '<rootDir>/client/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/client/src/lib/$1',
    '^@hooks/(.*)$': '<rootDir>/client/src/hooks/$1',
    '^@contexts/(.*)$': '<rootDir>/client/src/contexts/$1',
    '^@store/(.*)$': '<rootDir>/client/src/store/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: './tsconfig.json',
    }],
  },
  // Cobertura de teste
  collectCoverageFrom: [
    'client/src/**/*.{js,jsx,ts,tsx}',
    '!client/src/**/*.d.ts',
    '!client/src/main.tsx',
    '!client/src/service-worker.ts',
    '!client/src/serviceWorkerRegistration.ts',
  ],
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}'],
  testTimeout: 10000,
  maxWorkers: 1,
};