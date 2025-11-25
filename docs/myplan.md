# My PLan

Just some notes about future features so that I don't forget

## Future Features

- [] new special bricks
    - [X] Multi-ball
    - [X] 15 second piercing
    - [] make explosive brick much more damaging and wider
- [] more upgrades
    - [X] super stats
    - [] multi-ball
    - [] super stats should also increase ball damage
- [] multi-lasers that hit the same brick should show damage per laser - this is about moving the damage above the block to a horizontal position where the damage was taken
- [X] 0.0 brick health should destroy brick
- [X] Final boss spawned blocks do not damage bat (the thrown bricks do damage bat as expected)
- [?] Greyed out ball should reset to normal ball if it hits the edge or top of the screen (as well as the other current resets)
- [] Quit buttons no longer work
- [X] achievements screen should implement a scroll pane
- [X] Add a tutorial screen on level 1 start with gameplay instructions and OK button
- [X] Make the leaderboards permanent, explain where you are going to store the data
- [X] There is special animation when the last brick of the level is destroyed, make this the last *destructible* brick that dies, not necessarily the last brick in the level
- [X] update brick colours
- [X] check coverage of non-ui components, recommend useful tests that can be added
- [X] Add base health to each level in the config
- [X] Indestructible bricks
- [X] space out the bosses every 3 levels
- [] create more bosses
    - [X] Boss3: "The Splitter"
        * Core mechanic: When damaged below 50% health, splits into 2-3 smaller copies
        * Attacks: Each copy fires splitting fragments in different patterns
        * Movement: Smaller copies move faster and more erratically
        * Unique feature: Must destroy all copies to win; they can't regenerate
        * Visual: Purple/magenta with a cracked appearance when splitting
    - [] Boss4: "The Bomber"
        * Core mechanic: Throws bombs at the bat
        * Attacks: Throws bombs at the bat
        * Movement: Fast movement
        * Unique feature: Bombs explode on impact
        * Visual: Orange with a firey appearance
- [] Add many maps
- [X] Test coverage
- [X] Integration tests
- [X] Add a (fake) leaderboard for each level that has quite poor players.
- [X] sticky bat to start and as an upgrade
- [X] piercing should still bounce if it doesn't kill the brick
- [] level orientation (bat doesn't have to be bottom of screen)
- [X] the ball can hit the bottom of the bat
- [X] visual effect to the ball - like a comet tail
- [X] Refactor Game.ts to be more modular, e.g. separate out audio manager, input, etc.
- [] Add loads of Upgrades
    - [X] slower ball
    - [X] piercing can last for extra seconds
    - [X] sticky bat with LR control and preview
    - [] laser bat becomes bomb bat - can only fire once a second but does a large-aoe (2.5 blocks) and medium-damage (2) explosion
    - [X] dual laser upgrade
- [] Change the upgrade tree to be a predetermined layout and more of a wheel and spoke approach
- [X] Report on time taken to complete each level, and show the best time.  More upgrade points for faster level completion?
- [X] move hardcoded values to constants
- [X] use a dictionary and make the game multi-lingual
- [X] Ball speed up mechanics
- [X] Boss bricks: Large multi-segment bricks with special patterns
- [X] Offensive Bricks that would damage the bat (making the bat smaller)
    - [X] Bricks that fall instead of crumbling
    - [X] Bricks that explode and send avoidable debris in 8 different directions
    - [X] Bricks that send a laser directly at the bat upon crumbling
- [] Challenge Modes
    - [] Survival mode: Endless waves with increasing difficulty
    - [] Time attack: Complete level as fast as possible
    - [] One-shot mode: Single life, no re-spawns
    - [] Precision mode: Limited number of ball launches
    - [] Chaos mode: Random modifiers each level
- [X] Slow-mo on level complete: Dramatic final brick destruction
- [] Achievement system: Track milestones (100 bricks destroyed, etc.)

