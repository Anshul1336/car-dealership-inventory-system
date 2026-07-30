import { useState } from "react"
import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import AuthModal from "../components/AuthModal"

export default function AppLayout() {
  const [search, setSearch] = useState("")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar search={search} onSearchChange={setSearch} />
      <main className="flex-1">
        <Outlet context={{ search, setSearch }} />
      </main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground lg:px-8">
          <p className="font-medium text-foreground">AutoStock</p>
          <p>Dealership inventory management — connected to your FastAPI backend.</p>
        </div>
      </footer>
      <AuthModal />
    </div>
  )
}
