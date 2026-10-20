// Web Audio API procedural sound synthesizer for NOVA OS
// Zero external file dependencies - 100% reliable offline operation

class SoundService {
  private ctx: AudioContext | null = null
  private muted: boolean = false
  private masterGain: GainNode | null = null
  private volume: number = 0.8

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = this.volume
        this.masterGain.connect(this.ctx.destination)
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime)
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime)
    }
  }

  // Iconic macOS / NOVA OS style boot chime (Rich F# / C Major 9th shimmering chord)
  public playStartup() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const freqs = [130.81, 164.81, 196.00, 246.94, 293.66, 392.00] // C, E, G, B, D, G
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, t)
      
      const noteGain = (0.2 / freqs.length) * (1 - idx * 0.08)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(noteGain, t + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8)

      osc.connect(gain)
      gain.connect(this.masterGain!)
      osc.start(t)
      osc.stop(t + 3.0)
    })
  }

  // Subtle pleasant click for buttons / tabs
  public playClick() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, t)
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04)

    gain.gain.setValueAtTime(0.08, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)

    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + 0.05)
  }

  // Smooth swoosh for window minimize / open
  public playWindowMinimize() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(520, t)
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.18)

    gain.gain.setValueAtTime(0.12, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)

    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + 0.2)
  }

  public playWindowRestore() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(180, t)
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.16)

    gain.gain.setValueAtTime(0.1, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16)

    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + 0.18)
  }

  // Paper crumple / trash empty sound
  public playTrashEmpty() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const bufferSize = ctx.sampleRate * 0.25
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.07))
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1200, t)
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.22)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.2, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)
    noise.start(t)
  }

  // Camera shutter sound for screenshot
  public playShutter() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    // Two clicks in fast succession
    ;[0, 0.06].forEach((offset) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(1600, t + offset)
      osc.frequency.exponentialRampToValueAtTime(400, t + offset + 0.03)

      gain.gain.setValueAtTime(0.15, t + offset)
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.035)

      osc.connect(gain)
      gain.connect(this.masterGain!)
      osc.start(t + offset)
      osc.stop(t + offset + 0.04)
    })
  }

  // Pleasant notification bell
  public playNotification() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const freqs = [587.33, 880.0] // D5, A5
    freqs.forEach((freq, idx) => {
      const start = t + idx * 0.1
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.15, start)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4)

      osc.connect(gain)
      gain.connect(this.masterGain!)
      osc.start(start)
      osc.stop(start + 0.45)
    })
  }

  // Game sound effects
  public playGameJump() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(220, t)
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.12)

    gain.gain.setValueAtTime(0.1, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)

    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + 0.13)
  }

  public playGameCoin() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const freqs = [987.77, 1318.51] // B5, E6
    freqs.forEach((freq, idx) => {
      const start = t + idx * 0.06
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.12, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15)

      osc.connect(gain)
      gain.connect(this.masterGain!)
      osc.start(start)
      osc.stop(start + 0.16)
    })
  }

  public playGameHit() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(260, t)
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.2)

    gain.gain.setValueAtTime(0.2, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22)

    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + 0.23)
  }

  public playGameOver() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const freqs = [440, 392, 349.23, 293.66]
    freqs.forEach((freq, idx) => {
      const start = t + idx * 0.12
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.15, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3)

      osc.connect(gain)
      gain.connect(this.masterGain!)
      osc.start(start)
      osc.stop(start + 0.35)
    })
  }
}

export const soundService = new SoundService()
