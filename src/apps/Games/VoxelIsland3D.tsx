import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { RotateCcw, Box, Sun, Moon, Sparkles, Pickaxe } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

type BlockType = 'grass' | 'dirt' | 'stone' | 'wood' | 'gold' | 'water'

const BLOCK_COLORS: Record<BlockType, number> = {
  grass: 0x22c55e,
  dirt: 0x78350f,
  stone: 0x64748b,
  wood: 0xb45309,
  gold: 0xfacc15,
  water: 0x38bdf8
}

export const VoxelIsland3D: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('grass')
  const [blockCount, setBlockCount] = useState(0)
  const [isNight, setIsNight] = useState(false)

  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    blocksGroup: new THREE.Group(),
    blocks: new Map<string, THREE.Mesh>(),
    sunLight: null as THREE.DirectionalLight | null,
    ambientLight: null as THREE.AmbientLight | null,
    isMouseDown: false,
    prevMousePos: { x: 0, y: 0 },
    camAngle: { theta: Math.PI / 4, phi: Math.PI / 4, radius: 24 }
  })

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 700
    const height = container.clientHeight || 450

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0c1322)
    stateRef.current.scene = scene

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    stateRef.current.camera = camera
    updateCameraPosition()

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)
    stateRef.current.ambientLight = ambientLight

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.4)
    sunLight.position.set(15, 25, 15)
    sunLight.castShadow = true
    scene.add(sunLight)
    stateRef.current.sunLight = sunLight

    // Blocks Group
    const blocksGroup = stateRef.current.blocksGroup
    scene.add(blocksGroup)

    // Grid Floor Base
    const grid = new THREE.GridHelper(20, 20, 0x1e3a8a, 0x172554)
    grid.position.y = -0.5
    scene.add(grid)

    // Build procedural initial floating island
    generateIsland()

    // Animation Loop
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Mouse Drag Rotation
    const handleMouseDown = (e: MouseEvent) => {
      stateRef.current.isMouseDown = true
      stateRef.current.prevMousePos = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!stateRef.current.isMouseDown) return
      const dx = e.clientX - stateRef.current.prevMousePos.x
      const dy = e.clientY - stateRef.current.prevMousePos.y

      stateRef.current.camAngle.theta -= dx * 0.008
      stateRef.current.camAngle.phi = Math.max(0.1, Math.min(Math.PI / 2.2, stateRef.current.camAngle.phi - dy * 0.008))

      updateCameraPosition()
      stateRef.current.prevMousePos = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      stateRef.current.isMouseDown = false
    }

    container.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

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

    return () => {
      cancelAnimationFrame(animationFrameId)
      container.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  const updateCameraPosition = () => {
    const cam = stateRef.current.camera
    if (!cam) return
    const { theta, phi, radius } = stateRef.current.camAngle
    cam.position.x = radius * Math.sin(phi) * Math.sin(theta)
    cam.position.y = radius * Math.cos(phi)
    cam.position.z = radius * Math.sin(phi) * Math.cos(theta)
    cam.lookAt(0, 2, 0)
  }

  const addBlock = (x: number, y: number, z: number, type: BlockType) => {
    const key = `${x},${y},${z}`
    if (stateRef.current.blocks.has(key)) return

    const geo = new THREE.BoxGeometry(1, 1, 1)
    const mat = new THREE.MeshStandardMaterial({
      color: BLOCK_COLORS[type],
      roughness: type === 'water' ? 0.1 : 0.8,
      metalness: type === 'gold' ? 0.8 : 0.1,
      transparent: type === 'water',
      opacity: type === 'water' ? 0.75 : 1
    })

    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData = { key, type }

    stateRef.current.blocksGroup.add(mesh)
    stateRef.current.blocks.set(key, mesh)
  }

  const generateIsland = () => {
    // Clear old
    stateRef.current.blocks.forEach(mesh => stateRef.current.blocksGroup.remove(mesh))
    stateRef.current.blocks.clear()

    const size = 7
    for (let x = -Math.floor(size / 2); x <= Math.floor(size / 2); x++) {
      for (let z = -Math.floor(size / 2); z <= Math.floor(size / 2); z++) {
        const dist = Math.sqrt(x * x + z * z)
        if (dist > 3.8) continue

        // Base stone
        addBlock(x, 0, z, 'stone')
        addBlock(x, 1, z, 'dirt')

        // Top grass
        if (x === 0 && z === 0) {
          addBlock(x, 2, z, 'water')
        } else {
          addBlock(x, 2, z, 'grass')
        }

        // Small tree
        if (x === 2 && z === -2) {
          addBlock(x, 3, z, 'wood')
          addBlock(x, 4, z, 'wood')
          addBlock(x, 5, z, 'grass')
          addBlock(x + 1, 5, z, 'grass')
          addBlock(x - 1, 5, z, 'grass')
          addBlock(x, 5, z + 1, 'grass')
          addBlock(x, 5, z - 1, 'grass')
        }

        // Gold vein
        if (x === -2 && z === 2) {
          addBlock(x, 3, z, 'gold')
        }
      }
    }
    setBlockCount(stateRef.current.blocks.size)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 2) return
    const container = mountRef.current
    const cam = stateRef.current.camera
    const scene = stateRef.current.scene
    if (!container || !cam || !scene) return

    const rect = container.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, cam)
    const intersects = raycaster.intersectObjects(stateRef.current.blocksGroup.children)

    if (intersects.length > 0) {
      const hit = intersects[0]
      if (e.button === 0) {
        // Left click: Place block on hit face normal
        if (hit.face) {
          soundService.playClick()
          const newPos = hit.point.clone().add(hit.face.normal.clone().multiplyScalar(0.5))
          const x = Math.round(newPos.x)
          const y = Math.round(newPos.y)
          const z = Math.round(newPos.z)
          addBlock(x, y, z, selectedBlock)
          setBlockCount(stateRef.current.blocks.size)
        }
      } else if (e.button === 2) {
        // Right click: Mine / remove block
        soundService.playNotification()
        const key = hit.object.userData.key
        if (key && stateRef.current.blocks.has(key)) {
          stateRef.current.blocksGroup.remove(hit.object)
          stateRef.current.blocks.delete(key)
          setBlockCount(stateRef.current.blocks.size)
        }
      }
    }
  }

  const toggleDayNight = () => {
    soundService.playClick()
    const next = !isNight
    setIsNight(next)
    if (stateRef.current.scene && stateRef.current.sunLight && stateRef.current.ambientLight) {
      if (next) {
        stateRef.current.scene.background = new THREE.Color(0x02040a)
        stateRef.current.sunLight.color.setHex(0x38bdf8)
        stateRef.current.sunLight.intensity = 0.4
        stateRef.current.ambientLight.intensity = 0.2
      } else {
        stateRef.current.scene.background = new THREE.Color(0x0c1322)
        stateRef.current.sunLight.color.setHex(0xffedd5)
        stateRef.current.sunLight.intensity = 1.4
        stateRef.current.ambientLight.intensity = 0.6
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none overflow-hidden relative font-sans text-xs">
      {/* Top Toolbar */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
          <Box className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-xs">{blockCount} Blocks Active</span>
        </div>

        {/* Block Palette Bar */}
        <div className="flex items-center space-x-1.5 bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
          {(['grass', 'dirt', 'stone', 'wood', 'gold', 'water'] as const).map(b => (
            <button
              key={b}
              onClick={() => {
                soundService.playClick()
                setSelectedBlock(b)
              }}
              style={{ backgroundColor: '#' + BLOCK_COLORS[b].toString(16).padStart(6, '0') }}
              className={`w-6 h-6 rounded-md shadow-md capitalize transition-transform ${
                selectedBlock === b ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
              }`}
              title={b}
            />
          ))}
        </div>

        <div className="flex items-center space-x-1.5 pointer-events-auto">
          <button
            onClick={toggleDayNight}
            className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/10"
            title="Toggle Day/Night"
          >
            {isNight ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
          <button
            onClick={() => {
              soundService.playClick()
              generateIsland()
            }}
            className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/10"
            title="Re-generate Island"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onContextMenu={e => e.preventDefault()}
        className="flex-1 w-full h-full relative cursor-crosshair"
      />

      {/* Footer Instructions */}
      <div className="absolute bottom-2 inset-x-0 text-center text-[10px] text-neutral-400 pointer-events-none">
        Left Click to Place Block • Right Click to Mine Block • Drag with mouse to orbit island 360°
      </div>
    </div>
  )
}
