# CLAUDE.MD - Anthropic Claude Developer Guide for NOVA OS

This file provides architectural context, commands, code style rules, and debugging references for Claude instances working on the NOVA OS codebase.

---

## 1. Build and Test Commands

```bash
# Start dev server with Vite HMR
npm run dev

# Full typecheck and production build
npm run build

# Run Vitest test suite
npm test

# Fast code analysis with Oxlint
npm run lint

# Preview production build locally
npm run preview
```

---

## 2. Codebase Architecture

```
src/
├── apps/               # 50+ Native Web Applications & Games
│   ├── AppLibrary/     # Ubuntu-inspired Software Center
│   ├── Browser/        # Multi-tab web browser & in-app SERP
│   ├── Calculator/     # Standard & scientific math engine
│   ├── Finder/         # Virtual filesystem explorer
│   ├── Games/          # 2D & 3D Three.js Arcade Games
│   ├── Terminal/       # Unix shell emulator
│   └── ...             # Productivity, Dev, Media, Utility apps
├── components/         # Desktop Environment Components
│   ├── Desktop/        # Wallpaper, icon grid, selection box
│   ├── Dock/           # Mac-style magnified launcher
│   ├── MenuBar/        # Top status bar, clock, control center
│   └── WindowManager/  # WindowFrame, WindowControls, resizing
├── core/               # State Management & Virtual Subsystems
│   ├── appRegistry/    # Registry of apps, metadata, categories
│   ├── audio/          # SoundService (WebAudio synthesizers)
│   ├── filesystem/     # In-memory persistent VFS
│   ├── settings/       # System preferences & wallpaper definitions
│   └── windowManager/  # Window state, z-index, drag & drop
└── types/              # TypeScript interfaces (AppId, Settings, etc.)
```

---

## 3. Code Style & Conventions

- **Component Exports**: Use named exports (`export const MyComponent: React.FC<Props> = ...`).
- **Icons**: Always import from `lucide-react`.
- **Styling**: Tailwind CSS v4 with glassmorphism classes (`backdrop-blur-md`, `bg-white/10`, `border-white/10`).
- **Audio Feedback**: Invoke `soundService.playClick()` on user actions and `soundService.playNotification()` on completions.
- **Persistence**: Guard all `localStorage` access with `try / catch` blocks to handle private browsing quotas.

---

## 4. Key Bug Patterns Avoided

1. **Window controls disabled in small windows**: Caused by titlebar pointer capture intercepting mouse events. Fixed by `e.stopPropagation()` on all traffic light buttons.
2. **Wallpaper black screens**: Caused by missing fallback colors when CSS gradients fail or custom image URLs fail to load. Fixed by separating `backgroundColor` and `backgroundImage` and providing immediate solid fallbacks.
3. **Fast Refresh runtime crashes**: Caused by exporting custom hooks from JSX files. Context stores must be pure `.ts` files.
