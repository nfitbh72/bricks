/**
 * Renderer process - initializes and starts the game
 */

import './styles/index.scss';
import { Game } from './game/core/Game';
import { LanguageManager } from './i18n/LanguageManager';

console.log('Bricks game renderer initialized');

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  console.log('Canvas found:', canvas);

  // Set canvas size to window size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  console.log('Canvas size:', canvas.width, 'x', canvas.height);

  // Wait a bit for fonts to load, then initialize language and start game
  setTimeout(async () => {
    console.log('Initializing language manager...');
    const languageManager = LanguageManager.getInstance();
    await languageManager.loadTranslations();
    console.log('Language loaded:', languageManager.getCurrentLanguage());
    
    console.log('Creating game...');
    try {
      const game = new Game(canvas);
      console.log('Game created, starting...');
      game.start();
      console.log('Game started! State:', game.getGameState());

      // Handle window resize
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        game.handleResize();
      });
    } catch (error) {
      console.error('Error creating/starting game:', error);
    }
  }, 100);
});
