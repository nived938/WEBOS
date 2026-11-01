import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Activity } from 'lucide-react'

export const ObstacleCourse3DGame: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [won, setWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const stateRef = useRef({
    pos: new THREE.Vector3(0, 1.2, 0),
    vel: new THREE.Vector3(0, 0, 0),
    keys: { w: false, s: false, a: false, d: false },
    sweeperBars: [] as THREE.Mesh[],
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') stateRef.current.keys.w = true
      if (e.key === 's' || e.key === 'ArrowDown') stateRef.current.keys.s = true
      if (e.key === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.a = true
      if (e.key === 'd' || e.key === 'ArrowRight') stateRef.current.keys.d = true
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

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const sun = new THREE.DirectionalLight(0xfffaed, 1.2)
    sun.position.set(20, 30, 20)
    scene.add(sun)

    // Narrow Course Runway
    const runwayGeo = new THREE.BoxGeometry(8, 1, 90)
    const runwayMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    const runway = new THREE.Mesh(runwayGeo, runwayMat)
    runway.position.set(0, 0, -40)
    scene.add(runway)

    // Finish Podium
    const finishGeo = new THREE.CylinderGeometry(6, 6, 1.5, 24)
    const finishMat = new THREE.MeshStandardMaterial({ color: 0x10b981 })
    const finish = new THREE.Mesh(finishGeo, finishMat)
    finish.position.set(0, 0.25, -90)
    scene.add(finish)

    // Player Ball
    const playerGeo = new THREE.SphereGeometry(0.8, 16, 16)
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 })
    const player = new THREE.Mesh(playerGeo, playerMat)
    scene.add(player)

    // Spinning Sweeper Bars
    const sweeperBars: THREE.Mesh[] = []
    const barGeo = new THREE.BoxGeometry(9, 0.6, 0.6)
    const barMat = new THREE.MeshStandardMaterial({ color: 0xef4444 })

    for (let i = 0; i < 4; i++) {
      const bar = new THREE.Mesh(barGeo, barMat)
      bar.position.set(0, 1, -15 - i * 18)
      scene.add(bar)
      sweeperBars.push(bar)
    }
    stateRef.current.sweeperBars = sweeperBars

    let animationFrameId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const st = stateRef.current
      const k = st.keys

      // Controls
      const speed = 9
      if (k.w) st.pos.z -= speed * dt
      if (k.s) st.pos.z += speed * dt
      if (k.a) st.pos.x -= speed * dt
      if (k.d) st.pos.x += speed * dt

      player.position.copy(st.pos)

      // Spin Sweepers & Check Collision
      sweeperBars.forEach((bar, idx) => {
        bar.rotation.y += (idx % 2 === 0 ? 3 : -3) * dt

        // Check distance to bar
        if (Math.abs(st.pos.z - bar.position.z) < 1.2 && Math.abs(st.pos.x) < 4.2) {
          // Check bar angle alignment
          const barAngle = bar.rotation.y % Math.PI
          if (Math.abs(barAngle) < 0.5 || Math.abs(barAngle) > 2.6) {
            // Swept off!
            soundService.playTrashEmpty()
            setGameOver(true)
          }
        }
      })

      // Fell off runway
      if (Math.abs(st.pos.x) > 4.5 && st.pos.z > -85) {
        soundService.playTrashEmpty()
        setGameOver(true)
      }

      // Finish Check
      if (st.pos.z <= -88) {
        soundService.playStartup()
        setWon(true)
      }

      // Camera Follow
      camera.position.set(st.pos.x * 0.5, 6, st.pos.z + 10)
      camera.lookAt(st.pos.x, 1, st.pos.z - 4)

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
    stateRef.current.pos.set(0, 1.2, 0)
    setWon(false)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-sky-500/30">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm text-cyan-300">Wipeout Arena 3D</span>
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
            <h3 className="text-base font-bold text-emerald-400">Course Conquered!</h3>
            <button onClick={reset} className="mt-3 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 font-bold text-black rounded-lg">
              Run Again
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-red-500 mb-1">Swept Off The Arena!</h3>
            <button onClick={reset} className="mt-3 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 font-bold text-black rounded-lg">
              Retry Course
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        WASD or Arrows to Steer • Time your dash past rotating sweeper hazard bars to reach the green finish pad
      </div>
    </div>
  )
}
