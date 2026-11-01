# AGENTS.MD - Autonomous Agent Architecture Guidelines for NOVA OS

This specification details strict conventions, operational guardrails, and architectural patterns that every AI Agent operating on NOVA OS must uphold.

---

## 1. Core Operating Principles

1. **Verify First, Edit Second**: Inspect package dependencies (`package.json`), TypeScript configurations (`tsconfig.json`), and existing stores before introducing new packages or abstractions.
2. **Preserve Working Features**: Never replace established modules with generic templates. Respect existing UI styling, component hierarchies, and sound effects services.
3. **Atomic Verification**: Always verify changes by running `npm test` and `npm run build` after completing modifications.

---

## 2. Window Manager Event Delegation

When working with `WindowFrame.tsx` and `WindowControls.tsx`:
- The titlebar implements pointer capture (`setPointerCapture`) for window dragging across the entire viewport.
- Any child interactive element inside the titlebar (Close, Minimize, Maximize buttons, tabs, menu items) **must** halt pointer capture by:
  - Invoking `e.stopPropagation()` on `onPointerDown`, `onMouseDown`, `onPointerUp`, and `onDoubleClick`.
  - Checking `if (target.closest('button, [data-window-controls]')) return` in the titlebar's pointerdown handler.

---

## 3. Dynamic Wallpapers & The Fallback Contract

Every wallpaper defined in `src/core/settings/wallpapers.ts` must satisfy:
```typescript
export interface Wallpaper {
  id: string
  name: string
  type: 'gradient' | 'dynamic' | 'custom'
  thumbnail: string
  style: string
  fallbackColor?: string // Mandatory solid hex fallback (e.g. '#090919')
}
```
In `Desktop.tsx`, desktop backgrounds must apply:
- `backgroundColor: activeWallpaper.fallbackColor || '#09090b'`
- `backgroundImage: activeWallpaper.style`
This ensures that even during slow asset loads, CSS parsing quirks, or invalid custom URLs, the screen **never** renders as pure black.

---

## 4. Application Registration Lifecycle

To register a new native application:
1. Implement the React functional component in `src/apps/<AppName>/<AppName>App.tsx` implementing `AppInstanceProps`.
2. Add the unique identifier to `AppId` in `src/types/index.ts`.
3. Register metadata, default dimensions, icons, and component in `src/core/appRegistry/apps.config.ts`.
4. If the application should appear in the primary Dock, include it in `DOCK_APP_IDS` in `src/components/Dock/Dock.tsx`.

---

## 5. Three.js WebGL Resource Cleanup

All 3D applications (e.g. `MarbleRunner3D`, `SpaceTunnel3D`, `VoxelIsland3D`) must clean up resources inside their `useEffect` return hook:
```typescript
return () => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', handleResize)
  renderer.dispose()
  if (container.contains(renderer.domElement)) {
    container.removeChild(renderer.domElement)
  }
}
```
Failing to dispose renderers and cancel animation frames causes GPU memory leaks and WebGL context loss.

---

## 6. Controlled Tool Registry & Safety Architecture

For any autonomous agents extending NOVA OS automation or NOVA AI:
1. **No Arbitrary Code Execution**: Tools in `src/core/assistant/tools/toolRegistry.ts` must execute strictly through typed functions.
2. **Destructive Tool Guardrails**: Any tool modifying or deleting user data (`delete_file`, `reset_settings`) must declare `isDestructive: true`, requiring explicit user interaction before execution.
3. **Hardware Grounding**: Never fabricate fake host metrics (e.g. fake CPU frequencies or host operating system RAM). Query real browser APIs (`performance.now()`, `PerformanceObserver`, `performance.memory`, `navigator.storage.estimate()`, WebGL context parameters) and handle missing browser features gracefully with typed fallbacks.
4. **Package Integrity**: All custom themes and packages imported via Customization Center must be validated against JSON schemas and cryptographically verified using `crypto.subtle.digest('SHA-256')`. Dynamic JavaScript execution (`eval`, `Function`, script tags) inside packages is strictly forbidden.
