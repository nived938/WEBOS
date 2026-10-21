import type { Wallpaper } from '@/types'

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'nova-aurora',
    name: 'Nova Aurora',
    type: 'dynamic',
    thumbnail: 'linear-gradient(135deg, #090919 0%, #2e1065 50%, #030712 100%)',
    style: 'radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.45) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(236, 72, 153, 0.35) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(30, 27, 75, 0.9) 0%, #030712 100%)',
    fallbackColor: '#090919',
  },
  {
    id: 'sonoma-dusk',
    name: 'Sonoma Dusk',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #1e1b4b 0%, #831843 50%, #ea580c 100%)',
    style: 'linear-gradient(145deg, #0f172a 0%, #311042 30%, #701a75 55%, #c2410c 80%, #f97316 100%)',
    fallbackColor: '#1e1b4b',
  },
  {
    id: 'monterey-waves',
    name: 'Monterey Waves',
    type: 'dynamic',
    thumbnail: 'linear-gradient(135deg, #1e3a8a 0%, #4338ca 50%, #a21caf 100%)',
    style: 'radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.6) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.5) 0%, transparent 45%), linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #2e1065 100%)',
    fallbackColor: '#1e3a8a',
  },
  {
    id: 'alpine-dawn',
    name: 'Alpine Dawn',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #1e3a8a 0%, #f472b6 50%, #fed7aa 100%)',
    style: 'linear-gradient(180deg, #1e3a8a 0%, #3b82f6 30%, #818cf8 55%, #f472b6 80%, #ffedd5 100%)',
    fallbackColor: '#1e3a8a',
  },
  {
    id: 'obsidian-stealth',
    name: 'Obsidian Minimal',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
    style: 'radial-gradient(circle at 50% 50%, #18181b 0%, #09090b 100%)',
    fallbackColor: '#09090b',
  },
  {
    id: 'emerald-matrix',
    name: 'Cyber Emerald',
    type: 'dynamic',
    thumbnail: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #047857 100%)',
    style: 'radial-gradient(ellipse at 30% 40%, rgba(16, 185, 129, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(6, 182, 212, 0.3) 0%, transparent 50%), linear-gradient(135deg, #022c22 0%, #041f1a 50%, #02120e 100%)',
    fallbackColor: '#022c22',
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    type: 'dynamic',
    thumbnail: 'linear-gradient(135deg, #450a0a 0%, #7c2d12 50%, #d97706 100%)',
    style: 'radial-gradient(circle at 75% 25%, rgba(249, 115, 22, 0.5) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(220, 38, 38, 0.4) 0%, transparent 50%), linear-gradient(145deg, #180505 0%, #2e0808 40%, #581605 80%, #7c2d12 100%)',
    fallbackColor: '#180505',
  },
  {
    id: 'deep-space',
    name: 'Cosmic Nebula',
    type: 'dynamic',
    thumbnail: 'linear-gradient(135deg, #030712 0%, #1e1b4b 50%, #312e81 100%)',
    style: 'radial-gradient(ellipse at 80% 20%, rgba(129, 140, 248, 0.35) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(192, 132, 252, 0.3) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(30, 27, 75, 0.8) 0%, #030712 100%)',
    fallbackColor: '#030712',
  },
  {
    id: 'lavender-mist',
    name: 'Lavender Mist',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #9333ea 100%)',
    style: 'linear-gradient(135deg, #1e0a3c 0%, #3b0764 35%, #581c87 65%, #7e22ce 85%, #a855f7 100%)',
    fallbackColor: '#1e0a3c',
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #082f49 0%, #0369a1 50%, #38bdf8 100%)',
    style: 'linear-gradient(160deg, #082f49 0%, #075985 30%, #0284c7 60%, #38bdf8 85%, #bae6fd 100%)',
    fallbackColor: '#082f49',
  },
  {
    id: 'neon-cyberpunk',
    name: 'Neon Horizon',
    type: 'dynamic',
    thumbnail: 'linear-gradient(135deg, #170326 0%, #701a75 50%, #06b6d4 100%)',
    style: 'radial-gradient(circle at 15% 30%, rgba(217, 70, 239, 0.45) 0%, transparent 50%), radial-gradient(circle at 85% 70%, rgba(6, 182, 212, 0.4) 0%, transparent 50%), linear-gradient(135deg, #090214 0%, #19052b 45%, #2a0845 80%, #15002b 100%)',
    fallbackColor: '#090214',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #2a1505 0%, #78350f 50%, #f59e0b 100%)',
    style: 'linear-gradient(145deg, #1c0e05 0%, #3c1e09 25%, #66320a 50%, #9a490d 75%, #d97706 90%, #fcd34d 100%)',
    fallbackColor: '#1c0e05',
  },
]

export const getWallpaperById = (id: string): Wallpaper => {
  return WALLPAPERS.find(w => w.id === id) || WALLPAPERS[0]
}
