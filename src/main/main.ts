import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { SteamManager } from './steam/SteamManager';
import { AchievementManager } from './steam/AchievementManager';
import { setupSteamIPC } from './steam/SteamIPC';

let mainWindow: BrowserWindow | null = null;
let achievementManager: AchievementManager | null = null;

// Leaderboard data file path
const getLeaderboardPath = (): string => {
  return path.join(app.getPath('userData'), 'leaderboards.json');
};

function createWindow(): void {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Set fullscreen mode that hides Dock on macOS
  mainWindow.setFullScreen(true);
  
  // Prevent window from exiting fullscreen
  mainWindow.on('leave-full-screen', () => {
    mainWindow?.setFullScreen(true);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle quit request from renderer
ipcMain.on('quit-app', () => {
  app.quit();
});

// Handle leaderboard data persistence
ipcMain.handle('load-leaderboards', async () => {
  try {
    const filePath = getLeaderboardPath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
    return {}; // Return empty object if file doesn't exist
  } catch (error) {
    console.error('Error loading leaderboards:', error);
    return {};
  }
});

ipcMain.handle('save-leaderboards', async (_event, data) => {
  try {
    const filePath = getLeaderboardPath();
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error saving leaderboards:', error);
    return { success: false, error: String(error) };
  }
});

app.whenReady().then(() => {
  // Initialize Steam (gracefully fails if Steam not available)
  const steamManager = SteamManager.getInstance();
  const steamInitialized = steamManager.initialize();
  
  if (steamInitialized) {
    console.log('✅ Steam integration active');
    
    // Initialize achievement system
    achievementManager = new AchievementManager();
    achievementManager.initialize();
  } else {
    console.log('🎮 Running in offline mode (Steam not available)');
  }
  
  // Setup Steam IPC handlers
  setupSteamIPC();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Shutdown Steam API
  SteamManager.getInstance().shutdown();
});
