import type { FSNode } from './types'

// Generative SVG data URLs for high-res wallpapers and demo photos
const createSvgPhoto = (title: string, bgGradient: string, accentSvg: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
    <defs>${bgGradient}</defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    ${accentSvg}
    <text x="60" y="740" font-family="-apple-system, sans-serif" font-size="32" font-weight="600" fill="rgba(255,255,255,0.85)">${title}</text>
    <text x="60" y="770" font-family="-apple-system, sans-serif" font-size="18" fill="rgba(255,255,255,0.5)">NOVA OS Gallery • 1200 × 800</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const photoNebula = createSvgPhoto(
  'Cosmic Aurora',
  `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#0b091a"/>
    <stop offset="50%" stop-color="#1e1145"/>
    <stop offset="100%" stop-color="#08020f"/>
  </linearGradient>
  <radialGradient id="nebula1" cx="40%" cy="40%" r="50%">
    <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.6"/>
    <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="nebula2" cx="70%" cy="60%" r="45%">
    <stop offset="0%" stop-color="#ec4899" stop-opacity="0.5"/>
    <stop offset="100%" stop-color="#ec4899" stop-opacity="0"/>
  </radialGradient>`,
  `<circle cx="480" cy="320" r="300" fill="url(#nebula1)"/>
   <circle cx="840" cy="480" r="260" fill="url(#nebula2)"/>
   <circle cx="300" cy="200" r="2" fill="#fff" opacity="0.8"/>
   <circle cx="750" cy="180" r="3" fill="#fff" opacity="0.9"/>
   <circle cx="950" cy="280" r="1.5" fill="#fff" opacity="0.7"/>
   <circle cx="150" cy="450" r="2" fill="#fff" opacity="0.6"/>
   <circle cx="620" cy="550" r="2.5" fill="#fff" opacity="0.85"/>`
)

const photoMountain = createSvgPhoto(
  'Alps Sunset Horizon',
  `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#1e1b4b"/>
    <stop offset="35%" stop-color="#432874"/>
    <stop offset="70%" stop-color="#c026d3"/>
    <stop offset="90%" stop-color="#f97316"/>
    <stop offset="100%" stop-color="#fef08a"/>
  </linearGradient>`,
  `<polygon points="100,600 450,280 700,600" fill="#2e1065" opacity="0.7"/>
   <polygon points="500,600 850,220 1150,600" fill="#1e1b4b" opacity="0.9"/>
   <polygon points="-50,700 250,420 550,700" fill="#0f172a" opacity="0.95"/>
   <circle cx="600" cy="220" r="70" fill="#ffedd5" opacity="0.85"/>`
)

const photoCyber = createSvgPhoto(
  'Digital Silicon Matrix',
  `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#030712"/>
    <stop offset="100%" stop-color="#022c22"/>
  </linearGradient>`,
  `<path d="M0,200 Q300,100 600,300 T1200,200" stroke="#10b981" stroke-width="3" fill="none" opacity="0.4"/>
   <path d="M0,400 Q400,250 800,450 T1200,380" stroke="#06b6d4" stroke-width="2" fill="none" opacity="0.5"/>
   <circle cx="600" cy="300" r="8" fill="#34d399"/>
   <circle cx="800" cy="450" r="6" fill="#22d3ee"/>`
)

const now = Date.now()

export const INITIAL_FILES: FSNode[] = [
  // Special root directories
  {
    id: 'folder-desktop',
    name: 'Desktop',
    type: 'folder',
    parentId: null,
    size: 0,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'folder-documents',
    name: 'Documents',
    type: 'folder',
    parentId: null,
    size: 0,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'folder-downloads',
    name: 'Downloads',
    type: 'folder',
    parentId: null,
    size: 0,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'folder-pictures',
    name: 'Pictures',
    type: 'folder',
    parentId: null,
    size: 0,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'folder-music',
    name: 'Music',
    type: 'folder',
    parentId: null,
    size: 0,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'folder-trash',
    name: 'Trash',
    type: 'folder',
    parentId: null,
    size: 0,
    createdAt: now,
    updatedAt: now,
  },

  // Desktop files
  {
    id: 'file-welcome',
    name: 'Welcome to NOVA OS.txt',
    type: 'file',
    parentId: 'folder-desktop',
    mimeType: 'text/plain',
    size: 1420,
    createdAt: now - 3600000 * 24,
    updatedAt: now,
    content: `========================================================
           WELCOME TO NOVA OS v2.0
========================================================

NOVA OS is a complete, polished, browser-based operating system
inspired by the elegance, simplicity, and fluid animations of macOS.

QUICK START TIPS:
• Dock: Hover over icons for fluid parabolic magnification.
  Click to launch or bring open applications to focus.
• Window Management:
  - Drag title bar to move windows.
  - Drag edges and corners to resize.
  - Double-click title bar to maximize or restore.
  - Drag to top edge to snap full screen, or to left/right for split view.
  - Yellow button: minimize to Dock.
  - Green button: maximize/restore.
  - Red button: close window.
• Keyboard Shortcuts:
  - Alt + Tab: Switch between running applications.
  - Ctrl + Space: Spotlight Global System Search.
  - Ctrl + W: Close active window.
  - Ctrl + M: Minimize active window.
  - Ctrl + Shift + F: Toggle fullscreen window.
  - Escape: Close dialogs and dropdown menus.
• Built-in Apps:
  1. Finder: Manage files, upload local files, download virtual files.
  2. Browser: Browse websites, multi-tabs, bookmarks, history.
  3. Notes: Rich notes with autosave and search.
  4. Calculator: Standard and scientific calculator with history.
  5. Calendar: Manage daily events and schedule.
  6. Mail: Compose and manage local emails.
  7. Photos: High-res viewer, zoom, rotate, import photos.
  8. Music: Procedural audio player and custom audio importer.
  9. Terminal: Unix-style shell with filesystem commands and neofetch.
  10. Settings: Custom wallpapers, dark/light themes, accent colors.
  11. App Store: Explore built-in and extra applications.
  12. Games: "Nova Odyssey", an arcade 2D platformer!

Enjoy exploring your new virtual operating system!
`,
  },
  {
    id: 'file-notes-sample',
    name: 'Ideas & Todo.txt',
    type: 'file',
    parentId: 'folder-desktop',
    mimeType: 'text/plain',
    size: 380,
    createdAt: now - 3600000 * 12,
    updatedAt: now,
    content: `[x] Launch NOVA OS desktop
[x] Test window dragging and resizing
[x] Play a round of Nova Odyssey
[ ] Set custom wallpaper in Settings
[ ] Create a new folder in Documents
[ ] Check emails in Mail app
`,
  },

  // Documents
  {
    id: 'file-roadmap',
    name: 'Project Proposal.md',
    type: 'file',
    parentId: 'folder-documents',
    mimeType: 'text/markdown',
    size: 890,
    createdAt: now - 3600000 * 48,
    updatedAt: now,
    content: `# NOVA OS Architecture

## Overview
A high-performance virtual desktop environment built entirely with modern web technologies:
- **Core**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Glassmorphism Backdrop Blur
- **Storage**: IndexedDB Virtual File System (VFS)
- **Audio**: Web Audio API procedural synthesis engine
- **Game Engine**: HTML5 Canvas 60 FPS physics platformer

## Highlights
1. Zero lag window manager with boundary protection.
2. High fidelity dock magnification physics.
3. Offline-first local persistence.
`,
  },
  {
    id: 'file-sysinfo',
    name: 'System Architecture.txt',
    type: 'file',
    parentId: 'folder-documents',
    mimeType: 'text/plain',
    size: 450,
    createdAt: now - 3600000 * 20,
    updatedAt: now,
    content: `NOVA OS KERNEL: Virtual v2.0 (Tahoe Edition)
MEMORY: 16 GB Virtual Unified High-Bandwidth RAM
STORAGE: IndexedDB High-Speed Virtual SSD
AUDIO DRIVER: Web Audio 48kHz Procedural Engine
DISPLAY: Virtual Retina Display with Sub-Pixel Antialiasing
`,
  },

  // Pictures
  {
    id: 'file-photo-nebula',
    name: 'Cosmic Aurora.svg',
    type: 'file',
    parentId: 'folder-pictures',
    mimeType: 'image/svg+xml',
    size: 14200,
    createdAt: now - 3600000 * 72,
    updatedAt: now,
    content: photoNebula,
  },
  {
    id: 'file-photo-mountain',
    name: 'Alps Sunset Horizon.svg',
    type: 'file',
    parentId: 'folder-pictures',
    mimeType: 'image/svg+xml',
    size: 9800,
    createdAt: now - 3600000 * 60,
    updatedAt: now,
    content: photoMountain,
  },
  {
    id: 'file-photo-cyber',
    name: 'Digital Silicon Matrix.svg',
    type: 'file',
    parentId: 'folder-pictures',
    mimeType: 'image/svg+xml',
    size: 8400,
    createdAt: now - 3600000 * 50,
    updatedAt: now,
    content: photoCyber,
  },

  // Music
  {
    id: 'file-song-1',
    name: 'Cosmic Drift.synth',
    type: 'file',
    parentId: 'folder-music',
    mimeType: 'audio/synth',
    size: 245000,
    createdAt: now - 3600000 * 30,
    updatedAt: now,
    content: 'SYNTH_TRACK:1',
  },
  {
    id: 'file-song-2',
    name: 'Neon Horizon.synth',
    type: 'file',
    parentId: 'folder-music',
    mimeType: 'audio/synth',
    size: 320000,
    createdAt: now - 3600000 * 25,
    updatedAt: now,
    content: 'SYNTH_TRACK:2',
  },

  // Downloads
  {
    id: 'file-pkg',
    name: 'nova-system-update.pkg',
    type: 'file',
    parentId: 'folder-downloads',
    mimeType: 'application/octet-stream',
    size: 8450000,
    createdAt: now - 3600000 * 5,
    updatedAt: now,
    content: 'NOVA_PACKAGE_BINARY_DATA',
  },
]
