import React, { useState } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Users, Search, Plus, Mail, Phone, Building, Star, Trash2 } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

interface Contact {
  id: string
  name: string
  role: string
  company: string
  email: string
  phone: string
  avatarColor: string
  isFavorite: boolean
}

const INITIAL_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Elena Rostova', role: 'Lead Architect', company: 'Nova Systems', email: 'elena@novasystems.io', phone: '+1 (555) 234-5678', avatarColor: 'from-blue-500 to-indigo-600', isFavorite: true },
  { id: 'c2', name: 'Marcus Chen', role: 'Graphics Engineer', company: 'Web3D Lab', email: 'marcus@web3d.dev', phone: '+1 (555) 345-6789', avatarColor: 'from-purple-500 to-pink-600', isFavorite: true },
  { id: 'c3', name: 'Sarah Jenkins', role: 'Product Designer', company: 'Elegance Design', email: 'sarah@elegance.co', phone: '+1 (555) 456-7890', avatarColor: 'from-amber-500 to-orange-600', isFavorite: false },
  { id: 'c4', name: 'David Kim', role: 'Kernel Specialist', company: 'Silicon Core', email: 'david@siliconcore.org', phone: '+1 (555) 567-8901', avatarColor: 'from-emerald-500 to-teal-600', isFavorite: false },
]

export const ContactsApp: React.FC<AppInstanceProps> = () => {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS)
  const [selectedId, setSelectedId] = useState<string>(contacts[0].id)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('')

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeContact = contacts.find(c => c.id === selectedId) || contacts[0]

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    soundService.playClick()
    setContacts(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) return

    const newContact: Contact = {
      id: 'c' + Date.now(),
      name: newName.trim(),
      role: newRole.trim() || 'Collaborator',
      company: 'Independent',
      email: newEmail.trim(),
      phone: '+1 (555) 000-1122',
      avatarColor: 'from-blue-600 to-cyan-500',
      isFavorite: false
    }

    soundService.playNotification()
    setContacts(prev => [newContact, ...prev])
    setSelectedId(newContact.id)
    setNewName('')
    setNewEmail('')
    setNewRole('')
    setShowAddModal(false)
  }

  return (
    <div className="flex h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden text-xs">
      {/* Contact List Sidebar */}
      <div className="w-64 bg-neutral-950/70 border-r border-white/10 flex flex-col justify-between">
        <div>
          {/* Search Header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              title="Add Contact"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List items */}
          <div className="overflow-y-auto divide-y divide-white/5 max-h-[460px]">
            {filtered.map(c => {
              const isSelected = c.id === selectedId
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    soundService.playClick()
                    setSelectedId(c.id)
                  }}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-600/20 border-l-2 border-blue-500' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${c.avatarColor} flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm`}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <div className="font-medium text-white truncate">{c.name}</div>
                      <div className="text-[10px] text-neutral-400 truncate">{c.role}</div>
                    </div>
                  </div>
                  {c.isFavorite && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0 ml-1" />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-3 text-[10px] text-neutral-500 text-center border-t border-white/5">
          {contacts.length} Contacts Saved
        </div>
      </div>

      {/* Main Detail View */}
      <div className="flex-1 bg-neutral-900 p-8 overflow-y-auto flex items-center justify-center">
        {activeContact && (
          <div className="max-w-md w-full bg-neutral-950/80 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center space-x-4 border-b border-white/10 pb-5">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${activeContact.avatarColor} flex items-center justify-center font-bold text-white text-2xl shadow-lg`}>
                {activeContact.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">{activeContact.name}</h2>
                  <button onClick={() => toggleFavorite(activeContact.id)}>
                    <Star className={`w-4 h-4 ${activeContact.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-500'}`} />
                  </button>
                </div>
                <div className="text-xs text-blue-400 font-medium">{activeContact.role}</div>
                <div className="text-[11px] text-neutral-400">{activeContact.company}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <Mail className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-[9px] text-neutral-400 uppercase font-semibold">Email Address</div>
                  <div className="text-xs text-white font-mono mt-0.5">{activeContact.email}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <Phone className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[9px] text-neutral-400 uppercase font-semibold">Phone Number</div>
                  <div className="text-xs text-white font-mono mt-0.5">{activeContact.phone}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <Building className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-[9px] text-neutral-400 uppercase font-semibold">Organization</div>
                  <div className="text-xs text-white mt-0.5">{activeContact.company}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAdd} className="bg-neutral-800 border border-white/10 rounded-2xl p-5 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-white">Add New Contact</h3>
            <div>
              <label className="text-[10px] text-neutral-400">Full Name</label>
              <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white mt-1 focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400">Email</label>
              <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white mt-1 focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400">Job Role</label>
              <input type="text" value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white mt-1 focus:outline-none" />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:bg-white/5">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
