import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClientiAPI, QuotationAPI, ProductAPI } from '../services/api'
import type { Customer, Quotation, Product } from '../types'
import { QUOTATION_STATUS_INFO } from '../types'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'
import { useToast } from '../context/ToastContext'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'

export default function Dashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [quickActionOpen, setQuickActionOpen] = useState(false)

  useEffect(() => {
    document.title = 'Dashboard - GestioPro'
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(false)
    Promise.all([
      ClientiAPI.getAll(),
      ProductAPI.getAll(),
      QuotationAPI.getAll(),
    ])
      .then(([c, p, q]) => {
        setCustomers(c)
        setProducts(p)
        setQuotations(q)
      })
      .catch(() => {
        setError(true)
        showToast('Impossibile caricare i dati della dashboard', 'error')
      })
      .finally(() => setLoading(false))
  }, [])

  const recentCustomers = [...customers].reverse().slice(0, 5)
  const recentProducts = [...products].reverse().slice(0, 5)
  const recentQuotations = [...quotations].reverse().slice(0, 5)

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '64px 0' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center" style={{ padding: '64px 0' }}>
        <p className="text-muted">Non raggiungibile</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setQuickActionOpen(true)}>
          <i className="fa-solid fa-bolt" style={{ marginRight: 6 }} />
          Azione rapida
        </button>
      </div>

      <div className="grid-4 mb-24">
        <div className="kpi-card">
          <div className="kpi-icon"><i className="fa-solid fa-users" /></div>
          <div className="kpi-label">Clienti totali</div>
          <div className="kpi-value">{customers.length}</div>
          <div className="kpi-delta">&nbsp;</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><i className="fa-solid fa-euro-sign" /></div>
          <div className="kpi-label">Fatturato mese</div>
          <div className="kpi-value">{formatCurrency(0)}</div>
          <div className="kpi-delta">&nbsp;</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><i className="fa-solid fa-file-invoice" /></div>
          <div className="kpi-label">Fatture aperte</div>
          <div className="kpi-value">0</div>
          <div className="kpi-delta">&nbsp;</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><i className="fa-solid fa-file-contract" /></div>
          <div className="kpi-label">Preventivi totali</div>
          <div className="kpi-value">{quotations.length}</div>
          <div className="kpi-delta">&nbsp;</div>
        </div>
      </div>

      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <span>Clienti recenti</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/clienti')}>
              Vedi tutti
            </button>
          </div>
          {recentCustomers.length === 0 ? (
            <EmptyState message="Nessun cliente ancora" actionLabel="Aggiungi cliente" onAction={() => navigate('/clienti')} />
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <tbody>
                  {recentCustomers.map(c => (
                    <tr
                      key={c.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/clienti/${c.id}`)}
                    >
                      <td style={{ width: 40 }}>
                        <div className="avatar">
                          {(c.name?.[0] ?? '').toUpperCase()}{(c.surname?.[0] ?? '').toUpperCase()}
                        </div>
                      </td>
                      <td>
                        <strong>{c.name} {c.surname}</strong>
                        {c.companyName && <div className="text-muted" style={{ fontSize: '0.8em' }}>{c.companyName}</div>}
                      </td>
                      <td className="text-muted">{c.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span>Prodotti recenti</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/prodotti')}>
              Vedi tutti
            </button>
          </div>
          {recentProducts.length === 0 ? (
            <EmptyState message="Nessun prodotto ancora" actionLabel="Aggiungi prodotto" onAction={() => navigate('/prodotti')} />
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <tbody>
                  {recentProducts.map(p => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <div className="text-muted" style={{ fontSize: '0.8em' }}>{p.code}</div>
                      </td>
                      <td className="text-muted">{p.categoryName}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-24">
        <div className="card-header">
          <span>Ultimi Preventivi</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/preventivi')}>
            Vedi tutti
          </button>
        </div>
        {recentQuotations.length === 0 ? (
          <EmptyState message="Nessun preventivo ancora" actionLabel="Crea preventivo" onAction={() => navigate('/preventivi')} />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N° Preventivo</th>
                  <th>Titolo</th>
                  <th>Cliente</th>
                  <th>Importo</th>
                  <th>Data emissione</th>
                  <th>Scadenza</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotations.map(q => {
                  const statusInfo = QUOTATION_STATUS_INFO[q.quotationStatus]
                  return (
                    <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/preventivi')}>
                      <td><strong>{q.number}</strong></td>
                      <td>{q.title}</td>
                      <td>{q.customerName}</td>
                      <td>{formatCurrency(q.amount)}</td>
                      <td>{formatDate(q.issueDate)}</td>
                      <td>{formatDate(q.validityDate)}</td>
                      <td>
                        <Badge text={statusInfo.text} cls={statusInfo.cls} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        title="Azione rapida"
        icon="fa-solid fa-bolt"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="btn btn-primary"
            onClick={() => { setQuickActionOpen(false); navigate('/clienti') }}
          >
            <i className="fa-solid fa-user-plus" style={{ marginRight: 8 }} />
            Nuovo cliente
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { setQuickActionOpen(false); navigate('/preventivi') }}
          >
            <i className="fa-solid fa-file-contract" style={{ marginRight: 8 }} />
            Nuovo preventivo
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { setQuickActionOpen(false); navigate('/prodotti') }}
          >
            <i className="fa-solid fa-box" style={{ marginRight: 8 }} />
            Nuovo prodotto
          </button>
        </div>
      </Modal>
    </div>
  )
}
