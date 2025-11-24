/**
 * AchievementsScreen - Neon dystopian achievements overview
 */

import { Screen } from './Screen';
import { Button } from './Button';
import { ACHIEVEMENTS } from '../config/achievements';
import { steamAPI } from '../steam/steamAPI';
import {
  COLOR_BLACK,
  COLOR_MAGENTA,
  COLOR_CYAN,
  FONT_TITLE_LARGE,
  FONT_SECONDARY_MINI,
  FONT_MONO_MINI,
  GLOW_LARGE,
  GLOW_MEDIUM,
  GLOW_SMALL,
} from '../config/constants';

export class AchievementsScreen extends Screen {
  private onBack: () => void;
  private unlockedIds: Set<string> = new Set();

  // Layout
  private readonly panelWidth = 800;
  private readonly panelHeight = 600;

  constructor(canvas: HTMLCanvasElement, onBack: () => void) {
    super(canvas);
    this.onBack = onBack;
    this.createButtons();
  }

  /**
   * Load latest unlocked achievements from Steam/offline store
   */
  async refreshData(): Promise<void> {
    await steamAPI.initialize();
    const unlocked = await steamAPI.getUnlockedAchievements();
    this.unlockedIds = new Set(unlocked);
  }

  private createButtons(): void {
    const centerX = this.canvas.width / 2;
    const bottomY = this.canvas.height - 80;
    const buttonWidth = 220;
    const buttonHeight = 60;

    this.buttons.push(
      new Button({
        x: centerX - buttonWidth / 2,
        y: bottomY,
        width: buttonWidth,
        height: buttonHeight,
        text: 'BACK TO MENU',
        onClick: () => this.onBack(),
      })
    );
  }

  handleKeyPress(key: string): void {
    if (key === 'Escape' || key === 'Enter' || key === ' ') {
      this.onBack();
    }
  }

  refreshTranslations(): void {
    // Static English text for now
  }

  private getPanelBounds() {
    const x = (this.canvas.width - this.panelWidth) / 2;
    const y = (this.canvas.height - this.panelHeight) / 2;
    return { x, y, width: this.panelWidth, height: this.panelHeight };
  }

  private drawBackground(): void {
    // Full-screen dark background
    this.ctx.fillStyle = COLOR_BLACK;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Subtle neon scanlines/grid for dystopian feel
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
    this.ctx.lineWidth = 1;

    const spacing = 30;
    for (let y = 0; y < this.canvas.height; y += spacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y + 0.5);
      this.ctx.lineTo(this.canvas.width, y + 0.5);
      this.ctx.stroke();
    }

    this.ctx.strokeStyle = 'rgba(204, 0, 255, 0.08)';
    for (let x = 0; x < this.canvas.width; x += spacing * 2) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + 0.5, 0);
      this.ctx.lineTo(x + 0.5, this.canvas.height);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private drawPanel(): void {
    const panel = this.getPanelBounds();

    this.ctx.save();

    // Outer glowing frame
    this.ctx.strokeStyle = COLOR_MAGENTA;
    this.ctx.lineWidth = 3;
    this.ctx.shadowBlur = GLOW_LARGE;
    this.ctx.shadowColor = COLOR_MAGENTA;
    this.ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);

    // Inner border
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = COLOR_CYAN;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(panel.x + 6, panel.y + 6, panel.width - 12, panel.height - 12);

    // Title
    this.ctx.fillStyle = COLOR_MAGENTA;
    this.ctx.font = FONT_TITLE_LARGE;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.shadowBlur = GLOW_MEDIUM;
    this.ctx.shadowColor = COLOR_MAGENTA;
    this.ctx.fillText('ACHIEVEMENTS', panel.x + panel.width / 2, panel.y + 20);

    this.ctx.restore();
  }

  private drawAchievementsList(): void {
    const panel = this.getPanelBounds();
    const listTop = panel.y + 90;
    const rowHeight = 60;
    const maxVisible = Math.min(ACHIEVEMENTS.length, 8);

    for (let i = 0; i < maxVisible; i++) {
      const achievement = ACHIEVEMENTS[i];
      const y = listTop + i * rowHeight;
      const isUnlocked = this.unlockedIds.has(achievement.id);

      this.drawAchievementRow(panel.x + 20, y, panel.width - 40, rowHeight - 10, achievement.name, achievement.description, isUnlocked);
    }
  }

  private drawAchievementRow(
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    description: string,
    unlocked: boolean
  ): void {
    this.ctx.save();

    // Card background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.strokeStyle = unlocked ? COLOR_CYAN : COLOR_MAGENTA;
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = unlocked ? GLOW_MEDIUM : GLOW_SMALL;
    this.ctx.shadowColor = unlocked ? COLOR_CYAN : COLOR_MAGENTA;
    this.ctx.beginPath();
    this.roundRectPath(x, y, width, height, 10);
    this.ctx.fill();
    this.ctx.stroke();

    // Progress bar (locked = 0%, unlocked = 100%)
    const progress = unlocked ? 1 : 0;
    const barWidth = width * 0.35;
    const barHeight = 10;
    const barX = x + width - barWidth - 50;
    const barY = y + height / 2 + 5;

    // Bar background
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    // Bar fill
    if (progress > 0) {
      this.ctx.fillStyle = '#00ff66'; // Neon green for completion
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#00ff66';
      this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    }

    // Title
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = COLOR_CYAN;
    this.ctx.font = FONT_SECONDARY_MINI;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(title.toUpperCase(), x + 16, y + 10);

    // Description
    this.ctx.fillStyle = 'rgba(200, 200, 200, 0.85)';
    this.ctx.font = FONT_MONO_MINI;
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(description, x + 16, y + height - 8);

    // Status text
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'top';
    if (unlocked) {
      this.ctx.fillStyle = '#00ff66';
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = '#00ff66';
      this.ctx.fillText('COMPLETED', x + width - 50, y + 10);
    } else {
      this.ctx.fillStyle = 'rgba(150, 150, 150, 0.9)';
      this.ctx.shadowBlur = 0;
      this.ctx.fillText('LOCKED', x + width - 50, y + 10);
    }

    // Green tick icon for completed
    if (unlocked) {
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.font = FONT_TITLE_LARGE;
      this.ctx.fillStyle = '#00ff66';
      this.ctx.shadowBlur = 18;
      this.ctx.shadowColor = '#00ff66';
      this.ctx.fillText('✓', x + width - 20, y + height / 2);
    }

    this.ctx.restore();
  }

  private roundRectPath(x: number, y: number, width: number, height: number, radius: number): void {
    const r = Math.min(radius, width / 2, height / 2);
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + width - r, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    this.ctx.lineTo(x + width, y + height - r);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    this.ctx.lineTo(x + r, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
  }

  render(): void {
    this.drawBackground();
    this.drawPanel();
    this.drawAchievementsList();

    // Render buttons (back button)
    for (const button of this.buttons) {
      button.render(this.ctx);
    }
  }
}
