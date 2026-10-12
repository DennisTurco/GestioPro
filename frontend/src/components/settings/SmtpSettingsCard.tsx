import { useEffect, useState } from 'react'
import { SettingsAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import type { SmtpSecurity, SmtpSettings, SmtpSettingsRequest } from '../../types'

const SECURITY_OPTIONS: { value: SmtpSecurity, label: string, port: number }[] = [
  { value: 'StartTls', label: 'STARTTLS', port: 587 },
  { value: 'SslOnConnect', label: 'SSL/TLS', port: 465 },
  { value: 'Auto', label: 'Automatica', port: 587 },
  { value: 'None', label: 'Nessuna (sconsigliato)', port: 25 },
]
const DEFAULT_PORTS = SECURITY_OPTIONS.map(o => o.port)

interface FormState {
  host: string
  port: string
  security: SmtpSecurity
  username: string
  password: string
  hasPassword: boolean
  removePassword: boolean
}

function toForm(s: SmtpSettings): FormState {
  return {
    host: s.host ?? '',
    port: s.port?.toString() ?? '587',
    security: s.host ? s.security : 'StartTls',
    username: s.username ?? '',
    password: '',
    hasPassword: s.hasPassword,
    removePassword: false,
  }
}

// Admin only: the SMTP server used for the contract expiration emails.
// The saved password is never sent back by the API, only whether there is one.
export default function SmtpSettingsCard() {
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    SettingsAPI.getSmtp()
      .then(s => setForm(toForm(s)))
      .catch(() => showToast('Errore nel caricamento del server email', 'error'))
  }, [])

  if (!form) return null

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => prev && { ...prev, [key]: value })
  }

  function handleSecurityChange(security: SmtpSecurity) {
    // follow the standard port of the chosen security, unless a custom one was typed
    const port = DEFAULT_PORTS.includes(Number(form!.port))
      ? SECURITY_OPTIONS.find(o => o.value === security)!.port.toString()
      : form!.port
    setForm(prev => prev && { ...prev, security, port })
  }

  function toRequest(f: FormState): SmtpSettingsRequest {
    return {
      host: f.host.trim() || undefined,
      port: f.port ? Number(f.port) : undefined,
      security: f.security,
      username: f.username.trim() || undefined,
      // empty field = keep the saved password
      password: f.removePassword ? '' : (f.password || undefined),
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const saved = await SettingsAPI.updateSmtp(toRequest(form!))
      setForm(toForm(saved))
      showToast(saved.host ? 'Server email salvato' : 'Server email rimosso: le email non verranno inviate', 'success')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore durante il salvataggio', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    try {
      const { sentTo } = await SettingsAPI.testSmtp(toRequest(form!))
      showToast(`Email di prova inviata a ${sentTo}`, 'success')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Invio di prova fallito', 'error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="card mb-24">
      <div className="card-header">
        <i className="fa-solid fa-envelope" /> Server email
      </div>
      <div className="card-body">
        <p className="form-hint" style={{ marginTop: 0, marginBottom: 16 }}>
          Usato per inviare gli avvisi di scadenza dei contratti agli utenti con le notifiche email attive.
          Il mittente è l'email in "Azienda". Lascia vuoto il server per disattivare l'invio.
        </p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="smtp-host">Server SMTP</label>
            <input
              id="smtp-host"
              type="text"
              className="form-control"
              value={form.host}
              onChange={e => set('host', e.target.value)}
              placeholder="smtp.esempio.it"
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="smtp-port">Porta</label>
            <input
              id="smtp-port"
              type="number"
              className="form-control"
              value={form.port}
              onChange={e => set('port', e.target.value)}
              min={1}
              max={65535}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="smtp-security">Sicurezza</label>
          <select
            id="smtp-security"
            className="form-control"
            value={form.security}
            onChange={e => handleSecurityChange(e.target.value as SmtpSecurity)}
          >
            {SECURITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="smtp-username">Username</label>
            <input
              id="smtp-username"
              type="text"
              className="form-control"
              value={form.username}
              onChange={e => set('username', e.target.value)}
              placeholder="utente@esempio.it"
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="smtp-password">Password</label>
            <input
              id="smtp-password"
              type="password"
              className="form-control"
              value={form.password}
              disabled={form.removePassword}
              onChange={e => set('password', e.target.value)}
              placeholder={form.hasPassword ? '•••••••• (invariata)' : ''}
              autoComplete="new-password"
            />
            {form.hasPassword && (
              <label className="form-hint" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.removePassword}
                  onChange={e => setForm(prev => prev && { ...prev, removePassword: e.target.checked, password: '' })}
                />
                Rimuovi la password salvata
              </label>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleTest} disabled={testing || saving || !form.host.trim()}>
            <i className="fa-solid fa-paper-plane" />
            {testing ? ' Invio in corso...' : ' Invia email di prova'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || testing}>
            <i className="fa-solid fa-floppy-disk" />
            {saving ? ' Salvataggio...' : ' Salva server email'}
          </button>
        </div>
      </div>
    </div>
  )
}
