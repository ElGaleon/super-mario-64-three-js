# Super Mario 64 Mirror Room - Three.js

Three.js/Vite project inspired by the mirror room from Super Mario 64. The scene includes an animated Mario model, a custom mirror-room environment, reflective surfaces, lights, bump maps, keyboard controls, collision handling, and an optional debug interface.

## Requirements

- Node.js
- npm

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Then open the URL printed by Vite, usually:

```text
http://localhost:5173/
```

## Build

```bash
npm run build
```

The build runs TypeScript first and then creates the static Vite output.

## Controls

| Key | Action |
| --- | --- |
| W A S D | Move Mario relative to the camera |
| R | Toggle run/walk |
| Space | Jump |
| Arrow Down | Slide |
| M | Moonwalk |
| B | Dance |
| G | Show/hide debug GUI and FPS |
| Mouse | Rotate the camera |
| Double click on canvas | Toggle fullscreen |

The controls legend is visible in the app and can be expanded or collapsed.

## Main Features

- OBJ/MTL mirror-room loading.
- GLB Mario model loading with animations.
- Camera-relative movement with OrbitControls.
- Room-boundary collision.
- Collision with the internal marble blocks.
- Smoother transitions between main animation states.
- One-shot animations that are allowed to finish before returning to the base movement state.
- Loading screen with asset progress.
- Super Mario 64 logo during loading.
- Expandable Mirror Room information panel with a reference video link.
- Debug GUI and FPS stats hidden by default and toggled with `G`.
- Centralized command configuration in `src/input.ts`, reused by input handling and the on-screen legend.
- Smoothed camera target following Mario.
- Mirrors implemented with `Reflector`.

## Asset Notes

- The mirror room was created in Blender and exported for use in the Three.js scene.
- The Mario model was downloaded online and imported as a GLB asset.
- Texture and model files are loaded from the `assets/` folder. If assets are renamed or moved, update their paths in `src/objects.ts`.

## Structure

```text
src/
  scene.ts                      Scene, renderer, GUI, input, loading UI, and loop setup
  input.ts                      Shared command configuration
  videoReference.ts             Mirror Room video reference metadata
  controls.ts                   Camera and OrbitControls setup
  objects.ts                    Room, mirror, and Mario loading
  lights.ts                     Scene lighting
  helpers/
    characterControls.ts        Movement, animation, and collision logic
    fullscreen.ts               Fullscreen toggle
    helpers.ts                  Visual helpers
    responsiveness.ts           Renderer resize handling
  types/
    three-local.d.ts            Minimal local types for the Three.js entrypoints used here
```

## Possible Improvements

- More precise collisions: generate colliders from scene meshes or use a lightweight physics library.
- More cinematic camera: add distance constraints and better wall-aware camera behavior.
- Cleaner architecture: split input, animation, collision, loading, and UI into smaller modules.
- More advanced one-shot animation events: chain actions and avoid unwanted loops while a key remains pressed.
- Audio: footsteps, jump sounds, collision sounds, and room ambience.
- Bundle optimization: code splitting or lazy loading for heavier 3D assets.
- Stronger Three.js typings: align dependencies and type packages around a single stable version.
- Mobile controls: touch joystick, action buttons, and mobile-specific legend layout.

## Reference

Mirror Room reference video: https://www.youtube.com/watch?v=fimWktqAC7s
