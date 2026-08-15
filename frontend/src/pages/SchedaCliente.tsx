import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ClientiAPI, QuotationAPI } from '../services/api'
import type { Customer, CustomerRequest, Quotation, QuotationRequest } from '../types'
import { QuotationStatus, QUOTATION_STATUS_INFO, CustomerType, CUSTOMER_TYPE_LABEL } from '../types'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Badge from '../components/ui/Badge'

type Tab = 'preventivi' | 'note'
type QuotationFilter = 'all' | QuotationStatus

export default function SchedaCliente() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('preventivi')
  const [quotationFilter, setQuotationFilter] = useState<QuotationFilter>('all')

  const [note, setNote] = useState('')
  const [noteInterne, setNoteInterne] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<CustomerRequest>>({})
  const [editSaving, setEditSaving] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [quotationModalOpen, setQuotationModalOpen] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null)
  const [quotationForm, setQuotationForm] = useState<Partial<QuotationRequest & { issueDate: string; validityDate: string }>>({})
  const [quotationSaving, setQuotationSaving] = useState(false)

  const [deleteQuotationModalOpen, setDeleteQuotationModalOpen] = useState(false)
  const [deletingQuotationId, setDeletingQuotationId] = useState<number | null>(null)
  const [deleteQuotationLoading, setDeleteQuotationLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    const numId = Number(id)
    setLoading(true)
    Promise.all([ClientiAPI.getById(numId), QuotationAPI.getAll()])
      .then(([c, qs]) => {
        setCustomer(c)
        setQuotations(qs.filter(q => q.customerId === numId))
        setNote(c.notes ?? '')
        document.title = `${c.name} ${c.surname} - GestioPro`
      })
      .catch(() => showToast('Impossibile caricare i dati del cliente', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  function openNewQuotation() {
    QuotationAPI.getNextNumber()
      .then(num => {
        setEditingQuotation(null)
        setQuotationForm({
          number: num,
          quotationStatus: QuotationStatus.Draft,
          issueDate: new Date().toISOString().slice(0, 10),
          validityDate: '',
          amount: 0,
          vatPercentage: 22,
          discountPercentage: 0,
          title: '',
          description: '',
          notes: '',
          customerId: Number(id),
        })
        setQuotationModalOpen(true)
      })
      .catch(() => showToast('Impossibile ottenere il prossimo numero preventivo', 'error'))
  }

  function openEditQuotation(q: Quotation) {
    setEditingQuotation(q)
    setQuotationForm({
      number: q.number,
      quotationStatus: q.quotationStatus,
      issueDate: q.issueDate?.slice(0, 10) ?? '',
      validityDate: q.validityDate?.slice(0, 10) ?? '',
      amount: q.amount,
      vatPercentage: q.vatPercentage,
      discountPercentage: q.discountPercentage,
      title: q.title,
      description: q.description ?? '',
      notes: q.notes ?? '',
      customerId: q.customerId,
    })
    setQuotationModalOpen(true)
  }

  async function handleQuotationSave() {
    if (!customer) return
    setQuotationSaving(true)
    try {
      const payload: QuotationRequest = {
        customerId: customer.id,
        quotationStatus: quotationForm.quotationStatus ?? QuotationStatus.Draft,
        number: quotationForm.number ?? '',
        title: quotationForm.title ?? '',
        amount: quotationForm.amount ?? 0,
        vatPercentage: quotationForm.vatPercentage ?? 22,
        discountPercentage: quotationForm.discountPercentage ?? 0,
        description: quotationForm.description,
        notes: quotationForm.notes,
        issueDate: (quotationForm as { issueDate?: string }).issueDate || undefined,
        validityDate: (quotationForm as { validityDate?: string }).validityDate || undefined,
      }
      if (editingQuotation) {
        const updated = await QuotationAPI.update(editingQuotation.id, payload)
        setQuotations(prev => prev.map(q => q.id === editingQuotation.id ? updated : q))
        showToast('Preventivo aggiornato', 'success')
      } else {
        const created = await QuotationAPI.create(payload)
        setQuotations(prev => [...prev, created])
        showToast('Preventivo creato', 'success')
      }
      setQuotationModalOpen(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore nel salvataggio', 'error')
    } finally {
      setQuotationSaving(false)
    }
  }

  async function handleDeleteQuotation() {
    if (deletingQuotationId === null) return
    setDeleteQuotationLoading(true)
    try {
      await QuotationAPI.delete(deletingQuotationId)
      setQuotations(prev => prev.filter(q => q.id !== deletingQuotationId))
      showToast('Preventivo eliminato', 'success')
      setDeleteQuotationModalOpen(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Errore durante l'eliminazione", 'error')
    } finally {
      setDeleteQuotationLoading(false)
    }
  }

  function openEditCustomer() {
    if (!customer) return
    setEditForm({
      customerType: customer.customerType,
      name: customer.name,
      surname: customer.surname,
      email: customer.email,
      phone: customer.phone,
      companyName: customer.companyName ?? '',
      vatNumber: customer.vatNumber ?? '',
      taxCode: customer.taxCode ?? '',
      city: customer.city ?? '',
      province: customer.province ?? '',
      address: customer.address ?? '',
      notes: customer.notes ?? '',
    })
    setEditModalOpen(true)
  }

  async function handleEditSave() {
    if (!customer) return
    setEditSaving(true)
    try {
      const payload: CustomerRequest = {
        customerType: editForm.customerType ?? customer.customerType,
        name: editForm.name ?? '',
        surname: editForm.surname ?? '',
        email: editForm.email ?? '',
        phone: editForm.phone ?? '',
        companyName: editForm.companyName,
        vatNumber: editForm.vatNumber,
        taxCode: editForm.taxCode,
        city: editForm.city,
        province: editForm.province,
        address: editForm.address,
        notes: editForm.notes,
      }
      const updated = await ClientiAPI.update(customer.id, payload)
      setCustomer(updated)
      setNote(updated.notes ?? '')
      showToast('Cliente aggiornato', 'success')
      setEditModalOpen(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore nel salvataggio', 'error')
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDeleteCustomer() {
    if (!customer) return
    setDeleteLoading(true)
    try {
      await ClientiAPI.delete(customer.id)
      showToast('Cliente eliminato', 'success')
      navigate('/clienti')
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Errore durante l'eliminazione", 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleNotesSave() {
    if (!customer) return
    setNotesSaving(true)
    try {
      const payload: CustomerRequest = {
        customerType: customer.customerType,
        name: customer.name,
        surname: customer.surname,
        email: customer.email,
        phone: customer.phone,
        companyName: customer.companyName,
        vatNumber: customer.vatNumber,
        taxCode: customer.taxCode,
        city: customer.city,
        province: customer.province,
        address: customer.address,
        notes: note,
      }
      const updated = await ClientiAPI.update(customer.id, payload)
      setCustomer(updated)
      showToast('Note salvate', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore nel salvataggio', 'error')
    } finally {
      setNotesSaving(false)
    }
  }

  const filteredQuotations = quotationFilter === 'all'
    ? quotations
    : quotations.filter(q => q.quotationStatus === quotationFilter)

  const filteredQuotationsTotal = filteredQuotations.reduce((s, q) => s + (q.amount ?? 0), 0)

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '64px 0' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center" style={{ padding: '64px 0' }}>
        <p className="text-muted">Cliente non trovato</p>
      </div>
    )
  }

  const initials = `${customer.name?.[0] ?? ''}${customer.surname?.[0] ?? ''}`.toUpperCase()

  const infoFields: { label: string; value: string | undefined }[] = [
    { label: 'Tipo cliente', value: CUSTOMER_TYPE_LABEL[customer.customerType] },
    { label: 'Nome', value: customer.name },
    { label: 'Cognome', value: customer.surname },
    { label: 'Email', value: customer.email },
    { label: 'Telefono', value: customer.phone },
    { label: 'Telefono fisso', value: customer.landline },
    { label: 'Azienda', value: customer.companyName },
    { label: 'P. IVA', value: customer.vatNumber },
    { label: 'Codice fiscale', value: customer.taxCode },
    { label: 'Indirizzo', value: customer.address },
    { label: 'Città', value: customer.city },
    { label: 'Provincia', value: customer.province },
    { label: 'Regione', value: customer.region },
    { label: 'Paese', value: customer.country },
    { label: 'Inserito il', value: formatDate(customer.insertDate) },
    { label: 'Ultimo aggiornamento', value: formatDate(customer.lastUpdateDate) },
  ]

  const filterOptions: { label: string; value: QuotationFilter }[] = [
    { label: 'Tutti', value: 'all' },
    { label: QUOTATION_STATUS_INFO[QuotationStatus.Draft].text, value: QuotationStatus.Draft },
    { label: QUOTATION_STATUS_INFO[QuotationStatus.Sent].text, value: QuotationStatus.Sent },
    { label: QUOTATION_STATUS_INFO[QuotationStatus.Accepted].text, value: QuotationStatus.Accepted },
    { label: QUOTATION_STATUS_INFO[QuotationStatus.Rejected].text, value: QuotationStatus.Rejected },
    { label: QUOTATION_STATUS_INFO[QuotationStatus.Expired].text, value: QuotationStatus.Expired },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/clienti')}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />
          Clienti
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={openEditCustomer}>
            <i className="fa-solid fa-pen" style={{ marginRight: 6 }} />
            Modifica
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setDeleteModalOpen(true)}>
            <i className="fa-solid fa-trash" style={{ marginRight: 6 }} />
            Elimina
          </button>
        </div>
      </div>

      <div className="card mb-24">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px' }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.4rem' }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 8px' }}>{customer.name} {customer.surname}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {customer.email && (
                <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="fa-solid fa-envelope" />
                  {customer.email}
                </span>
              )}
              {customer.phone && (
                <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="fa-solid fa-phone" />
                  {customer.phone}
                </span>
              )}
              {customer.city && (
                <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="fa-solid fa-location-dot" />
                  {customer.city}
                </span>
              )}
              {customer.companyName && (
                <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="fa-solid fa-building" />
                  {customer.companyName}
                </span>
              )}
            </div>
          </div>
          <Badge text={CUSTOMER_TYPE_LABEL[customer.customerType]} cls="badge-blue" />
        </div>
      </div>

      <div className="card mb-24">
        <div className="card-header"><span>Informazioni</span></div>
        <div className="grid-4" style={{ padding: '16px 20px' }}>
          {infoFields.filter(f => f.value).map(f => (
            <div key={f.label}>
              <div className="text-muted" style={{ fontSize: '0.8em', marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontWeight: 500 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
          <button
            className="btn btn-ghost"
            style={{
              borderRadius: 0,
              borderBottom: activeTab === 'preventivi' ? '2px solid var(--accent)' : '2px solid transparent',
            }}
            onClick={() => setActiveTab('preventivi')}
          >
            <i className="fa-solid fa-file-contract" style={{ marginRight: 6 }} />
            Preventivi ({quotations.length})
          </button>
          <button
            className="btn btn-ghost"
            style={{
              borderRadius: 0,
              borderBottom: activeTab === 'note' ? '2px solid var(--accent)' : '2px solid transparent',
            }}
            onClick={() => setActiveTab('note')}
          >
            <i className="fa-solid fa-note-sticky" style={{ marginRight: 6 }} />
            Note
          </button>
        </div>

        {activeTab === 'preventivi' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {filterOptions.map(f => (
                  <button
                    key={String(f.value)}
                    className={`btn btn-sm ${quotationFilter === f.value ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setQuotationFilter(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-sm" onClick={openNewQuotation}>
                <i className="fa-solid fa-plus" style={{ marginRight: 6 }} />
                Nuovo Preventivo
              </button>
            </div>
            <div className="table-card">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Titolo</th>
                    <th>Importo</th>
                    <th>Stato</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted" style={{ padding: '32px 0' }}>
                        Nessun preventivo trovato
                      </td>
                    </tr>
                  ) : filteredQuotations.map(q => {
                    const si = QUOTATION_STATUS_INFO[q.quotationStatus]
                    return (
                      <tr key={q.id}>
                        <td><strong>{q.number}</strong></td>
                        <td>{q.title}</td>
                        <td>{formatCurrency(q.amount)}</td>
                        <td><Badge text={si.text} cls={si.cls} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              title="Modifica"
                              onClick={() => openEditQuotation(q)}
                            >
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              title="Elimina"
                              onClick={() => { setDeletingQuotationId(q.id); setDeleteQuotationModalOpen(true) }}
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-muted text-sm">{filteredQuotations.length} preventivi</span>
              <span className="font-semibold">Totale: {formatCurrency(filteredQuotationsTotal)}</span>
            </div>
            </div>
          </div>
        )}

        {activeTab === 'note' && (
          <div style={{ padding: '16px 20px' }}>
            <div className="form-group">
              <label className="form-label">Note</label>
              <textarea
                className="form-control"
                rows={5}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Note sul cliente..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Note interne</label>
              <textarea
                className="form-control"
                rows={5}
                value={noteInterne}
                onChange={e => setNoteInterne(e.target.value)}
                placeholder="Note interne (solo uso interno)..."
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleNotesSave} disabled={notesSaving}>
                {notesSaving
                  ? <span className="spinner" />
                  : <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }} />Salva Note</>
                }
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={quotationModalOpen}
        onClose={() => setQuotationModalOpen(false)}
        title={editingQuotation ? 'Modifica Preventivo' : 'Nuovo Preventivo'}
        icon="fa-solid fa-file-contract"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setQuotationModalOpen(false)} disabled={quotationSaving}>Annulla</button>
            <button className="btn btn-primary" onClick={handleQuotationSave} disabled={quotationSaving}>
              {quotationSaving ? <span className="spinner" /> : 'Salva'}
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">N° Preventivo</label>
            <input
              type="text"
              className="form-control"
              value={quotationForm.number ?? ''}
              onChange={e => setQuotationForm(f => ({ ...f, number: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Stato</label>
            <select
              className="form-control"
              value={quotationForm.quotationStatus ?? QuotationStatus.Draft}
              onChange={e => setQuotationForm(f => ({ ...f, quotationStatus: Number(e.target.value) as QuotationStatus }))}
            >
              {(Object.entries(QUOTATION_STATUS_INFO) as [string, { text: string; cls: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.text}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Titolo</label>
            <input
              type="text"
              className="form-control"
              value={quotationForm.title ?? ''}
              onChange={e => setQuotationForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Data emissione</label>
            <input
              type="date"
              className="form-control"
              value={(quotationForm as { issueDate?: string }).issueDate ?? ''}
              onChange={e => setQuotationForm(f => ({ ...f, issueDate: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Data scadenza</label>
            <input
              type="date"
              className="form-control"
              value={(quotationForm as { validityDate?: string }).validityDate ?? ''}
              onChange={e => setQuotationForm(f => ({ ...f, validityDate: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Importo (€)</label>
            <input
              type="number"
              className="form-control"
              value={quotationForm.amount ?? 0}
              onChange={e => setQuotationForm(f => ({ ...f, amount: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">IVA (%)</label>
            <input
              type="number"
              className="form-control"
              value={quotationForm.vatPercentage ?? 22}
              onChange={e => setQuotationForm(f => ({ ...f, vatPercentage: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Sconto (%)</label>
            <input
              type="number"
              className="form-control"
              value={quotationForm.discountPercentage ?? 0}
              onChange={e => setQuotationForm(f => ({ ...f, discountPercentage: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Descrizione</label>
            <textarea
              className="form-control"
              rows={3}
              value={quotationForm.description ?? ''}
              onChange={e => setQuotationForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Note</label>
            <textarea
              className="form-control"
              rows={3}
              value={quotationForm.notes ?? ''}
              onChange={e => setQuotationForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteQuotationModalOpen}
        onClose={() => setDeleteQuotationModalOpen(false)}
        onConfirm={handleDeleteQuotation}
        message="Sei sicuro di voler eliminare questo preventivo? L'operazione non può essere annullata."
        loading={deleteQuotationLoading}
      />

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Modifica Cliente"
        icon="fa-solid fa-user-pen"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditModalOpen(false)} disabled={editSaving}>Annulla</button>
            <button className="btn btn-primary" onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? <span className="spinner" /> : 'Salva'}
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input
              type="text"
              className="form-control"
              value={editForm.name ?? ''}
              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Cognome</label>
            <input
              type="text"
              className="form-control"
              value={editForm.surname ?? ''}
              onChange={e => setEditForm(f => ({ ...f, surname: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={editForm.email ?? ''}
              onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Telefono</label>
            <input
              type="text"
              className="form-control"
              value={editForm.phone ?? ''}
              onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Azienda</label>
            <input
              type="text"
              className="form-control"
              value={editForm.companyName ?? ''}
              onChange={e => setEditForm(f => ({ ...f, companyName: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">P. IVA</label>
            <input
              type="text"
              className="form-control"
              value={editForm.vatNumber ?? ''}
              onChange={e => setEditForm(f => ({ ...f, vatNumber: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Codice fiscale</label>
            <input
              type="text"
              className="form-control"
              value={editForm.taxCode ?? ''}
              onChange={e => setEditForm(f => ({ ...f, taxCode: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Città</label>
            <input
              type="text"
              className="form-control"
              value={editForm.city ?? ''}
              onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Provincia</label>
            <input
              type="text"
              className="form-control"
              value={editForm.province ?? ''}
              onChange={e => setEditForm(f => ({ ...f, province: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Indirizzo</label>
            <input
              type="text"
              className="form-control"
              value={editForm.address ?? ''}
              onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Note</label>
            <textarea
              className="form-control"
              rows={3}
              value={editForm.notes ?? ''}
              onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteCustomer}
        message={`Sei sicuro di voler eliminare il cliente ${customer.name} ${customer.surname}? Tutti i dati associati verranno rimossi.`}
        loading={deleteLoading}
      />
    </div>
  )
}
