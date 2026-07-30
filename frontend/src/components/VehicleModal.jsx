import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import {
  Boxes,
  CalendarDays,
  Cog,
  Fuel,
  Loader2,
  Minus,
  PackagePlus,
  PartyPopper,
  Pencil,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
} from "lucide-react"
import Modal from "./Modal"
import { formatCurrency, stockTone, vehicleImage, vehicleTitle, cn } from "../lib/utils"
import { vehiclesApi } from "../api/vehicles"
import { useAuth } from "../context/AuthContext"

function SpecRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value || "—"}</p>
      </div>
    </div>
  )
}

function QuantityStepper({ value, onChange, max, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="flex items-center rounded-xl border border-border bg-card">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Decrease quantity</span>
        </button>
        <span className="w-8 text-center text-sm font-semibold text-foreground">{value}</span>
        <button
          type="button"
          onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
          className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Increase quantity</span>
        </button>
      </div>
    </div>
  )
}

export default function VehicleModal({ vehicle, open, onClose, onEdit, onDelete, onChanged }) {
  const { isAuthenticated, isAdmin, openAuth } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [restockQty, setRestockQty] = useState(5)
  const [busy, setBusy] = useState(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState(null)

  /* Clear the success screen whenever a different vehicle is opened or the modal closes. */
  useEffect(() => {
    setPurchaseSuccess(null)
  }, [vehicle?.id, open])

  if (!vehicle) return null

  const stock = Number(vehicle.stock ?? vehicle.quantity ?? 0)
  const tone = stockTone(stock)

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to purchase a vehicle.")
      openAuth("login")
      return
    }
    setBusy("purchase")
    try {
      const updated = await vehiclesApi.purchase(vehicle.id, quantity)
      onChanged?.(updated?.vehicle || updated)
      setPurchaseSuccess({ quantity, title: vehicleTitle(vehicle) })
      setQuantity(1)
    } catch (error) {
      toast.error(error.friendlyMessage || "Purchase failed.")
    } finally {
      setBusy(null)
    }
  }

  const handleRestock = async () => {
    setBusy("restock")
    try {
      const updated = await vehiclesApi.restock(vehicle.id, restockQty)
      toast.success(`Restocked ${restockQty} units.`)
      onChanged?.(updated?.vehicle || updated)
    } catch (error) {
      toast.error(error.friendlyMessage || "Restock failed.")
    } finally {
      setBusy(null)
    }
  }

  if (purchaseSuccess) {
    return (
      <Modal open={open} onClose={onClose} className="max-w-md" labelledBy="purchase-success-title">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
            <PartyPopper className="h-8 w-8" aria-hidden="true" />
          </span>
          <div>
            <h2 id="purchase-success-title" className="text-xl font-semibold tracking-tight text-foreground">
              Congratulations!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You purchased {purchaseSuccess.quantity} × {purchaseSuccess.title}. It's on its way to your garage.
            </p>
          </div>
          <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setPurchaseSuccess(null)}
              className="h-11 flex-1 rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Keep browsing this vehicle
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose} className="max-w-3xl" labelledBy="vehicle-modal-title">
      <div className="overflow-hidden rounded-2xl">
        <div className="relative h-56 w-full bg-muted sm:h-72">
          <img
            src={vehicleImage(vehicle) || "/placeholder.svg"}
            alt={`${vehicleTitle(vehicle)} exterior`}
            className="h-full w-full object-cover"
          />
          <span
            className={cn(
              "absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur",
              tone.classes,
            )}
          >
            {tone.label}
          </span>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="vehicle-modal-title" className="text-xl font-semibold tracking-tight text-foreground">
                {vehicleTitle(vehicle)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {[vehicle.category, vehicle.year].filter(Boolean).join(" · ") || "Vehicle"}
              </p>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-primary">{formatCurrency(vehicle.price)}</p>
          </div>

          {vehicle.description ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{vehicle.description}</p>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SpecRow icon={CalendarDays} label="Year" value={vehicle.year} />
            <SpecRow icon={Tag} label="Category" value={vehicle.category} />
            <SpecRow icon={Fuel} label="Fuel" value={vehicle.fuel_type || vehicle.fuel} />
            <SpecRow icon={Cog} label="Transmission" value={vehicle.transmission} />
            <SpecRow icon={Boxes} label="Stock" value={`${stock} units`} />
            <SpecRow icon={Tag} label="Price" value={formatCurrency(vehicle.price)} />
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <QuantityStepper value={quantity} onChange={setQuantity} max={stock || 1} label="Quantity" />
              <button
                type="button"
                onClick={handlePurchase}
                disabled={stock <= 0 || busy === "purchase"}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                {busy === "purchase" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                )}
                {stock <= 0 ? "Out of stock" : "Purchase"}
              </button>
            </div>

            {isAdmin ? (
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin actions</p>
                <div className="flex flex-wrap items-center gap-3">
                  <QuantityStepper value={restockQty} onChange={setRestockQty} label="Restock" />
                  <button
                    type="button"
                    onClick={handleRestock}
                    disabled={busy === "restock"}
                    className="flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-70"
                  >
                    {busy === "restock" ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <PackagePlus className="h-4 w-4" aria-hidden="true" />
                    )}
                    Restock
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit?.(vehicle)}
                    className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(vehicle)}
                    className="flex h-10 items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Modal>
  )
}
