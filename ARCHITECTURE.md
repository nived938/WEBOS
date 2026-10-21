# ARCHITECTURE.md - System Architecture Specification for NOVA OS

This document details the architectural principles, component topologies, data flow lifecycles, and state management mechanisms governing NOVA OS.

---

## 1. High-Level Architectural Model

NOVA OS operates as a **client-side micro-kernel simulation** hosted within a modern Web platform environment. Rather than replacing the underlying OS, it simulates the abstractions of a Unix/macOS desktop environment within browser constraints.

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  - Desktop Canvas & Drag Selection                          │
│  - Top Menu Bar & Control Center Flyouts                    │
│  - Proportional Magnification Dock                          │
│  - Draggable & Resizable Window Frames                      │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
│  - 50+ Native Web Apps & Tools                              │
│  - 3D Three.js Hardware-Accelerated Games                   │
│  - Sandboxed Code Execution Environments                    │
├─────────────────────────────────────────────────────────────┤
│                    Kernel & Core Services                   │
│  - WindowManagerContext (Geometry, z-index, Focus, Snapping)│
│  - FileSystemContext (In-Memory VFS, Serialization)         │
│  - SettingsContext / Store (Appearance, Wallpapers, Theme)  │
│  - SoundService (WebAudio Oscillators & Noise Generators)   │
│  - AppRegistry (Discovery, Metadata, Category Indexing)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Window Manager Subsystem

### State Representation
The window state is maintained centrally in `WindowContext`:
```typescript
export interface WindowInstance {
  id: string
  appId: AppId
  title: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  isMinimized: boolean
  isMaximized: boolean
  isFocused: boolean
  prevGeometry?: { x: number; y: number; width: number; height: number }
}
```

### Event Isolation Architecture
To prevent drag interference:
- Window dragging uses pointer capture (`e.currentTarget.setPointerCapture(e.pointerId)`).
- All interactive controls inside the window titlebar (traffic lights, buttons, menus) explicitly invoke `e.stopPropagation()` on `onPointerDown`, `onMouseDown`, `onPointerUp`, and `onDoubleClick`.
- `WindowFrame.tsx` verifies that the pointer target does not match `button, [data-window-controls]` before initiating a drag sequence.

---

## 3. Dynamic Wallpaper Engine & Fallback Pipeline

### Problem Solved
Early prototypes suffered from black screens when switching wallpapers due to missing image references, shorthand CSS overrides (`background:` vs `backgroundImage:`), or broken custom URLs.

### Architectural Solution
1. **Separation of Layers**:
   - `backgroundColor`: Set to an immutable, solid hex color (`fallbackColor`).
   - `backgroundImage`: Set to the CSS gradient string or URL.
2. **Preloading Gate**:
   - Image wallpapers are loaded asynchronously via an offscreen `new Image()`.
   - The desktop background only transitions once the image triggers `onload`. If `onerror` fires, the desktop remains on its fallback gradient and triggers an audio notification.

---

## 4. Virtual File System (VFS)

The VFS provides a Unix-like directory hierarchy:
- `/Users/guest/Desktop`
- `/Users/guest/Documents`
- `/Users/guest/Downloads`
- `/Users/guest/Pictures`
- `/Users/guest/Music`
- `/Users/guest/Trash`

### Characteristics
- Rooted in an in-memory n-ary tree with unique string node IDs.
- Autosaves to `localStorage['nova_vfs_data']` upon mutation.
- Protected nodes (system root `/`, user home directory) cannot be deleted.

---

## 5. WebAudio Synthesizer Engine

All user feedback sounds (clicks, window opening swooshes, notification chimes, keyboard sounds, drum pads) are generated procedurally using the Web Audio API (`AudioContext`):
- **Zero Network Assets**: No `.mp3` or `.wav` dependencies required.
- **Microsecond Latency**: Direct oscillator invocation via `setValueAtTime` and `exponentialRampToValueAtTime`.

---

## 6. Three.js 3D Graphics Integration

3D Games (`MarbleRunner3D`, `SpaceTunnel3D`, `VoxelIsland3D`) render via dedicated WebGL 2.0 canvases:
- **Perspective Projection**: Dynamically recalculated upon window resize.
- **Hardware Acceleration**: GPU antialiasing, soft shadows (`PCFSoftShadowMap`), and fog effects.
- **Lifecycle Management**: Renderers and animation frames are disposed when windows close, preventing WebGL context exhaustion.
