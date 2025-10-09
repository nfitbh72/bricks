/**
 * AudioManager - Handles all game audio including music and sound effects
 */

import {
  AUDIO_MUSIC_BASE_VOLUME,
  AUDIO_BRICK_HIT_BASE_VOLUME,
  AUDIO_BRICK_EXPLODE_BASE_VOLUME,
  AUDIO_DEFAULT_MUSIC_VOLUME,
  AUDIO_DEFAULT_SFX_VOLUME,
  AUDIO_PATH_BRICK_HIT,
  AUDIO_PATH_BRICK_EXPLODE,
  AUDIO_PATH_BACKGROUND_MUSIC,
} from '../config/constants';

export class AudioManager {
  private brickHitSound: HTMLAudioElement;
  private brickExplodeSound: HTMLAudioElement;
  private backgroundMusic: HTMLAudioElement;
  
  private musicVolume: number = AUDIO_DEFAULT_MUSIC_VOLUME;
  private sfxVolume: number = AUDIO_DEFAULT_SFX_VOLUME;

  constructor() {
    // Load sound effects
    this.brickHitSound = new Audio(AUDIO_PATH_BRICK_HIT);
    this.brickHitSound.volume = AUDIO_BRICK_HIT_BASE_VOLUME;
    
    this.brickExplodeSound = new Audio(AUDIO_PATH_BRICK_EXPLODE);
    this.brickExplodeSound.volume = AUDIO_BRICK_EXPLODE_BASE_VOLUME;
    
    // Load and start background music
    this.backgroundMusic = new Audio(AUDIO_PATH_BACKGROUND_MUSIC);
    this.backgroundMusic.volume = AUDIO_MUSIC_BASE_VOLUME;
    this.backgroundMusic.loop = true;
    this.backgroundMusic.play().catch(err => {
      console.warn('Background music autoplay blocked. Will start on first user interaction:', err);
    });
  }

  /**
   * Play brick hit sound
   */
  playBrickHit(): void {
    this.playSound(this.brickHitSound);
  }

  /**
   * Play brick explode sound
   */
  playBrickExplode(): void {
    this.playSound(this.brickExplodeSound);
  }

  /**
   * Set music volume (0.0 to 1.0)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = volume;
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = volume * AUDIO_MUSIC_BASE_VOLUME;
    }
  }

  /**
   * Set sound effects volume (0.0 to 1.0)
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = volume;
    this.brickHitSound.volume = volume * AUDIO_BRICK_HIT_BASE_VOLUME;
    this.brickExplodeSound.volume = volume * AUDIO_BRICK_EXPLODE_BASE_VOLUME;
  }

  /**
   * Get current music volume
   */
  getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Get current SFX volume
   */
  getSFXVolume(): number {
    return this.sfxVolume;
  }

  /**
   * Play a sound effect
   */
  private playSound(audio: HTMLAudioElement): void {
    // Reset and play sound (allows rapid playback)
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn('Failed to play sound:', err);
    });
  }

  /**
   * Stop all audio
   */
  stopAll(): void {
    this.backgroundMusic.pause();
    this.brickHitSound.pause();
    this.brickExplodeSound.pause();
  }

  /**
   * Resume background music
   */
  resumeMusic(): void {
    this.backgroundMusic.play().catch(err => {
      console.warn('Failed to resume music:', err);
    });
  }

  /**
   * Pause background music
   */
  pauseMusic(): void {
    this.backgroundMusic.pause();
  }
}
