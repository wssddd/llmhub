import { useEffect } from 'react'
import { useStore } from './store/useStore'
import Sidebar from './components/Sidebar'
import Tabs from './components/Tabs'
import Notification from './components/Notification'
import GeneralPage from './pages/General'
import ProvidersPage from './pages/Providers'
import ModelsPage from './pages/Models'
import CodePage from './pages/Code'
import AboutPage from './pages/About'

export default function App() {
  const { activeTab, theme, loadProfiles, loadProviders, activeProfile } = useStore()

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  useEffect(() => {
    if (activeProfile) {
      loadProviders()
    }
  }, [activeProfile, loadProviders])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const renderPage = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralPage />
      case 'providers':
        return <ProvidersPage />
      case 'models':
        return <ModelsPage />
      case 'code':
        return <CodePage />
      case 'about':
        return <AboutPage />
      default:
        return <GeneralPage />
    }
  }

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-canvas)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Traffic light area + Tabs */}
        <div 
          className="h-[52px] drag-region flex items-end justify-between px-4 pb-2"
          style={{ background: 'var(--bg-canvas)' }}
        >
          <Tabs />
        </div>
        <main 
          className="flex-1 overflow-y-auto"
          style={{ background: 'var(--bg-canvas)' }}
        >
          {renderPage()}
        </main>
      </div>
      <Notification />
    </div>
  )
}
