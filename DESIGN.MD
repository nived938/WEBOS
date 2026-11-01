# NOVA OS Design System Specifications

## 1. Design Philosophy

NOVA OS combines the fluid, refined ergonomics of macOS with celestial neon accents. The visual identity emphasizes glassmorphism, depth hierarchies, subtle borders, and smooth transitions.

---

## 2. Color Palette & Tokens

- **Surface Base**: Neutral dark `rgba(15, 15, 20, 0.85)` / Neutral light `rgba(255, 255, 255, 0.85)`
- **Glass Blur**: `backdrop-blur-2xl` to `backdrop-blur-3xl`
- **Border Highlight**: `border-white/15` (dark mode) / `border-black/10` (light mode)
- **Primary Accent**: Cyan `#06b6d4`, Blue `#3b82f6`, Indigo `#6366f1`
- **Status Signals**:
  - Success / Online: Emerald `#10b981`
  - Warning / Warmth: Amber `#f59e0b`
  - Danger / Error: Red `#ef4444`

---

## 3. UI Component System (`src/components/ui/`)

- `GlassCard`: Standardized liquid glass container with border highlight and elevation shadows.
- `GlassButton`: Tactile button with primary, secondary, danger, ghost, and icon variants.
- `GlassToggle`: Animated toggle switch with Web Audio feedback.
- `GlassSlider`: Smooth range input with percentage gradient track and readout.

---

## 4. Typography & Spacing

- Primary Font Family: System sans-serif stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`).
- Monospace Stack: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
- Elevation Shadows: Soft multi-stop shadows (`shadow-[0_20px_50px_rgba(0,0,0,0.5)]`).
