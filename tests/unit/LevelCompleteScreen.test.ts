/**
 * Unit tests for LevelCompleteScreen
 */

import { LevelCompleteScreen } from '../../src/renderer/ui/LevelCompleteScreen';
import { Leaderboard } from '../../src/renderer/game/systems/Leaderboard';

// Mock the LanguageManager
jest.mock('../../src/renderer/i18n/LanguageManager', () => ({
  t: (key: string) => key,
}));

describe('LevelCompleteScreen', () => {
  let canvas: HTMLCanvasElement;
  let screen: LevelCompleteScreen;
  let mockOnContinue: jest.Mock;
  let mockElectronAPI: any;

  beforeEach(() => {
    // Mock Image class
    (global as any).Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
    };

    // Create mock canvas
    canvas = {
      width: 800,
      height: 600,
      getContext: jest.fn().mockReturnValue({
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        fillStyle: '',
        strokeStyle: '',
        shadowBlur: 0,
        shadowColor: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        fillText: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
      }),
    } as any;

    // Mock electron API
    mockElectronAPI = {
      loadLeaderboards: jest.fn(),
      saveLeaderboards: jest.fn()
    };
    
    (global as any).window = {
      electron: mockElectronAPI
    };

    // Reset Leaderboard static state
    (Leaderboard as any).cachedData = {};
    (Leaderboard as any).isLoaded = false;

    // Create screen
    mockOnContinue = jest.fn();
    screen = new LevelCompleteScreen(canvas, mockOnContinue);

    // Mock console methods to reduce noise
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('setLevel', () => {
    it('should not add player to leaderboard in dev mode even if time qualifies', async () => {
      // Mock leaderboard data with slow times
      mockElectronAPI.loadLeaderboards.mockResolvedValue({
        '1': [
          { name: 'TEST', time: 300, isPlayer: false },
          { name: 'ABC', time: 360, isPlayer: false },
          { name: 'XYZ', time: 420, isPlayer: false },
          { name: 'DEF', time: 480, isPlayer: false }
        ]
      });

      // Set level with a fast time (50 seconds) in dev mode
      await screen.setLevel(1, 50, true);

      // Player should NOT be on leaderboard because dev mode is on
      expect((screen as any).isOnLeaderboard).toBe(false);
    });

    it('should add player to leaderboard in normal mode if time qualifies', async () => {
      // Mock leaderboard data with slow times
      mockElectronAPI.loadLeaderboards.mockResolvedValue({
        '1': [
          { name: 'TEST', time: 300, isPlayer: false },
          { name: 'ABC', time: 360, isPlayer: false },
          { name: 'XYZ', time: 420, isPlayer: false },
          { name: 'DEF', time: 480, isPlayer: false }
        ]
      });

      // Set level with a fast time (50 seconds) in normal mode
      await screen.setLevel(1, 50, false);

      // Player SHOULD be on leaderboard because dev mode is off
      expect((screen as any).isOnLeaderboard).toBe(true);
    });
  });

  describe('handleKeyPress - dev mode', () => {
    it('should not save leaderboard when entering name in dev mode', async () => {
      // Mock leaderboard data
      mockElectronAPI.loadLeaderboards.mockResolvedValue({
        '1': [
          { name: 'TEST', time: 300, isPlayer: false },
          { name: 'ABC', time: 360, isPlayer: false },
          { name: 'XYZ', time: 420, isPlayer: false },
          { name: 'DEF', time: 480, isPlayer: false }
        ]
      });

      // Set level with qualifying time but in dev mode
      // In dev mode, player won't be on leaderboard, so this test verifies
      // that even if somehow they were, the save wouldn't happen
      await screen.setLevel(1, 50, true);

      // Manually set isOnLeaderboard to true to test the save prevention
      (screen as any).isOnLeaderboard = true;
      (screen as any).leaderboardEntries = [
        { name: 'AAA', time: 50, isPlayer: true },
        { name: 'TEST', time: 300, isPlayer: false },
        { name: 'ABC', time: 360, isPlayer: false },
        { name: 'XYZ', time: 420, isPlayer: false }
      ];

      // Enter name (3 letters)
      screen.handleKeyPress('J');
      screen.handleKeyPress('O');
      screen.handleKeyPress('E');

      // Leaderboard should NOT have been saved because dev mode is on
      expect(mockElectronAPI.saveLeaderboards).not.toHaveBeenCalled();
    });
  });
});
