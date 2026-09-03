import { useState, useEffect, useMemo } from 'react'
import { ProductAPI, ProductCategoryAPI, SettingsAPI } from '../services/api'
import type { Product, ProductRequest, ProductCategory, Setting } from '../types'
import { ProductStatus, PRODUCT_STATUS_INFO, ItemType, ITEM_TYPE_INFO } from '../types'
import { formatCurrency } from '../utils/currency'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { getSettingValue } from '../utils/settings'

const EMPTY_FORM: ProductRequest = {
  categoryId: 0,
  productStatus: ProductStatus.New,
  itemType: ItemType.Product,
  code: '',
  ean: '',
  name: '',
  description: '',
  quantity: 0,
  vatPercentage: 22,
  price: 0,
}

export default function Prodotti() {
  const { showToast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('')
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('')
  const [typeFilter, setTypeFilter] = useState<ItemType | ''>('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductRequest>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    document.title = 'Prodotti e Servizi - GestioPro'
    loadData()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, categoryFilter, statusFilter, typeFilter])

  async function loadData() {
    setLoading(true)
    try {
      const [prods, cats, sett] = await Promise.all([
        ProductAPI.getAll(),
        ProductCategoryAPI.getAll(),
        SettingsAPI.getAll(),
      ])
      setProducts(prods)
      setCategories(cats)
      setSettings(sett)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore nel caricamento', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return products.filter(p => {
      if (q && !p.name.toLowerCase().includes(q) &&
          !p.code.toLowerCase().includes(q) &&
          !(p.ean ?? '').toLowerCase().includes(q) &&
          !p.categoryName.toLowerCase().includes(q)) return false
      if (categoryFilter !== '' && p.categoryId !== categoryFilter) return false
      if (statusFilter !== '' && p.productStatus !== statusFilter) return false
      if (typeFilter !== '' && p.itemType !== typeFilter) return false
      return true
    })
  }, [products, search, categoryFilter, statusFilter, typeFilter])

  function openCreate() {
    setEditingProduct(null)
    const vatDefault = getSettingValue(settings, "VatPercentage") ?? 22;
    setForm({
        ...EMPTY_FORM,
        categoryId: categories[0]?.id ?? 0,
        vatPercentage: Number(vatDefault)
    })
    setModalOpen(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setForm({
      categoryId: product.categoryId,
      productStatus: product.productStatus,
      itemType: product.itemType,
      code: product.code,
      ean: product.ean ?? '',
      name: product.name,
      description: product.description ?? '',
      quantity: product.quantity ?? 0,
      vatPercentage: product.vatPercentage,
      price: product.price,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingProduct(null)
    setForm(EMPTY_FORM)
  }

  function setField<K extends keyof ProductRequest>(key: K, value: ProductRequest[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.categoryId) { showToast('Seleziona una categoria', 'warning'); return }
    if (!form.code.trim()) { showToast('Il codice è obbligatorio', 'warning'); return }
    if (!form.name.trim()) { showToast('Il nome è obbligatorio', 'warning'); return }
    if (form.vatPercentage < 0 || form.vatPercentage > 100) { showToast("L'IVA deve essere tra 0 e 100", 'warning'); return }
    if (form.price < 0) { showToast('Il prezzo non può essere negativo', 'warning'); return }

    const isService = form.itemType === ItemType.Service
    const payload: ProductRequest = {
      ...form,
      ean: isService ? undefined : (form.ean?.trim() || undefined),
      quantity: isService ? undefined : form.quantity,
      description: form.description?.trim() || undefined,
    }

    const label = isService ? 'Servizio' : 'Prodotto'
    setSaving(true)
    try {
      if (editingProduct) {
        const updated = await ProductAPI.update(editingProduct.id, payload)
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
        showToast(`${label} aggiornato`, 'success')
      } else {
        const created = await ProductAPI.create(payload)
        setProducts(prev => [...prev, created])
        showToast(`${label} creato`, 'success')
      }
      closeModal()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Errore nel salvataggio', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await ProductAPI.delete(deleteTarget.id)
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
      showToast('Prodotto eliminato', 'success')
      setDeleteTarget(null)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Errore nell'eliminazione", 'error')
    } finally {
      setDeleting(false)
    }
  }

  function exportCsv() {
    const headers = ['Tipo', 'Nome', 'Codice', 'EAN', 'Categoria', 'Stato', 'Quantità', 'IVA%', 'Prezzo']
    const rows = filtered.map(p => [
      ITEM_TYPE_INFO[p.itemType].text,
      p.name,
      p.code,
      p.ean ?? '',
      p.categoryName,
      p.itemType === ItemType.Service ? '' : PRODUCT_STATUS_INFO[p.productStatus].text,
      p.quantity ?? '',
      p.vatPercentage,
      p.price,
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prodotti.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="page">

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24,}}>
        <h1 className="page-title"> <i className="fa-solid fa-box" /> Prodotti e Servizi</h1>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <i className="fa-solid fa-circle-plus" /> Nuovo prodotto
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-bar" style={{ flex: 1 }}>
          <i className="fa-solid fa-search search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Cerca per nome, codice, EAN, categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          style={{ width: 160 }}
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value === '' ? '' : Number(e.target.value) as ItemType)}
        >
          <option value="">Tutti i tipi</option>
          <option value={ItemType.Product}>{ITEM_TYPE_INFO[ItemType.Product].text}</option>
          <option value={ItemType.Service}>{ITEM_TYPE_INFO[ItemType.Service].text}</option>
        </select>
        <select
          className="form-control"
          style={{ width: 200 }}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value === '' ? '' : Number(e.target.value))}
        >
          <option value="">Tutte le categorie</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="form-control"
          style={{ width: 140 }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value === '' ? '' : Number(e.target.value) as ProductStatus)}
        >
          <option value="">Tutti gli stati</option>
          <option value={ProductStatus.New}>Nuovo</option>
          <option value={ProductStatus.Used}>Usato</option>
        </select>
        <div className="toolbar-right">
          <button className="btn btn-ghost btn-sm" onClick={exportCsv} title="Esporta CSV">
            <i className="fa-solid fa-download" /> Esporta
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrapper">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          message="Nessun prodotto trovato"
          actionLabel="Nuovo prodotto"
          onAction={openCreate}
        />
      ) : (
        <div className="table-card">
          <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nome</th>
                <th>Codice</th>
                <th>Categoria</th>
                <th>Stato</th>
                <th>Quantità</th>
                <th>IVA%</th>
                <th>Prezzo</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <Badge cls={ITEM_TYPE_INFO[p.itemType].cls}>
                      <i className={ITEM_TYPE_INFO[p.itemType].icon}/> {ITEM_TYPE_INFO[p.itemType].text}
                    </Badge>
                  </td>
                  <td>{p.name}</td>
                  <td>
                    <span>{p.code}</span>
                    {p.ean && <span className="text-muted"> · {p.ean}</span>}
                  </td>
                  <td>{p.categoryName}</td>
                  <td>
                    {p.itemType === ItemType.Service ? '—' : (
                      <Badge cls={PRODUCT_STATUS_INFO[p.productStatus].cls}>
                        {PRODUCT_STATUS_INFO[p.productStatus].text}
                      </Badge>
                    )}
                  </td>
                  <td>{p.itemType === ItemType.Service ? '—' : (p.quantity ?? '—')}</td>
                  <td>{p.vatPercentage}%</td>
                  <td>{formatCurrency(p.price)}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Modifica"
                        onClick={() => openEdit(p)}
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        title="Elimina"
                        onClick={() => setDeleteTarget(p)}
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
          <div
            className="card-footer"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="text-muted text-sm">
              {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filtered.length)} di{" "}
              {filtered.length} prodotti
            </span>
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  title="Pagina precedente"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <span className="text-muted text-sm">
                  Pagina {currentPage} di {totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  title="Pagina successiva"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingProduct
          ? `Modifica ${form.itemType === ItemType.Service ? 'servizio' : 'prodotto'}`
          : `Nuovo ${form.itemType === ItemType.Service ? 'servizio' : 'prodotto'}`}
        icon={editingProduct ? 'fa-solid fa-pen' : 'fa-solid fa-plus'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>Annulla</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : (editingProduct ? 'Salva modifiche' : `Crea ${form.itemType === ItemType.Service ? 'servizio' : 'prodotto'}`)}
            </button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="prod-type">Tipo *</label>
            <select
              id="prod-type"
              className="form-control"
              value={form.itemType}
              onChange={e => setField('itemType', Number(e.target.value) as ItemType)}
            >
              <option value={ItemType.Product}>{ITEM_TYPE_INFO[ItemType.Product].text}</option>
              <option value={ItemType.Service}>{ITEM_TYPE_INFO[ItemType.Service].text}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prod-category">Categoria *</label>
            <select
              id="prod-category"
              className="form-control"
              value={form.categoryId}
              onChange={e => setField('categoryId', Number(e.target.value))}
            >
              <option value={0} disabled>Seleziona categoria</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {form.itemType === ItemType.Product && (
            <div className="form-group">
              <label className="form-label" htmlFor="prod-status">Stato *</label>
              <select
                id="prod-status"
                className="form-control"
                value={form.productStatus}
                onChange={e => setField('productStatus', Number(e.target.value) as ProductStatus)}
              >
                <option value={ProductStatus.New}>Nuovo</option>
                <option value={ProductStatus.Used}>Usato</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="prod-code">Codice *</label>
            <input
              id="prod-code"
              type="text"
              className="form-control"
              placeholder="Codice prodotto"
              value={form.code}
              onChange={e => setField('code', e.target.value)}
            />
          </div>

          {form.itemType === ItemType.Product && (
            <div className="form-group">
              <label className="form-label" htmlFor="prod-ean">EAN</label>
              <input
                id="prod-ean"
                type="text"
                className="form-control"
                placeholder="Codice EAN (opzionale)"
                value={form.ean ?? ''}
                onChange={e => setField('ean', e.target.value)}
              />
            </div>
          )}

          <div className="form-group form-group-full">
            <label className="form-label" htmlFor="prod-name">Nome *</label>
            <input
              id="prod-name"
              type="text"
              className="form-control"
              placeholder="Nome prodotto"
              maxLength={50}
              value={form.name}
              onChange={e => setField('name', e.target.value)}
            />
          </div>

          <div className="form-group form-group-full">
            <label className="form-label" htmlFor="prod-description">Descrizione</label>
            <textarea
              id="prod-description"
              className="form-control"
              placeholder="Descrizione (opzionale)"
              maxLength={1000}
              rows={3}
              value={form.description ?? ''}
              onChange={e => setField('description', e.target.value)}
            />
          </div>

          {form.itemType === ItemType.Product && (
            <div className="form-group">
              <label className="form-label" htmlFor="prod-quantity">Quantità</label>
              <input
                id="prod-quantity"
                type="number"
                className="form-control"
                min={0}
                value={form.quantity ?? 0}
                onChange={e => setField('quantity', Number(e.target.value))}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="prod-vat">IVA% *</label>
            <input
              id="prod-vat"
              type="number"
              className="form-control"
              min={0}
              max={100}
              value={form.vatPercentage}
              onChange={e => setField('vatPercentage', Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prod-price">Prezzo *</label>
            <input
              id="prod-price"
              type="number"
              className="form-control"
              min={0}
              step={0.01}
              value={form.price}
              onChange={e => setField('price', Number(e.target.value))}
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={deleteTarget ? `Sei sicuro di voler eliminare ${deleteTarget.itemType === ItemType.Service ? 'il servizio' : 'il prodotto'} "${deleteTarget.name}"? L'operazione non può essere annullata.` : ''}
        loading={deleting}
      />
    </div>
  )
}
