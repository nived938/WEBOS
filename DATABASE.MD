# Database & Client-Side Storage Architecture

## 1. Storage Overview

NOVA OS utilizes browser-native client-side storage technologies for persistence without external server dependencies:

- **IndexedDB**: Persistent Virtual File System (VFS) nodes, documents, images, audio blobs, and application data.
- **LocalStorage**: System preferences and user configuration (`nova_os_settings_v2`), window layout caches, and favorites.

---

## 2. LocalStorage Key Schema

| Key | Version | Purpose |
| --- | --- | --- |
| `nova_os_settings_v2` | v2.5 | System settings including theme, wallpaper, cursor, audio, security |
| `nova_app_favorites_v1` | v1.0 | Pinned application identifiers |
| `nova_os_desktop_icon_positions_v2` | v2.0 | Desktop icon coordinate layout cache |

---

## 3. Schema Migrations

The settings store employs `migrateSettings(savedData: unknown): SystemSettings` in `src/core/settings/settingsStore.ts`. When new configuration parameters are introduced:

1. Defaults are populated from `DEFAULT_SETTINGS`.
2. Existing stored user preferences are preserved.
3. Obsolete keys are discarded or sanitized.
