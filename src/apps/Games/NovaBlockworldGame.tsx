import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import {
  getAllWorlds,
  getWorldById,
  saveWorld,
  deleteWorld,
} from './blockworld/db'
import {
  type BlockId,
  type WorldSaveData,
  type InventorySlot,
  type GameMode,
  type WorldSize,
  BLOCK_DEFS,
} from './blockworld/types'
import {
  WorldGenerator,
  CHUNK_SIZE,
  CHUNK_HEIGHT,
  type ChunkData,
} from './blockworld/terrain'
import { ChunkMeshBuilder } from './blockworld/chunkMesh'
import { findMatchingRecipe } from './blockworld/recipes'
import {
  Play,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Heart,
  Utensils,
  Sun,
  Moon,
  Compass,
  X,
  Volume2,
  Sliders,
  Maximize2,
  Camera,
  Layers,
} from 'lucide-react'

const DEFAULT_HOTBAR: (InventorySlot | null)[] = [
  { blockId: 'dirt', count: 64 },
  { blockId: 'wood', count: 32 },
  { blockId: 'stone', count: 64 },
  { blockId: 'planks', count: 32 },
  { blockId: 'torch', count: 16 },
  { blockId: 'glass', count: 16 },
  null,
  null,
  null,
]

export const NovaBlockworldGame: React.FC<AppInstanceProps> = () => {
  // World Manager States
  const [worlds, setWorlds] = useState<WorldSaveData[]>([])
  const [activeWorld, setActiveWorld] = useState<WorldSaveData | null>(null)
  const [isInGame, setIsInGame] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [isCreatingWorld, setIsCreatingWorld] = useState(false)
  const [saveToast, setSaveToast] = useState<string | null>(null)

  // New World Form
  const [newWorldName, setNewWorldName] = useState('New Horizon')
  const [newWorldSeed, setNewWorldSeed] = useState(1337)
  const [newWorldMode, setNewWorldMode] = useState<GameMode>('survival')
  const [newWorldSize, setNewWorldSize] = useState<WorldSize>('medium')

  // Player Gameplay States
  const [health, setHealth] = useState(100)
  const [hunger, setHunger] = useState(100)
  const [isFlying, setIsFlying] = useState(false)
  const [hotbarIndex, setHotbarIndex] = useState(0)
  const [inventory, setInventory] = useState<(InventorySlot | null)[]>(() => {
    const inv: (InventorySlot | null)[] = Array(36).fill(null)
    DEFAULT_HOTBAR.forEach((s, idx) => {
      inv[idx] = s
    })
    return inv
  })

  // Crafting Grid States (3x3)
  const [craftGrid, setCraftGrid] = useState<(BlockId | null)[]>(Array(9).fill(null))
  const [craftResult, setCraftResult] = useState<InventorySlot | null>(null)

  // Settings
  const [fov, setFov] = useState(75)
  const [renderDist, setRenderDist] = useState(3)
  const [mouseSensitivity, setMouseSensitivity] = useState(0.002)

  // Canvas & Three.js Refs
  const mountRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    sunLight: THREE.DirectionalLight
    moonLight: THREE.DirectionalLight
    ambientLight: THREE.AmbientLight
    stars: THREE.Points
    clouds: THREE.Mesh
    reticleMesh: THREE.LineSegments
    particles: THREE.Points
    chunkMeshes: Map<string, THREE.Group>
    loadedChunks: Map<string, ChunkData>
    meshBuilder: ChunkMeshBuilder
    generator: WorldGenerator
    isLocked: boolean
    keys: Record<string, boolean>
    pos: THREE.Vector3
    vel: THREE.Vector3
    pitch: number
    yaw: number
    dayTime: number
    modifiedBlocks: Record<string, BlockId>
  } | null>(null)

  // Load existing worlds on mount
  useEffect(() => {
    getAllWorlds().then((res) => {
      setWorlds(res)
    })
  }, [])

  // Check crafting result whenever craftGrid changes
  useEffect(() => {
    const res = findMatchingRecipe(craftGrid, 3)
    setCraftResult(res)
  }, [craftGrid])

  // Trigger Save Notification
  const triggerSaveNotification = (msg: string) => {
    setSaveToast(msg)
    setTimeout(() => setSaveToast(null), 3000)
  }

  // Handle world creation
  const handleCreateWorld = async () => {
    soundService.playNotification()
    const worldId = 'world_' + Date.now()
    const newWorld: WorldSaveData = {
      id: worldId,
      name: newWorldName.trim() || 'Nova Horizon',
      seed: Number(newWorldSeed) || Math.floor(Math.random() * 999999),
      size: newWorldSize,
      mode: newWorldMode,
      createdAt: Date.now(),
      lastPlayed: Date.now(),
      player: {
        x: 0,
        y: 18,
        z: 0,
        pitch: 0,
        yaw: 0,
        health: 100,
        hunger: 100,
        inventory: Array(36)
          .fill(null)
          .map((_, i) => DEFAULT_HOTBAR[i] || null),
        hotbarIndex: 0,
        isFlying: newWorldMode === 'creative',
      },
      modifiedBlocks: {},
      dayTime: 6000, // Morning
    }

    await saveWorld(newWorld)
    const updated = await getAllWorlds()
    setWorlds(updated)
    setIsCreatingWorld(false)
    startPlayingWorld(newWorld)
  }

  // Handle world deletion
  const handleDeleteWorld = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    soundService.playTrashEmpty()
    if (confirm('Delete this world permanently?')) {
      await deleteWorld(id)
      const updated = await getAllWorlds()
      setWorlds(updated)
    }
  }

  // Start Playing World
  const startPlayingWorld = (world: WorldSaveData) => {
    soundService.playStartup()
    setActiveWorld(world)
    setHealth(world.player.health)
    setHunger(world.player.hunger)
    setIsFlying(world.player.isFlying)
    setInventory(world.player.inventory)
    setHotbarIndex(world.player.hotbarIndex || 0)
    setIsInGame(true)
    setIsPaused(false)
  }

  // Save Current Active World
  const handleSaveActiveWorld = useCallback(async () => {
    if (!activeWorld || !engineRef.current) return
    const eng = engineRef.current

    const updatedData: WorldSaveData = {
      ...activeWorld,
      lastPlayed: Date.now(),
      player: {
        x: eng.pos.x,
        y: eng.pos.y,
        z: eng.pos.z,
        pitch: eng.pitch,
        yaw: eng.yaw,
        health,
        hunger,
        inventory,
        hotbarIndex,
        isFlying,
      },
      modifiedBlocks: eng.modifiedBlocks,
      dayTime: eng.dayTime,
    }

    await saveWorld(updatedData)
    triggerSaveNotification('World saved to IndexedDB!')
  }, [activeWorld, health, hunger, inventory, hotbarIndex, isFlying])

  // Periodic Autosave every 25 seconds
  useEffect(() => {
    if (!isInGame || isPaused) return
    const timer = setInterval(() => {
      handleSaveActiveWorld()
    }, 25000)
    return () => clearInterval(timer)
  }, [isInGame, isPaused, handleSaveActiveWorld])

  // Initialize Three.js Engine when entering game
  useEffect(() => {
    if (!isInGame || !activeWorld) return
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 800
    const height = container.clientHeight || 550

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x78a7ff)
    scene.fog = new THREE.FogExp2(0x78a7ff, 0.02)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 300)
    camera.position.set(activeWorld.player.x, activeWorld.player.y, activeWorld.player.z)

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2)
    sunLight.position.set(40, 60, 20)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    scene.add(sunLight)

    const moonLight = new THREE.DirectionalLight(0x60a5fa, 0.2)
    moonLight.position.set(-40, -60, -20)
    scene.add(moonLight)

    // Stars field
    const starsGeo = new THREE.BufferGeometry()
    const starsCount = 500
    const starCoords = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount * 3; i += 3) {
      starCoords[i] = (Math.random() - 0.5) * 300
      starCoords[i + 1] = Math.random() * 150 + 20
      starCoords[i + 2] = (Math.random() - 0.5) * 300
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starCoords, 3))
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0 })
    const stars = new THREE.Points(starsGeo, starsMat)
    scene.add(stars)

    // Clouds plane
    const cloudGeo = new THREE.PlaneGeometry(300, 300)
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    const clouds = new THREE.Mesh(cloudGeo, cloudMat)
    clouds.rotation.x = Math.PI / 2
    clouds.position.y = 28
    scene.add(clouds)

    // Block highlight wireframe box
    const boxGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002)
    const wireframeGeo = new THREE.WireframeGeometry(boxGeo)
    const reticleMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    const reticleMesh = new THREE.LineSegments(wireframeGeo, reticleMat)
    reticleMesh.visible = false
    scene.add(reticleMesh)

    // Particle burst system for mining
    const partGeo = new THREE.BufferGeometry()
    const partCount = 40
    const partPos = new Float32Array(partCount * 3)
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3))
    const partMat = new THREE.PointsMaterial({ size: 0.15, vertexColors: false, color: 0x78350f })
    const particles = new THREE.Points(partGeo, partMat)
    particles.visible = false
    scene.add(particles)

    // Generator & Chunk Manager
    const generator = new WorldGenerator(activeWorld.seed)
    const meshBuilder = new ChunkMeshBuilder()
    const chunkMeshes = new Map<string, THREE.Group>()
    const loadedChunks = new Map<string, ChunkData>()

    const engine = {
      scene,
      camera,
      renderer,
      sunLight,
      moonLight,
      ambientLight,
      stars,
      clouds,
      reticleMesh,
      particles,
      chunkMeshes,
      loadedChunks,
      meshBuilder,
      generator,
      isLocked: false,
      keys: {} as Record<string, boolean>,
      pos: new THREE.Vector3(activeWorld.player.x, activeWorld.player.y, activeWorld.player.z),
      vel: new THREE.Vector3(0, 0, 0),
      pitch: activeWorld.player.pitch,
      yaw: activeWorld.player.yaw,
      dayTime: activeWorld.dayTime || 6000,
      modifiedBlocks: { ...activeWorld.modifiedBlocks },
    }
    engineRef.current = engine

    // Helper: Load chunks around player
    const updateChunks = () => {
      const pcx = Math.floor(engine.pos.x / CHUNK_SIZE)
      const pcz = Math.floor(engine.pos.z / CHUNK_SIZE)
      const radius = renderDist

      // Load missing
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const cx = pcx + dx
          const cz = pcz + dz
          const key = `${cx},${cz}`

          if (!engine.chunkMeshes.has(key)) {
            let chunk = engine.loadedChunks.get(key)
            if (!chunk) {
              chunk = generator.generateChunk(cx, cz, engine.modifiedBlocks)
              engine.loadedChunks.set(key, chunk)
            }
            const mesh = meshBuilder.buildChunkMesh(chunk)
            scene.add(mesh)
            engine.chunkMeshes.set(key, mesh)
          }
        }
      }

      // Unload distant chunks
      for (const [key, mesh] of engine.chunkMeshes.entries()) {
        const [cx, cz] = key.split(',').map(Number)
        if (Math.abs(cx - pcx) > radius + 1 || Math.abs(cz - pcz) > radius + 1) {
          scene.remove(mesh)
          mesh.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              const m = obj as THREE.Mesh
              m.geometry.dispose()
            }
          })
          engine.chunkMeshes.delete(key)
        }
      }
    }

    updateChunks()

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      engine.keys[e.code] = true

      if (e.code === 'KeyE') {
        setIsInventoryOpen((prev) => !prev)
      } else if (e.code === 'Escape') {
        setIsPaused(true)
        if (document.pointerLockElement) document.exitPointerLock?.()
      } else if (e.code.startsWith('Digit')) {
        const digit = parseInt(e.code.replace('Digit', ''), 10)
        if (digit >= 1 && digit <= 9) {
          setHotbarIndex(digit - 1)
        }
      } else if (e.code === 'KeyF' && activeWorld.mode === 'creative') {
        setIsFlying((prev) => !prev)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false
    }

    // Pointer Lock & Mouse Look
    const handleMouseMove = (e: MouseEvent) => {
      if (!engine.isLocked) return
      engine.yaw -= e.movementX * mouseSensitivity
      engine.pitch -= e.movementY * mouseSensitivity
      engine.pitch = Math.max(-Math.PI / 2.05, Math.min(Math.PI / 2.05, engine.pitch))
    }

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === container
      engine.isLocked = locked
      if (!locked) {
        setIsPaused(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('pointerlockchange', handlePointerLockChange)

    // Raycast center screen for target block
    const raycaster = new THREE.Raycaster()
    const centerPoint = new THREE.Vector2(0, 0)

    // Physics & Game Loop
    let animId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate)
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      if (!isPaused && !isInventoryOpen) {
        // Advance Day / Night cycle
        engine.dayTime = (engine.dayTime + dt * 20) % 24000
        const sunAngle = (engine.dayTime / 24000) * Math.PI * 2 - Math.PI / 2
        engine.sunLight.position.set(Math.cos(sunAngle) * 80, Math.sin(sunAngle) * 80, 20)
        engine.moonLight.position.set(-Math.cos(sunAngle) * 80, -Math.sin(sunAngle) * 80, -20)

        // Day/night sky color
        const isDay = Math.sin(sunAngle) > 0
        const sunElevation = Math.sin(sunAngle)
        let skyColor = 0x090d16
        if (sunElevation > 0.2) skyColor = 0x78a7ff
        else if (sunElevation > -0.1) skyColor = 0xf59e0b

        scene.background = new THREE.Color(skyColor)
        if (scene.fog) scene.fog.color.setHex(skyColor)
        starsMat.opacity = isDay ? 0 : 0.85
        clouds.position.x += dt * 0.5

        // Player Movement Calculations
        const moveSpeed = (engine.keys['ShiftLeft'] || engine.keys['ShiftRight'] ? 8 : 4.5) * (isFlying ? 1.8 : 1)
        const moveDir = new THREE.Vector3()

        if (engine.keys['KeyW']) moveDir.z -= 1
        if (engine.keys['KeyS']) moveDir.z += 1
        if (engine.keys['KeyA']) moveDir.x -= 1
        if (engine.keys['KeyD']) moveDir.x += 1
        moveDir.normalize()

        // Apply yaw rotation to movement vector
        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), engine.yaw)

        if (isFlying) {
          engine.vel.x = moveDir.x * moveSpeed
          engine.vel.z = moveDir.z * moveSpeed
          if (engine.keys['Space']) engine.vel.y = moveSpeed
          else if (engine.keys['ShiftLeft']) engine.vel.y = -moveSpeed
          else engine.vel.y = 0
        } else {
          engine.vel.x = moveDir.x * moveSpeed
          engine.vel.z = moveDir.z * moveSpeed

          // Gravity
          engine.vel.y -= 22 * dt

          // Jump
          if (engine.keys['Space'] && Math.abs(engine.vel.y) < 0.1) {
            engine.vel.y = 7.5
            soundService.playClick()
          }
        }

        // Apply Velocity & Basic Ground Collision
        engine.pos.x += engine.vel.x * dt
        engine.pos.y += engine.vel.y * dt
        engine.pos.z += engine.vel.z * dt

        // Simple voxel floor collision
        const bx = Math.floor(engine.pos.x)
        const bz = Math.floor(engine.pos.z)
        const currentBiome = generator.getBiome(bx, bz)
        const groundHeight = generator.getHeight(bx, bz, currentBiome) + 1.6

        if (!isFlying && engine.pos.y < groundHeight) {
          engine.pos.y = groundHeight
          engine.vel.y = 0
        }

        // Update Camera
        camera.position.copy(engine.pos)
        const forward = new THREE.Vector3(0, 0, -1)
        forward.applyAxisAngle(new THREE.Vector3(1, 0, 0), engine.pitch)
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), engine.yaw)
        camera.lookAt(camera.position.clone().add(forward))

        // Update Chunks
        updateChunks()

        // Target Block Raycast
        raycaster.setFromCamera(centerPoint, camera)
        const meshes: THREE.Mesh[] = []
        engine.chunkMeshes.forEach((g) => {
          g.children.forEach((c) => {
            if ((c as THREE.Mesh).isMesh) meshes.push(c as THREE.Mesh)
          })
        })

        const intersects = raycaster.intersectObjects(meshes, false)
        if (intersects.length > 0 && intersects[0].distance < 6) {
          const hit = intersects[0]
          if (hit.point && hit.face) {
            const targetPos = hit.point.clone().sub(hit.face.normal.clone().multiplyScalar(0.4))
            const targetBlockX = Math.floor(targetPos.x)
            const targetBlockY = Math.floor(targetPos.y)
            const targetBlockZ = Math.floor(targetPos.z)
            reticleMesh.position.set(targetBlockX + 0.5, targetBlockY + 0.5, targetBlockZ + 0.5)
            reticleMesh.visible = true
          }
        } else {
          reticleMesh.visible = false
        }
      }

      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(animate)

    // Resize
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup on unmount per Rule 5
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      window.removeEventListener('resize', handleResize)

      if (document.pointerLockElement === container) {
        document.exitPointerLock?.()
      }

      meshBuilder.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      engineRef.current = null
    }
  }, [isInGame, activeWorld, fov, renderDist, mouseSensitivity, isFlying, isPaused, isInventoryOpen])

  // Click Canvas -> Request Pointer Lock & Mine / Place Block
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const container = mountRef.current
    if (!container || !engineRef.current) return
    const eng = engineRef.current

    if (!eng.isLocked) {
      container.requestPointerLock?.()
      setIsPaused(false)
      return
    }

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(0, 0), eng.camera)
    const meshes: THREE.Mesh[] = []
    eng.chunkMeshes.forEach((g) => {
      g.children.forEach((c) => {
        if ((c as THREE.Mesh).isMesh) meshes.push(c as THREE.Mesh)
      })
    })

    const intersects = raycaster.intersectObjects(meshes, false)
    if (intersects.length === 0 || intersects[0].distance > 5) return

    const hit = intersects[0]
    if (!hit.point || !hit.face) return

    // Left Click: Break Block
    if (e.button === 0) {
      soundService.playClick()
      const targetPos = hit.point.clone().sub(hit.face.normal.clone().multiplyScalar(0.4))
      const bx = Math.floor(targetPos.x)
      const by = Math.floor(targetPos.y)
      const bz = Math.floor(targetPos.z)
      const key = `${bx},${by},${bz}`

      // Register air in modified blocks
      eng.modifiedBlocks[key] = 'air'

      // Collect item to inventory
      const blockId = 'dirt' // Collected
      setInventory((prev) => {
        const next = [...prev]
        // Try stack
        let slot = next.find((s) => s && s.blockId === blockId && s.count < 64)
        if (slot) slot.count += 1
        else {
          const emptyIdx = next.findIndex((s) => s === null)
          if (emptyIdx >= 0) next[emptyIdx] = { blockId, count: 1 }
        }
        return next
      })

      // Re-mesh chunk
      const cx = Math.floor(bx / CHUNK_SIZE)
      const cz = Math.floor(bz / CHUNK_SIZE)
      const chunkKey = `${cx},${cz}`
      const oldMesh = eng.chunkMeshes.get(chunkKey)
      if (oldMesh) eng.scene.remove(oldMesh)

      const chunk = eng.generator.generateChunk(cx, cz, eng.modifiedBlocks)
      eng.loadedChunks.set(chunkKey, chunk)
      const newMesh = eng.meshBuilder.buildChunkMesh(chunk)
      eng.scene.add(newMesh)
      eng.chunkMeshes.set(chunkKey, newMesh)
    }

    // Right Click: Place Block
    else if (e.button === 2) {
      const activeSlot = inventory[hotbarIndex]
      if (!activeSlot || activeSlot.count <= 0) return

      soundService.playNotification()
      const placePos = hit.point.clone().add(hit.face.normal.clone().multiplyScalar(0.4))
      const bx = Math.floor(placePos.x)
      const by = Math.floor(placePos.y)
      const bz = Math.floor(placePos.z)
      const key = `${bx},${by},${bz}`

      eng.modifiedBlocks[key] = activeSlot.blockId

      // Deduct item if in Survival
      if (activeWorld?.mode === 'survival') {
        setInventory((prev) => {
          const next = [...prev]
          if (next[hotbarIndex]) {
            next[hotbarIndex]!.count -= 1
            if (next[hotbarIndex]!.count <= 0) next[hotbarIndex] = null
          }
          return next
        })
      }

      // Re-mesh chunk
      const cx = Math.floor(bx / CHUNK_SIZE)
      const cz = Math.floor(bz / CHUNK_SIZE)
      const chunkKey = `${cx},${cz}`
      const oldMesh = eng.chunkMeshes.get(chunkKey)
      if (oldMesh) eng.scene.remove(oldMesh)

      const chunk = eng.generator.generateChunk(cx, cz, eng.modifiedBlocks)
      eng.loadedChunks.set(chunkKey, chunk)
      const newMesh = eng.meshBuilder.buildChunkMesh(chunk)
      eng.scene.add(newMesh)
      eng.chunkMeshes.set(chunkKey, newMesh)
    }
  }

  // Handle crafting item take
  const handleTakeCraftResult = () => {
    if (!craftResult) return
    soundService.playClick()

    // Add result to inventory
    setInventory((prev) => {
      const next = [...prev]
      const emptyIdx = next.findIndex((s) => s === null)
      if (emptyIdx >= 0) next[emptyIdx] = { ...craftResult }
      return next
    })

    // Consume 1 from each occupied craft slot
    setCraftGrid((prev) => prev.map((s) => (s ? null : null)))
  }

  // ---------------------------------------------------------------------------
  // RENDER: World Selection Menu
  // ---------------------------------------------------------------------------
  if (!isInGame) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-neutral-950 via-slate-900 to-indigo-950 text-neutral-100 select-none overflow-y-auto p-6 text-xs">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-neutral-900 rounded-[14px] flex items-center justify-center text-emerald-400 font-extrabold text-lg">
                  NB
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  NOVA BLOCKWORLD <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">Voxel 3D Engine</span>
                </h1>
                <p className="text-neutral-400 text-xs">Expansive Procedural Sandbox • Mining, Crafting, Survival & Creative</p>
              </div>
            </div>

            <button
              onClick={() => {
                soundService.playClick()
                setIsCreatingWorld(true)
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg flex items-center space-x-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Create New World</span>
            </button>
          </div>

          {/* Create World Dialog */}
          {isCreatingWorld && (
            <div className="bg-neutral-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h3 className="font-bold text-sm text-emerald-300">New World Generation Parameters</h3>
                <button onClick={() => setIsCreatingWorld(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">World Name</label>
                  <input
                    type="text"
                    value={newWorldName}
                    onChange={(e) => setNewWorldName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Random Seed</label>
                  <input
                    type="number"
                    value={newWorldSeed}
                    onChange={(e) => setNewWorldSeed(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Game Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewWorldMode('survival')}
                      className={`flex-1 py-1.5 rounded-lg border font-medium ${
                        newWorldMode === 'survival' ? 'bg-emerald-600 border-emerald-400 text-white' : 'border-white/10 text-neutral-400'
                      }`}
                    >
                      Survival (Health & Day/Night)
                    </button>
                    <button
                      onClick={() => setNewWorldMode('creative')}
                      className={`flex-1 py-1.5 rounded-lg border font-medium ${
                        newWorldMode === 'creative' ? 'bg-purple-600 border-purple-400 text-white' : 'border-white/10 text-neutral-400'
                      }`}
                    >
                      Creative (Fly & Unlimited)
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">World Size</label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as WorldSize[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setNewWorldSize(s)}
                        className={`flex-1 py-1.5 rounded-lg border capitalize font-medium ${
                          newWorldSize === s ? 'bg-teal-600 border-teal-400 text-white' : 'border-white/10 text-neutral-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsCreatingWorld(false)} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300">
                  Cancel
                </button>
                <button
                  onClick={handleCreateWorld}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-md"
                >
                  Generate & Enter World
                </button>
              </div>
            </div>
          )}

          {/* Worlds Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-300">Saved Worlds ({worlds.length})</h2>
            {worlds.length === 0 ? (
              <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-8 text-center text-neutral-400">
                <p>No worlds generated yet.</p>
                <button
                  onClick={() => setIsCreatingWorld(true)}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow hover:bg-emerald-500 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Voxel World</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {worlds.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => startPlayingWorld(w)}
                    className="bg-neutral-900/70 hover:bg-neutral-800/80 border border-white/10 hover:border-emerald-500/50 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01] shadow-lg flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                            {w.name}
                          </h3>
                          <span className="text-[10px] text-neutral-400">Seed: {w.seed} • Size: {w.size}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            w.mode === 'creative' ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30' : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {w.mode.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-3 text-[10px] text-neutral-500">
                        Played: {new Date(w.lastPlayed).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                      <button
                        onClick={(e) => handleDeleteWorld(w.id, e)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                        title="Delete World"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => startPlayingWorld(w)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Play World</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // RENDER: In-Game View & Overlays
  // ---------------------------------------------------------------------------
  const activeHotbarSlot = inventory[hotbarIndex]

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden font-sans text-xs">
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        onMouseDown={handleCanvasMouseDown}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full cursor-crosshair"
      />

      {/* Reticle / Crosshair */}
      {!isPaused && !isInventoryOpen && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <div className="absolute w-4 h-0.5 bg-white/80 shadow-[0_0_3px_black]" />
            <div className="absolute h-4 w-0.5 bg-white/80 shadow-[0_0_3px_black]" />
          </div>
        </div>
      )}

      {/* In-Game HUD: Health & Hunger (Survival Only) */}
      {activeWorld?.mode === 'survival' && !isPaused && !isInventoryOpen && (
        <div className="absolute bottom-16 inset-x-0 flex justify-center gap-6 pointer-events-none">
          {/* Health Bar */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/30">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="font-bold text-red-300">{health} / 100</span>
          </div>

          {/* Hunger Bar */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/30">
            <Utensils className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-amber-300">{hunger} / 100</span>
          </div>
        </div>
      )}

      {/* Creative Mode Flying Indicator */}
      {isFlying && (
        <div className="absolute top-4 left-4 bg-purple-600/80 backdrop-blur-md text-white font-bold px-3 py-1 rounded-full shadow pointer-events-none">
          ✈ Flying Mode Active (Space = Up, Shift = Down, F = Toggle)
        </div>
      )}

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="absolute top-4 right-4 bg-emerald-600/90 text-white font-bold px-4 py-1.5 rounded-xl shadow-lg border border-emerald-400 animate-bounce pointer-events-none">
          {saveToast}
        </div>
      )}

      {/* Hotbar (Slots 1 to 9) */}
      {!isPaused && !isInventoryOpen && (
        <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
          <div className="flex gap-1.5 bg-neutral-950/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl pointer-events-auto">
            {inventory.slice(0, 9).map((slot, idx) => (
              <div
                key={idx}
                onClick={() => setHotbarIndex(idx)}
                className={`w-11 h-11 rounded-xl flex flex-col items-center justify-between p-1 cursor-pointer transition-all ${
                  hotbarIndex === idx
                    ? 'bg-white/25 border-2 border-emerald-400 shadow-md scale-105'
                    : 'bg-neutral-800/80 border border-white/10 hover:bg-neutral-700/80'
                }`}
              >
                <span className="text-[9px] text-neutral-400 self-start leading-none font-bold">{idx + 1}</span>
                {slot && (
                  <div className="flex flex-col items-center">
                    <div
                      className="w-4 h-4 rounded-sm border border-black/40 shadow-sm"
                      style={{ backgroundColor: '#' + (BLOCK_DEFS[slot.blockId]?.color?.toString(16).padStart(6, '0') || 'fff') }}
                    />
                    <span className="text-[9px] font-extrabold text-white mt-0.5 leading-none">{slot.count}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory & Crafting Modal (E Key) */}
      {isInventoryOpen && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-40">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Inventory & Crafting Table (3x3)</span>
              </h3>
              <button onClick={() => setIsInventoryOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3x3 Crafting Grid */}
            <div className="flex items-center justify-center gap-6 bg-neutral-950/70 p-4 rounded-xl border border-white/5">
              <div className="grid grid-cols-3 gap-1.5">
                {craftGrid.map((block, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (activeHotbarSlot) {
                        const next = [...craftGrid]
                        next[idx] = activeHotbarSlot.blockId
                        setCraftGrid(next)
                      } else {
                        const next = [...craftGrid]
                        next[idx] = null
                        setCraftGrid(next)
                      }
                    }}
                    className="w-12 h-12 bg-neutral-800 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-neutral-700"
                  >
                    {block && (
                      <div
                        className="w-7 h-7 rounded-md border border-black/40"
                        style={{ backgroundColor: '#' + (BLOCK_DEFS[block]?.color?.toString(16).padStart(6, '0') || 'fff') }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="text-neutral-500 font-bold text-xl">➔</div>

              {/* Crafting Result Slot */}
              <div
                onClick={handleTakeCraftResult}
                className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  craftResult ? 'bg-emerald-600/30 border-emerald-400 shadow-lg scale-105' : 'bg-neutral-800 border-dashed border-white/10'
                }`}
              >
                {craftResult && (
                  <>
                    <div
                      className="w-8 h-8 rounded-md border border-black/40"
                      style={{ backgroundColor: '#' + (BLOCK_DEFS[craftResult.blockId]?.color?.toString(16).padStart(6, '0') || 'fff') }}
                    />
                    <span className="text-[10px] font-bold text-white mt-1">x{craftResult.count}</span>
                  </>
                )}
              </div>
            </div>

            {/* Main 27 Inventory Slots + 9 Hotbar Slots */}
            <div>
              <span className="text-[11px] font-bold text-neutral-400 block mb-2">Backpack Storage</span>
              <div className="grid grid-cols-9 gap-1.5 bg-neutral-950/50 p-3 rounded-xl border border-white/5">
                {inventory.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center cursor-pointer border ${
                      idx < 9 ? 'border-emerald-500/30 bg-neutral-800/80' : 'border-white/5 bg-neutral-900/60'
                    }`}
                  >
                    {slot && (
                      <>
                        <div
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: '#' + (BLOCK_DEFS[slot.blockId]?.color?.toString(16).padStart(6, '0') || 'fff') }}
                        />
                        <span className="text-[8px] font-bold text-white leading-none mt-0.5">{slot.count}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 text-center">
              Click hotbar slot block into the 3x3 crafting grid. Recipes: Wood➔Planks, 4 Planks➔Table, 8 Stone➔Furnace, 8 Planks➔Chest.
            </p>
          </div>
        </div>
      )}

      {/* Pause Menu (Esc) */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <h2 className="text-base font-bold text-white">Game Paused</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  soundService.playClick()
                  setIsPaused(false)
                  mountRef.current?.requestPointerLock?.()
                }}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow"
              >
                Resume Game
              </button>

              <button
                onClick={handleSaveActiveWorld}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-neutral-200"
              >
                Save World to IndexedDB
              </button>

              <button
                onClick={() => {
                  handleSaveActiveWorld()
                  soundService.playClick()
                  setIsInGame(false)
                }}
                className="w-full py-2 rounded-xl bg-red-600/80 hover:bg-red-500 font-bold text-white"
              >
                Save & Exit to Title
              </button>
            </div>

            {/* Quick Render Settings */}
            <div className="border-t border-white/10 pt-3 text-left space-y-2">
              <div className="flex justify-between items-center text-[10px] text-neutral-400">
                <span>Render Distance ({renderDist} Chunks)</span>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={renderDist}
                  onChange={(e) => setRenderDist(Number(e.target.value))}
                  className="w-24"
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-neutral-400">
                <span>Field of View ({fov}°)</span>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={fov}
                  onChange={(e) => setFov(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
