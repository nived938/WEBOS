import React, { useState, useEffect } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { GitBranch, Star, GitFork, Eye, FileText, Folder, Search, ExternalLink, GitCommit } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

export const GithubViewerApp: React.FC<AppInstanceProps> = () => {
  const [repoQuery, setRepoQuery] = useState('nived938/WEBOS')
  const [activeTab, setActiveTab] = useState<'readme' | 'files' | 'commits'>('readme')
  const [loading, setLoading] = useState(false)
  const [repoData, setRepoData] = useState<any>({
    name: 'WEBOS',
    full_name: 'nived938/WEBOS',
    description: 'A complete, elegant, browser-based operating system inspired by macOS aesthetics.',
    stargazers_count: 142,
    forks_count: 28,
    open_issues_count: 0,
    language: 'TypeScript',
    default_branch: 'main'
  })

  const commits = [
    { sha: '8f2a1b9', message: 'feat: add 3D Three.js games & complete app library', author: 'nived938', date: 'Just now' },
    { sha: '6c3d4e2', message: 'fix(window): traffic lights pointer capture bug in small windows', author: 'nived938', date: '1 hour ago' },
    { sha: '4a1b8f0', message: 'fix(wallpaper): add fallback preloading and eliminate black screen', author: 'nived938', date: '2 hours ago' },
    { sha: '1e9c5a7', message: 'feat(browser): multi-tab browsing & in-app SERP engine', author: 'nived938', date: '3 hours ago' },
  ]

  const files = [
    { name: 'src', type: 'dir', size: '-' },
    { name: 'public', type: 'dir', size: '-' },
    { name: 'package.json', type: 'file', size: '1.2 KB' },
    { name: 'vite.config.ts', type: 'file', size: '820 B' },
    { name: 'README.md', type: 'file', size: '4.5 KB' },
    { name: 'ARCHITECTURE.md', type: 'file', size: '8.1 KB' },
    { name: 'CHANGELOG.md', type: 'file', size: '3.4 KB' },
  ]

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Top Search & Header */}
      <div className="p-3 bg-neutral-800/80 border-b border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-white">GitHub Explorer</span>
        </div>

        <div className="flex items-center space-x-2 flex-1 max-w-sm">
          <input
            type="text"
            value={repoQuery}
            onChange={(e) => setRepoQuery(e.target.value)}
            placeholder="owner/repo"
            className="flex-1 bg-neutral-950 border border-white/10 rounded-lg px-3 py-1 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={`https://github.com/${repoQuery}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Repo Info Card */}
      <div className="p-4 bg-neutral-950/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>{repoData.full_name}</span>
            <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full border border-white/5 font-normal">
              Public
            </span>
          </h2>
          <p className="text-neutral-400 mt-1">{repoData.description}</p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">{repoData.stargazers_count}</span>
          </div>
          <div className="flex items-center space-x-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            <GitFork className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">{repoData.forks_count}</span>
          </div>
          <div className="flex items-center space-x-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
            <span>{repoData.language}</span>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center px-4 bg-neutral-950/60 border-b border-white/5 space-x-4">
        <button
          onClick={() => {
            soundService.playClick()
            setActiveTab('readme')
          }}
          className={`py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'readme' ? 'border-purple-500 text-white' : 'border-transparent text-neutral-400'
          }`}
        >
          README.md
        </button>
        <button
          onClick={() => {
            soundService.playClick()
            setActiveTab('files')
          }}
          className={`py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'files' ? 'border-purple-500 text-white' : 'border-transparent text-neutral-400'
          }`}
        >
          Files ({files.length})
        </button>
        <button
          onClick={() => {
            soundService.playClick()
            setActiveTab('commits')
          }}
          className={`py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'commits' ? 'border-purple-500 text-white' : 'border-transparent text-neutral-400'
          }`}
        >
          Commits
        </button>
      </div>

      {/* Tab Panes */}
      <div className="flex-1 overflow-y-auto p-4 bg-neutral-950/30">
        {activeTab === 'readme' && (
          <div className="max-w-2xl mx-auto bg-neutral-900 border border-white/10 rounded-xl p-6 space-y-4">
            <h1 className="text-xl font-bold border-b border-white/10 pb-2 text-white"># NOVA OS (WEBOS)</h1>
            <p className="text-neutral-300 leading-relaxed">
              NOVA OS is a state-of-the-art browser operating system engineered with React 19, Vite 8, Three.js, and Tailwind CSS.
            </p>
            <h2 className="text-sm font-semibold text-neutral-200 mt-4">✨ Key Highlights</h2>
            <ul className="list-disc list-inside text-neutral-300 space-y-1">
              <li>Traffic lights window controls that work consistently across all states.</li>
              <li>Resilient dynamic wallpaper system with zero black-screen anomalies.</li>
              <li>Integrated tabbed browser with in-app search engine and reader view.</li>
              <li>Ubuntu-inspired Software Center with 40+ native web applications.</li>
              <li>Real 3D arcade games powered by Three.js WebGL graphics pipeline.</li>
            </ul>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="max-w-xl mx-auto bg-neutral-900 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 cursor-pointer">
                <div className="flex items-center space-x-3">
                  {file.type === 'dir' ? (
                    <Folder className="w-4 h-4 text-blue-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-neutral-400" />
                  )}
                  <span className="text-neutral-200 font-mono">{file.name}</span>
                </div>
                <span className="text-[10px] text-neutral-500">{file.size}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'commits' && (
          <div className="max-w-xl mx-auto space-y-2">
            {commits.map((c, i) => (
              <div key={i} className="p-3 bg-neutral-900 border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-200">{c.message}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {c.author} committed {c.date}
                  </div>
                </div>
                <span className="font-mono text-[10px] bg-white/5 px-2 py-1 rounded text-purple-400">
                  {c.sha}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
