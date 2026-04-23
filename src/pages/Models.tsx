import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { DEFAULT_MODELS } from '../types'
import type { Model, ProviderType } from '../types'

export default function ModelsPage() {
  const { providers, models, loadModels, showNotification } = useStore()
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  const [form, setForm] = useState({
    name: '',
    display_name: '',
    input_cost: 0,
    output_cost: 0,
    max_tokens: 4096,
    context_window: 128000
  })

  const selectedProvider = providers.find(p => p.id === selectedProviderId) || null

  useEffect(() => {
    if (providers.length > 0 && !selectedProviderId) {
      setSelectedProviderId(providers[0].id)
    }
  }, [providers, selectedProviderId])

  useEffect(() => {
    if (selectedProviderId) {
      loadModels(selectedProviderId)
    }
  }, [selectedProviderId, loadModels])

  const handleAddModel = async () => {
    if (!selectedProviderId || !form.name) return
    await window.api.models.create({
      provider_id: selectedProviderId,
      name: form.name,
      display_name: form.display_name || form.name,
      input_cost: form.input_cost,
      output_cost: form.output_cost,
      max_tokens: form.max_tokens,
      context_window: form.context_window
    })
    await loadModels(selectedProviderId)
    setIsAdding(false)
    resetForm()
    showNotification('Model added successfully')
  }

  const handleUpdateModel = async () => {
    if (!editingModel || !selectedProviderId) return
    await window.api.models.update(editingModel.id, {
      name: form.name,
      display_name: form.display_name,
      input_cost: form.input_cost,
      output_cost: form.output_cost,
      max_tokens: form.max_tokens,
      context_window: form.context_window
    })
    await loadModels(selectedProviderId)
    setIsEditing(false)
    setEditingModel(null)
    resetForm()
    showNotification('Model updated successfully')
  }

  const handleDeleteModel = async (model: Model) => {
    if (!selectedProviderId) return
    if (confirm(`Delete "${model.display_name || model.name}"?`)) {
      await window.api.models.delete(model.id)
      await loadModels(selectedProviderId)
      showNotification('Model deleted')
    }
  }

  const handleAutoFetch = async () => {
    if (!selectedProvider || !selectedProviderId) return
    
    setIsFetching(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const providerType = selectedProvider.type as ProviderType
    const defaultModels = DEFAULT_MODELS[providerType] || []
    
    let addedCount = 0
    for (const model of defaultModels) {
      const exists = models.some(m => m.name === model.name)
      if (!exists) {
        await window.api.models.create({
          provider_id: selectedProviderId,
          name: model.name,
          display_name: model.display_name,
          input_cost: model.input_cost,
          output_cost: model.output_cost,
          max_tokens: null,
          context_window: model.context_window
        })
        addedCount++
      }
    }
    
    await loadModels(selectedProviderId)
    setIsFetching(false)
    showNotification(addedCount > 0 ? `Added ${addedCount} models` : 'No new models to add')
  }

  const startEditing = (model: Model) => {
    setForm({
      name: model.name,
      display_name: model.display_name || '',
      input_cost: model.input_cost,
      output_cost: model.output_cost,
      max_tokens: model.max_tokens || 4096,
      context_window: model.context_window || 128000
    })
    setEditingModel(model)
    setIsEditing(true)
  }

  const resetForm = () => {
    setForm({
      name: '',
      display_name: '',
      input_cost: 0,
      output_cost: 0,
      max_tokens: 4096,
      context_window: 128000
    })
  }

  const formatCost = (cost: number) => {
    return cost === 0 ? '—' : `$${cost.toFixed(2)}`
  }

  return (
    <div className="h-full flex">
      {/* Left: Provider List */}
      <div 
        className="w-52 border-r flex flex-col"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Providers
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="space-y-1">
            {providers.length === 0 ? (
              <p className="px-3 py-6 text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
                No providers
              </p>
            ) : (
              providers.map((provider, index) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProviderId(provider.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 animate-in"
                  style={{
                    background: selectedProviderId === provider.id ? 'var(--accent-muted)' : 'transparent',
                    animationDelay: `${index * 30}ms`
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProviderId !== provider.id) {
                      e.currentTarget.style.background = 'var(--bg-elevated)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProviderId !== provider.id) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <span 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ 
                      background: selectedProviderId === provider.id ? 'var(--accent)' : 'var(--text-tertiary)'
                    }}
                  />
                  <span 
                    className="text-sm font-medium truncate"
                    style={{ 
                      color: selectedProviderId === provider.id ? 'var(--accent)' : 'var(--text-primary)'
                    }}
                  >
                    {provider.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right: Models Table */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedProvider ? (
          <>
            {/* Header */}
            <div 
              className="px-5 py-4 flex items-center justify-between border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedProvider.name}
                </h2>
                <span 
                  className="text-xs font-medium px-2 py-1 rounded-md tabular-nums"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}
                >
                  {models.length} models
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoFetch}
                  disabled={isFetching}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  {isFetching ? (
                    <>
                      <span className="animate-spin">◌</span>
                      Fetching...
                    </>
                  ) : (
                    <>↻ Auto-fetch</>
                  )}
                </button>
                <button
                  onClick={() => {
                    resetForm()
                    setIsAdding(true)
                  }}
                  className="btn-primary text-sm"
                >
                  + Add Model
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Model</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>Input $/1M</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>Output $/1M</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>Context</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model, index) => (
                    <tr 
                      key={model.id} 
                      className="animate-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {model.display_name || model.name}
                          </p>
                          <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                            {model.name}
                          </p>
                        </div>
                      </td>
                      <td className="text-right font-mono tabular-nums text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {formatCost(model.input_cost)}
                      </td>
                      <td className="text-right font-mono tabular-nums text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {formatCost(model.output_cost)}
                      </td>
                      <td className="text-right tabular-nums text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {model.context_window ? `${(model.context_window / 1000).toFixed(0)}K` : '—'}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => startEditing(model)}
                          className="text-sm mr-3 transition-colors"
                          style={{ color: 'var(--accent)' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteModel(model)}
                          className="text-sm transition-colors"
                          style={{ color: 'var(--danger)' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {models.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-16">
                        <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>
                          No models configured
                        </p>
                        <button
                          onClick={handleAutoFetch}
                          className="text-sm font-medium transition-colors"
                          style={{ color: 'var(--accent)' }}
                        >
                          Auto-fetch default models
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Add a provider first
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || isEditing) && (
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
              {isAdding ? 'Add Model' : 'Edit Model'}
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="label">Model ID *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field font-mono"
                  placeholder="gpt-4o, claude-3-opus, etc."
                />
              </div>

              <div>
                <label className="label">Display Name</label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  className="input-field"
                  placeholder="GPT-4o, Claude 3 Opus, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Input $/1M</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.input_cost}
                    onChange={(e) => setForm({ ...form, input_cost: parseFloat(e.target.value) || 0 })}
                    className="input-field tabular-nums"
                  />
                </div>
                <div>
                  <label className="label">Output $/1M</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.output_cost}
                    onChange={(e) => setForm({ ...form, output_cost: parseFloat(e.target.value) || 0 })}
                    className="input-field tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Max Tokens</label>
                  <input
                    type="number"
                    value={form.max_tokens}
                    onChange={(e) => setForm({ ...form, max_tokens: parseInt(e.target.value) || 4096 })}
                    className="input-field tabular-nums"
                  />
                </div>
                <div>
                  <label className="label">Context Window</label>
                  <input
                    type="number"
                    value={form.context_window}
                    onChange={(e) => setForm({ ...form, context_window: parseInt(e.target.value) || 128000 })}
                    className="input-field tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={isAdding ? handleAddModel : handleUpdateModel}
                className="btn-primary flex-1"
                disabled={!form.name}
              >
                {isAdding ? 'Add Model' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setIsEditing(false)
                  setEditingModel(null)
                  resetForm()
                }}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
