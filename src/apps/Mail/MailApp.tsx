import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import {
  Inbox,
  Send,
  FileText,
  Trash2,
  Star,
  Search,
  PenSquare,
  Reply,
  Archive,
  Mail as MailIcon,
  CheckCircle2,
} from 'lucide-react'
import { soundService } from '@/core/audio/soundService'
import { useNotifications } from '@/core/notifications/NotificationContext'

interface Email {
  id: string
  folder: 'inbox' | 'sent' | 'drafts' | 'trash'
  sender: string
  senderEmail: string
  recipient: string
  subject: string
  snippet: string
  body: string
  date: string
  read: boolean
  starred: boolean
}

const INITIAL_EMAILS: Email[] = [
  {
    id: 'email-1',
    folder: 'inbox',
    sender: 'NOVA OS Engineering Team',
    senderEmail: 'team@nova-os.io',
    recipient: 'user@nova-os.local',
    subject: 'Welcome to your new virtual operating system!',
    snippet: 'Discover the power and elegance of NOVA OS v2.0...',
    body: `Hello and welcome to NOVA OS!

We are thrilled to welcome you to NOVA OS v2.0. This browser-based desktop environment combines the sleek fluid animations of modern macOS with robust virtual file persistence, multi-window multitasking, and a complete suite of creative and utility applications.

KEY FEATURES TO EXPLORE:
1. Multi-Window Multitasking: Resize, minimize, and drag windows seamlessly.
2. Spotlight Search: Press Ctrl + Space to search apps, files, or do quick math.
3. Virtual File System: Full IndexedDB persistence with support for importing your own files.
4. Procedural Audio Engine: Enjoy ambient music and retro game sounds without external audio lag.
5. Nova Odyssey: Check out the built-in 2D arcade platformer directly from the Dock!

If you have any feedback or ideas, feel free to write a draft or create notes.

Warm regards,
The NOVA OS Architecture Team`,
    date: '10:15 AM',
    read: false,
    starred: true,
  },
  {
    id: 'email-2',
    folder: 'inbox',
    sender: 'Nova Cloud Security',
    senderEmail: 'security@nova-os.io',
    recipient: 'user@nova-os.local',
    subject: 'Virtual Sandbox Environment Activated',
    snippet: 'Your browser session is operating in an isolated secure sandbox...',
    body: `Security Status Report:
- Environment: Isolated Browser Sandbox (Client-Side)
- Storage Engine: IndexedDB Local Virtual Drive
- External Network: Protected by Browser Same-Origin Policy
- Telemetry: Zero external tracking

All your notes, calendar events, settings, and files remain private to your browser storage. Enjoy exploring with complete peace of mind.`,
    date: 'Yesterday',
    read: true,
    starred: false,
  },
  {
    id: 'email-3',
    folder: 'inbox',
    sender: 'Nova App Store',
    senderEmail: 'store@nova-os.io',
    recipient: 'user@nova-os.local',
    subject: 'Featured App: Nova Odyssey Platformer',
    snippet: 'Jump into action with our retro cyber platformer...',
    body: `Looking for a quick break?

Launch "Nova Odyssey" from the Dock or App Store to test your reflexes across procedural orbital platforms. Collect energy crystals, dodge patrol drones, and set a new personal best score!`,
    date: 'Oct 19',
    read: true,
    starred: false,
  },
]

export const MailApp: React.FC<AppInstanceProps> = () => {
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS)
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox')
  const [selectedEmailId, setSelectedEmailId] = useState<string>(INITIAL_EMAILS[0].id)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCompose, setShowCompose] = useState(false)

  // Compose Form
  const [toField, setToField] = useState('')
  const [subjectField, setSubjectField] = useState('')
  const [bodyField, setBodyField] = useState('')

  const { addNotification } = useNotifications()

  const activeEmail = emails.find((e) => e.id === selectedEmailId) || emails[0]

  const filteredEmails = emails.filter((e) => {
    const matchesFolder = e.folder === selectedFolder
    const matchesQuery =
      searchQuery === '' ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.body.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFolder && matchesQuery
  })

  const handleSelectEmail = (email: Email) => {
    soundService.playClick()
    setSelectedEmailId(email.id)
    if (!email.read) {
      setEmails((prev) =>
        prev.map((item) => (item.id === email.id ? { ...item, read: true } : item))
      )
    }
  }

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    soundService.playClick()
    setEmails((prev) =>
      prev.map((item) => (item.id === id ? { ...item, starred: !item.starred } : item))
    )
  }

  const handleDeleteEmail = (id: string) => {
    soundService.playClick()
    setEmails((prev) =>
      prev.map((item) => (item.id === id ? { ...item, folder: 'trash' } : item))
    )
  }

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!toField || !subjectField) return

    soundService.playClick()
    const newSentEmail: Email = {
      id: 'email-' + Date.now(),
      folder: 'sent',
      sender: 'You',
      senderEmail: 'user@nova-os.local',
      recipient: toField,
      subject: subjectField,
      snippet: bodyField.slice(0, 60),
      body: bodyField,
      date: 'Just now',
      read: true,
      starred: false,
    }

    setEmails((prev) => [newSentEmail, ...prev])
    setShowCompose(false)
    setToField('')
    setSubjectField('')
    setBodyField('')
    addNotification('Email Dispatched', `Message to "${toField}" saved to Sent folder`, 'mail')
  }

  return (
    <div className="flex h-full bg-neutral-900/90 text-neutral-200 select-none backdrop-blur-xl relative">
      {/* Column 1: Mailboxes Sidebar */}
      <div className="w-48 border-r border-white/10 bg-black/20 flex flex-col p-2 space-y-1 text-xs">
        <button
          onClick={() => {
            soundService.playClick()
            setShowCompose(true)
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition mb-2"
        >
          <PenSquare size={14} /> New Message
        </button>

        <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">
          Mailboxes
        </div>

        <button
          onClick={() => {
            soundService.playClick()
            setSelectedFolder('inbox')
          }}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
            selectedFolder === 'inbox' ? 'bg-blue-600/20 text-blue-300 font-medium' : 'hover:bg-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Inbox size={14} /> <span>Inbox</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {emails.filter((e) => e.folder === 'inbox').length}
          </span>
        </button>

        <button
          onClick={() => {
            soundService.playClick()
            setSelectedFolder('sent')
          }}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
            selectedFolder === 'sent' ? 'bg-blue-600/20 text-blue-300 font-medium' : 'hover:bg-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Send size={14} /> <span>Sent</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {emails.filter((e) => e.folder === 'sent').length}
          </span>
        </button>

        <button
          onClick={() => {
            soundService.playClick()
            setSelectedFolder('drafts')
          }}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
            selectedFolder === 'drafts' ? 'bg-blue-600/20 text-blue-300 font-medium' : 'hover:bg-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={14} /> <span>Drafts</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {emails.filter((e) => e.folder === 'drafts').length}
          </span>
        </button>

        <button
          onClick={() => {
            soundService.playClick()
            setSelectedFolder('trash')
          }}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
            selectedFolder === 'trash' ? 'bg-blue-600/20 text-blue-300 font-medium' : 'hover:bg-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Trash2 size={14} /> <span>Trash</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {emails.filter((e) => e.folder === 'trash').length}
          </span>
        </button>

        <div className="mt-auto p-2 bg-white/5 rounded-xl text-[10px] text-neutral-400 leading-tight">
          <span className="font-semibold text-neutral-300">Local Sandbox Mode:</span> All messages are safely kept in your browser storage.
        </div>
      </div>

      {/* Column 2: Email Messages List */}
      <div className="w-64 border-r border-white/10 bg-white/[0.02] flex flex-col">
        {/* Search Input */}
        <div className="p-2 border-b border-white/10">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-md pl-7 pr-2 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-500">No emails found</div>
          ) : (
            filteredEmails.map((email) => {
              const isSelected = email.id === activeEmail?.id
              return (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={`p-2.5 rounded-xl cursor-pointer transition relative group ${
                    isSelected ? 'bg-blue-600/25 text-white' : 'hover:bg-white/5 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      {!email.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                      <span className={`text-xs truncate ${!email.read ? 'font-bold text-white' : 'font-medium'}`}>
                        {email.sender}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0">{email.date}</span>
                  </div>

                  <div className="text-xs truncate font-medium text-neutral-200 mb-0.5">
                    {email.subject}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">{email.snippet}</div>

                  <button
                    onClick={(e) => handleToggleStar(email.id, e)}
                    className="absolute right-2 bottom-2 text-neutral-500 hover:text-amber-400 transition"
                  >
                    <Star
                      size={12}
                      className={email.starred ? 'text-amber-400 fill-amber-400' : ''}
                    />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Column 3: Email Reader View */}
      <div className="flex-1 flex flex-col bg-neutral-900/40">
        {activeEmail ? (
          <>
            {/* Email Header Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setToField(activeEmail.senderEmail)
                    setSubjectField(`Re: ${activeEmail.subject}`)
                    setShowCompose(true)
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white"
                >
                  <Reply size={14} /> Reply
                </button>
                <button
                  onClick={() => handleDeleteEmail(activeEmail.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-white/10 text-neutral-300 hover:text-red-400"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-2">{activeEmail.subject}</h2>
                <div className="flex items-center justify-between text-xs text-neutral-400 pb-3 border-b border-white/10">
                  <div>
                    <span className="font-semibold text-neutral-200">{activeEmail.sender}</span>{' '}
                    <span>&lt;{activeEmail.senderEmail}&gt;</span>
                  </div>
                  <span>{activeEmail.date}</span>
                </div>
              </div>

              <div className="text-xs text-neutral-200 leading-relaxed font-sans whitespace-pre-line">
                {activeEmail.body}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-neutral-500">
            No message selected
          </div>
        )}
      </div>

      {/* Compose Message Modal */}
      {showCompose && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSendEmail}
            className="w-full max-w-lg bg-neutral-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-white/10">
              <span className="text-xs font-semibold text-white">New Message</span>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="flex items-center border-b border-white/10 pb-2">
                <span className="w-12 text-neutral-400">To:</span>
                <input
                  type="email"
                  required
                  placeholder="recipient@example.com"
                  value={toField}
                  onChange={(e) => setToField(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0"
                />
              </div>

              <div className="flex items-center border-b border-white/10 pb-2">
                <span className="w-12 text-neutral-400">Subject:</span>
                <input
                  type="text"
                  required
                  placeholder="Subject of the email"
                  value={subjectField}
                  onChange={(e) => setSubjectField(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0"
                />
              </div>

              <textarea
                rows={8}
                placeholder="Write your email here..."
                value={bodyField}
                onChange={(e) => setBodyField(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white resize-none leading-relaxed focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/60 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition"
              >
                <Send size={13} /> Send Message
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
