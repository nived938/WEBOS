import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import {
  Gamepad2,
  Sparkles,
  Box,
  Trophy,
  Play,
  Layers,
  Heart,
  Search,
  Maximize2,
  Clock,
  Download,
  Trash2,
  Sliders,
  Camera,
  Activity,
  Flame,
  Star,
  X,
  Volume2,
} from 'lucide-react'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import { soundService } from '@/core/audio/soundService'

// Existing Games
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

// 3D Voxel Sandbox Flagship
import { NovaBlockworldGame } from './NovaBlockworldGame'

// New 2D Games
import { ChessGame } from './2d/ChessGame'
import { CheckersGame } from './2d/CheckersGame'
import { SolitaireGame } from './2d/SolitaireGame'
import { MahjongGame } from './2d/MahjongGame'
import { PacMazeGame } from './2d/PacMazeGame'
import { TowerDefenseGame } from './2d/TowerDefenseGame'
import { PinballGame } from './2d/PinballGame'
import { PlatformAdventureGame } from './2d/PlatformAdventureGame'
import { RetroRacingGame } from './2d/RetroRacingGame'
import { ZombieSurvivalGame } from './2d/ZombieSurvivalGame'
import { WordPuzzleGame } from './2d/WordPuzzleGame'
import { ConnectFourGame } from './2d/ConnectFourGame'
import { DotsAndBoxesGame } from './2d/DotsAndBoxesGame'
import { ColorMatchGame } from './2d/ColorMatchGame'
import { TowerStackGame } from './2d/TowerStackGame'
import { BubbleShooterGame } from './2d/BubbleShooterGame'
import { BrickBreakerDeluxeGame } from './2d/BrickBreakerDeluxeGame'
import { MemoryChallengeGame } from './2d/MemoryChallengeGame'
import { SpaceDefenseGame } from './2d/SpaceDefenseGame'
import { MiniGolfGame } from './2d/MiniGolfGame'

// New 3D Games
import { Racing3DGame } from './3d/Racing3DGame'
import { FlightSim3DGame } from './3d/FlightSim3DGame'
import { Parkour3DGame } from './3d/Parkour3DGame'
import { DungeonExplorer3DGame } from './3d/DungeonExplorer3DGame'
import { SpaceAdventure3DGame } from './3d/SpaceAdventure3DGame'
import { BattleArena3DGame } from './3d/BattleArena3DGame'
import { CityBuilder3DGame } from './3d/CityBuilder3DGame'
import { FarmingSim3DGame } from './3d/FarmingSim3DGame'
import { ObstacleCourse3DGame } from './3d/ObstacleCourse3DGame'
import { PlanetExplorer3DGame } from './3d/PlanetExplorer3DGame'
import { KartRacing3DGame } from './3d/KartRacing3DGame'

export type GameCategory =
  | 'Featured Games'
  | 'Recently Played'
  | 'Installed Games'
  | 'All Games'
  | '2D Games'
  | '3D Games'
  | 'Multiplayer'
  | 'Sandbox'
  | 'Arcade'
  | 'Racing'
  | 'Strategy'
  | 'Puzzle'
  | 'Survival'
  | 'Simulation'
  | 'Favorites'

export interface GameEntry {
  id: string
  title: string
  category: '2D' | '3D'
  genre: 'Arcade' | 'Puzzle' | 'Strategy' | 'Racing' | 'Sandbox' | 'Survival' | 'Simulation' | 'Multiplayer'
  description: string
  version: string
  controls: string
  artworkGradient: string
  badge?: string
  isFeatured?: boolean
  component: React.FC<AppInstanceProps>
}

export const ALL_GAMING_CATALOG: GameEntry[] = [
  // Flagship Voxel Sandbox
  {
    id: 'game_blockworld',
    title: 'NOVA BLOCKWORLD',
    category: '3D',
    genre: 'Sandbox',
    description: 'Expansive 3D chunk-based procedural voxel sandbox. Biomes, caves, mining, crafting, survival, creative flying, and IndexedDB world saving.',
    version: '3.0',
    controls: 'WASD: Move • Space: Jump/Fly • E: Inventory • Left Click: Mine • Right Click: Place • Esc: Pause',
    artworkGradient: 'from-emerald-600 via-teal-700 to-cyan-900',
    badge: 'FLAGSHIP 3D',
    isFeatured: true,
    component: NovaBlockworldGame,
  },
  // Existing 3D Games
  {
    id: 'game_marble3d',
    title: 'Marble Runner 3D',
    category: '3D',
    genre: 'Arcade',
    description: 'Gyroscope tilted 3D maze with real-time sphere physics and gem collection.',
    version: '2.5',
    controls: 'WASD / Arrow Keys to tilt maze table',
    artworkGradient: 'from-blue-600 to-indigo-800',
    badge: 'THREE.JS',
    component: MarbleRunner3D,
  },
  {
    id: 'game_space3d',
    title: 'Space Tunnel 3D',
    category: '3D',
    genre: 'Arcade',
    description: 'High-speed cyberpunk warp tunnel dodging rotating neon laser barriers.',
    version: '2.5',
    controls: 'Mouse or Arrow keys to steer through tunnel rings',
    artworkGradient: 'from-purple-600 to-pink-800',
    badge: 'HYPERSPEED',
    component: SpaceTunnel3D,
  },
  {
    id: 'game_voxel3d',
    title: 'Voxel Island 3D',
    category: '3D',
    genre: 'Sandbox',
    description: 'Procedural floating voxel island builder with mining, block placement, and day/night cycle.',
    version: '2.5',
    controls: 'Left Click: Place • Right Click: Mine • Mouse: Orbit',
    artworkGradient: 'from-teal-600 to-emerald-800',
    component: VoxelIsland3D,
  },
  // New 3D Games
  {
    id: 'game_racing3d',
    title: 'Neon Velocity 3D',
    category: '3D',
    genre: 'Racing',
    description: 'Third-person high-speed cyber highway racing dodging neon traffic cars.',
    version: '2.5',
    controls: 'W/S: Accelerate/Brake • A/D: Steer',
    artworkGradient: 'from-cyan-600 to-blue-900',
    isFeatured: true,
    component: Racing3DGame,
  },
  {
    id: 'game_flight3d',
    title: 'AeroSim 3D',
    category: '3D',
    genre: 'Simulation',
    description: 'Flight simulator cockpit aerodynamic flight, roll/pitch/yaw, and ring checkpoints.',
    version: '2.5',
    controls: 'W/S: Pitch • A/D: Roll • Q/E: Throttle',
    artworkGradient: 'from-sky-500 to-indigo-800',
    component: FlightSim3DGame,
  },
  {
    id: 'game_parkour3d',
    title: 'Rooftop Runner 3D',
    category: '3D',
    genre: 'Arcade',
    description: 'Skyscraper parkour rooftop platform jumping and helipad vaults.',
    version: '2.5',
    controls: 'WASD: Move • Spacebar: Jump',
    artworkGradient: 'from-purple-600 to-slate-900',
    component: Parkour3DGame,
  },
  {
    id: 'game_dungeon3d',
    title: 'Crypt Crawler 3D',
    category: '3D',
    genre: 'Survival',
    description: 'First-person 3D labyrinth dungeon crawler with dynamic torch illumination and keys.',
    version: '2.5',
    controls: 'W/S: Walk • A/D / Arrows: Turn',
    artworkGradient: 'from-amber-700 to-neutral-900',
    component: DungeonExplorer3DGame,
  },
  {
    id: 'game_spaceadv3d',
    title: 'CosmoVoyager 3D',
    category: '3D',
    genre: 'Simulation',
    description: 'Free-flight starship space exploration with laser cannons blasting asteroids.',
    version: '2.5',
    controls: 'WASD: Pitch & Yaw • Spacebar: Fire Lasers',
    artworkGradient: 'from-indigo-600 to-cyan-900',
    component: SpaceAdventure3DGame,
  },
  {
    id: 'game_battle3d',
    title: 'Mech Gladiator 3D',
    category: '3D',
    genre: 'Survival',
    description: 'Combat battle arena fighting waves of enemy plasma drones in an armored mech.',
    version: '2.5',
    controls: 'WASD: Move • Arrows: Turn • Space: Fire Plasma',
    artworkGradient: 'from-violet-700 to-rose-900',
    component: BattleArena3DGame,
  },
  {
    id: 'game_citybuilder3d',
    title: 'MetroCraft 3D',
    category: '3D',
    genre: 'Simulation',
    description: '3D isometric city planning grid placing roads, residential towers, commercial zones, and parks.',
    version: '2.5',
    controls: 'Click on grid plane to construct zone structures',
    artworkGradient: 'from-emerald-700 to-slate-900',
    component: CityBuilder3DGame,
  },
  {
    id: 'game_farming3d',
    title: 'Harvest Valley 3D',
    category: '3D',
    genre: 'Simulation',
    description: '3D low-poly farm simulator tilling soil, planting seeds, watering, and harvesting crops.',
    version: '2.5',
    controls: 'Click soil plots to plant seeds, water, and harvest',
    artworkGradient: 'from-amber-600 to-green-900',
    component: FarmingSim3DGame,
  },
  {
    id: 'game_obstacle3d',
    title: 'Wipeout Arena 3D',
    category: '3D',
    genre: 'Arcade',
    description: '3D obstacle runner dodging spinning foam sweeper hazard bars on a narrow runway.',
    version: '2.5',
    controls: 'WASD / Arrows to navigate past sweepers',
    artworkGradient: 'from-rose-600 to-indigo-950',
    component: ObstacleCourse3DGame,
  },
  {
    id: 'game_planet3d',
    title: 'ExoSphere 3D',
    category: '3D',
    genre: 'Simulation',
    description: '3D spherical planet exploration with spherical gravity and alien artifact scanning.',
    version: '2.5',
    controls: 'WASD to drive rover across the 360° spherical planet',
    artworkGradient: 'from-cyan-700 to-slate-950',
    component: PlanetExplorer3DGame,
  },
  {
    id: 'game_kart3d',
    title: 'Nova Kart 3D',
    category: '3D',
    genre: 'Racing',
    description: 'High-speed 3D kart grand prix racer with rocket boost item boxes and lap records.',
    version: '2.5',
    controls: 'W/S: Accelerate/Brake • A/D: Steer • Space: Rocket Boost',
    artworkGradient: 'from-red-600 to-orange-800',
    isFeatured: true,
    component: KartRacing3DGame,
  },
  // Existing 2D Games
  {
    id: 'games',
    title: 'Nova Odyssey',
    category: '2D',
    genre: 'Arcade',
    description: '60 FPS 2D Cyber Arcade Platformer with double jumping, enemies, and coins.',
    version: '2.0',
    controls: 'Arrows / WASD: Run & Jump',
    artworkGradient: 'from-purple-600 to-blue-800',
    component: NovaOdysseyGame,
  },
  {
    id: 'game_spaceshooter',
    title: 'Cosmic Invaders',
    category: '2D',
    genre: 'Arcade',
    description: 'Vertical arcade space shooter with laser waves and particle explosions.',
    version: '2.0',
    controls: 'Arrow Keys to move • Spacebar to fire',
    artworkGradient: 'from-red-600 to-pink-800',
    component: SpaceShooterGame,
  },
  {
    id: 'game_breakout',
    title: 'Breakout Arkanoid',
    category: '2D',
    genre: 'Arcade',
    description: 'Classic brick breaker with paddle bounce angles and multi-tier brick rows.',
    version: '2.0',
    controls: 'Mouse or Left/Right arrows to steer paddle',
    artworkGradient: 'from-amber-600 to-rose-700',
    component: BreakoutGame,
  },
  {
    id: 'game_flappy',
    title: 'Flappy Nova',
    category: '2D',
    genre: 'Arcade',
    description: 'One-click jumping arcade game dodging pipe obstacles.',
    version: '2.0',
    controls: 'Spacebar or Click to flap wings',
    artworkGradient: 'from-yellow-500 to-emerald-600',
    component: FlappyGame,
  },
  {
    id: 'game_tetris',
    title: 'Tetris Classic',
    category: '2D',
    genre: 'Puzzle',
    description: 'Official tetromino block puzzle with SRS rotations, hard drops, and line clears.',
    version: '2.0',
    controls: 'Arrows to move & rotate • Space: Hard Drop',
    artworkGradient: 'from-cyan-600 to-blue-700',
    component: TetrisGame,
  },
  {
    id: 'game_2048',
    title: '2048 Puzzle',
    category: '2D',
    genre: 'Puzzle',
    description: 'Smooth sliding numerical tile merge puzzle reaching the legendary 2048 tile.',
    version: '2.0',
    controls: 'Arrow Keys or WASD to slide tiles',
    artworkGradient: 'from-amber-500 to-orange-700',
    component: Game2048,
  },
  {
    id: 'game_snake',
    title: 'Retro Snake',
    category: '2D',
    genre: 'Arcade',
    description: 'Classic retro grid snake with high score tracking and speed levels.',
    version: '2.0',
    controls: 'Arrow Keys or WASD to change snake heading',
    artworkGradient: 'from-emerald-600 to-green-800',
    component: SnakeGame,
  },
  {
    id: 'game_minesweeper',
    title: 'Minesweeper',
    category: '2D',
    genre: 'Strategy',
    description: 'Classic mine clearance with Beginner and Intermediate grids and smiley face.',
    version: '2.0',
    controls: 'Left Click: Reveal • Right Click: Flag',
    artworkGradient: 'from-slate-600 to-neutral-800',
    component: MinesweeperGame,
  },
  {
    id: 'game_sudoku',
    title: 'Sudoku Master',
    category: '2D',
    genre: 'Puzzle',
    description: 'Interactive 9x9 Sudoku puzzle with subgrid validation and keypad.',
    version: '2.0',
    controls: 'Click cell and select number 1-9',
    artworkGradient: 'from-blue-600 to-teal-700',
    component: SudokuGame,
  },
  {
    id: 'game_tictactoe',
    title: 'Tic Tac Toe AI',
    category: '2D',
    genre: 'Strategy',
    description: 'Unbeatable Minimax AI algorithm or two player local competitive mode.',
    version: '2.0',
    controls: 'Click grid cell to place marker',
    artworkGradient: 'from-indigo-600 to-purple-800',
    component: TicTacToeGame,
  },
  {
    id: 'game_memory',
    title: 'Memory Match',
    category: '2D',
    genre: 'Puzzle',
    description: 'Card flip matching game with emojis and moves counter.',
    version: '2.0',
    controls: 'Click card to flip and match pairs',
    artworkGradient: 'from-pink-600 to-rose-700',
    component: MemoryMatchGame,
  },
  // New 20 2D Games
  {
    id: 'game_chess',
    title: 'Chess with AI',
    category: '2D',
    genre: 'Strategy',
    description: 'Full 8x8 classical chess with piece movements, checkmate evaluation, and minimax AI opponent.',
    version: '2.5',
    controls: 'Click pieces to view valid moves and click target square',
    artworkGradient: 'from-amber-800 to-stone-900',
    isFeatured: true,
    component: ChessGame,
  },
  {
    id: 'game_checkers',
    title: 'Checkers Deluxe',
    category: '2D',
    genre: 'Strategy',
    description: '8x8 Checkers board with diagonal moves, jumping captures, king promotion, and AI engine.',
    version: '2.5',
    controls: 'Click checker piece and click valid destination square',
    artworkGradient: 'from-red-800 to-neutral-900',
    component: CheckersGame,
  },
  {
    id: 'game_solitaire',
    title: 'Klondike Solitaire',
    category: '2D',
    genre: 'Puzzle',
    description: 'Classic Klondike Solitaire with draw pile, foundation piles, alternating colors, and king moves.',
    version: '2.5',
    controls: 'Click cards to move between tableau and foundations',
    artworkGradient: 'from-emerald-800 to-teal-950',
    component: SolitaireGame,
  },
  {
    id: 'game_mahjong',
    title: 'Mahjong Solitaire',
    category: '2D',
    genre: 'Puzzle',
    description: 'Traditional multi-layered tile-matching puzzle with Chinese symbols, hints, and shuffle.',
    version: '2.5',
    controls: 'Click identical free matching tiles to clear them',
    artworkGradient: 'from-amber-700 to-yellow-950',
    component: MahjongGame,
  },
  {
    id: 'game_pacmaze',
    title: 'Neon Maze Runner',
    category: '2D',
    genre: 'Arcade',
    description: 'Retro arcade maze runner collecting dots and power pellets while evading 4 patrolling ghost drones.',
    version: '2.5',
    controls: 'WASD / Arrow Keys to steer through maze corridors',
    artworkGradient: 'from-blue-700 to-yellow-900',
    isFeatured: true,
    component: PacMazeGame,
  },
  {
    id: 'game_towerdefense',
    title: 'Cyber Tower Defense',
    category: '2D',
    genre: 'Strategy',
    description: 'Defend cyber pathways by building pulse lasers, heavy plasma cannons, and cryogenic freeze turrets.',
    version: '2.5',
    controls: 'Click turret type and place on canvas to target creeps',
    artworkGradient: 'from-cyan-700 to-blue-950',
    component: TowerDefenseGame,
  },
  {
    id: 'game_pinball',
    title: 'Neon Pinball',
    category: '2D',
    genre: 'Arcade',
    description: '2D canvas physics pinball table with spring plunger, bumpers, spinners, and responsive flippers.',
    version: '2.5',
    controls: 'Left Arrow / A: Left Flipper • Right Arrow / D: Right Flipper',
    artworkGradient: 'from-fuchsia-700 to-cyan-950',
    component: PinballGame,
  },
  {
    id: 'game_platformer',
    title: 'Pixel Quest Adventure',
    category: '2D',
    genre: 'Arcade',
    description: 'Side-scrolling retro platform adventure collecting gold coins across jumping gaps to reach the finish flag.',
    version: '2.5',
    controls: 'A/D: Run • W / Space: Jump',
    artworkGradient: 'from-emerald-600 to-blue-900',
    component: PlatformAdventureGame,
  },
  {
    id: 'game_retroracing',
    title: 'Turbo Track 2D',
    category: '2D',
    genre: 'Racing',
    description: 'Top-down arcade speed racer dodging highway traffic at blistering speeds.',
    version: '2.5',
    controls: 'W/S: Accelerate/Brake • A/D: Steer',
    artworkGradient: 'from-sky-600 to-red-900',
    component: RetroRacingGame,
  },
  {
    id: 'game_zombiesurvival',
    title: 'Outbreak 2D',
    category: '2D',
    genre: 'Survival',
    description: 'Top-down zombie outbreak survival shooter with 360° mouse aiming, ammo management, and waves.',
    version: '2.5',
    controls: 'WASD: Move • Mouse: Aim & Shoot • R: Reload',
    artworkGradient: 'from-red-700 to-emerald-950',
    isFeatured: true,
    component: ZombieSurvivalGame,
  },
  {
    id: 'game_wordpuzzle',
    title: 'Lexicon Word Master',
    category: '2D',
    genre: 'Puzzle',
    description: 'Wordle-inspired 5-letter deductive vocabulary challenge with 6 attempts and color clues.',
    version: '2.5',
    controls: 'Type on-screen letters or physical keyboard to guess 5-letter words',
    artworkGradient: 'from-emerald-700 to-slate-900',
    component: WordPuzzleGame,
  },
  {
    id: 'game_connectfour',
    title: 'Four in a Row',
    category: '2D',
    genre: 'Strategy',
    description: '7x6 vertical drop grid connecting four colored checkers horizontally, vertically, or diagonally.',
    version: '2.5',
    controls: 'Click any column to drop a checker piece',
    artworkGradient: 'from-blue-700 to-yellow-800',
    component: ConnectFourGame,
  },
  {
    id: 'game_dotsboxes',
    title: 'Dots and Boxes',
    category: '2D',
    genre: 'Strategy',
    description: 'Classic pencil & paper game claiming territory boxes by connecting grid dots against smart AI.',
    version: '2.5',
    controls: 'Click gray line segment to draw boundary',
    artworkGradient: 'from-cyan-800 to-blue-950',
    component: DotsAndBoxesGame,
  },
  {
    id: 'game_colormatch',
    title: 'Chroma Rush',
    category: '2D',
    genre: 'Arcade',
    description: 'High-speed color reflex reaction game rotating central color wheel to match incoming laser orbs.',
    version: '2.5',
    controls: 'Click or Spacebar to rotate the 4-color wheel',
    artworkGradient: 'from-pink-600 to-yellow-700',
    component: ColorMatchGame,
  },
  {
    id: 'game_towerstack',
    title: 'Sky Stack',
    category: '2D',
    genre: 'Arcade',
    description: 'Precision timing block stacker slicing overhangs as tower ascends towards outer space.',
    version: '2.5',
    controls: 'Click or Spacebar to drop oscillating block onto stack',
    artworkGradient: 'from-fuchsia-600 to-indigo-900',
    component: TowerStackGame,
  },
  {
    id: 'game_bubbleshooter',
    title: 'Orb Pop Bubble Shooter',
    category: '2D',
    genre: 'Puzzle',
    description: 'Angled cannon shooting colored bubbles to match clusters of 3 or more before ceiling descends.',
    version: '2.5',
    controls: 'Mouse aim • Click to launch colored bubble',
    artworkGradient: 'from-rose-600 to-sky-800',
    component: BubbleShooterGame,
  },
  {
    id: 'game_brickbreaker',
    title: 'Brick Breaker Deluxe',
    category: '2D',
    genre: 'Arcade',
    description: 'Enhanced brick breaker featuring wide laser paddles, multiballs, and armored block layouts.',
    version: '2.5',
    controls: 'Mouse to move paddle across bottom border',
    artworkGradient: 'from-orange-600 to-blue-900',
    component: BrickBreakerDeluxeGame,
  },
  {
    id: 'game_memorychallenge',
    title: 'Simon Memory Echo',
    category: '2D',
    genre: 'Puzzle',
    description: 'Audio-visual pattern memory sequence test challenging players to repeat increasingly long light series.',
    version: '2.5',
    controls: 'Click pads in exact audio-visual sequence demonstrated',
    artworkGradient: 'from-violet-600 to-purple-900',
    component: MemoryChallengeGame,
  },
  {
    id: 'game_spacedefense',
    title: 'Orbital Shield',
    category: '2D',
    genre: 'Arcade',
    description: '360-degree rotating orbital energy shield deflecting incoming meteors and protecting planet Earth.',
    version: '2.5',
    controls: 'Move mouse around Earth to rotate shield arc',
    artworkGradient: 'from-blue-600 to-cyan-950',
    component: SpaceDefenseGame,
  },
  {
    id: 'game_minigolf',
    title: 'Cyber Golf 2D',
    category: '2D',
    genre: 'Simulation',
    description: '5-hole cyber golf course featuring slingshot power aiming, sand bunkers, and slope physics.',
    version: '2.5',
    controls: 'Click and drag away from golf ball to set slingshot power',
    artworkGradient: 'from-emerald-700 to-teal-950',
    component: MiniGolfGame,
  },
]

export const GamesCenterApp: React.FC<AppInstanceProps> = (props) => {
  const { openApp } = useWindowManager()
  const [activeCategory, setActiveCategory] = useState<GameCategory>('Featured Games')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingGameId, setPlayingGameId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nova_game_favorites')
      return saved ? JSON.parse(saved) : ['game_blockworld', 'game_racing3d', 'game_chess']
    } catch {
      return ['game_blockworld', 'game_racing3d']
    }
  })
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nova_game_recent')
      return saved ? JSON.parse(saved) : ['game_blockworld']
    } catch {
      return ['game_blockworld']
    }
  })
  const [gamingMode, setGamingMode] = useState(false)
  const [selectedGameDetail, setSelectedGameDetail] = useState<GameEntry | null>(null)

  // Toggle favorite
  const toggleFavorite = (gameId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    soundService.playClick()
    setFavorites((prev) => {
      const next = prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
      localStorage.setItem('nova_game_favorites', JSON.stringify(next))
      return next
    })
  }

  // Handle Play Embedded
  const handlePlayEmbedded = (gameId: string) => {
    soundService.playClick()
    setPlayingGameId(gameId)
    // Add to recent
    setRecentlyPlayed((prev) => {
      const next = [gameId, ...prev.filter((id) => id !== gameId)].slice(0, 10)
      localStorage.setItem('nova_game_recent', JSON.stringify(next))
      return next
    })
  }

  // Handle Launch In Window
  const handleLaunchInWindow = (gameId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    soundService.playNotification()
    openApp(gameId as any)
    setRecentlyPlayed((prev) => {
      const next = [gameId, ...prev.filter((id) => id !== gameId)].slice(0, 10)
      localStorage.setItem('nova_game_recent', JSON.stringify(next))
      return next
    })
  }

  // Filter Catalog
  const categoriesList: GameCategory[] = [
    'Featured Games',
    'Recently Played',
    'Installed Games',
    'All Games',
    '2D Games',
    '3D Games',
    'Multiplayer',
    'Sandbox',
    'Arcade',
    'Racing',
    'Strategy',
    'Puzzle',
    'Survival',
    'Simulation',
    'Favorites',
  ]

  const filteredGames = ALL_GAMING_CATALOG.filter((g) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match = g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
      if (!match) return false
    }

    if (activeCategory === 'All Games') return true
    if (activeCategory === 'Featured Games') return g.isFeatured || g.id === 'game_blockworld'
    if (activeCategory === 'Recently Played') return recentlyPlayed.includes(g.id)
    if (activeCategory === 'Installed Games') return true // Bundled games are pre-installed
    if (activeCategory === '2D Games') return g.category === '2D'
    if (activeCategory === '3D Games') return g.category === '3D'
    if (activeCategory === 'Favorites') return favorites.includes(g.id)
    return g.genre === activeCategory
  })

  const activePlayingGame = ALL_GAMING_CATALOG.find((g) => g.id === playingGameId)

  return (
    <div
      className={`flex flex-col h-full bg-neutral-950 text-neutral-100 select-none overflow-hidden text-xs ${
        gamingMode ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Top Header */}
      <div className="p-3 bg-neutral-900/90 border-b border-white/10 flex items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              NOVA Gaming Hub <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.2 rounded-full border border-purple-500/30">46 Games</span>
            </h1>
            <span className="text-[10px] text-neutral-400">Full Three.js WebGL & 2D Arcade Engine</span>
          </div>
        </div>

        {/* Search */}
        {!playingGameId && (
          <div className="flex-1 max-w-xs relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 46 games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-neutral-950/80 border border-white/10 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {playingGameId ? (
            <button
              onClick={() => setPlayingGameId(null)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium flex items-center gap-1.5"
            >
              ← Back to Catalog
            </button>
          ) : (
            <button
              onClick={() => {
                soundService.playClick()
                setGamingMode((prev) => !prev)
              }}
              className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                gamingMode
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{gamingMode ? 'Exit Gaming Mode' : 'NOVA Gaming Mode'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {playingGameId && activePlayingGame ? (
        <div className="flex-1 relative overflow-hidden bg-black flex flex-col">
          <div className="flex-1 relative">
            <activePlayingGame.component {...props} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-44 bg-neutral-900/60 border-r border-white/10 p-2 overflow-y-auto space-y-0.5">
            <span className="text-[10px] font-bold text-neutral-500 uppercase px-2 mb-1 block">Library</span>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundService.playClick()
                  setActiveCategory(cat)
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{cat}</span>
                {cat === 'Favorites' && <Heart className="w-3 h-3 text-red-400 fill-red-400" />}
              </button>
            ))}
          </div>

          {/* Games Grid Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Featured Hero Banner (Shown when in Featured Games) */}
            {activeCategory === 'Featured Games' && !searchQuery && (
              <div
                onClick={() => handlePlayEmbedded('game_blockworld')}
                className="relative h-44 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-900 p-6 flex flex-col justify-between shadow-2xl overflow-hidden cursor-pointer group border border-emerald-400/40 hover:scale-[1.01] transition-transform"
              >
                <div className="relative z-10 max-w-lg">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    Featured Voxel Sandbox
                  </span>
                  <h2 className="text-xl font-black text-white mt-2 group-hover:text-emerald-200 transition-colors">
                    NOVA BLOCKWORLD
                  </h2>
                  <p className="text-xs text-emerald-100/80 mt-1 line-clamp-2">
                    Infinite 3D procedural voxel engine. Explore mountains, forests, and caves. Mine rare diamonds, build structures, and craft recipes with persistent IndexedDB saves.
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                  <button className="px-4 py-1.5 bg-white text-neutral-900 font-bold rounded-xl shadow-lg flex items-center gap-1.5 group-hover:bg-emerald-300">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Sandbox</span>
                  </button>
                  <button
                    onClick={(e) => handleLaunchInWindow('game_blockworld', e)}
                    className="px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-xl font-medium border border-white/20"
                  >
                    Open Window
                  </button>
                </div>
              </div>
            )}

            {/* Games Grid */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>{activeCategory}</span>
                  <span className="text-[10px] text-neutral-500 font-normal">({filteredGames.length} games)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map((game) => {
                  const isFav = favorites.includes(game.id)
                  return (
                    <div
                      key={game.id}
                      onClick={() => setSelectedGameDetail(game)}
                      className="bg-neutral-900/70 hover:bg-neutral-800/80 border border-white/10 hover:border-purple-500/50 rounded-2xl p-4 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        {/* Artwork Banner */}
                        <div
                          className={`h-24 rounded-xl bg-gradient-to-tr ${game.artworkGradient} p-3 flex flex-col justify-between relative overflow-hidden shadow-inner mb-3`}
                        >
                          <div className="flex justify-between items-start z-10">
                            <span className="text-[9px] font-black bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-md">
                              {game.category} • {game.genre}
                            </span>
                            <button
                              onClick={(e) => toggleFavorite(game.id, e)}
                              className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  isFav ? 'text-red-500 fill-red-500' : 'text-white/70'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="z-10 flex items-center justify-between">
                            <span className="font-black text-sm text-white drop-shadow-md">
                              {game.title}
                            </span>
                            {game.badge && (
                              <span className="text-[8px] font-extrabold bg-white/20 text-white px-1.5 py-0.5 rounded shadow">
                                {game.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {game.description}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-500">v{game.version}</span>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={(e) => handleLaunchInWindow(game.id, e)}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 font-medium text-[11px]"
                            title="Open in dedicated window"
                          >
                            Window
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePlayEmbedded(game.id)
                            }}
                            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow-sm flex items-center space-x-1"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Play</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Details Modal */}
      {selectedGameDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedGameDetail.title}</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                    {selectedGameDetail.category} Engine
                  </span>
                </h2>
                <span className="text-[10px] text-neutral-400">{selectedGameDetail.genre} • v{selectedGameDetail.version}</span>
              </div>
              <button
                onClick={() => setSelectedGameDetail(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Artwork Banner */}
            <div className={`h-28 rounded-xl bg-gradient-to-r ${selectedGameDetail.artworkGradient} p-4 flex items-end justify-between shadow-inner`}>
              <span className="text-lg font-black text-white">{selectedGameDetail.title}</span>
              <span className="text-[10px] text-white/80 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md">
                100% Client-Side
              </span>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase mb-1">Description</h4>
              <p className="text-neutral-300 text-xs leading-relaxed">{selectedGameDetail.description}</p>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase mb-1">Controls</h4>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-white/5 text-neutral-300 text-xs">
                {selectedGameDetail.controls}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedGameDetail(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = selectedGameDetail.id
                  setSelectedGameDetail(null)
                  handleLaunchInWindow(id)
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 font-medium"
              >
                Open in Window
              </button>
              <button
                onClick={() => {
                  const id = selectedGameDetail.id
                  setSelectedGameDetail(null)
                  handlePlayEmbedded(id)
                }}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-lg flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Play Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
