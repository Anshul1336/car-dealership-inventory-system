import { useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, openAuth } = useAuth()
  const location = useLocation()
  const blocked = !isAuthenticated || (adminOnly && !isAdmin)

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Please sign in to continue.")
      openAuth("login")
    } else if (adminOnly && !isAdmin) {
      toast.error("Admin access required.")
    }
  }, [isAuthenticated, isAdmin, adminOnly, openAuth])

  if (blocked) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return children
}
