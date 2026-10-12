import Modal from './Modal'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  buttonText?: string
  message: string
  loading?: boolean
  // false for non-destructive confirmations (e.g. renewal): primary button instead of red
  danger?: boolean
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Conferma eliminazione', buttonText = 'Elimina', message, loading, danger = true }: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon="fa-solid fa-triangle-exclamation"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Annulla</button>
          <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : buttonText}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  )
}
