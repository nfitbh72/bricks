/**
 * Centralized font style constants for canvas rendering
 * Synchronized with SCSS variables for consistency
 */

// Font families (matching SCSS $font-* variables)
export const FONT_PRIMARY = '"D Day Stencil", Arial';
export const FONT_SECONDARY = '"Population Zero BB", "D Day Stencil", Arial';
export const FONT_MONOSPACE = '"Courier New", monospace';

// Font sizes in pixels (matching SCSS $font-size-* variables)
export const FONT_SIZE_HUGE = 72;
export const FONT_SIZE_XLARGE = 64;
export const FONT_SIZE_LARGE = 48;
export const FONT_SIZE_MEDIUM = 36;
export const FONT_SIZE_NORMAL = 32;
export const FONT_SIZE_SMALL = 28;
export const FONT_SIZE_XSMALL = 24;
export const FONT_SIZE_TINY = 20;
export const FONT_SIZE_MICRO = 18;
export const FONT_SIZE_MINI = 16;
export const FONT_SIZE_BRICK = 12;

// Composite font strings for ctx.font (Primary font)
export const FONT_TITLE_HUGE = `${FONT_SIZE_HUGE}px ${FONT_PRIMARY}`;
export const FONT_TITLE_XLARGE = `${FONT_SIZE_XLARGE}px ${FONT_PRIMARY}`;
export const FONT_TITLE_LARGE = `${FONT_SIZE_LARGE}px ${FONT_PRIMARY}`;
export const FONT_TITLE_MEDIUM = `${FONT_SIZE_MEDIUM}px ${FONT_PRIMARY}`;
export const FONT_TITLE_NORMAL = `${FONT_SIZE_NORMAL}px ${FONT_PRIMARY}`;
export const FONT_TITLE_SMALL = `${FONT_SIZE_SMALL}px ${FONT_PRIMARY}`;
export const FONT_TITLE_XSMALL = `${FONT_SIZE_XSMALL}px ${FONT_PRIMARY}`;

// Secondary font (Population Zero BB)
export const FONT_SECONDARY_LARGE = `${FONT_SIZE_LARGE}px ${FONT_SECONDARY}`;
export const FONT_SECONDARY_TINY = `${FONT_SIZE_TINY}px ${FONT_SECONDARY}`;
export const FONT_SECONDARY_MICRO = `${FONT_SIZE_MICRO}px ${FONT_SECONDARY}`;
export const FONT_SECONDARY_MINI = `${FONT_SIZE_MINI}px ${FONT_SECONDARY}`;

// Monospace font
export const FONT_MONO_BRICK = `${FONT_SIZE_BRICK}px ${FONT_MONOSPACE}`;
export const FONT_MONO_MINI = `${FONT_SIZE_MINI}px ${FONT_MONOSPACE}`;

// Glow blur values (matching SCSS $glow-* variables)
export const GLOW_SMALL = 5;
export const GLOW_MEDIUM = 10;
export const GLOW_NORMAL = 15;
export const GLOW_LARGE = 20;
export const GLOW_XLARGE = 30;
export const GLOW_HUGE = 40;
