import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { RotateCcw, Sprout, Coins, Droplets } from 'lucide-react'

interface Plot {
  x: number
  z: number
  crop: 'wheat' | 'carrot' | 'berry' | null
  stage: number // 0: empty, 1: seedling, 2: growing, 3: ripe
  watered: boolean
  mesh: THREE.Mesh
}

export const FarmingSim3DGame: React.FC<AppInstanceProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [gold, setGold] = useState(100)
  const [selectedCrop, setSelectedCrop] = useState<'wheat' | 'carrot' | 'berry'>('wheat')

  const stateRef = useRef({
    plots: [] as Plot[],
    plotsGroup: new THREE.Group(),
    camera: null as THREE.PerspectiveCamera | null,
    scene: null as THREE.Scene | null,
  })

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 600
    const height = container.clientHeight || 400

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x38bdf8)
    stateRef.current.scene = scene

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500)
    camera.position.set(0, 16, 16)
    camera.lookAt(0, 0, 0)
    stateRef.current.camera = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const sun = new THREE.DirectionalLight(0xffedd5, 1.2)
    sun.position.set(10, 30, 20)
    scene.add(sun)

    // Ground Island
    const islandGeo = new THREE.BoxGeometry(24, 2, 24)
    const islandMat = new THREE.MeshLambertMaterial({ color: 0x15803d })
    const island = new THREE.Mesh(islandGeo, islandMat)
    island.position.y = -1
    scene.add(island)

    scene.add(stateRef.current.plotsGroup)

    // Generate 4x4 Soil Plots
    const plotGeo = new THREE.BoxGeometry(2.4, 0.2, 2.4)
    const plots: Plot[] = []

    for (let r = -2; r <= 1; r++) {
      for (let c = -2; c <= 1; c++) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x78350f })
        const mesh = new THREE.Mesh(plotGeo, mat)
        const px = c * 3 + 1.5
        const pz = r * 3 + 1.5
        mesh.position.set(px, 0.1, pz)
        stateRef.current.plotsGroup.add(mesh)

        plots.push({
          x: px,
          z: pz,
          crop: null,
          stage: 0,
          watered: false,
          mesh,
        })
      }
    }
    stateRef.current.plots = plots

    // Crop Growth Loop
    const growthTimer = setInterval(() => {
      stateRef.current.plots.forEach((p) => {
        if (p.crop && p.watered && p.stage < 3) {
          p.stage++
          p.watered = false
          // Update color
          p.mesh.material = new THREE.MeshLambertMaterial({
            color: p.stage === 3 ? 0xfacc15 : 0x4ade80,
          })
        }
      })
    }, 4000)

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
      clearInterval(growthTimer)
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Click Plot to plant, water, or harvest
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = mountRef.current
    const cam = stateRef.current.camera
    if (!container || !cam) return

    const rect = container.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1
    const y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(x, y), cam)

    const meshes = stateRef.current.plots.map((p) => p.mesh)
    const hits = raycaster.intersectObjects(meshes)

    if (hits.length > 0) {
      const hitMesh = hits[0].object as THREE.Mesh
      const plot = stateRef.current.plots.find((p) => p.mesh === hitMesh)
      if (!plot) return

      // If ripe -> Harvest
      if (plot.stage === 3) {
        soundService.playNotification()
        const earnings = plot.crop === 'wheat' ? 25 : plot.crop === 'carrot' ? 40 : 60
        setGold((g) => g + earnings)
        plot.crop = null
        plot.stage = 0
        plot.watered = false
        plot.mesh.material = new THREE.MeshLambertMaterial({ color: 0x78350f })
      }
      // If empty -> Plant
      else if (!plot.crop) {
        if (gold >= 10) {
          soundService.playClick()
          setGold((g) => g - 10)
          plot.crop = selectedCrop
          plot.stage = 1
          plot.watered = true
          plot.mesh.material = new THREE.MeshLambertMaterial({ color: 0x22c55e })
        }
      }
      // If growing -> Water
      else if (!plot.watered) {
        soundService.playClick()
        plot.watered = true
        plot.mesh.material = new THREE.MeshLambertMaterial({ color: 0x166534 })
      }
    }
  }

  const reset = () => {
    soundService.playClick()
    stateRef.current.plots.forEach((p) => {
      p.crop = null
      p.stage = 0
      p.watered = false
      p.mesh.material = new THREE.MeshLambertMaterial({ color: 0x78350f })
    })
    setGold(100)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white select-none p-4 text-xs items-center justify-between">
      <div className="w-full max-w-lg flex justify-between items-center bg-neutral-900/80 p-2.5 rounded-xl border border-amber-500/30">
        <div className="flex items-center gap-4">
          <Sprout className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-sm text-amber-300">Harvest Valley 3D</span>
          <span className="text-yellow-400 font-bold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" /> {gold} Gold
          </span>
        </div>
        <button onClick={reset} className="p-1 hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-full max-w-2xl h-80 border-2 border-amber-500/50 rounded-2xl overflow-hidden shadow-2xl bg-black">
        <div ref={mountRef} onClick={handleCanvasClick} className="w-full h-full cursor-pointer" />
      </div>

      {/* Crop Selector */}
      <div className="flex items-center gap-2 bg-neutral-900/80 p-2 rounded-xl border border-white/10">
        <span className="text-[11px] text-neutral-400 font-medium">Seed:</span>
        {(['wheat', 'carrot', 'berry'] as const).map((crop) => (
          <button
            key={crop}
            onClick={() => {
              soundService.playClick()
              setSelectedCrop(crop)
            }}
            className={`px-3 py-1 rounded-lg font-bold capitalize ${
              selectedCrop === crop
                ? 'bg-amber-600 text-white shadow'
                : 'bg-white/5 hover:bg-white/10 text-neutral-300'
            }`}
          >
            {crop} ($10)
          </button>
        ))}
      </div>
    </div>
  )
}
