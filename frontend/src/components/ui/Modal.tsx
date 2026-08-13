import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon?: string
  children: ReactNode
  footer?: ReactNode
}

export default function Modal({ isOpen, onClose, title, icon, children, footer }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          {icon && <i className={icon} />} {title}
          <button className="btn-close" onClick={onClose}><i className="fa-solid fa-x" /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
