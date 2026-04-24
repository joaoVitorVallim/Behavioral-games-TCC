# Phaser 3 Professional Game Development Instructions

This document establishes the architecture and coding standards for creating high-performance, fluid, and scalable games using the **Phaser 3** framework.

---

## 1. Project Architecture & Modularization
Maintain a strict separation of concerns to ensure the codebase remains maintainable as complexity grows. Use **ES6 Modules** to encapsulate logic.

### Directory Structure
```text
/assets
  /atlases       <-- Packed sprites (JSON + PNG)
  /audio         <-- SFX and background music
/src
  /config        <-- Global settings and game balance
  /prefabs       <-- Custom Game Object classes (Player, Enemy)
  /scenes        <-- Scene-specific logic (Boot, Preload, Play)
  main.js        <-- Entry point and Phaser.Game instance
```

---

## 2. Dynamic Configuration & Flexibility
**Rule:** Never hard-code gameplay values (speed, gravity, colors). Utilize a centralized configuration object to allow for instant balancing.

### Global Game Settings (`src/config/GameData.js`)
```javascript
export const GAME_DATA = {
    SCREEN: {
        WIDTH: 1280,
        HEIGHT: 720,
        CENTER: { x: 640, y: 360 }
    },
    PHYSICS: {
        GRAVITY: 1200,
        ARCADE_DEBUG: false
    },
    PLAYER: {
        MAX_SPEED: 400,
        ACCELERATION: 1200,
        DRAG: 1000,
        JUMP_FORCE: -650,
        ANIM_RATE: 15
    },
    JUICE: {
        TWEEN_SPEED: 250,
        CAM_SHAKE_INTENSITY: 0.015,
        CAM_SHAKE_DURATION: 150
    }
};
```

---

## 3. Creating Fluid User Experience ("Juice")
Fluidity is achieved through responsive input and visual feedback. Use **Tweens** and **Easing** for every state change.

### Animation Best Practices
Define animations globally in a `Boot` or `Preload` scene to avoid memory leaks and redundancy.
```javascript
// Inside PreloadScene or a dedicated Animation Manager
this.anims.create({
    key: 'player_idle',
    frames: this.anims.generateFrameNames('player_atlas', { prefix: 'idle_', end: 5 }),
    frameRate: GAME_DATA.PLAYER.ANIM_RATE,
    repeat: -1
});
```

### Tween Transitions
Always use ease functions (like `Cubic.easeOut` or `Back.easeOut`) to avoid robotic, linear movement.
```javascript
// Example: Fluid UI button interaction
const showUI = (element) => {
    this.tweens.add({
        targets: element,
        y: GAME_DATA.SCREEN.CENTER.y,
        alpha: 1,
        duration: GAME_DATA.JUICE.TWEEN_SPEED,
        ease: 'Cubic.easeOut'
    });
};
```

---

## 4. Performance & Resource Management
To maintain a consistent 60 FPS, optimize how assets and objects are handled.

* **Texture Atlases:** Consolidate multiple images into one file to minimize Draw Calls and HTTP requests.
* **Object Pooling:** Use `Phaser.GameObjects.Group` for recurring elements (bullets, enemies, particles). Deactivate and hide objects instead of destroying them.
* **BitmapText:** For scores or HUD elements that update frequently, use Bitmap fonts. Standard `Text` objects require a canvas re-render for every string update, which is performance-heavy.

---

## 5. Expert Scene Management
Keep logic clean by layering scenes.

1.  **BootScene:** Initialize the Scale Manager (`Phaser.Scale.FIT`) and global systems.
2.  **PreloadScene:** Load all assets once with a visual loading bar.
3.  **PlayScene:** Handle core game logic (input, physics, collisions).
4.  **UIScene:** Run parallel to the `PlayScene`. This keeps the HUD static while the gameplay camera shakes or zooms.

```javascript
// Inside PlayScene
this.scene.launch('UIScene'); 
this.scene.bringToTop('UIScene');
```

---

## 6. Implementation Checklist
- [ ] **Variable Control:** Are all speeds, forces, and colors pulled from `GAME_DATA`?
- [ ] **Asset Optimization:** Are all sprites part of a Texture Atlas?
- [ ] **Fluidity:** Do all UI elements have a tween transition?
- [ ] **Input Handling:** Is player input buffered or handled via a State Machine to prevent "sticky" controls?
- [ ] **Visual Impact:** Does every impact (hit/death/collect) trigger a camera shake or a particle burst?

---

## 7. Further information
- Use the official documentation for consult: https://docs.phaser.io/