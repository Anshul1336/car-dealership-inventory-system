import { useCallback, useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { toast } from "react-toastify"
import { PackageSearch, Plus, ServerCrash } from "lucide-react"
import Sidebar from "../components/Sidebar"
import FilterSidebar from "../components/FilterSidebar"
import VehicleCard from "../components/VehicleCard"
import VehicleModal from "../components/VehicleModal"
import VehicleForm from "../components/VehicleForm"
import Modal from "../components/Modal"
import DeleteModal from "../components/DeleteModal"
import Pagination from "../components/Pagination"
import LoadingSpinner from "../components/LoadingSpinner"
import { normaliseList, vehiclesApi } from "../api/vehicles"
import { useAuth } from "../context/AuthContext"
import { parseSort, vehicleTitle } from "../lib/utils"

const PAGE_SIZE = 9

export const EMPTY_FILTERS = {
  category: "",
  fuel_type: "",
  transmission: "",
  min_price: "",
  max_price: "",
  min_year: "",
  max_year: "",
  sort: "",
  in_stock_only: false,
}

export default function Inventory() {
  const { search } = useOutletContext()
  const { isAdmin } = useAuth()

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [vehicles, setVehicles] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const params = useMemo(() => {
    const { sort_by, order } = parseSort(filters.sort)
    const query = {
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      category: filters.category || undefined,
      fuel_type: filters.fuel_type || undefined,
      transmission: filters.transmission || undefined,
      min_price: filters.min_price || undefined,
      max_price: filters.max_price || undefined,
      min_year: filters.min_year || undefined,
      max_year: filters.max_year || undefined,
      in_stock: filters.in_stock_only || undefined,
      sort_by,
      order,
    }
    return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined))
  }, [filters, page, search])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await vehiclesApi.list(params)
      const { items, total: count } = normaliseList(data)
      setVehicles(items)
      setTotal(count)
    } catch (err) {
      setError(err.friendlyMessage || "Unable to load inventory.")
      setVehicles([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    load()
  }, [load])

  /* Reset to page 1 whenever the query changes */
  useEffect(() => {
    setPage(1)
  }, [search, filters])

  const totalPages = Math.max(1, Math.ceil((total || vehicles.length) / PAGE_SIZE))

  const handleChanged = (updated) => {
    if (updated?.id) {
      setVehicles((current) => current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)))
      setSelected((current) => (current && current.id === updated.id ? { ...current, ...updated } : current))
    } else {
      load()
    }
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
      const updated = await vehiclesApi.update(editing.id, values)
      toast.success("Vehicle updated.")
      setEditing(null)
      handleChanged(updated?.vehicle || updated || { id: editing.id, ...values })
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

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
      <Sidebar>
        <FilterSidebar filters={filters} onChange={setFilters} onReset={() => setFilters(EMPTY_FILTERS)} />
      </Sidebar>

      <section className="min-w-0 flex-1">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Vehicle inventory</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? "Loading vehicles…" : `${total || vehicles.length} vehicle${total === 1 ? "" : "s"} available`}
              {search ? ` for “${search}”` : ""}
            </p>
          </div>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add vehicle
            </button>
          ) : null}
        </div>

        <div className="mt-5">
          {loading ? (
            <LoadingSpinner full label="Fetching inventory" />
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
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <PackageSearch className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-base font-semibold text-foreground">No vehicles match your filters</h2>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Try widening the price range or clearing a filter to see more of the inventory.
              </p>
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="mt-1 h-10 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={setSelected} />
              ))}
            </div>
          )}
        </div>

        {!loading && !error ? <div className="mt-6"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div> : null}
      </section>

      <VehicleModal
        vehicle={selected}
        open={Boolean(selected) && !editing && !deleting}
        onClose={() => setSelected(null)}
        onEdit={setEditing}
        onDelete={setDeleting}
        onChanged={handleChanged}
      />

      <Modal open={creating} onClose={() => setCreating(false)} className="max-w-2xl" labelledBy="create-vehicle-title">
        <div className="p-6">
          <h2 id="create-vehicle-title" className="text-lg font-semibold text-foreground">
            Add a vehicle
          </h2>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">Create a new listing in your dealership inventory.</p>
          <VehicleForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} className="max-w-2xl" labelledBy="edit-vehicle-title">
        <div className="p-6">
          <h2 id="edit-vehicle-title" className="text-lg font-semibold text-foreground">
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
