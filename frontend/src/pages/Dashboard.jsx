import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import {
  AlertTriangle,
  Boxes,
  CircleSlash,
  DollarSign,
  Layers,
  PackagePlus,
  Plus,
  RefreshCw,
  ServerCrash,
} from "lucide-react"
import StatsCard from "../components/StatsCard"
import VehicleCard from "../components/VehicleCard"
import VehicleModal from "../components/VehicleModal"
import VehicleForm from "../components/VehicleForm"
import Modal from "../components/Modal"
import DeleteModal from "../components/DeleteModal"
import LoadingSpinner from "../components/LoadingSpinner"
import { normaliseList, vehiclesApi } from "../api/vehicles"
import { formatCompactCurrency, formatCurrency, stockTone, vehicleTitle, cn } from "../lib/utils"

function pickNumber(source, keys, fallback = 0) {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === "number") return value
    if (typeof value === "string" && value !== "" && !Number.isNaN(Number(value))) return Number(value)
  }
  return fallback
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsResult, recentResult, lowStockResult] = await Promise.allSettled([
        vehiclesApi.stats(),
        vehiclesApi.list({ limit: 6, skip: 0, page: 1, page_size: 6, sort_by: "created_at", order: "desc" }),
        vehiclesApi.lowStock(),
      ])

      if (statsResult.status === "fulfilled") setStats(statsResult.value)
      if (recentResult.status === "fulfilled") setRecent(normaliseList(recentResult.value).items)
      if (lowStockResult.status === "fulfilled") setLowStock(normaliseList(lowStockResult.value).items)

      const allFailed = [statsResult, recentResult, lowStockResult].every((r) => r.status === "rejected")
      if (allFailed) {
        setError(statsResult.reason?.friendlyMessage || "Unable to load dashboard data.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalModels = pickNumber(stats, ["total_vehicle_models", "total_models", "total_vehicles", "totalModels", "models", "count"])
  const totalStock = pickNumber(stats, ["total_stock", "totalStock", "stock", "total_units"])
  const inventoryValue = pickNumber(stats, ["inventory_value", "total_value", "totalValue", "value"])
  const outOfStock = pickNumber(stats, ["out_of_stock", "outOfStock", "out_of_stock_count"])

  const handleChanged = (updated) => {
    if (updated?.id) {
      setRecent((current) => current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)))
      setSelected((current) => (current && current.id === updated.id ? { ...current, ...updated } : current))
    }
    load()
  }

  const handleCreate = async (values) => {
    try {
      await vehiclesApi.create(values)
      toast.success("Vehicle added to inventory.")
      setCreating(false)
      load()
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not create vehicle.")
    }
  }

  const handleUpdate = async (values) => {
    try {
      await vehiclesApi.update(editing.id, values)
      toast.success("Vehicle updated.")
      setEditing(null)
      load()
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not update vehicle.")
    }
  }

  const handleDelete = async () => {
    try {
      await vehiclesApi.remove(deleting.id)
      toast.success("Vehicle deleted.")
      setDeleting(null)
      setSelected(null)
      load()
    } catch (err) {
      toast.error(err.friendlyMessage || "Could not delete vehicle.")
    }
  }

  const handleQuickRestock = async (vehicle, quantity = 5) => {
    try {
      await vehiclesApi.restock(vehicle.id, quantity)
      toast.success(`Restocked ${quantity} × ${vehicleTitle(vehicle)}.`)
      load()
    } catch (err) {
      toast.error(err.friendlyMessage || "Restock failed.")
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dealership dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live inventory health, recent listings and quick actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add vehicle
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner full label="Loading dashboard" />
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <ServerCrash className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="text-base font-semibold text-foreground">Could not reach the API</h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-1 h-10 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard label="Total models" value={totalModels} hint="Distinct listings" icon={Layers} tone="primary" />
            <StatsCard label="Total stock" value={totalStock} hint="Units on the lot" icon={Boxes} tone="accent" />
            <StatsCard
              label="Inventory value"
              value={formatCompactCurrency(inventoryValue)}
              hint={formatCurrency(inventoryValue)}
              icon={DollarSign}
              tone="primary"
            />
            <StatsCard
              label="Out of stock"
              value={outOfStock}
              hint="Needs restocking"
              icon={CircleSlash}
              tone="destructive"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2">
              <h2 className="text-base font-semibold text-foreground">Recent vehicles</h2>
              <p className="mt-1 text-sm text-muted-foreground">The latest listings added to your inventory.</p>
              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                {recent.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                    No vehicles yet. Add your first listing to get started.
                  </p>
                ) : (
                  recent.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={setSelected} />
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
                Low stock alerts
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Restock these before they sell out.</p>
              <div className="mt-4 flex flex-col gap-3">
                {lowStock.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                    Every model is comfortably stocked.
                  </p>
                ) : (
                  lowStock.map((vehicle) => {
                    const tone = stockTone(vehicle.stock ?? vehicle.quantity)
                    return (
                      <div
                        key={vehicle.id}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => setSelected(vehicle)}
                            className="block max-w-full truncate text-left text-sm font-semibold text-foreground hover:text-primary"
                          >
                            {vehicleTitle(vehicle)}
                          </button>
                          <span
                            className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold", tone.classes)}
                          >
                            {tone.label}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickRestock(vehicle)}
                          className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                        >
                          <PackagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                          +5
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          </div>
        </>
      )}

      <VehicleModal
        vehicle={selected}
        open={Boolean(selected) && !editing && !deleting}
        onClose={() => setSelected(null)}
        onEdit={setEditing}
        onDelete={setDeleting}
        onChanged={handleChanged}
      />

      <Modal open={creating} onClose={() => setCreating(false)} className="max-w-2xl" labelledBy="dash-create-title">
        <div className="p-6">
          <h2 id="dash-create-title" className="text-lg font-semibold text-foreground">
            Add a vehicle
          </h2>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">Create a new listing in your dealership inventory.</p>
          <VehicleForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} className="max-w-2xl" labelledBy="dash-edit-title">
        <div className="p-6">
          <h2 id="dash-edit-title" className="text-lg font-semibold text-foreground">
            Edit {vehicleTitle(editing)}
          </h2>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">Update the specification, price or stock level.</p>
          <VehicleForm vehicle={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
        </div>
      </Modal>

      <DeleteModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={`Delete ${vehicleTitle(deleting)}?`}
      />
    </div>
  )
}
