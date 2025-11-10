/**
 * Steam IPC - Communication layer between main and renderer processes
 */

import { ipcMain } from 'electron';
import { SteamManager } from './SteamManager';

export function setupSteamIPC(): void {
  const steam = SteamManager.getInstance();

  // Basic Steam info
  ipcMain.handle('steam:isAvailable', () => {
    return steam.isAvailable();
  });

  ipcMain.handle('steam:getPlayerName', () => {
    return steam.getPlayerName();
  });

  ipcMain.handle('steam:getSteamId', () => {
    return steam.getSteamId();
  });
}
