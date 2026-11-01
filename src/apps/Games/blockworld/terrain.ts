import type { BlockId } from './types'

export const CHUNK_SIZE = 16
export const CHUNK_HEIGHT = 32
export const SEA_LEVEL = 7

// Simple fast deterministic 2D/3D pseudo-random hash generator
export class SeededNoise {
  private seed: number

  constructor(seed: number = 1337) {
    this.seed = seed
  }

  // Linear congruential pseudo-random generator
  private hash(x: number, z: number): number {
    let n = Math.sin(x * 12.9898 + z * 78.233 + this.seed * 0.123) * 43758.5453
    return n - Math.floor(n)
  }

  // Smooth 2D noise with bilinear interpolation
  public noise2D(x: number, z: number): number {
    const x0 = Math.floor(x)
    const x1 = x0 + 1
    const z0 = Math.floor(z)
    const z1 = z0 + 1

    const sx = x - x0
    const sz = z - z0

    const n00 = this.hash(x0, z0)
    const n10 = this.hash(x1, z0)
    const n01 = this.hash(x0, z1)
    const n11 = this.hash(x1, z1)

    // Smoothstep
    const fx = sx * sx * (3 - 2 * sx)
    const fz = sz * sz * (3 - 2 * sz)

    const nx0 = n00 * (1 - fx) + n10 * fx
    const nx1 = n01 * (1 - fx) + n11 * fx

    return nx0 * (1 - fz) + nx1 * fz
  }

  // Multi-octave fractal noise
  public fractal2D(x: number, z: number, octaves: number = 3): number {
    let total = 0
    let frequency = 1
    let amplitude = 1
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, z * frequency) * amplitude
      maxValue += amplitude
      amplitude *= 0.5
      frequency *= 2
    }

    return total / maxValue
  }

  // 3D noise for caves
  public noise3D(x: number, y: number, z: number): number {
    const xy = this.noise2D(x + y * 0.1, z)
    const yz = this.noise2D(z + y * 0.1, x)
    return (xy + yz) / 2
  }
}

export type BiomeType = 'plains' | 'forest' | 'mountains' | 'desert' | 'snow'

export interface ChunkData {
  cx: number
  cz: number
  blocks: Uint8Array // Flat index array of block enum
}

export const BLOCK_NUMS: BlockId[] = [
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

const BLOCK_TO_NUM = new Map<BlockId, number>(BLOCK_NUMS.map((id, index) => [id, index]))
export function blockIdToNum(id: BlockId): number {
  return BLOCK_TO_NUM.get(id) || 0
}

export function numToBlockId(num: number): BlockId {
  return BLOCK_NUMS[num] || 'air'
}

export class WorldGenerator {
  private noise: SeededNoise
  private biomeNoise: SeededNoise
  private caveNoise: SeededNoise

  constructor(seed: number = 1337) {
    this.noise = new SeededNoise(seed)
    this.biomeNoise = new SeededNoise(seed + 9999)
    this.caveNoise = new SeededNoise(seed + 4242)
  }

  public getBiome(wx: number, wz: number): BiomeType {
    const v = this.biomeNoise.noise2D(wx * 0.008, wz * 0.008)
    if (v < 0.2) return 'desert'
    if (v < 0.45) return 'plains'
    if (v < 0.75) return 'forest'
    if (v < 0.9) return 'mountains'
    return 'snow'
  }

  public getHeight(wx: number, wz: number, biome: BiomeType): number {
    const base = this.noise.fractal2D(wx * 0.02, wz * 0.02, 3)
    let minH = 6
    let maxH = 15

    if (biome === 'mountains' || biome === 'snow') {
      minH = 10
      maxH = 26
    } else if (biome === 'desert') {
      minH = 6
      maxH = 12
    } else if (biome === 'plains') {
      minH = 7
      maxH = 14
    } else if (biome === 'forest') {
      minH = 8
      maxH = 16
    }

    return Math.floor(minH + base * (maxH - minH))
  }

  public generateChunk(cx: number, cz: number, modifiedBlocks?: Record<string, BlockId>): ChunkData {
    const blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE)
    const getIndex = (x: number, y: number, z: number) =>
      x + z * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE)

    const startX = cx * CHUNK_SIZE
    const startZ = cz * CHUNK_SIZE

    // Trees to plant in this chunk
    const trees: { x: number; y: number; z: number }[] = []

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const wx = startX + x
        const wz = startZ + z
        const biome = this.getBiome(wx, wz)
        const height = this.getHeight(wx, wz, biome)

        for (let y = 0; y < CHUNK_HEIGHT; y++) {
          const idx = getIndex(x, y, z)

          // Bedrock / Bottom stone
          if (y === 0) {
            blocks[idx] = blockIdToNum('stone')
            continue
          }

          // Caves check
          if (y > 1 && y < height - 1) {
            const caveVal = this.caveNoise.noise3D(wx * 0.06, y * 0.08, wz * 0.06)
            if (caveVal > 0.62) {
              blocks[idx] = blockIdToNum('air')
              continue
            }
          }

          if (y <= height) {
            if (y === height) {
              if (y < SEA_LEVEL + 1) {
                blocks[idx] = blockIdToNum('sand')
              } else if (biome === 'desert') {
                blocks[idx] = blockIdToNum('sand')
              } else if (biome === 'snow' || y >= 20) {
                blocks[idx] = blockIdToNum('snow')
              } else {
                blocks[idx] = blockIdToNum('grass')
              }
            } else if (y >= height - 3) {
              if (biome === 'desert') {
                blocks[idx] = blockIdToNum('sand')
              } else {
                blocks[idx] = blockIdToNum('dirt')
              }
            } else {
              // Underground ore generation
              const oreNoise = this.noise.noise2D(wx * 0.2 + y, wz * 0.2)
              if (y < 8 && oreNoise > 0.88) {
                blocks[idx] = blockIdToNum('diamond')
              } else if (y < 12 && oreNoise > 0.80) {
                blocks[idx] = blockIdToNum('gold')
              } else if (y < 18 && oreNoise > 0.70) {
                blocks[idx] = blockIdToNum('iron')
              } else if (oreNoise > 0.65) {
                blocks[idx] = blockIdToNum('coal')
              } else {
                blocks[idx] = blockIdToNum('stone')
              }
            }
          } else if (y <= SEA_LEVEL) {
            blocks[idx] = blockIdToNum('water')
          } else {
            blocks[idx] = blockIdToNum('air')
          }
        }

        // Tree placement chance in forests/plains
        if (
          height > SEA_LEVEL &&
          (biome === 'forest' || biome === 'plains') &&
          x > 2 &&
          x < CHUNK_SIZE - 3 &&
          z > 2 &&
          z < CHUNK_SIZE - 3
        ) {
          const treeChance = biome === 'forest' ? 0.04 : 0.008
          if (this.noise.noise2D(wx * 0.5, wz * 0.5) < treeChance) {
            trees.push({ x, y: height + 1, z })
          }
        }
      }
    }

    // Generate trees
    for (const tree of trees) {
      const trunkHeight = 4
      if (tree.y + trunkHeight + 2 >= CHUNK_HEIGHT) continue

      // Trunk
      for (let ty = 0; ty < trunkHeight; ty++) {
        const idx = getIndex(tree.x, tree.y + ty, tree.z)
        blocks[idx] = blockIdToNum('wood')
      }

      // Foliage crown
      const topY = tree.y + trunkHeight
      for (let ox = -2; ox <= 2; ox++) {
        for (let oz = -2; oz <= 2; oz++) {
          for (let oy = 0; oy <= 2; oy++) {
            if (Math.abs(ox) === 2 && Math.abs(oz) === 2 && oy === 2) continue
            const lx = tree.x + ox
            const ly = topY - 1 + oy
            const lz = tree.z + oz

            if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE && ly < CHUNK_HEIGHT) {
              const lidx = getIndex(lx, ly, lz)
              if (blocks[lidx] === blockIdToNum('air')) {
                blocks[lidx] = blockIdToNum('leaves')
              }
            }
          }
        }
      }
    }

    // Apply modified delta blocks
    if (modifiedBlocks) {
      for (const [key, blockId] of Object.entries(modifiedBlocks)) {
        const [bx, by, bz] = key.split(',').map(Number)
        const localX = bx - startX
        const localZ = bz - startZ
        if (
          localX >= 0 &&
          localX < CHUNK_SIZE &&
          localZ >= 0 &&
          localZ < CHUNK_SIZE &&
          by >= 0 &&
          by < CHUNK_HEIGHT
        ) {
          const idx = getIndex(localX, by, localZ)
          blocks[idx] = blockIdToNum(blockId)
        }
      }
    }

    return { cx, cz, blocks }
  }
}
