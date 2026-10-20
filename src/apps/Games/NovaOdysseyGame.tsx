import React, { useRef, useEffect, useState, useCallback } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Heart } from 'lucide-react'

const HIGH_SCORE_KEY = 'nova_odyssey_highscore_v2'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  radius: number
  alpha: number
  decay: number
}

interface Platform {
  x: number
  y: number
  w: number
  h: number
  type: 'normal' | 'moving' | 'bounce'
  vx?: number
  minX?: number
  maxX?: number
}

interface Star {
  x: number
  y: number
  collected: boolean
  osc: number
}

interface Drone {
  x: number
  y: number
  w: number
  h: number
  vx: number
  minX: number
  maxX: number
}

interface Spike {
  x: number
  y: number
  w: number
  h: number
}

export const NovaOdysseyGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10)
    } catch {
      return 0
    }
  })
  const [lives, setLives] = useState(3)
  const [soundMuted, setSoundMuted] = useState(false)

  // Game internal mutable state referenced in loop
  const stateRef = useRef({
    gameState: 'menu' as 'menu' | 'playing' | 'paused' | 'gameover',
    score: 0,
    lives: 3,
    highScore: 0,
    cameraX: 0,
    keys: { left: false, right: false, jump: false },
    player: {
      x: 80,
      y: 200,
      w: 24,
      h: 36,
      vx: 0,
      vy: 0,
      speed: 4.8,
      jumpForce: -9.5,
      grounded: false,
      jumpsLeft: 2,
      facing: 1, // 1: right, -1: left
      invulnerableTimer: 0,
      runFrame: 0,
    },
    particles: [] as Particle[],
    platforms: [] as Platform[],
    stars: [] as Star[],
    drones: [] as Drone[],
    spikes: [] as Spike[],
    nextChunkX: 0,
    levelLength: 8000,
  })

  // Sync stateRef high score
  useEffect(() => {
    stateRef.current.highScore = highScore
  }, [highScore])

  // Sound triggers
  const playSfx = useCallback((type: 'jump' | 'coin' | 'hit' | 'over') => {
    if (soundMuted) return
    switch (type) {
      case 'jump':
        soundService.playGameJump()
        break
      case 'coin':
        soundService.playGameCoin()
        break
      case 'hit':
        soundService.playGameHit()
        break
      case 'over':
        soundService.playGameOver()
        break
    }
  }, [soundMuted])

  // World Generation: generates chunks of platforms, stars, and hazards
  const generateWorld = useCallback(() => {
    const s = stateRef.current
    s.platforms = [
      // Safe starting zone
      { x: 0, y: 340, w: 500, h: 40, type: 'normal' },
      { x: 220, y: 260, w: 100, h: 16, type: 'normal' },
      { x: 380, y: 200, w: 120, h: 16, type: 'bounce' },
    ]
    s.stars = [
      { x: 260, y: 220, collected: false, osc: 0 },
      { x: 440, y: 150, collected: false, osc: 1 },
    ]
    s.drones = []
    s.spikes = []
    s.particles = []

    // Procedurally generate course up to 6000px
    let currX = 550
    let currY = 320

    while (currX < 7000) {
      const gap = 80 + Math.random() * 80
      const width = 90 + Math.random() * 120
      currY = Math.max(160, Math.min(350, currY + (Math.random() * 120 - 60)))

      const platformType: Platform['type'] =
        Math.random() < 0.25 ? 'moving' : Math.random() < 0.15 ? 'bounce' : 'normal'

      if (platformType === 'moving') {
        s.platforms.push({
          x: currX + gap,
          y: currY,
          w: width,
          h: 16,
          type: 'moving',
          vx: 1.5,
          minX: currX + gap - 40,
          maxX: currX + gap + 100,
        })
      } else {
        s.platforms.push({
          x: currX + gap,
          y: currY,
          w: width,
          h: 16,
          type: platformType,
        })
      }

      // Add stars
      if (Math.random() > 0.3) {
        s.stars.push({
          x: currX + gap + width / 2,
          y: currY - 40,
          collected: false,
          osc: Math.random() * Math.PI,
        })
      }

      // Add drones or spikes occasionally
      if (currX > 800 && Math.random() < 0.35) {
        s.drones.push({
          x: currX + gap + 20,
          y: currY - 65,
          w: 24,
          h: 20,
          vx: 1.2,
          minX: currX + gap,
          maxX: currX + gap + width - 24,
        })
      } else if (currX > 1200 && Math.random() < 0.25) {
        s.spikes.push({
          x: currX + gap + width / 2 - 12,
          y: currY - 12,
          w: 24,
          h: 12,
        })
      }

      currX += gap + width
    }

    // Reset player
    s.player.x = 80
    s.player.y = 200
    s.player.vx = 0
    s.player.vy = 0
    s.player.jumpsLeft = 2
    s.player.invulnerableTimer = 0
    s.cameraX = 0
    s.score = 0
    s.lives = 3
    setScore(0)
    setLives(3)
  }, [])

  const startGame = useCallback(() => {
    generateWorld()
    stateRef.current.gameState = 'playing'
    setGameState('playing')
  }, [generateWorld])

  const pauseGame = useCallback(() => {
    stateRef.current.gameState = 'paused'
    setGameState('paused')
  }, [])

  const resumeGame = useCallback(() => {
    stateRef.current.gameState = 'playing'
    setGameState('playing')
  }, [])

  const restartGame = useCallback(() => {
    generateWorld()
    stateRef.current.gameState = 'playing'
    setGameState('playing')
  }, [generateWorld])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (s.gameState === 'playing') {
          pauseGame()
        } else if (s.gameState === 'paused') {
          resumeGame()
        }
        return
      }

      if (s.gameState !== 'playing') return

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        s.keys.left = true
        s.player.facing = -1
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        s.keys.right = true
        s.player.facing = 1
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault()
        if (s.player.jumpsLeft > 0) {
          s.player.vy = s.player.jumpForce
          s.player.jumpsLeft -= 1
          s.player.grounded = false
          playSfx('jump')

          // Spawn jump dust particles
          for (let i = 0; i < 6; i++) {
            s.particles.push({
              x: s.player.x + s.player.w / 2,
              y: s.player.y + s.player.h,
              vx: (Math.random() - 0.5) * 4,
              vy: Math.random() * -2,
              color: 'rgba(168, 85, 247, 0.8)',
              radius: 2 + Math.random() * 2,
              alpha: 1,
              decay: 0.05,
            })
          }
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') s.keys.left = false
      if (e.code === 'ArrowRight' || e.code === 'KeyD') s.keys.right = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [pauseGame, resumeGame, playSfx])

  // Canvas Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const render = () => {
      const s = stateRef.current
      const width = canvas.width
      const height = canvas.height

      // UPDATE LOGIC (only when playing)
      if (s.gameState === 'playing') {
        const p = s.player

        // Horizontal movement
        if (s.keys.left) {
          p.vx = -p.speed
          p.runFrame += 0.2
        } else if (s.keys.right) {
          p.vx = p.speed
          p.runFrame += 0.2
        } else {
          p.vx *= 0.75
        }

        // Apply gravity
        p.vy += 0.45
        if (p.vy > 12) p.vy = 12

        p.x += p.vx
        p.y += p.vy

        // Invulnerability cooldown
        if (p.invulnerableTimer > 0) {
          p.invulnerableTimer--
        }

        // Move moving platforms
        s.platforms.forEach((plat) => {
          if (plat.type === 'moving' && plat.vx && plat.minX !== undefined && plat.maxX !== undefined) {
            plat.x += plat.vx
            if (plat.x < plat.minX || plat.x > plat.maxX) {
              plat.vx = -plat.vx
            }
          }
        })

        // Platform collisions
        p.grounded = false
        s.platforms.forEach((plat) => {
          if (
            p.x + p.w > plat.x &&
            p.x < plat.x + plat.w &&
            p.y + p.h >= plat.y &&
            p.y + p.h <= plat.y + 14 &&
            p.vy >= 0
          ) {
            p.y = plat.y - p.h
            p.grounded = true
            p.jumpsLeft = 2

            if (plat.type === 'bounce') {
              p.vy = -14 // High bounce!
              p.jumpsLeft = 1
              playSfx('jump')
              for (let i = 0; i < 8; i++) {
                s.particles.push({
                  x: p.x + p.w / 2,
                  y: plat.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: -Math.random() * 4,
                  color: '#38bdf8',
                  radius: 3,
                  alpha: 1,
                  decay: 0.04,
                })
              }
            } else {
              p.vy = 0
            }
          }
        })

        // Move drones
        s.drones.forEach((d) => {
          d.x += d.vx
          if (d.x < d.minX || d.x > d.maxX) {
            d.vx = -d.vx
          }

          // Player vs Drone collision
          if (
            p.invulnerableTimer === 0 &&
            p.x + p.w > d.x &&
            p.x < d.x + d.w &&
            p.y + p.h > d.y &&
            p.y < d.y + d.h
          ) {
            // Jump on top of drone destroys it!
            if (p.vy > 0 && p.y + p.h < d.y + 12) {
              p.vy = -8
              d.x = -9999 // Remove drone
              s.score += 150
              setScore(s.score)
              playSfx('coin')
              for (let i = 0; i < 12; i++) {
                s.particles.push({
                  x: d.x + d.w / 2,
                  y: d.y + d.h / 2,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  color: '#f43f5e',
                  radius: 3,
                  alpha: 1,
                  decay: 0.04,
                })
              }
            } else {
              // Player takes damage
              s.lives--
              setLives(s.lives)
              p.invulnerableTimer = 60
              p.vy = -5
              p.vx = -p.facing * 4
              playSfx('hit')
              if (s.lives <= 0) {
                s.gameState = 'gameover'
                setGameState('gameover')
                playSfx('over')
                if (s.score > s.highScore) {
                  setHighScore(s.score)
                  localStorage.setItem(HIGH_SCORE_KEY, String(s.score))
                }
              }
            }
          }
        })

        // Spikes collision
        s.spikes.forEach((spk) => {
          if (
            p.invulnerableTimer === 0 &&
            p.x + p.w > spk.x + 4 &&
            p.x < spk.x + spk.w - 4 &&
            p.y + p.h > spk.y + 4 &&
            p.y < spk.y + spk.h
          ) {
            s.lives--
            setLives(s.lives)
            p.invulnerableTimer = 60
            p.vy = -7
            p.vx = -p.facing * 4
            playSfx('hit')
            if (s.lives <= 0) {
              s.gameState = 'gameover'
              setGameState('gameover')
              playSfx('over')
              if (s.score > s.highScore) {
                setHighScore(s.score)
                localStorage.setItem(HIGH_SCORE_KEY, String(s.score))
              }
            }
          }
        })

        // Stars collection
        s.stars.forEach((star) => {
          if (!star.collected) {
            star.osc += 0.05
            const starY = star.y + Math.sin(star.osc) * 4
            if (
              p.x + p.w > star.x - 12 &&
              p.x < star.x + 12 &&
              p.y + p.h > starY - 12 &&
              p.y < starY + 12
            ) {
              star.collected = true
              s.score += 50
              setScore(s.score)
              playSfx('coin')

              for (let i = 0; i < 8; i++) {
                s.particles.push({
                  x: star.x,
                  y: starY,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  color: '#fbbf24',
                  radius: 2.5,
                  alpha: 1,
                  decay: 0.05,
                })
              }
            }
          }
        })

        // Fall into pit (loss of life)
        if (p.y > 450) {
          s.lives--
          setLives(s.lives)
          playSfx('hit')
          if (s.lives <= 0) {
            s.gameState = 'gameover'
            setGameState('gameover')
            playSfx('over')
            if (s.score > s.highScore) {
              setHighScore(s.score)
              localStorage.setItem(HIGH_SCORE_KEY, String(s.score))
            }
          } else {
            // Respawn on closest platform behind camera
            p.x = Math.max(80, s.cameraX + 60)
            p.y = 150
            p.vx = 0
            p.vy = 0
            p.invulnerableTimer = 60
          }
        }

        // Camera smoothly follows player
        const targetCamX = p.x - width * 0.35
        s.cameraX += (targetCamX - s.cameraX) * 0.1
        if (s.cameraX < 0) s.cameraX = 0

        // Distance score
        const distScore = Math.floor(p.x / 20)
        if (distScore > s.score) {
          s.score = distScore
          setScore(s.score)
        }
      }

      // DRAWING
      ctx.clearRect(0, 0, width, height)

      // Background Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height)
      skyGrad.addColorStop(0, '#090817')
      skyGrad.addColorStop(0.6, '#171233')
      skyGrad.addColorStop(1, '#05030a')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, width, height)

      // Parallax Stars & Distant Cityscape
      ctx.save()
      ctx.translate(-s.cameraX * 0.15, 0)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      for (let i = 0; i < 40; i++) {
        const starX = (i * 140) % 2000
        const starY = (i * 37) % 220
        ctx.fillRect(starX, starY, 1.5, 1.5)
      }
      ctx.restore()

      // Main Camera Offset
      ctx.save()
      ctx.translate(-s.cameraX, 0)

      // Draw Platforms
      s.platforms.forEach((plat) => {
        if (plat.type === 'bounce') {
          ctx.fillStyle = '#0284c7'
          ctx.beginPath()
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 6)
          ctx.fill()
          // Top glow
          ctx.fillStyle = '#38bdf8'
          ctx.fillRect(plat.x + 4, plat.y, plat.w - 8, 3)
        } else if (plat.type === 'moving') {
          ctx.fillStyle = '#7c3aed'
          ctx.beginPath()
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 6)
          ctx.fill()
          ctx.fillStyle = '#c084fc'
          ctx.fillRect(plat.x + 4, plat.y, plat.w - 8, 3)
        } else {
          ctx.fillStyle = '#1e1b4b'
          ctx.beginPath()
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 6)
          ctx.fill()
          ctx.strokeStyle = '#4338ca'
          ctx.lineWidth = 1.5
          ctx.stroke()
          ctx.fillStyle = '#6366f1'
          ctx.fillRect(plat.x + 4, plat.y, plat.w - 8, 2.5)
        }
      })

      // Draw Spikes
      s.spikes.forEach((spk) => {
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.moveTo(spk.x, spk.y + spk.h)
        ctx.lineTo(spk.x + spk.w / 2, spk.y)
        ctx.lineTo(spk.x + spk.w, spk.y + spk.h)
        ctx.closePath()
        ctx.fill()
      })

      // Draw Drones
      s.drones.forEach((d) => {
        ctx.fillStyle = '#e11d48'
        ctx.beginPath()
        ctx.roundRect(d.x, d.y, d.w, d.h, 4)
        ctx.fill()
        // Drone glowing eye
        ctx.fillStyle = '#fecdd3'
        ctx.beginPath()
        ctx.arc(d.x + d.w / 2, d.y + d.h / 2, 4, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw Stars (Energy crystals)
      s.stars.forEach((star) => {
        if (!star.collected) {
          const sy = star.y + Math.sin(star.osc) * 4
          ctx.save()
          ctx.translate(star.x, sy)
          ctx.rotate(star.osc * 0.8)
          ctx.fillStyle = '#fbbf24'
          ctx.shadowColor = '#f59e0b'
          ctx.shadowBlur = 8
          ctx.fillRect(-6, -6, 12, 12)
          ctx.restore()
        }
      })

      // Draw Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i]
        pt.x += pt.vx
        pt.y += pt.vy
        pt.alpha -= pt.decay
        if (pt.alpha <= 0) {
          s.particles.splice(i, 1)
        } else {
          ctx.save()
          ctx.globalAlpha = pt.alpha
          ctx.fillStyle = pt.color
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      // Draw Player Character (Futuristic Cyber Runner)
      const p = s.player
      const isBlinking = p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 4) % 2 === 0

      if (!isBlinking) {
        ctx.save()
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2)
        ctx.scale(p.facing, 1)

        // Body suit
        ctx.fillStyle = '#8b5cf6'
        ctx.beginPath()
        ctx.roundRect(-p.w / 2, -p.h / 2 + 8, p.w, p.h - 8, 4)
        ctx.fill()

        // Helmet / Visor
        ctx.fillStyle = '#1e1b4b'
        ctx.beginPath()
        ctx.arc(0, -p.h / 2 + 6, 8, 0, Math.PI * 2)
        ctx.fill()

        // Glowing Cyan Visor
        ctx.fillStyle = '#06b6d4'
        ctx.shadowColor = '#22d3ee'
        ctx.shadowBlur = 6
        ctx.fillRect(1, -p.h / 2 + 3, 7, 4)

        // Running leg animation
        if (!p.grounded) {
          // Jumping pose
          ctx.fillStyle = '#6d28d9'
          ctx.fillRect(-6, p.h / 2 - 6, 4, 6)
          ctx.fillRect(2, p.h / 2 - 10, 4, 8)
        } else {
          const legOffset = Math.sin(p.runFrame) * 4
          ctx.fillStyle = '#6d28d9'
          ctx.fillRect(-6, p.h / 2 - 8 + legOffset, 4, 8)
          ctx.fillRect(2, p.h / 2 - 8 - legOffset, 4, 8)
        }

        ctx.restore()
      }

      ctx.restore() // Restore camera

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [playSfx])

  return (
    <div className="flex flex-col h-full bg-black select-none relative overflow-hidden font-sans">
      {/* Top HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent">
        {/* Lives & Score */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                size={18}
                className={i < lives ? 'text-rose-500 fill-rose-500' : 'text-neutral-600'}
              />
            ))}
          </div>

          <div className="text-white font-mono text-sm font-semibold tracking-wider">
            SCORE: <span className="text-amber-400">{score}</span>
          </div>
        </div>

        {/* High Score & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-neutral-300 font-mono">
            <Trophy size={14} className="text-amber-400" />
            <span>BEST: {Math.max(score, highScore)}</span>
          </div>

          <button
            onClick={() => setSoundMuted((m) => !m)}
            className="p-1 rounded-md hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title={soundMuted ? 'Unmute' : 'Mute'}
          >
            {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={720}
        height={400}
        className="w-full h-full object-contain bg-neutral-950"
      />

      {/* Start Screen Overlay */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 animate-bounce">
            <Play size={28} className="text-white ml-1" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
            NOVA ODYSSEY
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mb-6">
            Run, jump, and collect energy crystals across the cyber-platforms of the Nova orbital station.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 max-w-xs text-xs text-neutral-300 space-y-1 mb-6 text-left">
            <div><span className="text-amber-400 font-semibold">A / D or Arrow Keys</span>: Move left/right</div>
            <div><span className="text-amber-400 font-semibold">Space / W / Up</span>: Jump (Double-jump supported!)</div>
            <div><span className="text-amber-400 font-semibold">P / Escape</span>: Pause game</div>
          </div>

          <button
            onClick={startGame}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition active:scale-95"
          >
            Launch Mission
          </button>
        </div>
      )}

      {/* Pause Menu Overlay */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">MISSION PAUSED</h2>
          <p className="text-xs text-neutral-400 mb-6">Press Escape or P to resume</p>

          <div className="flex gap-3">
            <button
              onClick={resumeGame}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition"
            >
              Resume
            </button>
            <button
              onClick={restartGame}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition"
            >
              Restart
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="text-rose-500 font-extrabold text-3xl tracking-wider mb-2">
            MISSION TERMINATED
          </div>
          <div className="text-neutral-400 text-xs mb-4">You ran out of shield energy</div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-64 space-y-2 mb-6">
            <div className="flex justify-between text-xs text-neutral-300">
              <span>Final Score:</span>
              <span className="font-bold text-amber-400 font-mono text-sm">{score}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-300">
              <span>High Score:</span>
              <span className="font-bold text-white font-mono text-sm">{Math.max(score, highScore)}</span>
            </div>
          </div>

          <button
            onClick={restartGame}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs shadow-lg transition active:scale-95"
          >
            <RotateCcw size={15} /> Play Again
          </button>
        </div>
      )}
    </div>
  )
}

export const GamesApp: React.FC<AppInstanceProps> = () => {
  return <NovaOdysseyGame />
}
