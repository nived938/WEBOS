# ROADMAP.md - NOVA OS Engineering Roadmap

This document outlines the version milestones, historical progress, and future technical roadmap for NOVA OS.

---

## 📍 Version Milestones

### v1.0 — Foundation & Design Genesis (Completed)
- [x] Initial desktop canvas with glassmorphism styling.
- [x] Magnified Dock with hover bounce animations.
- [x] Window Manager supporting drag, resize, minimize, and maximize.
- [x] Core apps: Finder, Calculator, Terminal, Notes, Settings.
- [x] WebAudio sound effects engine for tactile clicks.

---

### v2.0 — Architecture Polish, Games & App Library (Current Release)
- [x] **Traffic Lights Pointer Fix**: Complete resolution of pointer capture bug in small windows.
- [x] **Wallpaper Resiliency Engine**: Solid fallback colors, image preloading, and complete eradication of black screen anomalies.
- [x] **Multi-Tab Browser Upgrade**: Real search query routing, embedded in-app SERP, Wikipedia live extracts, bookmarks, and reader view fallback.
- [x] **Ubuntu-Inspired App Library**: Full Software Center indexing 50+ registered apps across 10 categories.
- [x] **Three.js 3D Arcade Suite**:
  - `MarbleRunner3D`: Sphere physics maze with gem collection.
  - `SpaceTunnel3D`: High-speed cyberpunk neon warp runner.
  - `VoxelIsland3D`: Procedural voxel terrain sandbox with day/night cycles.
- [x] **Productivity & Developer Suite**: Spreadsheet, Markdown Studio, Todo, JSON Formatter, Code Playground, API Client, Color Studio, Regex Studio.
- [x] **Complete 13 Markdown Documentation Suite**.

---

### v2.5 — Virtual Networking & Cloud Sync (Next Milestone)
- [ ] **WebRTC Peer-to-Peer Networking**: File sharing and multi-user chat between two browser instances without servers.
- [ ] **Cloud Storage Provider Sync**: Optional two-way synchronization of the VFS to Google Drive or GitHub Gist.
- [ ] **Terminal Package Manager Simulation**: Simulated `apt` / `brew` CLI commands to install community web packages.
- [ ] **Multi-Monitor Virtual Desktops**: Mission Control Spaces allowing multiple desktop workspaces.

---

### v3.0 — WebAssembly Runtime & Spatial Computing
- [ ] **Wasm Micro-Linux Execution**: Booting an in-browser Alpine Linux kernel via WebAssembly and x86 emulator.
- [ ] **Spatial 3D Desktop Mode**: WebXR mode allowing windows to float in 3D VR/AR space.
- [ ] **AI Assistant Integration**: On-device WebLLM model running in a background Web Worker for desktop intelligence.
