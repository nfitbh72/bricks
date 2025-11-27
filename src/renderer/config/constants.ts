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
} = ColorStyles;

// Brick dimensions (fixed size for all bricks)
export const BRICK_WIDTH = 120; //pixels
export const BRICK_HEIGHT = 25; //pixels
export const BRICK_SPACING = 1; //pixels between bricks
export const BRICK_LAYOUT_TOP_MARGIN = 200; //pixels above all bricks
export const BRICK_CORNER_RADIUS = 7; // Corner radius in pixels for rounded edges

// Letter pattern constants
export const LETTER_BRICK_COLS = 5; // Each letter is 5 bricks wide
export const LETTER_BRICK_ROWS = 5; // Each letter is 5 bricks tall
export const LETTER_SPACING = 10;   // Space between letters (in pixels)

// Ball constants
export const BALL_RADIUS = 6; // pixels
export const BALL_SPEED = 300; // pixels per second
export const BALL_BASE_DAMAGE = 1; // damage per hit
export const BALL_SPEED_INCREASE_PER_SECOND = 2.5; // pixels per second per second
export const BALL_BOUNCE_MAX_ANGLE = 60; // Maximum deflection angle in degrees when hitting bat

// Ball visual effects
export const BALL_TAIL_BASE_LENGTH = 60; // pixels
export const BALL_TAIL_SEGMENTS = 8; // segments of tail
export const BALL_TAIL_MAX_SPEED_MULTIPLIER = 3; // Tail length scales up to 3x at high speeds

// Bat constants
export const BAT_WIDTH = 120; // 50% larger than 195 (previously 30% wider than original 150)
export const BAT_HEIGHT = 15; // pixels
export const BAT_SPEED = 300; // pixels per second

// Bat turret constants (relative to bat height)
export const BAT_TURRET_WIDTH_MULTIPLIER = 0.7; // Multiplier of bat height
export const BAT_TURRET_HEIGHT_MULTIPLIER = 0.62; // Multiplier of bat height
export const BAT_TURRET_BARREL_WIDTH_MULTIPLIER = 0.19; // Multiplier of bat height
export const BAT_TURRET_BARREL_HEIGHT_MULTIPLIER = 0.47; // Multiplier of bat height
export const BAT_TURRET_TIP_WIDTH_MULTIPLIER = 0.6; // Multiplier of bat height
export const BAT_TURRET_TIP_HEIGHT_MULTIPLIER = 0.15; // Multiplier of bat height

// Laser constants
export const LASER_WIDTH = 4; // pixels
export const LASER_HEIGHT = 10; // pixels
export const LASER_SPEED_MULTIPLIER = 3; // Multiplier of ball speed
export const LASER_DAMAGE_MULTIPLIER = 0.1; // Multiplier of ball damage

// Bomb constants (bat weapon)
export const BOMB_SPEED_MULTIPLIER = 2.5; // Multiplier of ball speed
export const BOMB_DAMAGE_MULTIPLIER = 2.0; // Multiplier of ball damage
export const BOMB_EXPLOSION_RADIUS = 60; // pixels
export const BOMB_COOLDOWN_MS = 1000; // Cooldown between bombs in milliseconds (1 second)

// Explosion constants (for ball explosions)
export const EXPLOSION_RADIUS_MULTIPLIER = 1.4; // Multiplier of brick width

// Bomb brick explosion constants (ellipse shape)
export const BOMB_BRICK_EXPLOSION_RADIUS_X_MULTIPLIER = 1.5; // Multiplier of brick width
export const BOMB_BRICK_EXPLOSION_RADIUS_Y_MULTIPLIER = 0.75; // Multiplier of brick height
export const BOMB_BRICK_DAMAGE_MULTIPLIER = 3; // Multiplier of ball damage

// Critical hit constants
export const CRITICAL_HIT_DAMAGE_MULTIPLIER = 2; // Multiplier of ball damage

// Screen shake constants
export const SCREEN_SHAKE_BAT_DAMAGE_INTENSITY = 2; // pixels
export const SCREEN_SHAKE_BAT_DAMAGE_DURATION = 0.15; // Seconds
export const SCREEN_SHAKE_BACK_WALL_INTENSITY = 3; // Pixels
export const SCREEN_SHAKE_BACK_WALL_DURATION = 0.2; // Seconds
export const SCREEN_SHAKE_BOMB_BRICK_INTENSITY = 5; // Pixels
export const SCREEN_SHAKE_BOMB_BRICK_DURATION = 0.3; // Seconds

// Bat damage constants
export const BAT_DAMAGE_FROM_BOMB_BRICK_PERCENT = 10; // Percentage of bat width removed

// Particle constants
export const PARTICLE_MIN_SIZE = 2; // pixels
export const PARTICLE_MAX_SIZE = 5; // pixels
export const PARTICLE_DEFAULT_SPEED = 100; // pixels per second
export const PARTICLE_SPEED_VARIATION_MIN = 0.5; // Minimum speed multiplier
export const PARTICLE_SPEED_VARIATION_MAX = 0.5; // Maximum speed multiplier (added to min)
export const PARTICLE_GRAVITY = 200; // pixels per second per second
export const PARTICLE_FADE_RATE = 2; // Fade over 0.5 seconds (1 / 0.5 = 2)
export const PARTICLE_GLOW_BLUR = 10;

// Damage number constants
export const DAMAGE_NUMBER_LIFETIME = 1000; // 1 second in milliseconds
export const DAMAGE_NUMBER_FADE_DURATION = 300; // Last 300ms fade out
export const DAMAGE_NUMBER_FLOAT_SPEED = 0.5; // Pixels per frame
// Font size constants moved to fontStyles.ts and re-exported above
export const DAMAGE_NUMBER_GLOW_BLUR = 10; // pixels

// Visual effect constants (glow/shadow)
export const BALL_GLOW_BLUR = 20; // pixels
export const BALL_TAIL_GLOW_BLUR = 15; // pixels
export const BAT_GLOW_BLUR = 15; // pixels
export const BRICK_GLOW_BLUR = 150; // Increased for shinier appearance
export const BACKGROUND_IMAGE_OPACITY = 0.3; // 0 to 1

// Audio constants
export const AUDIO_MUSIC_BASE_VOLUME = 0.2; // 0 to 1
export const AUDIO_BRICK_HIT_BASE_VOLUME = 0.3; // 0 to 1
export const AUDIO_BRICK_DAMAGE_BASE_VOLUME = 0.35; // 0 to 1
export const AUDIO_BRICK_EXPLODE_BASE_VOLUME = 0.4; // 0 to 1
export const AUDIO_BAT_DAMAGE_BASE_VOLUME = 0.35; // 0 to 1
export const AUDIO_DEFAULT_MUSIC_VOLUME = 1.0; // 0 to 1
export const AUDIO_DEFAULT_SFX_VOLUME = 1.0; // 0 to 1

// Audio file paths
export const AUDIO_PATH_BRICK_HIT = './assets/sounds/ding.mp3';
export const AUDIO_PATH_BRICK_DAMAGE = './assets/sounds/thud-impact-sound-sfx-379990.mp3';
export const AUDIO_PATH_BRICK_EXPLODE = './assets/sounds/explosion-107629.mp3';
export const AUDIO_PATH_BAT_DAMAGE = './assets/sounds/buzzer-4-183895.mp3';
export const AUDIO_PATH_BACKGROUND_MUSIC = './assets/sounds/lulu-swing-giulio-fazio-main-version-02-18-3209.mp3';

// StatusBar constants
export const STATUSBAR_BACKGROUND_COLOR = COLOR_BLACK;
export const STATUSBAR_BORDER_COLOR = COLOR_GREEN;
export const STATUSBAR_BORDER_WIDTH = 1; // pixels
export const STATUSBAR_BORDER_GLOW = 5; // pixels
// Font constants moved to fontStyles.ts and re-exported above
export const STATUSBAR_HEARTS_PADDING = 15; // pixels
export const STATUSBAR_ITEM_OFFSET = 200; // pixels Offset from center for timer and brick count

// StatusBar colors
export const STATUSBAR_COLOR_HEARTS = COLOR_MAGENTA; // Magenta
export const STATUSBAR_COLOR_TIMER = COLOR_YELLOW; // Yellow
export const STATUSBAR_COLOR_BRICKS = COLOR_CYAN; // Cyan
export const STATUSBAR_COLOR_TITLE = COLOR_GREEN; // Green

// Button constants
export const BUTTON_COLOR_NORMAL = COLOR_MAGENTA; // Magenta
export const BUTTON_COLOR_HOVERED = COLOR_CYAN; // Cyan
export const BUTTON_GLOW_NORMAL = 15; // pixels
export const BUTTON_GLOW_HOVERED = 30; // pixels
export const BUTTON_BORDER_WIDTH = 3; // pixels
// Font constants moved to fontStyles.ts and re-exported above

// Piercing visual constants
export const PIERCING_BALL_COLOR = '#7fff00'; // Lime green color for piercing ball
export const PIERCING_WARNING_DURATION = 0.5; // seconds Last 0.5 seconds flash warning
export const PIERCING_FLASH_INTERVAL = 0.1; // seconds Flash every 0.1 seconds

// Game constants
export const PLAYER_STARTING_HEALTH = 1; // starting health
export const TOTAL_LEVELS = 13; // Total number of levels in the game
export const TOTAL_BOSSES = 3; // Total number of boss types

// Sticky ball constants
export const STICKY_BALL_LAUNCH_ANGLE = -60; // 30 degrees right of vertical (negative = upward)
export const STICKY_BALL_INDICATOR_LENGTH = 50; // pixels Length of launch direction indicator
export const STICKY_BALL_INDICATOR_WIDTH = 3; // pixels Width of indicator line
export const STICKY_BALL_INDICATOR_COLOR = COLOR_GREEN; // Green indicator
export const STICKY_BALL_INDICATOR_GLOW = 15; // pixels Glow effect for indicator

// Slow-motion effect constants
export const SLOW_MOTION_FACTOR = 0.15; // 15% speed
export const SLOW_MOTION_DURATION = 2.0; // seconds
export const SLOW_MOTION_TRIGGER_DISTANCE = 3; // Trigger at 2 brick heights from final brick
export const SLOW_MOTION_ZOOM_SCALE = 3; // Zoom to 150% (1.5x magnification)

// Falling brick constants
export const FALLING_BRICK_GRAVITY = 400; // pixels per second squared
export const FALLING_BRICK_DAMAGE_PERCENT = 10; // Percentage of bat width to remove

// Exploding brick constants
export const EXPLODING_BRICK_DEBRIS_COUNT = 8; // 8 directions
export const EXPLODING_BRICK_DEBRIS_SPEED = 300; // pixels per second
export const EXPLODING_BRICK_DEBRIS_DAMAGE_PERCENT = 10; // Percentage of bat width to remove
export const EXPLODING_BRICK_DEBRIS_SIZE = 8; // Debris particle size

// Laser brick constants
export const LASER_BRICK_FIRE_DELAY = 0.5; // seconds before laser fires
export const LASER_BRICK_LASER_WIDTH = 6; // pixels Laser beam width
export const LASER_BRICK_LASER_SPEED = 600; // pixels per second
export const LASER_BRICK_LASER_DAMAGE_PERCENT = 10; // Percentage of bat width to remove
export const LASER_BRICK_WARNING_COLOR = COLOR_YELLOW; // Yellow warning flash

// Homing missile constants
export const HOMING_MISSILE_INITIAL_SPEED = 250; // pixels per second
export const HOMING_MISSILE_MAX_SPEED = 400; // Maximum speed after acceleration
export const HOMING_MISSILE_ACCELERATION = 100; // pixels per second squared
export const HOMING_MISSILE_TURN_RATE = 2.5; // Radians per second
export const HOMING_MISSILE_SIZE = 18; // Missile size (width/height) - 50% larger than 12
export const HOMING_MISSILE_DAMAGE_PERCENT = 10; // Percentage of bat width to remove
export const HOMING_MISSILE_PULSE_SPEED = 3.0; // Glow pulse frequency
export const HOMING_MISSILE_COLOR = COLOR_MAGENTA; // Bright purple/magenta
export const HOMING_MISSILE_MAX_LIFETIME = 6.0; // Maximum lifetime in seconds

// Splitting brick constants
export const SPLITTING_FRAGMENT_COUNT = 4; // 4 diagonal directions
export const SPLITTING_FRAGMENT_SPEED = 350; // pixels per second
export const SPLITTING_FRAGMENT_SIZE = 32; // Fragment size (larger than debris)
export const SPLITTING_FRAGMENT_DAMAGE_PERCENT = 10; // Percentage of bat width to remove
export const SPLITTING_FRAGMENT_FALL_DISTANCE = 100; // Distance before falling vertically
export const SPLITTING_FRAGMENT_SHAKE_DURATION = 0.5; // seconds Shake duration in seconds
export const SPLITTING_FRAGMENT_SHAKE_INTENSITY = 3; // pixels Shake intensity in pixels
export const SPLITTING_FRAGMENT_GRAVITY = 500; // Gravity when falling (25% faster than 400)

// Dynamite stick constants
export const DYNAMITE_STICK_GRAVITY = 400; // UNUSED - kept for potential future use
export const DYNAMITE_STICK_FUSE_TIME = 3.0; // seconds before explosion
export const DYNAMITE_STICK_FLASH_INTERVAL = 0.15; // seconds Flash every 0.15 seconds
export const DYNAMITE_STICK_DRIFT_SPEED = 30; // pixels per second Slow drift speed in pixels per second
export const DYNAMITE_STICK_WIDTH = 12; // Narrower than brick
export const DYNAMITE_STICK_HEIGHT = 30; // Taller than brick (stick shape)
export const DYNAMITE_EXPLOSION_RADIUS = 120; // Large circular explosion radius
export const DYNAMITE_EXPLOSION_DURATION = 0.5; // seconds Explosion visual effect duration in seconds
export const DYNAMITE_BAT_DAMAGE_PERCENT = 10; // Percentage of bat width to remove
export const DYNAMITE_BRICK_DAMAGE_MULTIPLIER = 1.0; // Damage = current ball damage * 1.0

// Multi-ball brick constants
export const MULTIBALL_BRICK_SPAWN_COUNT = 2; // Number of extra balls to spawn from brick
export const MULTIBALL_MIN_ANGLE = -150; // Degrees (upward-left)
export const MULTIBALL_MAX_ANGLE = -30;  // Degrees (upward-right)
export const MULTIBALL_DESPAWN_PARTICLE_COUNT = 8; // Particles when ball despawns

// Multi-ball upgrade constants
export const MULTIBALL_UPGRADE_CHANCE_PER_LEVEL = 0.02; // 2% chance per level
export const MULTIBALL_UPGRADE_BALL_EVERY_N_LEVELS = 2; // Add 1 ball every 2 levels
export const MULTIBALL_UPGRADE_BASE_BALLS = 2; // Base number of balls spawned at level 1
export const MAX_BALLS_ON_SCREEN = 10; // Maximum number of balls allowed on screen

// Boss1 constants
export const BOSS1_HEALTH_MULTIPLIER = 6; // Boss1 health = base health * 6
export const BOSS1_MOVE_SPEED = 250; // pixels per second Boss1 movement speed in pixels per second
export const BOSS1_THROW_INTERVAL = 1.0; // seconds Seconds between brick throws
export const BOSS1_THROWN_BRICK_SPEED = 600; // pixels per second Speed of thrown bricks in pixels per second
export const BOSS1_SPAWN_OFFSET_Y = -2; // Spawn offset in brick heights

// Boss2 (The Shielder) constants
export const BOSS2_HEALTH_MULTIPLIER = 4; // Boss2 health = base health * 8 (more health due to shield)
export const BOSS2_MOVE_SPEED = 70; // pixels per second Boss2 movement speed in pixels per second (slower than Boss1)
export const BOSS2_THROW_INTERVAL = 3; // seconds Seconds between brick throws (less frequent than Boss1)
export const BOSS2_THROWN_BRICK_SPEED = 600; // pixels per second Speed of thrown bricks (slower than Boss1)
export const BOSS2_SHIELD_RADIUS_MULTIPLIER = 1.5; // Shield radius = brick width * 1.5
export const BOSS2_SHIELD_SEGMENTS = 3; // Number of shield segments
export const BOSS2_SHIELD_GAP_RADIANS = Math.PI / 3; // Gap between segments (45 degrees)
export const BOSS2_SHIELD_ROTATION_SPEED = Math.PI / 1.3; // Radians per second
export const BOSS2_SHIELD_THICKNESS = 24; // pixels Shield arc thickness in pixels
export const BOSS2_SPAWN_OFFSET_Y = -2; // Spawn offset in brick heights

// Boss3 (The Splitter) constants
export const BOSS3_HEALTH_MULTIPLIER = 5; // Boss3 health = base health * 5
export const BOSS3_MOVE_SPEED = 180; // pixels per second Boss3 movement speed
export const BOSS3_THROW_INTERVAL = 2.0; // seconds Seconds between fragment throws
export const BOSS3_THROWN_BRICK_SPEED = 500; // pixels per second Speed of thrown fragments
export const BOSS3_SPAWN_OFFSET_Y = -2; // Spawn offset in brick heights
export const BOSS3_SPLIT_THRESHOLD = 0.5; // Split when health drops below 50%
export const BOSS3_SPLIT_COUNT = 2; // Number of copies to split into
export const BOSS3_COPY_HEALTH_MULTIPLIER = 0.4; // Each copy has 40% of original max health
export const BOSS3_COPY_SPEED_MULTIPLIER = 1.5; // Copies move 50% faster
export const BOSS3_COPY_SIZE_MULTIPLIER = 0.75; // Copies are 75% of original size

// Boss4 (The Graviton) constants
export const BOSS4_HEALTH_MULTIPLIER = 6;
export const BOSS4_MOVE_SPEED = 200;
export const BOSS4_THROW_INTERVAL = 1.5;
export const BOSS4_THROWN_BRICK_SPEED = 500;
export const BOSS4_SPAWN_OFFSET_Y = -2;
export const BOSS4_GRAVITY_PULL_FORCE = 400; // pixels per second squared
export const BOSS4_GRAVITY_WAVE_INTERVAL = 3.0; // seconds
export const BOSS4_GRAVITY_WAVE_DURATION = 1.0; // seconds

// Boss5 (The Builder) constants
export const BOSS5_HEALTH_MULTIPLIER = 8;
export const BOSS5_MOVE_SPEED = 100;
export const BOSS5_THROW_INTERVAL = 2.0;
export const BOSS5_THROWN_BRICK_SPEED = 550;
export const BOSS5_SPAWN_OFFSET_Y = -2;
export const BOSS5_WALL_SPAWN_INTERVAL = 5.0; // seconds
export const BOSS5_WALL_DURATION = 3.0; // seconds
export const BOSS5_REPAIR_RATE = 5; // health per second
export const BOSS5_REPAIR_DELAY = 3.0; // seconds without taking damage before repair starts

// Boss6 (The Specter) constants
export const BOSS6_HEALTH_MULTIPLIER = 5;
export const BOSS6_MOVE_SPEED = 250;
export const BOSS6_THROW_INTERVAL = 1.2;
export const BOSS6_THROWN_BRICK_SPEED = 600;
export const BOSS6_SPAWN_OFFSET_Y = -2;
export const BOSS6_PHASE_INTERVAL = 4.0; // seconds
export const BOSS6_PHASE_DURATION = 1.5; // seconds
export const BOSS6_TELEPORT_COOLDOWN = 3.0; // seconds
export const BOSS6_ILLUSION_CHANCE = 0.3; // 30% chance to spawn illusion on teleport

