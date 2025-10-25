# Brick Rendering Performance Optimization

## Problem Identified

Level 5 experienced significant performance issues during gameplay, even before hitting any bricks. The issue was traced to the `Brick.render()` method which was performing expensive canvas operations for every brick on every frame.

### Root Cause

Each brick was creating:
- **New linear gradients** (3 color stops)
- **Complex rounded rectangle paths** (2 per brick - outer and inner)
- **Shadow blur effects**
- **Color manipulation calculations** (lighten/darken)
- **Text rendering with font operations**

**With 65 bricks in Level 5 at 60 FPS:**
- 3,900 gradient creations per second
- 7,800 path operations per second
- 3,900 color calculations per second

This resulted in O(n × complexity) rendering cost where n = number of bricks.

## Solution Implemented

### Brick Render Caching

Implemented a static cache system that pre-renders each unique brick appearance to an offscreen canvas and reuses it:

1. **Cache Key Generation**: Each brick generates a unique key based on:
   - Color
   - Health value (displayed text)
   - Indestructible status

2. **Lazy Rendering**: On first render of a brick appearance:
   - Create offscreen canvas
   - Render full brick with all effects
   - Store in static cache Map

3. **Fast Blitting**: On subsequent renders:
   - Lookup cached canvas
   - Simple `drawImage()` operation
   - Apply opacity based on health

### Performance Improvement

- **Before**: O(n × complexity) - full render for each brick
- **After**: O(n × blit) - simple image copy for each brick
- **Expected speedup**: 10-20x faster rendering for levels with many bricks

### Cache Management

- Cache is cleared when loading new levels (prevents memory buildup)
- Can be disabled via `Brick.setRenderCacheEnabled(false)` if needed
- Cache is shared across all brick instances (static)

## Files Modified

- `src/renderer/game/entities/Brick.ts`
  - Added static `renderCache` Map
  - Added `getCacheKey()` method
  - Added `renderToCache()` method
  - Added `clearRenderCache()` static method
  - Modified `render()` to use cache

- `src/renderer/game/core/Game.ts`
  - Added Brick import
  - Clear cache in `loadLevel()` method

## Testing Recommendations

1. Test Level 5 performance - should be smooth now
2. Verify brick appearance is unchanged
3. Test level transitions to ensure cache clears properly
4. Monitor memory usage across multiple level loads
