# FEATURES.md - Complete Feature Inventory of NOVA OS

An exhaustive catalog of all interactive features and capabilities built into NOVA OS.

---

## 1. Desktop & Window Management

- **Traffic Light Controls**: Authentic macOS-inspired traffic light buttons with immediate response on Close (red), Minimize (amber), and Maximize/Restore (green).
- **Smooth Window Dragging**: Sub-pixel fluid translation using CSS GPU transforms (`translate3d`).
- **Edge & Corner Resizing**: 8-point bidirectional resizing with minimum size boundaries.
- **Header Double-Click Toggle**: Double-clicking the titlebar toggles between maximized state and previous custom dimensions.
- **Active Focus & Z-Index Stacking**: Click anywhere on a window to elevate its stacking context.
- **Marquee Drag Selection**: Drag across the desktop to draw an animated selection box and highlight multiple icons.
- **Context Menus**: Right-click on the desktop or icons to access contextual commands (New Folder, New Document, Change Wallpaper, Refresh, Settings, Trash).
- **Desktop Icons**: Single-click select, double-click launch, and repositionable icons with persistent coordinates.

---

## 2. Top Menu Bar & System Flyouts

- **NOVA System Menu**: About dialog, System Settings shortcut, App Store, Sleep mode, Restart simulation, and Shut Down.
- **Dynamic App Menus**: Top menus (*File*, *Edit*, *View*, *Window*, *Help*) dynamically update according to the active focused window.
- **Spotlight Search (`Ctrl + Space` / `Cmd + Space`)**: Global application launcher with instant keystroke filtering.
- **Control Center (macOS Style)**: Glassmorphic cards for Wi-Fi toggle, Bluetooth, Do Not Disturb, Dark/Light theme switcher, volume slider, brightness slider, and music controls.
- **Notification Flyout**: System notifications list, dismissal, weather summary tile, and calendar overview.
- **Live Menu Clock**: Digital time and date formatted according to local timezone, updated every second.

---

## 3. Magnified Application Dock

- **Smooth Fish-Eye Magnification**: Proportional icon scaling based on mouse cursor distance.
- **Running App Indicators**: Subtle glow dot under active running applications.
- **Window Restore on Click**: Clicking a dock icon restores minimized windows or elevates minimized windows to the foreground.
- **Trash Drop Target**: Drag-and-drop file deletion directly onto the trash icon.

---

## 4. Ubuntu-Inspired App Library & Software Center

- **Category Sidebar**: Instant filtering across System, Productivity, Utilities, Media, Games, Internet, Development, Education, and Graphics.
- **Search & Badge Indexing**: Instant search across titles, descriptions, and tag pills.
- **One-Click Launch**: Single click initiates independent window instances with optimal initial geometry.

---

## 5. Built-in Multi-Tab Web Browser

- **Tab Management**: Create, switch, and close multiple tabs with keyboard shortcuts.
- **Smart Query Resolver**: Distinguishes direct domains (e.g. `github.com`), HTTP protocols, localhost, and raw search queries.
- **In-App Search Engine (SERP)**: Integrated results page featuring Wikipedia summary cards and query suggestions.
- **X-Frame-Options Reader View**: Clean fallback reader card when websites block embedding.
- **Bookmarks & History**: Persistent browsing history and bookmark management.

---

## 6. 3D WebGL Games (Powered by Three.js)

1. **Marble Runner 3D**:
   - Tilted wooden/cyber maze platform rotating with keyboard arrows or WASD.
   - Sphere physics simulation (velocity, gravity, bounce damping, wall collisions).
   - 5 collectible cyan gems and target green vortex goal.
2. **Space Tunnel 3D**:
   - Hyperspeed cyber neon warp tunnel with moving rings and starfield particles.
   - Banked starfighter controls dodging rotating laser barriers.
   - Warp speed level progression and local high score tracking.
3. **Voxel Island 3D**:
   - Procedural floating voxel island with Grass, Stone, Dirt, Wood, Gold, and Water.
   - 360° orbit camera with mouse drag.
   - Left-click block placement and Right-click mining.
   - Dynamic Day/Night cycle toggle.

---

## 7. 2D Retro Arcade & Logic Games

- **Nova Odyssey**: 2D cyber arcade platformer with double jumps, physics, and coins.
- **Cosmic Invaders**: Vertical scrolling space shooter with lasers, alien waves, and particle explosions.
- **Breakout Arkanoid**: Brick breaker with paddle bounce angles, multi-tier colored bricks, and lives.
- **Flappy Nova**: Flappy bird arcade clone with jumping gravity and pipe collision.
- **Tetris Classic**: SRS rotation, ghost piece preview, hard drop, and line clear animations.
- **2048 Puzzle**: Smooth sliding tile merge puzzle with local high score.
- **Retro Snake**: Classic retro grid snake with high scores and speed levels.
- **Minesweeper**: Beginner (9x9) and Intermediate (12x12) mine clearance with flags and timer.
- **Sudoku Master**: 9x9 numerical puzzle with subgrid validation and keypad.
- **Tic Tac Toe**: Unbeatable Minimax AI or 2-player local mode.
- **Memory Match**: 16-card emoji matching game with moves counter.

---

## 8. Productivity & Developer Suite

- **Text Editor**: Plain text editor with line numbers, font controls, word counts, and file export.
- **Tasks & Todo**: Task manager with priority tags, categories, and completion tracking.
- **Markdown Studio**: Split-view editor with live GitHub-flavored Markdown rendering.
- **Spreadsheet**: Grid calculations with formulas (`=SUM()`, arithmetic) and CSV export.
- **Doc Viewer**: PDF and technical manual reader with zoom and pagination.
- **JSON Formatter**: Prettify, minify, and validate JSON with syntax error pointers.
- **Code Playground**: Live HTML/CSS/JS sandbox with sandboxed iframe preview and particles demo.
- **Color Studio**: HEX/RGB/HSL picker, harmony palettes, and WCAG contrast ratio score.
- **Regex Studio**: Regular expression tester with real-time match groups and substitution.
- **API Client**: REST HTTP request tool supporting GET/POST/PUT/DELETE, headers, and latency tracking.
- **GitHub Explorer**: Repository explorer with commit logs, file trees, and README viewer.

---

## 9. Media & Creative Tools

- **Paint Canvas**: Drawing studio with brushes, lines, rectangles, circles, colors, and PNG export.
- **Image Studio**: Photo editor with live CSS filters (brightness, contrast, saturation, blur, sepia, hue).
- **Video Player**: Video player with playlist, timeline scrubbing, volume, and playback speed.
- **Audio Synthesizer**: WebAudio procedural synthesizer with playable keyboard and 808 drum pads.
- **Wallpaper Studio**: Interactive mesh gradient designer with real-time desktop application.
