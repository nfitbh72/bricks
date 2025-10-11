/**
 * Global game constants
 * Centralized configuration for consistent gameplay
 */

// Brick dimensions (fixed size for all bricks)
export const BRICK_WIDTH = 80;
export const BRICK_HEIGHT = 20;
export const BRICK_SPACING = 2;
export const BRICK_LAYOUT_TOP_MARGIN = 200;

// Letter pattern constants
export const LETTER_BRICK_COLS = 5; // Each letter is 5 bricks wide
export const LETTER_BRICK_ROWS = 5; // Each letter is 5 bricks tall
export const LETTER_SPACING = 10;   // Space between letters (in pixels)

// Ball constants
export const BALL_RADIUS = 8;
export const BALL_SPEED = 300;
export const BALL_BASE_DAMAGE = 1;
export const BALL_SPEED_INCREASE_PER_SECOND = 5; // 300 per minute = 5 per second
export const BALL_BOUNCE_MAX_ANGLE = 60; // Maximum deflection angle in degrees when hitting bat

// Ball visual effects
export const BALL_TAIL_BASE_LENGTH = 20;
export const BALL_TAIL_SEGMENTS = 8;
export const BALL_TAIL_MAX_SPEED_MULTIPLIER = 3; // Tail length scales up to 3x at high speeds

// Bat constants
export const BAT_WIDTH = 150;
export const BAT_HEIGHT = 10;
export const BAT_SPEED = 300;

// Laser constants
export const LASER_WIDTH = 4;
export const LASER_HEIGHT = 10;
export const LASER_SPEED_MULTIPLIER = 3; // Laser speed = ball speed * 3
export const LASER_DAMAGE_MULTIPLIER = 0.1; // Laser damage = ball damage * 0.1

// Explosion constants
export const EXPLOSION_RADIUS_MULTIPLIER = 1.5; // Explosion radius = brick width * 1.5

// Critical hit constants
export const CRITICAL_HIT_DAMAGE_MULTIPLIER = 2; // Double damage on critical hits

// Particle constants
export const PARTICLE_MIN_SIZE = 2;
export const PARTICLE_MAX_SIZE = 5;
export const PARTICLE_DEFAULT_SPEED = 100;
export const PARTICLE_SPEED_VARIATION_MIN = 0.5; // Minimum speed multiplier
export const PARTICLE_SPEED_VARIATION_MAX = 0.5; // Maximum speed multiplier (added to min)
export const PARTICLE_GRAVITY = 200;
export const PARTICLE_FADE_RATE = 2; // Fade over 0.5 seconds (1 / 0.5 = 2)
export const PARTICLE_GLOW_BLUR = 10;

// Damage number constants
export const DAMAGE_NUMBER_LIFETIME = 1000; // 1 second in milliseconds
export const DAMAGE_NUMBER_FADE_DURATION = 300; // Last 300ms fade out
export const DAMAGE_NUMBER_FLOAT_SPEED = 0.5; // Pixels per frame
export const DAMAGE_NUMBER_FONT_SIZE_NORMAL = 14;
export const DAMAGE_NUMBER_FONT_SIZE_CRITICAL = 16;
export const DAMAGE_NUMBER_GLOW_BLUR = 10;

// Visual effect constants (glow/shadow)
export const BALL_GLOW_BLUR = 20;
export const BALL_TAIL_GLOW_BLUR = 15;
export const BAT_GLOW_BLUR = 15;
export const BRICK_GLOW_BLUR = 10;
export const BACKGROUND_IMAGE_OPACITY = 0.3;

// Audio constants
export const AUDIO_MUSIC_BASE_VOLUME = 0.2;
export const AUDIO_BRICK_HIT_BASE_VOLUME = 0.3;
export const AUDIO_BRICK_EXPLODE_BASE_VOLUME = 0.4;
export const AUDIO_DEFAULT_MUSIC_VOLUME = 1.0;
export const AUDIO_DEFAULT_SFX_VOLUME = 1.0;

// Audio file paths
export const AUDIO_PATH_BRICK_HIT = './assets/sounds/ding.mp3';
export const AUDIO_PATH_BRICK_EXPLODE = './assets/sounds/explosion-107629.mp3';
export const AUDIO_PATH_BACKGROUND_MUSIC = './assets/sounds/lulu-swing-giulio-fazio-main-version-02-18-3209.mp3';

// StatusBar constants
export const STATUSBAR_BACKGROUND_COLOR = '#0a0a0a';
export const STATUSBAR_BORDER_COLOR = '#00ff00';
export const STATUSBAR_BORDER_WIDTH = 1;
export const STATUSBAR_BORDER_GLOW = 5;
export const STATUSBAR_FONT_FAMILY = '"D Day Stencil", Arial';
export const STATUSBAR_FONT_SIZE_NORMAL = 24;
export const STATUSBAR_FONT_SIZE_HEARTS = 28;
export const STATUSBAR_TEXT_GLOW = 10;
export const STATUSBAR_HEARTS_GLOW = 12;
export const STATUSBAR_HEARTS_PADDING = 15;
export const STATUSBAR_ITEM_OFFSET = 200; // Offset from center for timer and brick count

// StatusBar colors
export const STATUSBAR_COLOR_HEARTS = '#ff00ff'; // Magenta
export const STATUSBAR_COLOR_TIMER = '#ffff00'; // Yellow
export const STATUSBAR_COLOR_BRICKS = '#00ffff'; // Cyan
export const STATUSBAR_COLOR_TITLE = '#00ff00'; // Green

// Button constants
export const BUTTON_COLOR_NORMAL = '#ff00ff'; // Magenta
export const BUTTON_COLOR_HOVERED = '#00ffff'; // Cyan
export const BUTTON_GLOW_NORMAL = 15;
export const BUTTON_GLOW_HOVERED = 30;
export const BUTTON_BORDER_WIDTH = 3;
export const BUTTON_FONT_SIZE = 32;
export const BUTTON_FONT_FAMILY = '"D Day Stencil", Arial';

// Piercing visual constants
export const PIERCING_WARNING_DURATION = 0.5; // Last 0.5 seconds flash warning
export const PIERCING_FLASH_INTERVAL = 0.1; // Flash every 0.1 seconds

// Game constants
export const PLAYER_STARTING_HEALTH = 1;

// Slow-motion effect constants
export const SLOW_MOTION_FACTOR = 0.15; // 15% speed
export const SLOW_MOTION_DURATION = 2.0; // 2 seconds
export const SLOW_MOTION_TRIGGER_DISTANCE = 3; // Trigger at 2 brick heights from final brick
export const SLOW_MOTION_ZOOM_SCALE = 3; // Zoom to 150% (1.5x magnification)
