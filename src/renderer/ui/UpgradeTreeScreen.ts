/**
 * Upgrade Tree screen - dystopian skill tree interface
 * Players spend upgrade points earned from completing levels
 */

import { Screen } from './Screen';
import { Button } from './Button';
import { Upgrade, UpgradeType } from '../game/core/types';
import { t } from '../i18n/LanguageManager';
import { getUpgrades } from '../config/upgrades';
import { FONT_TITLE_NORMAL, FONT_TITLE_XSMALL, FONT_TITLE_SMALL, FONT_SECONDARY_TINY, FONT_SECONDARY_MICRO, FONT_SECONDARY_MINI, GLOW_LARGE } from '../config/constants';

/**
 * Animation types for upgrade nodes
 */
interface NodeAnimation {
  type: 'click' | 'unlock' | 'reveal' | 'error';
  startTime: number;
  duration: number;
}

/**
 * Represents a node in the upgrade tree with position and state
 */
interface UpgradeNode {
  upgrade: Upgrade;
  currentLevel: number; // 0 to upgrade.times
  state: 'locked' | 'preview' | 'unlocked' | 'maxed';
  position: { x: number; y: number };
  children: UpgradeNode[];
  parent: UpgradeNode | null;
  animation: NodeAnimation | null;
}

/**
 * Upgrade tree state management
 */
interface UpgradeTreeState {
  rootNodes: UpgradeNode[];
  availablePoints: number;
  selectedNode: UpgradeNode | null;
  hoveredNode: UpgradeNode | null;
}

export class UpgradeTreeScreen extends Screen {
  private onContinue: () => void;
  private onStartLevel: (levelId: number) => void;
  private state: UpgradeTreeState;
  private backgroundImage: ImageData | null = null;
  private lastFrameTime: number = 0;
  private upgradeSound: HTMLAudioElement;
  private isDevMode: boolean = false;
  private showWelcomeDialog: boolean = false;
  private hasVisitedBefore: boolean = false;
  
  // Layout constants
  private readonly NODE_WIDTH = 180;
  private readonly NODE_HEIGHT = 100;
  private readonly NODE_SPACING = 250; // Distance from parent to child
  private readonly HEADER_HEIGHT = 80;

  constructor(
    canvas: HTMLCanvasElement,
    onContinue: () => void,
    onStartLevel: (levelId: number) => void,
    upgrades: Upgrade[]
  ) {
    super(canvas);
    this.onContinue = onContinue;
    this.onStartLevel = onStartLevel;
    
    // Initialize state
    this.state = {
      rootNodes: this.buildUpgradeTree(upgrades),
      availablePoints: 0,
      selectedNode: null,
      hoveredNode: null,
    };
    
    // Load upgrade sound
    this.upgradeSound = new Audio('./assets/sounds/power-up-game-sound-effect-359227.mp3');
    this.upgradeSound.volume = 0.5; // 50% volume
    
    this.createButtons();
  }

  /**
   * Enable dev mode (shows ALL button)
   */
  setDevMode(enabled: boolean): void {
    this.isDevMode = enabled;
    // Recreate buttons to add/remove ALL button
    this.buttons = [];
    this.createButtons();
  }

  /**
   * Set available points (called when entering upgrade screen)
   */
  setAvailablePoints(points: number): void {
    this.state.availablePoints = points;
    
    // Show welcome dialog on first visit
    if (!this.hasVisitedBefore) {
      this.showWelcomeDialog = true;
      this.hasVisitedBefore = true;
    }
  }

  /**
   * Get current available points
   */
  getAvailablePoints(): number {
    return this.state.availablePoints;
  }

  /**
   * Reset all upgrades and points (for new game)
   */
  reset(): void {
    // Reset all node levels and states
    const resetNode = (node: UpgradeNode) => {
      node.currentLevel = 0;
      node.state = node.parent === null ? 'unlocked' : 'locked';
      for (const child of node.children) {
        resetNode(child);
      }
    };
    
    for (const rootNode of this.state.rootNodes) {
      resetNode(rootNode);
    }
    
    // Reset points
    this.state.availablePoints = 0;
  }

  /**
   * Refresh translations when language changes (required by Screen base class)
   */
  refreshTranslations(): void {
    this.refreshUpgrades(getUpgrades());
  }

  /**
   * Refresh upgrade translations (called when language changes)
   */
  refreshUpgrades(upgrades: Upgrade[]): void {
    // Save current upgrade levels
    const currentLevels = this.getUpgradeLevels();
    
    // Rebuild tree with new translations
    this.state.rootNodes = this.buildUpgradeTree(upgrades);
    
    // Restore upgrade levels and states
    const restoreLevels = (node: UpgradeNode) => {
      const savedLevel = currentLevels.get(node.upgrade.type);
      if (savedLevel !== undefined) {
        node.currentLevel = savedLevel;
        
        // Update state based on level
        if (node.currentLevel >= node.upgrade.times) {
          node.state = 'maxed';
        } else if (node.currentLevel > 0) {
          node.state = 'unlocked';
        }
        
        // Check if children should be unlocked/previewed
        if (node.currentLevel >= node.upgrade.unlockNextUpgradesAfterTimes) {
          for (const child of node.children) {
            if (child.state === 'locked') {
              child.state = 'unlocked';
            }
          }
        } else if (node.currentLevel >= node.upgrade.previewNextUpgrades) {
          for (const child of node.children) {
            if (child.state === 'locked') {
              child.state = 'preview';
            }
          }
        }
      }
      
      // Recursively restore children
      for (const child of node.children) {
        restoreLevels(child);
      }
    };
    
    for (const rootNode of this.state.rootNodes) {
      restoreLevels(rootNode);
    }
    
    // Recalculate layout
    this.calculateLayout();
  }

  /**
   * Get all upgrade levels as a Map of upgrade type to level
   */
  getUpgradeLevels(): Map<string, number> {
    const upgradeLevels = new Map<string, number>();
    
    // Recursively collect upgrade levels from all nodes
    const collectUpgrades = (node: UpgradeNode) => {
      if (node.currentLevel > 0) {
        upgradeLevels.set(node.upgrade.type, node.currentLevel);
      }
      for (const child of node.children) {
        collectUpgrades(child);
      }
    };
    
    for (const rootNode of this.state.rootNodes) {
      collectUpgrades(rootNode);
    }
    
    return upgradeLevels;
  }

  /**
   * Capture the current game background
   */
  captureBackground(): void {
    this.backgroundImage = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Build the upgrade tree structure from flat upgrade list
   */
  private buildUpgradeTree(upgrades: Upgrade[]): UpgradeNode[] {
    const rootNodes: UpgradeNode[] = [];
    
    for (const upgrade of upgrades) {
      const node = this.createUpgradeNode(upgrade, null);
      rootNodes.push(node);
    }
    
    return rootNodes;
  }

  /**
   * Recursively create upgrade nodes
   */
  private createUpgradeNode(upgrade: Upgrade, parent: UpgradeNode | null): UpgradeNode {
    const node: UpgradeNode = {
      upgrade,
      currentLevel: 0,
      state: parent === null ? 'unlocked' : 'locked', // Root nodes start unlocked
      position: { x: 0, y: 0 }, // Will be calculated in layout
      children: [],
      parent,
      animation: null,
    };
    
    // Recursively create children
    for (const childUpgrade of upgrade.nextUpgrades) {
      const childNode = this.createUpgradeNode(childUpgrade, node);
      node.children.push(childNode);
    }
    
    return node;
  }

  /**
   * Calculate positions for all nodes in the tree
   */
  private calculateLayout(): void {
    const centerX = this.canvas.width / 2;
    const topY = this.HEADER_HEIGHT + 120; // Position below header with margin
    
    // Position root nodes at top, spread far apart horizontally
    if (this.state.rootNodes.length === 1) {
      // Single root: centered at top
      this.positionNodeWithChildren(this.state.rootNodes[0], centerX, topY, 0);
    } else if (this.state.rootNodes.length === 2) {
      // Two roots: far apart at top (use 40% of screen width between them)
      const spacing = this.canvas.width * 0.4;
      this.positionNodeWithChildren(this.state.rootNodes[0], centerX - spacing / 2, topY, 0);
      this.positionNodeWithChildren(this.state.rootNodes[1], centerX + spacing / 2, topY, 0);
    } else {
      // Multiple roots: spread across top with large spacing
      const spacing = Math.min(400, this.canvas.width / (this.state.rootNodes.length + 1));
      const totalRootWidth = (this.state.rootNodes.length - 1) * spacing;
      const startX = centerX - totalRootWidth / 2;
      
      this.state.rootNodes.forEach((node, index) => {
        const x = startX + index * spacing;
        this.positionNodeWithChildren(node, x, topY, 0);
      });
    }
  }

  /**
   * Recursively position a node and its children in a radial pattern
   * @param node - The node to position
   * @param x - X position
   * @param y - Y position
   * @param depth - Current depth in tree (0 = root)
   */
  private positionNodeWithChildren(node: UpgradeNode, x: number, y: number, depth: number): void {
    node.position = { x, y };
    
    if (node.children.length === 0) return;
    
    // Define angles for child positioning based on number of children
    const angles = this.getChildAngles(node.children.length, depth);
    
    node.children.forEach((child, index) => {
      const angle = angles[index];
      const distance = this.NODE_SPACING;
      
      // Calculate child position using polar coordinates
      const childX = x + Math.cos(angle) * distance;
      const childY = y + Math.sin(angle) * distance;
      
      this.positionNodeWithChildren(child, childX, childY, depth + 1);
    });
  }

  /**
   * Get angles for positioning children based on count and depth
   * Returns angles in radians
   */
  private getChildAngles(childCount: number, depth: number): number[] {
    const angles: number[] = [];
    
    if (childCount === 1) {
      // Single child: position below (90 degrees)
      angles.push(Math.PI / 2);
    } else if (childCount === 2) {
      // Two children: spread wider apart (60° and 120°)
      angles.push(Math.PI / 3);      // 60° (down-right)
      angles.push(2 * Math.PI / 3);  // 120° (down-left)
    } else if (childCount === 3) {
      // Three children: fan out in lower arc
      angles.push(Math.PI / 6);      // 30° (right-down)
      angles.push(Math.PI / 2);      // 90° (down)
      angles.push(5 * Math.PI / 6);  // 150° (left-down)
    } else if (childCount === 4) {
      // Four children: spread in lower semicircle
      angles.push(0);                // 0° (right)
      angles.push(Math.PI / 3);      // 60°
      angles.push(2 * Math.PI / 3);  // 120°
      angles.push(Math.PI);          // 180° (left)
    } else {
      // More children: distribute evenly in full circle except top quadrant
      // Avoid placing children above parent (270° to 90° range)
      const startAngle = Math.PI / 4;      // 45° (avoid directly above)
      const endAngle = 7 * Math.PI / 4;    // 315° (avoid directly above)
      const angleStep = (endAngle - startAngle) / (childCount - 1);
      
      for (let i = 0; i < childCount; i++) {
        angles.push(startAngle + i * angleStep);
      }
    }
    
    return angles;
  }

  /**
   * Create UI buttons
   */
  private createButtons(): void {
    const buttonWidth = 150;
    const buttonHeight = 40;
    const buttonSpacing = 10;
    
    // CONTINUE button (top-right)
    this.buttons.push(
      new Button({
        x: this.canvas.width - buttonWidth - 20,
        y: 20,
        width: buttonWidth,
        height: buttonHeight,
        text: t('ui.buttons.continue'),
        onClick: () => this.handleContinue(),
      })
    );

    // ALL button (dev mode only, bottom-right)
    if (this.isDevMode) {
      // Level selection buttons
      const levels = [1, 2, 3];
      const totalButtons = 1 + levels.length; // ALL + level buttons
      const totalHeight = totalButtons * buttonHeight + (totalButtons - 1) * buttonSpacing;
      
      // Start from bottom and work upwards
      let currentY = this.canvas.height - 20 - totalHeight;
      
      this.buttons.push(
        new Button({
          x: this.canvas.width - buttonWidth - 20,
          y: currentY,
          width: buttonWidth,
          height: buttonHeight,
          text: 'ALL',
          onClick: () => this.handleUnlockAll(),
        })
      );
      
      currentY += buttonHeight + buttonSpacing;
      
      for (const levelId of levels) {
        this.buttons.push(
          new Button({
            x: this.canvas.width - buttonWidth - 20,
            y: currentY,
            width: buttonWidth,
            height: buttonHeight,
            text: `Level ${levelId}`,
            onClick: () => this.handleStartLevel(levelId),
          })
        );
        currentY += buttonHeight + buttonSpacing;
      }
    }
  }

  /**
   * Handle continue button
   */
  private handleContinue(): void {
    this.onContinue();
  }

  /**
   * Handle start level button (dev mode)
   */
  private handleStartLevel(levelId: number): void {
    this.onStartLevel(levelId);
  }

  /**
   * Handle unlock all button (dev mode)
   */
  private handleUnlockAll(): void {
    // Recursively unlock all nodes to max level
    const unlockNode = (node: UpgradeNode) => {
      node.currentLevel = node.upgrade.times;
      node.state = 'maxed';
      node.animation = {
        type: 'unlock',
        startTime: Date.now(),
        duration: 300,
      };
      
      // Unlock children
      node.children.forEach(child => unlockNode(child));
    };

    // Unlock all root nodes and their children
    this.state.rootNodes.forEach(root => unlockNode(root));

    // Play sound
    try {
      this.upgradeSound.currentTime = 0;
      this.upgradeSound.play().catch(() => {
        // Ignore audio play errors
      });
    } catch (e) {
      // Ignore audio errors
    }
  }

  /**
   * Handle mouse move for hover effects
   */
  handleMouseMove(x: number, y: number): void {
    // Check button hover
    super.handleMouseMove(x, y);
    
    // Check node hover
    this.state.hoveredNode = this.findNodeAtPosition(x, y);
  }

  /**
   * Handle mouse click
   */
  handleClick(x: number, y: number): void {
    // If welcome dialog is showing, close it on any click
    if (this.showWelcomeDialog) {
      this.showWelcomeDialog = false;
      return;
    }
    
    // Check button clicks
    super.handleClick(x, y);
    
    // Check node clicks
    const clickedNode = this.findNodeAtPosition(x, y);
    if (clickedNode) {
      this.handleNodeClick(clickedNode);
    }
  }

  /**
   * Find node at given position
   */
  private findNodeAtPosition(x: number, y: number): UpgradeNode | null {
    // Search all nodes (depth-first)
    for (const rootNode of this.state.rootNodes) {
      const found = this.findNodeAtPositionRecursive(rootNode, x, y);
      if (found) return found;
    }
    return null;
  }

  /**
   * Recursively search for node at position
   */
  private findNodeAtPositionRecursive(node: UpgradeNode, x: number, y: number): UpgradeNode | null {
    // Check if point is inside this node
    const halfWidth = this.NODE_WIDTH / 2;
    const halfHeight = this.NODE_HEIGHT / 2;
    
    if (
      x >= node.position.x - halfWidth &&
      x <= node.position.x + halfWidth &&
      y >= node.position.y - halfHeight &&
      y <= node.position.y + halfHeight
    ) {
      return node;
    }
    
    // Check children
    for (const child of node.children) {
      const found = this.findNodeAtPositionRecursive(child, x, y);
      if (found) return found;
    }
    
    return null;
  }

  /**
   * Handle node click (upgrade purchase)
   */
  private handleNodeClick(node: UpgradeNode): void {
    // Can only upgrade unlocked nodes that aren't maxed
    if (node.state !== 'unlocked') {
      // Show error animation for locked/preview nodes
      if (node.state === 'preview' || node.state === 'locked') {
        this.startAnimation(node, 'error', 300);
      }
      return;
    }
    
    // Check if already maxed
    if (node.currentLevel >= node.upgrade.times) {
      return;
    }
    
    // Check if player has points
    if (this.state.availablePoints <= 0) {
      // Show error animation for insufficient points
      this.startAnimation(node, 'error', 300);
      return;
    }
    
    // Perform upgrade
    this.state.availablePoints--;
    node.currentLevel++;
    
    // Play upgrade sound immediately
    this.playUpgradeSound();
    
    // Start click animation
    this.startAnimation(node, 'click', 300);
    
    // Update node state if maxed
    if (node.currentLevel >= node.upgrade.times) {
      node.state = 'maxed';
    }
    
    // Update children states based on thresholds
    this.updateChildrenStates(node);
  }

  /**
   * Play upgrade sound effect
   */
  private playUpgradeSound(): void {
    // Reset and play sound (allows rapid clicks)
    this.upgradeSound.currentTime = 0;
    this.upgradeSound.play().catch(err => {
      console.warn('Failed to play upgrade sound:', err);
    });
  }

  /**
   * Update children states based on parent upgrade level
   */
  private updateChildrenStates(node: UpgradeNode): void {
    for (const child of node.children) {
      const previousState = child.state;
      
      // Check unlock threshold first (takes priority)
      if (node.currentLevel >= node.upgrade.unlockNextUpgradesAfterTimes) {
        if (child.state === 'locked' || child.state === 'preview') {
          child.state = 'unlocked';
          // Trigger unlock animation if transitioning from preview
          if (previousState === 'preview') {
            this.startAnimation(child, 'unlock', 500);
          }
        }
      }
      // Check preview threshold (only if not already unlocked)
      else if (node.currentLevel >= node.upgrade.previewNextUpgrades && child.state === 'locked') {
        child.state = 'preview';
        // Trigger reveal animation
        this.startAnimation(child, 'reveal', 400);
      }
    }
  }

  /**
   * Start an animation on a node
   */
  private startAnimation(node: UpgradeNode, type: 'click' | 'unlock' | 'reveal' | 'error', duration: number): void {
    node.animation = {
      type,
      startTime: performance.now(),
      duration,
    };
  }

  /**
   * Get animation progress (0 to 1) for a node
   */
  private getAnimationProgress(node: UpgradeNode): number {
    if (!node.animation) return 0;
    
    const elapsed = performance.now() - node.animation.startTime;
    const progress = Math.min(elapsed / node.animation.duration, 1);
    
    // Clear animation when complete
    if (progress >= 1) {
      node.animation = null;
    }
    
    return progress;
  }

  /**
   * Handle key press
   */
  handleKeyPress(key: string): void {
    if (key === ' ' || key === 'Enter' || key === 'c' || key === 'C') {
      this.handleContinue();
    }
  }

  /**
   * Render the upgrade tree screen
   */
  render(): void {
    // Calculate layout (in case canvas resized)
    this.calculateLayout();
    
    // Render background (previous level, darkened)
    this.renderBackground();
    
    // Render header
    this.renderHeader();
    
    // Render all nodes and connections
    this.renderTree();
    
    // Render buttons
    for (const button of this.buttons) {
      button.render(this.ctx);
    }
    
    // Render welcome dialog on top of everything
    if (this.showWelcomeDialog) {
      this.renderWelcomeDialog();
    }
  }

  /**
   * Render darkened background
   */
  private renderBackground(): void {
    if (this.backgroundImage) {
      // Draw captured background
      this.ctx.putImageData(this.backgroundImage, 0, 0);
    } else {
      // Fallback: solid dark background
      this.ctx.fillStyle = '#0a0a0a';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Dark overlay (85% opacity)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render header with title and points
   */
  private renderHeader(): void {
    this.ctx.save();
    
    // Header background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.HEADER_HEIGHT);
    
    // Header border (bottom)
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ffff';
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.HEADER_HEIGHT);
    this.ctx.lineTo(this.canvas.width, this.HEADER_HEIGHT);
    this.ctx.stroke();
    
    // Title (left side)
    this.ctx.shadowBlur = GLOW_LARGE;
    this.ctx.shadowColor = '#00ffff';
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = FONT_TITLE_NORMAL;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(t('game.upgrades.title'), 20, this.HEADER_HEIGHT / 2);
    
    // Points counter (center)
    this.ctx.font = FONT_TITLE_XSMALL;
    this.ctx.textAlign = 'center';
    const pointsKey = this.state.availablePoints === 1 ? 'game.upgrades.pointsAvailable' : 'game.upgrades.pointsAvailablePlural';
    this.ctx.fillText(
      t(pointsKey).replace('{count}', this.state.availablePoints.toString()),
      this.canvas.width / 2,
      this.HEADER_HEIGHT / 2
    );
    
    this.ctx.restore();
  }

  /**
   * Render the entire tree (connections and nodes)
   */
  private renderTree(): void {
    // Render connections first (behind nodes)
    for (const rootNode of this.state.rootNodes) {
      this.renderConnectionsRecursive(rootNode);
    }
    
    // Render nodes on top
    for (const rootNode of this.state.rootNodes) {
      this.renderNodeRecursive(rootNode);
    }
  }

  /**
   * Recursively render connection lines
   */
  private renderConnectionsRecursive(node: UpgradeNode): void {
    for (const child of node.children) {
      // Only render connections to visible nodes (not locked)
      if (child.state !== 'locked') {
        this.renderConnection(node, child);
      }
      this.renderConnectionsRecursive(child);
    }
  }

  /**
   * Render connection line between parent and child
   */
  private renderConnection(parent: UpgradeNode, child: UpgradeNode): void {
    this.ctx.save();
    
    const isActive = child.state === 'unlocked' || child.state === 'maxed';
    
    if (isActive) {
      // Active connection: solid cyan with glow
      this.ctx.strokeStyle = '#00ffff';
      this.ctx.lineWidth = 3;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = 'rgba(0, 255, 255, 0.6)';
    } else {
      // Preview/locked connection: dashed grey
      this.ctx.strokeStyle = '#555555';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
    }
    
    // Draw line from parent bottom to child top
    this.ctx.beginPath();
    this.ctx.moveTo(parent.position.x, parent.position.y + this.NODE_HEIGHT / 2);
    this.ctx.lineTo(child.position.x, child.position.y - this.NODE_HEIGHT / 2);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  /**
   * Recursively render nodes
   */
  private renderNodeRecursive(node: UpgradeNode): void {
    this.renderNode(node);
    
    for (const child of node.children) {
      this.renderNodeRecursive(child);
    }
  }

  /**
   * Render a single upgrade node
   */
  private renderNode(node: UpgradeNode): void {
    // Don't render locked nodes (completely hidden)
    if (node.state === 'locked') {
      return;
    }
    
    let x = node.position.x;
    let y = node.position.y;
    const halfWidth = this.NODE_WIDTH / 2;
    const halfHeight = this.NODE_HEIGHT / 2;
    
    const isHovered = this.state.hoveredNode === node;
    const isMaxed = node.state === 'maxed';
    const isPreview = node.state === 'preview';
    const isUnlocked = node.state === 'unlocked';
    
    // Get animation progress
    const animProgress = this.getAnimationProgress(node);
    let scale = 1.0;
    let flashIntensity = 0;
    let shakeX = 0;
    let animOpacity = 1.0;
    
    // Apply animation effects
    if (node.animation) {
      if (node.animation.type === 'click') {
        // Click: flash white and scale up/down
        const t = animProgress;
        scale = 1.0 + Math.sin(t * Math.PI) * 0.1; // Scale 1.0 -> 1.1 -> 1.0
        flashIntensity = (1 - t) * 0.5; // Flash fades out
      } else if (node.animation.type === 'unlock') {
        // Unlock: transition from grey to cyan with glow
        const t = animProgress;
        flashIntensity = Math.sin(t * Math.PI) * 0.3; // Pulse
      } else if (node.animation.type === 'reveal') {
        // Reveal: fade in and scale up
        const t = animProgress;
        animOpacity = t; // Fade in
        scale = 0.8 + t * 0.2; // Scale 0.8 -> 1.0
      } else if (node.animation.type === 'error') {
        // Error: shake horizontally and flash red
        const t = animProgress;
        shakeX = Math.sin(t * Math.PI * 4) * 5 * (1 - t); // Shake and dampen
        flashIntensity = -0.3 * (1 - t); // Red flash (negative = red tint)
      }
    }
    
    // Apply shake offset
    x += shakeX;
    
    this.ctx.save();
    
    // Apply scale transform
    if (scale !== 1.0) {
      this.ctx.translate(x, y);
      this.ctx.scale(scale, scale);
      this.ctx.translate(-x, -y);
    }
    
    // Determine colors and opacity based on state
    let borderColor = '#00ffff'; // Cyan for active
    let glowColor = 'rgba(0, 255, 255, 0.5)';
    let bgColor = 'rgba(0, 5, 5, 0.9)'; // Very dark
    let textColor = '#ffffff';
    let opacity = 1.0;
    
    if (isMaxed) {
      borderColor = '#ff00ff'; // Magenta for maxed
      glowColor = 'rgba(255, 0, 255, 0.5)';
      bgColor = 'rgba(5, 0, 5, 0.9)'; // Very dark
    } else if (isPreview) {
      // Preview state: greyed out, no glow
      borderColor = '#555555';
      glowColor = 'rgba(0, 0, 0, 0)';
      bgColor = 'rgba(5, 5, 5, 0.8)'; // Very dark
      textColor = '#666666';
      opacity = 0.6;
    }
    
    // Apply animation opacity
    opacity *= animOpacity;
    
    // Apply opacity for preview state
    this.ctx.globalAlpha = (isHovered && isPreview ? 0.7 : opacity);
    
    // Glow effect (only for active/maxed nodes)
    if (!isPreview) {
      this.ctx.shadowBlur = isHovered ? 25 : 20;
      this.ctx.shadowColor = glowColor;
    }
    
    // Background
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(x - halfWidth, y - halfHeight, this.NODE_WIDTH, this.NODE_HEIGHT);
    
    // Apply flash overlay
    if (flashIntensity !== 0) {
      if (flashIntensity > 0) {
        // White flash
        this.ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
      } else {
        // Red flash
        this.ctx.fillStyle = `rgba(255, 0, 0, ${-flashIntensity})`;
      }
      this.ctx.fillRect(x - halfWidth, y - halfHeight, this.NODE_WIDTH, this.NODE_HEIGHT);
    }
    
    // Border
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = isPreview ? 2 : 3;
    this.ctx.strokeRect(x - halfWidth, y - halfHeight, this.NODE_WIDTH, this.NODE_HEIGHT);
    
    this.ctx.shadowBlur = 0;
    
    // Title
    this.ctx.fillStyle = textColor;
    this.ctx.font = FONT_SECONDARY_TINY;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(node.upgrade.name.toUpperCase(), x, y - halfHeight + 6);
    
    // Progress indicator
    const progressText = `[${node.currentLevel}/${node.upgrade.times}]`;
    this.ctx.font = FONT_SECONDARY_MICRO;
    this.ctx.fillStyle = isPreview ? '#555555' : '#aaaaaa';
    this.ctx.fillText(progressText, x, y - halfHeight + 25);
    
    if (isPreview) {
      // Preview state: show ??? and LOCKED
      this.ctx.fillStyle = textColor;
      this.ctx.font = FONT_SECONDARY_TINY;
      this.ctx.fillText(t('game.upgrades.preview'), x, y - halfHeight + 55);
      
      this.ctx.font = FONT_SECONDARY_MICRO;
      this.ctx.fillText(t('game.upgrades.locked'), x, y + halfHeight - 14);
    } else {
      // Unlocked or maxed: show full details
      
      // Maxed indicator
      if (isMaxed) {
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.font = FONT_SECONDARY_MICRO;
        this.ctx.fillText(t('game.upgrades.maxed'), x, y - halfHeight + 40);
      }
      
      // Description (word wrap)
      this.ctx.fillStyle = textColor;
      this.ctx.font = FONT_SECONDARY_MICRO;
      this.renderWrappedText(
        node.upgrade.description,
        x,
        y - halfHeight + (isMaxed ? 54 : 42),
        this.NODE_WIDTH - 16,
        14
      );
      
      // Cost indicator (bottom)
      if (!isMaxed) {
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = `bold ${FONT_SECONDARY_MICRO}`;
        this.ctx.fillText(t('game.upgrades.cost'), x, y + halfHeight - 14);
      } else {
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.font = `bold ${FONT_SECONDARY_MICRO}`;
        this.ctx.fillText(t('game.upgrades.fullyUpgraded'), x, y + halfHeight - 14);
      }
    }
    
    this.ctx.restore();
  }

  /**
   * Render text with word wrapping
   */
  private renderWrappedText(text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        this.ctx.fillText(line, x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    // Draw remaining text
    if (line) {
      this.ctx.fillText(line, x, currentY);
    }
  }

  /**
   * Render welcome dialog
   */
  private renderWelcomeDialog(): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const dialogWidth = 600;
    const dialogHeight = 300;
    const dialogX = centerX - dialogWidth / 2;
    const dialogY = centerY - dialogHeight / 2;
    
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dialog background
    this.ctx.fillStyle = 'rgba(0, 20, 20, 0.95)';
    this.ctx.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
    
    // Dialog border
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(dialogX, dialogY, dialogWidth, dialogHeight);
    
    // Glow effect
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#00ffff';
    this.ctx.strokeRect(dialogX, dialogY, dialogWidth, dialogHeight);
    this.ctx.shadowBlur = 0;
    
    // Welcome text
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = FONT_TITLE_SMALL;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    
    // Build message with translations
    const title = t('game.upgrades.welcome.title');
    const message = t('game.upgrades.welcome.message');
    const pointsKey = this.state.availablePoints === 1 ? 'game.upgrades.welcome.points' : 'game.upgrades.welcome.pointsPlural';
    const pointsText = t(pointsKey).replace('{count}', this.state.availablePoints.toString());
    
    const lines = [title, message, pointsText];
    let yOffset = dialogY + 60;
    
    for (const line of lines) {
      this.ctx.fillText(line, centerX, yOffset);
      yOffset += 40;
    }
    
    // OK button
    const buttonWidth = 120;
    const buttonHeight = 50;
    const buttonX = centerX - buttonWidth / 2;
    const buttonY = dialogY + dialogHeight - 80;
    
    // Button background
    this.ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button border
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button text
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = FONT_TITLE_XSMALL;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(t('game.upgrades.welcome.ok'), centerX, buttonY + buttonHeight / 2);
  }
}
