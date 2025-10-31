/**
 * Tests for translation completeness
 * Ensures all translation keys in en.json exist in all other language files
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Translation Completeness', () => {
  const i18nDir = path.join(__dirname, '../../src/renderer/i18n');
  const enJsonPath = path.join(i18nDir, 'en.json');
  
  // Get all language files
  const languageFiles = fs.readdirSync(i18nDir)
    .filter(file => file.endsWith('.json') && file !== 'en.json')
    .map(file => ({
      name: file,
      path: path.join(i18nDir, file)
    }));

  /**
   * Recursively get all keys from a nested object
   * Returns keys in dot notation (e.g., "game.upgrades.ballDamage.name")
   */
  function getAllKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          // Recursively get keys from nested objects
          keys.push(...getAllKeys(obj[key], fullKey));
        } else {
          // Leaf node - this is an actual translation key
          keys.push(fullKey);
        }
      }
    }
    
    return keys;
  }

  /**
   * Check if a nested key exists in an object
   */
  function hasNestedKey(obj: any, keyPath: string): boolean {
    const keys = keyPath.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return false;
      }
    }
    
    return true;
  }

  // Load English translations
  const enTranslations = JSON.parse(fs.readFileSync(enJsonPath, 'utf-8'));
  const enKeys = getAllKeys(enTranslations);

  it('should have at least one language file besides English', () => {
    expect(languageFiles.length).toBeGreaterThan(0);
  });

  it('should have valid JSON in en.json', () => {
    expect(enTranslations).toBeDefined();
    expect(typeof enTranslations).toBe('object');
  });

  it('should have translation keys in en.json', () => {
    expect(enKeys.length).toBeGreaterThan(0);
  });

  // Test each language file
  languageFiles.forEach(({ name, path: filePath }) => {
    describe(name, () => {
      let translations: any;
      let translationKeys: string[];

      beforeAll(() => {
        const content = fs.readFileSync(filePath, 'utf-8');
        translations = JSON.parse(content);
        translationKeys = getAllKeys(translations);
      });

      it('should have valid JSON', () => {
        expect(translations).toBeDefined();
        expect(typeof translations).toBe('object');
      });

      it('should have all keys from en.json', () => {
        const missingKeys: string[] = [];
        
        for (const key of enKeys) {
          if (!hasNestedKey(translations, key)) {
            missingKeys.push(key);
          }
        }

        if (missingKeys.length > 0) {
          console.error(`\n${name} is missing ${missingKeys.length} keys:`);
          missingKeys.forEach(key => console.error(`  - ${key}`));
        }

        expect(missingKeys).toEqual([]);
      });

      it('should not have extra keys not in en.json', () => {
        const extraKeys: string[] = [];
        
        for (const key of translationKeys) {
          if (!hasNestedKey(enTranslations, key)) {
            extraKeys.push(key);
          }
        }

        if (extraKeys.length > 0) {
          console.warn(`\n${name} has ${extraKeys.length} extra keys not in en.json:`);
          extraKeys.forEach(key => console.warn(`  - ${key}`));
        }

        expect(extraKeys).toEqual([]);
      });

      it('should have the same number of keys as en.json', () => {
        expect(translationKeys.length).toBe(enKeys.length);
      });
    });
  });

  it('should list all tested languages', () => {
    const languages = languageFiles.map(f => f.name.replace('.json', ''));
    console.log('\nTested languages:', languages.join(', '));
    expect(languages.length).toBeGreaterThan(0);
  });
});
