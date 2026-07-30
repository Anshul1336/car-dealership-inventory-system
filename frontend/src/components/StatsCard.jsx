import { cn } from "../lib/utils"

export default function StatsCard({ label, value, hint, icon: Icon, tone = "primary" }) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-amber-100 text-amber-700",
    destructive: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tones[tone])}>
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
