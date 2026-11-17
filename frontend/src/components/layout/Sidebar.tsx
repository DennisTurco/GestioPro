import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/user'
import { UserRole } from '../../types'

interface NavItem {
  path: string
  page: string
  icon: string
  label: string
  disabled?: boolean
  /** Altri percorsi che rendono attiva la voce (es. pagine di dettaglio) */
  extraPaths?: string[]
}

interface NavGroup {
  page: string
  icon: string
  label: string
  children: NavItem[]
}

const ADMIN_ITEMS: (NavItem | NavGroup)[] = [
  { path: '/utenti',       page: 'utenti',       icon: 'fa-solid fa-users-gear',     label: 'Utenti'       },
  {
    page: 'audit-group', icon: 'fa-solid fa-scroll', label: 'Audit',
    children: [
      { path: '/audit',         page: 'audit',         icon: 'fa-solid fa-pen-to-square',     label: 'Modifiche', extraPaths: ['/audit-details'] },
      { path: '/audit-accessi', page: 'audit-accessi', icon: 'fa-solid fa-right-to-bracket',  label: 'Accessi' },
    ],
  },
  { path: '/ripristino',   page: 'ripristino',   icon: 'fa-solid fa-rotate-left',    label: 'Ripristino',  disabled: true },
]

function isGroup(item: NavItem | NavGroup): item is NavGroup {
  return 'children' in item
}

const REPORT_ITEMS: NavItem[] = [
  { path: '/report',    page: 'report',  icon: 'fa-solid fa-chart-column',    label: 'Report', disabled: true},
]

const MAIN_ITEMS: NavItem[] = [
  { path: '/',            page: 'dashboard',   icon: 'fa-solid fa-chart-pie',      label: 'Dashboard'    },
  { path: '/clienti',     page: 'clienti',     icon: 'fa-solid fa-users',          label: 'Clienti'      },
  { path: '/preventivi',  page: 'preventivi',  icon: 'fa-solid fa-receipt',        label: 'Preventivi'   },
  { path: '/contratti',   page: 'contratti',   icon: 'fa-solid fa-file-contract',  label: 'Contratti'   },
  { path: '/fatture',     page: 'fatture',     icon: 'fa-solid fa-file-invoice',   label: 'Fatture',   disabled: true   },
  { path: '/calendario',  page: 'calendario',  icon: 'fa-solid fa-calendar-days',  label: 'Calendario',  disabled: true   },
]

const SERVICES_ITESM: NavItem[] = [
  { path: '/fornitori',   page: 'fornitori',    icon: 'fa-solid fa-truck-field',   label: 'Fornitori',  disabled: true    },
  { path: '/prodotti',    page: 'prodotti',    icon: 'fa-solid fa-box',            label: 'Prodotti e Servizi'     },
  { path: '/categorie',   page: 'categorie',   icon: 'fa-solid fa-tags',           label: 'Categorie'    },
]

const SYSTEM_ITEMS: NavItem[] = [
  { path: '/impostazioni', page: 'impostazioni', icon: 'fa-solid fa-gear', label: 'Impostazioni' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  function matchesPath(path: string) {
    if (path === '/') return location.pathname === '/'
    // Confronto per segmento: '/audit' non deve attivarsi su '/audit-accessi'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  function isActive(item: NavItem) {
    return [item.path, ...(item.extraPaths ?? [])].some(matchesPath)
  }

  function isGroupOpen(group: NavGroup) {
    // Aperto di default se contiene la pagina corrente, finché l'utente non lo chiude
    return openGroups[group.page] ?? group.children.some(isActive)
  }

  function toggleGroup(group: NavGroup) {
    setOpenGroups(prev => ({ ...prev, [group.page]: !isGroupOpen(group) }))
  }

  function renderItem(item: NavItem, extraClass = '') {
    const active = isActive(item) && !item.disabled
    return (
      <div
        key={item.page}
        className={`nav-item${extraClass}${active ? ' active' : ''}${item.disabled ? ' nav-item--disabled' : ''}`}
        onClick={item.disabled ? undefined : () => navigate(item.path)}
        title={item.disabled ? `${item.label} (coming soon)` : collapsed ? item.label : undefined}
      >
        <span className="nav-icon"><i className={item.icon} /></span>
        <span className="nav-label">{item.label}</span>
        {item.disabled && !collapsed && <span className="nav-soon">presto</span>}
      </div>
    )
  }

  function renderGroup(group: NavGroup) {
    const open = isGroupOpen(group)
    const childActive = group.children.some(c => isActive(c) && !c.disabled)
    return (
      <div key={group.page} className="nav-group">
        <div
          className={`nav-item nav-group-toggle${childActive && !open ? ' active' : ''}`}
          onClick={() => toggleGroup(group)}
          aria-expanded={open}
        >
          <span className="nav-icon"><i className={group.icon} /></span>
          <span className="nav-label">{group.label}</span>
          <i className={`nav-group-chevron fa-solid fa-chevron-down${open ? ' nav-group-chevron--open' : ''}`} />
        </div>
        <div className={`nav-subitems${open ? '' : ' nav-subitems--closed'}`}>
          {group.children.map(child => renderItem(child, ' nav-subitem'))}
        </div>
      </div>
    )
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
        {!collapsed && <span className="sidebar-beta-badge" title="Versione beta">BETA</span>}
        <button
          className="sidebar-toggle-btn"
          onClick={toggleCollapsed}
          title={collapsed ? 'Espandi sidebar' : 'Comprimi sidebar'}
        >
          <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {user?.userRole === UserRole.Admin && <>
        <div className="sidebar-section-label">Amministrazione</div>
        {ADMIN_ITEMS.map(item => isGroup(item) ? renderGroup(item) : renderItem(item))}
        </>}

        <div className="sidebar-section-label">Reportistica</div>
        {REPORT_ITEMS.map(item => renderItem(item))}

        <div className="sidebar-section-label">Menu principale</div>
        {MAIN_ITEMS.map(item => renderItem(item))}

        <div className="sidebar-section-label">Prodotti e Servizi</div>
        {SERVICES_ITESM.map(item => renderItem(item))}

        <div className="sidebar-section-label">Sistema</div>
        {SYSTEM_ITEMS.map(item => renderItem(item))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info" title={collapsed ? `${user?.username ?? ''} — ${user?.email ?? ''}` : undefined}>
          <div className="user-avatar">{user ? getInitials(user.name, user.surname) : 'U'}</div>
          <div className="user-details">
            <div className="user-username">{user?.username ?? ''}</div>
            <div className="user-email">{user?.email ?? ''}</div>
          </div>
          <button
            className="sidebar-profile-btn"
            onClick={() => navigate('/profilo')}
            title="Impostazioni profilo"
          >
            <i className="fa-solid fa-gear" />
          </button>
          <button
            className="sidebar-profile-btn"
            onClick={logout}
            title="Logout"
          >
            <i className="fa-solid fa-right-from-bracket" />
          </button>
        </div>
      </div>
    </aside>
  )
}
