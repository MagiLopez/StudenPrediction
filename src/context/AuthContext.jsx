import { createContext, useContext, useState } from "react"
import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Recuperar sesión guardada en localStorage
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("edupredict_user")) || null }
    catch { return null }
  })

  // ── Login: llama a POST /login (endpoint de admin) ─────────────────────────
  const login = async (correo, contraseña) => {
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        correo,
        contraseña,
      })

      // Si el login es exitoso, response.data contiene el admin
      if (response.data?.admin) {
        const userData = { 
          correo: response.data.admin.correo,
          nombre: response.data.admin.Nombre,
          apellido: response.data.admin.Apellido,
          email: response.data.admin.correo,
          role: "admin"
        }
        setUser(userData)
        localStorage.setItem("edupredict_user", JSON.stringify(userData))
        return { ok: true }
      }
      
      return { ok: false, msg: "Credenciales incorrectas" }
    } catch (err) {
      if (err.response?.status === 401) return { ok: false, msg: "Credenciales incorrectas" }
      if (err.code === "ERR_NETWORK") return { ok: false, msg: "No se pudo conectar al servidor" }
      return { ok: false, msg: "Error inesperado. Intenta nuevamente." }
    }
  }

  // ── Registro: crear admin ─────────────────────────────────────────────────
  const register = async (correo, contraseña, nombre, apellido) => {
    try {
      await axios.post(`${API_BASE}/admin`, {
        correo,
        contraseña,
        Nombre: nombre,
        Apellido: apellido,
      })
      // Después de registrar, hacer login automáticamente
      return await login(correo, contraseña)
    } catch (err) {
      if (err.response?.status === 422) return { ok: false, msg: "Datos inválidos. Revisa los campos." }
      if (err.code === "ERR_NETWORK") return { ok: false, msg: "No se pudo conectar al servidor" }
      return { ok: false, msg: "Error al crear la cuenta. Intenta nuevamente." }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("edupredict_user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  return ctx
}