interface EmptyStateProps {
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ message = 'Nessun elemento trovato', actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <h3>{message}</h3>
      <p>Non ci sono ancora elementi da mostrare.</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  )
}
