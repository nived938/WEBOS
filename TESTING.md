# TESTING.md - Quality Assurance & Test Strategy for NOVA OS

This document details the test architecture, test runners, execution procedures, and testing patterns for NOVA OS.

---

## 1. Test Framework

NOVA OS uses **Vitest 5.0+** with JSDOM environment for blazing-fast unit and component testing.

### Key Advantages
- Native Vite transform pipeline sharing `vite.config.ts`.
- Instant test startup times and TypeScript compilation without extra Babel configurations.
- Compatibility with Jest assertion APIs (`describe`, `it`, `expect`, `beforeEach`).

---

## 2. Test Execution Commands

```bash
# Run all tests in the repository once
npm test

# Run tests in continuous watch mode during development
npx vitest

# Run tests matching a specific pattern
npx vitest run apps.test.ts

# Generate test coverage report
npx vitest run --coverage
```

---

## 3. Test Suites Overview

### A. Application Registry Test Suite (`src/core/appRegistry/__tests__/apps.test.ts`)
- **Core Applications Coverage**: Verifies that essential system apps (Finder, Browser, Mail, Calendar, Notes, Calculator, Photos, Music, Terminal, Settings, App Store, App Library, Games, Trash) are registered.
- **Extended Applications Coverage**: Verifies that all 50+ extended apps and 2D/3D games have titles, categories, default dimensions, and components.
- **Dock App Classification**: Validates that dock applications are flagged accurately (`isDockApp`).
- **3D Three.js Games Verification**: Checks that `game_marble3d`, `game_space3d`, and `game_voxel3d` are registered under the 'Games' category.

### B. Wallpaper Resiliency Test Suite (`src/core/appRegistry/__tests__/apps.test.ts`)
- **Fallback Color Existence**: Asserts that all wallpapers define valid hex `fallbackColor` codes.
- **CSS Style Integrity**: Verifies gradient syntax and preloading strings.
- **Safe Fallback Recovery**: Tests `getWallpaperById` with nonexistent IDs to ensure graceful fallback without undefined crashes.

### C. Calculator Arithmetic Suite (`src/apps/Calculator/__tests__/calculator.test.ts`)
- Validates basic operations (addition, subtraction, multiplication, division).
- Tests decimal precision, square root, percentage, and clear functions.

### D. Virtual File System Suite (`src/core/filesystem/__tests__/vfs.test.ts`)
- Verifies root node hierarchy creation (`/Users/guest/Desktop`, `Documents`, etc.).
- Tests file creation, folder creation, renaming, moving, and trash deletion.

---

## 4. Writing New Tests

When adding a new feature or application, add corresponding tests in a `__tests__` directory alongside the module:

```typescript
import { describe, it, expect } from 'vitest'
import { myUtility } from '../myUtility'

describe('MyUtility', () => {
  it('should compute valid transform coordinates', () => {
    const result = myUtility(100, 200)
    expect(result).toEqual({ x: 100, y: 200 })
  })
})
```
