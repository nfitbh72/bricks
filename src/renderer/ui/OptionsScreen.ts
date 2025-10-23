/**
 * OptionsScreen - Game options overlay
 */

import { t, LanguageManager } from '../i18n/LanguageManager';

export interface GameOptions {
  musicVolume: number;      // 0 to 1
  sfxVolume: number;         // 0 to 1
  showParticles: boolean;
  showDamageNumbers: boolean;
  selectedLanguage: string;  // Language code
}

export class OptionsScreen {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: GameOptions;
  private onClose: () => void;
  private onVolumeChange: ((musicVolume: number, sfxVolume: number) => void) | null = null;
  private hoveredElement: string | null = null;
  private isDraggingMusicSlider: boolean = false;
  private isDraggingSfxSlider: boolean = false;
  private isLanguageDropdownOpen: boolean = false;
  private onLanguageChange: (() => void) | null = null;

  // UI Layout
  private readonly panelWidth = 500;
  private readonly panelHeight = 550;
  private readonly sliderWidth = 300;
  private readonly sliderHeight = 20;
  private readonly cornerRadius = 15;

  constructor(canvas: HTMLCanvasElement, onClose: () => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onClose = onClose;

    // Load options from localStorage or use defaults
    this.options = this.loadOptions();

    // Bind event handlers
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  /**
   * Set callback for real-time volume changes
   */
  setVolumeChangeCallback(callback: (musicVolume: number, sfxVolume: number) => void): void {
    this.onVolumeChange = callback;
  }

  /**
   * Set callback for language changes
   */
  setLanguageChangeCallback(callback: () => void): void {
    this.onLanguageChange = callback;
  }

  /**
   * Load options from localStorage
   */
  private loadOptions(): GameOptions {
    // Default options
    const defaults: GameOptions = {
      musicVolume: 0.5,
      sfxVolume: 0.7,
      showParticles: true,
      showDamageNumbers: true,
      selectedLanguage: LanguageManager.getInstance().getCurrentLanguage(),
    };

    const saved = localStorage.getItem('gameOptions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all fields exist
        return {
          ...defaults,
          ...parsed,
          // Ensure selectedLanguage is valid
          selectedLanguage: parsed.selectedLanguage || defaults.selectedLanguage,
        };
      } catch (e) {
        console.error('Failed to load options:', e);
      }
    }

    return defaults;
  }

  /**
   * Save options to localStorage
   */
  private saveOptions(): void {
    localStorage.setItem('gameOptions', JSON.stringify(this.options));
  }

  /**
   * Get current options
   */
  getOptions(): GameOptions {
    return { ...this.options };
  }

  /**
   * Attach event listeners
   */
  attach(): void {
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('click', this.handleClick);
  }

  /**
   * Detach event listeners
   */
  detach(): void {
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('click', this.handleClick);
  }

  /**
   * Get panel bounds
   */
  private getPanelBounds() {
    const x = (this.canvas.width - this.panelWidth) / 2;
    const y = (this.canvas.height - this.panelHeight) / 2;
    return { x, y, width: this.panelWidth, height: this.panelHeight };
  }

  /**
   * Get slider bounds
   */
  private getSliderBounds(sliderY: number) {
    const panel = this.getPanelBounds();
    const x = panel.x + (this.panelWidth - this.sliderWidth) / 2;
    return { x, y: sliderY, width: this.sliderWidth, height: this.sliderHeight };
  }

  /**
   * Handle mouse move
   */
  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Update slider values while dragging
    if (this.isDraggingMusicSlider) {
      const slider = this.getSliderBounds(this.getMusicSliderY());
      const value = Math.max(0, Math.min(1, (mouseX - slider.x) / slider.width));
      this.options.musicVolume = value;
      this.saveOptions();
      // Apply volume in real-time
      if (this.onVolumeChange) {
        this.onVolumeChange(this.options.musicVolume, this.options.sfxVolume);
      }
    } else if (this.isDraggingSfxSlider) {
      const slider = this.getSliderBounds(this.getSfxSliderY());
      const value = Math.max(0, Math.min(1, (mouseX - slider.x) / slider.width));
      this.options.sfxVolume = value;
      this.saveOptions();
      // Apply volume in real-time
      if (this.onVolumeChange) {
        this.onVolumeChange(this.options.musicVolume, this.options.sfxVolume);
      }
    }

    // Update hover state
    this.hoveredElement = this.getElementAtPosition(mouseX, mouseY);
    this.canvas.style.cursor = this.hoveredElement ? 'pointer' : 'default';
  }

  /**
   * Handle mouse down
   */
  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const element = this.getElementAtPosition(mouseX, mouseY);
    
    if (element === 'musicSlider') {
      this.isDraggingMusicSlider = true;
      const slider = this.getSliderBounds(this.getMusicSliderY());
      const value = Math.max(0, Math.min(1, (mouseX - slider.x) / slider.width));
      this.options.musicVolume = value;
      this.saveOptions();
      // Apply volume in real-time
      if (this.onVolumeChange) {
        this.onVolumeChange(this.options.musicVolume, this.options.sfxVolume);
      }
    } else if (element === 'sfxSlider') {
      this.isDraggingSfxSlider = true;
      const slider = this.getSliderBounds(this.getSfxSliderY());
      const value = Math.max(0, Math.min(1, (mouseX - slider.x) / slider.width));
      this.options.sfxVolume = value;
      this.saveOptions();
      // Apply volume in real-time
      if (this.onVolumeChange) {
        this.onVolumeChange(this.options.musicVolume, this.options.sfxVolume);
      }
    }
  }

  /**
   * Handle mouse up
   */
  private handleMouseUp(): void {
    this.isDraggingMusicSlider = false;
    this.isDraggingSfxSlider = false;
  }

  /**
   * Handle click
   */
  private handleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const element = this.getElementAtPosition(mouseX, mouseY);

    if (element === 'particlesCheckbox') {
      this.options.showParticles = !this.options.showParticles;
      this.saveOptions();
    } else if (element === 'damageNumbersCheckbox') {
      this.options.showDamageNumbers = !this.options.showDamageNumbers;
      this.saveOptions();
    } else if (element === 'languageSelector') {
      this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    } else if (element && element.startsWith('languageItem_')) {
      const index = parseInt(element.split('_')[1]);
      const languages = LanguageManager.getInstance().getSupportedLanguages();
      if (index >= 0 && index < languages.length) {
        const selectedLang = languages[index];
        this.options.selectedLanguage = selectedLang;
        this.saveOptions();
        // Update the language manager
        LanguageManager.getInstance().setLanguage(selectedLang as any).then(() => {
          // Notify that language has changed so UI can refresh
          if (this.onLanguageChange) {
            this.onLanguageChange();
          }
        });
        this.isLanguageDropdownOpen = false;
      }
    } else if (element === 'closeButton') {
      this.onClose();
    } else {
      // Close dropdown if clicking outside
      this.isLanguageDropdownOpen = false;
    }
  }

  /**
   * Get element at position
   */
  private getElementAtPosition(x: number, y: number): string | null {
    const panel = this.getPanelBounds();

    // Close button
    const closeButton = this.getCloseButtonBounds();
    if (this.isPointInRect(x, y, closeButton)) {
      return 'closeButton';
    }

    // Music slider
    const musicSlider = this.getSliderBounds(this.getMusicSliderY());
    if (this.isPointInRect(x, y, musicSlider)) {
      return 'musicSlider';
    }

    // SFX slider
    const sfxSlider = this.getSliderBounds(this.getSfxSliderY());
    if (this.isPointInRect(x, y, sfxSlider)) {
      return 'sfxSlider';
    }

    // Particles checkbox
    const particlesCheckbox = this.getCheckboxBounds(this.getParticlesCheckboxY());
    if (this.isPointInRect(x, y, particlesCheckbox)) {
      return 'particlesCheckbox';
    }

    // Damage numbers checkbox
    const damageCheckbox = this.getCheckboxBounds(this.getDamageNumbersCheckboxY());
    if (this.isPointInRect(x, y, damageCheckbox)) {
      return 'damageNumbersCheckbox';
    }

    // Language selector
    const languageSelector = this.getLanguageSelectorBounds();
    if (this.isPointInRect(x, y, languageSelector)) {
      return 'languageSelector';
    }

    // Language dropdown items (if open)
    if (this.isLanguageDropdownOpen) {
      const languages = LanguageManager.getInstance().getSupportedLanguages();
      for (let i = 0; i < languages.length; i++) {
        const itemBounds = this.getLanguageDropdownItemBounds(i);
        if (this.isPointInRect(x, y, itemBounds)) {
          return `languageItem_${i}`;
        }
      }
    }

    return null;
  }

  /**
   * Check if point is in rectangle
   */
  private isPointInRect(x: number, y: number, rect: { x: number; y: number; width: number; height: number }): boolean {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  }

  /**
   * Get Y positions for UI elements
   */
  private getMusicSliderY(): number {
    const panel = this.getPanelBounds();
    return panel.y + 100;
  }

  private getSfxSliderY(): number {
    return this.getMusicSliderY() + 80;
  }

  private getParticlesCheckboxY(): number {
    return this.getSfxSliderY() + 80;
  }

  private getDamageNumbersCheckboxY(): number {
    return this.getParticlesCheckboxY() + 50;
  }

  private getLanguageSelectorY(): number {
    return this.getDamageNumbersCheckboxY() + 60;
  }

  /**
   * Get checkbox bounds
   */
  private getCheckboxBounds(y: number) {
    const panel = this.getPanelBounds();
    const size = 24;
    const x = panel.x + 100;
    return { x, y, width: size, height: size };
  }

  /**
   * Get language selector bounds
   */
  private getLanguageSelectorBounds() {
    const panel = this.getPanelBounds();
    const width = 200;
    const height = 35;
    const x = panel.x + (this.panelWidth - width) / 2;
    return { x, y: this.getLanguageSelectorY(), width, height };
  }

  /**
   * Get language dropdown item bounds
   */
  private getLanguageDropdownItemBounds(index: number) {
    const selector = this.getLanguageSelectorBounds();
    const height = 30;
    return {
      x: selector.x,
      y: selector.y + selector.height + index * height,
      width: selector.width,
      height,
    };
  }

  /**
   * Get close button bounds
   */
  private getCloseButtonBounds() {
    const panel = this.getPanelBounds();
    return {
      x: panel.x + (this.panelWidth - 120) / 2,
      y: panel.y + this.panelHeight - 60,
      width: 120,
      height: 40,
    };
  }

  /**
   * Draw rounded rectangle
   */
  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  /**
   * Render the options screen
   */
  render(): void {
    const panel = this.getPanelBounds();

    // Draw semi-transparent overlay with scanlines
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw panel background with rounded corners
    this.ctx.save();
    this.drawRoundedRect(panel.x, panel.y, panel.width, panel.height, this.cornerRadius);
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fill();

    // Draw glowing border
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#ff00ff';
    this.ctx.strokeStyle = '#ff00ff';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    this.ctx.restore();

    // Draw title with dystopian font
    this.ctx.save();
    this.ctx.shadowBlur = 30;
    this.ctx.shadowColor = '#ff00ff';
    this.ctx.fillStyle = '#ff00ff';
    this.ctx.font = '48px "PopulationZeroBB", "D Day Stencil", Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(t('ui.options.title'), panel.x + this.panelWidth / 2, panel.y + 20);
    this.ctx.restore();

    // Draw music volume slider
    this.drawSlider(t('ui.options.music'), this.getMusicSliderY(), this.options.musicVolume, this.hoveredElement === 'musicSlider');

    // Draw SFX volume slider
    this.drawSlider(t('ui.options.sfx'), this.getSfxSliderY(), this.options.sfxVolume, this.hoveredElement === 'sfxSlider');

    // Draw particles checkbox
    this.drawCheckbox(t('ui.options.particles'), this.getParticlesCheckboxY(), this.options.showParticles, this.hoveredElement === 'particlesCheckbox');

    // Draw damage numbers checkbox
    this.drawCheckbox(t('ui.options.damageNumbers'), this.getDamageNumbersCheckboxY(), this.options.showDamageNumbers, this.hoveredElement === 'damageNumbersCheckbox');

    // Draw close button
    this.drawButton(t('ui.buttons.back'), this.getCloseButtonBounds(), this.hoveredElement === 'closeButton');

    // Draw language selector (after button so dropdown appears on top)
    this.drawLanguageSelector();
  }

  /**
   * Draw a slider
   */
  private drawSlider(label: string, y: number, value: number, isHovered: boolean): void {
    const slider = this.getSliderBounds(y);

    // Draw label with dystopian font
    this.ctx.save();
    this.ctx.shadowBlur = isHovered ? 15 : 10;
    this.ctx.shadowColor = '#ff00ff';
    this.ctx.fillStyle = '#ff00ff';
    this.ctx.font = '20px "PopulationZeroBB", "D Day Stencil", Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(label, slider.x + slider.width / 2, slider.y - 10);
    this.ctx.restore();

    // Draw slider track with rounded corners
    this.ctx.save();
    const trackRadius = this.sliderHeight / 2;
    this.drawRoundedRect(slider.x, slider.y, slider.width, slider.height, trackRadius);
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fill();
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();

    // Draw slider fill with glow
    if (value > 0) {
      this.ctx.save();
      this.drawRoundedRect(slider.x, slider.y, slider.width * value, slider.height, trackRadius);
      this.ctx.fillStyle = isHovered ? '#ff00ff' : '#00ffff';
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = isHovered ? '#ff00ff' : '#00ffff';
      this.ctx.fill();
      this.ctx.restore();
    }

    // Draw slider handle with glow
    const handleX = slider.x + slider.width * value;
    const handleY = slider.y + slider.height / 2;
    const handleRadius = 14;

    this.ctx.save();
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.fillStyle = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.beginPath();
    this.ctx.arc(handleX, handleY, handleRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Inner circle for depth
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.beginPath();
    this.ctx.arc(handleX, handleY, handleRadius - 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // Draw value percentage
    this.ctx.save();
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = '16px "PopulationZeroBB", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = '#00ffff';
    this.ctx.fillText(`${Math.round(value * 100)}%`, slider.x + slider.width / 2, slider.y + slider.height + 5);
    this.ctx.restore();
  }

  /**
   * Draw a checkbox
   */
  private drawCheckbox(label: string, y: number, checked: boolean, isHovered: boolean): void {
    const checkbox = this.getCheckboxBounds(y);

    // Draw checkbox background with rounded corners
    this.ctx.save();
    const checkboxRadius = 4;
    this.drawRoundedRect(checkbox.x, checkbox.y, checkbox.width, checkbox.height, checkboxRadius);
    this.ctx.fillStyle = isHovered ? '#1a1a1a' : '#0a0a0a';
    this.ctx.fill();

    // Draw checkbox border with glow
    this.ctx.strokeStyle = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = isHovered ? 15 : 10;
    this.ctx.shadowColor = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.stroke();
    this.ctx.restore();

    // Draw checkmark if checked
    if (checked) {
      this.ctx.save();
      this.ctx.strokeStyle = '#ff00ff';
      this.ctx.lineWidth = 3;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = '#ff00ff';
      this.ctx.beginPath();
      this.ctx.moveTo(checkbox.x + 5, checkbox.y + 12);
      this.ctx.lineTo(checkbox.x + 10, checkbox.y + 17);
      this.ctx.lineTo(checkbox.x + 19, checkbox.y + 7);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Draw label with dystopian font
    this.ctx.save();
    this.ctx.fillStyle = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.font = '18px "PopulationZeroBB", "D Day Stencil", Arial';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.fillText(label, checkbox.x + checkbox.width + 15, checkbox.y + checkbox.height / 2);
    this.ctx.restore();
  }

  /**
   * Draw a button
   */
  private drawButton(text: string, bounds: { x: number; y: number; width: number; height: number }, isHovered: boolean): void {
    // Draw button background with rounded corners
    this.ctx.save();
    const buttonRadius = 8;
    this.drawRoundedRect(bounds.x, bounds.y, bounds.width, bounds.height, buttonRadius);
    this.ctx.fillStyle = isHovered ? '#ff00ff' : '#1a1a1a';
    this.ctx.fill();

    // Draw button border with glow
    this.ctx.strokeStyle = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.lineWidth = 3;
    this.ctx.shadowBlur = isHovered ? 25 : 15;
    this.ctx.shadowColor = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.stroke();
    this.ctx.restore();

    // Draw button text with dystopian font
    this.ctx.save();
    this.ctx.fillStyle = isHovered ? '#0a0a0a' : '#00ffff';
    this.ctx.font = '24px "PopulationZeroBB", "D Day Stencil", Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    if (!isHovered) {
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#00ffff';
    }
    this.ctx.fillText(text, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    this.ctx.restore();
  }

  /**
   * Draw language selector
   */
  private drawLanguageSelector(): void {
    const selector = this.getLanguageSelectorBounds();
    const isHovered = this.hoveredElement === 'languageSelector';
    const languageManager = LanguageManager.getInstance();
    const currentLang = this.options.selectedLanguage || languageManager.getCurrentLanguage();
    const currentLangName = languageManager.getLanguageName(currentLang as any);

    // Draw label
    this.ctx.save();
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = '18px "PopulationZeroBB", "D Day Stencil", Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = '#00ffff';
    this.ctx.fillText(t('ui.options.language'), selector.x + selector.width / 2, selector.y - 10);
    this.ctx.restore();

    // Draw selector box
    this.ctx.save();
    const selectorRadius = 5;
    this.drawRoundedRect(selector.x, selector.y, selector.width, selector.height, selectorRadius);
    this.ctx.fillStyle = isHovered ? '#1a1a1a' : '#0a0a0a';
    this.ctx.fill();
    this.ctx.strokeStyle = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = isHovered ? 15 : 10;
    this.ctx.shadowColor = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.stroke();
    this.ctx.restore();

    // Draw current language text
    this.ctx.save();
    this.ctx.fillStyle = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.font = '16px "PopulationZeroBB", Arial';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.fillText(currentLangName, selector.x + 15, selector.y + selector.height / 2);
    this.ctx.restore();

    // Draw dropdown arrow
    this.ctx.save();
    this.ctx.fillStyle = isHovered ? '#ff00ff' : '#00ffff';
    this.ctx.beginPath();
    const arrowX = selector.x + selector.width - 20;
    const arrowY = selector.y + selector.height / 2;
    if (this.isLanguageDropdownOpen) {
      // Up arrow
      this.ctx.moveTo(arrowX - 5, arrowY + 3);
      this.ctx.lineTo(arrowX, arrowY - 3);
      this.ctx.lineTo(arrowX + 5, arrowY + 3);
    } else {
      // Down arrow
      this.ctx.moveTo(arrowX - 5, arrowY - 3);
      this.ctx.lineTo(arrowX, arrowY + 3);
      this.ctx.lineTo(arrowX + 5, arrowY - 3);
    }
    this.ctx.fill();
    this.ctx.restore();

    // Draw dropdown if open
    if (this.isLanguageDropdownOpen) {
      const languages = languageManager.getSupportedLanguages();
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i];
        const itemBounds = this.getLanguageDropdownItemBounds(i);
        const itemHovered = this.hoveredElement === `languageItem_${i}`;
        const isSelected = lang === currentLang;

        // Draw item background
        this.ctx.save();
        this.ctx.fillStyle = itemHovered ? '#1a1a1a' : '#0a0a0a';
        this.ctx.fillRect(itemBounds.x, itemBounds.y, itemBounds.width, itemBounds.height);
        
        // Draw item border
        this.ctx.strokeStyle = itemHovered ? '#ff00ff' : '#333333';
        this.ctx.lineWidth = 1;
        if (itemHovered) {
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = '#ff00ff';
        }
        this.ctx.strokeRect(itemBounds.x, itemBounds.y, itemBounds.width, itemBounds.height);
        this.ctx.restore();

        // Draw language name
        this.ctx.save();
        this.ctx.fillStyle = isSelected ? '#ff00ff' : (itemHovered ? '#ff00ff' : '#00ffff');
        this.ctx.font = isSelected ? 'bold 16px "PopulationZeroBB", Arial' : '16px "PopulationZeroBB", Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        if (itemHovered || isSelected) {
          this.ctx.shadowBlur = 5;
          this.ctx.shadowColor = '#ff00ff';
        }
        this.ctx.fillText(languageManager.getLanguageName(lang), itemBounds.x + 15, itemBounds.y + itemBounds.height / 2);
        this.ctx.restore();

        // Draw checkmark for selected language
        if (isSelected) {
          this.ctx.save();
          this.ctx.fillStyle = '#ff00ff';
          this.ctx.font = '14px Arial';
          this.ctx.textAlign = 'right';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('✓', itemBounds.x + itemBounds.width - 15, itemBounds.y + itemBounds.height / 2);
          this.ctx.restore();
        }
      }
    }
  }
}
