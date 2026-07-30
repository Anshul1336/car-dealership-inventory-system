import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
import { authApi } from "../api/vehicles"
import { TOKEN_KEY, USER_KEY } from "../api/client"

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [authModal, setAuthModal] = useState(null) // 'login' | 'register' | null

  const logout = useCallback(
    (silent = false) => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setToken(null)
      setUser(null)
      if (!silent) toast.info("You have been signed out.")
    },
    [],
  )

  useEffect(() => {
    const handler = () => {
      setToken(null)
      setUser(null)
      toast.error("Your session expired. Please sign in again.")
    }
    window.addEventListener("autostock:unauthorized", handler)
    return () => window.removeEventListener("autostock:unauthorized", handler)
  }, [])

  /* Login only returns a token, so the user profile (incl. is_admin) is fetched separately via /auth/me. */
  const persistToken = useCallback(async (data) => {
    const accessToken = data?.access_token || data?.token || data?.accessToken
    if (!accessToken) return null

    localStorage.setItem(TOKEN_KEY, accessToken)
    setToken(accessToken)

    const profile = await authApi.me()
    localStorage.setItem(USER_KEY, JSON.stringify(profile))
    setUser(profile)
    return profile
  }, [])

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials)
      const profile = await persistToken(data)
      toast.success(`Welcome back${profile?.username ? `, ${profile.username}` : ""}!`)
      setAuthModal(null)
      return data
    },
    [persistToken],
  )

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload)
      toast.success("Account created. Please sign in.")
      setAuthModal("login")
      return data
    },
    [],
  )

  const isAdmin = useMemo(() => {
    if (!user) return false
    if (user.is_admin === true || user.is_superuser === true) return true
    const role = String(user.role || user.user_role || "").toLowerCase()
    return role === "admin" || role === "superadmin" || role === "staff"
  }, [user])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isAdmin,
      login,
      register,
      logout,
      authModal,
      openAuth: setAuthModal,
      closeAuth: () => setAuthModal(null),
    }),
    [user, token, isAdmin, login, register, logout, authModal],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
