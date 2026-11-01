import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Shield, Swords } from 'lucide-react'

export const BattleArena3DGame: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [hp, setHp] = useState(100)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const stateRef = useRef({
    pos: new THREE.Vector3(0, 1.2, 0),
    yaw: 0,
    keys: { w: false, s: false, a: false, d: false, left: false, right: false, space: false },
    drones: [] as { mesh: THREE.Mesh; hp: number; speed: number }[],
    projectiles: [] as { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[],
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'w') stateRef.current.keys.w = true
      if (e.key === 's') stateRef.current.keys.s = true
      if (e.key === 'a') stateRef.current.keys.a = true
      if (e.key === 'd') stateRef.current.keys.d = true
      if (e.key === 'ArrowLeft') stateRef.current.keys.left = true
      if (e.key === 'ArrowRight') stateRef.current.keys.right = true
      if (e.key === ' ' || e.key === 'Enter') stateRef.current.keys.space = true
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'w') stateRef.current.keys.w = false
      if (e.key === 's') stateRef.current.keys.s = false
      if (e.key === 'a') stateRef.current.keys.a = false
      if (e.key === 'd') stateRef.current.keys.d = false
      if (e.key === 'ArrowLeft') stateRef.current.keys.left = false
      if (e.key === 'ArrowRight') stateRef.current.keys.right = false
      if (e.key === ' ' || e.key === 'Enter') stateRef.current.keys.space = false
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
    scene.background = new THREE.Color(0x0c0a17)
    scene.fog = new THREE.FogExp2(0x0c0a17, 0.02)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Arena Floor
    const floorGeo = new THREE.CylinderGeometry(40, 40, 1, 32)
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.6 })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.position.y = -0.5
    scene.add(floor)

    // Arena Boundary Ring
    const ringGeo = new THREE.TorusGeometry(40, 1, 8, 32)
    ringGeo.rotateX(Math.PI / 2)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1 })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    scene.add(ring)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const spot = new THREE.SpotLight(0xa855f7, 2)
    spot.position.set(0, 30, 0)
    scene.add(spot)

    // Mech Mesh
    const mech = new THREE.Group()
    const mechBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2, 1.2), new THREE.MeshStandardMaterial({ color: 0x4f46e5 }))
    mech.add(mechBody)
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x06b6d4 }))
    head.position.y = 1.4
    mech.add(head)
    scene.add(mech)

    // Drones
    const drones: { mesh: THREE.Mesh; hp: number; speed: number }[] = []
    const droneGeo = new THREE.SphereGeometry(1, 12, 12)
    const droneMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })

    for (let i = 0; i < 4; i++) {
      const dMesh = new THREE.Mesh(droneGeo, droneMat)
      const ang = (i / 4) * Math.PI * 2
      dMesh.position.set(Math.cos(ang) * 28, 1.2, Math.sin(ang) * 28)
      scene.add(dMesh)
      drones.push({ mesh: dMesh, hp: 30, speed: 6 + Math.random() * 4 })
    }
    stateRef.current.drones = drones

    // Projectiles
    const projectiles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = []
    stateRef.current.projectiles = projectiles
    const projGeo = new THREE.SphereGeometry(0.3, 8, 8)
    const projMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee })

    let lastShot = 0
    let animationFrameId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const st = stateRef.current
      const k = st.keys

      // Rotation & Movement
      if (k.left) st.yaw += 2.4 * dt
      if (k.right) st.yaw -= 2.4 * dt

      const move = new THREE.Vector3(0, 0, 0)
      if (k.w) move.z -= 1
      if (k.s) move.z += 1
      if (k.a) move.x -= 1
      if (k.d) move.x += 1
      move.normalize()
      move.applyAxisAngle(new THREE.Vector3(0, 1, 0), st.yaw)

      st.pos.add(move.multiplyScalar(12 * dt))
      // Clamp to arena circle
      if (st.pos.length() > 36) st.pos.setLength(36)

      mech.position.copy(st.pos)
      mech.rotation.y = st.yaw

      // Fire Plasma Beam
      if (k.space && currentTime - lastShot > 280) {
        lastShot = currentTime
        soundService.playClick()

        const pMesh = new THREE.Mesh(projGeo, projMat)
        pMesh.position.copy(st.pos)
        scene.add(pMesh)

        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), st.yaw)
        projectiles.push({
          mesh: pMesh,
          vel: forward.multiplyScalar(45),
          life: 2,
        })
      }

      // Update Projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i]
        p.mesh.position.add(p.vel.clone().multiplyScalar(dt))
        p.life -= dt

        // Check hit drone
        drones.forEach((d) => {
          if (p.mesh.position.distanceTo(d.mesh.position) < 1.4) {
            d.hp -= 15
            p.life = 0
            soundService.playNotification()
            if (d.hp <= 0) {
              setScore((s) => s + 100)
              d.hp = 30
              const ang = Math.random() * Math.PI * 2
              d.mesh.position.set(Math.cos(ang) * 32, 1.2, Math.sin(ang) * 32)
            }
          }
        })

        if (p.life <= 0) {
          scene.remove(p.mesh)
          p.mesh.geometry.dispose()
          projectiles.splice(i, 1)
        }
      }

      // Update Drones chasing player
      drones.forEach((d) => {
        const dir = st.pos.clone().sub(d.mesh.position).normalize()
        d.mesh.position.add(dir.multiplyScalar(d.speed * dt))

        if (d.mesh.position.distanceTo(st.pos) < 2) {
          soundService.playTrashEmpty()
          setHp((h) => {
            const next = h - 0.4
            if (next <= 0) setGameOver(true)
            return Math.max(0, next)
          })
        }
      })

      // Third-person chase camera
      const camOffset = new THREE.Vector3(0, 5, 12).applyAxisAngle(new THREE.Vector3(0, 1, 0), st.yaw)
      camera.position.copy(st.pos).add(camOffset)
      camera.lookAt(st.pos.x, st.pos.y + 1, st.pos.z)

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
    stateRef.current.pos.set(0, 1.2, 0)
    setHp(100)
    setScore(0)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-purple-500/30">
        <div className="flex items-center gap-4">
          <Swords className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-sm text-purple-300">Mech Gladiator 3D</span>
          <span className="text-emerald-400 font-bold">Shields: {Math.floor(hp)}%</span>
          <span className="text-white font-bold">Kills: {score / 100}</span>
        </div>
        <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-full max-w-2xl h-80 border-2 border-purple-500/50 rounded-2xl overflow-hidden shadow-2xl bg-black">
        <div ref={mountRef} className="w-full h-full cursor-none" />

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-red-500 mb-1">Mech Annihilated!</h3>
            <p className="text-neutral-400 text-xs mb-3">Total Score: {score}</p>
            <button onClick={reset} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 font-bold text-white rounded-lg shadow">
              Respawn Mech
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        WASD to Move • Arrow Left/Right to Turn • Spacebar to Fire Plasma Beams at enemy battle drones
      </div>
    </div>
  )
}
