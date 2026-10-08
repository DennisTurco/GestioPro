import type { ReactNode } from 'react'

interface TablePaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  itemLabel: string
  onPageChange: (page: number) => void
  extra?: ReactNode
}

// Footer shown under every paginated table: "1-10 di 42 clienti", pager and optional extra content (e.g. totals)
export default function TablePagination({ page, totalPages, totalItems, pageSize, itemLabel, onPageChange, extra }: TablePaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <div className="card-footer table-footer">
      <span className="table-footer-range">
        {from}–{to} di {totalItems} {itemLabel}
      </span>
      <div className="table-footer-right">
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm btn-icon"
              title="Pagina precedente"
              disabled={page === 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <span className="pagination-label">Pagina {page} di {totalPages}</span>
            <button
              className="btn btn-ghost btn-sm btn-icon"
              title="Pagina successiva"
              disabled={page === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        )}
        {extra && <div className="table-footer-extra">{extra}</div>}
      </div>
    </div>
  )
}
