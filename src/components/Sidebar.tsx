import { useState } from 'react'
import { useStore } from '../store/useStore'
import ThemeToggle from './ThemeToggle'
import type { Profile } from '../types'

export default function Sidebar() {
  const { profiles, activeProfile, setActiveProfile, loadProfiles, loadProviders } = useStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')

  const handleProfileChange = async (profile: Profile) => {
    await window.api.profiles.setActive(profile.id)
    setActiveProfile(profile)
    loadProviders()
  }

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return
    try {
      await window.api.profiles.create(newProfileName.trim())
      await loadProfiles()
      setNewProfileName('')
      setIsCreating(false)
    } catch (err) {
      console.error('Failed to create profile:', err)
    }
  }

  const handleDeleteProfile = async (id: number) => {
    if (profiles.length <= 1) {
      alert('Cannot delete the last profile')
      return
    }
    if (confirm('Delete this profile? All providers and keys will be removed.')) {
      await window.api.profiles.delete(id)
      await loadProfiles()
      loadProviders()
    }
  }

  return (
    <aside 
      className="w-56 flex flex-col border-r"
      style={{ 
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      {/* Drag region for macOS traffic lights */}
      <div className="h-[38px] drag-region" />
      
      {/* Logo */}
      <div className="h-[52px] flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <img 
            src="/logo.png" 
            alt="LLMHub" 
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            LLMHub
          </span>
        </div>
        <div className="no-drag">
          <ThemeToggle />
        </div>
      </div>

      {/* Profiles Section */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="flex items-center justify-between px-2 mb-3">
          <span 
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Profiles
          </span>
          <button
            onClick={() => setIsCreating(true)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-sm transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-elevated)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-tertiary)'
            }}
          >
            +
          </button>
        </div>

        {isCreating && (
          <div 
            className="mb-3 p-3 rounded-lg animate-in"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
          >
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Profile name"
              className="input-field mb-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateProfile()
                if (e.key === 'Escape') setIsCreating(false)
              }}
            />
            <div className="flex gap-2">
              <button onClick={handleCreateProfile} className="btn-primary flex-1 text-sm py-1.5">
                Add
              </button>
              <button onClick={() => setIsCreating(false)} className="btn-ghost flex-1 text-sm py-1.5">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {profiles.map((profile, index) => (
            <div
              key={profile.id}
              className="group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-150"
              style={{
                background: activeProfile?.id === profile.id ? 'var(--accent-muted)' : 'transparent',
                animationDelay: `${index * 50}ms`
              }}
              onClick={() => handleProfileChange(profile)}
              onMouseEnter={(e) => {
                if (activeProfile?.id !== profile.id) {
                  e.currentTarget.style.background = 'var(--bg-elevated)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeProfile?.id !== profile.id) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div className="flex items-center gap-2">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ 
                    background: activeProfile?.id === profile.id ? 'var(--accent)' : 'var(--text-tertiary)'
                  }}
                />
                <span 
                  className="text-sm font-medium truncate"
                  style={{ 
                    color: activeProfile?.id === profile.id ? 'var(--accent)' : 'var(--text-primary)'
                  }}
                >
                  {profile.name}
                </span>
              </div>
              {profiles.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteProfile(profile.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-xs transition-opacity"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div 
        className="px-4 py-3 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          v1.0.1
        </p>
      </div>
    </aside>
  )
}
