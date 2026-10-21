import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { RotateCcw, Zap, Shield, Flame } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

export const SpaceTunnel3D: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem('nova_spacetunnel_highscore') || 0)
    } catch {
      return 0
    }
  })
  const [isGameOver, setIsGameOver] = useState(false)
  const [speedLevel, setSpeedLevel] = useState(1)

  const keysRef = useRef<{ [k: string]: boolean }>({})
  const stateRef = useRef({
    playerPos: new THREE.Vector3(0, 0, 0),
    playerVel: new THREE.Vector2(0, 0),
    obstacles: [] as { mesh: THREE.Mesh; rotSpeed: number; boundingRadius: number }[],
    tunnelRings: [] as THREE.Mesh[],
    speed: 35,
    distance: 0,
    isDead: false
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false
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

    const width = container.clientWidth || 700
    const height = container.clientHeight || 450

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050508)
    scene.fog = new THREE.Fog(0x050508, 20, 140)

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 200)
    camera.position.set(0, 0, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00f0ff, 3, 50)
    pointLight.position.set(0, 0, 2)
    scene.add(pointLight)

    // Player Starfighter Mesh
    const shipGroup = new THREE.Group()
    const shipGeo = new THREE.ConeGeometry(0.35, 1.2, 5)
    shipGeo.rotateX(Math.PI / 2)
    const shipMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x0077aa,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    })
    const shipMesh = new THREE.Mesh(shipGeo, shipMat)
    shipGroup.add(shipMesh)

    // Ship wings
    const wingGeo = new THREE.BoxGeometry(1.6, 0.05, 0.5)
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xff007f, emissive: 0x990044, emissiveIntensity: 0.6 })
    const wingMesh = new THREE.Mesh(wingGeo, wingMat)
    wingMesh.position.set(0, -0.05, 0.2)
    shipGroup.add(wingMesh)

    scene.add(shipGroup)

    // Procedural Neon Tunnel Rings
    const ringGeo = new THREE.TorusGeometry(3.6, 0.06, 8, 32)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 })
    const tunnelRings: THREE.Mesh[] = []

    for (let i = 0; i < 40; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.z = -i * 3.5
      scene.add(ring)
      tunnelRings.push(ring)
    }
    stateRef.current.tunnelRings = tunnelRings

    // Starfield Particle Stream
    const starsGeo = new THREE.BufferGeometry()
    const starsCount = 400
    const starPositions = new Float32Array(starsCount * 3)

    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 12
      starPositions[i + 1] = (Math.random() - 0.5) * 12
      starPositions[i + 2] = -Math.random() * 150
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 })
    const starField = new THREE.Points(starsGeo, starsMat)
    scene.add(starField)

    // Spawn Obstacle Utility
    const obstacleGeos = [
      new THREE.BoxGeometry(2.4, 0.4, 0.4),
      new THREE.BoxGeometry(0.4, 2.4, 0.4),
      new THREE.OctahedronGeometry(0.7)
    ]
    const obstacleMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xcc0033,
      emissiveIntensity: 0.8,
      roughness: 0.2
    })

    const spawnObstacle = (z: number) => {
      const geo = obstacleGeos[Math.floor(Math.random() * obstacleGeos.length)]
      const mesh = new THREE.Mesh(geo, obstacleMat)
      mesh.position.set(
        (Math.random() - 0.5) * 4.2,
        (Math.random() - 0.5) * 4.2,
        z
      )
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      scene.add(mesh)
      stateRef.current.obstacles.push({
        mesh,
        rotSpeed: (Math.random() - 0.5) * 3,
        boundingRadius: 0.75
      })
    }

    // Initial obstacle distribution
    for (let z = -20; z > -140; z -= 14) {
      spawnObstacle(z)
    }

    // Main Game Animation Loop
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()

      if (stateRef.current.isDead) {
        renderer.render(scene, camera)
        return
      }

      // Input Controls
      const keys = keysRef.current
      const moveSpeed = 7.5
      let dirX = 0
      let dirY = 0

      if (keys['arrowleft'] || keys['a']) dirX = -1
      if (keys['arrowright'] || keys['d']) dirX = 1
      if (keys['arrowup'] || keys['w']) dirY = 1
      if (keys['arrowdown'] || keys['s']) dirY = -1

      stateRef.current.playerVel.x += (dirX * moveSpeed - stateRef.current.playerVel.x) * 0.15
      stateRef.current.playerVel.y += (dirY * moveSpeed - stateRef.current.playerVel.y) * 0.15

      stateRef.current.playerPos.x += stateRef.current.playerVel.x * delta
      stateRef.current.playerPos.y += stateRef.current.playerVel.y * delta

      // Clamp player within tunnel radius
      const tunnelRadius = 2.4
      const distFromCenter = Math.sqrt(
        stateRef.current.playerPos.x ** 2 + stateRef.current.playerPos.y ** 2
      )
      if (distFromCenter > tunnelRadius) {
        stateRef.current.playerPos.x = (stateRef.current.playerPos.x / distFromCenter) * tunnelRadius
        stateRef.current.playerPos.y = (stateRef.current.playerPos.y / distFromCenter) * tunnelRadius
      }

      // Ship positioning & banking roll
      shipGroup.position.set(stateRef.current.playerPos.x, stateRef.current.playerPos.y, 0)
      shipGroup.rotation.z = -stateRef.current.playerVel.x * 0.15
      shipGroup.rotation.x = stateRef.current.playerVel.y * 0.1

      // Speed progression
      stateRef.current.distance += stateRef.current.speed * delta
      stateRef.current.speed = Math.min(65, 35 + stateRef.current.distance * 0.015)
      setScore(Math.floor(stateRef.current.distance))
      setSpeedLevel(Math.min(5, Math.floor(stateRef.current.speed / 12)))

      // Move Tunnel Rings
      const forwardStep = stateRef.current.speed * delta
      stateRef.current.tunnelRings.forEach(ring => {
        ring.position.z += forwardStep
        if (ring.position.z > 6) {
          ring.position.z -= 140
        }
      })

      // Move Stars
      const positions = starField.geometry.attributes.position.array as Float32Array
      for (let i = 2; i < starsCount * 3; i += 3) {
        positions[i] += forwardStep * 1.5
        if (positions[i] > 5) {
          positions[i] -= 150
        }
      }
      starField.geometry.attributes.position.needsUpdate = true

      // Move Obstacles & Collision Check
      for (let i = stateRef.current.obstacles.length - 1; i >= 0; i--) {
        const obs = stateRef.current.obstacles[i]
        obs.mesh.position.z += forwardStep
        obs.mesh.rotation.z += obs.rotSpeed * delta

        // Check collision with player
        if (Math.abs(obs.mesh.position.z) < 0.8) {
          const dx = obs.mesh.position.x - stateRef.current.playerPos.x
          const dy = obs.mesh.position.y - stateRef.current.playerPos.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < obs.boundingRadius) {
            stateRef.current.isDead = true
            soundService.playNotification()
            setIsGameOver(true)

            // Highscore save
            const finalScore = Math.floor(stateRef.current.distance)
            if (finalScore > highScore) {
              setHighScore(finalScore)
              try {
                localStorage.setItem('nova_spacetunnel_highscore', String(finalScore))
              } catch {}
            }
            break
          }
        }

        // Recycle passed obstacles
        if (obs.mesh.position.z > 8) {
          scene.remove(obs.mesh)
          stateRef.current.obstacles.splice(i, 1)
          spawnObstacle(-130)
        }
      }

      renderer.render(scene, camera)
    }

    animate()

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
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  const restartGame = () => {
    soundService.playClick()
    stateRef.current.playerPos.set(0, 0, 0)
    stateRef.current.playerVel.set(0, 0)
    stateRef.current.speed = 35
    stateRef.current.distance = 0
    stateRef.current.isDead = false

    // Reset obstacle positions
    stateRef.current.obstacles.forEach((obs, idx) => {
      obs.mesh.position.set(
        (Math.random() - 0.5) * 4.2,
        (Math.random() - 0.5) * 4.2,
        -20 - idx * 14
      )
    })

    setScore(0)
    setIsGameOver(false)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none overflow-hidden relative font-sans text-xs">
      {/* Top HUD */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-3 bg-neutral-900/80 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-mono font-bold text-sm">
            <Zap className="w-4 h-4" />
            <span>{score} m</span>
          </div>
          <span className="text-neutral-500">•</span>
          <div className="text-[10px] text-amber-400 font-bold">
            BEST: {highScore} m
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-mono text-xs">WARP {speedLevel}</span>
        </div>

        <button
          onClick={restartGame}
          className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/10 pointer-events-auto"
          title="Restart"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="flex-1 w-full h-full relative" />

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center z-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Flame className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">HULL BREACH!</h2>
          <p className="text-neutral-300 text-sm">
            Distance Traveled: <strong className="text-cyan-400">{score} meters</strong>
          </p>
          <button
            onClick={restartGame}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-white shadow-xl text-sm"
          >
            Launch Again
          </button>
        </div>
      )}

      {/* Footer Instructions */}
      <div className="absolute bottom-2 inset-x-0 text-center text-[10px] text-neutral-500 pointer-events-none">
        Steer Starfighter with Arrow Keys or WASD • Dodge rotating laser barriers & obstacles
      </div>
    </div>
  )
}
