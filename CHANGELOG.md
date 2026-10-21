# CHANGELOG.md - Project Evolution & Release History

All notable changes, bug fixes, and feature additions to NOVA OS will be documented in this file.

---

## [2.0.4] - 2026-10-21

### 🛠️ Critical Bug Fixes
- **Window Controls Pointer Capture Bug Fixed**:
  - Resolved issue where Close, Minimize, and Maximize buttons failed to respond in small windows until maximized.
  - Added `e.stopPropagation()` on `onPointerDown`, `onMouseDown`, `onPointerUp`, and `onDoubleClick` across `WindowControls.tsx`.
  - Added target guard in `WindowFrame.tsx` to prevent titlebar pointer capture when clicking window controls.
- **Desktop Wallpaper Black Screen Eliminated**:
  - Resolved transparent desktop rendering when switching between gradient and image wallpapers.
  - Added mandatory `fallbackColor` to all 12 system wallpapers in `wallpapers.ts`.
  - Implemented asynchronous `Image()` preloading with error fallback in `Desktop.tsx`.
  - Added desktop preview card, category filtering, and custom wallpaper file upload in `SettingsApp.tsx`.
- **Fast Refresh Runtime Crash Resolved**:
  - Isolated custom React context hooks into pure TypeScript stores (`settingsStore.ts`).
  - Removed mixed component/hook exports preventing `$RefreshReg$` crashes.

### 🚀 Major Feature Additions
- **Upgraded Multi-Tab Web Browser (`BrowserApp.tsx`)**:
  - Implemented multi-tab interface with Ctrl+T and Ctrl+W shortcuts.
  - Smart address bar resolving domains, protocols, and queries.
  - Built-in In-App Search Engine Results Page (SERP) with live Wikipedia API knowledge cards.
  - Persistent bookmarks and history managers.
  - X-Frame-Options reader card fallback for protected websites.
- **Ubuntu-Inspired App Library (`AppLibraryApp.tsx`)**:
  - Software Center indexing 50+ applications across 10 categories.
  - Instant fuzzy search, tag filtering, and one-click launching into standalone windows.
- **3D Three.js Arcade Games Suite**:
  - `MarbleRunner3D`: Tilted maze platform with sphere physics and gem collection.
  - `SpaceTunnel3D`: High-speed cyberpunk warp runner dodging rotating laser barriers.
  - `VoxelIsland3D`: Procedural voxel terrain sandbox with mining, building, and day/night cycle.
- **2D Arcade & Logic Games Suite**:
  - Added Cosmic Invaders (vertical space shooter), Breakout Arkanoid, Flappy Nova, Tetris Classic (SRS rotation), 2048 Puzzle, Retro Snake, Minesweeper, Sudoku Master, Tic Tac Toe (Minimax AI), and Memory Match.
  - Unified Gaming Hub (`GamesCenterApp.tsx`) supporting standalone or embedded play.
- **Productivity & Developer Suite**:
  - Added Text Editor, Tasks & Todo, Markdown Studio, Spreadsheet (formulas & CSV), Doc Viewer, Weather, News & RSS, JSON Formatter, Code Playground, Color Studio, Regex Studio, API Client, GitHub Explorer, Dictionary, Wikipedia Reader, Flashcards, Typing Test, Unit Converter, Paint Canvas, Image Studio, Video Player, Audio Synthesizer, Wallpaper Studio, Activity Monitor, World Clock, Pomodoro Timer, Contacts, and System Dashboard.
- **Full Markdown Documentation Suite**:
  - Added exactly 13 documentation specifications in repository root.

---

## [1.0.0] - 2026-10-18

### 🌟 Initial Release
- macOS-inspired desktop environment with frosted glass styling.
- Magnified application dock with hover animations.
- Window management system supporting dragging, resizing, and focus.
- Virtual File System (VFS) with persistent local storage.
- Top status menu bar with clock, control center, and system settings.
- Initial suite of core applications: Finder, Calculator, Terminal, Notes, Music, Photos, Settings, App Store, and Nova Odyssey game.
