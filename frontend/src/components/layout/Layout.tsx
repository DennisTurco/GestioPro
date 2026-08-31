import { Outlet, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import ToastContainer from '../ui/Toast'
import ErrorBoundary from '../ui/ErrorBoundary'

const REPORT_BUG_URL       = 'https://github.com/DennisTurco/GestioPro/issues/new?template=bug_report.md'
const REQUEST_FEATURE_URL  = 'https://github.com/DennisTurco/GestioPro/issues/new?template=feature_request.md'
const SUPPORT_PROJECT_URL  = 'https://github.com/sponsors/DennisTurco'

function getTheme() {
  const saved = localStorage.getItem('theme')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function Layout() {
  const { user, loading } = useAuth()
  const [theme, setTheme] = useState(getTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

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
        </header>
        <main className="page-body">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
