/**
 * Jest setup file - runs before all tests
 */

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
