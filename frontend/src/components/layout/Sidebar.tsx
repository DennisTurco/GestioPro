import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/user'

interface NavItem {
  path: string
  page: string
  icon: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { path: '/',            page: 'dashboard',   icon: 'fa-solid fa-chart-pie',      label: 'Dashboard'    },
  { path: '/clienti',     page: 'clienti',     icon: 'fa-solid fa-users',          label: 'Clienti'      },
  { path: '/preventivi',  page: 'preventivi',  icon: 'fa-solid fa-receipt',        label: 'Preventivi'   },
  { path: '/contratti',   page: 'contratti',   icon: 'fa-solid fa-file-contract',  label: 'Contratti'   },
]

const SERVICES_ITESM: NavItem[] = [
  { path: '/prodotti',    page: 'prodotti',    icon: 'fa-solid fa-box',            label: 'Prodotti'     },
  { path: '/categorie',   page: 'categorie',   icon: 'fa-solid fa-tags',           label: 'Categorie'    },
]

const SYSTEM_ITEMS: NavItem[] = [
  { path: '/impostazioni', page: 'impostazioni', icon: 'fa-solid fa-gear', label: 'Impostazioni' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true')

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  function toggleCollapsed() {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon"><img src="/icon.svg" alt="logo" /></div>
        <span className="sidebar-logo-text">GestioPro</span>
        <button
          className="sidebar-toggle-btn"
          onClick={toggleCollapsed}
          title={collapsed ? 'Espandi sidebar' : 'Comprimi sidebar'}
        >
          <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu principale</div>
        {NAV_ITEMS.map(item => (
          <div
            key={item.page}
            className={`nav-item${isActive(item.path) ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon"><i className={item.icon} /></span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}

        <div className="sidebar-section-label">Prodotti e Servizi</div>
        {SERVICES_ITESM.map(item => (
          <div
            key={item.page}
            className={`nav-item${isActive(item.path) ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon"><i className={item.icon} /></span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}

        <div className="sidebar-section-label">Sistema</div>
        {SYSTEM_ITEMS.map(item => (
          <div
            key={item.page}
            className={`nav-item${isActive(item.path) ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon"><i className={item.icon} /></span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info" title={collapsed ? `${user?.username ?? ''} — ${user?.email ?? ''}` : undefined}>
          <div className="user-avatar">{user ? getInitials(user.name, user.surname) : 'U'}</div>
          <div className="user-details">
            <div className="font-medium user-username" style={{ color: '#E2E8F0', fontSize: 13 }}>
              {user?.username ?? ''}
            </div>
            <div style={{ fontSize: 11 }} className="user-email">{user?.email ?? ''}</div>
          </div>
          <button
            className="sidebar-profile-btn"
            onClick={() => navigate('/profilo')}
            title="Impostazioni profilo"
          >
            <i className="fa-solid fa-gear" />
          </button>
        </div>
      </div>
    </aside>
  )
}
