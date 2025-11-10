/**
 * Steam Manager - Handles Steam API integration with graceful degradation
 * Game runs perfectly fine without Steam for local development
 */

import { execSync } from 'child_process';

interface SteamClient {
  init: (appId: number) => boolean;
  runCallbacks: () => void;
  localplayer: {
    getSteamId: () => { steamId: string; accountId: number };
    getName: () => string;
  };
  achievement: {
    activate: (name: string) => boolean;
    isActivated: (name: string) => boolean;
    clear: (name: string) => boolean;
  };
  cloud: {
    isEnabledForUser: () => boolean;
    writeFile: (name: string, data: Buffer) => boolean;
    readFile: (name: string) => Buffer | null;
    fileExists: (name: string) => boolean;
  };
}

export class SteamManager {
  private static instance: SteamManager;
  private steamworks: SteamClient | null = null;
  private initialized: boolean = false;
  private steamAvailable: boolean = false;
  private steamId: string = '';
  private playerName: string = 'Player';
  private callbackInterval: NodeJS.Timeout | null = null;

  // Use App ID 480 (SpaceWar) for testing, replace with your actual App ID for production
  private readonly APP_ID = 480;

  private constructor() {}

  static getInstance(): SteamManager {
    if (!SteamManager.instance) {
      SteamManager.instance = new SteamManager();
    }
    return SteamManager.instance;
  }

  /**
   * Initialize Steam API
   * Returns true if Steam is available and initialized, false otherwise
   * Game continues to work normally even if this returns false
   */
  initialize(): boolean {
    // Check if we should even try to load Steam
    if (!this.shouldLoadSteam()) {
      console.log('🎮 Running in OFFLINE mode (Steam not available)');
      return false;
    }

    try {
      // Dynamically require steamworks.js
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const steamworksModule = require('steamworks.js');
      
      // Initialize with App ID
      if (!steamworksModule.init(this.APP_ID)) {
        console.warn('⚠️  Steam client not running - continuing in offline mode');
        return false;
      }

      this.steamworks = steamworksModule;
      this.initialized = true;
      this.steamAvailable = true;

      // Get player info
      try {
        const steamIdObj = this.steamworks!.localplayer.getSteamId();
        this.steamId = steamIdObj.steamId;
        this.playerName = this.steamworks!.localplayer.getName();
      } catch (error) {
        console.warn('Could not get Steam player info:', error);
      }

      // Start callback processing
      this.startCallbackProcessing();

      console.log(`✅ Steam initialized for ${this.playerName} (${this.steamId})`);
      console.log(`📋 Using App ID: ${this.APP_ID} (SpaceWar test app)`);
      return true;

    } catch (error) {
      console.warn('⚠️  Steamworks.js not available - continuing in offline mode');
      console.warn('   Error:', (error as Error).message);
      this.steamAvailable = false;
      return false;
    }
  }

  /**
   * Check if we should attempt to load Steam
   */
  private shouldLoadSteam(): boolean {
    // Don't load Steam in test environment
    if (process.env.NODE_ENV === 'test') {
      return false;
    }

    // Check if Steam client is running
    return this.isSteamRunning();
  }

  /**
   * Check if Steam client process is running
   */
  private isSteamRunning(): boolean {
    try {
      if (process.platform === 'win32') {
        execSync('tasklist | findstr "steam.exe"', { stdio: 'pipe' });
      } else if (process.platform === 'darwin') {
        execSync('pgrep -x Steam', { stdio: 'pipe' });
      } else {
        execSync('pgrep -x steam', { stdio: 'pipe' });
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Start processing Steam callbacks
   */
  private startCallbackProcessing(): void {
    if (!this.steamworks) return;

    // Run callbacks every 100ms
    this.callbackInterval = setInterval(() => {
      if (this.steamworks) {
        this.steamworks.runCallbacks();
      }
    }, 100);
  }

  /**
   * Stop processing Steam callbacks
   */
  private stopCallbackProcessing(): void {
    if (this.callbackInterval) {
      clearInterval(this.callbackInterval);
      this.callbackInterval = null;
    }
  }

  /**
   * Check if Steam is available and initialized
   */
  isAvailable(): boolean {
    return this.steamAvailable && this.initialized;
  }

  /**
   * Get Steam ID
   */
  getSteamId(): string {
    return this.steamId;
  }

  /**
   * Get player name
   */
  getPlayerName(): string {
    return this.playerName;
  }

  /**
   * Shutdown Steam API
   */
  shutdown(): void {
    this.stopCallbackProcessing();
    
    if (this.initialized && this.steamworks) {
      console.log('🔌 Shutting down Steam API');
      this.initialized = false;
      this.steamAvailable = false;
    }
  }

  /**
   * Get the underlying steamworks client (for advanced usage)
   */
  getClient(): SteamClient | null {
    return this.steamworks;
  }
}
