/**
 * Renderer process - initializes and starts the game
 */

import { Game } from './game/Game';

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

  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // Wait a bit for fonts to load, then create and start the game
  setTimeout(() => {
    console.log('Creating game...');
    try {
      const game = new Game(canvas);
      console.log('Game created, starting...');
      game.start();
      console.log('Game started! State:', game.getGameState());
    } catch (error) {
      console.error('Error creating/starting game:', error);
    }
  }, 100);
});
