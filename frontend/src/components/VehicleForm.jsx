import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import { CATEGORIES, FUEL_TYPES, TRANSMISSIONS } from "../lib/utils"

const controlClass =
  "h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"

function Row({ label, error, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs font-medium text-destructive">{error.message}</p> : null}
    </div>
  )
}

export default function VehicleForm({ vehicle, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      make: vehicle?.make || "",
      model: vehicle?.model || "",
      year: vehicle?.year || new Date().getFullYear(),
      category: vehicle?.category || CATEGORIES[0],
      fuel_type: vehicle?.fuel_type || vehicle?.fuel || FUEL_TYPES[0],
      transmission: vehicle?.transmission || TRANSMISSIONS[0],
      color: vehicle?.color || "",
      price: vehicle?.price ?? "",
      quantity: vehicle?.quantity ?? vehicle?.stock ?? 0,
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      year: Number(values.year),
      price: Number(values.price),
      quantity: Number(values.quantity),
    })
  })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Row label="Make" htmlFor="make" error={errors.make}>
          <input
            id="make"
            placeholder="Toyota"
            className={controlClass}
            {...register("make", { required: "Make is required" })}
          />
        </Row>
        <Row label="Model" htmlFor="model" error={errors.model}>
          <input
            id="model"
            placeholder="Corolla"
            className={controlClass}
            {...register("model", { required: "Model is required" })}
          />
        </Row>
        <Row label="Year" htmlFor="year" error={errors.year}>
          <input
            id="year"
            type="number"
            className={controlClass}
            {...register("year", {
              required: "Year is required",
              min: { value: 1900, message: "Enter a valid year" },
              max: { value: new Date().getFullYear() + 2, message: "Year is too far in the future" },
            })}
          />
        </Row>
        <Row label="Category" htmlFor="category" error={errors.category}>
          <select id="category" className={controlClass} {...register("category", { required: "Pick a category" })}>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Fuel type" htmlFor="fuel_type" error={errors.fuel_type}>
          <select id="fuel_type" className={controlClass} {...register("fuel_type", { required: "Pick a fuel type" })}>
            {FUEL_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Transmission" htmlFor="transmission" error={errors.transmission}>
          <select
            id="transmission"
            className={controlClass}
            {...register("transmission", { required: "Pick a transmission" })}
          >
            {TRANSMISSIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Color" htmlFor="color" error={errors.color}>
          <input
            id="color"
            placeholder="Black"
            className={controlClass}
            {...register("color", { required: "Color is required" })}
          />
        </Row>
        <Row label="Price (USD)" htmlFor="price" error={errors.price}>
          <input
            id="price"
            type="number"
            step="1"
            placeholder="24500"
            className={controlClass}
            {...register("price", {
              required: "Price is required",
              min: { value: 0, message: "Price cannot be negative" },
            })}
          />
        </Row>
        <Row label="Stock" htmlFor="quantity" error={errors.quantity}>
          <input
            id="quantity"
            type="number"
            className={controlClass}
            {...register("quantity", {
              required: "Stock is required",
              min: { value: 0, message: "Stock cannot be negative" },
            })}
          />
        </Row>
      </div>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {vehicle ? "Save changes" : "Add vehicle"}
        </button>
      </div>
    </form>
  )
}
