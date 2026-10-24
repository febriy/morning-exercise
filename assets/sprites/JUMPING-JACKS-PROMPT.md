# Jumping jacks sprite

Generated with the built-in image generation tool using `dist/sprites/squat.png` as a character and style reference.

## Exact generation prompt

Use case: scientific-educational. Asset type: transparent four-frame 8-bit exercise sprite sheet for an existing personal workout app. The attached squat strip is a STYLE AND CHARACTER REFERENCE ONLY. Create the same friendly thirty-something adult man with short dark hair, light-medium tan skin, forest green T-shirt, bright lime shorts, white trainers and chunky dark pixel outlines, now doing jumping jacks viewed from the FRONT. Exactly FOUR equal square animation cells arranged in ONE horizontal row on a genuinely transparent canvas. Frame 1: standing with feet close together and both arms down. Frame 2: feet partway apart, both arms diagonally outward at shoulder level. Frame 3: feet apart, both arms reaching overhead in a wide V. Frame 4: same halfway pose as frame 2 for the closing motion. Keep identical camera, head size, body scale, character identity and shared ground baseline in all four frames. Full figures including both hands and shoes entirely inside their own square cells with ample transparent space; center each pose on its cell. Simple readable authentic chunky pixel art, crisp pixels, no smooth gradients. No equipment, ground, background, cast shadow, labels, numbers, typography, separators or border. This will loop 1-2-3-4 as a jumping-jacks demonstration, so the progression and alignment must read clearly.

## Derived runtime strip

Source: `jumping-jacks-source.png`, 2172×724 RGBA. Split at x=0,543,1086,1629; crop each to 543×600 at y=65; pad horizontally to 600×600; nearest-neighbor scale to 200×200; join four cells into `dist/sprites/jumping-jacks.png`, 800×200 RGBA. Source transparency and a shared foot baseline are preserved. Both PNGs carry embedded prompt provenance.
