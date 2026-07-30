import { CalendarDays, Fuel, Cog, Boxes } from "lucide-react"
import { formatCurrency, stockTone, vehicleImage, vehicleTitle, cn } from "../lib/utils"

function Spec({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </span>
  )
}

export default function VehicleCard({ vehicle, onSelect }) {
  const tone = stockTone(vehicle.stock ?? vehicle.quantity)

  return (
    <article className="group h-full">
      <button
        type="button"
        onClick={() => onSelect(vehicle)}
        className="flex h-full w-full gap-4 rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-32">
          <img
            src={vehicleImage(vehicle) || "/placeholder.svg"}
            alt={`${vehicleTitle(vehicle)} exterior`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-foreground">{vehicleTitle(vehicle)}</h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {vehicle.category || "Vehicle"} · {vehicle.year || "—"}
              </p>
            </div>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", tone.classes)}>
              {tone.label}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
            <Spec icon={CalendarDays}>{vehicle.year || "—"}</Spec>
            <Spec icon={Fuel}>{vehicle.fuel_type || vehicle.fuel || "—"}</Spec>
            <Spec icon={Cog}>{vehicle.transmission || "—"}</Spec>
            <Spec icon={Boxes}>{vehicle.stock ?? vehicle.quantity ?? 0} units</Spec>
          </div>

          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <p className="text-lg font-semibold tracking-tight text-foreground">{formatCurrency(vehicle.price)}</p>
            <span className="text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
              View details
            </span>
          </div>
        </div>
      </button>
    </article>
  )
}
