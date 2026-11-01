import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Flame, Key } from 'lucide-react'

// 10x10 Dungeon Map (1 = stone wall, 0 = corridor, 2 = key, 3 = exit portal)
const DUNGEON_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 2, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 2, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

export const DungeonExplorer3DGame: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [keysFound, setKeysFound] = useState(0)
  const [won, setWon] = useState(false)

  const stateRef = useRef({
    pos: new THREE.Vector3(1.5, 1.2, 1.5),
    yaw: 0,
    keys: { w: false, a: false, s: false, d: false, left: false, right: false },
    map: DUNGEON_MAP.map((r) => [...r]),
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') stateRef.current.keys.w = true
      if (e.key === 's' || e.key === 'ArrowDown') stateRef.current.keys.s = true
      if (e.key === 'a') stateRef.current.keys.a = true
      if (e.key === 'd') stateRef.current.keys.d = true
      if (e.key === 'ArrowLeft') stateRef.current.keys.left = true
      if (e.key === 'ArrowRight') stateRef.current.keys.right = true
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') stateRef.current.keys.w = false
      if (e.key === 's' || e.key === 'ArrowDown') stateRef.current.keys.s = false
      if (e.key === 'a') stateRef.current.keys.a = false
      if (e.key === 'd') stateRef.current.keys.d = false
      if (e.key === 'ArrowLeft') stateRef.current.keys.left = false
      if (e.key === 'ArrowRight') stateRef.current.keys.right = false
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 600
    const height = container.clientHeight || 400

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050508)
    scene.fog = new THREE.FogExp2(0x050508, 0.08)

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Ambient & Torch light
    const ambientLight = new THREE.AmbientLight(0x332211, 0.4)
    scene.add(ambientLight)

    const torchLight = new THREE.PointLight(0xf59e0b, 1.8, 14)
    scene.add(torchLight)

    // Floor & Ceiling
    const floorGeo = new THREE.PlaneGeometry(30, 30)
    floorGeo.rotateX(-Math.PI / 2)
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x1e293b })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.position.set(5, 0, 5)
    scene.add(floor)

    // Walls
    const wallGeo = new THREE.BoxGeometry(1, 2.5, 1)
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x475569 })
    const keyGeo = new THREE.OctahedronGeometry(0.3)
    const keyMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 })

    const keyMeshes: { x: number; z: number; mesh: THREE.Mesh }[] = []

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (DUNGEON_MAP[r][c] === 1) {
          const wall = new THREE.Mesh(wallGeo, wallMat)
          wall.position.set(c, 1.25, r)
          scene.add(wall)
        } else if (DUNGEON_MAP[r][c] === 2) {
          const kMesh = new THREE.Mesh(keyGeo, keyMat)
          kMesh.position.set(c, 1, r)
          scene.add(kMesh)
          keyMeshes.push({ x: c, z: r, mesh: kMesh })
        } else if (DUNGEON_MAP[r][c] === 3) {
          // Exit Portal
          const portalGeo = new THREE.TorusGeometry(0.8, 0.15, 8, 16)
          const portalMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
          const portal = new THREE.Mesh(portalGeo, portalMat)
          portal.position.set(c, 1.2, r)
          scene.add(portal)
        }
      }
    }

    let animationFrameId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const st = stateRef.current
      const k = st.keys

      // Rotation
      if (k.left || k.a) st.yaw += 2.4 * dt
      if (k.right || k.d) st.yaw -= 2.4 * dt

      // Movement forward/back
      let moveZ = 0
      if (k.w) moveZ -= 1
      if (k.s) moveZ += 1

      const forward = new THREE.Vector3(0, 0, moveZ).applyAxisAngle(new THREE.Vector3(0, 1, 0), st.yaw)
      const nextPos = st.pos.clone().add(forward.multiplyScalar(4 * dt))

      // Check wall collision
      const checkX = Math.floor(nextPos.x + 0.5)
      const checkZ = Math.floor(nextPos.z + 0.5)
      if (
        checkX >= 0 &&
        checkX < 10 &&
        checkZ >= 0 &&
        checkZ < 10 &&
        DUNGEON_MAP[checkZ][checkX] !== 1
      ) {
        st.pos.copy(nextPos)
      }

      // Check keys
      keyMeshes.forEach((km) => {
        if (km.mesh.visible && st.pos.distanceTo(km.mesh.position) < 1) {
          km.mesh.visible = false
          soundService.playNotification()
          setKeysFound((k) => k + 1)
        }
      })

      // Check exit portal
      if (st.pos.distanceTo(new THREE.Vector3(8, 1.2, 8)) < 1.2) {
        soundService.playStartup()
        setWon(true)
      }

      // Torch flicker
      torchLight.position.set(st.pos.x, st.pos.y + 0.2, st.pos.z)
      torchLight.intensity = 1.6 + Math.sin(currentTime * 0.01) * 0.2

      // Camera
      camera.position.copy(st.pos)
      const lookDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), st.yaw)
      camera.lookAt(st.pos.clone().add(lookDir))

      renderer.render(scene, camera)
    }

    animationFrameId = requestAnimationFrame(animate)

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup Rule 5
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [won])

  const reset = () => {
    soundService.playClick()
    stateRef.current.pos.set(1.5, 1.2, 1.5)
    stateRef.current.yaw = 0
    setKeysFound(0)
    setWon(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-amber-500/30">
        <div className="flex items-center gap-3">
          <Flame className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-sm text-amber-300">Crypt Crawler 3D</span>
          <span className="text-white font-bold flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-yellow-400" /> Keys: {keysFound} / 2
          </span>
        </div>
        <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-full max-w-2xl h-80 border-2 border-amber-500/50 rounded-2xl overflow-hidden shadow-2xl bg-black">
        <div ref={mountRef} className="w-full h-full cursor-none" />

        {won && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <Trophy className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
            <h3 className="text-base font-bold text-amber-400">Crypt Escaped!</h3>
            <p className="text-neutral-400 text-xs mb-3">You found all keys and stepped through the portal.</p>
            <button onClick={reset} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 font-bold text-black rounded-lg">
              Descend Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        W / S = Walk Forward / Back • Left / Right or A / D = Turn • Find golden keys and reach the blue portal
      </div>
    </div>
  )
}
