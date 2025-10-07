/**
 * Renderer process - initializes and starts the game
 */

import { Game } from './game/Game';

console.log('Bricks game renderer initialized');

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  // Set canvas size to window size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // Create and start the game
  const game = new Game(canvas);
  game.start();

  console.log('Game started!');
});
