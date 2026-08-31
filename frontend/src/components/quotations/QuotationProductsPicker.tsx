import type { Product } from '../../types'
import { formatCurrency } from '../../utils/currency'

export interface QuotationProductFormItem {
  productId: number
  quantity: number
  productName: string
  productCode: string
  unitPrice: number
}

interface Props {
  items: QuotationProductFormItem[]
  onChange: (items: QuotationProductFormItem[]) => void
  availableProducts: Product[]
}

export default function QuotationProductsPicker({ items, onChange, availableProducts }: Props) {
  const selectableProducts = availableProducts.filter(
    p => !items.some(item => item.productId === p.id),
  )

  function addProduct(productId: number) {
    if (!productId) return
    const product = availableProducts.find(p => p.id === productId)
    if (!product) return
    onChange([
      ...items,
      {
        productId: product.id,
        quantity: 1,
        productName: product.name,
        productCode: product.code,
        unitPrice: product.price,
      },
    ])
  }

  function updateQuantity(productId: number, quantity: number) {
    onChange(items.map(i => i.productId === productId ? { ...i, quantity } : i))
  }

  function removeProduct(productId: number) {
    onChange(items.filter(i => i.productId !== productId))
  }

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  return (
    <div>
      <select
        className="form-control"
        value=""
        onChange={e => addProduct(Number(e.target.value))}
      >
        <option value="">+ Aggiungi prodotto</option>
        {selectableProducts.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.code}) — {formatCurrency(p.price)}
          </option>
        ))}
      </select>

      {items.length > 0 && (
        <div className="table-wrapper" style={{ marginTop: 12 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Prodotto</th>
                <th>Prezzo unit.</th>
                <th style={{ width: 90 }}>Quantità</th>
                <th>Totale</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const stillAvailable = availableProducts.some(p => p.id === item.productId)
                return (
                  <tr key={item.productId}>
                    <td>
                      {item.productName} ({item.productCode})
                      {!stillAvailable && (
                        <span className="badge badge-muted" style={{ marginLeft: 6, fontSize: 11 }} title="Il prodotto non è più disponibile nel catalogo">
                          non disponibile
                        </span>
                      )}
                    </td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        min={1}
                        value={item.quantity}
                        onChange={e => updateQuantity(item.productId, Math.max(1, Number(e.target.value)))}
                      />
                    </td>
                    <td>{formatCurrency(item.unitPrice * item.quantity)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        title="Rimuovi"
                        onClick={() => removeProduct(item.productId)}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', padding: '8px 4px', fontWeight: 600 }}>
            Totale prodotti: {formatCurrency(total)}
          </div>
        </div>
      )}
    </div>
  )
}
