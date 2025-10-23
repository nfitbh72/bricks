/**
 * RenderManager - Handles all rendering operations for the game
 */

import { Ball } from '../entities/Ball';
import { Bat } from '../entities/Bat';
import { Level } from '../entities/Level';
import { StatusBar } from '../ui/StatusBar';
import { EffectsManager } from './EffectsManager';
import { WeaponManager } from './WeaponManager';
import { OffensiveEntityManager } from './OffensiveEntityManager';
import { ScreenManager } from './ScreenManager';
import { GameState } from '../core/types';
import { LanguageManager } from '../../i18n/LanguageManager';

export class RenderManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /**
   * Main render method - orchestrates all rendering
   */
  render(
    gameState: GameState,
    previousState: GameState | null,
    screenManager: ScreenManager,
    renderGameplayFn: () => void
  ): void {
    // Update cursor visibility based on game state
    if (gameState === GameState.PLAYING) {
      this.canvas.style.cursor = 'none'; // Hide cursor during gameplay
    } else {
      this.canvas.style.cursor = 'default'; // Show cursor on menus
    }

    // Render using screen manager
    screenManager.render(
      gameState,
      previousState,
      renderGameplayFn
    );
  }

  /**
   * Render gameplay (used for both PLAYING and PAUSED states)
   */
  renderGameplay(
    level: Level | null,
    bat: Bat,
    ball: Ball,
    statusBar: StatusBar,
    effectsManager: EffectsManager,
    weaponManager: WeaponManager,
    offensiveEntityManager: OffensiveEntityManager,
    showParticles: boolean,
    showDamageNumbers: boolean
  ): void {
    // Clear canvas with black
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background image if loaded
    effectsManager.renderBackground(this.ctx, this.canvas.width, this.canvas.height);

    // Apply screen shake and slow-motion zoom
    const shake = effectsManager.getScreenShakeOffset();
    this.ctx.save();
    
    // Apply slow-motion zoom transform (handled by EffectsManager)
    effectsManager.applySlowMotionTransform(this.ctx);
    
    this.ctx.translate(shake.x, shake.y);

    // Render level (bricks)
    if (level) {
      level.render(this.ctx);
    }

    // Render bat
    bat.render(this.ctx);

    // Render ball
    ball.render(this.ctx);

    // Render weapons (lasers)
    weaponManager.render(this.ctx);

    // Render offensive brick entities
    offensiveEntityManager.render(this.ctx);

    // Render visual effects (if enabled)
    effectsManager.render(this.ctx, showParticles, showDamageNumbers);

    this.ctx.restore();

    // Render launch instruction if ball is sticky
    if (ball.getIsSticky()) {
      this.renderLaunchInstruction();
    }

    // Render status bar (not affected by screen shake)
    statusBar.render(this.ctx);

    // Render CRT scanline overlay
    this.renderCRTOverlay();

    // Render slow-motion overlay (handled by EffectsManager)
    effectsManager.renderSlowMotionOverlay(this.ctx, this.canvas.width, this.canvas.height);
  }

  /**
   * Render launch instruction text when ball is sticky
   */
  private renderLaunchInstruction(): void {
    const langManager = LanguageManager.getInstance();
    const instructionText = langManager.t('game.status.launchBall');
    
    this.ctx.save();
    
    // Position text in upper third of screen
    const textY = this.canvas.height * 0.3;
    
    // Draw text with glow effect
    this.ctx.font = '32px "D Day Stencil", Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = '#00ff00'; // Green
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#00ff00';
    this.ctx.fillText(instructionText, this.canvas.width / 2, textY);
    
    this.ctx.restore();
  }

  /**
   * Render CRT scanline overlay effect
   */
  private renderCRTOverlay(): void {
    this.ctx.save();
    
    // Draw scanlines
    this.ctx.globalAlpha = 0.1;
    this.ctx.fillStyle = '#000000';
    
    for (let y = 0; y < this.canvas.height; y += 2) {
      this.ctx.fillRect(0, y, this.canvas.width, 1);
    }
    
    // Add slight vignette effect
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.max(this.canvas.width, this.canvas.height) / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.restore();
  }
}
