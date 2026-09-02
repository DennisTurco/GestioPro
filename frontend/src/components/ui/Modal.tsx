import { useRef, type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon?: string
  children: ReactNode
  footer?: ReactNode
}

export default function Modal({ isOpen, onClose, title, icon, children, footer }: ModalProps) {
  const mouseDownOnOverlay = useRef(false)

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay open"
      onMouseDown={e => { mouseDownOnOverlay.current = e.target === e.currentTarget }}
      onClick={e => {
        // only close on a real click on the overlay - not a text selection that
        // started inside the modal and was released outside it while dragging
        if (e.target === e.currentTarget && mouseDownOnOverlay.current) onClose()
      }}
    >
      {/* padded buffer around the modal: a click landing here doesn't close it
          (e.target is this div, not the overlay), only clicks further out do -
          reduces accidental closes from just missing the modal edge */}
      <div className="modal-safe-zone">
        <div className="modal">
          <div className="modal-header">
            {icon && <i className={icon} />} {title}
            <button className="btn-close" onClick={onClose}><i className="fa-solid fa-x" /></button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
