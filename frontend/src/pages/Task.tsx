import { useState, useEffect, useMemo } from 'react'
import { apiFetch, ClientiAPI } from '../services/api'
import type { Customer } from '../types'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'

interface Task {
  id: number
  titolo: string
  descrizione?: string
  priorita: 'alta' | 'media' | 'bassa'
  stato: 'da_fare' | 'in_corso' | 'completato'
  scadenza?: string
  customerId?: number
}

const TaskAPI = {
  getAll: () => apiFetch<Task[]>('/task'),
  create: (data: Omit<Task, 'id'>) => apiFetch<Task>('/task', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Omit<Task, 'id'>) => apiFetch<Task>(`/task/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<null>(`/task/${id}`, { method: 'DELETE' }),
}

type TabFilter = 'tutti' | 'da_fare' | 'in_corso' | 'completato'

const PRIORITY_INFO: Record<Task['priorita'], { text: string; cls: string; order: number }> = {
  alta:  { text: 'Alta',  cls: 'badge-danger',  order: 0 },
  media: { text: 'Media', cls: 'badge-warning',  order: 1 },
  bassa: { text: 'Bassa', cls: 'badge-info',     order: 2 },
}

const STATO_INFO: Record<Task['stato'], { text: string; cls: string }> = {
  da_fare:    { text: 'Da fare',   cls: 'badge-muted' },
  in_corso:   { text: 'In corso',  cls: 'badge-warning'   },
  completato: { text: 'Completato', cls: 'badge-success'  },
}

const EMPTY_FORM: Omit<Task, 'id'> = {
  titolo: '',
  descrizione: '',
  priorita: 'media',
  stato: 'da_fare',
  scadenza: '',
  customerId: undefined,
}

function formatDate(iso?: string) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('it-IT')
}

function isOverdue(scadenza?: string, stato?: Task['stato']) {
  if (!scadenza || stato === 'completato') return false
  return new Date(scadenza) < new Date()
}

export default function Task() {
  const { showToast } = useToast()

  const [tasks, setTasks] = useState<Task[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [tab, setTab] = useState<TabFilter>('tutti')
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [form, setForm] = useState<Omit<Task, 'id'>>(EMPTY_FORM)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    document.title = 'Task - GestioPro'
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([TaskAPI.getAll(), ClientiAPI.getAll()])
      .then(([t, c]) => {
        setTasks(t)
        setCustomers(c)
      })
      .catch(() => showToast('Impossibile caricare i task', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tasks.filter(t => {
      if (tab !== 'tutti' && t.stato !== tab) return false
      if (q && !t.titolo.toLowerCase().includes(q) && !(t.descrizione ?? '').toLowerCase().includes(q)) return false
      return true
    })
  }, [tasks, tab, search])

  const grouped = useMemo(() => {
    const order: Task['priorita'][] = ['alta', 'media', 'bassa']
    return order
      .map(p => ({ priorita: p, items: filtered.filter(t => t.priorita === p) }))
      .filter(g => g.items.length > 0)
  }, [filtered])

  function openCreate() {
    setEditTask(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(t: Task) {
    setEditTask(t)
    setForm({
      titolo: t.titolo,
      descrizione: t.descrizione ?? '',
      priorita: t.priorita,
      stato: t.stato,
      scadenza: t.scadenza ?? '',
      customerId: t.customerId,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditTask(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave() {
    if (!form.titolo.trim()) {
      showToast('Il titolo è obbligatorio', 'warning')
      return
    }
    setSaving(true)
    try {
      const payload: Omit<Task, 'id'> = {
        ...form,
        titolo: form.titolo.trim(),
        descrizione: form.descrizione?.trim() || undefined,
        scadenza: form.scadenza || undefined,
        customerId: form.customerId || undefined,
      }
      if (editTask) {
        const updated = await TaskAPI.update(editTask.id, payload)
        setTasks(prev => prev.map(t => t.id === editTask.id ? updated : t))
        showToast('Task aggiornato', 'success')
      } else {
        const created = await TaskAPI.create(payload)
        setTasks(prev => [...prev, created])
        showToast('Task creato', 'success')
      }
      closeModal()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore durante il salvataggio', 'error')
    } finally {
      setSaving(false)
    }
  }

  function promptDelete(id: number) {
    setDeleteId(id)
    setConfirmOpen(true)
  }

  async function handleDelete() {
    if (deleteId === null) return
    setDeleting(true)
    try {
      await TaskAPI.delete(deleteId)
      setTasks(prev => prev.filter(t => t.id !== deleteId))
      showToast('Task eliminato', 'success')
      setConfirmOpen(false)
      setDeleteId(null)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore durante l\'eliminazione', 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function toggleComplete(t: Task) {
    const nuovoStato: Task['stato'] = t.stato === 'completato' ? 'da_fare' : 'completato'
    try {
      const updated = await TaskAPI.update(t.id, { ...t, stato: nuovoStato })
      setTasks(prev => prev.map(x => x.id === t.id ? updated : x))
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore aggiornamento stato', 'error')
    }
  }

  const customerName = (id?: number) => {
    if (!id) return null
    const c = customers.find(x => x.id === id)
    return c ? `${c.name ?? ''} ${c.surname ?? ''}`.trim() || c.companyName : null
  }

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'tutti',     label: 'Tutti'     },
    { key: 'da_fare',   label: 'Da fare'   },
    { key: 'in_corso',  label: 'In corso'  },
    { key: 'completato', label: 'Completati' },
  ]

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '64px 0' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 className="page-title">Task</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <i className="fa-solid fa-plus" style={{ marginRight: 6 }} />
          Nuovo task
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              className={`btn btn-sm ${tab === key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Cerca task..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message="Nessun task trovato"
          actionLabel="Nuovo task"
          onAction={openCreate}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {grouped.map(({ priorita, items }) => {
            const pInfo = PRIORITY_INFO[priorita]
            return (
              <div key={priorita}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Badge cls={pInfo.cls}>{pInfo.text}</Badge>
                  <span className="text-muted" style={{ fontSize: '0.85em' }}>{items.length} task</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map(t => {
                    const sInfo = STATO_INFO[t.stato]
                    const overdue = isOverdue(t.scadenza, t.stato)
                    const cName = customerName(t.customerId)
                    return (
                      <div
                        key={t.id}
                        className="card"
                        style={{
                          opacity: t.stato === 'completato' ? 0.7 : 1,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '4px 0' }}>
                          <input
                            type="checkbox"
                            checked={t.stato === 'completato'}
                            onChange={() => toggleComplete(t)}
                            style={{ marginTop: 3, width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                              <strong style={{ textDecoration: t.stato === 'completato' ? 'line-through' : 'none' }}>
                                {t.titolo}
                              </strong>
                              <Badge cls={sInfo.cls}>{sInfo.text}</Badge>
                              {t.scadenza && (
                                <span
                                  className={overdue ? 'badge badge-danger' : 'badge badge-muted'}
                                  title="Scadenza"
                                >
                                  <i className="fa-regular fa-calendar" style={{ marginRight: 4 }} />
                                  {formatDate(t.scadenza)}
                                </span>
                              )}
                              {cName && (
                                <span className="badge badge-muted" title="Cliente">
                                  <i className="fa-solid fa-user" style={{ marginRight: 4 }} />
                                  {cName}
                                </span>
                              )}
                            </div>
                            {t.descrizione && (
                              <p className="text-muted" style={{ margin: 0, fontSize: '0.9em' }}>{t.descrizione}</p>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => openEdit(t)}
                              title="Modifica"
                            >
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => promptDelete(t.id)}
                              title="Elimina"
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editTask ? 'Modifica task' : 'Nuovo task'}
        icon={editTask ? 'fa-solid fa-pen' : 'fa-solid fa-plus'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>Annulla</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : editTask ? 'Salva' : 'Crea'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-titolo">Titolo *</label>
            <input
              id="task-titolo"
              type="text"
              className="form-control"
              placeholder="Titolo del task"
              value={form.titolo}
              onChange={e => setForm(f => ({ ...f, titolo: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-descrizione">Descrizione</label>
            <textarea
              id="task-descrizione"
              className="form-control"
              placeholder="Descrizione opzionale"
              rows={3}
              value={form.descrizione ?? ''}
              onChange={e => setForm(f => ({ ...f, descrizione: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-priorita">Priorità</label>
              <select
                id="task-priorita"
                className="form-control"
                value={form.priorita}
                onChange={e => setForm(f => ({ ...f, priorita: e.target.value as Task['priorita'] }))}
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="bassa">Bassa</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-stato">Stato</label>
              <select
                id="task-stato"
                className="form-control"
                value={form.stato}
                onChange={e => setForm(f => ({ ...f, stato: e.target.value as Task['stato'] }))}
              >
                <option value="da_fare">Da fare</option>
                <option value="in_corso">In corso</option>
                <option value="completato">Completato</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-scadenza">Scadenza</label>
              <input
                id="task-scadenza"
                type="date"
                className="form-control"
                value={form.scadenza ?? ''}
                onChange={e => setForm(f => ({ ...f, scadenza: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-cliente">Cliente</label>
              <select
                id="task-cliente"
                className="form-control"
                value={form.customerId ?? ''}
                onChange={e => setForm(f => ({ ...f, customerId: e.target.value ? Number(e.target.value) : undefined }))}
              >
                <option value="">Nessun cliente</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {`${c.name ?? ''} ${c.surname ?? ''}`.trim() || c.companyName || `Cliente #${c.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteId(null) }}
        onConfirm={handleDelete}
        message="Sei sicuro di voler eliminare questo task? L'operazione non può essere annullata."
        loading={deleting}
      />
    </div>
  )
}
