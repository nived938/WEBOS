# TROUBLESHOOTING.md - Debugging & Diagnostics Guide for NOVA OS

This guide addresses known technical anomalies, edge cases, root cause analyses, and solutions encountered in the development of NOVA OS.

---

## 1. Window Controls Unresponsive in Small Windows

### Symptom
When opening an app in a small or non-maximized window, clicking the red, amber, or green traffic light buttons does not close, minimize, or maximize the window. However, dragging the window to the top of the screen to maximize it causes the buttons to work.

### Root Cause
The window titlebar container had an `onPointerDown` handler that invoked `e.currentTarget.setPointerCapture(e.pointerId)` to initiate window dragging. When clicking a traffic light button in a small window, the pointer capture was acquired by the titlebar before the child button could complete its mouse `click` lifecycle. In maximized mode, dragging was disabled (`if (isMaximized) return;`), so pointer capture was not set and buttons appeared to work.

### Solution
1. In `WindowControls.tsx`, add `e.stopPropagation()` to `onPointerDown`, `onMouseDown`, `onPointerUp`, and `onDoubleClick` across the container and every button.
2. In `WindowFrame.tsx`, add a guard in `handleTitleBarPointerDown`:
   ```typescript
   const target = e.target as HTMLElement
   if (target.closest('button, [data-window-controls]')) return
   ```

---

## 2. Desktop Black Screen When Changing Wallpapers

### Symptom
Selecting certain wallpapers or uploading custom images causes the desktop background to turn completely black.

### Root Cause
The desktop container applied `background: wp.style` alongside `backgroundImage`. When custom images or gradients failed to resolve, the entire background rule cleared, leaving the transparent desktop container exposed over `<body class="bg-neutral-950">`.

### Solution
1. Add an explicit solid `fallbackColor` to every wallpaper in `src/core/settings/wallpapers.ts`.
2. Apply `backgroundColor: activeWallpaper.fallbackColor` and `backgroundImage: activeWallpaper.style` as distinct properties in `Desktop.tsx`.
3. Preload image wallpapers with `new Image()`, keeping the previous valid wallpaper active until the new image finishes loading.

---

## 3. Fast Refresh `$RefreshReg$` Runtime Error

### Symptom
Browser console displays:
```text
Uncaught TypeError: RefreshRuntime.register is not a function
at $RefreshReg$ (SettingsContext.tsx:160:1)
```

### Root Cause
React Fast Refresh instruments files exporting React components. When custom hooks (`useSettings`) or Context instances are exported from a file that also contains JSX components or is named `.tsx`, Fast Refresh tries to register the non-component exports, triggering a runtime exception.

### Solution
Extract hooks, contexts, and pure logic into `.ts` files (e.g. `settingsStore.ts`) that contain no JSX, and import them into component files.

---

## 4. Web Browser Shows Blank Screen on Certain URLs

### Symptom
Entering certain websites (like `google.com` or `github.com`) inside the built-in browser window displays an empty white or gray frame.

### Root Cause
Major websites send HTTP response headers:
- `X-Frame-Options: SAMEORIGIN` or `DENY`
- `Content-Security-Policy: frame-ancestors 'self'`
Modern browsers block `<iframe>` embedding of these websites for clickjacking security.

### Solution
NOVA OS detects iframe loading errors and renders a sleek **In-App Reader View Card** providing:
1. One-click button to open the target site in a dedicated browser tab.
2. Fallback search engine results powered by DuckDuckGo and Wikipedia.

---

## 5. WebGL Context Loss in 3D Games

### Symptom
Launching multiple 3D games concurrently or resizing windows rapidly causes the canvas to go dark with console warning `WebGL: CONTEXT_LOST_WEBGL`.

### Root Cause
Browsers limit the number of active WebGL contexts (typically 8 to 16 per process). Opening many 3D game windows without disposing previous renderers exceeds GPU thresholds.

### Solution
Ensure every Three.js game cleans up its renderer and event listeners when the window unmounts:
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
