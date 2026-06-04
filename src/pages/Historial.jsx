import { useState, useEffect, useMemo } from "react"
import {
  Search, Filter, Eye, X, User, BookOpen, Wallet, Users,
  TrendingUp, TrendingDown, Minus, ChevronDown, Loader2, Mail, Calendar, ChevronLeft, ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getHistorial, getEstudianteDetalle } from "@/services/api"

const RIESGO_CONFIG = {
  Alto:  { label: "Alto",  color: "bg-red-100 text-red-700 border-red-200",    dot: "bg-red-500",    icon: TrendingDown },
  Medio: { label: "Medio", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400", icon: Minus },
  Bajo:  { label: "Bajo",  color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: TrendingUp },
}

function RiesgoBadge({ nivel, size = "sm" }) {
  const cfg = RIESGO_CONFIG[nivel] || RIESGO_CONFIG.Medio
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-medium",
      size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
      cfg.color
    )}>
      <span className={cn("rounded-full shrink-0", size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2", cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function ProbaBar({ value, nivel }) {
  const colors = { Alto: "bg-red-500", Medio: "bg-amber-400", Bajo: "bg-emerald-500" }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", colors[nivel] || "bg-slate-400")} style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{Math.round(value * 100)}%</span>
    </div>
  )
}

function DetallePanel({ estudiante, onClose, onBack }) {
  if (!estudiante) return null

  const sections = [
    {
      label: "Datos Personales", icon: User,
      fields: [
        ["Nombres", estudiante.nombres],
        ["Apellidos", estudiante.apellidos],
        ["Correo", estudiante.correo],
        ["Edad", estudiante.edad],
        ["Sexo", estudiante.sexo],
      ]
    },
    {
      label: "Académicas", icon: BookOpen,
      fields: [
        ["Promedio general", estudiante.promedio_general],
        ["Materias repetidas", estudiante.materias_repetidas],
        ["Ratio aprobación sem. 1", estudiante.ratio_aprobacion_sem1],
        ["Ratio aprobación sem. 2", estudiante.ratio_aprobacion_sem2],
        ["Horas de tutoría", estudiante.horas_tutoria],
      ]
    },
    {
      label: "Económicas", icon: Wallet,
      fields: [
        ["Ingreso mensual", `$${Number(estudiante.ingreso_mensual).toLocaleString("es-CO")}`],
        ["Becado", estudiante.becado],
        ["Matrícula al día", estudiante.matricula_al_dia],
        ["Deudor", estudiante.deudor],
      ]
    },
    {
      label: "Sociales", icon: Users,
      fields: [
        ["Apoyo familiar", estudiante.apoyo_familiar],
        ["Responsabilidades", estudiante.responsabilidades_familiares],
        ["Tipo de vivienda", estudiante.tipo_vivienda],
        ["Desplazado", estudiante.desplazado],
        ["Trabaja", estudiante.trabaja],
      ]
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200">
        <div className="px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                {estudiante.nombres?.charAt(0) || "?"}
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">{estudiante.nombres} {estudiante.apellidos}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {estudiante.correo}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {estudiante.predicciones?.length > 0 && (
            <div className={cn(
              "mt-4 rounded-xl p-4 border flex items-center gap-4",
              RIESGO_CONFIG[estudiante.predicciones[0].nivel_riesgo]?.color || "bg-slate-50"
            )}>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                estudiante.predicciones[0].nivel_riesgo === "Alto" ? "bg-red-200" :
                estudiante.predicciones[0].nivel_riesgo === "Medio" ? "bg-amber-200" : "bg-emerald-200"
              )}>
                {(() => {
                  const Icon = RIESGO_CONFIG[estudiante.predicciones[0].nivel_riesgo]?.icon || Minus
                  return <Icon className="w-5 h-5" />
                })()}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium opacity-70">Último riesgo de deserción</p>
                <p className="font-bold text-lg">{RIESGO_CONFIG[estudiante.predicciones[0].nivel_riesgo]?.label} — {Math.round(estudiante.predicciones[0].probabilidad_riesgo * 100)}%</p>
                <ProbaBar value={estudiante.predicciones[0].probabilidad_riesgo} nivel={estudiante.predicciones[0].nivel_riesgo} />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {sections.map(({ label, icon: Icon, fields }) => (
            <div key={label}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
              </div>
              <div className="space-y-2">
                {fields.map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                    <span className="text-xs text-slate-500">{key}</span>
                    <span className="text-xs font-medium text-slate-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {estudiante.predicciones?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Historial de Predicciones ({estudiante.predicciones.length})</span>
              </div>
              <div className="space-y-2">
                {estudiante.predicciones.map((pred, idx) => (
                  <div key={pred.id} className="rounded-lg border bg-slate-50 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">#{idx + 1}</span>
                      <RiesgoBadge nivel={pred.nivel_riesgo} />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{Math.round(pred.probabilidad_riesgo * 100)}%</p>
                      <p className="text-xs text-slate-400">
                        {new Date(pred.fecha_prediccion).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const PAGE_SIZE = 20

export default function Historial() {
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [filtroRiesgo, setFiltroRiesgo] = useState("")
  const [seleccionado, setSeleccionado] = useState(null)
  const [detalleLoading, setDetalleLoading] = useState(false)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalEstudiantes, setTotalEstudiantes] = useState(0)

  useEffect(() => {
    loadHistorial()
  }, [])

  const loadHistorial = async (pageNum = 1) => {
    setLoading(true)
    setError("")
    try {
      const data = await getHistorial(pageNum, PAGE_SIZE)
      setEstudiantes(data.data)
      setTotalPaginas(data.total_paginas)
      setTotalEstudiantes(data.total)
      setPagina(data.pagina)
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError("No se pudo conectar al servidor. Verifica que la API esté corriendo.")
      } else {
        setError("Error al cargar el historial. Intenta nuevamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerDetalle = async (estudianteId) => {
    setDetalleLoading(true)
    try {
      const data = await getEstudianteDetalle(estudianteId)
      setSeleccionado(data)
    } catch (err) {
      console.error("Error cargando detalle:", err)
    } finally {
      setDetalleLoading(false)
    }
  }

  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter(e => {
      const matchBusqueda = !busqueda || 
        `${e.nombres} ${e.apellidos} ${e.correo}`.toLowerCase().includes(busqueda.toLowerCase())
      const matchRiesgo = !filtroRiesgo || 
        (e.nivel_riesgo && e.nivel_riesgo.toLowerCase() === filtroRiesgo.toLowerCase())
      return matchBusqueda && matchRiesgo
    })
  }, [estudiantes, busqueda, filtroRiesgo])

  const conteo = useMemo(() => {
    return {
      alto: estudiantes.filter(e => e.nivel_riesgo === "Alto").length,
      medio: estudiantes.filter(e => e.nivel_riesgo === "Medio").length,
      bajo: estudiantes.filter(e => e.nivel_riesgo === "Bajo").length,
    }
  }, [estudiantes])

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-6 space-y-5 max-w-5xl mx-auto">
        <div>
          <h1 className="text-xl font-semibold">Historial de Predicciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalEstudiantes} estudiantes registrados
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { nivel: "alto", count: conteo.alto, label: "Riesgo alto" },
            { nivel: "medio", count: conteo.medio, label: "Riesgo medio" },
            { nivel: "bajo", count: conteo.bajo, label: "Riesgo bajo" },
          ].map(({ nivel, count, label }) => {
            const cfg = RIESGO_CONFIG[nivel.charAt(0).toUpperCase() + nivel.slice(1)]
            return (
              <button
                key={nivel}
                onClick={() => setFiltroRiesgo(filtroRiesgo === nivel ? "" : nivel)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all hover:shadow-sm",
                  filtroRiesgo === nivel ? cfg?.color : "bg-white hover:border-slate-300"
                )}
              >
                <p className={cn("text-2xl font-bold", filtroRiesgo === nivel ? "" : "text-slate-800")}>{count}</p>
                <p className={cn("text-xs mt-0.5", filtroRiesgo === nivel ? "opacity-70" : "text-slate-500")}>{label}</p>
              </button>
            )
          })}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o correo..."
                  value={busqueda}
                  onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <div className="w-44">
                <Select value={filtroRiesgo} onValueChange={v => { setFiltroRiesgo(v); setPagina(1) }}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Nivel de riesgo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alto">Alto</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="bajo">Bajo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(filtroRiesgo || busqueda) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs text-slate-500"
                  onClick={() => { setBusqueda(""); setFiltroRiesgo("") }}
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Limpiar
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-9" onClick={loadHistorial}>
                <Loader2 className="w-3.5 h-3.5 mr-1" /> Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {estudiantesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No se encontraron registros.</p>
              {(busqueda || filtroRiesgo) && (
                <Button variant="link" onClick={() => { setBusqueda(""); setFiltroRiesgo("") }} className="mt-2">
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-3">
              {estudiantes.map((est) => (
              <Card key={est.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleVerDetalle(est.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold shrink-0">
                        {est.nombres?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{est.nombres} {est.apellidos}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {est.correo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {est.nivel_riesgo ? (
                        <div className="text-right">
                          <RiesgoBadge nivel={est.nivel_riesgo} />
                          <div className="mt-1 w-32">
                            <ProbaBar value={est.probabilidad_riesgo} nivel={est.nivel_riesgo} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Sin predicciones</span>
                      )}
                      <div className="text-right text-xs text-slate-400">
                        <p>Registrado</p>
                        <p>{new Date(est.fecha_registro).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4 text-slate-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between py-4">
                <p className="text-sm text-slate-500">
                  Página {pagina} de {totalPaginas} ({totalEstudiantes} estudiantes)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadHistorial(pagina - 1)}
                    disabled={pagina === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium px-3">
                    {pagina} / {totalPaginas}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadHistorial(pagina + 1)}
                    disabled={pagina >= totalPaginas}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <DetallePanel 
        estudiante={seleccionado} 
        onClose={() => setSeleccionado(null)} 
        onBack={() => setSeleccionado(null)} 
      />
    </>
  )
}