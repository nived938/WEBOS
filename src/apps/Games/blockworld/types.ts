export type BlockId =
  | 'air'
  | 'grass'
  | 'dirt'
  | 'stone'
  | 'sand'
  | 'wood'
  | 'leaves'
  | 'water'
  | 'snow'
  | 'coal'
  | 'iron'
  | 'gold'
  | 'diamond'
  | 'glass'
  | 'planks'
  | 'crafting_table'
  | 'furnace'
  | 'chest'
  | 'torch'

export interface BlockDef {
  id: BlockId
  name: string
  color: number
  transparent?: boolean
  hardness: number
  drops: BlockId
  dropCount?: number
  isSolid: boolean
  isLightSource?: boolean
}

export const BLOCK_DEFS: Record<BlockId, BlockDef> = {
  air: { id: 'air', name: 'Air', color: 0x000000, transparent: true, hardness: 0, drops: 'air', isSolid: false },
  grass: { id: 'grass', name: 'Grass Block', color: 0x22c55e, hardness: 0.6, drops: 'dirt', isSolid: true },
  dirt: { id: 'dirt', name: 'Dirt', color: 0x78350f, hardness: 0.5, drops: 'dirt', isSolid: true },
  stone: { id: 'stone', name: 'Stone', color: 0x64748b, hardness: 1.5, drops: 'stone', isSolid: true },
  sand: { id: 'sand', name: 'Sand', color: 0xfacc15, hardness: 0.5, drops: 'sand', isSolid: true },
  wood: { id: 'wood', name: 'Oak Wood', color: 0xb45309, hardness: 1.0, drops: 'wood', isSolid: true },
  leaves: { id: 'leaves', name: 'Oak Leaves', color: 0x15803d, transparent: true, hardness: 0.2, drops: 'leaves', isSolid: true },
  water: { id: 'water', name: 'Water', color: 0x38bdf8, transparent: true, hardness: 100, drops: 'air', isSolid: false },
  snow: { id: 'snow', name: 'Snow Block', color: 0xf8fafc, hardness: 0.3, drops: 'snow', isSolid: true },
  coal: { id: 'coal', name: 'Coal Ore', color: 0x334155, hardness: 2.0, drops: 'coal', isSolid: true },
  iron: { id: 'iron', name: 'Iron Ore', color: 0xc084fc, hardness: 2.5, drops: 'iron', isSolid: true },
  gold: { id: 'gold', name: 'Gold Ore', color: 0xfbbf24, hardness: 3.0, drops: 'gold', isSolid: true },
  diamond: { id: 'diamond', name: 'Diamond Crystal', color: 0x06b6d4, hardness: 4.0, drops: 'diamond', isSolid: true },
  glass: { id: 'glass', name: 'Glass', color: 0xa5f3fc, transparent: true, hardness: 0.3, drops: 'air', isSolid: true },
  planks: { id: 'planks', name: 'Wood Planks', color: 0xd97706, hardness: 0.8, drops: 'planks', isSolid: true },
  crafting_table: { id: 'crafting_table', name: 'Crafting Table', color: 0xb45309, hardness: 1.0, drops: 'crafting_table', isSolid: true },
  furnace: { id: 'furnace', name: 'Stone Furnace', color: 0x475569, hardness: 2.0, drops: 'furnace', isSolid: true },
  chest: { id: 'chest', name: 'Wood Chest', color: 0x92400e, hardness: 1.0, drops: 'chest', isSolid: true },
  torch: { id: 'torch', name: 'Torch', color: 0xf59e0b, transparent: true, hardness: 0.1, drops: 'torch', isSolid: false, isLightSource: true },
}

export interface InventorySlot {
  blockId: BlockId
  count: number
}

export type GameMode = 'survival' | 'creative'
export type WorldSize = 'small' | 'medium' | 'large'

export interface WorldSaveData {
  id: string
  name: string
  seed: number
  size: WorldSize
  mode: GameMode
  createdAt: number
  lastPlayed: number
  player: {
    x: number
    y: number
    z: number
    pitch: number
    yaw: number
    health: number
    hunger: number
    inventory: (InventorySlot | null)[]
    hotbarIndex: number
    isFlying: boolean
  }
  // Store delta of modified blocks: `${x},${y},${z}` -> BlockId
  modifiedBlocks: Record<string, BlockId>
  dayTime: number // 0 to 24000
}

export interface CraftingRecipe {
  id: string
  name: string
  result: InventorySlot
  gridWidth: number
  gridHeight: number
  // Pattern row by row
  pattern: (BlockId | null)[]
}
