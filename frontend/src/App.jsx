import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { AuthProvider } from "./context/AuthContext"
import AppLayout from "./layouts/AppLayout"
import Inventory from "./pages/Inventory"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Inventory />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3200}
          newestOnTop
          closeOnClick
          hideProgressBar={false}
          theme="light"
          toastClassName="!rounded-xl !text-sm"
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
