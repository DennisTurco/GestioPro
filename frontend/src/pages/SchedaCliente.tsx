import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ClientiAPI, QuotationAPI, ContractAPI, SettingsAPI } from '../services/api'
import type { Contract, ContractRequest, Customer, CustomerRequest, Quotation, QuotationRequest, Setting } from '../types'
import { QuotationStatus, ContractType, QUOTATION_STATUS_INFO, CUSTOMER_TYPE_LABEL, CONTRACT_TYPE_LABEL, CONTRACT_STATUS_CLS } from '../types'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Badge from '../components/ui/Badge'
import { getSettingValue } from '../utils/settings'

type Tab = 'preventivi' | 'contratti' | 'note'
type QuotationFilter = 'all' | QuotationStatus

export default function SchedaCliente() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [settings, setSettings] = useState<Setting[]>([])
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

  const [renewTarget, setRenewTarget] = useState<Contract | null>(null)
  const [renewing, setRenewing] = useState(false)

  const [contractEditTarget, setContractEditTarget] = useState<Contract | null>(null)
  const [contractEditOpen, setContractEditOpen] = useState(false)
  const [contractEditForm, setContractEditForm] = useState({ title: '', amount: '', vatPercentage: '', description: '', notes: '' })
  const [contractEditSaving, setContractEditSaving] = useState(false)

  const [contractCreateOpen, setContractCreateOpen] = useState(false)
  const [contractCreateForm, setContractCreateForm] = useState<Partial<ContractRequest>>({})
  const [contractCreateSaving, setContractCreateSaving] = useState(false)
  const [contractNumberLoading, setContractNumberLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    const numId = Number(id)
    setLoading(true)
    Promise.all([ClientiAPI.getById(numId), QuotationAPI.getAll(), ContractAPI.getAll(), SettingsAPI.getAll()])
      .then(([c, qs, cs, se]) => {
        const customerQuotations = qs.filter(q => q.customerId === numId)
        const quotationIds = new Set(customerQuotations.map(q => q.id))
        setCustomer(c)
        setQuotations(customerQuotations)
        setContracts(cs.filter(c => quotationIds.has(c.quotationId)))
        setSettings(se)
        setNote(c.notes ?? '')
        document.title = `${c.name} ${c.surname} - GestioPro`
      })
      .catch(() => showToast('Impossibile caricare i dati del cliente', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  function openNewQuotation() {
    const vatDefault = getSettingValue(settings, "VatPercentage") ?? "22";
    const descDefault = getSettingValue(settings, "QuotationNotes") ?? "";

    QuotationAPI.getNextNumber()
      .then(num => {
        setEditingQuotation(null)
        setQuotationForm({
          number: num,
          quotationStatus: QuotationStatus.Draft,
          issueDate: new Date().toISOString().slice(0, 10),
          validityDate: '',
          amount: 0,
          vatPercentage: Number(vatDefault),
          discountPercentage: 0,
          title: '',
          description: descDefault,
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

  async function handleRenewal() {
    if (!renewTarget) return
    setRenewing(true)
    try {
      const renewed = await ContractAPI.renewal(renewTarget.id)
      setContracts(prev => prev.map(c => c.id === renewTarget.id ? renewed : c))
      showToast('Contratto rinnovato', 'success')
      setRenewTarget(null)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore nel rinnovo', 'error')
    } finally {
      setRenewing(false)
    }
  }

  function openNewContract() {
    const vatDefault = getSettingValue(settings, "VatPercentage") ?? "22";

    setContractCreateForm({
      quotationId: 0,
      number: '',
      title: '',
      amount: 0,
      vatPercentage: Number(vatDefault),
      description: '',
      notes: '',
      contractType: ContractType.Semestral,
      startDate: new Date().toISOString().slice(0, 10)
    })
    setContractCreateOpen(true)
  }

  function openEditContract(c: Contract) {
    setContractEditTarget(c)
    setContractEditForm({
      title: c.title,
      amount: String(c.amount),
      vatPercentage: String(c.vatPercentage),
      description: c.description ?? '',
      notes: c.notes ?? '',
    })
    setContractEditOpen(true)
  }

  async function handleContractSave() {
    if (!contractEditTarget) return
    setContractEditSaving(true)
    try {
      const payload: ContractRequest = {
        quotationId: contractEditTarget.quotationId,
        contractType: contractEditTarget.contractType,
        number: contractEditTarget.number,
        title: contractEditForm.title.trim(),
        amount: Number(contractEditForm.amount),
        vatPercentage: Number(contractEditForm.vatPercentage),
        startDate: contractEditTarget.startDate,
        description: contractEditForm.description || undefined,
        notes: contractEditForm.notes || undefined,
      }
      const updated = await ContractAPI.update(contractEditTarget.id, payload)
      setContracts(prev => prev.map(c => c.id === contractEditTarget.id ? updated : c))
      showToast('Contratto aggiornato', 'success')
      setContractEditOpen(false)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore nel salvataggio', 'error')
    } finally {
      setContractEditSaving(false)
    }
  }

  async function handleContractQuotationChange(quotationId: number) {
    setContractCreateForm(f => ({ ...f, quotationId }))
    if (!quotationId) return
    const q = quotations.find(q => q.id === quotationId)
    if (q) setContractCreateForm(f => ({ ...f, title: f.title || q.title, amount: f.amount || q.amount, description: f.description || (q.description ?? '') }))
    setContractNumberLoading(true)
    try {
      const num = await ContractAPI.getNextNumber(quotationId, q?.number ?? '')
      setContractCreateForm(f => ({ ...f, number: num }))
    } catch {
      showToast('Numero non generato automaticamente, inseriscilo a mano', 'warning')
    } finally {
      setContractNumberLoading(false)
    }
  }

  async function handleContractCreate() {
    if (!contractCreateForm.quotationId) { showToast('Seleziona il preventivo', 'warning'); return }
    if (!contractCreateForm.number?.trim() || !contractCreateForm.title?.trim()) { showToast('Numero e titolo obbligatori', 'warning'); return }
    if (!contractCreateForm.amount || contractCreateForm.amount <= 0) { showToast('Importo non valido', 'warning'); return }
    setContractCreateSaving(true)
    try {
      await ContractAPI.create({
        quotationId: contractCreateForm.quotationId,
        contractType: contractCreateForm.contractType ?? ContractType.Semestral,
        number: contractCreateForm.number.trim(),
        title: contractCreateForm.title.trim(),
        amount: contractCreateForm.amount,
        vatPercentage: contractCreateForm.vatPercentage ?? 22,
        startDate: contractCreateForm.startDate ?? new Date().toISOString().slice(0, 10),
        description: contractCreateForm.description || undefined,
        notes: contractCreateForm.notes || undefined,
      })
      const cs = await ContractAPI.getAll()
      const quotationIds = new Set(quotations.map(q => q.id))
      setContracts(cs.filter(c => quotationIds.has(c.quotationId)))
      showToast('Contratto creato', 'success')
      setContractCreateOpen(false)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore nel salvataggio', 'error')
    } finally {
      setContractCreateSaving(false)
    }
  }

  const acceptedQuotations = quotations.filter(q => q.quotationStatus === QuotationStatus.Accepted)

  const filteredQuotations = quotationFilter === 'all'
    ? quotations
    : quotations.filter(q => q.quotationStatus === quotationFilter)

  const filteredQuotationsTotal = filteredQuotations.reduce((s, q) => s + (q.amount ?? 0), 0)

  const contractsTotal = contracts.reduce((s, q) => s + (q.amount ?? 0), 0)

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
          <Badge cls="badge-info">{CUSTOMER_TYPE_LABEL[customer.customerType]}</Badge>
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
            <i className="fa-solid fa-file-invoice" style={{ marginRight: 6 }} />
            Preventivi ({quotations.length})
          </button>
          <button
            className="btn btn-ghost"
            style={{
              borderRadius: 0,
              borderBottom: activeTab === 'contratti' ? '2px solid var(--accent)' : '2px solid transparent',
            }}
            onClick={() => setActiveTab('contratti')}
          >
            <i className="fa-solid fa-file-contract" style={{ marginRight: 6 }} />
            Contratti ({contracts.length})
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
                    <th>N&#176;</th>
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
                        <td className="font-medium"><code style={{ fontSize: 12 }}>{q.number}</code></td>
                        <td>{q.title}</td>
                        <td>{formatCurrency(q.amount)}</td>
                        <td><Badge cls={si.cls}>{si.text}</Badge></td>
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

        {activeTab === 'contratti' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 12px' }}>
              <button className="btn btn-primary btn-sm" onClick={openNewContract}>
                <i className="fa-solid fa-plus" style={{ marginRight: 6 }} />
                Nuovo contratto
              </button>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>N&#176;</th>
                    <th>Titolo</th>
                    <th>Tipo</th>
                    <th>Stato</th>
                    <th>Importo</th>
                    <th>Inizio</th>
                    <th>Fine</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-muted" style={{ padding: '32px 0' }}>
                        Nessun contratto trovato
                      </td>
                    </tr>
                  ) : contracts.map(c => (
                    <tr key={c.id}>
                      <td className="font-medium"><code style={{ fontSize: 12 }}>{c.number}</code></td>
                      <td><strong>{c.title}</strong></td>
                      <td>{CONTRACT_TYPE_LABEL[c.contractType] ?? '—'}</td>
                      <td>
                        <Badge cls={CONTRACT_STATUS_CLS[c.status] ?? 'badge-muted'}>{c.status}</Badge>
                      </td>
                      <td>{formatCurrency(c.amount)}</td>
                      <td>{formatDate(c.startDate)}</td>
                      <td>{c.endDate ? formatDate(c.endDate) : <span className="text-muted">—</span>}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-sm" title="Rinnova" onClick={() => setRenewTarget(c)}>
                            <i className="fa-solid fa-rotate-right" />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Modifica" onClick={() => openEditContract(c)}>
                            <i className="fa-solid fa-pen" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-muted text-sm">{contracts.length} contratti</span>
              <span className="font-semibold">Totale: {formatCurrency(contractsTotal)}</span>
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
            <label className="form-label">N&#176; Preventivo</label>
            <input
              type="text"
              className="form-control"
              value={quotationForm.number ?? ''}
              onChange={e => setQuotationForm(f => ({ ...f, number: e.target.value }))}
              disabled={true}
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

      {/* ── RINNOVO CONTRATTO ── */}
      <ConfirmModal
        isOpen={renewTarget !== null}
        onClose={() => setRenewTarget(null)}
        onConfirm={handleRenewal}
        loading={renewing}
        message={renewTarget ? `Rinnova il contratto "${renewTarget.title}"? La data di fine verrà estesa in base al tipo (${CONTRACT_TYPE_LABEL[renewTarget.contractType]}).` : ''}
      />

      {/* ── MODIFICA CONTRATTO ── */}
      <Modal
        isOpen={contractEditOpen}
        onClose={() => setContractEditOpen(false)}
        title="Modifica contratto"
        icon="fa-solid fa-file-contract"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setContractEditOpen(false)} disabled={contractEditSaving}>Annulla</button>
            <button className="btn btn-primary" onClick={handleContractSave} disabled={contractEditSaving}>
              {contractEditSaving ? <span className="spinner" /> : 'Salva'}
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Titolo <span className="required">*</span></label>
            <input type="text" className="form-control" value={contractEditForm.title} onChange={e => setContractEditForm(f => ({ ...f, title: e.target.value }))} maxLength={200} />
          </div>
          <div className="form-group">
            <label className="form-label">Importo (€) <span className="required">*</span></label>
            <input type="number" className="form-control" value={contractEditForm.amount} onChange={e => setContractEditForm(f => ({ ...f, amount: e.target.value }))} min={0} step={0.01} />
          </div>
          <div className="form-group">
            <label className="form-label">IVA %</label>
            <input type="number" className="form-control" value={contractEditForm.vatPercentage} onChange={e => setContractEditForm(f => ({ ...f, vatPercentage: e.target.value }))} min={0} max={100} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Descrizione</label>
            <textarea className="form-control" rows={3} value={contractEditForm.description} onChange={e => setContractEditForm(f => ({ ...f, description: e.target.value }))} maxLength={2000} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Note</label>
            <textarea className="form-control" rows={2} value={contractEditForm.notes} onChange={e => setContractEditForm(f => ({ ...f, notes: e.target.value }))} maxLength={1000} />
          </div>
        </div>
      </Modal>

      {/* ── NUOVO CONTRATTO ── */}
      <Modal
        isOpen={contractCreateOpen}
        onClose={() => setContractCreateOpen(false)}
        title="Nuovo contratto"
        icon="fa-solid fa-file-contract"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setContractCreateOpen(false)} disabled={contractCreateSaving}>Annulla</button>
            <button className="btn btn-primary" onClick={handleContractCreate} disabled={contractCreateSaving}>
              {contractCreateSaving ? <span className="spinner" /> : 'Crea'}
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Preventivo accettato <span className="required">*</span></label>
            <select className="form-control" value={contractCreateForm.quotationId ?? 0} onChange={e => handleContractQuotationChange(Number(e.target.value))}>
              <option value={0}>— Seleziona preventivo —</option>
              {acceptedQuotations.map(q => (
                <option key={q.id} value={q.id}>#{q.number} — {q.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              Numero <span className="required">*</span>
              {contractNumberLoading && <span className="spinner" style={{ marginLeft: 8, width: 12, height: 12 }} />}
            </label>
            <input type="text" className="form-control" disabled={true} value={contractCreateForm.number ?? ''} onChange={e => setContractCreateForm(f => ({ ...f, number: e.target.value }))} placeholder="es. 2024-001-001" />
          </div>
          <div className="form-group">
            <label className="form-label">Tipo contratto</label>
            <select className="form-control" value={contractCreateForm.contractType ?? ContractType.Semestral} onChange={e => setContractCreateForm(f => ({ ...f, contractType: Number(e.target.value) as ContractType }))}>
              {Object.entries(CONTRACT_TYPE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Titolo <span className="required">*</span></label>
            <input type="text" className="form-control" value={contractCreateForm.title ?? ''} onChange={e => setContractCreateForm(f => ({ ...f, title: e.target.value }))} maxLength={200} />
          </div>
          <div className="form-group">
            <label className="form-label">Data inizio <span className="required">*</span></label>
            <input type="date" className="form-control" value={contractCreateForm.startDate ?? ''} onChange={e => setContractCreateForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Importo (€) <span className="required">*</span></label>
            <input type="number" className="form-control" value={contractCreateForm.amount ?? 0} onChange={e => setContractCreateForm(f => ({ ...f, amount: Number(e.target.value) }))} min={0} step={0.01} />
          </div>
          <div className="form-group">
            <label className="form-label">IVA %</label>
            <input type="number" className="form-control" value={contractCreateForm.vatPercentage ?? 22} onChange={e => setContractCreateForm(f => ({ ...f, vatPercentage: Number(e.target.value) }))} min={0} max={100} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Descrizione</label>
            <textarea className="form-control" rows={3} value={contractCreateForm.description ?? ''} onChange={e => setContractCreateForm(f => ({ ...f, description: e.target.value }))} maxLength={2000} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Note</label>
            <textarea className="form-control" rows={2} value={contractCreateForm.notes ?? ''} onChange={e => setContractCreateForm(f => ({ ...f, notes: e.target.value }))} maxLength={1000} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
