import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Globe, Compass, Sparkles } from 'lucide-react'

export const PlanetExplorer3DGame: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [scannedArtifacts, setScannedArtifacts] = useState(0)

  const stateRef = useRef({
    planetRadius: 20,
    playerTheta: 0,
    playerPhi: Math.PI / 4,
    keys: { w: false, s: false, a: false, d: false },
    artifacts: [] as THREE.Mesh[],
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
    scene.background = new THREE.Color(0x020617)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const sun = new THREE.DirectionalLight(0x38bdf8, 1.4)
    sun.position.set(60, 60, 60)
    scene.add(sun)

    // Spherical Planet
    const planetRadius = stateRef.current.planetRadius
    const planetGeo = new THREE.SphereGeometry(planetRadius, 32, 32)
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.8,
      flatShading: true,
    })
    const planet = new THREE.Mesh(planetGeo, planetMat)
    scene.add(planet)

    // Rover Mesh
    const rover = new THREE.Group()
    const roverBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.6, 1.8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15 })
    )
    rover.add(roverBody)
    scene.add(rover)

    // Artifacts on Sphere Surface
    const artifacts: THREE.Mesh[] = []
    const artGeo = new THREE.OctahedronGeometry(0.8)
    const artMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 })

    for (let i = 0; i < 6; i++) {
      const art = new THREE.Mesh(artGeo, artMat)
      const t = (i / 6) * Math.PI * 2
      const p = Math.PI / 4 + (i % 2 === 0 ? 0.3 : -0.3)
      const r = planetRadius + 0.6
      art.position.set(
        r * Math.sin(p) * Math.cos(t),
        r * Math.cos(p),
        r * Math.sin(p) * Math.sin(t)
      )
      scene.add(art)
      artifacts.push(art)
    }
    stateRef.current.artifacts = artifacts

    let animationFrameId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const st = stateRef.current
      const k = st.keys

      // Rover Spherical Movement
      const moveSpeed = 0.8 * dt
      if (k.w) st.playerPhi = Math.max(0.2, st.playerPhi - moveSpeed)
      if (k.s) st.playerPhi = Math.min(Math.PI - 0.2, st.playerPhi + moveSpeed)
      if (k.a) st.playerTheta -= moveSpeed
      if (k.d) st.playerTheta += moveSpeed

      // Surface position
      const r = st.planetRadius + 0.6
      const px = r * Math.sin(st.playerPhi) * Math.cos(st.playerTheta)
      const py = r * Math.cos(st.playerPhi)
      const pz = r * Math.sin(st.playerPhi) * Math.sin(st.playerTheta)

      rover.position.set(px, py, pz)

      // Align rover up vector with planet radius normal
      const normal = new THREE.Vector3(px, py, pz).normalize()
      rover.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)

      // Orbit camera around player
      const camOffset = normal.clone().multiplyScalar(9)
      camera.position.set(px, py, pz).add(camOffset)
      camera.lookAt(px, py, pz)

      // Check Artifact Scan
      artifacts.forEach((art) => {
        if (art.visible && rover.position.distanceTo(art.position) < 3) {
          art.visible = false
          soundService.playNotification()
          setScannedArtifacts((s) => s + 1)
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
    stateRef.current.playerTheta = 0
    stateRef.current.playerPhi = Math.PI / 4
    stateRef.current.artifacts.forEach((a) => (a.visible = true))
    setScannedArtifacts(0)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-sky-500/30">
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm text-cyan-300">ExoSphere 3D</span>
          <span className="text-white font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Artifacts Scanned: {scannedArtifacts} / 6
          </span>
        </div>
        <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-full max-w-2xl h-80 border-2 border-sky-500/50 rounded-2xl overflow-hidden shadow-2xl bg-black">
        <div ref={mountRef} className="w-full h-full cursor-none" />
      </div>

      <div className="text-[10px] text-neutral-400 text-center">
        WASD to Drive Rover across the 360° spherical planet surface • Locate all 6 glowing alien artifacts
      </div>
    </div>
  )
}
