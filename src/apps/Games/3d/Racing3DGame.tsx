import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Gauge } from 'lucide-react'

export const Racing3DGame: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [speed, setSpeed] = useState(0)
  const [distance, setDistance] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const stateRef = useRef({
    carPos: { x: 0, z: 0 },
    speed: 0,
    keys: { left: false, right: false, up: false, down: false },
    traffic: [] as { mesh: THREE.Mesh; speed: number }[],
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') stateRef.current.keys.left = true
      if (e.key === 'ArrowRight' || e.key === 'd') stateRef.current.keys.right = true
      if (e.key === 'ArrowUp' || e.key === 'w') stateRef.current.keys.up = true
      if (e.key === 'ArrowDown' || e.key === 's') stateRef.current.keys.down = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') stateRef.current.keys.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') stateRef.current.keys.right = false
      if (e.key === 'ArrowUp' || e.key === 'w') stateRef.current.keys.up = false
      if (e.key === 'ArrowDown' || e.key === 's') stateRef.current.keys.down = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 600
    const height = container.clientHeight || 400

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050811)
    scene.fog = new THREE.FogExp2(0x050811, 0.015)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500)
    camera.position.set(0, 3.5, 7)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2)
    dirLight.position.set(10, 20, 10)
    scene.add(dirLight)

    // Road Grid
    const roadGeo = new THREE.PlaneGeometry(14, 400)
    const roadMat = new THREE.MeshBasicMaterial({ color: 0x090d16 })
    const road = new THREE.Mesh(roadGeo, roadMat)
    road.rotation.x = -Math.PI / 2
    road.position.z = -150
    scene.add(road)

    // Road lines
    const lineGeo = new THREE.PlaneGeometry(0.3, 400)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    const centerLine = new THREE.Mesh(lineGeo, lineMat)
    centerLine.rotation.x = -Math.PI / 2
    centerLine.position.set(0, 0.02, -150)
    scene.add(centerLine)

    // Player Car Mesh
    const carGroup = new THREE.Group()
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.7, 3.2)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2, metalness: 0.8 })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = 0.5
    carGroup.add(body)

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16)
    const wheelMat = new THREE.MeshBasicMaterial({ color: 0x1e293b })
    for (const [wx, wz] of [[-0.85, 1], [0.85, 1], [-0.85, -1], [0.85, -1]]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(wx, 0.35, wz)
      carGroup.add(wheel)
    }

    scene.add(carGroup)

    // Opponent Traffic Cars
    const trafficCars: { mesh: THREE.Mesh; speed: number }[] = []
    const oppColors = [0xef4444, 0xf59e0b, 0xa855f7, 0x10b981]

    for (let i = 0; i < 5; i++) {
      const oppGeo = new THREE.BoxGeometry(1.5, 0.7, 3)
      const oppMat = new THREE.MeshStandardMaterial({ color: oppColors[i % oppColors.length], roughness: 0.3 })
      const oppMesh = new THREE.Mesh(oppGeo, oppMat)
      const laneX = (Math.random() - 0.5) * 10
      oppMesh.position.set(laneX, 0.5, -40 - i * 50)
      scene.add(oppMesh)
      trafficCars.push({ mesh: oppMesh, speed: 20 + Math.random() * 20 })
    }
    stateRef.current.traffic = trafficCars

    // Animation Loop
    let animationFrameId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const st = stateRef.current

      // Acceleration / Deceleration
      if (st.keys.up) st.speed = Math.min(st.speed + 40 * dt, 120)
      else if (st.keys.down) st.speed = Math.max(st.speed - 60 * dt, 0)
      else st.speed = Math.max(st.speed - 15 * dt, 0)

      setSpeed(Math.floor(st.speed))
      setDistance((d) => d + Math.floor(st.speed * dt))

      // Steering
      if (st.keys.left) st.carPos.x = Math.max(st.carPos.x - 12 * dt, -5.5)
      if (st.keys.right) st.carPos.x = Math.min(st.carPos.x + 12 * dt, 5.5)

      carGroup.position.x = st.carPos.x
      carGroup.rotation.y = (st.keys.left ? 0.08 : st.keys.right ? -0.08 : 0)

      camera.position.x = st.carPos.x * 0.4
      camera.lookAt(st.carPos.x, 0.8, -10)

      // Traffic
      trafficCars.forEach((tc) => {
        tc.mesh.position.z += (st.speed - tc.speed) * dt
        if (tc.mesh.position.z > 15) {
          tc.mesh.position.z = -220
          tc.mesh.position.x = (Math.random() - 0.5) * 10
        }

        // Collision Check
        if (
          Math.abs(st.carPos.x - tc.mesh.position.x) < 1.4 &&
          Math.abs(tc.mesh.position.z) < 2.5
        ) {
          soundService.playTrashEmpty()
          st.speed = 0
          setGameOver(true)
        }
      })

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
  }, [gameOver])

  const reset = () => {
    soundService.playClick()
    stateRef.current.carPos = { x: 0, z: 0 }
    stateRef.current.speed = 0
    stateRef.current.traffic.forEach((tc, idx) => {
      tc.mesh.position.set((Math.random() - 0.5) * 10, 0.5, -40 - idx * 50)
    })
    setDistance(0)
    setSpeed(0)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm text-cyan-300">Neon Velocity 3D</span>
          <span className="text-white font-bold">{speed} KM/H</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-neutral-400">Distance: {distance}m</span>
          <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-2xl h-80 border-2 border-cyan-500/50 rounded-2xl overflow-hidden shadow-2xl bg-black">
        <div ref={mountRef} className="w-full h-full cursor-none" />

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-red-500 mb-1">Collision!</h3>
            <p className="text-neutral-400 text-xs mb-3">Distance: {distance} meters</p>
            <button onClick={reset} className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 font-bold text-black rounded-lg shadow">
              Race Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        WASD or Arrow Keys to Accelerate, Brake and Steer • Dodge neon traffic on the cyber highway
      </div>
    </div>
  )
}
