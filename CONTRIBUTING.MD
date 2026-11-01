# Contributing to NOVA OS

Thank you for your interest in contributing to **NOVA OS**! This document provides guidelines and workflows for contributing bug fixes, features, optimizations, and documentation.

---

## 1. Development Principles

- **Preserve Existing Architecture**: All applications must register through `APPS_REGISTRY` in `src/core/appRegistry/apps.config.ts`.
- **Zero Broken Features**: Do not replace functional systems with placeholder mockups.
- **Audio & Visual Consistency**: Use the procedural `soundService` for audio feedback and Tailwind glass tokens for UI styling.
- **Resource Hygiene**: Any WebGL (Three.js), timers, or event listeners must be cleaned up on component unmount.

---

## 2. Getting Started

1. **Fork and Clone** the repository:
   ```bash
   git clone https://github.com/nived938/WEBOS.git
   cd WEBOS
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Local Development Server**:
   ```bash
   npm run dev
   ```

---

## 3. Branching Strategy

- `main`: Production release branch. All commits must pass CI tests and builds.
- Feature branches: `feature/<feature-name>` (e.g., `feature/virtual-desktops`)
- Bugfix branches: `fix/<bug-description>` (e.g., `fix/window-controls`)

---

## 4. Verification Workflow

Before submitting a Pull Request, verify that all checks pass:

```bash
# Run unit tests
npm test

# Run linter
npm run lint

# Run production build
npm run build
```

---

## 5. Pull Request Guidelines

1. Ensure atomic commits with descriptive commit messages following the Conventional Commits format (`feat:`, `fix:`, `docs:`, `perf:`).
2. Reference relevant issue numbers in the PR description.
3. Include screenshots or video recordings for UI changes.
