import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { PROVIDER_DEFAULTS, DEFAULT_MODELS } from '../types'
import type { ProviderType, ApiKey } from '../types'

const PROVIDER_TYPES: { value: ProviderType; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google AI' },
  { value: 'azure', label: 'Azure OpenAI' },
  { value: 'ollama', label: 'Ollama' },
  { value: 'lmstudio', label: 'LM Studio' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'custom', label: 'Custom' },
]

interface KeyEntry {
  id?: number
  label: string
  key: string
  orgId: string
  isNew: boolean
  showKey: boolean
}

export default function ProvidersPage() {
  const { activeProfile, providers, loadProviders, selectedProvider, setSelectedProvider, showNotification } = useStore()
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [apiKeys, setApiKeys] = useState<KeyEntry[]>([])

  const [form, setForm] = useState({
    name: '',
    type: 'openai' as ProviderType,
    api_base_url: '',
    platform_url: ''
  })

  useEffect(() => {
    if (selectedProvider) {
      loadApiKeys()
    }
  }, [selectedProvider])

  const loadApiKeys = async () => {
    if (!selectedProvider) return
    const keys = await window.api.apikeys.list(selectedProvider.id)
    const entries: KeyEntry[] = keys.map((k: ApiKey) => ({
      id: k.id,
      label: k.label || 'Default',
      key: k.key,
      orgId: k.org_id || '',
      isNew: false,
      showKey: false
    }))
    // Always show one empty entry for adding new key
    entries.push({ label: '', key: '', orgId: '', isNew: true, showKey: false })
    setApiKeys(entries)
  }

  const handleTypeChange = (type: ProviderType) => {
    const defaults = PROVIDER_DEFAULTS[type]
    setForm({
      ...form,
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      api_base_url: defaults.api_base_url,
      platform_url: defaults.platform_url
    })
  }

  const handleAddProvider = async () => {
    if (!activeProfile || !form.name) return
    
    const provider = await window.api.providers.create({
      profile_id: activeProfile.id,
      name: form.name,
      type: form.type,
      api_base_url: form.api_base_url || null,
      platform_url: form.platform_url || null
    })

    const defaultModels = DEFAULT_MODELS[form.type]
    for (const model of defaultModels) {
      await window.api.models.create({
        provider_id: provider.id as number,
        name: model.name,
        display_name: model.display_name,
        input_cost: model.input_cost,
        output_cost: model.output_cost,
        context_window: model.context_window,
        max_tokens: null
      })
    }

    await loadProviders()
    setIsAdding(false)
    setForm({ name: '', type: 'openai', api_base_url: '', platform_url: '' })
    showNotification('Provider added successfully')
  }

  const handleUpdateProvider = async () => {
    if (!selectedProvider) return
    await window.api.providers.update(selectedProvider.id, {
      name: form.name,
      api_base_url: form.api_base_url,
      platform_url: form.platform_url
    })
    await loadProviders()
    setIsEditing(false)
    showNotification('Provider updated successfully')
  }

  const handleDeleteProvider = async () => {
    if (!selectedProvider) return
    if (confirm(`Delete "${selectedProvider.name}"?`)) {
      await window.api.providers.delete(selectedProvider.id)
      await loadProviders()
      setSelectedProvider(null)
      showNotification('Provider deleted')
    }
  }

  const handleSaveKey = async (index: number) => {
    if (!selectedProvider) return
    const entry = apiKeys[index]
    
    if (!entry.key.trim()) {
      showNotification('API key cannot be empty')
      return
    }

    if (entry.isNew) {
      // Add new key
      await window.api.apikeys.add(
        selectedProvider.id,
        entry.key.trim(),
        entry.label.trim() || undefined,
        entry.orgId.trim() || undefined
      )
      showNotification('API Key saved successfully')
    } else if (entry.id) {
      // Update existing key
      await window.api.apikeys.update(
        entry.id,
        entry.key.trim(),
        entry.label.trim() || undefined,
        entry.orgId.trim() || undefined
      )
      showNotification('API Key updated successfully')
    }
    
    await loadApiKeys()
  }

  const handleDeleteKey = async (index: number) => {
    const entry = apiKeys[index]
    if (entry.id) {
      await window.api.apikeys.delete(entry.id)
      showNotification('API Key deleted')
      await loadApiKeys()
    }
  }

  const updateKeyEntry = (index: number, field: keyof KeyEntry, value: string | boolean) => {
    setApiKeys(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const startEditing = () => {
    if (!selectedProvider) return
    setForm({
      name: selectedProvider.name,
      type: selectedProvider.type as ProviderType,
      api_base_url: selectedProvider.api_base_url || '',
      platform_url: selectedProvider.platform_url || ''
    })
    setIsEditing(true)
  }

  return (
    <div className="h-full flex">
      {/* Left: Provider List */}
      <div 
        className="w-60 border-r flex flex-col"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="p-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Providers
          </span>
          <button
            onClick={() => {
              setForm({ 
                name: '', 
                type: 'openai', 
                api_base_url: PROVIDER_DEFAULTS.openai.api_base_url, 
                platform_url: PROVIDER_DEFAULTS.openai.platform_url 
              })
              setIsAdding(true)
            }}
            className="btn-primary text-xs px-3 py-1.5"
          >
            + Add
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="space-y-1">
            {providers.map((provider, index) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 animate-in"
                style={{
                  background: selectedProvider?.id === provider.id ? 'var(--accent-muted)' : 'transparent',
                  animationDelay: `${index * 30}ms`
                }}
                onMouseEnter={(e) => {
                  if (selectedProvider?.id !== provider.id) {
                    e.currentTarget.style.background = 'var(--bg-elevated)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedProvider?.id !== provider.id) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ 
                    background: selectedProvider?.id === provider.id ? 'var(--accent)' : 'var(--text-tertiary)'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium truncate"
                    style={{ 
                      color: selectedProvider?.id === provider.id ? 'var(--accent)' : 'var(--text-primary)'
                    }}
                  >
                    {provider.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {provider.type}
                  </p>
                </div>
              </button>
            ))}
            {providers.length === 0 && (
              <p className="px-3 py-6 text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
                No providers yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: Provider Details */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedProvider && !isEditing ? (
          <div className="max-w-xl animate-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 
                  className="text-xl font-semibold mb-1"
                  style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
                >
                  {selectedProvider.name}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {selectedProvider.type}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={startEditing} className="btn-secondary">
                  Edit
                </button>
                <button onClick={handleDeleteProvider} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="label">API Base URL</label>
                <p 
                  className="text-sm font-mono px-4 py-3 rounded-lg truncate"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  {selectedProvider.api_base_url || '—'}
                </p>
              </div>
              <div>
                <label className="label">Platform</label>
                <a
                  href={selectedProvider.platform_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm px-4 py-3 rounded-lg truncate transition-colors"
                  style={{ 
                    background: 'var(--bg-surface)', 
                    color: 'var(--accent)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {selectedProvider.platform_url || '—'}
                </a>
              </div>
            </div>

            {/* API Keys Section */}
            <div 
              className="rounded-xl p-5"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  API Keys
                </h3>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {apiKeys.filter(k => !k.isNew).length} saved
                </span>
              </div>
              
              <div className="space-y-4">
                {apiKeys.map((entry, index) => (
                  <div 
                    key={entry.id || `new-${index}`}
                    className="p-4 rounded-lg"
                    style={{ 
                      background: 'var(--bg-elevated)',
                      border: entry.isNew ? '1px dashed var(--border-default)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    {entry.isNew && (
                      <p className="text-xs font-medium mb-3" style={{ color: 'var(--accent)' }}>
                        + Add New Key
                      </p>
                    )}
                    
                    <div className="space-y-3">
                      {/* Label */}
                      <input
                        type="text"
                        value={entry.label}
                        onChange={(e) => updateKeyEntry(index, 'label', e.target.value)}
                        placeholder={entry.isNew ? "Key label (e.g., Production, Development)" : "Label"}
                        className="input-field text-sm"
                      />
                      
                      {/* API Key */}
                      <div className="relative">
                        <input
                          type={entry.showKey ? 'text' : 'password'}
                          value={entry.key}
                          onChange={(e) => updateKeyEntry(index, 'key', e.target.value)}
                          placeholder="Enter API key"
                          className="input-field pr-20 font-mono text-sm"
                        />
                        <button
                          onClick={() => updateKeyEntry(index, 'showKey', !entry.showKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded"
                          style={{ 
                            background: 'var(--bg-canvas)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {entry.showKey ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      
                      {/* Org ID (for OpenAI/Azure) */}
                      {(selectedProvider.type === 'openai' || selectedProvider.type === 'azure') && (
                        <input
                          type="text"
                          value={entry.orgId}
                          onChange={(e) => updateKeyEntry(index, 'orgId', e.target.value)}
                          placeholder="Organization ID (optional)"
                          className="input-field font-mono text-sm"
                        />
                      )}
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleSaveKey(index)} 
                          className="btn-primary text-sm"
                        >
                          {entry.isNew ? 'Add Key' : 'Save'}
                        </button>
                        {!entry.isNew && (
                          <button 
                            onClick={() => handleDeleteKey(index)} 
                            className="btn-ghost text-sm"
                            style={{ color: 'var(--error)' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : isEditing ? (
          <div className="max-w-xl animate-in">
            <h2 
              className="text-xl font-semibold mb-6"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              Edit Provider
            </h2>
            <div className="space-y-5">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">API Base URL</label>
                <input
                  type="text"
                  value={form.api_base_url}
                  onChange={(e) => setForm({ ...form, api_base_url: e.target.value })}
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="label">Platform URL</label>
                <input
                  type="text"
                  value={form.platform_url}
                  onChange={(e) => setForm({ ...form, platform_url: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdateProvider} className="btn-primary">Save Changes</button>
                <button onClick={() => setIsEditing(false)} className="btn-ghost">Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Select a provider or add a new one
            </p>
          </div>
        )}
      </div>

      {/* Add Provider Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div 
            className="w-full max-w-lg p-6 rounded-xl animate-in"
            style={{ 
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)'
            }}
          >
            <h2 
              className="text-xl font-semibold mb-6"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              Add Provider
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="label">Provider Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {PROVIDER_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleTypeChange(type.value)}
                      className="px-3 py-2.5 text-xs font-medium rounded-lg transition-all duration-150 active:scale-[0.97]"
                      style={{
                        background: form.type === type.value ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                        color: form.type === type.value ? 'var(--accent)' : 'var(--text-secondary)',
                        border: form.type === type.value ? '1px solid var(--accent)' : '1px solid var(--border-subtle)'
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Provider name"
                />
              </div>

              <div>
                <label className="label">API Base URL</label>
                <input
                  type="text"
                  value={form.api_base_url}
                  onChange={(e) => setForm({ ...form, api_base_url: e.target.value })}
                  className="input-field font-mono"
                />
              </div>

              <div>
                <label className="label">Platform URL</label>
                <input
                  type="text"
                  value={form.platform_url}
                  onChange={(e) => setForm({ ...form, platform_url: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleAddProvider} className="btn-primary flex-1">
                Add Provider
              </button>
              <button onClick={() => setIsAdding(false)} className="btn-ghost flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
