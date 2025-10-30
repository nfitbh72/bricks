/**
 * Global type definitions for renderer process
 */

interface LeaderboardEntry {
  name: string;
  time: number;
  isPlayer: boolean;
}

interface LeaderboardData {
  [levelId: string]: LeaderboardEntry[];
}

interface ElectronAPI {
  quit: () => void;
  loadLeaderboards: () => Promise<LeaderboardData>;
  saveLeaderboards: (data: LeaderboardData) => Promise<{ success: boolean; error?: string }>;
}

interface Window {
  electron: ElectronAPI;
}
