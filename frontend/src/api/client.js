import axios from "axios"

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"

export const TOKEN_KEY = "autostock_token"
export const USER_KEY = "autostock_user"

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
})

/* Attach the JWT to every outgoing request */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* Normalise errors and auto-logout on 401 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.dispatchEvent(new Event("autostock:unauthorized"))
    }

    const detail = error?.response?.data?.detail
    let message = "Something went wrong. Please try again."

    if (typeof detail === "string") {
      message = detail
    } else if (Array.isArray(detail) && detail.length > 0) {
      message = detail.map((d) => d.msg || d.message).filter(Boolean).join(", ") || message
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message === "Network Error") {
      message = `Cannot reach the API at ${API_URL}`
    }

    error.friendlyMessage = message
    return Promise.reject(error)
  },
)

export default api
