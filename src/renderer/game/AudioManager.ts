/**
 * AudioManager - Handles all game audio including music and sound effects
 */

export class AudioManager {
  private brickHitSound: HTMLAudioElement;
  private brickExplodeSound: HTMLAudioElement;
  private backgroundMusic: HTMLAudioElement;
  
  private musicVolume: number = 1.0;
  private sfxVolume: number = 1.0;

  constructor() {
    // Load sound effects
    this.brickHitSound = new Audio('./assets/sounds/ding.mp3');
    this.brickHitSound.volume = 0.3;
    
    this.brickExplodeSound = new Audio('./assets/sounds/explosion-107629.mp3');
    this.brickExplodeSound.volume = 0.4;
    
    // Load and start background music
    this.backgroundMusic = new Audio('./assets/sounds/lulu-swing-giulio-fazio-main-version-02-18-3209.mp3');
    this.backgroundMusic.volume = 0.2;
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
      this.backgroundMusic.volume = volume * 0.2; // Base volume 0.2
    }
  }

  /**
   * Set sound effects volume (0.0 to 1.0)
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = volume;
    this.brickHitSound.volume = volume * 0.3; // Base volume 0.3
    this.brickExplodeSound.volume = volume * 0.4; // Base volume 0.4
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
