import { useState } from 'react'
import { useStore } from '../store/useStore'

export default function GeneralPage() {
  const { activeProfile, providers, showNotification } = useStore()
  const [exportContent, setExportContent] = useState('')
  const [showExport, setShowExport] = useState(false)

  const handleExportEnv = async () => {
    if (!activeProfile) return
    const content = await window.api.export.env(activeProfile.id)
    setExportContent(content)
    setShowExport(true)
  }

  const handleCopyExport = async () => {
    await navigator.clipboard.writeText(exportContent)
    showNotification('Copied to clipboard')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-2xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
        >
          General
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Overview and export options
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          className="p-5 rounded-xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Active Profile
          </p>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {activeProfile?.name || 'None'}
          </p>
        </div>
        <div 
          className="p-5 rounded-xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Providers
          </p>
          <p className="text-lg font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {providers.length}
          </p>
        </div>
      </div>

      {/* Configured Providers */}
      <div 
        className="rounded-xl mb-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Configured Providers
          </h2>
        </div>
        <div className="p-3">
          {providers.length === 0 ? (
            <p className="px-3 py-6 text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
              No providers configured. Go to Providers tab to add one.
            </p>
          ) : (
            <div className="space-y-1">
              {providers.map((provider, index) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg animate-in"
                  style={{ 
                    background: 'var(--bg-elevated)',
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {provider.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {provider.type}
                      </p>
                    </div>
                  </div>
                  <span 
                    className="text-xs font-medium px-2.5 py-1 rounded-md"
                    style={{ 
                      background: 'var(--success-muted)',
                      color: 'var(--success)'
                    }}
                  >
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div 
        className="rounded-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Export
          </h2>
        </div>
        <div className="p-5">
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Export API keys and settings as environment variables.
          </p>
          <button
            onClick={handleExportEnv}
            disabled={providers.length === 0}
            className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export as .env
          </button>

          {showExport && (
            <div className="mt-5 animate-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  Environment Variables
                </span>
                <button
                  onClick={handleCopyExport}
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  Copy
                </button>
              </div>
              <pre 
                className="p-4 rounded-lg text-sm overflow-x-auto code-block"
                style={{ 
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)'
                }}
              >
                {exportContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
