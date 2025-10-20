/**
 * Tests for LanguageManager
 */

import { LanguageManager } from '../../src/renderer/i18n/LanguageManager';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('LanguageManager', () => {
  let languageManager: LanguageManager;

  beforeEach(() => {
    // Reset singleton
    (LanguageManager as any).instance = undefined;
    
    // Mock translations
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        ui: {
          buttons: {
            continue: 'CONTINUE',
            quit: 'QUIT',
          },
        },
        game: {
          levels: {
            level1: 'Level 1: Test',
          },
        },
      }),
    });

    languageManager = LanguageManager.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = LanguageManager.getInstance();
      const instance2 = LanguageManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('loadTranslations', () => {
    it('should load translations', async () => {
      await languageManager.loadTranslations();
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('t (translate)', () => {
    it('should return translation for valid key', async () => {
      await languageManager.loadTranslations();
      expect(languageManager.t('ui.buttons.continue')).toBe('CONTINUE');
    });

    it('should return key for missing translation', async () => {
      await languageManager.loadTranslations();
      expect(languageManager.t('ui.buttons.missing')).toBe('ui.buttons.missing');
    });

    it('should handle nested keys', async () => {
      await languageManager.loadTranslations();
      expect(languageManager.t('game.levels.level1')).toBe('Level 1: Test');
    });
  });

  describe('setLanguage', () => {
    it('should change language', async () => {
      await languageManager.setLanguage('es');
      expect(languageManager.getCurrentLanguage()).toBe('es');
    });

    it('should reload translations after language change', async () => {
      await languageManager.setLanguage('es');
      expect(global.fetch).toHaveBeenCalledWith('./i18n/es.json');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return list of supported languages', () => {
      const languages = languageManager.getSupportedLanguages();
      expect(languages).toContain('en');
      expect(languages).toContain('es');
      expect(languages).toContain('fr');
      expect(languages).toContain('de');
      expect(languages).toContain('ja');
    });
  });

  describe('getLanguageName', () => {
    it('should return display name for language', () => {
      expect(languageManager.getLanguageName('en')).toBe('English');
      expect(languageManager.getLanguageName('es')).toBe('Español');
      expect(languageManager.getLanguageName('fr')).toBe('Français');
      expect(languageManager.getLanguageName('de')).toBe('Deutsch');
      expect(languageManager.getLanguageName('ja')).toBe('日本語');
    });
  });
});
