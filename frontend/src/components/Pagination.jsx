import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../lib/utils"

function pageWindow(current, total) {
  const pages = new Set([1, total, current, current - 1, current + 1])
  return [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)
}

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null

  const pages = pageWindow(page, totalPages)
  const buttonBase =
    "flex h-9 min-w-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className={cn(buttonBase, "bg-card text-foreground hover:bg-muted")}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Previous page</span>
      </button>

      {pages.map((item, index) => {
        const previous = pages[index - 1]
        const gap = previous && item - previous > 1
        return (
          <span key={item} className="flex items-center gap-1.5">
            {gap ? <span className="px-1 text-muted-foreground">…</span> : null}
            <button
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                buttonBase,
                item === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted",
              )}
            >
              {item}
            </button>
          </span>
        )
      })}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(buttonBase, "bg-card text-foreground hover:bg-muted")}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Next page</span>
      </button>
    </nav>
  )
}
