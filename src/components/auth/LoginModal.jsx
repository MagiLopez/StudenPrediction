import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Tabs: Login / Registro ────────────────────────────────────────────────────
function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
        active ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

export default function LoginModal({ open, onOpenChange }) {
  const { login, register } = useAuth()
  const [modo, setModo]         = useState("login")   // "login" | "registro"
  const [correo, setCorreo]     = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")      // solo en registro
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")
  const [loading, setLoading]   = useState(false)

  const reset = () => {
    setCorreo(""); setPassword(""); setPassword2("")
    setError(""); setSuccess(""); setLoading(false); setShowPwd(false)
  }

  const handleModo = (m) => { setModo(m); reset() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(""); setSuccess("")

    // Validaciones básicas frontend
    if (!correo || !password) {
      setError("Completa todos los campos"); return
    }
    if (modo === "registro") {
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres"); return
      }
      if (password !== password2) {
        setError("Las contraseñas no coinciden"); return
      }
    }

    setLoading(true)
    const fn = modo === "login" ? login : register
    const result = await fn(correo, password)

    if (result.ok) {
      if (modo === "registro") {
        setSuccess("¡Cuenta creada! Sesión iniciada.")
        setTimeout(() => { onOpenChange(false); reset() }, 1200)
      } else {
        onOpenChange(false); reset()
      }
    } else {
      setError(result.msg)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-xl">EduPredict</DialogTitle>
          <DialogDescription>
            {modo === "login" ? "Inicia sesión para acceder al sistema" : "Crea tu cuenta para comenzar"}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-1 mt-1">
          <Tab active={modo === "login"}    onClick={() => handleModo("login")}>Iniciar sesión</Tab>
          <Tab active={modo === "registro"} onClick={() => handleModo("registro")}>Crear cuenta</Tab>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Correo */}
          <div className="space-y-2">
            <Label htmlFor="auth-email">Correo electrónico</Label>
            <Input
              id="auth-email"
              type="email"
              placeholder="coordinador@ejemplo.com"
              value={correo}
              onChange={e => { setCorreo(e.target.value); setError("") }}
              required
              autoFocus
              disabled={loading}
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="auth-pwd">Contraseña</Label>
            <div className="relative">
              <Input
                id="auth-pwd"
                type={showPwd ? "text" : "password"}
                placeholder={modo === "registro" ? "Mínimo 6 caracteres" : "••••••••"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError("") }}
                required
                disabled={loading}
                className="pr-10"
              />
              <button type="button" tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPwd(v => !v)}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña — solo en registro */}
          {modo === "registro" && (
            <div className="space-y-2">
              <Label htmlFor="auth-pwd2">Confirmar contraseña</Label>
              <Input
                id="auth-pwd2"
                type={showPwd ? "text" : "password"}
                placeholder="Repite la contraseña"
                value={password2}
                onChange={e => { setPassword2(e.target.value); setError("") }}
                required
                disabled={loading}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Éxito */}
          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {modo === "login" ? "Iniciando..." : "Creando cuenta..."}</>
              : modo === "login" ? "Iniciar sesión" : "Crear cuenta"
            }
          </Button>
        </form>

        {/* Nota informativa */}
        <div className="mt-2 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            {modo === "login"
              ? "¿No tienes cuenta? Haz clic en \"Crear cuenta\" arriba."
              : "Al crear una cuenta podrás hacer predicciones y ver el historial."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
