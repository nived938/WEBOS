import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { RotateCcw, Trophy, Gem, Play, Pause, Sparkles } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

export const MarbleRunner3D: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState(0)
  const [gemsLeft, setGemsLeft] = useState(5)
  const [won, setWon] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const keysRef = useRef<{ [key: string]: boolean }>({})
  const stateRef = useRef({
    marblePos: new THREE.Vector3(0, 0.5, 0),
    marbleVel: new THREE.Vector3(0, 0, 0),
    platformTilt: new THREE.Vector2(0, 0),
    gems: [] as THREE.Mesh[],
    walls: [] as { x: number; z: number; w: number; d: number }[],
    goalPos: new THREE.Vector3(7, 0.5, 7),
    score: 0,
    gemsRemaining: 5,
    isWon: false,
    isPaused: false
  })

  // Keyboard handlers
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

  // Timer loop
  useEffect(() => {
    let interval: any
    if (!won && !isPaused) {
      interval = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [won, isPaused])

  // Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 700
    const height = container.clientHeight || 450

    // Scene & Camera
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x09090b)
    scene.fog = new THREE.FogExp2(0x09090b, 0.035)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 18, 14)
    camera.lookAt(0, 0, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0x60a5fa, 1.8)
    dirLight.position.set(10, 20, 10)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    scene.add(dirLight)

    const pointLight = new THREE.PointLight(0xa855f7, 2, 20)
    pointLight.position.set(-6, 4, -6)
    scene.add(pointLight)

    // Platform Group
    const platformGroup = new THREE.Group()
    scene.add(platformGroup)

    // Floor Mesh
    const floorGeo = new THREE.BoxGeometry(18, 0.8, 18)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e24,
      roughness: 0.3,
      metalness: 0.6
    })
    const floorMesh = new THREE.Mesh(floorGeo, floorMat)
    floorMesh.position.y = -0.4
    floorMesh.receiveShadow = true
    platformGroup.add(floorMesh)

    // Grid wireframe helper on floor
    const gridHelper = new THREE.GridHelper(18, 18, 0x3b82f6, 0x27272a)
    gridHelper.position.y = 0.01
    platformGroup.add(gridHelper)

    // Maze Outer Boundary Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2, metalness: 0.8 })
    const wallThickness = 0.6
    const wallHeight = 1.2

    const wallsData = [
      { x: 0, z: -9, w: 18, d: wallThickness },
      { x: 0, z: 9, w: 18, d: wallThickness },
      { x: -9, z: 0, w: wallThickness, d: 18 },
      { x: 9, z: 0, w: wallThickness, d: 18 },
      // Internal maze dividers
      { x: -3, z: -2, w: 6, d: 0.5 },
      { x: 2, z: 3, w: 0.5, d: 8 },
      { x: 4, z: -4, w: 6, d: 0.5 },
      { x: -5, z: 4, w: 0.5, d: 6 },
    ]
    stateRef.current.walls = wallsData

    wallsData.forEach(w => {
      const wGeo = new THREE.BoxGeometry(w.w, wallHeight, w.d)
      const wMesh = new THREE.Mesh(wGeo, wallMat)
      wMesh.position.set(w.x, wallHeight / 2, w.z)
      wMesh.castShadow = true
      wMesh.receiveShadow = true
      platformGroup.add(wMesh)
    })

    // Marble Sphere
    const marbleGeo = new THREE.SphereGeometry(0.5, 32, 32)
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x78350f,
      emissiveIntensity: 0.2
    })
    const marble = new THREE.Mesh(marbleGeo, marbleMat)
    marble.castShadow = true
    platformGroup.add(marble)

    // Collectible Gems
    const gemGeo = new THREE.OctahedronGeometry(0.35)
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      roughness: 0.1
    })

    const gemPositions = [
      new THREE.Vector3(-6, 0.5, -6),
      new THREE.Vector3(6, 0.5, -6),
      new THREE.Vector3(-6, 0.5, 6),
      new THREE.Vector3(0, 0.5, 4),
      new THREE.Vector3(5, 0.5, 0),
    ]

    const gems: THREE.Mesh[] = []
    gemPositions.forEach(pos => {
      const g = new THREE.Mesh(gemGeo, gemMat)
      g.position.copy(pos)
      platformGroup.add(g)
      gems.push(g)
    })
    stateRef.current.gems = gems

    // Goal Ring
    const goalGeo = new THREE.TorusGeometry(0.9, 0.12, 16, 32)
    const goalMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8
    })
    const goal = new THREE.Mesh(goalGeo, goalMat)
    goal.rotation.x = Math.PI / 2
    goal.position.set(7, 0.05, 7)
    platformGroup.add(goal)

    // Animation Loop
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()

      if (stateRef.current.isPaused) return

      // Input tilt calculation
      const keys = keysRef.current
      let targetTiltX = 0
      let targetTiltZ = 0
      const tiltSpeed = 0.28

      if (keys['arrowup'] || keys['w']) targetTiltX = -tiltSpeed
      if (keys['arrowdown'] || keys['s']) targetTiltX = tiltSpeed
      if (keys['arrowleft'] || keys['a']) targetTiltZ = -tiltSpeed
      if (keys['arrowright'] || keys['d']) targetTiltZ = tiltSpeed

      // Smooth platform tilt lerp
      stateRef.current.platformTilt.x += (targetTiltX - stateRef.current.platformTilt.x) * 0.15
      stateRef.current.platformTilt.y += (targetTiltZ - stateRef.current.platformTilt.y) * 0.15

      platformGroup.rotation.x = stateRef.current.platformTilt.x
      platformGroup.rotation.z = -stateRef.current.platformTilt.y

      // Physics acceleration from gravity tilt
      const gravity = 25
      stateRef.current.marbleVel.x += Math.sin(stateRef.current.platformTilt.y) * gravity * delta
      stateRef.current.marbleVel.z += Math.sin(stateRef.current.platformTilt.x) * gravity * delta

      // Damping / friction
      stateRef.current.marbleVel.multiplyScalar(0.975)

      // Update marble position
      stateRef.current.marblePos.x += stateRef.current.marbleVel.x * delta
      stateRef.current.marblePos.z += stateRef.current.marbleVel.z * delta

      // Wall Collisions
      const radius = 0.5
      stateRef.current.walls.forEach(w => {
        const minX = w.x - w.w / 2 - radius
        const maxX = w.x + w.w / 2 + radius
        const minZ = w.z - w.d / 2 - radius
        const maxZ = w.z + w.d / 2 + radius

        if (
          stateRef.current.marblePos.x > minX &&
          stateRef.current.marblePos.x < maxX &&
          stateRef.current.marblePos.z > minZ &&
          stateRef.current.marblePos.z < maxZ
        ) {
          // Push out and bounce
          const overlapX1 = stateRef.current.marblePos.x - minX
          const overlapX2 = maxX - stateRef.current.marblePos.x
          const overlapZ1 = stateRef.current.marblePos.z - minZ
          const overlapZ2 = maxZ - stateRef.current.marblePos.z

          const minOverlap = Math.min(overlapX1, overlapX2, overlapZ1, overlapZ2)
          if (minOverlap === overlapX1) {
            stateRef.current.marblePos.x = minX
            stateRef.current.marbleVel.x *= -0.5
          } else if (minOverlap === overlapX2) {
            stateRef.current.marblePos.x = maxX
            stateRef.current.marbleVel.x *= -0.5
          } else if (minOverlap === overlapZ1) {
            stateRef.current.marblePos.z = minZ
            stateRef.current.marbleVel.z *= -0.5
          } else {
            stateRef.current.marblePos.z = maxZ
            stateRef.current.marbleVel.z *= -0.5
          }
        }
      })

      // Clamp boundary
      stateRef.current.marblePos.x = THREE.MathUtils.clamp(stateRef.current.marblePos.x, -8.4, 8.4)
      stateRef.current.marblePos.z = THREE.MathUtils.clamp(stateRef.current.marblePos.z, -8.4, 8.4)

      marble.position.copy(stateRef.current.marblePos)
      marble.rotation.x += stateRef.current.marbleVel.z * delta * 2
      marble.rotation.z -= stateRef.current.marbleVel.x * delta * 2

      // Rotate and check gems
      stateRef.current.gems.forEach((g) => {
        if (!g.visible) return
        g.rotation.y += delta * 2
        g.rotation.x += delta * 1.5

        if (g.position.distanceTo(stateRef.current.marblePos) < 0.9) {
          g.visible = false
          soundService.playClick()
          stateRef.current.score += 100
          stateRef.current.gemsRemaining -= 1
          setScore(stateRef.current.score)
          setGemsLeft(stateRef.current.gemsRemaining)
        }
      })

      // Goal detection
      if (
        !stateRef.current.isWon &&
        stateRef.current.gemsRemaining === 0 &&
        stateRef.current.marblePos.distanceTo(stateRef.current.goalPos) < 1.2
      ) {
        stateRef.current.isWon = true
        soundService.playNotification()
        setWon(true)
      }

      renderer.render(scene, camera)
    }

    animate()

    // Resize handler
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
    stateRef.current.marblePos.set(0, 0.5, 0)
    stateRef.current.marbleVel.set(0, 0, 0)
    stateRef.current.gems.forEach(g => (g.visible = true))
    stateRef.current.score = 0
    stateRef.current.gemsRemaining = 5
    stateRef.current.isWon = false
    setScore(0)
    setGemsLeft(5)
    setWon(false)
    setTimer(0)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none overflow-hidden relative font-sans text-xs">
      {/* HUD Header */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-bold text-sm">{score} PTS</span>
        </div>

        <div className="flex items-center space-x-3 bg-neutral-900/80 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
          <div className="flex items-center space-x-1.5 text-cyan-400">
            <Gem className="w-4 h-4" />
            <span className="font-bold">{gemsLeft} Left</span>
          </div>
          <span className="text-neutral-500">•</span>
          <div className="font-mono text-neutral-300">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className="flex items-center space-x-1 pointer-events-auto">
          <button
            onClick={restartGame}
            className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/10"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="flex-1 w-full h-full relative" />

      {/* Victory Overlay */}
      {won && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center z-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Maze Completed!</h2>
          <p className="text-neutral-300 text-sm">
            All gems secured in {timer} seconds with {score} points.
          </p>
          <button
            onClick={restartGame}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-xl"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Footer Controls Tip */}
      <div className="absolute bottom-2 inset-x-0 text-center text-[10px] text-neutral-400 pointer-events-none">
        Tilt board using Arrow Keys or WASD • Collect all 5 cyan gems and roll into green portal
      </div>
    </div>
  )
}
