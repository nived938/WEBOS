import type { BlockId, CraftingRecipe, InventorySlot } from './types'

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  // 1 Wood -> 4 Planks (2x2 or 3x3 single slot)
  {
    id: 'planks',
    name: 'Wood Planks',
    result: { blockId: 'planks', count: 4 },
    gridWidth: 1,
    gridHeight: 1,
    pattern: ['wood'],
  },
  // 4 Planks -> 1 Crafting Table
  {
    id: 'crafting_table',
    name: 'Crafting Table',
    result: { blockId: 'crafting_table', count: 1 },
    gridWidth: 2,
    gridHeight: 2,
    pattern: ['planks', 'planks', 'planks', 'planks'],
  },
  // 8 Stone -> 1 Furnace
  {
    id: 'furnace',
    name: 'Stone Furnace',
    result: { blockId: 'furnace', count: 1 },
    gridWidth: 3,
    gridHeight: 3,
    pattern: [
      'stone', 'stone', 'stone',
      'stone', null,    'stone',
      'stone', 'stone', 'stone',
    ],
  },
  // 8 Planks -> 1 Chest
  {
    id: 'chest',
    name: 'Wood Chest',
    result: { blockId: 'chest', count: 1 },
    gridWidth: 3,
    gridHeight: 3,
    pattern: [
      'planks', 'planks', 'planks',
      'planks', null,     'planks',
      'planks', 'planks', 'planks',
    ],
  },
  // 1 Coal + 1 Wood -> 4 Torches
  {
    id: 'torches',
    name: 'Torches',
    result: { blockId: 'torch', count: 4 },
    gridWidth: 1,
    gridHeight: 2,
    pattern: ['coal', 'wood'],
  },
  // 4 Sand -> 4 Glass
  {
    id: 'glass',
    name: 'Glass Block',
    result: { blockId: 'glass', count: 4 },
    gridWidth: 2,
    gridHeight: 2,
    pattern: ['sand', 'sand', 'sand', 'sand'],
  },
]

export function findMatchingRecipe(grid: (BlockId | null)[], gridSize: 2 | 3 = 3): InventorySlot | null {
  // Check if grid is all null
  if (grid.every((c) => c === null)) return null

  // Trim grid bounding box
  let minRow: number = gridSize
  let maxRow = -1
  let minCol: number = gridSize
  let maxCol = -1

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r * gridSize + c] !== null) {
        if (r < minRow) minRow = r
        if (r > maxRow) maxRow = r
        if (c < minCol) minCol = c
        if (c > maxCol) maxCol = c
      }
    }
  }

  if (maxRow === -1) return null

  const width = maxCol - minCol + 1
  const height = maxRow - minRow + 1

  // Extract non-empty pattern
  const pattern: (BlockId | null)[] = []
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      pattern.push(grid[r * gridSize + c])
    }
  }

  for (const recipe of CRAFTING_RECIPES) {
    if (recipe.gridWidth === width && recipe.gridHeight === height) {
      let matches = true
      for (let i = 0; i < pattern.length; i++) {
        if (recipe.pattern[i] !== pattern[i]) {
          matches = false
          break
        }
      }
      if (matches) {
        return { ...recipe.result }
      }
    }
  }

  return null
}
