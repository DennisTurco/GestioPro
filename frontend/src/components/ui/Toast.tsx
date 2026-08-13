import { useToast } from '../../context/ToastContext'

const ICONS: Record<string, string> = {
  success: 'fa-solid fa-circle-check',
  error:   'fa-solid fa-circle-xmark',
  warning: 'fa-solid fa-triangle-exclamation',
  info:    'fa-solid fa-circle-info',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => removeToast(t.id)}>
          <i className={ICONS[t.type]} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
