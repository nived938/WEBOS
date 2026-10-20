import React, { useState, useEffect, useRef } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { vfs } from '@/core/filesystem/vfs'
import { useWindowManager } from '@/core/windowManager/WindowContext'
import type { AppId } from '@/types'

interface HistoryEntry {
  command: string
  output: React.ReactNode
}

export const TerminalApp: React.FC<AppInstanceProps> = ({ isFocused }) => {
  const { openApp } = useWindowManager()
  const [currentPath, setCurrentPath] = useState<string>('folder-desktop')
  const [currentPathDisplay, setCurrentPathDisplay] = useState<string>('~/Desktop')
  const [inputVal, setInputVal] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [theme, setTheme] = useState<'default' | 'matrix' | 'amber'>('default')

  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      command: '',
      output: (
        <div className="text-neutral-300 mb-2 leading-relaxed font-mono">
          <p className="text-blue-400 font-bold">NOVA OS Terminal v2.0 (Tahoe)</p>
          <p className="text-xs text-neutral-400">Type <span className="text-amber-400 font-semibold">help</span> to view available commands, or <span className="text-amber-400 font-semibold">neofetch</span> for system info.</p>
        </div>
      ),
    },
  ])

  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus()
    }
  }, [isFocused])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const getFolderName = (folderId: string | null): string => {
    if (!folderId) return '~'
    if (folderId === 'folder-desktop') return '~/Desktop'
    if (folderId === 'folder-documents') return '~/Documents'
    if (folderId === 'folder-downloads') return '~/Downloads'
    if (folderId === 'folder-pictures') return '~/Pictures'
    if (folderId === 'folder-music') return '~/Music'
    const n = vfs.getNode(folderId)
    return n ? n.name : '~'
  }

  const handleCommand = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) {
      setHistory((prev) => [...prev, { command: '', output: null }])
      return
    }

    setCommandHistory((prev) => [trimmed, ...prev])
    setHistoryIndex(-1)

    const parts = trimmed.split(' ')
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    let out: React.ReactNode = null

    switch (cmd) {
      case 'help':
        out = (
          <div className="space-y-1 text-xs">
            <p className="text-neutral-400">Supported NOVA OS shell commands:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-neutral-300 mt-2 font-mono">
              <div><span className="text-amber-400">ls [-la]</span> : list files</div>
              <div><span className="text-amber-400">cd [dir]</span> : change dir</div>
              <div><span className="text-amber-400">pwd</span> : print working dir</div>
              <div><span className="text-amber-400">cat [file]</span> : view file</div>
              <div><span className="text-amber-400">mkdir [name]</span> : make directory</div>
              <div><span className="text-amber-400">touch [name]</span> : create file</div>
              <div><span className="text-amber-400">rm [name]</span> : remove file</div>
              <div><span className="text-amber-400">open [app]</span> : launch app</div>
              <div><span className="text-amber-400">echo [text]</span> : print text</div>
              <div><span className="text-amber-400">date / time</span> : current date</div>
              <div><span className="text-amber-400">whoami</span> : current user</div>
              <div><span className="text-amber-400">neofetch</span> : system specs</div>
              <div><span className="text-amber-400">theme [name]</span> : matrix/amber/default</div>
              <div><span className="text-amber-400">clear</span> : clear terminal</div>
            </div>
          </div>
        )
        break

      case 'clear':
        setHistory([])
        return

      case 'pwd':
        out = <div className="text-neutral-300">{currentPathDisplay}</div>
        break

      case 'date':
      case 'time':
        out = <div className="text-neutral-300">{new Date().toString()}</div>
        break

      case 'echo':
        out = <div className="text-neutral-300">{args.join(' ')}</div>
        break

      case 'whoami':
        out = <div className="text-blue-400">user@nova-os (Administrator)</div>
        break

      case 'theme': {
        const t = args[0]?.toLowerCase()
        if (t === 'matrix' || t === 'amber' || t === 'default') {
          setTheme(t)
          out = <div className="text-neutral-300">Terminal theme set to {t}</div>
        } else {
          out = <div className="text-red-400">Usage: theme [default | matrix | amber]</div>
        }
        break
      }

      case 'neofetch':
      case 'uname':
        out = (
          <div className="flex gap-4 font-mono text-xs my-2">
            <pre className="text-blue-400 font-bold select-none leading-none">
{`
    _  ______  _   _____ 
   / |/ / __ \\| | / /   |
  /    / / / /| |/ / /| |
 / /| / /_/ / |   / ___ |
/_/ |_|\\____/  |_/_/  |_|
`}
            </pre>
            <div className="space-y-0.5 text-neutral-300">
              <p><span className="text-blue-400 font-bold">OS:</span> NOVA OS 2.0 (Tahoe Edition)</p>
              <p><span className="text-blue-400 font-bold">Host:</span> Virtual Browser Silicon</p>
              <p><span className="text-blue-400 font-bold">Kernel:</span> WebAssembly / React 19 Core</p>
              <p><span className="text-blue-400 font-bold">Shell:</span> nova-zsh 5.9</p>
              <p><span className="text-blue-400 font-bold">Memory:</span> 16384 MB Virtual RAM</p>
              <p><span className="text-blue-400 font-bold">Uptime:</span> {Math.floor(performance.now() / 60000)} mins</p>
            </div>
          </div>
        )
        break

      case 'ls': {
        const children = vfs.getChildren(currentPath)
        if (children.length === 0) {
          out = <div className="text-neutral-500">(empty directory)</div>
        } else {
          out = (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {children.map((c) => (
                <span
                  key={c.id}
                  className={c.type === 'folder' ? 'text-blue-400 font-bold' : 'text-neutral-200'}
                >
                  {c.name}{c.type === 'folder' ? '/' : ''}
                </span>
              ))}
            </div>
          )
        }
        break
      }

      case 'cd': {
        const target = args[0]
        if (!target || target === '~' || target === '/') {
          setCurrentPath('folder-desktop')
          setCurrentPathDisplay('~/Desktop')
        } else if (target === '..') {
          const current = vfs.getNode(currentPath)
          if (current && current.parentId) {
            setCurrentPath(current.parentId)
            setCurrentPathDisplay(getFolderName(current.parentId))
          } else {
            setCurrentPath('folder-desktop')
            setCurrentPathDisplay('~/Desktop')
          }
        } else {
          const children = vfs.getChildren(currentPath)
          const found = children.find(
            (c) => c.type === 'folder' && c.name.toLowerCase() === target.toLowerCase()
          )
          if (found) {
            setCurrentPath(found.id)
            setCurrentPathDisplay(`~/${found.name}`)
          } else {
            out = <div className="text-red-400">cd: no such file or directory: {target}</div>
          }
        }
        break
      }

      case 'mkdir': {
        const folderName = args[0]
        if (!folderName) {
          out = <div className="text-red-400">usage: mkdir &lt;directory_name&gt;</div>
        } else {
          vfs.createFolder(currentPath, folderName)
          out = <div className="text-neutral-300">Created directory: {folderName}</div>
        }
        break
      }

      case 'touch': {
        const fileName = args[0]
        if (!fileName) {
          out = <div className="text-red-400">usage: touch &lt;file_name&gt;</div>
        } else {
          vfs.createFile(currentPath, fileName, '')
          out = <div className="text-neutral-300">Created file: {fileName}</div>
        }
        break
      }

      case 'rm': {
        const target = args[0]
        if (!target) {
          out = <div className="text-red-400">usage: rm &lt;file_name&gt;</div>
        } else {
          const children = vfs.getChildren(currentPath)
          const found = children.find((c) => c.name.toLowerCase() === target.toLowerCase())
          if (found) {
            vfs.moveToTrash(found.id)
            out = <div className="text-neutral-300">Moved {target} to Trash</div>
          } else {
            out = <div className="text-red-400">rm: {target}: No such file or directory</div>
          }
        }
        break
      }

      case 'cat': {
        const target = args[0]
        if (!target) {
          out = <div className="text-red-400">usage: cat &lt;file_name&gt;</div>
        } else {
          const children = vfs.getChildren(currentPath)
          const found = children.find(
            (c) => c.type === 'file' && c.name.toLowerCase() === target.toLowerCase()
          )
          if (found) {
            out = (
              <pre className="text-neutral-300 font-mono whitespace-pre-wrap text-xs bg-black/30 p-2 rounded">
                {found.content || '(empty)'}
              </pre>
            )
          } else {
            out = <div className="text-red-400">cat: {target}: No such file</div>
          }
        }
        break
      }

      case 'open': {
        const target = args[0]?.toLowerCase()
        const appMap: Record<string, AppId> = {
          finder: 'finder',
          browser: 'browser',
          web: 'browser',
          notes: 'notes',
          calculator: 'calculator',
          calc: 'calculator',
          calendar: 'calendar',
          mail: 'mail',
          email: 'mail',
          photos: 'photos',
          pictures: 'photos',
          music: 'music',
          settings: 'settings',
          appstore: 'appstore',
          games: 'games',
          game: 'games',
          trash: 'trash',
        }
        if (target && appMap[target]) {
          openApp(appMap[target])
          out = <div className="text-emerald-400">Launching {target}...</div>
        } else {
          out = (
            <div className="text-red-400">
              Unknown application: {target}. Available: finder, browser, notes, calculator, calendar, mail, photos, music, settings, appstore, games.
            </div>
          )
        }
        break
      }

      default:
        out = (
          <div className="text-red-400">
            zsh: command not found: {cmd}. Type <span className="text-amber-400 font-semibold">help</span> for available commands.
          </div>
        )
        break
    }

    setHistory((prev) => [...prev, { command: raw, output: out }])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal)
      setInputVal('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const nextIdx = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(nextIdx)
      setInputVal(commandHistory[nextIdx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1
        setHistoryIndex(nextIdx)
        setInputVal(commandHistory[nextIdx])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInputVal('')
      }
    }
  }

  const themeClasses = {
    default: 'bg-neutral-950/95 text-neutral-200',
    matrix: 'bg-black text-emerald-400 font-mono',
    amber: 'bg-black text-amber-400 font-mono',
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`flex flex-col h-full p-3 font-mono text-xs overflow-y-auto cursor-text select-text ${themeClasses[theme]}`}
    >
      {/* Output history */}
      {history.map((item, idx) => (
        <div key={idx} className="mb-2">
          {item.command !== '' && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-emerald-400 font-bold">user@nova-os</span>
              <span className="text-neutral-500">{currentPathDisplay}</span>
              <span className="text-blue-400 font-bold">%</span>
              <span className="text-white">{item.command}</span>
            </div>
          )}
          {item.output}
        </div>
      ))}

      {/* Active prompt row */}
      <div className="flex items-center gap-2">
        <span className="text-emerald-400 font-bold">user@nova-os</span>
        <span className="text-neutral-500">{currentPathDisplay}</span>
        <span className="text-blue-400 font-bold">%</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-white font-mono p-0 focus:ring-0"
          autoFocus
          spellCheck={false}
        />
      </div>

      <div ref={bottomRef} />
    </div>
  )
}
