import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Gamepad2, Sparkles, Box, Trophy, Play, Layers } from 'lucide-react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { soundService } from '@/core/audio/soundService'

// Import all game components for embedded playing option
import { MarbleRunner3D } from './MarbleRunner3D'
import { SpaceTunnel3D } from './SpaceTunnel3D'
import { VoxelIsland3D } from './VoxelIsland3D'
import { GamesApp as NovaOdysseyGame } from './NovaOdysseyGame'
import { SnakeGame } from './SnakeGame'
import { TetrisGame } from './TetrisGame'
import { MinesweeperGame } from './MinesweeperGame'
import { Game2048 } from './Game2048'
import { BreakoutGame } from './BreakoutGame'
import { SudokuGame } from './SudokuGame'
import { FlappyGame } from './FlappyGame'
import { TicTacToeGame } from './TicTacToeGame'
import { SpaceShooterGame } from './SpaceShooterGame'
import { MemoryMatchGame } from './MemoryMatchGame'

interface GameDef {
  id: string
  title: string
  category: '3D Next-Gen' | 'Retro Arcade' | 'Logic & Puzzles'
  description: string
  tags: string[]
  badge?: string
  component: React.FC<AppInstanceProps>
}

const ALL_GAMES: GameDef[] = [
  {
    id: 'game_marble3d',
    title: 'Marble Runner 3D',
    category: '3D Next-Gen',
    description: 'Gyroscope tilted 3D maze with real-time sphere physics and gem collection.',
    tags: ['Three.js', '3D Physics', 'WebGL'],
    badge: '3D WEBGL',
    component: MarbleRunner3D
  },
  {
    id: 'game_space3d',
    title: 'Space Tunnel 3D',
    category: '3D Next-Gen',
    description: 'High-speed cyberpunk warp tunnel dodging rotating neon laser barriers.',
    tags: ['Three.js', 'Action', 'Hyperspeed'],
    badge: '3D WEBGL',
    component: SpaceTunnel3D
  },
  {
    id: 'game_voxel3d',
    title: 'Voxel Island 3D',
    category: '3D Next-Gen',
    description: 'Procedural floating voxel island builder with mining, block placement, and day/night cycle.',
    tags: ['Three.js', 'Voxel', 'Sandbox'],
    badge: '3D WEBGL',
    component: VoxelIsland3D
  },
  {
    id: 'games',
    title: 'Nova Odyssey',
    category: 'Retro Arcade',
    description: '60 FPS 2D Cyber Arcade Platformer with double jumping, enemies, and coins.',
    tags: ['Platformer', 'Arcade', 'Canvas'],
    badge: 'CLASSIC',
    component: NovaOdysseyGame
  },
  {
    id: 'game_spaceshooter',
    title: 'Cosmic Invaders',
    category: 'Retro Arcade',
    description: 'Vertical arcade space shooter with laser waves and particle explosions.',
    tags: ['Arcade', 'Shooter', 'Action'],
    component: SpaceShooterGame
  },
  {
    id: 'game_breakout',
    title: 'Breakout Arkanoid',
    category: 'Retro Arcade',
    description: 'Classic brick breaker with paddle bounce angles and multi-tier brick rows.',
    tags: ['Arcade', 'Paddle', 'Physics'],
    component: BreakoutGame
  },
  {
    id: 'game_flappy',
    title: 'Flappy Nova',
    category: 'Retro Arcade',
    description: 'One-click jumping arcade game dodging pipe obstacles.',
    tags: ['Arcade', 'One-Button'],
    component: FlappyGame
  },
  {
    id: 'game_tetris',
    title: 'Tetris Classic',
    category: 'Logic & Puzzles',
    description: 'Official tetromino block puzzle with SRS rotations, hard drops, and line clears.',
    tags: ['Puzzle', 'Retro', 'SRS'],
    component: TetrisGame
  },
  {
    id: 'game_2048',
    title: '2048 Puzzle',
    category: 'Logic & Puzzles',
    description: 'Smooth sliding numerical tile merge puzzle reaching the legendary 2048 tile.',
    tags: ['Puzzle', 'Strategy'],
    component: Game2048
  },
  {
    id: 'game_snake',
    title: 'Retro Snake',
    category: 'Logic & Puzzles',
    description: 'Classic retro grid snake with high score tracking and speed levels.',
    tags: ['Arcade', 'Retro'],
    component: SnakeGame
  },
  {
    id: 'game_minesweeper',
    title: 'Minesweeper',
    category: 'Logic & Puzzles',
    description: 'Classic mine clearance with Beginner and Intermediate grids and smiley face.',
    tags: ['Strategy', 'Logic'],
    component: MinesweeperGame
  },
  {
    id: 'game_sudoku',
    title: 'Sudoku Master',
    category: 'Logic & Puzzles',
    description: 'Interactive 9x9 Sudoku puzzle with subgrid validation and keypad.',
    tags: ['Logic', 'Math'],
    component: SudokuGame
  },
  {
    id: 'game_tictactoe',
    title: 'Tic Tac Toe AI',
    category: 'Logic & Puzzles',
    description: 'Unbeatable Minimax AI algorithm or two player local competitive mode.',
    tags: ['AI', 'Minimax'],
    component: TicTacToeGame
  },
  {
    id: 'game_memory',
    title: 'Memory Match',
    category: 'Logic & Puzzles',
    description: 'Card flip matching game with emojis and moves counter.',
    tags: ['Casual', 'Memory'],
    component: MemoryMatchGame
  }
]

export const GamesCenterApp: React.FC<AppInstanceProps> = (props) => {
  const { openApp } = useWindowManager()
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [playingGameId, setPlayingGameId] = useState<string | null>(null)

  const categories = ['All', '3D Next-Gen', 'Retro Arcade', 'Logic & Puzzles']

  const filteredGames = ALL_GAMES.filter(g =>
    activeCategory === 'All' ? true : g.category === activeCategory
  )

  const handleLaunchInWindow = (gameId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    soundService.playNotification()
    openApp(gameId as any)
  }

  const handlePlayEmbedded = (gameId: string) => {
    soundService.playClick()
    setPlayingGameId(gameId)
  }

  const activePlayingGame = ALL_GAMES.find(g => g.id === playingGameId)

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gamepad2 className="w-5 h-5 text-purple-400" />
          <div>
            <h1 className="text-sm font-bold text-white">NOVA Gaming Hub</h1>
            <span className="text-[10px] text-neutral-400">{ALL_GAMES.length} Interactive 2D & 3D Games</span>
          </div>
        </div>

        {playingGameId ? (
          <button
            onClick={() => setPlayingGameId(null)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium"
          >
            ← Back to Games Catalog
          </button>
        ) : (
          <div className="flex items-center space-x-1 bg-neutral-950 p-1 rounded-xl border border-white/10">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => {
                  soundService.playClick()
                  setActiveCategory(c)
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === c ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main View Area */}
      {playingGameId && activePlayingGame ? (
        <div className="flex-1 relative overflow-hidden bg-black">
          <activePlayingGame.component {...props} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {filteredGames.map(game => (
              <div
                key={game.id}
                onClick={() => handlePlayEmbedded(game.id)}
                className="bg-neutral-950/70 hover:bg-neutral-800/80 border border-white/10 hover:border-purple-500/50 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    {game.badge && (
                      <span className="text-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                        {game.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                    {game.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {game.tags.slice(0, 2).map((t, i) => (
                      <span key={i} className="text-[10px] bg-white/5 text-neutral-300 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleLaunchInWindow(game.id, e)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 font-medium text-[11px]"
                      title="Open in dedicated window"
                    >
                      New Window
                    </button>
                    <button
                      onClick={() => handlePlayEmbedded(game.id)}
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow-sm flex items-center space-x-1"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Play</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
