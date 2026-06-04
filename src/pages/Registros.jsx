import { useRef, useState, useMemo } from "react"
import axios from "axios"
import {
  Search, Filter, Eye, X, User, BookOpen, Wallet, Users,
  TrendingUp, TrendingDown, Minus, ChevronDown, Loader2
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

// Parse CSV text into array of objects. Headers are normalized to snake_case lower-case keys.
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== "")
  if (lines.length === 0) return []
  const rawHeader = lines[0].split(/,|;/).map(h => h.trim())
  const headers = rawHeader.map(h => h
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase())

  const rows = lines.slice(1)
  const data = rows.map(row => {
    const cols = row.split(/,|;/)
    const obj = {}
    headers.forEach((key, i) => {
      let val = cols[i] !== undefined ? cols[i].trim() : ""
      if (val === "") {
        obj[key] = null
        return
      }
      // Normalize boolean-like Spanish words
      const low = val.toLowerCase()
      if (low === "si" || low === "sí") {
        obj[key] = "Sí"
        return
      }
      if (low === "no") {
        obj[key] = "No"
        return
      }
      // Numeric
      if (/^-?\d+(?:\.\d+)?$/.test(val)) {
        obj[key] = Number(val)
        return
      }
      obj[key] = val
    })
    return obj
  })
  return data
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

function BatchStatusBadge({ value }) {
  const styles = {
    Alto: "bg-red-100 text-red-700 border border-red-200",
    Medio: "bg-amber-100 text-amber-700 border border-amber-200",
    Bajo: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  }
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold", styles[value] || "bg-slate-100 text-slate-700 border border-slate-200")}>{value}</span>
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
  const [batchResults, setBatchResults] = useState(null)
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchError, setBatchError] = useState("")
  const [filterSexo, setFilterSexo] = useState("")
  const [filterBecado, setFilterBecado] = useState("")
  const [filterApoyo, setFilterApoyo] = useState("")
  const [filterResponsabilidades, setFilterResponsabilidades] = useState("")
  const [filterVivienda, setFilterVivienda] = useState("")
  const [filterTrabaja, setFilterTrabaja] = useState("")
  const [filterDeudor, setFilterDeudor] = useState("")
  const [filterDesplazado, setFilterDesplazado] = useState("")
  const [filterEdadMin, setFilterEdadMin] = useState("")
  const [filterEdadMax, setFilterEdadMax] = useState("")
  const [filterPromedioMin, setFilterPromedioMin] = useState("")
  const [filterPromedioMax, setFilterPromedioMax] = useState("")
  const batchInputRef = useRef(null)

  const registrosFiltrados = useMemo(() => {
    return MOCK_REGISTROS.filter(r => {
      const matchBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.carrera.toLowerCase().includes(busqueda.toLowerCase())
      const matchRiesgo = !filtroRiesgo || r.riesgo === filtroRiesgo
      const matchCarrera = !filtroCarrera || r.carrera === filtroCarrera
      return matchBusqueda && matchRiesgo && matchCarrera
    })
  }, [busqueda, filtroRiesgo, filtroCarrera])

  const conteo = useMemo(() => {
    const source = batchResults || []
    const getRisk = item => (item.nivel_riesgo || item.riesgo || "").toString().toLowerCase()

    return {
      alto: source.filter(item => getRisk(item) === "alto").length,
      medio: source.filter(item => getRisk(item) === "medio").length,
      bajo: source.filter(item => getRisk(item) === "bajo").length,
    }
  }, [batchResults])

  const handleBatchUploadClick = () => {
    batchInputRef.current?.click()
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setBatchLoading(true)
    setBatchError("")
    setBatchResults(null)

    try {
      const text = await file.text()
      let payload
      const isCSV = file.name?.toLowerCase().endsWith('.csv') || file.type === 'text/csv'
      if (isCSV) {
        const students = parseCSV(text)
        if (!students || students.length === 0) throw new Error('CSV vacío o mal formado.')
        payload = { students }
      } else {
        const parsed = JSON.parse(text)
        payload = Array.isArray(parsed) ? { students: parsed } : parsed
      }

      if (!payload?.students || !Array.isArray(payload.students)) {
        throw new Error("El JSON/CSV debe convertirse a una propiedad 'students' con un arreglo de estudiantes.")
      }

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/v1/predict/batch`, payload)
      setBatchResults(payload.students.map((student, index) => ({
        ...student,
        ...data.predictions[index],
      })))
    } catch (err) {
      if (err instanceof SyntaxError) {
        setBatchError("JSON inválido. Revisa el archivo y vuelve a intentarlo.")
      } else if (err.response?.status === 422) {
        setBatchError("El archivo JSON no coincide con el formato esperado.")
      } else if (err.response?.status === 503) {
        setBatchError("El modelo no está cargado en el servidor. Ejecuta el entrenamiento primero.")
      } else if (err.code === "ERR_NETWORK") {
        setBatchError("No se pudo conectar al servidor. Verifica que la API esté corriendo.")
      } else {
        setBatchError(err.message || "Error inesperado. Intenta nuevamente.")
      }
    } finally {
      setBatchLoading(false)
      event.target.value = ""
    }
  }

  const filteredBatchResults = useMemo(() => {
    if (!batchResults) return []
    return batchResults.filter(item => {
      if (filterSexo && item.sexo !== filterSexo) return false
      if (filterBecado && item.becado !== filterBecado) return false
      if (filterApoyo && item.apoyo_familiar !== filterApoyo) return false
      if (filterResponsabilidades && item.responsabilidades_familiares !== filterResponsabilidades) return false
      if (filterVivienda && item.tipo_vivienda !== filterVivienda) return false
      if (filterTrabaja && item.trabaja !== filterTrabaja) return false
      if (filterDeudor && item.deudor !== filterDeudor) return false
      if (filterDesplazado && item.desplazado !== filterDesplazado) return false
      if (filtroRiesgo && item.nivel_riesgo?.toLowerCase() !== filtroRiesgo.toLowerCase()) return false
      if (filterEdadMin && Number(item.edad) < Number(filterEdadMin)) return false
      if (filterEdadMax && Number(item.edad) > Number(filterEdadMax)) return false
      if (filterPromedioMin && Number(item.promedio_general) < Number(filterPromedioMin)) return false
      if (filterPromedioMax && Number(item.promedio_general) > Number(filterPromedioMax)) return false
      return true
    })
  }, [batchResults, filtroRiesgo, filterSexo, filterBecado, filterApoyo, filterResponsabilidades, filterVivienda, filterTrabaja, filterDeudor, filterDesplazado, filterEdadMin, filterEdadMax, filterPromedioMin, filterPromedioMax])

  const clearBatchFilters = () => {
    setFilterSexo("")
    setFilterBecado("")
    setFilterApoyo("")
    setFilterResponsabilidades("")
    setFilterVivienda("")
    setFilterTrabaja("")
    setFilterDeudor("")
    setFilterDesplazado("")
    setFilterEdadMin("")
    setFilterEdadMax("")
    setFilterPromedioMin("")
    setFilterPromedioMax("")
  }

  return (
    <>
      <div className="p-6 space-y-5 max-w-5xl mx-auto">
        {/* Encabezado */}
        <div>
          <h1 className="text-xl font-semibold">Registros de Predicciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Historial de estudiantes evaluados — {batchResults?.length ?? 0} registros
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
              {/* Filtro de carrera deshabilitado temporariamente */}
              {false && (
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
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={batchInputRef}
                  type="file"
                  accept=".json,.csv,application/json,text/csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={handleBatchUploadClick}
                  disabled={batchLoading}
                >
                  {batchLoading ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Cargando...</>
                  ) : (
                    "Subir CSV/JSON batch"
                  )}
                </Button>
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

            {batchResults && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Sexo</p>
                  <Select value={filterSexo} onValueChange={setFilterSexo}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Sexo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Apoyo familiar</p>
                  <Select value={filterApoyo} onValueChange={setFilterApoyo}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Apoyo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alto">Alto</SelectItem>
                      <SelectItem value="Medio">Medio</SelectItem>
                      <SelectItem value="Bajo">Bajo</SelectItem>
                      <SelectItem value="Ninguno">Ninguno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Responsabilidades</p>
                  <Select value={filterResponsabilidades} onValueChange={setFilterResponsabilidades}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Responsabilidades" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ninguna">Ninguna</SelectItem>
                      <SelectItem value="Leve">Leve</SelectItem>
                      <SelectItem value="Moderada">Moderada</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Becado</p>
                  <Select value={filterBecado} onValueChange={setFilterBecado}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Becado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sí">Sí</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Trabaja</p>
                  <Select value={filterTrabaja} onValueChange={setFilterTrabaja}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Trabaja" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sí">Sí</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Deudor</p>
                  <Select value={filterDeudor} onValueChange={setFilterDeudor}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Deudor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sí">Sí</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Vivienda</p>
                  <Select value={filterVivienda} onValueChange={setFilterVivienda}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Vivienda" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Propia">Propia</SelectItem>
                      <SelectItem value="Alquilada">Alquilada</SelectItem>
                      <SelectItem value="Familiar">Familiar</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Desplazado</p>
                  <Select value={filterDesplazado} onValueChange={setFilterDesplazado}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Desplazado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sí">Sí</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Edad</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" min="0" placeholder="Min" value={filterEdadMin} onChange={e => setFilterEdadMin(e.target.value)} className="h-9 text-sm" />
                    <Input type="number" min="0" placeholder="Max" value={filterEdadMax} onChange={e => setFilterEdadMax(e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Promedio</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" step="0.01" min="0" placeholder="Min" value={filterPromedioMin} onChange={e => setFilterPromedioMin(e.target.value)} className="h-9 text-sm" />
                    <Input type="number" step="0.01" min="0" placeholder="Max" value={filterPromedioMax} onChange={e => setFilterPromedioMax(e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" className="h-9 text-xs text-slate-500" onClick={clearBatchFilters}>
                    Limpiar filtros batch
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla
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
        </Card> */}

        {batchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {batchError}
          </div>
        )}

        {batchResults ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">Resultados Batch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="text-sm text-slate-500">
                Mostrando {filteredBatchResults.length} de {batchResults.length} registros batch.
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "#", "Edad", "Sexo", "Promedio", "Materias", "Horas tutoría", "Trabaja",
                        "Ingreso", "Apoyo", "Responsabilidades", "Becado", "Matrícula",
                        "Deudor", "Desplazado", "Vivienda", "Ratio S1", "Ratio S2",
                        "Riesgo", "Probabilidad", "Nivel", "Fecha"
                      ].map((heading, idx) => (
                        <th key={idx} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredBatchResults.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">{index + 1}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.edad}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.sexo}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.promedio_general}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.materias_repetidas}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.horas_tutoria}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.trabaja}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{Number(item.ingreso_mensual).toLocaleString("es-CO")}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.apoyo_familiar}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.responsabilidades_familiares}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.becado}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.matricula_al_dia}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.deudor}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.desplazado}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.tipo_vivienda}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.ratio_aprobacion_sem1}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{item.ratio_aprobacion_sem2}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                            {item.riesgo === 1 ? "Desertor" : "Continúa"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600 font-semibold">{Math.round(item.probabilidad_riesgo * 100)}%</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <BatchStatusBadge value={item.nivel_riesgo} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{new Date(item.timestamp).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="text-slate-500 text-sm">
                  {filteredBatchResults.length === 0 ? "No hay registros que cumplan los filtros." : ""}
                </div>
                <Button variant="outline" onClick={() => setBatchResults(null)}>
                  Limpiar resultados
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Panel lateral de detalle */}
      <DetallePanel registro={seleccionado} onClose={() => setSeleccionado(null)} />
    </>
  )
}