export function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

export function formatCurrency(value) {
  const number = Number(value || 0)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(number)
}

export function formatCompactCurrency(value) {
  const number = Number(value || 0)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: number >= 100000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(number)
}

export function vehicleTitle(vehicle) {
  if (!vehicle) return ""
  return [vehicle.make, vehicle.model].filter(Boolean).join(" ") || vehicle.name || "Vehicle"
}

export function vehicleImage(vehicle) {
  return (
    vehicle?.image_url ||
    vehicle?.image ||
    vehicle?.thumbnail ||
    `/vehicle-placeholder.png`
  )
}

export function stockTone(stock) {
  const value = Number(stock ?? 0)
  if (value <= 0) return { label: "Out of stock", classes: "bg-destructive/10 text-destructive" }
  if (value <= 3) return { label: `Low stock · ${value}`, classes: "bg-amber-100 text-amber-700" }
  return { label: `In stock · ${value}`, classes: "bg-accent/10 text-accent" }
}

/* Must mirror backend/app/modules/vehicles/enums.py exactly — the API rejects any other value. */
export const CATEGORIES = [
  "Sedan",
  "Hatchback",
  "SUV",
  "Compact SUV",
  "MUV",
  "Coupe",
  "Convertible",
  "Pickup",
  "Van",
  "Sports",
  "Luxury",
]
export const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"]
export const TRANSMISSIONS = ["Manual", "Automatic"]

export const SORT_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "year_desc", label: "Year: newest" },
  { value: "year_asc", label: "Year: oldest" },
  { value: "stock_desc", label: "Stock: highest" },
]

/* UI sort keys don't always match backend column names. */
const SORT_COLUMN_MAP = { stock: "quantity" }

export function parseSort(sort) {
  if (!sort) return {}
  const [key, order] = sort.split("_")
  return { sort_by: SORT_COLUMN_MAP[key] || key, order }
}
