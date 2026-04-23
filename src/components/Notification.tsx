import { useStore } from '../store/useStore'

export default function Notification() {
  const { notification, clearNotification } = useStore()

  if (!notification) return null

  return (
    <div className="notification-toast">
      <div 
        className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
        style={{ 
          background: notification.type === 'success' ? 'var(--success-muted)' : 'var(--danger-muted)',
          border: `1px solid ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: notification.type === 'success' ? 'var(--success)' : 'var(--danger)'
        }}
      >
        <span className="text-base">
          {notification.type === 'success' ? '✓' : '✕'}
        </span>
        <span className="text-sm font-medium">{notification.message}</span>
        <button 
          onClick={clearNotification}
          className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  )
}
