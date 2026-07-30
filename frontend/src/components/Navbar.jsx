import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { CarFront, LayoutDashboard, LogOut, Menu, PackageSearch, ShieldCheck, UserRound, X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import SearchBar from "./SearchBar"
import { cn } from "../lib/utils"

export default function Navbar({ search, onSearchChange }) {
  const { isAuthenticated, isAdmin, user, logout, openAuth } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const navLinkClass = ({ isActive }) =>
    cn(
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
    )

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate("/")
  }

  const displayName = user?.username || user?.email || "Account"

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CarFront className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Auto<span className="text-primary">Stock</span>
          </span>
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBar value={search} onChange={onSearchChange} className="max-w-md" />
        </div>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            <PackageSearch className="h-4 w-4" aria-hidden="true" />
            Inventory
          </NavLink>
          {isAdmin ? (
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </NavLink>
          ) : null}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-primary">
                  {isAdmin ? (
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                <span className="max-w-32 truncate text-sm font-medium text-foreground">{displayName}</span>
                {isAdmin ? (
                  <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                    Admin
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="h-10 rounded-xl px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => openAuth("register")}
                className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Create account
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground md:hidden"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchBar value={search} onChange={onSearchChange} />
      </div>

      {menuOpen ? (
        <div className="border-t border-border bg-card px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>
              <PackageSearch className="h-4 w-4" aria-hidden="true" />
              Inventory
            </NavLink>
            {isAdmin ? (
              <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Dashboard
              </NavLink>
            ) : null}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            {isAuthenticated ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Signed in as <span className="font-medium text-foreground">{displayName}</span>
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="h-10 rounded-xl border border-border text-sm font-medium text-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    openAuth("login")
                    setMenuOpen(false)
                  }}
                  className="h-10 rounded-xl border border-border text-sm font-medium text-foreground"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openAuth("register")
                    setMenuOpen(false)
                  }}
                  className="h-10 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
                >
                  Create account
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
