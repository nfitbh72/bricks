import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App controls
  quit: () => ipcRenderer.send('quit-app'),
  
  // Leaderboards
  loadLeaderboards: () => ipcRenderer.invoke('load-leaderboards'),
  saveLeaderboards: (data: unknown) => ipcRenderer.invoke('save-leaderboards', data),
  
  // Steam API
  steam: {
    isAvailable: () => ipcRenderer.invoke('steam:isAvailable'),
    getPlayerName: () => ipcRenderer.invoke('steam:getPlayerName'),
    getSteamId: () => ipcRenderer.invoke('steam:getSteamId'),
    unlockAchievement: (achievementId: string) => ipcRenderer.invoke('steam:unlockAchievement', achievementId),
    isAchievementUnlocked: (achievementId: string) => ipcRenderer.invoke('steam:isAchievementUnlocked', achievementId),
    getUnlockedAchievements: () => ipcRenderer.invoke('steam:getUnlockedAchievements'),
    clearAchievement: (achievementId: string) => ipcRenderer.invoke('steam:clearAchievement', achievementId),
    isOfflineMode: () => ipcRenderer.invoke('steam:isOfflineMode'),
  },
});
