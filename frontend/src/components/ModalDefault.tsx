import { useEffect, type ReactNode } from "react"
import "../styles/Modal.css"

// ─── Ícones inline ───────────────────────────────────────────────────────────

function IconX() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    )
}

function IconSave() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    )
}

// ─── Types ───────────────────────────────────────────────────────────────────

type ModalDefaultProps = {
    isOpen: boolean
    onClose: () => void
    onSubmit?: () => void
    title: string
    description?: string
    submitLabel?: string
    cancelLabel?: string
    isLoading?: boolean
    children: ReactNode
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ModalDefault({
    isOpen,
    onClose,
    onSubmit,
    title,
    description,
    submitLabel = "Salvar",
    cancelLabel = "Cancelar",
    isLoading = false,
    children,
}: ModalDefaultProps) {

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose()
        }
        if (isOpen) document.addEventListener("keydown", handleKey)
        return () => document.removeEventListener("keydown", handleKey)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* ── Header ── */}
                <div className="modal-header">
                    <div>
                        <h2 id="modal-title" className="modal-title">{title}</h2>
                        {description && (
                            <p className="modal-description">{description}</p>
                        )}
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Fechar">
                        <IconX />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="modal-body">
                    {children}
                </div>

                {/* ── Footer ── */}
                {onSubmit && (
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="modal-btn modal-btn--cancel"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            className="modal-btn modal-btn--submit"
                            onClick={onSubmit}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? <span className="modal-spinner" />
                                : <IconSave />
                            }
                            {isLoading ? "Salvando..." : submitLabel}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}