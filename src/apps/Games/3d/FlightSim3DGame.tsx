import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Trophy, Compass, Wind } from 'lucide-react'

export const FlightSim3DGame: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [altitude, setAltitude] = useState(120)
  const [speed, setSpeed] = useState(180)
  const [ringsPassed, setRingsPassed] = useState(0)

  const stateRef = useRef({
    pos: new THREE.Vector3(0, 20, 0),
    rot: new THREE.Euler(0, 0, 0, 'YXZ'),
    speed: 35,
    keys: { pitchUp: false, pitchDown: false, rollLeft: false, rollRight: false, throttleUp: false, throttleDown: false },
    rings: [] as THREE.Mesh[],
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') stateRef.current.keys.pitchDown = true
      if (e.key === 'ArrowDown' || e.key === 's') stateRef.current.keys.pitchUp = true
      if (e.key === 'ArrowLeft' || e.key === 'a') stateRef.current.keys.rollLeft = true
      if (e.key === 'ArrowRight' || e.key === 'd') stateRef.current.keys.rollRight = true
      if (e.key === 'q') stateRef.current.keys.throttleDown = true
      if (e.key === 'e') stateRef.current.keys.throttleUp = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') stateRef.current.keys.pitchDown = false
      if (e.key === 'ArrowDown' || e.key === 's') stateRef.current.keys.pitchUp = false
      if (e.key === 'ArrowLeft' || e.key === 'a') stateRef.current.keys.rollLeft = false
      if (e.key === 'ArrowRight' || e.key === 'd') stateRef.current.keys.rollRight = false
      if (e.key === 'q') stateRef.current.keys.throttleDown = false
      if (e.key === 'e') stateRef.current.keys.throttleUp = false
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
    scene.background = new THREE.Color(0x38bdf8)
    scene.fog = new THREE.FogExp2(0x38bdf8, 0.005)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.3)
    sunLight.position.set(100, 200, 100)
    scene.add(sunLight)

    // Terrain Island
    const terrainGeo = new THREE.PlaneGeometry(800, 800, 32, 32)
    terrainGeo.rotateX(-Math.PI / 2)
    const posAttr = terrainGeo.attributes.position
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i)
      const z = posAttr.getZ(i)
      const h = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 20
      posAttr.setY(i, h)
    }
    terrainGeo.computeVertexNormals()

    const terrainMat = new THREE.MeshLambertMaterial({ color: 0x15803d })
    const terrain = new THREE.Mesh(terrainGeo, terrainMat)
    scene.add(terrain)

    // Ocean plane
    const waterGeo = new THREE.PlaneGeometry(1200, 1200)
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x0284c7, transparent: true, opacity: 0.8 })
    const water = new THREE.Mesh(waterGeo, waterMat)
    water.rotation.x = -Math.PI / 2
    water.position.y = -2
    scene.add(water)

    // Airplane Mesh
    const planeGroup = new THREE.Group()
    const fuselageGeo = new THREE.ConeGeometry(0.8, 4, 8)
    fuselageGeo.rotateX(Math.PI / 2)
    const fuselageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat)
    planeGroup.add(fuselage)

    const wingsGeo = new THREE.BoxGeometry(7, 0.1, 1.2)
    const wingsMat = new THREE.MeshStandardMaterial({ color: 0xef4444 })
    const wings = new THREE.Mesh(wingsGeo, wingsMat)
    planeGroup.add(wings)

    const tailGeo = new THREE.BoxGeometry(0.1, 1.4, 0.8)
    const tail = new THREE.Mesh(tailGeo, wingsMat)
    tail.position.set(0, 0.7, 1.6)
    planeGroup.add(tail)

    scene.add(planeGroup)

    // Ring Checkpoints
    const rings: THREE.Mesh[] = []
    for (let i = 0; i < 8; i++) {
      const ringGeo = new THREE.TorusGeometry(8, 0.6, 8, 24)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.set(
        Math.sin(i * 0.8) * 80,
        25 + Math.sin(i) * 15,
        -50 - i * 80
      )
      scene.add(ring)
      rings.push(ring)
    }
    stateRef.current.rings = rings

    let animationFrameId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const st = stateRef.current
      const k = st.keys

      // Controls
      if (k.pitchDown) st.rot.x += 1.2 * dt
      if (k.pitchUp) st.rot.x -= 1.2 * dt
      if (k.rollLeft) { st.rot.z += 2.0 * dt; st.rot.y += 1.0 * dt }
      if (k.rollRight) { st.rot.z -= 2.0 * dt; st.rot.y -= 1.0 * dt }
      if (k.throttleUp) st.speed = Math.min(st.speed + 15 * dt, 75)
      if (k.throttleDown) st.speed = Math.max(st.speed - 15 * dt, 15)

      // Forward flight direction
      const forward = new THREE.Vector3(0, 0, -1)
      const planeQuat = new THREE.Quaternion().setFromEuler(st.rot)
      forward.applyQuaternion(planeQuat)

      st.pos.add(forward.clone().multiplyScalar(st.speed * dt))

      // Keep minimum altitude
      if (st.pos.y < 5) st.pos.y = 5

      planeGroup.position.copy(st.pos)
      planeGroup.quaternion.copy(planeQuat)

      // Chase Camera
      const camOffset = new THREE.Vector3(0, 3, 10).applyQuaternion(planeQuat)
      camera.position.copy(st.pos).add(camOffset)
      camera.lookAt(st.pos)

      setAltitude(Math.floor(st.pos.y * 3))
      setSpeed(Math.floor(st.speed * 4))

      // Check ring collision
      rings.forEach((ring) => {
        if (ring.visible && st.pos.distanceTo(ring.position) < 10) {
          ring.visible = false
          soundService.playNotification()
          setRingsPassed((r) => r + 1)
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
  }, [])

  const reset = () => {
    soundService.playClick()
    stateRef.current.pos.set(0, 20, 0)
    stateRef.current.rot.set(0, 0, 0)
    stateRef.current.speed = 35
    stateRef.current.rings.forEach((r) => (r.visible = true))
    setRingsPassed(0)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-sky-500/30">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm text-sky-400">AeroSim 3D</span>
          <span className="text-white font-bold">ALT: {altitude}m</span>
          <span className="text-amber-300 font-bold">SPD: {speed} KTS</span>
          <span className="text-emerald-400 font-bold">Rings: {ringsPassed}/8</span>
        </div>
        <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-full max-w-2xl h-80 border-2 border-sky-500/50 rounded-2xl overflow-hidden shadow-2xl bg-black">
        <div ref={mountRef} className="w-full h-full cursor-none" />

        {/* Flight HUD Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 border-2 border-emerald-400/40 rounded-full flex items-center justify-center">
            <div className="w-3 h-0.5 bg-emerald-400" />
            <div className="w-0.5 h-3 bg-emerald-400" />
          </div>
        </div>
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        W / S = Pitch Down / Up • A / D = Roll Left / Right • Q / E = Throttle • Fly through the yellow rings
      </div>
    </div>
  )
}
