import { describe, it, expect } from 'vitest'
import {
  BLOCK_DEFS,
  type BlockId,
  type InventorySlot,
} from '../types'
import { findMatchingRecipe, CRAFTING_RECIPES } from '../recipes'
import {
  WorldGenerator,
  CHUNK_SIZE,
  CHUNK_HEIGHT,
  SEA_LEVEL,
  numToBlockId,
} from '../terrain'

describe('NOVA Blockworld - Block Definitions', () => {
  it('should have all fundamental block definitions configured', () => {
    const requiredBlocks: BlockId[] = [
      'air',
      'grass',
      'dirt',
      'stone',
      'sand',
      'wood',
      'leaves',
      'water',
      'snow',
      'coal',
      'iron',
      'gold',
      'diamond',
      'glass',
      'planks',
      'crafting_table',
      'furnace',
      'chest',
      'torch',
    ]

    requiredBlocks.forEach((id) => {
      const def = BLOCK_DEFS[id]
      expect(def).toBeDefined()
      expect(def.name).toBeDefined()
      expect(typeof def.color).toBe('number')
      expect(def.hardness).toBeGreaterThanOrEqual(0)
    })
  })

  it('should ensure air is transparent and non-solid', () => {
    expect(BLOCK_DEFS.air.transparent).toBe(true)
    expect(BLOCK_DEFS.air.isSolid).toBe(false)
  })

  it('should ensure torch is a light source and non-solid', () => {
    expect(BLOCK_DEFS.torch.isLightSource).toBe(true)
    expect(BLOCK_DEFS.torch.isSolid).toBe(false)
  })
})

describe('NOVA Blockworld - Crafting System', () => {
  it('should have predefined valid crafting recipes', () => {
    expect(CRAFTING_RECIPES.length).toBeGreaterThanOrEqual(6)
  })

  it('should craft 4 wood planks from 1 wood block', () => {
    const grid: (BlockId | null)[] = [
      'wood', null, null,
      null, null, null,
      null, null, null,
    ]
    const result: InventorySlot | null = findMatchingRecipe(grid, 3)
    expect(result).not.toBeNull()
    expect(result?.blockId).toBe('planks')
    expect(result?.count).toBe(4)
  })

  it('should craft 1 crafting table from 4 planks in a 2x2 shape', () => {
    const grid: (BlockId | null)[] = [
      'planks', 'planks', null,
      'planks', 'planks', null,
      null, null, null,
    ]
    const result = findMatchingRecipe(grid, 3)
    expect(result).not.toBeNull()
    expect(result?.blockId).toBe('crafting_table')
    expect(result?.count).toBe(1)
  })

  it('should craft 1 stone furnace from 8 stone blocks in a hollow 3x3 square', () => {
    const grid: (BlockId | null)[] = [
      'stone', 'stone', 'stone',
      'stone', null,    'stone',
      'stone', 'stone', 'stone',
    ]
    const result = findMatchingRecipe(grid, 3)
    expect(result).not.toBeNull()
    expect(result?.blockId).toBe('furnace')
    expect(result?.count).toBe(1)
  })

  it('should craft 1 wood chest from 8 wood planks in a hollow 3x3 square', () => {
    const grid: (BlockId | null)[] = [
      'planks', 'planks', 'planks',
      'planks', null,     'planks',
      'planks', 'planks', 'planks',
    ]
    const result = findMatchingRecipe(grid, 3)
    expect(result).not.toBeNull()
    expect(result?.blockId).toBe('chest')
    expect(result?.count).toBe(1)
  })

  it('should craft 4 torches from 1 coal above 1 wood', () => {
    const grid: (BlockId | null)[] = [
      'coal', null, null,
      'wood', null, null,
      null, null, null,
    ]
    const result = findMatchingRecipe(grid, 3)
    expect(result).not.toBeNull()
    expect(result?.blockId).toBe('torch')
    expect(result?.count).toBe(4)
  })

  it('should craft 4 glass blocks from 4 sand blocks in a 2x2 shape', () => {
    const grid: (BlockId | null)[] = [
      'sand', 'sand', null,
      'sand', 'sand', null,
      null, null, null,
    ]
    const result = findMatchingRecipe(grid, 3)
    expect(result).not.toBeNull()
    expect(result?.blockId).toBe('glass')
    expect(result?.count).toBe(4)
  })

  it('should return null for invalid or non-matching recipe patterns', () => {
    const grid: (BlockId | null)[] = [
      'dirt', 'dirt', 'dirt',
      'sand', 'sand', 'sand',
      null, null, null,
    ]
    const result = findMatchingRecipe(grid, 3)
    expect(result).toBeNull()
  })
})

describe('NOVA Blockworld - Procedural Terrain & Chunks', () => {
  const seed = 12345
  const gen = new WorldGenerator(seed)

  it('should deterministically calculate height for identical coordinates and seed', () => {
    const biome = gen.getBiome(10, 20)
    const h1 = gen.getHeight(10, 20, biome)
    const h2 = gen.getHeight(10, 20, biome)
    expect(h1).toBe(h2)
    expect(h1).toBeGreaterThanOrEqual(1)
    expect(h1).toBeLessThan(CHUNK_HEIGHT)
  })

  it('should assign a valid biome to any coordinate', () => {
    const validBiomes = ['plains', 'forest', 'mountains', 'desert', 'snow']
    const biome = gen.getBiome(50, 50)
    expect(validBiomes).toContain(biome)
  })

  it('should generate a chunk with exact dimensions (16x32x16)', () => {
    const chunk = gen.generateChunk(0, 0)
    expect(chunk.blocks.length).toBe(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE)
  })

  it('should populate bedrock/stone layers underground at low y coordinates', () => {
    const chunk = gen.generateChunk(0, 0)
    let foundSolid = false
    // Check underground slice at y = 1
    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const index = x + z * CHUNK_SIZE + 1 * CHUNK_SIZE * CHUNK_SIZE
        const blockId = numToBlockId(chunk.blocks[index])
        if (blockId === 'stone' || blockId === 'dirt') {
          foundSolid = true
          break
        }
      }
    }
    expect(foundSolid).toBe(true)
  })

  it('should apply modifiedBlocks deltas to generated chunks', () => {
    const modifiedBlocks: Record<string, BlockId> = {
      '5,10,5': 'gold',
      '2,15,3': 'diamond',
    }
    const chunk = gen.generateChunk(0, 0, modifiedBlocks)
    // Check 5,10,5
    const idx1 = 5 + 5 * CHUNK_SIZE + 10 * CHUNK_SIZE * CHUNK_SIZE
    expect(numToBlockId(chunk.blocks[idx1])).toBe('gold')

    // Check 2,15,3
    const idx2 = 2 + 3 * CHUNK_SIZE + 15 * CHUNK_SIZE * CHUNK_SIZE
    expect(numToBlockId(chunk.blocks[idx2])).toBe('diamond')
  })
})
