/**
 * Global game constants
 * Centralized configuration for consistent gameplay
 */

// Import and re-export font styles from fontStyles module
export * from './fontStyles';

// Import and re-export color styles from colorStyles module
import * as ColorStyles from './colorStyles';
export * from './colorStyles';

// Destructure color constants for use in this file
const {
  COLOR_BLACK,
  COLOR_GREEN,
  COLOR_MAGENTA,
  COLOR_YELLOW,
  COLOR_CYAN,
  COLOR_ORANGE,
  COLOR_RED,
  COLOR_RED_ORANGE,
  COLOR_METALLIC_GRAY,
  COLOR_PURPLE,
} = ColorStyles;

// Brick dimensions (fixed size for all bricks)
export const BRICK_WIDTH = 120; // 30% wider than original 80
export const BRICK_HEIGHT = 25;
export const BRICK_SPACING = 1;
export const BRICK_LAYOUT_TOP_MARGIN = 200;
export const BRICK_CORNER_RADIUS = 7; // Corner radius for rounded edges

// Letter pattern constants
export const LETTER_BRICK_COLS = 5; // Each letter is 5 bricks wide
export const LETTER_BRICK_ROWS = 5; // Each letter is 5 bricks tall
export const LETTER_SPACING = 10;   // Space between letters (in pixels)

// Ball constants
export const BALL_RADIUS = 6;
export const BALL_SPEED = 300;
export const BALL_BASE_DAMAGE = 1;
export const BALL_SPEED_INCREASE_PER_SECOND = 2.5; // 300 per minute = 5 per second
export const BALL_BOUNCE_MAX_ANGLE = 60; // Maximum deflection angle in degrees when hitting bat

// Ball visual effects
export const BALL_TAIL_BASE_LENGTH = 30;
export const BALL_TAIL_SEGMENTS = 8;
export const BALL_TAIL_MAX_SPEED_MULTIPLIER = 3; // Tail length scales up to 3x at high speeds

// Bat constants
export const BAT_WIDTH = 120; // 50% larger than 195 (previously 30% wider than original 150)
export const BAT_HEIGHT = 15;
export const BAT_SPEED = 300;

// Bat turret constants (relative to bat height)
export const BAT_TURRET_WIDTH_MULTIPLIER = 0.7; // Reduced by ~33% from 1.05
export const BAT_TURRET_HEIGHT_MULTIPLIER = 0.62; // Reduced by ~33% from 0.93
export const BAT_TURRET_BARREL_WIDTH_MULTIPLIER = 0.19; // Reduced by ~33% from 0.28
export const BAT_TURRET_BARREL_HEIGHT_MULTIPLIER = 0.47; // Reduced by ~33% from 0.7
export const BAT_TURRET_TIP_WIDTH_MULTIPLIER = 0.6; // Multiplier of barrel width
export const BAT_TURRET_TIP_HEIGHT_MULTIPLIER = 0.15; // Reduced by ~33% from 0.23

// Laser constants
export const LASER_WIDTH = 4;
export const LASER_HEIGHT = 10;
export const LASER_SPEED_MULTIPLIER = 3; // Laser speed = ball speed * 3
export const LASER_DAMAGE_MULTIPLIER = 0.1; // Laser damage = ball damage * 0.1

// Bomb constants (bat weapon)
export const BOMB_SPEED_MULTIPLIER = 2.5; // Bomb speed = ball speed * 2.5
export const BOMB_DAMAGE_MULTIPLIER = 2.0; // Bomb damage = ball damage * 2.0
export const BOMB_EXPLOSION_RADIUS = 60; // Explosion radius in pixels

// Explosion constants (for ball explosions)
export const EXPLOSION_RADIUS_MULTIPLIER = 1.4; // Explosion radius = brick width * 1.5

// Bomb brick explosion constants (ellipse shape)
export const BOMB_BRICK_EXPLOSION_RADIUS_X_MULTIPLIER = 1.5; // Horizontal radius = brick width * 1.5
export const BOMB_BRICK_EXPLOSION_RADIUS_Y_MULTIPLIER = 0.75; // Vertical radius = brick height * 0.75 (narrower)
export const BOMB_BRICK_DAMAGE_MULTIPLIER = 3; // Bomb brick damage = ball damage * 3

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
// Font size constants moved to fontStyles.ts and re-exported above
export const DAMAGE_NUMBER_GLOW_BLUR = 10;

// Visual effect constants (glow/shadow)
export const BALL_GLOW_BLUR = 20;
export const BALL_TAIL_GLOW_BLUR = 15;
export const BAT_GLOW_BLUR = 15;
export const BRICK_GLOW_BLUR = 50; // Increased for shinier appearance
export const BACKGROUND_IMAGE_OPACITY = 0.3;

// Audio constants
export const AUDIO_MUSIC_BASE_VOLUME = 0.2;
export const AUDIO_BRICK_HIT_BASE_VOLUME = 0.3;
export const AUDIO_BRICK_DAMAGE_BASE_VOLUME = 0.35;
export const AUDIO_BRICK_EXPLODE_BASE_VOLUME = 0.4;
export const AUDIO_BAT_DAMAGE_BASE_VOLUME = 0.35;
export const AUDIO_DEFAULT_MUSIC_VOLUME = 1.0;
export const AUDIO_DEFAULT_SFX_VOLUME = 1.0;

// Audio file paths
export const AUDIO_PATH_BRICK_HIT = './assets/sounds/ding.mp3';
export const AUDIO_PATH_BRICK_DAMAGE = './assets/sounds/thud-impact-sound-sfx-379990.mp3';
export const AUDIO_PATH_BRICK_EXPLODE = './assets/sounds/explosion-107629.mp3';
export const AUDIO_PATH_BAT_DAMAGE = './assets/sounds/buzzer-4-183895.mp3';
export const AUDIO_PATH_BACKGROUND_MUSIC = './assets/sounds/lulu-swing-giulio-fazio-main-version-02-18-3209.mp3';

// StatusBar constants
export const STATUSBAR_BACKGROUND_COLOR = COLOR_BLACK;
export const STATUSBAR_BORDER_COLOR = COLOR_GREEN;
export const STATUSBAR_BORDER_WIDTH = 1;
export const STATUSBAR_BORDER_GLOW = 5;
// Font constants moved to fontStyles.ts and re-exported above
export const STATUSBAR_HEARTS_PADDING = 15;
export const STATUSBAR_ITEM_OFFSET = 200; // Offset from center for timer and brick count

// StatusBar colors
export const STATUSBAR_COLOR_HEARTS = COLOR_MAGENTA; // Magenta
export const STATUSBAR_COLOR_TIMER = COLOR_YELLOW; // Yellow
export const STATUSBAR_COLOR_BRICKS = COLOR_CYAN; // Cyan
export const STATUSBAR_COLOR_TITLE = COLOR_GREEN; // Green

// Button constants
export const BUTTON_COLOR_NORMAL = COLOR_MAGENTA; // Magenta
export const BUTTON_COLOR_HOVERED = COLOR_CYAN; // Cyan
export const BUTTON_GLOW_NORMAL = 15;
export const BUTTON_GLOW_HOVERED = 30;
export const BUTTON_BORDER_WIDTH = 3;
// Font constants moved to fontStyles.ts and re-exported above

// Piercing visual constants
export const PIERCING_WARNING_DURATION = 0.5; // Last 0.5 seconds flash warning
export const PIERCING_FLASH_INTERVAL = 0.1; // Flash every 0.1 seconds

// Game constants
export const PLAYER_STARTING_HEALTH = 1;

// Sticky ball constants
export const STICKY_BALL_LAUNCH_ANGLE = -60; // 30 degrees right of vertical (negative = upward)
export const STICKY_BALL_INDICATOR_LENGTH = 50; // Length of launch direction indicator
export const STICKY_BALL_INDICATOR_WIDTH = 3; // Width of indicator line
export const STICKY_BALL_INDICATOR_COLOR = COLOR_GREEN; // Green indicator
export const STICKY_BALL_INDICATOR_GLOW = 15; // Glow effect for indicator

// Slow-motion effect constants
export const SLOW_MOTION_FACTOR = 0.15; // 15% speed
export const SLOW_MOTION_DURATION = 2.0; // 2 seconds
export const SLOW_MOTION_TRIGGER_DISTANCE = 3; // Trigger at 2 brick heights from final brick
export const SLOW_MOTION_ZOOM_SCALE = 3; // Zoom to 150% (1.5x magnification)

// Brick type colors (fixed per type, not health-based)
export const BRICK_COLOR_NORMAL = COLOR_CYAN;              // Cyan for normal bricks
export const BRICK_COLOR_HEALTHY = COLOR_GREEN;            // Green for healthy bricks
export const BRICK_COLOR_INDESTRUCTIBLE = COLOR_METALLIC_GRAY; // Gray for indestructible

// Offensive brick constants
export const OFFENSIVE_BRICK_COLOR_FALLING = COLOR_ORANGE; // Red-Orange warning color
export const OFFENSIVE_BRICK_COLOR_EXPLODING = COLOR_RED; // Red warning color
export const OFFENSIVE_BRICK_COLOR_LASER = COLOR_YELLOW; // Yellow warning color
export const OFFENSIVE_BRICK_COLOR_HOMING = COLOR_MAGENTA; // Magenta warning color
export const OFFENSIVE_BRICK_COLOR_SPLITTING = COLOR_ORANGE; // Orange warning color
export const OFFENSIVE_BRICK_COLOR_BOMB = COLOR_RED_ORANGE; // Red-Orange bomb warning color
export const OFFENSIVE_BRICK_COLOR_DYNAMITE = COLOR_RED; // Red dynamite warning color
export const BRICK_COLOR_BOSS = COLOR_PURPLE; // Purple for boss bricks

// Falling brick constants
export const FALLING_BRICK_GRAVITY = 400; // Pixels per second squared
export const FALLING_BRICK_DAMAGE_PERCENT = 10; // Percentage of bat width to remove

// Exploding brick constants
export const EXPLODING_BRICK_DEBRIS_COUNT = 8; // 8 directions
export const EXPLODING_BRICK_DEBRIS_SPEED = 300; // Pixels per second
export const EXPLODING_BRICK_DEBRIS_DAMAGE_PERCENT = 10; // Percentage of bat width to remove
export const EXPLODING_BRICK_DEBRIS_SIZE = 8; // Debris particle size

// Laser brick constants
export const LASER_BRICK_FIRE_DELAY = 0.5; // Seconds before laser fires
export const LASER_BRICK_LASER_WIDTH = 6; // Laser beam width
export const LASER_BRICK_LASER_SPEED = 600; // Pixels per second
export const LASER_BRICK_LASER_DAMAGE_PERCENT = 10; // Percentage of bat width to remove
export const LASER_BRICK_WARNING_COLOR = COLOR_YELLOW; // Yellow warning flash

// Homing missile constants
export const HOMING_MISSILE_INITIAL_SPEED = 250; // Pixels per second
export const HOMING_MISSILE_MAX_SPEED = 400; // Maximum speed after acceleration
export const HOMING_MISSILE_ACCELERATION = 100; // Pixels per second squared
export const HOMING_MISSILE_TURN_RATE = 3.0; // Radians per second
export const HOMING_MISSILE_SIZE = 18; // Missile size (width/height) - 50% larger than 12
export const HOMING_MISSILE_DAMAGE_PERCENT = 10; // Percentage of bat width to remove
export const HOMING_MISSILE_PULSE_SPEED = 3.0; // Glow pulse frequency
export const HOMING_MISSILE_COLOR = COLOR_MAGENTA; // Bright purple/magenta
export const HOMING_MISSILE_MAX_LIFETIME = 7.0; // Maximum lifetime in seconds

// Splitting brick constants
export const SPLITTING_FRAGMENT_COUNT = 4; // 4 diagonal directions
export const SPLITTING_FRAGMENT_SPEED = 350; // Pixels per second
export const SPLITTING_FRAGMENT_SIZE = 16; // Fragment size (larger than debris)
export const SPLITTING_FRAGMENT_DAMAGE_PERCENT = 10; // Percentage of bat width to remove
export const SPLITTING_FRAGMENT_FALL_DISTANCE = 100; // Distance before falling vertically
export const SPLITTING_FRAGMENT_SHAKE_DURATION = 0.5; // Shake duration in seconds
export const SPLITTING_FRAGMENT_SHAKE_INTENSITY = 3; // Shake intensity in pixels
export const SPLITTING_FRAGMENT_GRAVITY = 500; // Gravity when falling (25% faster than 400)

// Dynamite stick constants
export const DYNAMITE_STICK_GRAVITY = 400; // UNUSED - kept for potential future use
export const DYNAMITE_STICK_FUSE_TIME = 3.0; // Seconds before explosion
export const DYNAMITE_STICK_FLASH_INTERVAL = 0.15; // Flash every 0.15 seconds
export const DYNAMITE_STICK_DRIFT_SPEED = 30; // Slow drift speed in pixels per second
export const DYNAMITE_STICK_WIDTH = 12; // Narrower than brick
export const DYNAMITE_STICK_HEIGHT = 30; // Taller than brick (stick shape)
export const DYNAMITE_EXPLOSION_RADIUS = 120; // Large circular explosion radius
export const DYNAMITE_EXPLOSION_DURATION = 0.5; // Explosion visual effect duration in seconds
export const DYNAMITE_BAT_DAMAGE_PERCENT = 10; // Percentage of bat width to remove
export const DYNAMITE_BRICK_DAMAGE_MULTIPLIER = 1.0; // Damage = current ball damage * 1.0

// Boss constants
export const BOSS_MOVE_SPEED = 250; // Pixels per second (increased from 150)
export const BOSS_THROW_INTERVAL = 1.0; // Seconds between brick throws (decreased from 2.0)
export const BOSS_THROWN_BRICK_SPEED = 500; // Pixels per second (increased from 300)
