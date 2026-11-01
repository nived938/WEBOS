import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { soundService } from '@/core/audio/soundService'
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Check,
  Plus,
  RefreshCw,
  Clock,
  User,
  FileDiff,
} from 'lucide-react'

interface Commit {
  hash: string
  message: string
  author: string
  date: string
  branch: string
}

const INITIAL_COMMITS: Commit[] = [
  {
    hash: 'e01fc6b',
    message: 'feat: implement Ubuntu GNOME desktop shell & activities overview',
    author: 'nived938',
    date: '10 mins ago',
    branch: 'main',
  },
  {
    hash: '9a4c81f',
    message: 'feat: add persistent app store & cryptographic package manager',
    author: 'nived938',
    date: '1 hour ago',
    branch: 'main',
  },
  {
    hash: '8f2b31a',
    message: 'refactor: liquid glass optics and hardware cursor engine',
    author: 'nived938',
    date: '3 hours ago',
    branch: 'main',
  },
  {
    hash: '5c192da',
    message: 'feat: add virtual multi-workspace matrix with persistence',
    author: 'nived938',
    date: 'Yesterday',
    branch: 'main',
  },
]

export const GitClientApp: React.FC<AppInstanceProps> = () => {
  const [commits, setCommits] = useState<Commit[]>(INITIAL_COMMITS)
  const [selectedCommit, setSelectedCommit] = useState<Commit>(INITIAL_COMMITS[0])
  const [branches, setBranches] = useState<string[]>(['main', 'feature/activities-overview', 'fix/window-clamp'])
  const [activeBranch, setActiveBranch] = useState('main')
  const [newCommitMsg, setNewCommitMsg] = useState('')

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommitMsg.trim()) return
    soundService.play('buttonClick')
    const newC: Commit = {
      hash: Math.random().toString(16).substring(2, 9),
      message: newCommitMsg.trim(),
      author: 'nived938',
      date: 'Just now',
      branch: activeBranch,
    }
    setCommits((prev) => [newC, ...prev])
    setSelectedCommit(newC)
    setNewCommitMsg('')
  }

  return (
    <div className="flex h-full bg-[#15151c] text-neutral-200 font-sans select-none overflow-hidden">
      {/* Branches Sidebar */}
      <div className="w-52 bg-black/40 border-r border-white/10 p-3 flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
          <span className="flex items-center gap-1.5">
            <GitBranch size={14} className="text-blue-400" /> Branches
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">({branches.length})</span>
        </div>

        <div className="space-y-1">
          {branches.map((b) => (
            <button
              key={b}
              onClick={() => {
                soundService.play('buttonClick')
                setActiveBranch(b)
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeBranch === b
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'hover:bg-white/10 text-neutral-400'
              }`}
            >
              <GitBranch size={12} /> {b}
            </button>
          ))}
        </div>

        {/* Quick Staged Commit Form */}
        <div className="mt-auto border-t border-white/10 pt-3">
          <span className="text-[11px] font-semibold text-neutral-400 block mb-2">
            Commit Changes
          </span>
          <form onSubmit={handleCommit} className="space-y-2">
            <textarea
              placeholder="Commit message..."
              value={newCommitMsg}
              onChange={(e) => setNewCommitMsg(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 resize-none h-16"
            />
            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow"
            >
              Commit to {activeBranch}
            </button>
          </form>
        </div>
      </div>

      {/* Commit History List */}
      <div className="w-80 bg-black/20 border-r border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/10 text-xs font-semibold text-neutral-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <GitCommit size={14} className="text-purple-400" /> Commit Graph
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">{commits.length} commits</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {commits.map((c) => (
            <div
              key={c.hash}
              onClick={() => {
                soundService.play('buttonClick')
                setSelectedCommit(c)
              }}
              className={`p-3 cursor-pointer transition-colors ${
                selectedCommit.hash === c.hash ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                  {c.hash}
                </span>
                <span className="text-neutral-500 flex items-center gap-1">
                  <Clock size={11} /> {c.date}
                </span>
              </div>
              <p className="text-xs font-medium text-white line-clamp-2 leading-snug">
                {c.message}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-neutral-400">
                <User size={11} /> {c.author}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commit Diff View */}
      <div className="flex-1 flex flex-col bg-[#1c1c24] overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">{selectedCommit.message}</h3>
            <span className="text-xs font-mono text-neutral-400">
              Commit {selectedCommit.hash} by {selectedCommit.author}
            </span>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-mono">
            +184 -12 lines
          </span>
        </div>

        <div className="flex-1 p-4 font-mono text-xs overflow-auto leading-relaxed select-text bg-black/30">
          <div className="text-neutral-500 mb-2">diff --git a/src/App.tsx b/src/App.tsx</div>
          <div className="text-neutral-500 mb-4">index 84ab21..ef9102 100644</div>
          <div className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
            - const oldWindowManager = new LegacyCompositor();
          </div>
          <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            + import &#123; ActivitiesOverview &#125; from '@/components/WindowManager/ActivitiesOverview'
          </div>
          <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            + import &#123; AppInstallationProvider &#125; from '@/core/appStore/AppInstallationContext'
          </div>
          <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            + &lt;AppInstallationProvider&gt;
          </div>
          <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            + &nbsp;&nbsp;&lt;Desktop /&gt;
          </div>
          <div className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            + &lt;/AppInstallationProvider&gt;
          </div>
        </div>
      </div>
    </div>
  )
}
