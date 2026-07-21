/**
 * Jest Global Setup & Module Mocks
 * ==================================
 *
 * This file runs before every test suite to provide:
 * - Mocked Next.js router and navigation hooks (useRouter, usePathname, etc.)
 * - Mocked Next.js Link component (renders as <a> tag)
 * - Mocked framer-motion (strips animation props, renders children directly)
 * - Mocked react-hot-toast (prevents toast UI errors in test environment)
 * - Mocked react-photo-view (renders children directly)
 * - Mocked next/image (strips Next.js-specific props, renders <img>)
 * - Polyfills for browser APIs: matchMedia, IntersectionObserver, scrollIntoView
 *
 * CSS module imports are handled by identity-obj-proxy via jest.config.ts's
 * moduleNameMapper configuration.
 */
import React from 'react';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, className, onClick, ...props }: any) =>
    React.createElement('a', { href, className, onClick, ...props }, children);
});

// Mock framer-motion to render children directly
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    nav: ({ children, ...props }: any) => React.createElement('nav', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
    h1: ({ children, ...props }: any) => React.createElement('h1', props, children),
    p: ({ children, ...props }: any) => React.createElement('p', props, children),
    span: ({ children, ...props }: any) => React.createElement('span', props, children),
    section: ({ children, ...props }: any) => React.createElement('section', props, children),
    article: ({ children, ...props }: any) => React.createElement('article', props, children),
    li: ({ children, ...props }: any) => React.createElement('li', props, children),
    img: (props: any) => React.createElement('img', props),
    form: ({ children, ...props }: any) => React.createElement('form', props, children),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  useInView: () => [null, true],
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  Toaster: () => null,
}));

// Mock react-photo-view
jest.mock('react-photo-view', () => ({
  PhotoProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
  PhotoView: ({ children }: any) => React.createElement(React.Fragment, null, children),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, ...rest } = props;
    return React.createElement('img', rest);
  },
}));

// Mock matchMedia for react-photo-view
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();


