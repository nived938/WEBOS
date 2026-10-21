import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { BookOpen, Search, Volume2, Bookmark, Sparkles } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface WordEntry {
  word: string
  phonetic: string
  partOfSpeech: string
  definition: string
  example: string
  synonyms: string[]
}

const LOCAL_DICT: Record<string, WordEntry> = {
  serendipity: {
    word: 'serendipity',
    phonetic: '/ˌsɛr.ənˈdɪp.ə.ti/',
    partOfSpeech: 'noun',
    definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
    example: 'A fortunate stroke of serendipity led to the discovery of the breakthrough algorithm.',
    synonyms: ['chance', 'fluke', 'good fortune', 'providence']
  },
  ephemeral: {
    word: 'ephemeral',
    phonetic: '/əˈfɛm.ər.əl/',
    partOfSpeech: 'adjective',
    definition: 'Lasting for a very short time; transitory.',
    example: 'The ephemeral beauty of a meteor streak illuminated the night sky.',
    synonyms: ['fleeting', 'transient', 'short-lived', 'momentary']
  },
  operating: {
    word: 'operating system',
    phonetic: '/ˈɒp.ər.eɪ.tɪŋ ˈsɪs.təm/',
    partOfSpeech: 'noun',
    definition: 'The low-level software that supports a computer’s basic functions, scheduling tasks and controlling peripherals.',
    example: 'NOVA OS reimagines desktop computing natively inside the web browser.',
    synonyms: ['OS', 'platform', 'kernel', 'environment']
  },
  lucid: {
    word: 'lucid',
    phonetic: '/ˈluː.sɪd/',
    partOfSpeech: 'adjective',
    definition: 'Expressed clearly; easy to understand, or having full use of one’s faculties.',
    example: 'She gave a wonderfully lucid explanation of the system architecture.',
    synonyms: ['coherent', 'articulate', 'clear', 'transparent']
  }
}

export const DictionaryApp: React.FC<AppInstanceProps> = () => {
  const [query, setQuery] = useState('serendipity')
  const [currentEntry, setCurrentEntry] = useState<WordEntry>(LOCAL_DICT.serendipity)
  const [loading, setLoading] = useState(false)

  const handleSearch = (wordToSearch?: string) => {
    soundService.playClick()
    const target = (wordToSearch || query).trim().toLowerCase()
    if (!target) return

    setLoading(true)
    setTimeout(() => {
      if (LOCAL_DICT[target]) {
        setCurrentEntry(LOCAL_DICT[target])
      } else {
        // Fallback simulated entry for any word
        setCurrentEntry({
          word: target,
          phonetic: `/${target}/`,
          partOfSpeech: 'noun',
          definition: `An important concept or element referenced in modern lexicons denoting '${target}'.`,
          example: `The engineer carefully examined the characteristics of ${target}.`,
          synonyms: ['concept', 'entity', 'construct']
        })
      }
      setLoading(false)
    }, 150)
  }

  const speak = () => {
    soundService.playNotification()
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentEntry.word)
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden">
      {/* Search Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-neutral-200">Dictionary & Thesaurus</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch()
          }}
          className="flex-1 max-w-sm relative"
        >
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Look up a word..."
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </form>

        <button
          onClick={() => handleSearch()}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium"
        >
          Define
        </button>
      </div>

      {/* Suggested Words Bar */}
      <div className="px-4 py-2 bg-neutral-950/60 border-b border-white/5 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Explore:</span>
        {Object.keys(LOCAL_DICT).map(word => (
          <button
            key={word}
            onClick={() => {
              setQuery(word)
              handleSearch(word)
            }}
            className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 capitalize text-xs"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Word Definition Card */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center items-start">
        <div className="max-w-xl w-full bg-neutral-950/70 border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-white capitalize">{currentEntry.word}</h1>
              <span className="text-sm font-mono text-emerald-400 mt-1 inline-block">{currentEntry.phonetic}</span>
            </div>
            <button
              onClick={speak}
              className="p-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
              title="Pronounce word"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 bg-white/5 px-2 py-0.5 rounded">
              {currentEntry.partOfSpeech}
            </span>
            <p className="text-base text-neutral-200 mt-2.5 leading-relaxed font-serif">
              {currentEntry.definition}
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5 italic text-sm text-neutral-300">
            "{currentEntry.example}"
          </div>

          {currentEntry.synonyms.length > 0 && (
            <div className="pt-2">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Synonyms</div>
              <div className="flex flex-wrap gap-2">
                {currentEntry.synonyms.map((syn, idx) => (
                  <span
                    key={idx}
                    onClick={() => {
                      setQuery(syn)
                      handleSearch(syn)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs cursor-pointer border border-emerald-500/20"
                  >
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
