# AGY.MD - Antigravity Autonomous Workflow Guide for NOVA OS

Welcome to the Antigravity operating guide for **NOVA OS (WEBOS)**. This document establishes guidelines, operational procedures, command cheat sheets, and architectural constraints for AI agents and developers operating in Antigravity.

---

## 1. Project Overview & Identity

- **Project Name:** NOVA OS
- **Repository:** `https://github.com/nived938/WEBOS.git`
- **Core Stack:** Vite 8.3+, React 19.3+, TypeScript 5.8+, Tailwind CSS v4.3+, Three.js WebGL 3D, Lucide Icons
- **Mission:** Deliver a responsive, elegant, browser-based desktop operating system inspired by the fluidity, glassmorphism, and natural interaction patterns of macOS and modern desktop computing.

---

## 2. Environment & CLI Cheatsheet

### Workspace Paths
- **Active Workspace:** `G:\Coding\OS`
- **Source Root:** `G:\Coding\OS\src`
- **Distribution Output:** `G:\Coding\OS\dist`

### Essential Commands
```powershell
# Development server (Port 5173 with HMR)
npm run dev

# Full TypeScript check and Vite production compilation
npm run build

# Fast linter check
npm run lint

# Automated Vitest test suite execution
npm test

# Production bundle preview
npm run preview
```

---

## 3. Fast Refresh & React 19 Architectural Rules

When authoring or modifying code in Antigravity:
1. **Never export custom hooks or Context instances from JSX/TSX component files.** React Fast Refresh instruments any file containing JSX and requiring pure Component exports. Mixing context hooks (`useSettings`) with components in the same file causes `$RefreshReg$` runtime crashes.
2. **Context Stores must reside in `.ts` files** (e.g. `settingsStore.ts`, `windowStore.ts`).
3. **Avoid Case-Insensitive Filename Collisions on Windows**: Do not create both `SettingsContext.ts` and `settingsContext.tsx` in the same directory.
4. **Clean Event Propagation on Window Controls**: Always use `e.stopPropagation()` on `onPointerDown`, `onMouseDown`, and `onClick` handlers for traffic light window buttons (`WindowControls.tsx`) to prevent pointer capture cancellation by the draggable titlebar.

---

## 4. Subagent Delegation Matrix

When using Antigravity subagents for NOVA OS tasks:
- **`code-reviewer`**: Run prior to committing major window manager or VFS modifications.
- **`test-engineer`**: Execute to expand Vitest test coverage for new application modules.
- **`security-auditor`**: Validate iframe sandbox attributes (`sandbox="allow-scripts allow-modals"`) and VFS path traversal constraints.
- **`web-performance-auditor`**: Verify 60 FPS compositor metrics, canvas memory disposal, and CSS `backdrop-filter` rendering performance.

---

## 5. Development Principles

- **Zero Black Screen Invariants:** Every wallpaper and theme must provide an explicit fallback background color (`fallbackColor`).
- **Resilient Web Browsing:** Built-in web navigation must intelligently distinguish direct URLs from search queries and supply rich in-app fallback SERP results when target sites block iframes via CSP.
- **Native-Class 3D Gaming:** 3D games must use Three.js with hardware-accelerated WebGL rendering, proper aspect ratio resize listeners, and clean requestAnimationFrame disposal loops.
