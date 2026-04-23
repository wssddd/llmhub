import { useStore } from '../store/useStore'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useStore()

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-95"
      style={{ 
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)'
      }}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="text-sm">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  )
}
