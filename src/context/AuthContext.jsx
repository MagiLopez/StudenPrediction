import { createContext, useContext, useState } from "react"
import axios from "axios"

const API_BASE = "http://localhost:8000"
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Recuperar sesión guardada en localStorage
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("edupredict_user")) || null }
    catch { return null }
  })

  // ── Login: llama a POST /student/login ───────────────────────────────────────
  const login = async (correo, contraseña) => {
    try {
      // El endpoint espera un StudentFeatures completo, pero para login
      // solo enviamos correo y contraseña con campos dummy requeridos
      const { data } = await axios.post(`${API_BASE}/student/login`, {
        correo,
        contraseña,
        // Campos dummy requeridos por el schema (el backend solo valida correo/contraseña)
        edad: 0, sexo: "M", promedio_general: 0, materias_repetidas: "No",
        horas_tutoria: 0, trabaja: "No", ingreso_mensual: 0,
        apoyo_familiar: "Bajo", responsabilidades_familiares: "Bajo",
        becado: "No", matricula_al_dia: "No", deudor: "No",
        desplazado: "No", tipo_vivienda: "Propia",
        ratio_aprobacion_sem1: 0, ratio_aprobacion_sem2: 0,
      })

      // Si el backend responde con HTTPException (error) no es login exitoso
      if (data?.detail) return { ok: false, msg: data.detail }

      const userData = { correo, nombre: correo.split("@")[0], email: correo }
      setUser(userData)
      localStorage.setItem("edupredict_user", JSON.stringify(userData))
      return { ok: true }
    } catch (err) {
      if (err.response?.status === 401) return { ok: false, msg: "Credenciales incorrectas" }
      if (err.code === "ERR_NETWORK") return { ok: false, msg: "No se pudo conectar al servidor" }
      return { ok: false, msg: "Error inesperado. Intenta nuevamente." }
    }
  }

  // ── Registro: llama a POST /student ─────────────────────────────────────────
  // Solo crea la cuenta, NO hace predicción todavía
  const register = async (correo, contraseña) => {
    try {
      await axios.post(`${API_BASE}/student`, {
        correo,
        contraseña,
        // Campos vacíos/dummy — se llenarán al hacer la predicción
        edad: 0, sexo: "M", promedio_general: 0, materias_repetidas: "No",
        horas_tutoria: 0, trabaja: "No", ingreso_mensual: 0,
        apoyo_familiar: "Bajo", responsabilidades_familiares: "Bajo",
        becado: "No", matricula_al_dia: "No", deudor: "No",
        desplazado: "No", tipo_vivienda: "Propia",
        ratio_aprobacion_sem1: 0, ratio_aprobacion_sem2: 0,
      })
      // Después de registrar, hacer login automáticamente
      return await login(correo, contraseña)
    } catch (err) {
      if (err.response?.status === 422) return { ok: false, msg: "Datos inválidos. Revisa el correo." }
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
