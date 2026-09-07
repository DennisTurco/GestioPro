import { Outlet, Navigate } from 'react-router-dom'
import { useState, useEffect, type MouseEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { NotificationAPI } from '../../services/api'
import type { Notification } from '../../types'
import Sidebar from './Sidebar'
import ToastContainer from '../ui/Toast'
import ErrorBoundary from '../ui/ErrorBoundary'
import Modal from '../ui/Modal'

const NOTIFICATION_DELETE_MIN_AGE_MS = 30 * 24 * 60 * 60 * 1000 // keep in sync with the 1-month rule in NotificationService.DeleteAsync

const REPORT_BUG_URL       = 'https://github.com/DennisTurco/GestioPro/issues/new?template=bug_report.yml'
const REQUEST_FEATURE_URL  = 'https://github.com/DennisTurco/GestioPro/issues/new?template=feature_request.yml'
const SUPPORT_PROJECT_URL  = 'https://github.com/sponsors/DennisTurco'

function getTheme() {
  const saved = localStorage.getItem('theme')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function Layout() {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [theme, setTheme] = useState(getTheme)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifPanelOpen, setNotifPanelOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (!user) return

    function fetchNotifications() {
      NotificationAPI.getAll()
        .then(setNotifications)
        .catch(() => { /* the bell just stays as-is - not worth a toast on every poll */ })
    }

    fetchNotifications()
    const intervalId = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(intervalId)
  }, [user])

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  function toggleNotifications() {
    setNotifPanelOpen(open => !open)
  }

  async function openNotification(notification: Notification) {
    setNotifPanelOpen(false)
    setSelectedNotification(notification)
    if (notification.isRead) return
    try {
      const updated = await NotificationAPI.markAsRead(notification.id)
      setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n))
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore nel segnare la notifica come letta', 'error')
    }
  }

  async function deleteNotification(e: MouseEvent, notification: Notification) {
    e.stopPropagation() // don't also trigger openNotification on the parent <li>
    try {
      await NotificationAPI.delete(notification.id)
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
      if (selectedNotification?.id === notification.id) setSelectedNotification(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Errore nell'eliminazione della notifica", 'error')
    }
  }

  function canDeleteNotification(notification: Notification) {
    return Date.now() - new Date(notification.creationDate).getTime() >= NOTIFICATION_DELETE_MIN_AGE_MS
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-actions">
            <a href={SUPPORT_PROJECT_URL} target="_blank" rel="noopener noreferrer"
               className="btn btn-ghost btn-sm btn-support" title="Supporta">
              <i className="fa-solid fa-heart" /> Supporta
            </a>
            <a href={REPORT_BUG_URL} target="_blank" rel="noopener noreferrer"
               className="btn btn-ghost btn-sm" title="Segnala bug">
              <i className="fa-solid fa-bug" /> Segnala bug
            </a>
            <a href={REQUEST_FEATURE_URL} target="_blank" rel="noopener noreferrer"
               className="btn btn-ghost btn-sm" title="Richiedi feature">
              <i className="fa-solid fa-lightbulb" /> Richiedi feature
            </a>
            <button className="btn btn-ghost btn-sm" onClick={toggleTheme} title="Cambia tema">
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
            </button>
          </div>
          <div className="notif-center" style={{ marginLeft: 'auto' }}>
            <button className="btn btn-ghost btn-sm" onClick={toggleNotifications} title="Centro notifiche">
              <i className="fa-solid fa-bell" />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {notifPanelOpen && (
              <>
                <div className="notif-backdrop" onClick={() => setNotifPanelOpen(false)} />
                <div className="notif-panel">
                  <div className="notif-panel-header"><i className='fa-solid fa-bell'/> Notifiche</div>
                  {notifications.length === 0 ? (
                    <div className="notif-empty text-muted">Nessuna notifica</div>
                  ) : (
                    <ul className="notif-list">
                      {[...notifications]
                        .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
                        .map(n => (
                        <li
                          key={n.id}
                          className={`notif-item${n.isRead ? '' : ' notif-item--unread'}`}
                          onClick={() => openNotification(n)}
                        >
                          {!n.isRead && <span className="notif-dot" />}
                          <div className="notif-item-text">
                            <span className="notif-summary">{n.summary}</span>
                            <span className="notif-date">{new Date(n.creationDate).toLocaleString('it-IT')}</span>
                          </div>
                          {canDeleteNotification(n) && (
                            <button
                              className="btn btn-ghost btn-sm notif-delete-btn"
                              title="Elimina notifica"
                              onClick={(e) => deleteNotification(e, n)}
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </header>
        <main className="page-body">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <ToastContainer />

      <Modal
        isOpen={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
        title={selectedNotification?.summary ?? ''}
        icon="fa-solid fa-bell"
        footer={<button className="btn btn-primary" onClick={() => setSelectedNotification(null)}>Chiudi</button>}
      >
        {selectedNotification && (
          <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginTop: 0 }}>
            {new Date(selectedNotification.creationDate).toLocaleString('it-IT')}
          </p>
        )}
        {selectedNotification?.description
          ? <p style={{ whiteSpace: 'pre-wrap' }}>{selectedNotification.description}</p>
          : <p className="text-muted">Nessun dettaglio aggiuntivo</p>}
      </Modal>
    </div>
  )
}
