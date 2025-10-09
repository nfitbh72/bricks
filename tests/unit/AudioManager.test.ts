/**
 * AudioManager unit tests
 */

import { AudioManager } from '../../src/renderer/game/AudioManager';

// Mock HTMLAudioElement
class MockAudio {
  src: string = '';
  volume: number = 1.0;
  loop: boolean = false;
  currentTime: number = 0;
  
  play = jest.fn().mockResolvedValue(undefined);
  pause = jest.fn();
}

// Mock Audio constructor
global.Audio = MockAudio as any;

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    jest.clearAllMocks();
    audioManager = new AudioManager();
  });

  describe('constructor', () => {
    it('should initialize with default volumes', () => {
      expect(audioManager.getMusicVolume()).toBe(1.0);
      expect(audioManager.getSFXVolume()).toBe(1.0);
    });

    it('should create audio manager without errors', () => {
      expect(() => new AudioManager()).not.toThrow();
    });
  });

  describe('setMusicVolume', () => {
    it('should set music volume', () => {
      audioManager.setMusicVolume(0.5);
      expect(audioManager.getMusicVolume()).toBe(0.5);
    });

    it('should accept volume of 0', () => {
      audioManager.setMusicVolume(0);
      expect(audioManager.getMusicVolume()).toBe(0);
    });

    it('should accept volume of 1', () => {
      audioManager.setMusicVolume(1);
      expect(audioManager.getMusicVolume()).toBe(1);
    });
  });

  describe('setSFXVolume', () => {
    it('should set SFX volume', () => {
      audioManager.setSFXVolume(0.7);
      expect(audioManager.getSFXVolume()).toBe(0.7);
    });

    it('should accept volume of 0', () => {
      audioManager.setSFXVolume(0);
      expect(audioManager.getSFXVolume()).toBe(0);
    });

    it('should accept volume of 1', () => {
      audioManager.setSFXVolume(1);
      expect(audioManager.getSFXVolume()).toBe(1);
    });
  });

  describe('playBrickHit', () => {
    it('should not throw when playing brick hit sound', () => {
      expect(() => audioManager.playBrickHit()).not.toThrow();
    });

    it('should handle multiple calls', () => {
      expect(() => {
        audioManager.playBrickHit();
        audioManager.playBrickHit();
        audioManager.playBrickHit();
      }).not.toThrow();
    });
  });

  describe('playBrickExplode', () => {
    it('should not throw when playing brick explode sound', () => {
      expect(() => audioManager.playBrickExplode()).not.toThrow();
    });

    it('should handle multiple calls', () => {
      expect(() => {
        audioManager.playBrickExplode();
        audioManager.playBrickExplode();
      }).not.toThrow();
    });
  });

  describe('pauseMusic', () => {
    it('should not throw when pausing music', () => {
      expect(() => audioManager.pauseMusic()).not.toThrow();
    });
  });

  describe('resumeMusic', () => {
    it('should not throw when resuming music', () => {
      expect(() => audioManager.resumeMusic()).not.toThrow();
    });
  });

  describe('stopAll', () => {
    it('should not throw when stopping all audio', () => {
      expect(() => audioManager.stopAll()).not.toThrow();
    });

    it('should handle being called multiple times', () => {
      expect(() => {
        audioManager.stopAll();
        audioManager.stopAll();
      }).not.toThrow();
    });
  });

  describe('volume persistence', () => {
    it('should maintain volume after multiple changes', () => {
      audioManager.setMusicVolume(0.3);
      audioManager.setSFXVolume(0.8);
      
      expect(audioManager.getMusicVolume()).toBe(0.3);
      expect(audioManager.getSFXVolume()).toBe(0.8);
      
      audioManager.setMusicVolume(0.6);
      expect(audioManager.getMusicVolume()).toBe(0.6);
      expect(audioManager.getSFXVolume()).toBe(0.8);
    });
  });
});
