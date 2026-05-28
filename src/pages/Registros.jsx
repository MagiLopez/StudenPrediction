import { useState, useMemo } from "react"
import {
  Search, Filter, Eye, X, User, BookOpen, Wallet, Users,
  TrendingUp, TrendingDown, Minus, ChevronDown
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── Datos mock ────────────────────────────────────────────────────────────────
const MOCK_REGISTROS = [
  {
    id: 1, nombre: "Valentina Torres", carrera: "Programación", semestre: "3°",
    fecha: "2025-05-10", riesgo: "alto", probabilidad: 82,
    datos: {
      promedio_general: 2.8, materias_repetidas: 3, ratio_sem1: 0.55, ratio_sem2: 0.50,
      horas_tutoria: 2, ingreso_mensual: 800000, becado: "No", matricula_al_dia: "No",
      deudor: "Sí", apoyo_familiar: "Bajo", responsabilidades: "Alta",
      tipo_vivienda: "Arrendada", desplazado: "Sí", edad: 22, sexo: "Femenino", trabaja: "Sí",
    }
  },
  {
    id: 2, nombre: "Carlos Mendoza", carrera: "Redes", semestre: "2°",
    fecha: "2025-05-12", riesgo: "medio", probabilidad: 54,
    datos: {
      promedio_general: 3.4, materias_repetidas: 1, ratio_sem1: 0.75, ratio_sem2: 0.70,
      horas_tutoria: 6, ingreso_mensual: 1400000, becado: "Sí", matricula_al_dia: "Sí",
      deudor: "No", apoyo_familiar: "Medio", responsabilidades: "Leve",
      tipo_vivienda: "Familiar", desplazado: "No", edad: 20, sexo: "Masculino", trabaja: "No",
    }
  },
  {
    id: 3, nombre: "Luisa Ramírez", carrera: "Bases de Datos", semestre: "4°",
    fecha: "2025-05-14", riesgo: "bajo", probabilidad: 18,
    datos: {
      promedio_general: 4.2, materias_repetidas: 0, ratio_sem1: 0.95, ratio_sem2: 0.92,
      horas_tutoria: 12, ingreso_mensual: 2200000, becado: "Sí", matricula_al_dia: "Sí",
      deudor: "No", apoyo_familiar: "Alto", responsabilidades: "Ninguna",
      tipo_vivienda: "Propia", desplazado: "No", edad: 21, sexo: "Femenino", trabaja: "No",
    }
  },
  {
    id: 4, nombre: "Andrés Pedraza", carrera: "Inteligencia Artificial", semestre: "1°",
    fecha: "2025-05-15", riesgo: "alto", probabilidad: 76,
    datos: {
      promedio_general: 2.5, materias_repetidas: 4, ratio_sem1: 0.45, ratio_sem2: 0.40,
      horas_tutoria: 0, ingreso_mensual: 600000, becado: "No", matricula_al_dia: "No",
      deudor: "Sí", apoyo_familiar: "Ninguno", responsabilidades: "Moderada",
      tipo_vivienda: "Arrendada", desplazado: "No", edad: 19, sexo: "Masculino", trabaja: "Sí",
    }
  },
  {
    id: 5, nombre: "Mariana Castillo", carrera: "Programación", semestre: "5°",
    fecha: "2025-05-16", riesgo: "bajo", probabilidad: 12,
    datos: {
      promedio_general: 4.5, materias_repetidas: 0, ratio_sem1: 0.98, ratio_sem2: 1.0,
      horas_tutoria: 15, ingreso_mensual: 3000000, becado: "Sí", matricula_al_dia: "Sí",
      deudor: "No", apoyo_familiar: "Alto", responsabilidades: "Ninguna",
      tipo_vivienda: "Propia", desplazado: "No", edad: 23, sexo: "Femenino", trabaja: "No",
    }
  },
  {
    id: 6, nombre: "Felipe Gutiérrez", carrera: "Redes", semestre: "3°",
    fecha: "2025-05-18", riesgo: "medio", probabilidad: 47,
    datos: {
      promedio_general: 3.1, materias_repetidas: 2, ratio_sem1: 0.68, ratio_sem2: 0.65,
      horas_tutoria: 4, ingreso_mensual: 1100000, becado: "No", matricula_al_dia: "Sí",
      deudor: "No", apoyo_familiar: "Medio", responsabilidades: "Leve",
      tipo_vivienda: "Familiar", desplazado: "No", edad: 21, sexo: "Masculino", trabaja: "Sí",
    }
  },
  {
    id: 7, nombre: "Daniela Orozco", carrera: "Bases de Datos", semestre: "2°",
    fecha: "2025-05-20", riesgo: "alto", probabilidad: 91,
    datos: {
      promedio_general: 2.1, materias_repetidas: 5, ratio_sem1: 0.38, ratio_sem2: 0.30,
      horas_tutoria: 1, ingreso_mensual: 500000, becado: "No", matricula_al_dia: "No",
      deudor: "Sí", apoyo_familiar: "Bajo", responsabilidades: "Alta",
      tipo_vivienda: "Otro", desplazado: "Sí", edad: 24, sexo: "Femenino", trabaja: "Sí",
    }
  },
  {
    id: 8, nombre: "Juan Ríos", carrera: "Inteligencia Artificial", semestre: "4°",
    fecha: "2025-05-22", riesgo: "medio", probabilidad: 61,
    datos: {
      promedio_general: 3.0, materias_repetidas: 2, ratio_sem1: 0.70, ratio_sem2: 0.66,
      horas_tutoria: 5, ingreso_mensual: 1300000, becado: "No", matricula_al_dia: "Sí",
      deudor: "Sí", apoyo_familiar: "Medio", responsabilidades: "Moderada",
      tipo_vivienda: "Arrendada", desplazado: "No", edad: 25, sexo: "Masculino", trabaja: "Sí",
    }
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const RIESGO_CONFIG = {
  alto:  { label: "Alto",  color: "bg-red-100 text-red-700 border-red-200",    dot: "bg-red-500",    icon: TrendingDown },
  medio: { label: "Medio", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400", icon: Minus },
  bajo:  { label: "Bajo",  color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: TrendingUp },
}

function RiesgoBadge({ nivel, size = "sm" }) {
  const cfg = RIESGO_CONFIG[nivel]
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
  const colors = { alto: "bg-red-500", medio: "bg-amber-400", bajo: "bg-emerald-500" }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", colors[nivel])} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{value}%</span>
    </div>
  )
}

// ── Panel de detalle ──────────────────────────────────────────────────────────
function DetallePanel({ registro, onClose }) {
  if (!registro) return null
  const { datos, nombre, carrera, semestre, fecha, riesgo, probabilidad } = registro
  const cfg = RIESGO_CONFIG[riesgo]
  const IconRiesgo = cfg.icon

  const sections = [
    {
      label: "Académicas", icon: BookOpen,
      fields: [
        ["Promedio general", datos.promedio_general],
        ["Materias repetidas", datos.materias_repetidas],
        ["Ratio aprobación sem. 1", datos.ratio_sem1],
        ["Ratio aprobación sem. 2", datos.ratio_sem2],
        ["Horas de tutoría", datos.horas_tutoria],
      ]
    },
    {
      label: "Económicas", icon: Wallet,
      fields: [
        ["Ingreso mensual", `$${Number(datos.ingreso_mensual).toLocaleString("es-CO")}`],
        ["Becado", datos.becado],
        ["Matrícula al día", datos.matricula_al_dia],
        ["Deudor", datos.deudor],
      ]
    },
    {
      label: "Sociales", icon: Users,
      fields: [
        ["Apoyo familiar", datos.apoyo_familiar],
        ["Responsabilidades", datos.responsabilidades],
        ["Tipo de vivienda", datos.tipo_vivienda],
        ["Desplazado", datos.desplazado],
      ]
    },
    {
      label: "Personales", icon: User,
      fields: [
        ["Edad", datos.edad],
        ["Sexo", datos.sexo],
        ["Trabaja", datos.trabaja],
      ]
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                  {nombre.charAt(0)}
                </div>
                <h2 className="font-semibold text-slate-800">{nombre}</h2>
              </div>
              <p className="text-xs text-slate-500">{carrera} · {semestre} semestre · {new Date(fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Resultado */}
          <div className={cn("mt-4 rounded-xl p-4 border flex items-center gap-4", cfg.color)}>
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0",
              riesgo === "alto" ? "bg-red-200" : riesgo === "medio" ? "bg-amber-200" : "bg-emerald-200"
            )}>
              <IconRiesgo className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium opacity-70 mb-0.5">Riesgo de deserción</p>
              <p className="font-bold text-lg leading-none">{cfg.label} — {probabilidad}%</p>
              <div className="mt-2">
                <ProbaBar value={probabilidad} nivel={riesgo} />
              </div>
            </div>
          </div>
        </div>

        {/* Datos */}
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
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Registros() {
  const [busqueda, setBusqueda] = useState("")
  const [filtroRiesgo, setFiltroRiesgo] = useState("")
  const [filtroCarrera, setFiltroCarrera] = useState("")
  const [seleccionado, setSeleccionado] = useState(null)

  const registrosFiltrados = useMemo(() => {
    return MOCK_REGISTROS.filter(r => {
      const matchBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.carrera.toLowerCase().includes(busqueda.toLowerCase())
      const matchRiesgo = !filtroRiesgo || r.riesgo === filtroRiesgo
      const matchCarrera = !filtroCarrera || r.carrera === filtroCarrera
      return matchBusqueda && matchRiesgo && matchCarrera
    })
  }, [busqueda, filtroRiesgo, filtroCarrera])

  const conteo = useMemo(() => ({
    alto: MOCK_REGISTROS.filter(r => r.riesgo === "alto").length,
    medio: MOCK_REGISTROS.filter(r => r.riesgo === "medio").length,
    bajo: MOCK_REGISTROS.filter(r => r.riesgo === "bajo").length,
  }), [])

  return (
    <>
      <div className="p-6 space-y-5 max-w-5xl mx-auto">
        {/* Encabezado */}
        <div>
          <h1 className="text-xl font-semibold">Registros de Predicciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Historial de estudiantes evaluados — {MOCK_REGISTROS.length} registros
          </p>
        </div>

        {/* Resumen rápido */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { nivel: "alto", count: conteo.alto, label: "Riesgo alto" },
            { nivel: "medio", count: conteo.medio, label: "Riesgo medio" },
            { nivel: "bajo", count: conteo.bajo, label: "Riesgo bajo" },
          ].map(({ nivel, count, label }) => {
            const cfg = RIESGO_CONFIG[nivel]
            return (
              <button
                key={nivel}
                onClick={() => setFiltroRiesgo(filtroRiesgo === nivel ? "" : nivel)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all hover:shadow-sm",
                  filtroRiesgo === nivel ? cfg.color : "bg-white hover:border-slate-300"
                )}
              >
                <p className={cn("text-2xl font-bold", filtroRiesgo === nivel ? "" : "text-slate-800")}>{count}</p>
                <p className={cn("text-xs mt-0.5", filtroRiesgo === nivel ? "opacity-70" : "text-slate-500")}>{label}</p>
              </button>
            )
          })}
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o carrera..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <div className="w-44">
                <Select value={filtroRiesgo} onValueChange={setFiltroRiesgo}>
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
              <div className="w-48">
                <Select value={filtroCarrera} onValueChange={setFiltroCarrera}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Programación">Programación</SelectItem>
                    <SelectItem value="Bases de Datos">Bases de Datos</SelectItem>
                    <SelectItem value="Redes">Redes</SelectItem>
                    <SelectItem value="Inteligencia Artificial">Inteligencia Artificial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(filtroRiesgo || filtroCarrera || busqueda) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs text-slate-500"
                  onClick={() => { setBusqueda(""); setFiltroRiesgo(""); setFiltroCarrera("") }}
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardContent className="p-0">
            {registrosFiltrados.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                No se encontraron registros con los filtros aplicados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estudiante</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Carrera</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Semestre</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Riesgo</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">Probabilidad</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {registrosFiltrados.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                              {r.nombre.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-800">{r.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{r.carrera}</td>
                        <td className="px-4 py-3.5 text-slate-600">{r.semestre}</td>
                        <td className="px-4 py-3.5">
                          <RiesgoBadge nivel={r.riesgo} />
                        </td>
                        <td className="px-4 py-3.5 w-40">
                          <ProbaBar value={r.probabilidad} nivel={r.riesgo} />
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 text-xs">
                          {new Date(r.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSeleccionado(r)}
                          >
                            <Eye className="w-4 h-4 text-slate-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Panel lateral de detalle */}
      <DetallePanel registro={seleccionado} onClose={() => setSeleccionado(null)} />
    </>
  )
}