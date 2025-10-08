# Upgrade Tree Visual Design
**Dystopian Aesthetic Planning Document**

## Overview

Between levels, players enter the **UPGRADE NEXUS** - a dystopian skill tree interface where they spend upgrade points earned from completing levels. The tree maintains the previous level's background (frozen game state) with a dark overlay, creating an oppressive, industrial atmosphere.

---

## Core Mechanics

### Point System
- **50 upgrade points** awarded per level completion
- Points persist across the session
- Unspent points carry forward to next upgrade screen
- Display: `POINTS AVAILABLE: [XX]` in top-right corner

### Upgrade Structure
Each upgrade node has:
- **name**: Displayed prominently in the box
- **description**: Shown when unlocked/active
- **times**: Maximum number of times it can be upgraded (0 = one-time unlock)
- **previewNextUpgrades**: How many times to upgrade before seeing child nodes (greyed out)
- **unlockNextUpgradesAfterTimes**: How many times to upgrade before child nodes become active
- **nextUpgrades[]**: Array of child upgrade nodes

### Interaction Flow
1. **Locked State**: Node not visible (parent not upgraded enough)
2. **Preview State**: Greyed out box with name only (no description)
   - Triggered when parent reaches `previewNextUpgrades` threshold
3. **Unlocked State**: Full color with name + description
   - Triggered when parent reaches `unlockNextUpgradesAfterTimes` threshold
4. **Upgraded State**: Visual indicator showing current level (e.g., "3/3")
5. **Maxed State**: Different visual treatment when fully upgraded

---

## Visual Design - Dystopian Industrial

### Color Palette
```
Background Overlay: rgba(0, 0, 0, 0.85) - Heavy dark overlay
Primary Accent: #00FFFF (Cyan) - Neon glow for active elements
Secondary Accent: #FF00FF (Magenta) - Warnings, maxed upgrades
Locked/Preview: #333333 (Dark grey) - Inactive nodes
Border Active: #00FFFF with glow
Border Preview: #555555 (no glow)
Text Primary: #FFFFFF (White)
Text Secondary: #AAAAAA (Light grey)
Text Locked: #666666 (Dark grey)
Warning Red: #FF0000 - Insufficient points
```

### Typography
- **Font**: D Day Stencil (existing game font)
- **Node Title**: 18px, bold, uppercase
- **Description**: 12px, regular
- **Point Counter**: 24px, bold
- **Upgrade Counter**: 14px (e.g., "2/3")

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  UPGRADE NEXUS                    POINTS AVAILABLE: [50]    │
│                                   [CONTINUE] (Space/Enter)  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Previous Level Background - Darkened & Blurred]           │
│                                                              │
│              ┌──────────┐                                   │
│              │  ROOT 1  │                                   │
│              │  [0/3]   │                                   │
│              └────┬─────┘                                   │
│                   │                                         │
│              ┌────┴────┐                                    │
│              │         │                                    │
│         ┌────┴───┐ ┌───┴────┐                              │
│         │CHILD 1A│ │CHILD 1B│  (Greyed - Preview)          │
│         │ [2/3]  │ │ [0/1]  │                              │
│         └────┬───┘ └────────┘                              │
│              │                                              │
│         ┌────┴─────┐                                        │
│         │GRANDCHILD│                                        │
│         │   1A1    │                                        │
│         └──────────┘                                        │
│                                                              │
│              ┌──────────┐                                   │
│              │  ROOT 2  │                                   │
│              │  [1/3]   │                                   │
│              └──────────┘                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Node Design Specifications

### Active/Unlocked Node
```
┌─────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← Cyan neon glow (blur: 8px)
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃  BAT WIDTH INCREASE       ┃ │ ← Title (18px, uppercase)
│ ┃  [2/3]                    ┃ │ ← Progress indicator
│ ┃                           ┃ │
│ ┃  Increase bat width by    ┃ │ ← Description (12px)
│ ┃  10% per upgrade          ┃ │
│ ┃                           ┃ │
│ ┃  COST: 1 POINT            ┃ │ ← Cost (bold)
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────┘
```

**Dimensions**: 280px wide × 140px tall
**Border**: 3px solid cyan (#00FFFF)
**Background**: rgba(0, 20, 20, 0.9) - Dark teal tint
**Shadow**: 0 0 20px rgba(0, 255, 255, 0.5) - Cyan glow
**Padding**: 15px

### Preview Node (Greyed Out)
```
┌─────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃  BAT SHOOTER              ┃ │ ← Title only
│ ┃  [0/1]                    ┃ │
│ ┃                           ┃ │
│ ┃  ???                      ┃ │ ← Hidden description
│ ┃                           ┃ │
│ ┃  LOCKED                   ┃ │ ← Lock indicator
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────┘
```

**Border**: 2px solid #555555 (no glow)
**Background**: rgba(20, 20, 20, 0.8) - Very dark
**Text Color**: #666666 (dark grey)
**Opacity**: 0.6

### Maxed Out Node
```
┌─────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← Magenta glow
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃  BAT WIDTH INCREASE       ┃ │
│ ┃  [3/3] ✓ MAXED           ┃ │ ← Checkmark indicator
│ ┃                           ┃ │
│ ┃  Increase bat width by    ┃ │
│ ┃  10% per upgrade          ┃ │
│ ┃                           ┃ │
│ ┃  FULLY UPGRADED           ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────┘
```

**Border**: 3px solid magenta (#FF00FF)
**Shadow**: 0 0 20px rgba(255, 0, 255, 0.5) - Magenta glow
**Background**: rgba(20, 0, 20, 0.9) - Dark magenta tint

### Insufficient Points (Hover State)
When hovering over an active node but lacking points:
- **Border pulses red** (#FF0000)
- **Text flashes**: "INSUFFICIENT POINTS"
- **Shake animation**: 2px horizontal shake

---

## Connection Lines

### Active Connection (Parent → Unlocked Child)
- **Color**: Cyan (#00FFFF)
- **Width**: 3px
- **Style**: Solid line
- **Glow**: 0 0 10px rgba(0, 255, 255, 0.6)
- **Animation**: Subtle pulse (0.8 - 1.0 opacity, 2s cycle)

### Preview Connection (Parent → Preview Child)
- **Color**: Dark grey (#555555)
- **Width**: 2px
- **Style**: Dashed line (5px dash, 5px gap)
- **No glow**

### Line Drawing
- Vertical lines from parent center-bottom to child center-top
- For multiple children: branch out with 45° angles, then vertical

---

## Tree Layout Algorithm

### Positioning Strategy
1. **Root nodes**: Positioned in columns at top of screen
   - Start Y: 120px (below header)
   - Spacing: 320px horizontal between roots
   - Center horizontally if fewer than 3 roots

2. **Child nodes**: Positioned below parent
   - Vertical spacing: 180px between levels
   - Horizontal offset: ±160px for siblings (if multiple children)
   - Single child: directly below parent (centered)

3. **Scrolling**: If tree exceeds viewport height
   - Vertical scroll enabled
   - Scroll indicator on right edge
   - Mouse wheel + arrow keys

### Example Layout (2 Root Trees)
```
         ROOT 1              ROOT 2
           │                   │
      ┌────┴────┐         ┌────┴────┐
   CHILD 1A  CHILD 1B   CHILD 2A  CHILD 2B
      │                      │
   GRANDCHILD 1A1       GRANDCHILD 2A1
```

---

## Interaction & Animation

### Click/Tap Interaction
1. **Click on active node** (with sufficient points):
   - Deduct 1 point from available pool
   - Increment upgrade counter (e.g., [2/3] → [3/3])
   - **Flash animation**: White flash (0.2s)
   - **Scale animation**: Scale 1.0 → 1.1 → 1.0 (0.3s)
   - **Sound effect**: Metallic "clunk" (dystopian)
   - Update child nodes if thresholds reached

2. **Click on preview/locked node**:
   - Shake animation (5px, 0.2s)
   - Display tooltip: "UPGRADE [PARENT NAME] TO UNLOCK"
   - Red border flash (0.3s)

3. **Click on maxed node**:
   - No action
   - Subtle pulse animation (acknowledgment)

### Hover States
- **Active node**: Border brightens, glow intensifies
- **Preview node**: Slight opacity increase (0.6 → 0.7)
- **Maxed node**: Magenta glow intensifies
- **Cursor**: Changes to pointer on active nodes

### Unlock Animation
When a child node transitions from preview → unlocked:
1. **Fade in description** (0.5s)
2. **Border color transition**: Grey → Cyan (0.5s)
3. **Glow fade in** (0.5s)
4. **Connection line animates**: Dashed → Solid (0.5s)
5. **Sound effect**: Electronic "unlock" sound

### Preview Reveal Animation
When a child node becomes visible (preview state):
1. **Fade in from transparent** (0.4s)
2. **Scale from 0.8 → 1.0** (0.4s)
3. **Connection line draws**: Top to bottom (0.4s)

---

## Header & Footer UI

### Header (Top Bar)
```
┌─────────────────────────────────────────────────────────────┐
│  UPGRADE NEXUS                    POINTS AVAILABLE: [50]    │
│  LEVEL 1 COMPLETE                 [CONTINUE] (Space/Enter)  │
└─────────────────────────────────────────────────────────────┘
```

- **Height**: 80px
- **Background**: rgba(0, 0, 0, 0.95) - Nearly opaque
- **Border Bottom**: 2px solid cyan with glow
- **Title**: 32px, left-aligned (20px padding)
- **Points**: 24px, right-aligned (20px padding)
- **Continue Button**: 
  - Position: Top-right corner
  - Size: 150px × 40px
  - Style: Cyan border, hover glow
  - Keyboard shortcut displayed

### Footer (Optional - Help Text)
```
┌─────────────────────────────────────────────────────────────┐
│  CLICK NODE TO UPGRADE • SPACE/ENTER TO CONTINUE            │
└─────────────────────────────────────────────────────────────┘
```

- **Height**: 40px
- **Background**: rgba(0, 0, 0, 0.9)
- **Text**: 12px, centered, grey (#AAAAAA)
- **Border Top**: 1px solid #333333

---

## Responsive Considerations

### Canvas Size
- **Minimum**: 1024×768
- **Recommended**: 1920×1080
- **Scaling**: Nodes scale proportionally with canvas size
- **Font sizes**: Scale with canvas width (relative units)

### Tree Overflow
- **Max visible height**: Canvas height - 200px (header + footer)
- **Scroll behavior**: Smooth scroll with momentum
- **Scroll indicators**: Fade in/out arrows at top/bottom

---

## Accessibility & UX

### Keyboard Navigation
- **Tab**: Navigate between nodes (top to bottom, left to right)
- **Enter/Space**: Upgrade selected node
- **Arrow Keys**: Scroll tree (if overflow)
- **Escape**: Close upgrade screen (if points spent)
- **C**: Continue to next level

### Visual Feedback
- **Selected node**: Thick cyan outline (5px)
- **Hover tooltip**: Shows full description + cost
- **Point counter**: Flashes red when attempting upgrade without points
- **Progress indicator**: Always visible on each node

### Error States
- **Insufficient points**: Red flash + shake + message
- **Locked node**: Tooltip explaining unlock requirement
- **Network/save error**: Red banner at top with retry button

---

## Technical Implementation Notes

### Rendering Layers (Back to Front)
1. **Background**: Previous level (frozen, darkened, blurred)
2. **Overlay**: Dark semi-transparent layer (rgba(0, 0, 0, 0.85))
3. **Connection Lines**: Drawn first (behind nodes)
4. **Nodes**: Upgrade boxes with borders and glows
5. **Text**: Node titles, descriptions, counters
6. **UI Elements**: Header, footer, buttons
7. **Tooltips**: Hover tooltips (top layer)

### Performance Optimizations
- **Render only visible nodes**: Cull nodes outside viewport
- **Cache node positions**: Recalculate only on resize
- **Batch draw calls**: Group similar elements
- **Limit particle effects**: Max 50 particles on screen

### Data Structure
```typescript
interface UpgradeNode {
  upgrade: Upgrade;           // From config
  currentLevel: number;       // 0 to upgrade.times
  state: 'locked' | 'preview' | 'unlocked' | 'maxed';
  position: { x: number; y: number };
  children: UpgradeNode[];
  parent: UpgradeNode | null;
}

interface UpgradeTreeState {
  rootNodes: UpgradeNode[];
  availablePoints: number;
  selectedNode: UpgradeNode | null;
  scrollOffset: number;
}
```

---

## Animation Timing Reference

| Event | Duration | Easing |
|-------|----------|--------|
| Node click flash | 0.2s | Linear |
| Node scale on upgrade | 0.3s | Ease-out-back |
| Unlock transition | 0.5s | Ease-in-out |
| Preview reveal | 0.4s | Ease-out |
| Connection line draw | 0.4s | Ease-in-out |
| Hover glow intensify | 0.2s | Ease-out |
| Shake on error | 0.2s | Ease-in-out |
| Line pulse cycle | 2.0s | Sine wave |

---

## Sound Design (Future Phase)

### Sound Effects
- **Upgrade purchased**: Metallic clunk (0.3s)
- **Node unlocked**: Electronic unlock (0.5s)
- **Preview revealed**: Subtle beep (0.2s)
- **Insufficient points**: Error buzz (0.3s)
- **Continue button**: Confirmation beep (0.2s)
- **Hover node**: Subtle tick (0.1s)

### Ambient Audio
- **Background**: Low industrial hum (looped)
- **Upgrade screen entry**: Whoosh transition (1.0s)
- **Upgrade screen exit**: Reverse whoosh (1.0s)

---

## Example Upgrade Tree (First 3 Levels)

```
                    BAT WIDTH +10%
                         [0/3]
                           │
                    ┌──────┴──────┐
                    │             │
              BAT SHOOTER    BAT SPEED +10%
                 [0/1]          [0/3]
                    │
              BAT SHOOTER +10%
                 [0/3]


                  BALL DAMAGE +1
                      [0/3]
                        │
                  ┌─────┴─────┐
                  │           │
            BALL PIERCING   BALL SPEED -10%
               [0/1]          [0/3]
                  │
            PIERCING +10%
               [0/3]
```

---

## Testing Checklist

### Visual Tests
- [ ] All node states render correctly (locked, preview, unlocked, maxed)
- [ ] Connection lines draw properly for all tree structures
- [ ] Glow effects don't overlap incorrectly
- [ ] Text is readable at all canvas sizes
- [ ] Animations are smooth at 60 FPS

### Interaction Tests
- [ ] Clicking active node deducts points and upgrades
- [ ] Clicking locked/preview node shows error
- [ ] Hover states work on all nodes
- [ ] Keyboard navigation works correctly
- [ ] Continue button works (Space/Enter/Click)

### Logic Tests
- [ ] Preview threshold triggers correctly
- [ ] Unlock threshold triggers correctly
- [ ] Points deduct and persist correctly
- [ ] Maxed nodes can't be upgraded further
- [ ] Tree state saves between levels

### Edge Cases
- [ ] 50+ upgrades render without performance issues
- [ ] Deep trees (5+ levels) scroll correctly
- [ ] Multiple children (3+) position correctly
- [ ] Zero points available (can only continue)
- [ ] All upgrades maxed (no more actions)

---

## Implementation Priority

### Phase 1: Core Structure
1. UpgradeTreeScreen class
2. Node rendering (active state only)
3. Basic layout algorithm (single column)
4. Click to upgrade (point deduction)

### Phase 2: State Management
1. Preview state rendering
2. Locked state handling
3. Unlock/preview threshold logic
4. Connection line drawing

### Phase 3: Visual Polish
1. Glow effects and borders
2. Hover states
3. Animations (click, unlock, preview)
4. Maxed state styling

### Phase 4: UX Enhancements
1. Keyboard navigation
2. Tooltips
3. Error states
4. Scroll handling (if needed)

### Phase 5: Integration
1. Level completion → Upgrade screen transition
2. Upgrade screen → Next level transition
3. Upgrade persistence across levels
4. Save/load upgrade state

---

## Open Questions for Implementation

1. **Tree Layout**: Should we support horizontal branching or keep it strictly vertical?
   - **Recommendation**: Vertical only for simplicity, horizontal offset for siblings

2. **Point Refund**: Can players refund upgrades?
   - **Recommendation**: No refunds (permanent choices, dystopian theme)

3. **Upgrade Preview**: Should preview nodes show cost?
   - **Recommendation**: No, only show "LOCKED" to maintain mystery

4. **Multiple Roots**: How many root upgrade trees?
   - **Recommendation**: Start with 2-3, expand to 5-6 as more upgrades added

5. **Upgrade Persistence**: Do upgrades persist after game over?
   - **Recommendation**: No, fresh start on game over (roguelike style)

6. **Skip Upgrade Screen**: Can players skip without spending points?
   - **Recommendation**: Yes, allow continue with unspent points

---

## Visual Mockup ASCII Art

```
╔═══════════════════════════════════════════════════════════════════════╗
║  UPGRADE NEXUS                            POINTS AVAILABLE: [50]      ║
║  LEVEL 1 COMPLETE                         [CONTINUE] (Space/Enter)    ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  [████████████████ DARKENED GAME BACKGROUND ████████████████████]    ║
║                                                                        ║
║         ╔═══════════════════╗              ╔═══════════════════╗     ║
║         ║ BAT WIDTH +10%    ║              ║ BALL DAMAGE +1    ║     ║
║    ░░░░ ║ [0/3]             ║ ░░░░    ░░░░ ║ [0/3]             ║ ░░░ ║
║    ░░░░ ║                   ║ ░░░░    ░░░░ ║                   ║ ░░░ ║
║    ░░░░ ║ Increase bat      ║ ░░░░    ░░░░ ║ Increase ball     ║ ░░░ ║
║    ░░░░ ║ width by 10%      ║ ░░░░    ░░░░ ║ damage by 1       ║ ░░░ ║
║    ░░░░ ║                   ║ ░░░░    ░░░░ ║                   ║ ░░░ ║
║    ░░░░ ║ COST: 1 POINT     ║ ░░░░    ░░░░ ║ COST: 1 POINT     ║ ░░░ ║
║         ╚═════════╦═════════╝              ╚═════════╦═════════╝     ║
║                   ║                                  ║                ║
║              ┌────╨────┐                        ┌────╨────┐          ║
║              │         │                        │         │          ║
║         ╔════╧════╗ ╔══╧═══════╗          ╔════╧════╗ ╔══╧═══════╗  ║
║         ║ SHOOTER ║ ║ SPEED +  ║          ║ PIERCING║ ║ SPEED -  ║  ║
║         ║ [0/1]   ║ ║ [0/3]    ║          ║ [0/1]   ║ ║ [0/3]    ║  ║
║         ║         ║ ║          ║          ║         ║ ║          ║  ║
║         ║ ???     ║ ║ ???      ║          ║ ???     ║ ║ ???      ║  ║
║         ║         ║ ║          ║          ║         ║ ║          ║  ║
║         ║ LOCKED  ║ ║ LOCKED   ║          ║ LOCKED  ║ ║ LOCKED   ║  ║
║         ╚═════════╝ ╚══════════╝          ╚═════════╝ ╚══════════╝  ║
║                                                                        ║
╠═══════════════════════════════════════════════════════════════════════╣
║  CLICK NODE TO UPGRADE • SPACE/ENTER TO CONTINUE                      ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## Conclusion

This dystopian upgrade tree design creates an oppressive, industrial atmosphere while maintaining clear usability. The neon cyan/magenta color scheme, heavy shadows, and glow effects reinforce the aesthetic established in the main game. The hierarchical tree structure with preview/unlock mechanics encourages strategic planning and creates a sense of progression.

**Next Steps**: 
1. Review and approve visual design
2. Begin Phase 1 implementation (core structure)
3. Design individual upgrade effects (separate document)
4. Create upgrade balance spreadsheet (50+ upgrades)
