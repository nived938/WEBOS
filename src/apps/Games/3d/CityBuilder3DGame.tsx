import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Building, TreePine, Zap, DollarSign, Users } from 'lucide-react'

type ZoneType = 'road' | 'residential' | 'commercial' | 'park' | 'power'

export const CityBuilder3DGame: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [selectedTool, setSelectedTool] = useState<ZoneType>('residential')
  const [budget, setBudget] = useState(2000)
  const [population, setPopulation] = useState(120)

  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    grid: new Map<string, THREE.Mesh>(),
    buildingsGroup: new THREE.Group(),
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
  })

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 600
    const height = container.clientHeight || 400

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)
    stateRef.current.scene = scene

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500)
    camera.position.set(24, 28, 24)
    camera.lookAt(0, 0, 0)
    stateRef.current.camera = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const sun = new THREE.DirectionalLight(0xffedd5, 1.4)
    sun.position.set(20, 40, 20)
    scene.add(sun)

    // Grid Floor
    const gridHelper = new THREE.GridHelper(30, 15, 0x38bdf8, 0x1e293b)
    scene.add(gridHelper)

    scene.add(stateRef.current.buildingsGroup)

    let animationFrameId: number

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
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

  // Place Zone on 3D Grid
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = mountRef.current
    const cam = stateRef.current.camera
    const scene = stateRef.current.scene
    if (!container || !cam || !scene) return

    const rect = container.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1
    const y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(x, y), cam)

    // Raycast ground plane at y = 0
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const targetPoint = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, targetPoint)

    if (targetPoint) {
      const gx = Math.round(targetPoint.x / 2) * 2
      const gz = Math.round(targetPoint.z / 2) * 2
      const key = `${gx},${gz}`

      if (stateRef.current.grid.has(key)) return // Already placed

      const costs: Record<ZoneType, number> = {
        road: 40,
        residential: 120,
        commercial: 250,
        park: 80,
        power: 300,
      }
      const cost = costs[selectedTool]
      if (budget < cost) return

      soundService.playNotification()
      setBudget((b) => b - cost)

      let mesh: THREE.Mesh
      if (selectedTool === 'road') {
        const geo = new THREE.BoxGeometry(1.8, 0.05, 1.8)
        const mat = new THREE.MeshLambertMaterial({ color: 0x334155 })
        mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(gx, 0.025, gz)
      } else if (selectedTool === 'residential') {
        const height = 2 + Math.random() * 2
        const geo = new THREE.BoxGeometry(1.6, height, 1.6)
        const mat = new THREE.MeshLambertMaterial({ color: 0x10b981 })
        mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(gx, height / 2, gz)
        setPopulation((p) => p + 45)
      } else if (selectedTool === 'commercial') {
        const height = 4 + Math.random() * 4
        const geo = new THREE.BoxGeometry(1.6, height, 1.6)
        const mat = new THREE.MeshLambertMaterial({ color: 0x0ea5e9 })
        mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(gx, height / 2, gz)
        setPopulation((p) => p + 80)
      } else if (selectedTool === 'park') {
        const geo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16)
        const mat = new THREE.MeshLambertMaterial({ color: 0x22c55e })
        mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(gx, 0.1, gz)
      } else {
        // Power Plant
        const geo = new THREE.CylinderGeometry(0.8, 1.2, 3, 16)
        const mat = new THREE.MeshLambertMaterial({ color: 0xf59e0b })
        mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(gx, 1.5, gz)
      }

      stateRef.current.buildingsGroup.add(mesh)
      stateRef.current.grid.set(key, mesh)
    }
  }

  const reset = () => {
    soundService.playClick()
    stateRef.current.grid.forEach((m) => stateRef.current.buildingsGroup.remove(m))
    stateRef.current.grid.clear()
    setBudget(2000)
    setPopulation(120)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-emerald-500/30">
        <div className="flex items-center gap-4">
          <Building className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-sm text-emerald-300">MetroCraft 3D City Builder</span>
          <span className="text-amber-400 font-bold flex items-center gap-0.5">
            <DollarSign className="w-3.5 h-3.5" /> ${budget}
          </span>
          <span className="text-cyan-400 font-bold flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {population}
          </span>
        </div>
        <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-full max-w-2xl h-80 border-2 border-emerald-500/50 rounded-2xl overflow-hidden shadow-2xl bg-black">
        <div ref={mountRef} onClick={handleCanvasClick} className="w-full h-full cursor-crosshair" />
      </div>

      {/* Building Tools */}
      <div className="flex items-center gap-2 bg-neutral-900/80 p-2 rounded-xl border border-white/10">
        {(['residential', 'commercial', 'road', 'park', 'power'] as ZoneType[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              soundService.playClick()
              setSelectedTool(t)
            }}
            className={`px-3 py-1 rounded-lg font-bold capitalize ${
              selectedTool === t
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-white/5 hover:bg-white/10 text-neutral-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}
