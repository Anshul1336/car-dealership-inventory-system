import { cn } from "../lib/utils"

/** Sticky left column shell used by the inventory filters. */
export default function Sidebar({ children, className }) {
  return (
    <aside
      className={cn(
        "w-full shrink-0 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:w-72 lg:overflow-y-auto lg:pr-1 no-scrollbar",
        className,
      )}
      aria-label="Inventory filters"
    >
      {children}
    </aside>
  )
}
