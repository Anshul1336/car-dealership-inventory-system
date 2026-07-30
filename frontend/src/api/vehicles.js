import api from "./client"

export const vehiclesApi = {
  /* The backend returns the page as a bare array plus the true across-all-pages
   * count in an X-Total-Count header (array.length alone would only ever
   * reflect the current page). */
  list: (params) =>
    api.get("/vehicles", { params }).then((r) => {
      const headerTotal = r.headers?.["x-total-count"]
      return {
        items: r.data,
        total: headerTotal !== undefined ? Number(headerTotal) : r.data.length,
      }
    }),
  get: (id) => api.get(`/vehicles/${id}`).then((r) => r.data),
  create: (payload) => api.post("/vehicles", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/vehicles/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/vehicles/${id}`).then((r) => r.data),
  purchase: (id, quantity = 1) => api.post(`/vehicles/${id}/purchase`, { quantity }).then((r) => r.data),
  restock: (id, quantity = 1) => api.post(`/vehicles/${id}/restock`, { quantity }).then((r) => r.data),
  stats: () => api.get("/vehicles/stats").then((r) => r.data),
  lowStock: () => api.get("/vehicles/low-stock").then((r) => r.data),
}

export const authApi = {
  /* Backend login is an OAuth2PasswordRequestForm endpoint: form-urlencoded, field name "username". */
  login: ({ email, password }) =>
    api
      .post(
        "/auth/login",
        new URLSearchParams({ username: email, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      )
      .then((r) => r.data),
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
}

/*
 * The FastAPI backend may return either a bare array or a paginated
 * envelope ({ items, total, ... }). Normalise both shapes.
 */
export function normaliseList(data) {
  if (Array.isArray(data)) return { items: data, total: data.length }
  const items = data?.items || data?.results || data?.vehicles || data?.data || []
  return {
    items: Array.isArray(items) ? items : [],
    total: data?.total ?? data?.count ?? (Array.isArray(items) ? items.length : 0),
  }
}
