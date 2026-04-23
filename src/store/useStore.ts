import { create } from 'zustand'
import type { Profile, Provider, Model } from '../types'

type Tab = 'general' | 'providers' | 'models' | 'code' | 'about'
type Theme = 'dark' | 'light'

interface AppState {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  
  profiles: Profile[]
  activeProfile: Profile | null
  setProfiles: (profiles: Profile[]) => void
  setActiveProfile: (profile: Profile | null) => void
  
  providers: Provider[]
  selectedProvider: Provider | null
  setProviders: (providers: Provider[]) => void
  setSelectedProvider: (provider: Provider | null) => void
  
  models: Model[]
  selectedModel: Model | null
  setModels: (models: Model[]) => void
  setSelectedModel: (model: Model | null) => void
  
  isLoading: boolean
  setLoading: (loading: boolean) => void
  
  notification: { message: string; type: 'success' | 'error' } | null
  showNotification: (message: string, type?: 'success' | 'error') => void
  clearNotification: () => void
  
  loadProfiles: () => Promise<void>
  loadProviders: () => Promise<void>
  loadModels: (providerId: number) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  activeTab: 'general',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  theme: (localStorage.getItem('theme') as Theme) || 'dark',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    set({ theme })
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', newTheme)
    set({ theme: newTheme })
  },
  
  profiles: [],
  activeProfile: null,
  setProfiles: (profiles) => set({ profiles }),
  setActiveProfile: (profile) => set({ activeProfile: profile }),
  
  providers: [],
  selectedProvider: null,
  setProviders: (providers) => set({ providers }),
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  
  models: [],
  selectedModel: null,
  setModels: (models) => set({ models }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  
  notification: null,
  showNotification: (message, type = 'success') => {
    set({ notification: { message, type } })
    setTimeout(() => set({ notification: null }), 3000)
  },
  clearNotification: () => set({ notification: null }),
  
  loadProfiles: async () => {
    const profiles = await window.api.profiles.list()
    const active = await window.api.profiles.getActive()
    set({ profiles, activeProfile: active })
  },
  
  loadProviders: async () => {
    const { activeProfile } = get()
    if (!activeProfile) {
      set({ providers: [], selectedProvider: null })
      return
    }
    const providers = await window.api.providers.list(activeProfile.id)
    set({ providers, selectedProvider: providers[0] || null })
  },
  
  loadModels: async (providerId: number) => {
    const models = await window.api.models.list(providerId)
    set({ models, selectedModel: models[0] || null })
  }
}))
