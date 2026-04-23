import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { generatePythonCode, generateCurlCode, generateJavaScriptCode, generateStreamingPythonCode } from '../lib/codegen'
import type { Provider, Model } from '../types'

type Language = 'python' | 'curl' | 'javascript' | 'streaming'

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'curl', label: 'cURL' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'streaming', label: 'Streaming' },
]

export default function CodePage() {
  const { providers, models, loadModels, showNotification } = useStore()
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [language, setLanguage] = useState<Language>('python')
  const [apiKey, setApiKey] = useState('')
  const [prompt, setPrompt] = useState('Hello, how are you?')
  const [code, setCode] = useState('')

  useEffect(() => {
    if (providers.length > 0 && !selectedProvider) {
      setSelectedProvider(providers[0])
    }
  }, [providers, selectedProvider])

  useEffect(() => {
    if (selectedProvider) {
      loadModels(selectedProvider.id)
      loadApiKey(selectedProvider.id)
    }
  }, [selectedProvider, loadModels])

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0])
    } else if (models.length > 0 && selectedModel) {
      const found = models.find(m => m.id === selectedModel.id)
      if (!found) setSelectedModel(models[0])
    }
  }, [models, selectedModel])

  useEffect(() => {
    generateCode()
  }, [selectedProvider, selectedModel, language, apiKey, prompt])

  const loadApiKey = async (providerId: number) => {
    const keyData = await window.api.apikeys.get(providerId)
    setApiKey(keyData?.key || 'YOUR_API_KEY')
  }

  const generateCode = () => {
    if (!selectedProvider || !selectedModel) {
      setCode('// Select a provider and model')
      return
    }

    const options = {
      provider: selectedProvider,
      model: selectedModel,
      apiKey: apiKey || 'YOUR_API_KEY',
      prompt
    }

    switch (language) {
      case 'python':
        setCode(generatePythonCode(options))
        break
      case 'curl':
        setCode(generateCurlCode(options))
        break
      case 'javascript':
        setCode(generateJavaScriptCode(options))
        break
      case 'streaming':
        setCode(generateStreamingPythonCode(options))
        break
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    showNotification('Code copied to clipboard')
  }

  return (
    <div className="h-full flex">
      {/* Left: Configuration */}
      <div 
        className="w-72 border-r flex flex-col overflow-y-auto"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="p-5 space-y-6">
          {/* Provider */}
          <div>
            <label className="label">Provider</label>
            <select
              value={selectedProvider?.id || ''}
              onChange={(e) => {
                const provider = providers.find(p => p.id === Number(e.target.value))
                setSelectedProvider(provider || null)
                setSelectedModel(null)
              }}
              className="input-field"
            >
              <option value="">Select provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="label">Model</label>
            <select
              value={selectedModel?.id || ''}
              onChange={(e) => {
                const model = models.find(m => m.id === Number(e.target.value))
                setSelectedModel(model || null)
              }}
              className="input-field"
              disabled={!selectedProvider}
            >
              <option value="">Select model</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.display_name || model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="label">Language</label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 active:scale-[0.97]"
                  style={{
                    background: language === lang.id ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                    color: language === lang.id ? 'var(--accent)' : 'var(--text-secondary)',
                    border: language === lang.id ? '1px solid var(--accent)' : '1px solid var(--border-subtle)'
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="label">Test Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input-field h-24 resize-none"
              placeholder="Enter a test prompt"
            />
          </div>

          {/* Model Info */}
          {selectedModel && (
            <div 
              className="p-4 rounded-lg"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                Pricing
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-tertiary)' }}>Input</span>
                  <span className="font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {selectedModel.input_cost === 0 ? 'Free' : `$${selectedModel.input_cost}/1M`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-tertiary)' }}>Output</span>
                  <span className="font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {selectedModel.output_cost === 0 ? 'Free' : `$${selectedModel.output_cost}/1M`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-tertiary)' }}>Context</span>
                  <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {selectedModel.context_window ? `${(selectedModel.context_window / 1000).toFixed(0)}K` : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Code Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div 
          className="px-5 py-3 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {LANGUAGES.find(l => l.id === language)?.label}
          </span>
          <button
            onClick={handleCopy}
            className="btn-secondary text-sm"
          >
            Copy Code
          </button>
        </div>

        {/* Code */}
        <div 
          className="flex-1 overflow-auto p-5"
          style={{ background: 'var(--bg-canvas)' }}
        >
          <pre className="code-block" style={{ color: 'var(--text-secondary)' }}>
            {code}
          </pre>
        </div>

        {/* Footer Tips */}
        <div 
          className="px-5 py-3 border-t"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {language === 'python' && 'pip install openai anthropic google-generativeai'}
            {language === 'javascript' && 'npm install openai @anthropic-ai/sdk @google/generative-ai'}
            {language === 'curl' && 'Pipe output to jq for formatting: curl ... | jq'}
            {language === 'streaming' && 'Streaming requires SDK support'}
          </p>
        </div>
      </div>
    </div>
  )
}
