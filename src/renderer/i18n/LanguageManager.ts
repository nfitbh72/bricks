/**
 * LanguageManager - Handles multi-language support
 */

type TranslationData = {
  [key: string]: any;
};

type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh-CN' | 'th' | 'vi' | 'id' | 'tl';

export class LanguageManager {
  private static instance: LanguageManager;
  private currentLanguage: SupportedLanguage = 'en';
  private translations: TranslationData = {};
  private readonly supportedLanguages: SupportedLanguage[] = ['en', 'es', 'fr', 'de', 'ja', 'zh-CN', 'th', 'vi', 'id', 'tl'];

  private constructor() {
    this.detectAndSetLanguage();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): LanguageManager {
    if (!LanguageManager.instance) {
      LanguageManager.instance = new LanguageManager();
    }
    return LanguageManager.instance;
  }

  /**
   * Detect browser language and set if supported
   */
  private detectAndSetLanguage(): void {
    // First check if there's a saved language preference
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && this.supportedLanguages.includes(savedLang as SupportedLanguage)) {
      this.currentLanguage = savedLang as SupportedLanguage;
      return;
    }

    // Otherwise, use browser language
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    if (this.supportedLanguages.includes(browserLang)) {
      this.currentLanguage = browserLang;
    }
  }

  /**
   * Load translations for current language
   */
  async loadTranslations(): Promise<void> {
    try {
      const response = await fetch(`./i18n/${this.currentLanguage}.json`);
      this.translations = await response.json();
    } catch (error) {
      console.error(`Failed to load translations for ${this.currentLanguage}:`, error);
      // Try to load English as fallback
      if (this.currentLanguage !== 'en') {
        try {
          const response = await fetch('./i18n/en.json');
          this.translations = await response.json();
        } catch (fallbackError) {
          console.error('Failed to load English fallback:', fallbackError);
        }
      }
    }
  }

  /**
   * Get translation by key (nested keys supported with dot notation)
   */
  t(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return key if translation not found
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  }

  /**
   * Set language and reload translations
   */
  async setLanguage(lang: SupportedLanguage): Promise<void> {
    if (this.supportedLanguages.includes(lang)) {
      this.currentLanguage = lang;
      // Save to localStorage
      localStorage.setItem('selectedLanguage', lang);
      await this.loadTranslations();
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Get list of supported languages
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return [...this.supportedLanguages];
  }

  /**
   * Get language display name
   */
  getLanguageName(lang: SupportedLanguage): string {
    const names: Record<SupportedLanguage, string> = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      ja: '日本語',
      'zh-CN': '简体中文',
      th: 'ไทย',
      vi: 'Tiếng Việt',
      id: 'Bahasa Indonesia',
      tl: 'Tagalog',
    };
    return names[lang] || lang;
  }
}

/**
 * Global translation function
 */
export function t(key: string): string {
  return LanguageManager.getInstance().t(key);
}
