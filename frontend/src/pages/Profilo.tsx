import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/date'
import { getInitials,  avatarColor } from '../utils/user'
import { UserAPI } from '../services/user.api'
import { UserRequest } from '../types'

export default function Profilo() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const USER_FORM: UserRequest = {
    name: user?.name ?? '',
    surname: user?.surname ?? '',
    email: user?.email ?? '',
    username: user?.username ?? '',
  }

  const [infoForm, setInfoForm] = useState<UserRequest>(USER_FORM)

  const [pwForm, setPwForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })

  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault()
    if (!infoForm.name.trim() || !infoForm.surname.trim() || !infoForm.email.trim()) {
      showToast('Nome, cognome ed email sono obbligatori', 'warning')
      return
    }
    setSavingInfo(true)
    try {
        await UserAPI.updateProfile(user!.id, infoForm)
        showToast('Modifiche salvate con successo', 'success')
    } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Errore nel salvataggio', 'error')
    } finally {
        setSavingInfo(false)
    }
  }

  async function handleSavePw(e: React.FormEvent) {
    e.preventDefault()
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      showToast('Compila tutti i campi password', 'warning')
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      showToast('Le nuove password non coincidono', 'error')
      return
    }
    if (pwForm.next.length < 6) {
      showToast('La password deve essere di almeno 6 caratteri', 'warning')
      return
    }
    setSavingPw(true)
    try {
        await UserAPI.updateProfilePsw(user!.id, pwForm.current, pwForm.next)
        showToast('Password aggiornata con successo', 'success')
    } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Errore nel salvataggio', 'error')
    } finally {
        setSavingPw(false)
    }
    setPwForm({ current: '', next: '', confirm: '' })
  }

  const initials = user ? getInitials(user.name, user.surname) : 'U'
  const bgColor  = avatarColor(user?.username ?? 'user')

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="topbar-title">Profilo utente</h1>
      </div>

      <div className="profilo-layout">

        {/* ── HERO ── */}
        <div className="profilo-hero card">
          <div className="profilo-avatar-wrap">
            <div className="profilo-avatar" style={{ backgroundColor: bgColor }}>
              {initials}
            </div>
          </div>
          <div className="profilo-hero-info">
            <div className="profilo-fullname">{user?.name} {user?.surname}</div>
            <div className="profilo-username">@{user?.username}</div>
            <div className="profilo-email">
              <i className="fa-solid fa-envelope" /> {user?.email}
            </div>
          </div>
          {user?.createdDate && (
            <div className="profilo-since">
              <i className="fa-solid fa-calendar-check" /> Membro dal {formatDate(user.createdDate)}
            </div>
          )}
        </div>

        {/* ── INFORMAZIONI PERSONALI ── */}
        <form className="card" onSubmit={handleSaveInfo}>
          <div className="card-header">
            <i className="fa-solid fa-user-pen" /> Informazioni personali
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={infoForm.name}
                  onChange={e => setInfoForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Nome"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cognome <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={infoForm.surname}
                  onChange={e => setInfoForm(p => ({ ...p, surname: e.target.value }))}
                  placeholder="Cognome"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  value={infoForm.email}
                  onChange={e => setInfoForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="email@esempio.it"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={infoForm.username}
                  onChange={e => setInfoForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="username"
                />
              </div>
            </div>
          </div>
          <div className="card-footer">
            <button type="submit" className="btn btn-primary btn-sm" disabled={savingInfo}>
              {savingInfo ? <span className="spinner" /> : <i className="fa-solid fa-floppy-disk" />}
              {savingInfo ? ' Salvataggio...' : ' Salva modifiche'}
            </button>
          </div>
        </form>

        {/* ── SICUREZZA ── */}
        <form className="card" onSubmit={handleSavePw}>
          <div className="card-header">
            <i className="fa-solid fa-lock" /> Sicurezza
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password attuale</label>
                <input
                  type="password"
                  className="form-control"
                  value={pwForm.current}
                  onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nuova password</label>
                <input
                  type="password"
                  className="form-control"
                  value={pwForm.next}
                  onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Conferma nuova password</label>
                <input
                  type="password"
                  className="form-control"
                  value={pwForm.confirm}
                  onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>
          <div className="card-footer">
            <button type="submit" className="btn btn-primary btn-sm" disabled={savingPw}>
              {savingPw ? <span className="spinner" /> : <i className="fa-solid fa-key" />}
              {savingPw ? ' Salvataggio...' : ' Cambia password'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
