import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "../lib/utils"

/*
 * Several Modal instances can be mounted at once (vehicle detail, create, edit,
 * delete-confirm). A per-instance "restore previous overflow" approach breaks
 * when siblings toggle independently, so a shared counter locks/unlocks the body
 * instead — the page only scrolls again once every open modal has closed.
 */
let lockCount = 0

function lockBodyScroll() {
  lockCount += 1
  document.body.style.overflow = "hidden"
}

function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = ""
  }
}

/**
 * Reusable centred modal with a dark blurred overlay.
 * Clicking the overlay (outside the panel) or pressing Escape closes it.
 */
export default function Modal({ open, onClose, children, className, labelledBy, blur = true }) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === "Escape") onCloseRef.current?.()
    }
    document.addEventListener("keydown", onKey)
    lockBodyScroll()
    return () => {
      document.removeEventListener("keydown", onKey)
      unlockBodyScroll()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/60 p-4 animate-fade-in",
        blur && "backdrop-blur-sm",
      )}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "relative my-auto w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground shadow-2xl animate-pop-in",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Close dialog</span>
        </button>
        {children}
      </div>
    </div>
  )
}
