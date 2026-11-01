import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Rocket, Crosshair } from 'lucide-react'

export const SpaceAdventure3DGame: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState(0)
  const [lasersFired, setLasersFired] = useState(0)

  const stateRef = useRef({
    pos: new THREE.Vector3(0, 0, 0),
    rot: new THREE.Euler(0, 0, 0, 'YXZ'),
    keys: { w: false, s: false, a: false, d: false, space: false },
    asteroids: [] as THREE.Mesh[],
    lasers: [] as { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[],
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') stateRef.current.keys.w = true
      if (e.key === 's' || e.key === 'ArrowDown') stateRef.current.keys.s = true
      if (e.key === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.a = true
      if (e.key === 'd' || e.key === 'ArrowRight') stateRef.current.keys.d = true
      if (e.key === ' ' || e.key === 'Enter') {
        stateRef.current.keys.space = true
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') stateRef.current.keys.w = false
      if (e.key === 's' || e.key === 'ArrowDown') stateRef.current.keys.s = false
      if (e.key === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.a = false
      if (e.key === 'd' || e.key === 'ArrowRight') stateRef.current.keys.d = false
      if (e.key === ' ' || e.key === 'Enter') {
        stateRef.current.keys.space = false
      }
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
    scene.background = new THREE.Color(0x030712)

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Starfield
    const starsGeo = new THREE.BufferGeometry()
    const starCount = 600
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 600
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2 })
    const starField = new THREE.Points(starsGeo, starsMat)
    scene.add(starField)

    // Spaceship Mesh
    const shipGroup = new THREE.Group()
    const coneGeo = new THREE.ConeGeometry(0.8, 3, 5)
    coneGeo.rotateX(Math.PI / 2)
    const shipMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.8 })
    const cone = new THREE.Mesh(coneGeo, shipMat)
    shipGroup.add(cone)

    const wingGeo = new THREE.BoxGeometry(3, 0.1, 1.2)
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    const wings = new THREE.Mesh(wingGeo, wingMat)
    shipGroup.add(wings)

    scene.add(shipGroup)

    // Ambient & Directional
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const sun = new THREE.DirectionalLight(0x60a5fa, 1.2)
    sun.position.set(50, 50, 50)
    scene.add(sun)

    // Asteroids
    const asteroids: THREE.Mesh[] = []
    const astGeo = new THREE.DodecahedronGeometry(2.5, 0)
    const astMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 })

    for (let i = 0; i < 15; i++) {
      const ast = new THREE.Mesh(astGeo, astMat)
      ast.position.set(
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 80,
        -40 - Math.random() * 180
      )
      scene.add(ast)
      asteroids.push(ast)
    }
    stateRef.current.asteroids = asteroids

    // Lasers
    const lasers: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = []
    stateRef.current.lasers = lasers
    const laserGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 8)
    laserGeo.rotateX(Math.PI / 2)
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee })

    let lastFire = 0
    let animationFrameId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const st = stateRef.current
      const k = st.keys

      // Controls
      if (k.a) st.rot.y += 2.0 * dt
      if (k.d) st.rot.y -= 2.0 * dt
      if (k.w) st.rot.x += 1.6 * dt
      if (k.s) st.rot.x -= 1.6 * dt

      const shipQuat = new THREE.Quaternion().setFromEuler(st.rot)
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(shipQuat)
      st.pos.add(forward.clone().multiplyScalar(22 * dt))

      shipGroup.position.copy(st.pos)
      shipGroup.quaternion.copy(shipQuat)

      // Fire Laser
      if (k.space && currentTime - lastFire > 300) {
        lastFire = currentTime
        soundService.playClick()
        setLasersFired((l) => l + 1)

        const lMesh = new THREE.Mesh(laserGeo, laserMat)
        lMesh.position.copy(st.pos)
        lMesh.quaternion.copy(shipQuat)
        scene.add(lMesh)

        lasers.push({
          mesh: lMesh,
          vel: forward.clone().multiplyScalar(120),
          life: 2.5,
        })
      }

      // Update Lasers & Collisions
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i]
        l.mesh.position.add(l.vel.clone().multiplyScalar(dt))
        l.life -= dt

        // Check hit asteroid
        asteroids.forEach((ast) => {
          if (ast.visible && l.mesh.position.distanceTo(ast.position) < 3.2) {
            ast.position.set(
              st.pos.x + (Math.random() - 0.5) * 80,
              st.pos.y + (Math.random() - 0.5) * 60,
              st.pos.z - 80 - Math.random() * 80
            )
            soundService.playNotification()
            setScore((s) => s + 100)
            l.life = 0
          }
        })

        if (l.life <= 0) {
          scene.remove(l.mesh)
          l.mesh.geometry.dispose()
          lasers.splice(i, 1)
        }
      }

      // Chase Cam
      const camOffset = new THREE.Vector3(0, 3, 8).applyQuaternion(shipQuat)
      camera.position.copy(st.pos).add(camOffset)
      camera.lookAt(st.pos.clone().add(forward.multiplyScalar(10)))

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
  }, [])

  const reset = () => {
    soundService.playClick()
    stateRef.current.pos.set(0, 0, 0)
    stateRef.current.rot.set(0, 0, 0)
    setScore(0)
    setLasersFired(0)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-sky-500/30">
        <div className="flex items-center gap-3">
          <Rocket className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm text-cyan-300">CosmoVoyager 3D</span>
          <span className="text-white font-bold">Destroyed: {score / 100}</span>
          <span className="text-neutral-400">Lasers: {lasersFired}</span>
        </div>
        <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-full max-w-2xl h-80 border-2 border-cyan-500/50 rounded-2xl overflow-hidden shadow-2xl bg-black">
        <div ref={mountRef} className="w-full h-full cursor-crosshair" />

        {/* Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Crosshair className="w-8 h-8 text-cyan-400/60" />
        </div>
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        WASD to Pitch & Yaw Spaceship • Spacebar / Enter to Fire Laser Cannons • Blast deep-space asteroids
      </div>
    </div>
  )
}
