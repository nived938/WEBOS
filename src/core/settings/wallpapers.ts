import type { Wallpaper } from '@/types'

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'nova-aurora',
    name: 'Nova Aurora',
    type: 'dynamic',
    thumbnail: 'linear-gradient(135deg, #090919 0%, #2e1065 50%, #030712 100%)',
    style: 'radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.45) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(236, 72, 153, 0.35) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(30, 27, 75, 0.9) 0%, #030712 100%)',
  },
  {
    id: 'sonoma-dusk',
    name: 'Sonoma Dusk',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #1e1b4b 0%, #831843 50%, #ea580c 100%)',
    style: 'linear-gradient(145deg, #0f172a 0%, #311042 30%, #701a75 55%, #c2410c 80%, #f97316 100%)',
  },
  {
    id: 'monterey-waves',
    name: 'Monterey Waves',
    type: 'dynamic',
    thumbnail: 'linear-gradient(135deg, #1e3a8a 0%, #4338ca 50%, #a21caf 100%)',
    style: 'radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.6) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.5) 0%, transparent 45%), linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #2e1065 100%)',
  },
  {
    id: 'alpine-dawn',
    name: 'Alpine Dawn',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #3b82f6 0%, #f472b6 50%, #fed7aa 100%)',
    style: 'linear-gradient(180deg, #1e3a8a 0%, #3b82f6 30%, #818cf8 55%, #f472b6 80%, #ffedd5 100%)',
  },
  {
    id: 'obsidian-stealth',
    name: 'Obsidian Minimal',
    type: 'gradient',
    thumbnail: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
    style: 'radial-gradient(circle at 50% 50%, #18181b 0%, #09090b 100%)',
  },
  {
    id: 'emerald-matrix',
    name: 'Cyber Emerald',
    type: 'dynamic',
    thumbnail: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #047857 100%)',
    style: 'radial-gradient(ellipse at 30% 40%, rgba(16, 185, 129, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(6, 182, 212, 0.3) 0%, transparent 50%), linear-gradient(135deg, #022c22 0%, #041f1a 50%, #02120e 100%)',
  },
]
