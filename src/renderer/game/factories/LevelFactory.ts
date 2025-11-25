import { Level } from '../entities/Level';
import { LevelConfig, BrickType } from '../core/types';
import { Brick } from '../entities/Brick';
import { createBricksFromPattern, createBricksFromWord } from '../../config/brickLayout';
import { BRICK_WIDTH, BRICK_SPACING } from '../../config/constants';

export class LevelFactory {
  private static readonly TOP_MARGIN_ROWS = 3; // 3 brick heights gap at top

  /**
   * Create a Level from a configuration object
   */
  static createLevel(config: LevelConfig, canvasWidth?: number): Level {
    const bricks = this.createBricksFromConfig(config, canvasWidth);
    return new Level(config, bricks);
  }

  /**
   * Create a Level from a visual pattern
   * Convenience factory method for pattern-based levels
   */
  static createFromPattern(
    id: number,
    name: string,
    pattern: string[],
    canvasWidth?: number
  ): Level {
    const config: LevelConfig = {
      id,
      name,
      bricks: createBricksFromPattern(pattern),
    };
    return this.createLevel(config, canvasWidth);
  }

  /**
   * Create a Level from a word
   * Uses letter patterns to spell out the word in bricks
   */
  static createFromWord(
    id: number,
    name: string,
    word: string,
    brickType: BrickType = BrickType.NORMAL,
    canvasWidth?: number
  ): Level {
    const config: LevelConfig = {
      id,
      name,
      bricks: createBricksFromWord(word, brickType),
    };
    return this.createLevel(config, canvasWidth);
  }

  /**
   * Optionally centers bricks horizontally based on canvas width
   * Always adds top margin of 3 brick heights
   */
  private static createBricksFromConfig(config: LevelConfig, canvasWidth?: number): Brick[] {
    let brickConfigs = config.bricks;
    
    // Apply top margin (3 brick heights)
    brickConfigs = brickConfigs.map(bc => ({
      ...bc,
      row: bc.row + LevelFactory.TOP_MARGIN_ROWS,
    }));
    
    // If canvas width provided, center the bricks horizontally
    if (canvasWidth !== undefined && brickConfigs.length > 0) {
      // Find the width of the brick layout
      const maxCol = Math.max(...brickConfigs.map(b => b.col));
      const minCol = Math.min(...brickConfigs.map(b => b.col));
      const layoutWidth = maxCol - minCol + 1;
      
      // Calculate canvas width in columns
      const canvasWidthCols = Math.floor(canvasWidth / (BRICK_WIDTH + BRICK_SPACING));
      
      // Calculate offset to center
      const offsetCol = Math.max(0, Math.floor((canvasWidthCols - layoutWidth) / 2)) - minCol;
      
      // Apply horizontal offset to all bricks
      brickConfigs = brickConfigs.map(bc => ({
        ...bc,
        col: bc.col + offsetCol,
      }));
    }
    
    // Get baseHealth from config (default: 1)
    const baseHealth = config.baseHealth ?? 1;
    
    return brickConfigs.map((brickConfig) => new Brick(brickConfig, baseHealth));
  }
}
