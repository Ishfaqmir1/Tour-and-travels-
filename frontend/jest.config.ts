/**
 * Jest Configuration for Next.js Frontend Tests
 * ===============================================
 *
 * Uses next/jest to automatically configure SWC transforms, module
 * resolution, and environment settings compatible with Next.js.
 *
 * Key configuration:
 * - jsdom environment for DOM API simulation
 * - Module alias @/ mapped to src/ for clean imports
 * - CSS module imports handled by identity-obj-proxy
 * - Setup file provides mocks for browser APIs, framer-motion, etc.
 * - Test discovery in __tests__ directories
 *
 * @see ./jest.setup.ts for global mocks
 */
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: { url: 'http://localhost:3000' },
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: ['<rootDir>/src/__tests__/**/*.test.(ts|tsx)'],
};

export default createJestConfig(config);
