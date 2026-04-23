export default function AboutPage() {
  const cliTools = [
    { name: 'Claude', version: '2.1.107', status: 'installed' as const },
    { name: 'Codex', version: '0.116.0', status: 'installed' as const },
    { name: 'Gemini', version: '0.20.0', status: 'installed' as const },
    { name: 'OpenCode', version: null, status: 'not_installed' as const },
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* App Info */}
      <div 
        className="p-6 rounded-xl mb-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="LLMHub" 
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div>
              <h1 
                className="text-xl font-semibold"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
              >
                LLMHub
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Version 1.0.1
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm">Release Notes</button>
            <button className="btn-primary text-sm">Check Updates</button>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Local macOS application for managing LLM API keys, configurations, and generating code examples. 
          All data stored locally with AES-256 encryption.
        </p>
      </div>

      {/* Environment Check */}
      <div 
        className="rounded-xl mb-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Local Environment
          </h2>
          <button 
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            ↻ Refresh
          </button>
        </div>
        <div className="p-4 grid grid-cols-4 gap-3">
          {cliTools.map((tool, index) => (
            <div
              key={tool.name}
              className="p-4 rounded-lg animate-in"
              style={{ 
                background: 'var(--bg-elevated)',
                border: `1px solid ${tool.status === 'installed' ? 'rgba(34, 197, 94, 0.25)' : 'var(--border-subtle)'}`,
                animationDelay: `${index * 50}ms`
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{'>'}_</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {tool.name}
                </span>
              </div>
              {tool.status === 'installed' ? (
                <p className="text-sm font-mono" style={{ color: 'var(--success)' }}>
                  {tool.version}
                </p>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  not installed
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Install Commands */}
      <div 
        className="rounded-xl mb-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Quick Install
          </h2>
        </div>
        <div className="p-5">
          <pre 
            className="p-4 rounded-lg overflow-x-auto code-block"
            style={{ 
              background: 'var(--bg-canvas)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
{`# Claude Code
curl -fsSL https://claude.ai/install.sh | bash

# Codex
npm i -g @openai/codex@latest

# Gemini CLI
npm i -g @google/gemini-cli@latest`}
          </pre>
        </div>
      </div>

      {/* Features */}
      <div 
        className="rounded-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Features
          </h2>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { icon: '⬡', title: 'Secure Storage', desc: 'AES-256-GCM encryption' },
            { icon: '◎', title: 'Multi-Profile', desc: 'Organize by project' },
            { icon: '◇', title: 'Code Gen', desc: 'Python, curl, JS snippets' },
            { icon: '●', title: 'Multi-Provider', desc: 'OpenAI, Anthropic, Google+' },
          ].map((feature, index) => (
            <div 
              key={feature.title}
              className="flex items-start gap-3 p-4 rounded-lg animate-in"
              style={{ 
                background: 'var(--bg-elevated)',
                animationDelay: `${index * 50}ms`
              }}
            >
              <span className="text-lg" style={{ color: 'var(--accent)' }}>{feature.icon}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Built with Electron + React + TypeScript
        </p>
      </div>
    </div>
  )
}
