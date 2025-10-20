/**
 * Tests for OptionsScreen class
 */

import { OptionsScreen, GameOptions } from '../../src/renderer/ui/OptionsScreen';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('OptionsScreen', () => {
  let canvas: any;
  let optionsScreen: OptionsScreen;
  let onCloseMock: jest.Mock;
  let mockCtx: any;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Create mock canvas
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      arc: jest.fn(),
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1,
      shadowBlur: 0,
      shadowColor: '',
      font: '',
      textAlign: 'center',
      textBaseline: 'middle',
      lineWidth: 1,
    };

    canvas = {
      width: 800,
      height: 600,
      getContext: jest.fn(() => mockCtx),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      style: { cursor: '' },
    };

    onCloseMock = jest.fn();
    optionsScreen = new OptionsScreen(canvas, onCloseMock);
  });

  afterEach(() => {
    if (optionsScreen) {
      optionsScreen.detach();
    }
    localStorage.clear();
  });

  describe('constructor', () => {
    it('should create options screen', () => {
      expect(optionsScreen).toBeDefined();
    });

    it('should load default options when no saved options exist', () => {
      const options = optionsScreen.getOptions();
      
      expect(options.musicVolume).toBe(0.5);
      expect(options.sfxVolume).toBe(0.7);
      expect(options.showParticles).toBe(true);
      expect(options.showDamageNumbers).toBe(true);
    });

    it('should load saved options from localStorage', () => {
      const savedOptions: GameOptions = {
        musicVolume: 0.3,
        sfxVolume: 0.8,
        showParticles: false,
        showDamageNumbers: false,
        selectedLanguage: 'en',
      };
      localStorage.setItem('gameOptions', JSON.stringify(savedOptions));

      const newOptionsScreen = new OptionsScreen(canvas, onCloseMock);
      const options = newOptionsScreen.getOptions();

      expect(options.musicVolume).toBe(0.3);
      expect(options.sfxVolume).toBe(0.8);
      expect(options.showParticles).toBe(false);
      expect(options.showDamageNumbers).toBe(false);
    });

    it('should use defaults if localStorage has invalid JSON', () => {
      localStorage.setItem('gameOptions', 'invalid json');

      const newOptionsScreen = new OptionsScreen(canvas, onCloseMock);
      const options = newOptionsScreen.getOptions();

      expect(options.musicVolume).toBe(0.5);
      expect(options.sfxVolume).toBe(0.7);
    });
  });

  describe('getOptions', () => {
    it('should return a copy of options', () => {
      const options1 = optionsScreen.getOptions();
      const options2 = optionsScreen.getOptions();

      expect(options1).not.toBe(options2); // Different objects
      expect(options1).toEqual(options2); // Same values
    });

    it('should return current options', () => {
      const options = optionsScreen.getOptions();

      expect(options).toHaveProperty('musicVolume');
      expect(options).toHaveProperty('sfxVolume');
      expect(options).toHaveProperty('showParticles');
      expect(options).toHaveProperty('showDamageNumbers');
    });
  });

  describe('setVolumeChangeCallback', () => {
    it('should set volume change callback', () => {
      const callback = jest.fn();
      
      optionsScreen.setVolumeChangeCallback(callback);
      
      // Callback should be set (we can't directly test it without triggering events)
      expect(() => optionsScreen.setVolumeChangeCallback(callback)).not.toThrow();
    });
  });

  describe('attach and detach', () => {
    it('should attach event listeners', () => {
      const addEventListenerSpy = jest.spyOn(canvas, 'addEventListener');
      
      optionsScreen.attach();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should detach event listeners', () => {
      const removeEventListenerSpy = jest.spyOn(canvas, 'removeEventListener');
      
      optionsScreen.attach();
      optionsScreen.detach();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('localStorage persistence', () => {
    it('should persist options across instances', () => {
      // Create first instance with default options
      const options1 = optionsScreen.getOptions();
      
      // Create second instance
      const optionsScreen2 = new OptionsScreen(canvas, onCloseMock);
      const options2 = optionsScreen2.getOptions();
      
      expect(options2).toEqual(options1);
    });
  });

  describe('render', () => {
    it('should render without throwing', () => {
      expect(() => optionsScreen.render()).not.toThrow();
    });

    it('should call canvas context methods', () => {
      optionsScreen.render();
      
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
    });
  });

  describe('default values', () => {
    it('should have music volume between 0 and 1', () => {
      const options = optionsScreen.getOptions();
      expect(options.musicVolume).toBeGreaterThanOrEqual(0);
      expect(options.musicVolume).toBeLessThanOrEqual(1);
    });

    it('should have sfx volume between 0 and 1', () => {
      const options = optionsScreen.getOptions();
      expect(options.sfxVolume).toBeGreaterThanOrEqual(0);
      expect(options.sfxVolume).toBeLessThanOrEqual(1);
    });

    it('should have boolean flags', () => {
      const options = optionsScreen.getOptions();
      expect(typeof options.showParticles).toBe('boolean');
      expect(typeof options.showDamageNumbers).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('should handle empty localStorage', () => {
      localStorage.clear();
      
      const newOptionsScreen = new OptionsScreen(canvas, onCloseMock);
      const options = newOptionsScreen.getOptions();
      
      expect(options).toBeDefined();
      expect(options.musicVolume).toBe(0.5);
    });

    it('should handle corrupted localStorage', () => {
      localStorage.setItem('gameOptions', '{invalid}');
      
      const newOptionsScreen = new OptionsScreen(canvas, onCloseMock);
      const options = newOptionsScreen.getOptions();
      
      expect(options).toBeDefined();
      expect(options.musicVolume).toBe(0.5);
    });

    it('should handle partial options in localStorage', () => {
      localStorage.setItem('gameOptions', JSON.stringify({ musicVolume: 0.2 }));
      
      const newOptionsScreen = new OptionsScreen(canvas, onCloseMock);
      const options = newOptionsScreen.getOptions();
      
      // Should have loaded partial data
      expect(options.musicVolume).toBe(0.2);
    });
  });
});
