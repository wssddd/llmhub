import { useStore } from '../store/useStore'

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'providers', label: 'Providers' },
  { id: 'models', label: 'Models' },
  { id: 'code', label: 'Code' },
  { id: 'about', label: 'About' },
] as const

export default function Tabs() {
  const { activeTab, setActiveTab } = useStore()

  return (
    <div className="flex items-center gap-1 no-drag">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 active:scale-[0.97]"
          style={{
            background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
            border: activeTab === tab.id ? '1px solid var(--border-default)' : '1px solid transparent'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.color = 'var(--text-secondary)'
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.color = 'var(--text-tertiary)'
            }
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
