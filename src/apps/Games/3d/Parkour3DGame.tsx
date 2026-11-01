import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Activity } from 'lucide-react'

export const Parkour3DGame: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState(0)
  const [won, setWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const stateRef = useRef({
    pos: new THREE.Vector3(0, 4, 0),
    vel: new THREE.Vector3(0, 0, 0),
    isGrounded: false,
    keys: { w: false, a: false, s: false, d: false, space: false },
    platforms: [] as { box: THREE.Box3; mesh: THREE.Mesh }[],
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') stateRef.current.keys.w = true
      if (e.key === 's' || e.key === 'ArrowDown') stateRef.current.keys.s = true
      if (e.key === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.a = true
      if (e.key === 'd' || e.key === 'ArrowRight') stateRef.current.keys.d = true
      if (e.key === ' ' && stateRef.current.isGrounded) {
        stateRef.current.vel.y = 12
        stateRef.current.isGrounded = false
        soundService.playClick()
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') stateRef.current.keys.w = false
      if (e.key === 's' || e.key === 'ArrowDown') stateRef.current.keys.s = false
      if (e.key === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.a = false
      if (e.key === 'd' || e.key === 'ArrowRight') stateRef.current.keys.d = false
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
    scene.background = new THREE.Color(0x0f172a)
    scene.fog = new THREE.FogExp2(0x0f172a, 0.015)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2)
    dirLight.position.set(20, 40, 20)
    scene.add(dirLight)

    // Player Mesh
    const playerGeo = new THREE.SphereGeometry(0.8, 16, 16)
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 })
    const playerMesh = new THREE.Mesh(playerGeo, playerMat)
    scene.add(playerMesh)

    // Rooftop Platforms
    const platforms: { box: THREE.Box3; mesh: THREE.Mesh }[] = []
    const platformData = [
      { x: 0, y: 0, z: 0, w: 10, h: 2, d: 10, col: 0x334155 },
      { x: 0, y: 3, z: -16, w: 8, h: 2, d: 8, col: 0x475569 },
      { x: 4, y: 7, z: -32, w: 6, h: 2, d: 8, col: 0x64748b },
      { x: -4, y: 11, z: -48, w: 8, h: 2, d: 8, col: 0x3b82f6 },
      { x: 0, y: 15, z: -66, w: 6, h: 2, d: 6, col: 0x8b5cf6 },
      { x: 0, y: 19, z: -84, w: 12, h: 2, d: 12, col: 0x10b981 }, // Finish
    ]

    platformData.forEach((pd) => {
      const geo = new THREE.BoxGeometry(pd.w, pd.h, pd.d)
      const mat = new THREE.MeshStandardMaterial({ color: pd.col, roughness: 0.6 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(pd.x, pd.y, pd.z)
      scene.add(mesh)

      const box = new THREE.Box3().setFromObject(mesh)
      platforms.push({ box, mesh })
    })

    stateRef.current.platforms = platforms

    let animationFrameId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const st = stateRef.current
      const k = st.keys

      // Controls
      const moveSpeed = 10
      st.vel.x = 0
      st.vel.z = 0

      if (k.w) st.vel.z -= moveSpeed
      if (k.s) st.vel.z += moveSpeed
      if (k.a) st.vel.x -= moveSpeed
      if (k.d) st.vel.x += moveSpeed

      // Gravity
      st.vel.y -= 26 * dt

      // Apply
      st.pos.x += st.vel.x * dt
      st.pos.y += st.vel.y * dt
      st.pos.z += st.vel.z * dt

      // Platform Collisions
      st.isGrounded = false
      platforms.forEach((p) => {
        const topY = p.mesh.position.y + 1
        if (
          st.pos.x > p.mesh.position.x - 5 &&
          st.pos.x < p.mesh.position.x + 5 &&
          st.pos.z > p.mesh.position.z - 5 &&
          st.pos.z < p.mesh.position.z + 5 &&
          st.pos.y >= topY &&
          st.pos.y <= topY + 0.8 &&
          st.vel.y <= 0
        ) {
          st.pos.y = topY + 0.8
          st.vel.y = 0
          st.isGrounded = true
        }
      })

      // Finish Platform Check
      if (st.pos.z < -80 && st.isGrounded) {
        soundService.playStartup()
        setWon(true)
      }

      // Fall off
      if (st.pos.y < -15) {
        soundService.playTrashEmpty()
        setGameOver(true)
      }

      playerMesh.position.copy(st.pos)
      camera.position.set(st.pos.x, st.pos.y + 4, st.pos.z + 9)
      camera.lookAt(st.pos.x, st.pos.y + 1, st.pos.z - 5)

      setScore(Math.max(0, Math.floor(-st.pos.z)))

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
  }, [won, gameOver])

  const reset = () => {
    soundService.playClick()
    stateRef.current.pos.set(0, 4, 0)
    stateRef.current.vel.set(0, 0, 0)
    setWon(false)
    setGameOver(false)
    setScore(0)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-sky-500/30">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm text-cyan-300">Rooftop Runner 3D</span>
          <span className="text-white font-bold">Progress: {score}m / 84m</span>
        </div>
        <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-full max-w-2xl h-80 border-2 border-cyan-500/50 rounded-2xl overflow-hidden shadow-2xl bg-black">
        <div ref={mountRef} className="w-full h-full cursor-none" />

        {won && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <Trophy className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
            <h3 className="text-base font-bold text-emerald-400">Rooftop Conquered!</h3>
            <button onClick={reset} className="mt-3 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 font-bold text-black rounded-lg">
              Run Again
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-red-500 mb-1">Fell Off The Rooftop!</h3>
            <button onClick={reset} className="mt-3 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 font-bold text-black rounded-lg">
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        WASD to Move • Spacebar to Jump Across Rooftops • Reach the green helipad
      </div>
    </div>
  )
}
