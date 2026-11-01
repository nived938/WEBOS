import * as THREE from 'three'
import {
  CHUNK_SIZE,
  CHUNK_HEIGHT,
  type ChunkData,
  numToBlockId,
} from './terrain'
import { BLOCK_DEFS, type BlockId } from './types'

// Face normals and offset coordinates for face visibility culling
// 0: +X, 1: -X, 2: +Y, 3: -Y, 4: +Z, 5: -Z
const FACE_OFFSETS = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

// Precomputed face vertices (6 faces * 2 triangles * 3 vertices)
const FACE_VERTICES = [
  // +X (right)
  [
    [1, 0, 0], [1, 1, 0], [1, 1, 1],
    [1, 0, 0], [1, 1, 1], [1, 0, 1],
  ],
  // -X (left)
  [
    [0, 0, 1], [0, 1, 1], [0, 1, 0],
    [0, 0, 1], [0, 1, 0], [0, 0, 0],
  ],
  // +Y (top)
  [
    [0, 1, 0], [0, 1, 1], [1, 1, 1],
    [0, 1, 0], [1, 1, 1], [1, 1, 0],
  ],
  // -Y (bottom)
  [
    [0, 0, 1], [0, 0, 0], [1, 0, 0],
    [0, 0, 1], [1, 0, 0], [1, 0, 1],
  ],
  // +Z (front)
  [
    [1, 0, 1], [1, 1, 1], [0, 1, 1],
    [1, 0, 1], [0, 1, 1], [0, 0, 1],
  ],
  // -Z (back)
  [
    [0, 0, 0], [0, 1, 0], [1, 1, 0],
    [0, 0, 0], [1, 1, 0], [1, 0, 0],
  ],
]

// Face lighting shades for nice voxel shadows
const FACE_SHADES = [0.8, 0.8, 1.0, 0.5, 0.9, 0.9]

export class ChunkMeshBuilder {
  private materials: Map<string, THREE.MeshLambertMaterial> = new Map()

  constructor() {
    // Shared materials
  }

  public getMaterial(color: number, transparent: boolean = false, opacity: number = 1): THREE.MeshLambertMaterial {
    const key = `${color}_${transparent}_${opacity}`
    let mat = this.materials.get(key)
    if (!mat) {
      mat = new THREE.MeshLambertMaterial({
        color,
        transparent,
        opacity,
        roughness: 0.9,
      } as any)
      this.materials.set(key, mat)
    }
    return mat
  }

  public buildChunkMesh(chunk: ChunkData, neighborChunks?: {
    px?: ChunkData
    nx?: ChunkData
    pz?: ChunkData
    nz?: ChunkData
  }): THREE.Group {
    const group = new THREE.Group()
    group.position.set(chunk.cx * CHUNK_SIZE, 0, chunk.cz * CHUNK_SIZE)

    const getBlockNum = (x: number, y: number, z: number): number => {
      if (y < 0 || y >= CHUNK_HEIGHT) return 0 // Air
      if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
        return chunk.blocks[x + z * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE)]
      }
      // Query neighbors
      if (x < 0 && neighborChunks?.nx) {
        return neighborChunks.nx.blocks[(CHUNK_SIZE - 1) + z * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE)]
      }
      if (x >= CHUNK_SIZE && neighborChunks?.px) {
        return neighborChunks.px.blocks[0 + z * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE)]
      }
      if (z < 0 && neighborChunks?.nz) {
        return neighborChunks.nz.blocks[x + (CHUNK_SIZE - 1) * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE)]
      }
      if (z >= CHUNK_SIZE && neighborChunks?.pz) {
        return neighborChunks.pz.blocks[x + 0 * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE)]
      }
      return 0
    }

    // Geometry vertex buffers grouped by BlockId
    const blockPositions: Map<BlockId, number[]> = new Map()
    const blockNormals: Map<BlockId, number[]> = new Map()
    const blockColors: Map<BlockId, number[]> = new Map()

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let y = 0; y < CHUNK_HEIGHT; y++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          const bNum = chunk.blocks[x + z * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE)]
          if (bNum === 0) continue // Air

          const bId = numToBlockId(bNum)
          const bDef = BLOCK_DEFS[bId]
          if (!bDef || bDef.id === 'air') continue

          const baseColor = new THREE.Color(bDef.color)

          // Test all 6 faces for visibility culling
          for (let f = 0; f < 6; f++) {
            const [ox, oy, oz] = FACE_OFFSETS[f]
            const neighborNum = getBlockNum(x + ox, y + oy, z + oz)
            const neighborDef = BLOCK_DEFS[numToBlockId(neighborNum)]

            // Show face only if neighbor is air or transparent block (e.g. water, glass, leaves)
            const shouldRenderFace =
              neighborNum === 0 ||
              (!bDef.transparent && neighborDef?.transparent) ||
              (bDef.transparent && neighborDef?.id !== bDef.id)

            if (shouldRenderFace) {
              if (!blockPositions.has(bId)) {
                blockPositions.set(bId, [])
                blockNormals.set(bId, [])
                blockColors.set(bId, [])
              }
              const posArr = blockPositions.get(bId)!
              const normArr = blockNormals.get(bId)!
              const colArr = blockColors.get(bId)!

              const shade = FACE_SHADES[f]
              const faceCol = new THREE.Color(baseColor).multiplyScalar(shade)

              // Push the 6 vertices of this quad
              const verts = FACE_VERTICES[f]
              for (const v of verts) {
                posArr.push(x + v[0], y + v[1], z + v[2])
                normArr.push(ox, oy, oz)
                colArr.push(faceCol.r, faceCol.g, faceCol.b)
              }
            }
          }
        }
      }
    }

    // Build merged meshes per BlockId for maximum performance
    for (const [bId, positions] of blockPositions.entries()) {
      if (positions.length === 0) continue

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(blockNormals.get(bId)!, 3))
      geo.setAttribute('color', new THREE.Float32BufferAttribute(blockColors.get(bId)!, 3))

      const bDef = BLOCK_DEFS[bId]
      const mat = new THREE.MeshLambertMaterial({
        vertexColors: true,
        transparent: Boolean(bDef.transparent),
        opacity: bDef.id === 'water' ? 0.75 : bDef.id === 'glass' ? 0.5 : 1.0,
        side: bDef.transparent ? THREE.DoubleSide : THREE.FrontSide,
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.castShadow = !bDef.transparent
      mesh.receiveShadow = true
      mesh.userData = { chunkX: chunk.cx, chunkZ: chunk.cz, blockId: bId }

      group.add(mesh)
    }

    return group
  }

  public dispose() {
    this.materials.forEach((mat) => mat.dispose())
    this.materials.clear()
  }
}
