/**
 * Type definitions for Electron IPC API exposed to renderer
 */

export interface LeaderboardData {
  [levelId: string]: {
    name: string;
    time: number;
    isPlayer: boolean;
  }[];
}

export interface ElectronAPI {
  quit: () => void;
  loadLeaderboards: () => Promise<LeaderboardData>;
  saveLeaderboards: (data: LeaderboardData) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
