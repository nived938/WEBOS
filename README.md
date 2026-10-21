# 🌌 NOVA OS (WEBOS) — Complete Browser-Based Operating System

**NOVA OS** is an interactive, browser-based operating system inspired by the elegance, simplicity, and fluid animations of macOS. Built from the ground up using **React 19**, **TypeScript**, **Vite 8**, **Tailwind CSS v4**, and **Three.js WebGL 3D**.

NOVA OS simulates a desktop operating system inside any modern web browser—complete with dynamic window management, a virtual file system, multi-tab browsing, an Ubuntu-inspired App Library, procedural audio synthesis, and native 3D arcade games.

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### Installation & Launch
```bash
# Clone the repository
git clone https://github.com/nived938/WEBOS.git
cd WEBOS

# Install dependencies (including Three.js & Lucide)
npm install

# Start development server with live HMR
npm run dev

# Run automated Vitest test suite
npm test

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🌟 Key Highlights & Engineering Breakthroughs

### 1. Robust Window Management & Traffic Lights
- **No-Deadzone Traffic Lights**: Close (red), Minimize (amber), and Maximize/Restore (green) buttons respond immediately regardless of window size or position.
- **Pointer Capture Isolation**: Titlebar drag capture is safely isolated from interactive controls via strict stopPropagation guardrails.
- **Window Snapping & Geometry**: Windows support double-click header maximization, proportional resizing from all edges, z-index elevation on focus, and minimized dock state.

### 2. Zero-Black-Screen Dynamic Wallpapers
- **Fail-Safe Fallbacks**: Every wallpaper specification includes an explicit solid hex `fallbackColor` combined with GPU-accelerated mesh radial gradients.
- **Image Preloading**: Dynamic and custom image wallpapers are verified via asynchronous `Image()` preloading before rendering, completely eliminating black screen anomalies.
- **Custom Wallpaper Studio**: Built-in generator to design custom multi-stop radial mesh gradients and apply them to the desktop in real time.

### 3. Advanced Multi-Tab Web Browser
- **Tabbed Browsing**: Seamless multi-tab management with Ctrl+T and Ctrl+W shortcuts.
- **Smart Address Bar**: Automatic differentiation between fully qualified URLs, local domains, and search queries.
- **Integrated In-App SERP**: Embedded search engine results page with instant Wikipedia knowledge cards and query suggestions.
- **CSP & X-Frame-Options Resilience**: Graceful reader card with one-click site exploration when third-party servers block iframes.
- **History & Bookmarks**: Persistent storage of web browsing history and customizable bookmarks.

### 4. Ubuntu-Inspired App Library & Software Center
- **Category Navigation**: Filter across System, Productivity, Internet, Development, Education, Graphics, and Games.
- **Search & Badge Indexing**: Instant fuzzy search across titles, descriptions, and tags.
- **One-Click Launch**: Launch any of the 50+ registered applications into an isolated window.

### 5. 2D & 3D WebGL Games Library
- **Marble Runner 3D**: Real-time Three.js sphere physics simulation on a tilted 3D maze platform with glowing gem collectibles.
- **Space Tunnel 3D**: Hyperspeed cyberpunk warp tunnel runner dodging rotating laser barriers with particle starfields.
- **Voxel Island 3D**: Procedural floating voxel sandbox with block placement, mining, and dynamic day/night sun lighting.
- **Classic Retro Arcade**: Nova Odyssey platformer, Cosmic Invaders vertical shooter, Breakout Arkanoid, and Flappy Nova.
- **Logic & Puzzles**: Tetris Classic (SRS rotation & hard drops), 2048, Retro Snake, Minesweeper, Sudoku Master, Tic Tac Toe (Minimax AI), and Memory Match.
- **Gaming Hub (`games`)**: Unified portal to browse, launch, or play any of the 14 games directly.

---

## 📱 Application Catalog (50+ Native Apps)

| Category | Applications |
| :--- | :--- |
| **System** | Finder, Settings, App Store, App Library, Trash, Activity Monitor |
| **Productivity** | Text Editor, Tasks & Todo, Markdown Studio, Spreadsheet, Doc Viewer, Notes, Calendar |
| **Internet** | Browser, Weather, News & RSS, Bookmarks Manager, Downloads Manager |
| **Development** | Terminal, JSON Formatter, Code Playground, Color Studio, Regex Studio, API Client, GitHub Explorer |
| **Education** | Dictionary & Thesaurus, Wikipedia Reader, Flashcards, Typing Test, Unit Converter |
| **Graphics & Media** | Photos, Music, Paint Canvas, Image Studio, Video Player, Audio Synthesizer, Wallpaper Studio |
| **Utilities** | Calculator, World Clock, Pomodoro Timer, Contacts Address Book, System Dashboard |
| **3D Games** | Marble Runner 3D, Space Tunnel 3D, Voxel Island 3D |
| **2D Games** | Nova Odyssey, Cosmic Invaders, Breakout, Flappy Nova, Tetris, 2048, Snake, Minesweeper, Sudoku, Tic Tac Toe, Memory Match |

---

## 🏛️ System Architecture

```
                  ┌─────────────────────────────────────────┐
                  │              Top Menu Bar               │
                  └─────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────┐
│                           Desktop Canvas                                │
│                                                                         │
│   ┌───────────────────────────┐         ┌───────────────────────────┐   │
│   │   Browser (Multi-tab)     │         │    3D WebGL Three.js      │   │
│   │   - SERP Engine           │         │    - Marble Runner 3D     │   │
│   │   - Reader View           │         │    - Space Tunnel 3D      │   │
│   └───────────────────────────┘         └───────────────────────────┘   │
│                                                                         │
│   ┌───────────────────────────┐         ┌───────────────────────────┐   │
│   │   App Library (Ubuntu)    │         │    Productivity Suite     │   │
│   │   - Software Center       │         │    - Spreadsheet / Todo   │   │
│   │   - 50+ Registered Apps   │         │    - Markdown Live Editor │   │
│   └───────────────────────────┘         └───────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                  ┌─────────────────────────────────────────┐
                  │            Magnified Dock               │
                  └─────────────────────────────────────────┘
```

---

## 🧪 Testing & Quality Assurance

NOVA OS features an automated Vitest test suite validating:
- Application Registry completeness and geometry constraints.
- Fallback wallpaper styles and solid background protection.
- Virtual File System file tree mutations and persistent storage.
- Standard & scientific calculator precision.

Run the test suite:
```bash
npm test
```

---

## 📄 License & Attribution

- Built with modern open web standards: React 19, Vite 8, Tailwind CSS v4, Three.js, and Lucide Icons.
- Released under the MIT License.
