import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClientiAPI, QuotationAPI } from '../services/api'
import type { Customer, CustomerRequest, Quotation } from '../types'
import { CustomerType, CUSTOMER_TYPE_LABEL } from '../types'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import EmptyState from '../components/ui/EmptyState'
import { getInitials,  avatarColor } from '../utils/user'


const COMPANY_TYPES = new Set<CustomerType>([
  CustomerType.Company,
  CustomerType.PublicAdmin,
  CustomerType.Freelancer,
])

const EMPTY_FORM: CustomerRequest = {
  customerType: CustomerType.Private,
  name: '',
  surname: '',
  email: '',
  phone: '',
  companyName: '',
  vatNumber: '',
  taxCode: '',
  country: '',
  region: '',
  province: '',
  city: '',
  address: '',
  landline: '',
  notes: '',
}

export default function Clienti() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [quotationCounts, setQuotationCounts] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CustomerRequest>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    document.title = 'Clienti - GestioPro'
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [cList, qList] = await Promise.all([
        ClientiAPI.getAll(),
        QuotationAPI.getAll(),
      ])
      setCustomers(cList)
      const counts: Record<number, number> = {}
      qList.forEach((q: Quotation) => {
        counts[q.customerId] = (counts[q.customerId] ?? 0) + 1
      })
      setQuotationCounts(counts)
    } catch {
      showToast('Errore nel caricamento dei clienti', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return customers
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.surname.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.companyName ?? '').toLowerCase().includes(q) ||
      (c.city ?? '').toLowerCase().includes(q),
    )
  }, [customers, search])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(c: Customer) {
    setEditingId(c.id)
    setForm({
      customerType: c.customerType,
      name: c.name,
      surname: c.surname,
      email: c.email,
      phone: c.phone ?? '',
      companyName: c.companyName ?? '',
      vatNumber: c.vatNumber ?? '',
      taxCode: c.taxCode ?? '',
      country: c.country ?? '',
      region: c.region ?? '',
      province: c.province ?? '',
      city: c.city ?? '',
      address: c.address ?? '',
      landline: c.landline ?? '',
      notes: c.notes ?? '',
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function setField<K extends keyof CustomerRequest>(key: K, value: CustomerRequest[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.name.trim() || !form.surname.trim() || !form.email.trim()) {
      showToast('Nome, cognome ed email sono obbligatori', 'warning')
      return
    }
    setSaving(true)
    try {
      if (editingId !== null) {
        const updated = await ClientiAPI.update(editingId, form)
        setCustomers(prev => prev.map(c => c.id === editingId ? updated : c))
        showToast('Cliente aggiornato', 'success')
      } else {
        const created = await ClientiAPI.create(form)
        setCustomers(prev => [...prev, created])
        showToast('Cliente creato', 'success')
      }
      closeModal()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore nel salvataggio', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (deleteId === null) return
    setDeleting(true)
    try {
      await ClientiAPI.delete(deleteId)
      setCustomers(prev => prev.filter(c => c.id !== deleteId))
      showToast('Cliente eliminato', 'success')
      setDeleteId(null)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Errore nell'eliminazione", 'error')
    } finally {
      setDeleting(false)
    }
  }

  function exportCsv() {
    const rows = [
      ['ID', 'Nome', 'Cognome', 'Email', 'Telefono', 'Città', 'Tipo'],
      ...filtered.map(c => [
        String(c.id),
        c.name,
        c.surname,
        c.email,
        c.phone ?? '',
        c.city ?? '',
        CUSTOMER_TYPE_LABEL[c.customerType] ?? '',
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clienti.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const showCompanyFields = COMPANY_TYPES.has(form.customerType)

  const deleteTarget = customers.find(c => c.id === deleteId)

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24,}}>
        <h1 style={{ margin: 0 }}> <i className="fa-solid fa-users" /> Clienti</h1>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={exportCsv} title="Esporta CSV">
            <i className="fa-solid fa-file-csv" /> Esporta CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <i className="fa-solid fa-circle-plus" /> Nuovo cliente
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input
            type="text"
            placeholder="Cerca per nome, email, città..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          message={search ? 'Nessun cliente trovato' : 'Nessun cliente presente'}
          actionLabel={search ? undefined : 'Aggiungi cliente'}
          onAction={search ? undefined : openCreate}
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Telefono</th>
                <th>Città</th>
                <th>Preventivi</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/clienti/${c.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="col-id">{c.id}</td>
                  <td>
                    <div className="customer-cell">
                      <div
                        className="avatar"
                        style={{ backgroundColor: avatarColor(c.id) }}
                      >
                        {getInitials(c.name, c.surname)}
                      </div>
                      <div className="customer-info">
                        <span className="customer-name">{c.name} {c.surname}</span>
                        {c.companyName && (
                          <span className="customer-company">{c.companyName}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{c.email}</td>
                  <td>{c.phone || '-'}</td>
                  <td>{c.city || '-'}</td>
                  <td>
                    <span className="badge badge-blue">
                      {quotationCounts[c.id] ?? 0}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="row-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Apri scheda"
                        onClick={() => navigate(`/clienti/${c.id}`)}
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square" />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Modifica"
                        onClick={() => openEdit(c)}
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-danger"
                        title="Elimina"
                        onClick={() => setDeleteId(c.id)}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId !== null ? 'Modifica cliente' : 'Nuovo cliente'}
        icon="fa-solid fa-user"
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>
              Annulla
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : editingId !== null ? 'Salva' : 'Crea'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group form-group-full">
            <label className="form-label">Tipo cliente</label>
            <select
              className="form-control"
              value={form.customerType}
              onChange={e => setField('customerType', Number(e.target.value) as CustomerType)}
            >
              {Object.entries(CUSTOMER_TYPE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nome <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="Nome"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cognome <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              value={form.surname}
              onChange={e => setField('surname', e.target.value)}
              placeholder="Cognome"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email <span className="required">*</span></label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={e => setField('email', e.target.value)}
              placeholder="email@esempio.it"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telefono</label>
            <input
              type="text"
              className="form-control"
              value={form.phone}
              onChange={e => setField('phone', e.target.value)}
              placeholder="+39 000 0000000"
            />
          </div>

          {showCompanyFields && (
            <>
              <div className="form-group">
                <label className="form-label">Ragione sociale</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.companyName}
                  onChange={e => setField('companyName', e.target.value)}
                  placeholder="Nome azienda"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Partita IVA</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.vatNumber}
                  onChange={e => setField('vatNumber', e.target.value)}
                  placeholder="IT00000000000"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Codice fiscale</label>
            <input
              type="text"
              className="form-control"
              value={form.taxCode}
              onChange={e => setField('taxCode', e.target.value)}
              placeholder="Codice fiscale"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telefono fisso</label>
            <input
              type="text"
              className="form-control"
              value={form.landline}
              onChange={e => setField('landline', e.target.value)}
              placeholder="+39 00 00000000"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Paese</label>
            <input
              type="text"
              className="form-control"
              value={form.country}
              onChange={e => setField('country', e.target.value)}
              placeholder="Italia"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Regione</label>
            <input
              type="text"
              className="form-control"
              value={form.region}
              onChange={e => setField('region', e.target.value)}
              placeholder="Regione"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Provincia</label>
            <input
              type="text"
              className="form-control"
              value={form.province}
              onChange={e => setField('province', e.target.value)}
              placeholder="MI"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Città</label>
            <input
              type="text"
              className="form-control"
              value={form.city}
              onChange={e => setField('city', e.target.value)}
              placeholder="Milano"
            />
          </div>

          <div className="form-group form-group-full">
            <label className="form-label">Indirizzo</label>
            <input
              type="text"
              className="form-control"
              value={form.address}
              onChange={e => setField('address', e.target.value)}
              placeholder="Via, numero civico"
            />
          </div>

          <div className="form-group form-group-full">
            <label className="form-label">Note</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              placeholder="Note aggiuntive..."
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={
          deleteTarget
            ? `Sei sicuro di voler eliminare il cliente ${deleteTarget.name} ${deleteTarget.surname}? L'operazione non è reversibile.`
            : 'Sei sicuro di voler eliminare questo cliente?'
        }
      />
    </div>
  )
}
