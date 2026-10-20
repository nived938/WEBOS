# 🌌 NOVA OS — Complete Browser-Based Operating System

**NOVA OS** is a complete, polished, interactive, browser-based operating system inspired by the elegance, simplicity, and fluid animations of macOS. Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **HTML5 Canvas**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### Installation & Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run automated test suite
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎨 Design Philosophy & Features

### 1. Visual Design & Glassmorphism
- Translucent frosted glass effects (`backdrop-filter: blur(24px) saturate(180%)`).
- Layered drop shadows and subtle border lighting.
- Six high-resolution dynamic and gradient wallpapers + custom wallpaper upload.
- Light, Dark, and Auto theme modes.
- Six vibrant system accent colors (Nova Blue, Electric Violet, Emerald Isle, Sunset Orange, Rose Pink, Amber Gold).

### 2. Desktop Environment
- **Interactive Desktop Icons**: Single-click select, double-click launch, drag to reposition anywhere on the desktop canvas.
- **Marquee Drag Selection**: Rubber-band selection rectangle to select multiple items simultaneously.
- **Desktop Context Menus**: Right-click on empty desktop for *New Folder*, *New Text Document*, *Change Wallpaper*, *Refresh*, and *System Settings*.
- **Icon Context Menus**: Right-click on items to *Open*, *Rename*, *Move to Trash*, or *Download/Export*.

### 3. Top Menu Bar
- **NOVA Celestial Logo**: System menu containing *About NOVA OS*, *System Settings*, *App Store*, *Sleep*, *Restart*, and *Shut Down*.
- **Dynamic Context Menus**: Menus (*File*, *Edit*, *View*, *Window*, *Help*) dynamically adapt to the currently focused application.
- **System Controls (Right Side)**:
  - **Wi-Fi Flyout**: Connection status, IP address, and toggle.
  - **Volume Slider Flyout**: Master gain slider and mute toggle.
  - **Battery Indicator**: Live percentage, charging status, and battery health.
  - **Spotlight Search (Ctrl + Space)**: Instant global search.
  - **Control Center (macOS Style)**: 2-column cards for Wi-Fi, Bluetooth, Focus/Do Not Disturb, Theme mode, Display Brightness slider, Volume slider, and Music player widget.
  - **Notification Center**: Actionable notifications, dismiss, clear all, today's weather simulation, and calendar widget.
  - **Live Clock**: Exact real-time date and time updated every second.

### 4. Animated Application Dock
- **12 Built-in Apps + Trash**:
  1. Finder
  2. Browser
  3. Mail
  4. Calendar
  5. Notes
  6. Calculator
  7. Photos
  8. Music
  9. Terminal
  10. Settings
  11. App Store
  12. Games (Nova Odyssey)
  - Trash Can (dynamic empty/full state indicator)
- **Fluid Parabolic Magnification**: Icons scale smoothly on hover using a mathematical cosine bell curve.
- **Running Indicators**: Luminous indicator dots beneath active running apps.
- **Dock Customization**: Configurable dock size (small, medium, large), toggle magnification, and dock auto-hide.

### 5. Multi-Window Management System
- **Draggable Windows**: Drag titlebar with edge bounds protection and pointer capture (no event swallowing over canvas or iframes).
- **8-Direction Resizing**: Resize from any border or corner with minimum dimension enforcement.
- **macOS Traffic Light Buttons**: Close (red), Minimize (yellow), Maximize/Restore (green) with hover glyphs.
- **Window Snapping**: Drag to left edge for left half snap, right edge for right half snap, or top edge for full maximize.
- **Stacking Order & Focus**: Clicking any window brings it to the top z-index.
- **App Switcher (`Alt + Tab`)**: macOS-style centered floating app switcher overlay.
- **Shortcuts**:
  - `Alt + Tab`: Switch between running applications
  - `Ctrl + Space`: Spotlight Global Search
  - `Ctrl + W`: Close active window
  - `Ctrl + M`: Minimize active window
  - `Ctrl + Shift + F`: Toggle maximize/fullscreen
  - `Escape`: Close modals, dropdowns, and spotlight

---

## 📱 The 12 Built-in Applications

### 📁 1. Finder (File Manager)
- Sidebar with Quick Access: *Desktop*, *Documents*, *Downloads*, *Pictures*, *Music*, and *Trash*.
- Grid and List views with sorting by Name, Date, and Size.
- Create files and folders, inline rename, cut/copy/paste, and delete to Trash.
- **Import / Upload**: Import real files from the user's computer into the virtual filesystem.
- **Export / Download**: Download virtual files directly to the user's computer.
- File inspector panel displaying file metadata (size, kind, modification date).

### 🌐 2. NOVA Browser
- Multi-tabbed web browsing with `+` new tab, tab switching, and close tab.
- Navigation bar: Back, Forward, Reload, and Home controls.
- Bookmarks bar with quick links (Wikipedia, OpenStreetMap, DevDocs, GitHub, Hacker News).
- Search engine selection (DuckDuckGo, Google, Bing, Wikipedia).
- **Intelligent Iframe & Security Fallback**:
  - Embeddable sites render directly in an iframe.
  - Sites blocking embedding via `X-Frame-Options` or Content Security Policy gracefully display an informative macOS-style Fallback Card with an instant **"Open in New Tab"** button.

### ✍️ 3. Notes
- 3-column macOS layout: Folders (Quick Notes, Work, Personal), Notes list with search, and Editor pane.
- Rich formatting toolbar: Headings, Bold, Italic, Bullet lists, To-Do Checkboxes, and Code blocks.
- Real-time autosave to local storage with timestamp indicators.

### 🔢 4. Calculator
- Standard and Scientific modes (sin, cos, tan, log, ln, sqrt, powers, pi, e).
- Calculation history drawer for reviewing and reusing previous calculations.
- Full keyboard support (numbers, operators, Enter, Backspace, Escape).

### 📅 5. Calendar
- Monthly calendar grid with today highlighting and quick "Today" navigation.
- Date selection and agenda view.
- Create, categorize (Work, Personal, Urgent, Other), and delete calendar events.

### ✉️ 6. Mail
- Split view mail client: Mailboxes (*Inbox*, *Sent*, *Drafts*, *Trash*), Messages list, and Message preview.
- Pre-populated demonstration emails with helpful system guides.
- Full Compose modal to draft and dispatch local emails to the Sent mailbox.

### 🖼️ 7. Photos
- Responsive photo library with high-res wallpapers and generative art.
- Import photos from user's device via file picker.
- Lightbox viewer: Zoom in/out, 90° rotation, Next/Previous controls, metadata info.
- **"Set as Wallpaper"**: Instantly sets any photo as the desktop wallpaper!

### 🎵 8. Music
- Modern music player with album artwork and transport controls (Play, Pause, Prev, Next, Seek, Volume, Shuffle, Repeat).
- **Procedural Web Audio Engine**: Zero external audio lag! Generates ambient electronic synth tracks locally (*Cosmic Drift*, *Neon Horizon*, *Deep Space Flow*, *Midnight Drive*).
- **Local Audio Importer**: Import any MP3/WAV/OGG audio file from your computer and play it immediately.
- Real-time animated canvas audio frequency visualizer.

### 💻 9. Terminal
- Authentic Unix `zsh` command line: `user@nova-os ~ %`
- Commands: `help`, `clear`, `date`, `time`, `echo`, `pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `rm`, `open [app/file]`, `whoami`, `neofetch`, `theme [matrix/amber/default]`.
- Connected directly to the Virtual File System.
- Command history navigation with Arrow Up / Arrow Down.

### ⚙️ 10. Settings
- **Appearance**: Dark / Light / Auto mode, 6 accent colors, reduced motion toggle.
- **Wallpaper**: 6 built-in dynamic wallpapers + custom wallpaper upload.
- **Dock & Desktop**: Dock icon size (small, medium, large), magnification toggle, auto-hide toggle, desktop icons visibility toggle.
- **Sound**: Master volume, system sound effects toggle, startup chime test.
- **Storage**: Storage breakdown chart showing IndexedDB usage.
- **About NOVA OS**: Virtual Silicon specs, memory, and Reset All Data option.

### 🛍️ 11. App Store
- Featured hero banner showcasing top apps.
- Categorized application catalog (Productivity, Utilities, Media, Games).
- App metadata, user ratings, reviews count, and descriptions.
- Instant "OPEN" button to launch any app in its desktop window.

### 🗑️ 12. Trash
- Displays all deleted virtual files.
- "Put Back" button to restore files to their original directories.
- "Delete Immediately" and "Empty Trash" with confirmation dialog.

### 🕹️ 13. Playable Game: "Nova Odyssey"
- Complete 2D cyberpunk arcade platformer running at smooth 60 FPS on HTML5 Canvas.
- Original astronaut character with running animations, jumping, and double jumping.
- Moving platforms, bounce pads, and dust particle effects.
- Collectible energy crystals (+50 pts) that sparkle with particle bursts.
- Roaming patrol security drones and hazardous laser spikes.
- Health / lives system (3 hearts) with invulnerability flicker.
- Score tracker and distance counter.
- Persistent High Score saved in local storage.
- Procedural sound effects using Web Audio API (jump, coin, damage, game over).

---

## 🔊 Web Audio Procedural Synthesizer
NOVA OS uses a custom Web Audio API sound engine that generates 100% original sound effects without external audio files:
- **Startup Chime**: Rich major ninth shimmering chord.
- **Window Controls**: Minimize swoosh, restore chime, button clicks.
- **Trash Empty**: Crumple and sweep noise effect.
- **Screenshot Camera Shutter**: Realistic mechanical shutter click.
- **Notification Bell**: Dual-tone chime.
- **Game SFX**: Frequency sweeps, coin arpeggios, and 8-bit hit effects.

---

## 💾 Virtual File System (VFS) Architecture

```
/ (Root)
├── Desktop/
│   ├── Welcome to NOVA OS.txt
│   ├── Ideas & Todo.txt
│   └── Nova Odyssey.app
├── Documents/
│   ├── Project Proposal.md
│   └── System Architecture.txt
├── Pictures/
│   ├── Cosmic Aurora.svg
│   ├── Alps Sunset Horizon.svg
│   └── Digital Silicon Matrix.svg
├── Music/
│   ├── Cosmic Drift.synth
│   └── Neon Horizon.synth
├── Downloads/
│   └── nova-system-update.pkg
└── Trash/
```

- **Persistence**: Backed by browser **IndexedDB** with automatic fallback to **localStorage**.
- **Privacy & Security**: Operates completely in the client-side browser sandbox. Files imported or created remain private to your local browser storage.

---

## 🧪 Automated Test Suite

Run unit and integration tests with:
```bash
npm test
```

### Verified Acceptance Criteria:
- [x] Application builds without errors (`npm run build`).
- [x] All 12 built-in applications registered and functional.
- [x] Multiple windows open, drag, resize, maximize, minimize, and restore.
- [x] Virtual File System creates, renames, deletes, restores, and searches files.
- [x] Procedural sound engine produces chords and handles volume/mute.
- [x] Calculator evaluates arithmetic, decimals, percentages, and scientific operations.
- [x] High score in Nova Odyssey persists across sessions.
- [x] Browser tabs open, close, and handle embed restrictions gracefully.
- [x] Settings persist after reload.

---

## 🔒 Security & Browser Limitations

1. **Sandboxed Environment**: NOVA OS runs inside standard browser security boundaries. It does not execute native terminal commands or access host computer files without explicit user file picker action.
2. **Iframe Security**: Websites that set strict `X-Frame-Options: DENY` or `frame-ancestors 'none'` Content Security Policies cannot be embedded. NOVA Browser cleanly detects this and provides an **"Open in New Tab"** option so the user never encounters a permanently blank screen.
3. **Storage Quotas**: Virtual storage is allocated from the browser's IndexedDB storage pool.

---

*Designed and crafted with passion for modern web engineering.*
