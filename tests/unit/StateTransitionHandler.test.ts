/**
 * Tests for StateTransitionHandler class
 */

import { StateTransitionHandler, StateTransitionContext } from '../../src/renderer/game/managers/StateTransitionHandler';
import { GameState } from '../../src/renderer/game/core/types';
import { Ball } from '../../src/renderer/game/entities/Ball';
import { Bat } from '../../src/renderer/game/entities/Bat';
import { GameUpgrades } from '../../src/renderer/game/systems/GameUpgrades';

// Mock dependencies
const createMockContext = (): StateTransitionContext => {
  const mockCanvas = {
    width: 1920,
    height: 1080,
    style: { cursor: 'default' },
  } as HTMLCanvasElement;

  const mockCtx = {
    fillStyle: '',
    fillRect: jest.fn(),
  } as any;

  const mockScreenManager = {
    upgradeTreeScreen: {
      reset: jest.fn(),
      captureBackground: jest.fn(),
      setAvailablePoints: jest.fn(),
      getAvailablePoints: jest.fn(() => 0),
      setDevMode: jest.fn(),
      getUpgradeLevels: jest.fn(() => new Map()),
    },
    gameOverScreen: {
      setStats: jest.fn(),
    },
    setPreviousState: jest.fn(),
    getPreviousState: jest.fn(() => null),
    optionsScreen: {
      attach: jest.fn(),
      detach: jest.fn(),
    },
  } as any;

  const mockAudioManager = {
    setMusicVolume: jest.fn(),
    setSFXVolume: jest.fn(),
  } as any;

  const ball = new Ball(500, 500, 10, 600);
  const bat = new Bat(400, 900, 150, 15, 300);
  const gameUpgrades = new GameUpgrades();
  // Initialize GameUpgrades with base values to set up the Map properly
  gameUpgrades.setBaseValues(150, 15, 600, 10);

  const mockContext = {
    canvas: mockCanvas,
    ctx: mockCtx,
    bat,
    ball,
    gameUpgrades,
    screenManager: mockScreenManager,
    audioManager: mockAudioManager,
    gameState: GameState.INTRO,
    currentLevelId: 1,
    totalBricksDestroyed: 0,
    isDevUpgradeMode: false,
    loadLevel: jest.fn(),
    startTransition: jest.fn((callback) => callback()),
    applyOptions: jest.fn(),
    setCurrentLevelId: jest.fn((id: number) => { mockContext.currentLevelId = id; }),
    setTotalBricksDestroyed: jest.fn((count: number) => { mockContext.totalBricksDestroyed = count; }),
    setIsDevUpgradeMode: jest.fn((value: boolean) => { mockContext.isDevUpgradeMode = value; }),
    setGameState: jest.fn((state: GameState) => { mockContext.gameState = state; }),
  };
  
  return mockContext;
};

describe('StateTransitionHandler', () => {
  let handler: StateTransitionHandler;
  let mockContext: StateTransitionContext;

  beforeEach(() => {
    mockContext = createMockContext();
    handler = new StateTransitionHandler(mockContext);
  });

  describe('initialization', () => {
    it('should create handler instance', () => {
      expect(handler).toBeDefined();
    });
  });

  describe('handleStartGame', () => {
    it('should reset upgrades and start level 1', () => {
      const resetSpy = jest.spyOn(mockContext.gameUpgrades, 'reset');
      
      handler.handleStartGame();
      
      expect(resetSpy).toHaveBeenCalled();
      expect(mockContext.screenManager.upgradeTreeScreen.reset).toHaveBeenCalled();
      expect(mockContext.startTransition).toHaveBeenCalled();
      expect(mockContext.loadLevel).toHaveBeenCalled();
    });

    it('should set currentLevelId to 1', () => {
      mockContext.currentLevelId = 5;
      
      handler.updateContext(mockContext);
      handler.handleStartGame();
      
      expect(mockContext.currentLevelId).toBe(1);
    });

    it('should reset totalBricksDestroyed', () => {
      mockContext.totalBricksDestroyed = 100;
      
      handler.updateContext(mockContext);
      handler.handleStartGame();
      
      expect(mockContext.totalBricksDestroyed).toBe(0);
    });
  });

  describe('handleDevUpgrades', () => {
    it('should enable dev upgrade mode', () => {
      handler.handleDevUpgrades();
      
      expect(mockContext.isDevUpgradeMode).toBe(true);
    });

    it('should set upgrade screen to dev mode', () => {
      handler.handleDevUpgrades();
      
      expect(mockContext.screenManager.upgradeTreeScreen.setDevMode).toHaveBeenCalledWith(true);
    });

    it('should award 500 points for testing', () => {
      handler.handleDevUpgrades();
      
      expect(mockContext.screenManager.upgradeTreeScreen.setAvailablePoints).toHaveBeenCalledWith(500);
    });

    it('should transition to UPGRADE state', () => {
      handler.handleDevUpgrades();
      
      expect(mockContext.gameState).toBe(GameState.UPGRADE);
    });
  });

  describe('handleRestart', () => {
    it('should reset upgrades', () => {
      const resetSpy = jest.spyOn(mockContext.gameUpgrades, 'reset');
      
      handler.handleRestart();
      
      expect(resetSpy).toHaveBeenCalled();
      expect(mockContext.screenManager.upgradeTreeScreen.reset).toHaveBeenCalled();
    });

    it('should transition to INTRO state', () => {
      mockContext.gameState = GameState.GAME_OVER;
      
      handler.updateContext(mockContext);
      handler.handleRestart();
      
      expect(mockContext.gameState).toBe(GameState.INTRO);
    });
  });

  describe('handleLevelCompleteTransition', () => {
    it('should capture background for upgrade screen', () => {
      handler.handleLevelCompleteTransition();
      
      expect(mockContext.screenManager.upgradeTreeScreen.captureBackground).toHaveBeenCalled();
    });

    it('should award 3 points for completing level', () => {
      mockContext.screenManager.upgradeTreeScreen.getAvailablePoints = jest.fn(() => 5);
      
      handler.updateContext(mockContext);
      handler.handleLevelCompleteTransition();
      
      expect(mockContext.screenManager.upgradeTreeScreen.setAvailablePoints).toHaveBeenCalledWith(8);
    });

    it('should disable dev mode', () => {
      handler.handleLevelCompleteTransition();
      
      expect(mockContext.screenManager.upgradeTreeScreen.setDevMode).toHaveBeenCalledWith(false);
    });

    it('should transition to UPGRADE state when more levels exist', () => {
      mockContext.currentLevelId = 1; // Level 2 exists
      handler.updateContext(mockContext);
      handler.handleLevelCompleteTransition();
      
      expect(mockContext.gameState).toBe(GameState.UPGRADE);
    });

    it('should transition to GAME_OVER when no more levels exist', () => {
      mockContext.currentLevelId = 7; // Level 8 doesn't exist
      handler.updateContext(mockContext);
      handler.handleLevelCompleteTransition();
      
      expect(mockContext.gameState).toBe(GameState.GAME_OVER);
      expect(mockContext.screenManager.gameOverScreen.setStats).toHaveBeenCalledWith(
        7, // Last completed level
        mockContext.totalBricksDestroyed,
        true // Game complete
      );
    });
  });

  describe('handleUpgradeComplete', () => {
    it('should load next level when available', () => {
      mockContext.currentLevelId = 1;
      
      handler.updateContext(mockContext);
      handler.handleUpgradeComplete();
      
      expect(mockContext.currentLevelId).toBe(2);
      expect(mockContext.loadLevel).toHaveBeenCalled();
    });

    it('should exit dev mode and load current level (not increment)', () => {
      mockContext.isDevUpgradeMode = true;
      mockContext.currentLevelId = 1;
      
      handler.updateContext(mockContext);
      handler.handleUpgradeComplete();
      
      expect(mockContext.isDevUpgradeMode).toBe(false);
      expect(mockContext.currentLevelId).toBe(1); // Should stay at 1 in dev mode
    });
  });

  describe('handleStartLevel', () => {
    it('should start specified level', () => {
      handler.handleStartLevel(3);
      
      expect(mockContext.currentLevelId).toBe(3);
      expect(mockContext.loadLevel).toHaveBeenCalled();
    });

    it('should exit dev upgrade mode', () => {
      mockContext.isDevUpgradeMode = true;
      
      handler.updateContext(mockContext);
      handler.handleStartLevel(2);
      
      expect(mockContext.isDevUpgradeMode).toBe(false);
    });

    it('should reset totalBricksDestroyed', () => {
      mockContext.totalBricksDestroyed = 50;
      
      handler.updateContext(mockContext);
      handler.handleStartLevel(1);
      
      expect(mockContext.totalBricksDestroyed).toBe(0);
    });
  });

  describe('handlePause', () => {
    it('should pause when in PLAYING state', () => {
      mockContext.gameState = GameState.PLAYING;
      
      handler.updateContext(mockContext);
      handler.handlePause();
      
      expect(mockContext.gameState).toBe(GameState.PAUSED);
    });

    it('should show cursor when pausing', () => {
      mockContext.gameState = GameState.PLAYING;
      
      handler.updateContext(mockContext);
      handler.handlePause();
      
      expect(mockContext.canvas.style.cursor).toBe('default');
    });

    it('should not pause when not in PLAYING state', () => {
      mockContext.gameState = GameState.INTRO;
      
      handler.updateContext(mockContext);
      handler.handlePause();
      
      expect(mockContext.gameState).toBe(GameState.INTRO);
    });
  });

  describe('handleResume', () => {
    it('should resume when in PAUSED state', () => {
      mockContext.gameState = GameState.PAUSED;
      
      handler.updateContext(mockContext);
      handler.handleResume();
      
      expect(mockContext.gameState).toBe(GameState.PLAYING);
    });

    it('should hide cursor when resuming', () => {
      mockContext.gameState = GameState.PAUSED;
      
      handler.updateContext(mockContext);
      handler.handleResume();
      
      expect(mockContext.canvas.style.cursor).toBe('none');
    });

    it('should not resume when not in PAUSED state', () => {
      mockContext.gameState = GameState.PLAYING;
      
      handler.updateContext(mockContext);
      handler.handleResume();
      
      expect(mockContext.gameState).toBe(GameState.PLAYING);
    });
  });

  describe('handleQuitFromPause', () => {
    it('should reset upgrades', () => {
      const resetSpy = jest.spyOn(mockContext.gameUpgrades, 'reset');
      
      handler.handleQuitFromPause();
      
      expect(resetSpy).toHaveBeenCalled();
      expect(mockContext.screenManager.upgradeTreeScreen.reset).toHaveBeenCalled();
    });

    it('should transition to INTRO state', () => {
      mockContext.gameState = GameState.PAUSED;
      
      handler.updateContext(mockContext);
      handler.handleQuitFromPause();
      
      expect(mockContext.gameState).toBe(GameState.INTRO);
    });
  });

  describe('handleOpenOptions', () => {
    it('should save previous state', () => {
      mockContext.gameState = GameState.PLAYING;
      
      handler.updateContext(mockContext);
      handler.handleOpenOptions();
      
      expect(mockContext.screenManager.setPreviousState).toHaveBeenCalledWith(GameState.PLAYING);
    });

    it('should transition to OPTIONS state', () => {
      handler.handleOpenOptions();
      
      expect(mockContext.gameState).toBe(GameState.OPTIONS);
    });

    it('should attach options screen', () => {
      handler.handleOpenOptions();
      
      expect(mockContext.screenManager.optionsScreen.attach).toHaveBeenCalled();
    });
  });

  describe('handleCloseOptions', () => {
    it('should detach options screen', () => {
      handler.handleCloseOptions();
      
      expect(mockContext.screenManager.optionsScreen.detach).toHaveBeenCalled();
    });

    it('should restore previous state', () => {
      mockContext.screenManager.getPreviousState = jest.fn(() => GameState.PLAYING);
      
      handler.updateContext(mockContext);
      handler.handleCloseOptions();
      
      expect(mockContext.gameState).toBe(GameState.PLAYING);
    });

    it('should apply options', () => {
      handler.handleCloseOptions();
      
      expect(mockContext.applyOptions).toHaveBeenCalled();
    });
  });

  describe('handleQuit', () => {
    it('should call electron quit when available', () => {
      const mockQuit = jest.fn();
      (global as any).window = { electron: { quit: mockQuit } };
      
      handler.handleQuit();
      
      expect(mockQuit).toHaveBeenCalled();
      
      delete (global as any).window;
    });

    it('should not throw when electron is not available', () => {
      // Set window without electron
      (global as any).window = {};
      
      expect(() => {
        handler.handleQuit();
      }).not.toThrow();
      
      delete (global as any).window;
    });
  });

  describe('updateContext', () => {
    it('should update context reference', () => {
      const newContext = createMockContext();
      newContext.currentLevelId = 99;
      
      handler.updateContext(newContext);
      handler.handleStartLevel(5);
      
      expect(newContext.currentLevelId).toBe(5);
    });
  });
});
