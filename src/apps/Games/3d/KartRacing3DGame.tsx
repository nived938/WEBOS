import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Zap, Flag } from 'lucide-react'

export const KartRacing3DGame: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [lap, setLap] = useState(1)
  const [speed, setSpeed] = useState(0)
  const [item, setItem] = useState<string | null>(null)
  const [won, setWon] = useState(false)

  const stateRef = useRef({
    kartPos: { x: 0, z: 0 },
    kartAngle: 0,
    speed: 0,
    lapCount: 1,
    keys: { w: false, s: false, a: false, d: false, space: false },
    itemBoxes: [] as THREE.Mesh[],
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') stateRef.current.keys.w = true
      if (e.key === 's' || e.key === 'ArrowDown') stateRef.current.keys.s = true
      if (e.key === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.a = true
      if (e.key === 'd' || e.key === 'ArrowRight') stateRef.current.keys.d = true
      if (e.key === ' ' || e.key === 'Enter') stateRef.current.keys.space = true
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') stateRef.current.keys.w = false
      if (e.key === 's' || e.key === 'ArrowDown') stateRef.current.keys.s = false
      if (e.key === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.a = false
      if (e.key === 'd' || e.key === 'ArrowRight') stateRef.current.keys.d = false
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
    scene.background = new THREE.Color(0x38bdf8)
    scene.fog = new THREE.FogExp2(0x38bdf8, 0.01)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const sun = new THREE.DirectionalLight(0xffedd5, 1.2)
    sun.position.set(40, 80, 40)
    scene.add(sun)

    // Circular/Oval Racetrack Floor
    const trackGeo = new THREE.RingGeometry(25, 45, 64)
    trackGeo.rotateX(-Math.PI / 2)
    const trackMat = new THREE.MeshLambertMaterial({ color: 0x1e293b })
    const track = new THREE.Mesh(trackGeo, trackMat)
    scene.add(track)

    // Infield grass
    const grassGeo = new THREE.CircleGeometry(25, 64)
    grassGeo.rotateX(-Math.PI / 2)
    const grass = new THREE.Mesh(grassGeo, new THREE.MeshLambertMaterial({ color: 0x15803d }))
    scene.add(grass)

    // Start / Finish Line
    const finishLine = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    )
    finishLine.rotation.x = -Math.PI / 2
    finishLine.position.set(35, 0.05, 0)
    scene.add(finishLine)

    // Kart Mesh
    const kart = new THREE.Group()
    const kartBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.6, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
    )
    kartBody.position.y = 0.4
    kart.add(kartBody)

    // Spoiler
    const spoiler = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.1, 0.4),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    )
    spoiler.position.set(0, 0.9, 0.8)
    kart.add(spoiler)

    scene.add(kart)

    // Item Boxes
    const itemBoxes: THREE.Mesh[] = []
    const boxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2)
    const boxMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: true })

    for (let i = 0; i < 4; i++) {
      const ib = new THREE.Mesh(boxGeo, boxMat)
      const ang = (i / 4) * Math.PI * 2 + 0.3
      ib.position.set(Math.cos(ang) * 35, 1, Math.sin(ang) * 35)
      scene.add(ib)
      itemBoxes.push(ib)
    }
    stateRef.current.itemBoxes = itemBoxes

    // Starting pos on track
    stateRef.current.kartPos = { x: 35, z: 0 }
    stateRef.current.kartAngle = 0

    let prevAngle = 0
    let animationFrameId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const st = stateRef.current
      const k = st.keys

      // Acceleration & Steering
      if (k.w) st.speed = Math.min(st.speed + 35 * dt, 80)
      else if (k.s) st.speed = Math.max(st.speed - 45 * dt, 0)
      else st.speed = Math.max(st.speed - 12 * dt, 0)

      if (k.a && st.speed > 1) st.kartAngle += 2.6 * dt
      if (k.d && st.speed > 1) st.kartAngle -= 2.6 * dt

      // Boost item use
      if (k.space) {
        st.speed = 110
        setItem(null)
        soundService.playNotification()
      }

      // Move in kart direction
      st.kartPos.x -= Math.sin(st.kartAngle) * st.speed * dt
      st.kartPos.z -= Math.cos(st.kartAngle) * st.speed * dt

      kart.position.set(st.kartPos.x, 0, st.kartPos.z)
      kart.rotation.y = st.kartAngle

      setSpeed(Math.floor(st.speed))

      // Track distance angle for lap detection
      const currentTrackAngle = Math.atan2(st.kartPos.z, st.kartPos.x)
      if (prevAngle < -2.8 && currentTrackAngle > 2.8) {
        // Crossed finish line!
        soundService.playNotification()
        st.lapCount++
        setLap(st.lapCount)
        if (st.lapCount > 3) {
          soundService.playStartup()
          setWon(true)
        }
      }
      prevAngle = currentTrackAngle

      // Spin item boxes & collect
      itemBoxes.forEach((ib) => {
        ib.rotation.y += 2 * dt
        ib.rotation.x += 1 * dt
        if (ib.visible && kart.position.distanceTo(ib.position) < 2) {
          ib.visible = false
          soundService.playNotification()
          setItem('Rocket Boost [SPACE]')
          setTimeout(() => (ib.visible = true), 5000)
        }
      })

      // Third-person chase camera
      const camOffset = new THREE.Vector3(
        Math.sin(st.kartAngle) * 7,
        3.5,
        Math.cos(st.kartAngle) * 7
      )
      camera.position.set(st.kartPos.x, 0, st.kartPos.z).add(camOffset)
      camera.lookAt(st.kartPos.x, 0.8, st.kartPos.z)

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
    stateRef.current.kartPos = { x: 35, z: 0 }
    stateRef.current.kartAngle = 0
    stateRef.current.speed = 0
    stateRef.current.lapCount = 1
    setLap(1)
    setWon(false)
    setItem(null)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-red-500/30">
        <div className="flex items-center gap-4">
          <Flag className="w-4 h-4 text-red-400" />
          <span className="font-bold text-sm text-red-400">Nova Kart 3D</span>
          <span className="text-white font-bold">{speed} KM/H</span>
          <span className="text-amber-300 font-bold">Lap: {lap} / 3</span>
          {item && <span className="text-cyan-400 font-bold animate-pulse">{item}</span>}
        </div>
        <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-full max-w-2xl h-80 border-2 border-red-500/50 rounded-2xl overflow-hidden shadow-2xl bg-black">
        <div ref={mountRef} className="w-full h-full cursor-none" />

        {won && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
            <Trophy className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
            <h3 className="text-base font-bold text-amber-400">Grand Prix Winner!</h3>
            <p className="text-neutral-400 text-xs mb-3">Completed 3 Laps in 1st Place!</p>
            <button onClick={reset} className="px-4 py-1.5 bg-red-600 hover:bg-red-500 font-bold text-white rounded-lg shadow">
              Race Again
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        W / S = Accelerate / Brake • A / D = Steer Kart • Grab spinning item boxes for Rocket Boost [SPACE]
      </div>
    </div>
  )
}
