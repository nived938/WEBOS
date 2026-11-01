# Contextual Semantic Engine Knowledge Ledger

## Semantic Engine Knowledge Records

```json
[
  {
    "id": "mem-001",
    "topic": "window-pointer-capture",
    "rule": "WindowFrame pointer capture for window dragging must ignore interactive child elements (button, [data-window-controls], input, select, textarea) to avoid blocking clicks on window control buttons."
  },
  {
    "id": "mem-002",
    "topic": "desktop-wallpaper-contract",
    "rule": "Every wallpaper defined in src/core/settings/wallpapers.ts must provide a valid hex fallbackColor (e.g. #090919) to ensure desktop never renders pure black during load."
  },
  {
    "id": "mem-003",
    "topic": "threejs-resource-cleanup",
    "rule": "All 3D applications (MarbleRunner3D, SpaceTunnel3D, VoxelIsland3D) must cancel requestAnimationFrame and dispose of renderer, geometry, and material resources in their useEffect cleanup hook."
  },
  {
    "id": "mem-004",
    "topic": "storage-backwards-compatibility",
    "rule": "Settings store uses migrateSettings() to guarantee existing localStorage nova_os_settings_v2 records are preserved without breaking user configs when new settings properties are added."
  }
]
```
