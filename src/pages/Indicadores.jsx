import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import {
  Users, AlertTriangle, TrendingUp, GraduationCap,
  PieChart as PieIcon, BarChart3, RefreshCw, Loader2,
  Filter, X
} from "lucide-react"
import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

const NIVEL_COLORS = {
  Alto:  { badge: "bg-red-100 text-red-700 border-red-200",           dot: "#ef4444" },
  Medio: { badge: "bg-amber-100 text-amber-700 border-amber-200",     dot: "#f59e0b" },
  Bajo:  { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "#10b981" },
}


function aplicarFiltros(data, filtroGenero, filtroRiesgo) {
  if (!data) return null

  const hombresRaw = data.por_genero?.hombres || { total: 0, tasa_desercion: 0 }
  const mujeresRaw = data.por_genero?.mujeres  || { total: 0, tasa_desercion: 0 }
  const distRaw    = data.distribucion_riesgo  || { alto: 0, medio: 0, bajo: 0 }

  // ── Filtro de género ──────────────────────────────────────────────────────
  let hombres = hombresRaw
  let mujeres = mujeresRaw

  // Proporción de cada género sobre el total para escalar los indicadores globales
  const totalGenero = hombresRaw.total + mujeresRaw.total || 1
  let proporcion = 1 // fracción del total que aplica al filtro activo

  if (filtroGenero === "hombres") {
    mujeres = { total: 0, tasa_desercion: 0 }
    proporcion = hombresRaw.total / totalGenero
  } else if (filtroGenero === "mujeres") {
    hombres = { total: 0, tasa_desercion: 0 }
    proporcion = mujeresRaw.total / totalGenero
  }

  // ── Distribucion de riesgo (escalada por proporción de género) ────────────
  let dist = {
    alto:  Math.round(distRaw.alto  * proporcion),
    medio: Math.round(distRaw.medio * proporcion),
    bajo:  Math.round(distRaw.bajo  * proporcion),
  }

  // ── Filtro de nivel de riesgo (oculta las otras categorías) ──────────────
  if (filtroRiesgo) {
    dist = {
      alto:  filtroRiesgo === "alto"  ? dist.alto  : 0,
      medio: filtroRiesgo === "medio" ? dist.medio : 0,
      bajo:  filtroRiesgo === "bajo"  ? dist.bajo  : 0,
    }
  }

  const totalEstudiantes = filtroGenero
    ? (filtroGenero === "hombres" ? hombres.total : mujeres.total)
    : data.total_estudiantes

  const tasaDesercion = filtroGenero === "hombres"
    ? hombres.tasa_desercion
    : filtroGenero === "mujeres"
    ? mujeres.tasa_desercion
    : data.tasa_desercion

  const riesgoAlto = filtroRiesgo
    ? (filtroRiesgo === "alto" ? dist.alto : 0)
    : Math.round((data.riesgo_alto || 0) * proporcion)

  return {
    hombres,
    mujeres,
    dist,
    totalEstudiantes,
    tasaDesercion,
    riesgoAlto,
    promedioRiesgo: data.promedio_riesgo,
    actualizadoEl:  data.actualizado_el,
  }
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Indicadores() {
  // Lee resultados batch guardados desde Registros
  const [batchResults, setBatchResults] = useState(null)

  useEffect(() => {
    const loadBatchResults = () => {
      try {
        const raw = localStorage.getItem("batch_results")
        setBatchResults(raw ? JSON.parse(raw) : null)
      } catch {
        setBatchResults(null)
      }
    }

    loadBatchResults()

    window.addEventListener("batch_results_updated", loadBatchResults)

    return () => {
      window.removeEventListener("batch_results_updated", loadBatchResults)
    }
  }, [])
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState("")
  const [filtroGenero, setFiltroGenero] = useState("")
  const [filtroRiesgo, setFiltroRiesgo] = useState("")
  const [filtroBecado, setFiltroBecado] = useState("")
  const [edadMin, setEdadMin] = useState("")
  const [edadMax, setEdadMax] = useState("")

  // ── Indicadores derivados del CSV batch ──────────────────────────────────
  const batchIndicadores = useMemo(() => {
    if (!batchResults || batchResults.length === 0) return null
    let filteredBatch = [...batchResults]

    if (filtroGenero === "hombres") {
      filteredBatch = filteredBatch.filter(i =>
        (i.sexo || "").toUpperCase() === "M" ||
        (i.sexo || "").toLowerCase() === "masculino"
      )
    }

    if (filtroGenero === "mujeres") {
      filteredBatch = filteredBatch.filter(i =>
        (i.sexo || "").toUpperCase() === "F" ||
        (i.sexo || "").toLowerCase() === "femenino"
      )
    }
    if (edadMin) {
      filteredBatch = filteredBatch.filter(
        i => Number(i.edad) >= Number(edadMin)
      )
    }

    if (edadMax) {
      filteredBatch = filteredBatch.filter(
        i => Number(i.edad) <= Number(edadMax)
      )
    }     
    if (filtroRiesgo) {
      filteredBatch = filteredBatch.filter(i =>
        (i.nivel_riesgo || "").toLowerCase() === filtroRiesgo
      )
    }
    if (filtroBecado) {
      filteredBatch = filteredBatch.filter(i => {
        const becado = String(i.becado || "").toLowerCase()

        if (filtroBecado === "si") {
          return becado === "si" || becado === "sí" || becado === "true"
        }

        if (filtroBecado === "no") {
          return becado === "no" || becado === "false"
        }

        return true
      })
    }

    const total = filteredBatch.length
    const getNivel = item => (item.nivel_riesgo || "").toString()

    const alto  = filteredBatch.filter(i => getNivel(i) === "Alto").length
    const medio = filteredBatch.filter(i => getNivel(i) === "Medio").length
    const bajo  = filteredBatch.filter(i => getNivel(i) === "Bajo").length

    const hombres = filteredBatch.filter(i =>
      (i.sexo || "").toUpperCase() === "M" || (i.sexo || "").toLowerCase() === "masculino"
    )
    const mujeres = filteredBatch.filter(i =>
      (i.sexo || "").toUpperCase() === "F" || (i.sexo || "").toLowerCase() === "femenino"
    )

    const tasaH = hombres.length
      ? Math.round(hombres.filter(i => i.riesgo === 1 || getNivel(i) === "Alto").length / hombres.length * 100)
      : 0
    const tasaM = mujeres.length
      ? Math.round(mujeres.filter(i => i.riesgo === 1 || getNivel(i) === "Alto").length / mujeres.length * 100)
      : 0
    const tasaTotal = Math.round(
      filteredBatch.filter(i => i.riesgo === 1 || getNivel(i) === "Alto").length / total * 100
    )
    const promedioRiesgo = Math.round(
      filteredBatch.reduce((acc, i) => acc + (i.probabilidad_riesgo || 0), 0) / total * 100
    )

    return { total, alto, medio, bajo, tasaTotal, promedioRiesgo,
             hombresTotal: hombres.length, mujeresTotal: mujeres.length, tasaH, tasaM }
  }, [batchResults, filtroGenero, filtroRiesgo, edadMin, edadMax, filtroBecado])

  const fetchDashboard = async () => {
    setLoading(true)
    setError("")
    try {
      const { data: res } = await axios.get(`${API_BASE}/api/v1/dashboard`)
      setData(res)
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError("No se pudo conectar al servidor. Verifica que la API esté corriendo en localhost:8000.")
      } else {
        setError("Error al cargar los indicadores. Intenta nuevamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  // Datos filtrados derivados — se recalculan sin nueva petición al backend
  const filtered = useMemo(
    () => aplicarFiltros(data, filtroGenero, filtroRiesgo),
    [data, filtroGenero, filtroRiesgo]
  )

  const hayFiltros = filtroGenero || filtroRiesgo
  const limpiarFiltros = () => { setFiltroGenero(""); setFiltroRiesgo("") }

  // ── Estados de carga / error ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando indicadores...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <p className="text-sm text-muted-foreground text-center max-w-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchDashboard}>
          <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
        </Button>
      </div>
    )
  }

  const { hombres, mujeres, dist, totalEstudiantes, tasaDesercion, riesgoAlto, promedioRiesgo, actualizadoEl } = filtered

  const generoData = [
    { name: "Hombres", value: hombres.total, color: "#3b82f6" },
    { name: "Mujeres", value: mujeres.total, color: "#ec4899" },
  ].filter(d => d.value > 0)

  const desercionGeneroData = [
    { genero: "Hombres", tasa: hombres.tasa_desercion },
    { genero: "Mujeres", tasa: mujeres.tasa_desercion },
  ].filter(d => d.tasa > 0)

  const riesgoData = [
    { name: "Alto",  value: dist.alto,  color: "#ef4444" },
    { name: "Medio", value: dist.medio, color: "#f59e0b" },
    { name: "Bajo",  value: dist.bajo,  color: "#10b981" },
  ].filter(d => d.value > 0)

  const kpis = [
    {
      label: "Total Estudiantes",
      value: totalEstudiantes?.toLocaleString("es-CO"),
      sub: "estudiantes evaluados",
      icon: Users,
      color: "text-slate-800",
    },
    {
      label: "Tasa de Deserción",
      value: `${tasaDesercion}%`,
      sub: null,
      icon: AlertTriangle,
      color: "text-red-600",
      bar: tasaDesercion,
      barColor: "bg-red-500",
    },
    {
      label: "Riesgo Alto",
      value: riesgoAlto?.toLocaleString("es-CO"),
      sub: "estudiantes en riesgo alto",
      icon: TrendingUp,
      color: "text-red-600",
    },
    {
      label: "Probabilidad Promedio",
      value: `${promedioRiesgo}%`,
      sub: "riesgo promedio del modelo",
      icon: GraduationCap,
      color: "text-slate-800",
    },
  ]

  // Si hay CSV cargado → solo mostrar datos del CSV; si no → datos del backend
  if (batchIndicadores) {
    return (
      <div className="p-6 space-y-6">
        {/* Header modo CSV */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />

              {/* Género */}
              <div className="w-44">
                <Select value={filtroGenero} onValueChange={setFiltroGenero}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hombres">Hombres</SelectItem>
                    <SelectItem value="mujeres">Mujeres</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Riesgo */}
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

               {/* Edades */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Edad mín"
                  value={edadMin}
                  onChange={(e) => setEdadMin(e.target.value)}
                  className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
                />
                <input
                  type="number"
                  placeholder="Edad máx"
                  value={edadMax}
                  onChange={(e) => setEdadMax(e.target.value)}
                  className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
               {/* Becado */}
              <div className="w-44">
                <Select value={filtroBecado} onValueChange={setFiltroBecado}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Becado" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="si">Sí</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(filtroGenero || filtroRiesgo ||filtroBecado) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs text-slate-500"
                  onClick={() => {
                    setFiltroGenero("")
                    setFiltroRiesgo("")
                    setFiltroBecado("")
                  }}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>        
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold">Indicadores de Deserción</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Basado en el CSV cargado · {batchIndicadores.total} registros
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem("batch_results")
              window.dispatchEvent(new CustomEvent("batch_results_updated", { detail: null }))
            }}
          >
            <X className="w-4 h-4 mr-1.5" /> Quitar CSV
          </Button>
        </div>

        {/* KPIs batch */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total analizados", value: batchIndicadores.total.toLocaleString("es-CO"), sub: "del archivo CSV", icon: Users, color: "text-slate-800" },
            { label: "Tasa de deserción", value: `${batchIndicadores.tasaTotal}%`, icon: AlertTriangle, color: "text-red-600", bar: batchIndicadores.tasaTotal, barColor: "bg-red-500" },
            { label: "Riesgo Alto", value: batchIndicadores.alto.toLocaleString("es-CO"), sub: "estudiantes en riesgo alto", icon: TrendingUp, color: "text-red-600" },
            { label: "Prob. promedio", value: `${batchIndicadores.promedioRiesgo}%`, sub: "riesgo promedio del modelo", icon: GraduationCap, color: "text-slate-800" },
          ].map(({ label, value, sub, icon: Icon, color, bar, barColor }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
                {bar !== undefined && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                    <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${bar}%` }} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráficas batch */}
        <div className="grid md:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PieIcon className="w-4 h-4" /> Distribución de Riesgo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-6">
              <ResponsiveContainer width="70%" height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Alto",  value: batchIndicadores.alto,  color: "#ef4444" },
                      { name: "Medio", value: batchIndicadores.medio, color: "#f59e0b" },
                      { name: "Bajo",  value: batchIndicadores.bajo,  color: "#10b981" },
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%" outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {[
                      { name: "Alto",  value: batchIndicadores.alto,  color: "#ef4444" },
                      { name: "Medio", value: batchIndicadores.medio, color: "#f59e0b" },
                      { name: "Bajo",  value: batchIndicadores.bajo,  color: "#10b981" },
                    ].filter(d => d.value > 0).map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => v.toLocaleString("es-CO")} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex md:flex-col gap-4 shrink-0">
                {[
                  { name: "Alto",  value: batchIndicadores.alto,  color: "#ef4444" },
                  { name: "Medio", value: batchIndicadores.medio, color: "#f59e0b" },
                  { name: "Bajo",  value: batchIndicadores.bajo,  color: "#10b981" },
                ].map(({ name, value, color }) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                    <div>
                      <p className="text-xs text-muted-foreground">{name}</p>
                      <p className="text-sm font-bold">{value.toLocaleString("es-CO")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Deserción por Género
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={[
                    { genero: "Hombres", tasa: batchIndicadores.tasaH, total: batchIndicadores.hombresTotal },
                    { genero: "Mujeres", tasa: batchIndicadores.tasaM, total: batchIndicadores.mujeresTotal },
                  ]}
                  barSize={48}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="genero" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v, name) => name === "tasa" ? `${v}%` : v} />
                  <Bar dataKey="tasa" radius={[4, 4, 0, 0]}>
                    <Cell fill="#3b82f6" />
                    <Cell fill="#ec4899" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Hombres</p>
                  <p className="text-lg font-bold">{batchIndicadores.hombresTotal}</p>
                  <p className="text-xs text-blue-400">{batchIndicadores.tasaH}% deserción</p>
                </div>
                <div className="text-center p-2 bg-pink-50 rounded-lg">
                  <p className="text-xs text-pink-600 font-medium">Mujeres</p>
                  <p className="text-lg font-bold">{batchIndicadores.mujeresTotal}</p>
                  <p className="text-xs text-pink-400">{batchIndicadores.tasaM}% deserción</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Indicadores de Deserción</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Actualizado el{" "}
            {new Date(actualizadoEl).toLocaleString("es-CO", {
              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboard}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Actualizar
        </Button>
      </div>

      {/* ── Panel de filtros ─────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />

            {/* Filtro género */}
            <div className="w-44">
              <Select value={filtroGenero} onValueChange={setFiltroGenero}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hombres">Hombres</SelectItem>
                  <SelectItem value="mujeres">Mujeres</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro nivel de riesgo */}
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
            
            {/* Botón limpiar */}
            {hayFiltros && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs text-slate-500"
                onClick={limpiarFiltros}
              >
                <X className="w-3.5 h-3.5 mr-1" /> Limpiar filtros
              </Button>
            )}

            {/* Chips de filtros activos */}
            {hayFiltros && (
              <div className="flex items-center gap-2 flex-wrap ml-auto">
                {filtroGenero && (
                  <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                    {filtroGenero === "hombres" ? "Hombres" : "Mujeres"}
                    <button onClick={() => setFiltroGenero("")} className="ml-1 hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filtroRiesgo && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${NIVEL_COLORS[filtroRiesgo.charAt(0).toUpperCase() + filtroRiesgo.slice(1)]?.badge}`}>
                    Riesgo {filtroRiesgo}
                    <button onClick={() => setFiltroRiesgo("")} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color, bar, barColor }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
              {bar !== undefined && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${bar}%` }} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos fila 1 */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Distribución por género */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieIcon className="w-4 h-4" /> Distribución por Género
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generoData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
                Sin datos para el filtro seleccionado.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={generoData}
                      cx="50%" cy="50%"
                      outerRadius={75}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {generoData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => v.toLocaleString("es-CO")} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {!filtroGenero || filtroGenero === "hombres" ? (
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">Hombres</p>
                      <p className="text-lg font-bold">{hombres.total.toLocaleString("es-CO")}</p>
                    </div>
                  ) : null}
                  {!filtroGenero || filtroGenero === "mujeres" ? (
                    <div className="text-center p-2 bg-pink-50 rounded-lg">
                      <p className="text-xs text-pink-600 font-medium">Mujeres</p>
                      <p className="text-lg font-bold">{mujeres.total.toLocaleString("es-CO")}</p>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tasa de deserción por género */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Tasa de Deserción por Género
            </CardTitle>
          </CardHeader>
          <CardContent>
            {desercionGeneroData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                Sin datos para el filtro seleccionado.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={desercionGeneroData} barSize={52}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="genero" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                    <Bar dataKey="tasa" radius={[4, 4, 0, 0]}>
                      {desercionGeneroData.map((entry, i) => (
                        <Cell key={i} fill={entry.genero === "Hombres" ? "#3b82f6" : "#ec4899"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {desercionGeneroData.map(({ genero, tasa }) => (
                    <div key={genero} className="text-center">
                      <p className="text-xs text-muted-foreground">{genero}</p>
                      <p className={`text-lg font-bold ${genero === "Hombres" ? "text-blue-600" : "text-pink-500"}`}>
                        {tasa}%
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribución de riesgo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieIcon className="w-4 h-4" /> Distribución por Nivel de Riesgo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          {riesgoData.length === 0 ? (
            <div className="flex items-center justify-center w-full h-[190px] text-sm text-muted-foreground">
              Sin datos para el filtro seleccionado.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="80%" height={190}>
                <PieChart>
                  <Pie
                    data={riesgoData}
                    cx="50%" cy="50%"
                    outerRadius={75}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {riesgoData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => v.toLocaleString("es-CO")} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex md:flex-col gap-4 shrink-0">
                {riesgoData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                    <div>
                      <p className="text-xs text-muted-foreground">{name}</p>
                      <p className="text-sm font-bold">{value.toLocaleString("es-CO")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Nota si no hay datos */}
      {data?.total_estudiantes === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700">
              No hay datos en la base de datos. Ejecuta{" "}
              <code className="bg-amber-100 px-1 rounded font-mono text-xs">python scripts/seed_db.py</code>{" "}
              en el backend para poblar con datos de prueba.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}