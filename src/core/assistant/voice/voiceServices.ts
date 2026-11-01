export class SpeechRecognitionService {
  private recognition: any = null
  private isListening = false

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = true
        this.recognition.lang = 'en-US'
      }
    }
  }

  public isAvailable(): boolean {
    return this.recognition !== null
  }

  public start(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser.')
      return
    }

    if (this.isListening) {
      this.stop()
    }

    this.recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript
        } else {
          interim += event.results[i][0].transcript
        }
      }

      if (final) {
        onResult(final, true)
      } else if (interim) {
        onResult(interim, false)
      }
    }

    this.recognition.onerror = (event: any) => {
      this.isListening = false
      onError(event.error || 'Speech recognition encountered an error')
    }

    this.recognition.onend = () => {
      this.isListening = false
      onEnd()
    }

    try {
      this.recognition.start()
      this.isListening = true
    } catch (e: any) {
      onError(e.message)
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop()
      } catch {
        // Ignore
      }
      this.isListening = false
    }
  }
}

export class SpeechSynthesisService {
  private synth: SpeechSynthesis | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
    }
  }

  public isAvailable(): boolean {
    return this.synth !== null
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return []
    return this.synth.getVoices()
  }

  public speak(text: string, rate = 1.0, pitch = 1.0, voiceName?: string) {
    if (!this.synth) return

    // Cancel ongoing speech
    this.synth.cancel()

    // Clean markdown before speaking
    const cleanText = text
      .replace(/[*_#`[\]()]/g, '')
      .replace(/\n+/g, ' ')
      .trim()

    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = rate
    utterance.pitch = pitch

    if (voiceName) {
      const voices = this.getVoices()
      const match = voices.find((v) => v.name === voiceName)
      if (match) utterance.voice = match
    }

    this.synth.speak(utterance)
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel()
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService()
export const speechSynthesisService = new SpeechSynthesisService()
