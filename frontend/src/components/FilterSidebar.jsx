import { SlidersHorizontal, RotateCcw } from "lucide-react"
import { CATEGORIES, FUEL_TYPES, SORT_OPTIONS, TRANSMISSIONS, cn } from "../lib/utils"

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

const controlClass =
  "h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"

function Chips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(active ? "" : option)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export default function FilterSidebar({ filters, onChange, onReset, categories = CATEGORIES }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value })

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
          Filters
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        <Field label="Category">
          <Chips options={categories} value={filters.category} onChange={set("category")} />
        </Field>

        <Field label="Fuel type">
          <select value={filters.fuel_type} onChange={(e) => set("fuel_type")(e.target.value)} className={controlClass}>
            <option value="">Any fuel type</option>
            {FUEL_TYPES.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Transmission">
          <select
            value={filters.transmission}
            onChange={(e) => set("transmission")(e.target.value)}
            className={controlClass}
          >
            <option value="">Any transmission</option>
            {TRANSMISSIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Price range (USD)">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Min"
              value={filters.min_price}
              onChange={(e) => set("min_price")(e.target.value)}
              className={controlClass}
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Max"
              value={filters.max_price}
              onChange={(e) => set("max_price")(e.target.value)}
              className={controlClass}
            />
          </div>
        </Field>

        <Field label="Year">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="From"
              value={filters.min_year}
              onChange={(e) => set("min_year")(e.target.value)}
              className={controlClass}
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="number"
              placeholder="To"
              value={filters.max_year}
              onChange={(e) => set("max_year")(e.target.value)}
              className={controlClass}
            />
          </div>
        </Field>

        <Field label="Sort by">
          <select value={filters.sort} onChange={(e) => set("sort")(e.target.value)} className={controlClass}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3">
          <input
            type="checkbox"
            checked={filters.in_stock_only}
            onChange={(e) => set("in_stock_only")(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-[var(--color-primary)]"
          />
          <span className="text-sm font-medium text-foreground">In stock only</span>
        </label>
      </div>
    </div>
  )
}
