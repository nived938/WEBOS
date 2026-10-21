# DEVELOPMENT.md - Developer Onboarding & Contribution Guide

This guide describes how to develop, test, and add features to NOVA OS.

---

## 1. Local Environment Setup

### System Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Browser**: Chrome 115+, Firefox 120+, Safari 17+, or Edge 115+ (WebGL 2.0 and Web Audio supported)

### Step-by-Step Installation
```bash
# Clone the repository
git clone https://github.com/nived938/WEBOS.git
cd WEBOS

# Install dependencies cleanly
npm install

# Start development server
npm run dev
```
Open your browser to `http://localhost:5173`.

---

## 2. Project Directory Structure

```
src/
├── apps/                 # Application implementations
│   ├── AppLibrary/       # Software Center app
│   ├── Browser/          # Browser with SERP & tabs
│   ├── Games/            # 2D & 3D Three.js Games
│   └── ...
├── components/           # UI Desktop Shell
│   ├── Desktop/          # Desktop canvas, wallpaper, selection marquee
│   ├── Dock/             # Magnified dock launcher
│   ├── MenuBar/          # Top status bar & flyouts
│   └── WindowManager/    # WindowFrame and WindowControls
├── core/                 # Core logic, contexts, and engines
│   ├── appRegistry/      # App definitions, metadata, categories
│   ├── audio/            # SoundService procedural audio
│   ├── filesystem/       # Virtual File System (VFS)
│   ├── settings/         # Theme & Wallpaper stores
│   └── windowManager/    # Window context and actions
└── types/                # Global TypeScript declarations
```

---

## 3. How to Create a New Application

Follow these steps to create and register an app named `SampleApp`:

### Step 1: Create the Component
Create `src/apps/SampleApp/SampleApp.tsx`:
```tsx
import React from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'

export const SampleApp: React.FC<AppInstanceProps> = ({ isFocused }) => {
  return (
    <div className="flex flex-col h-full bg-neutral-900 text-white p-4 select-none">
      <h1 className="text-lg font-bold">Sample Application</h1>
      <p className="text-xs text-neutral-400 mt-2">Welcome to your new native app!</p>
    </div>
  )
}
```

### Step 2: Register in `src/types/index.ts`
Add `'sampleapp'` to the `AppId` union:
```typescript
export type AppId =
  | 'finder'
  | 'browser'
  | 'sampleapp'
  | ...
```

### Step 3: Register in `src/core/appRegistry/apps.config.ts`
Add metadata to `APPS_REGISTRY`:
```typescript
import { SampleApp } from '@/apps/SampleApp/SampleApp'

export const APPS_REGISTRY: Record<string, RegisteredApp> = {
  // ...
  sampleapp: {
    id: 'sampleapp',
    title: 'Sample App',
    description: 'An example application',
    category: 'Utilities',
    version: '1.0',
    defaultWidth: 600,
    defaultHeight: 400,
    minWidth: 400,
    minHeight: 250,
    accentColor: '#3b82f6',
    gradient: 'from-blue-600 to-indigo-600',
    component: SampleApp,
  }
}
```

---

## 4. Performance & Styling Guidelines

- **GPU Transforms**: Use CSS `transform: translate3d(x, y, 0)` for window positioning. Avoid modifying `top` and `left` directly in animation loops.
- **Glassmorphic Panels**: Use Tailwind classes `backdrop-blur-md bg-white/10 border border-white/10`.
- **Audio Feedback**: Connect user interactions to `soundService.playClick()` or `soundService.playNotification()`.
- **WebGL Contexts**: Always dispose geometries, materials, and renderers in cleanup hooks to prevent WebGL context loss.

---

## 5. Verification Commands

Before submitting pull requests:
```bash
# Verify TypeScript and bundle build
npm run build

# Run automated tests
npm test
```
