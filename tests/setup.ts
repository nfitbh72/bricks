/**
 * Jest setup file - runs before all tests
 */

// Suppress console logs during tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(), // Mock console.log
  warn: jest.fn(), // Mock console.warn
  error: jest.fn(), // Keep console.error for actual errors (or mock it too)
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock as any;

// Mock navigator.language for LanguageManager
Object.defineProperty(global.navigator, 'language', {
  writable: true,
  value: 'en-US',
});

// Mock fetch for loading translation files
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
) as jest.Mock;
