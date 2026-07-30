import { Loader2 } from "lucide-react"
import { cn } from "../lib/utils"

export default function LoadingSpinner({ label = "Loading", className, size = 24, full = false }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-muted-foreground",
        full && "min-h-64 w-full",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
