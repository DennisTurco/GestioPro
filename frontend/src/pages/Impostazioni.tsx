import { useEffect, useState } from 'react'
import { SettingsAPI, ClientiAPI } from '../services/api'
import type { Setting } from '../types'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const SETTING_CODES = [
  'CompanyName',
  'VatNumber',
  'Email',
  'Phone',
  'Address',
  'Website',
  'VatPercentage',
  'ExpirationDays',
  'QuotationNotes',
]

export default function Impostazioni() {
  const { showToast } = useToast()
  const { user } = useAuth()

  const [values, setValues] = useState<Record<string, string>>({})
  const [original, setOriginal] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    document.title = 'Impostazioni - GestioPro'
    SettingsAPI.getAll()
      .then((settings: Setting[]) => {
        const map: Record<string, string> = {}
        for (const s of settings) {
          if (SETTING_CODES.includes(s.code)) {
            map[s.code] = s.value ?? ''
          }
        }
        setValues(map)
        setOriginal(map)
      })
      .catch(() => showToast('Errore nel caricamento delle impostazioni', 'error'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(code: string, value: string) {
    setValues(prev => ({ ...prev, [code]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const changed = SETTING_CODES.filter(code => values[code] !== original[code])
      await Promise.all(changed.map(code => SettingsAPI.update(code, values[code] ?? '')))
      setOriginal({ ...values })
      showToast('Impostazioni salvate con successo', 'success')
    } catch {
      showToast('Errore durante il salvataggio', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleTestConnection() {
    setTesting(true)
    try {
      await ClientiAPI.getAll()
      showToast('Connessione API riuscita', 'success')
    } catch {
      showToast('Connessione API fallita', 'error')
    } finally {
      setTesting(false)
    }
  }

  function field(code: string) {
    return values[code] ?? ''
  }

  if (loading) {
    return (
      <div className="page-body">
        <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="page-body">
      <div style={{ maxWidth: 720 }}>

        <div className="card mb-24">
          <div className="card-header">
            <i className="fa-solid fa-building" /> Azienda
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label" htmlFor="sett-CompanyName">Nome azienda</label>
              <input
                id="sett-CompanyName"
                type="text"
                className="form-control"
                value={field('CompanyName')}
                onChange={e => handleChange('CompanyName', e.target.value)}
                placeholder="Nome o ragione sociale"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sett-VatNumber">Partita IVA</label>
              <input
                id="sett-VatNumber"
                type="text"
                className="form-control"
                value={field('VatNumber')}
                onChange={e => handleChange('VatNumber', e.target.value)}
                placeholder="IT01234567890"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sett-Email">Email</label>
              <input
                id="sett-Email"
                type="email"
                className="form-control"
                value={field('Email')}
                onChange={e => handleChange('Email', e.target.value)}
                placeholder="azienda@esempio.it"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sett-Phone">Telefono</label>
              <input
                id="sett-Phone"
                type="text"
                className="form-control"
                value={field('Phone')}
                onChange={e => handleChange('Phone', e.target.value)}
                placeholder="+39 333 000 0000"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sett-Address">Indirizzo</label>
              <input
                id="sett-Address"
                type="text"
                className="form-control"
                value={field('Address')}
                onChange={e => handleChange('Address', e.target.value)}
                placeholder="Via Roma 1, Milano"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sett-Website">Sito web</label>
              <input
                id="sett-Website"
                type="text"
                className="form-control"
                value={field('Website')}
                onChange={e => handleChange('Website', e.target.value)}
                placeholder="https://www.esempio.it"
              />
            </div>
          </div>
        </div>

        <div className="card mb-24">
          <div className="card-header">
            <i className="fa-solid fa-receipt" /> Preventivi
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label" htmlFor="sett-VatPercentage">IVA predefinita %</label>
              <input
                id="sett-VatPercentage"
                type="number"
                className="form-control"
                value={field('VatPercentage')}
                onChange={e => handleChange('VatPercentage', e.target.value)}
                placeholder="22"
                min={0}
                max={100}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sett-ExpirationDays">Giorni di validita</label>
              <input
                id="sett-ExpirationDays"
                type="number"
                className="form-control"
                value={field('ExpirationDays')}
                onChange={e => handleChange('ExpirationDays', e.target.value)}
                placeholder="30"
                min={1}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sett-QuotationNotes">Note standard preventivo</label>
              <textarea
                id="sett-QuotationNotes"
                className="form-control"
                value={field('QuotationNotes')}
                onChange={e => handleChange('QuotationNotes', e.target.value)}
                placeholder="Note predefinite da includere nei preventivi..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="card mb-24">
          <div className="card-header">
            <i className="fa-solid fa-gear" /> Sistema
          </div>
          <div className="card-body">
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0', color: 'var(--text-secondary)', width: 160 }}>Server</td>
                  <td style={{ padding: '6px 0', fontFamily: 'monospace', fontSize: 13 }}>{window.location.origin}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Versione</td>
                  <td style={{ padding: '6px 0' }}>1.0.0</td>
                </tr>
                {user && (
                  <>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Utente</td>
                      <td style={{ padding: '6px 0' }}>{user.name} {user.surname}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Username</td>
                      <td style={{ padding: '6px 0' }}>{user.username}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Email utente</td>
                      <td style={{ padding: '6px 0' }}>{user.email}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleTestConnection}
              disabled={testing}
            >
              <i className="fa-solid fa-plug" />
              {testing ? ' Test in corso...' : ' Test connessione API'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <i className="fa-solid fa-floppy-disk" />
            {saving ? ' Salvataggio...' : ' Salva tutto'}
          </button>
        </div>

      </div>
    </div>
  )
}
