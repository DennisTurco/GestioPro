import { useEffect, useState } from 'react'
import { ProductCategoryAPI } from '../services/api'
import type { ProductCategory, ProductCategoryRequest } from '../types'
import { formatDate } from '../utils/date'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import EmptyState from '../components/ui/EmptyState'

const EMPTY_FORM: ProductCategoryRequest = { name: '', description: '' }

export default function Categorie() {
  const { showToast } = useToast()

  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ProductCategory | null>(null)
  const [form, setForm] = useState<ProductCategoryRequest>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    document.title = 'Categorie - GestioPro'
    loadCategories()
  }, [])

  async function loadCategories() {
    setLoading(true)
    try {
      const data = await ProductCategoryAPI.getAll()
      setCategories(data)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore nel caricamento delle categorie', 'error')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(cat: ProductCategory) {
    setEditTarget(cat)
    setForm({ name: cat.name, description: cat.description ?? '' })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditTarget(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast('Il nome è obbligatorio', 'warning')
      return
    }
    setSaving(true)
    try {
      if (editTarget) {
        const updated = await ProductCategoryAPI.update(editTarget.id, form)
        setCategories(prev => prev.map(c => c.id === editTarget.id ? updated : c))
        showToast('Categoria aggiornata', 'success')
      } else {
        const created = await ProductCategoryAPI.create(form)
        setCategories(prev => [...prev, created])
        showToast('Categoria creata', 'success')
      }
      closeModal()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore durante il salvataggio', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await ProductCategoryAPI.delete(deleteTarget.id)
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
      showToast('Categoria eliminata', 'success')
      setDeleteTarget(null)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore durante l\'eliminazione', 'error')
    } finally {
      setDeleting(false)
    }
  }

  function exportCsv() {
    const header = ['Nome', 'Descrizione', 'Creata il']
    const rows = filtered.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.description ?? '').replace(/"/g, '""')}"`,
      `"${formatDate(c.creationDate)}"`,
    ])
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'categorie.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = categories.filter(c => {
    const q = search.toLowerCase()
    return (
      (c.name ?? '').toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24}}>
        <h1 className="page-title"> <i className="fa-solid fa-tags" /> Categorie</h1>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <i className="fa-solid fa-circle-plus" /> Nuova categoria
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-bar">
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Cerca per nome o descrizione..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-right">
          <button className="btn btn-ghost btn-sm" onClick={exportCsv} title="Esporta CSV">
            <i className="fa-solid fa-download" /> Esporta
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrapper">
          <span className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          message={search ? 'Nessuna categoria trovata' : 'Nessuna categoria presente'}
          actionLabel={!search ? 'Nuova categoria' : undefined}
          onAction={!search ? openCreate : undefined}
        />
      ) : (
        <div className="table-card">
          <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrizione</th>
                <th>Creata il</th>
                <th>Ultima modifica</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cat => (
                <tr key={cat.id}>
                  <td><strong>{cat.name}</strong></td>
                  <td>
                    {cat.description
                      ? cat.description.length > 80
                        ? cat.description.slice(0, 80) + '…'
                        : cat.description
                      : <span className="text-muted">—</span>}
                  </td>
                  <td>{formatDate(cat.creationDate)}</td>
                  <td>{formatDate(cat.lastUpdateDate)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Modifica"
                        onClick={() => openEdit(cat)}
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        title="Elimina"
                        onClick={() => setDeleteTarget(cat)}
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
          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted text-sm">{filtered.length} categorie</span>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editTarget ? 'Modifica categoria' : 'Nuova categoria'}
        icon={editTarget ? 'fa-solid fa-pen' : 'fa-solid fa-plus'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>Annulla</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : editTarget ? 'Salva modifiche' : 'Crea categoria'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="cat-name">
            Nome <span className="required">*</span>
          </label>
          <input
            id="cat-name"
            type="text"
            className="form-control"
            placeholder="Nome categoria"
            maxLength={50}
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cat-description">Descrizione</label>
          <textarea
            id="cat-description"
            className="form-control"
            placeholder="Descrizione opzionale"
            maxLength={455}
            rows={4}
            value={form.description ?? ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Sei sicuro di voler eliminare la categoria "${deleteTarget?.name}"? Questa azione non può essere annullata.`}
        loading={deleting}
      />
    </div>
  )
}
