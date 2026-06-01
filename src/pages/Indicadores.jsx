import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import {
  Users, AlertTriangle, TrendingUp, GraduationCap,
  PieChart as PieIcon, BarChart3, RefreshCw, Loader2
} from "lucide-react"
import axios from "axios"

const API_BASE = "http://localhost:8000"

const NIVEL_COLORS = {
  Alto:  { badge: "bg-red-100 text-red-700 border-red-200",        dot: "#ef4444" },
  Medio: { badge: "bg-amber-100 text-amber-700 border-amber-200",  dot: "#f59e0b" },
  Bajo:  { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "#10b981" },
}

export default function Indicadores() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

  // ── Adaptar estructura real del backend ───────────────────────────────────
  // por_genero: { hombres: {total, porcentaje, tasa_desercion}, mujeres: {...} }
  // distribucion_riesgo: { alto, medio, bajo }
  const hombres = data.por_genero?.hombres || { total: 0, tasa_desercion: 0 }
  const mujeres = data.por_genero?.mujeres || { total: 0, tasa_desercion: 0 }
  const dist    = data.distribucion_riesgo || { alto: 0, medio: 0, bajo: 0 }

  const generoData = [
    { name: "Hombres", value: hombres.total, color: "#3b82f6" },
    { name: "Mujeres", value: mujeres.total, color: "#ec4899" },
  ]

  const desercionGeneroData = [
    { genero: "Hombres", tasa: hombres.tasa_desercion },
    { genero: "Mujeres", tasa: mujeres.tasa_desercion },
  ]

  const riesgoData = [
    { name: "Alto",  value: dist.alto,  color: "#ef4444" },
    { name: "Medio", value: dist.medio, color: "#f59e0b" },
    { name: "Bajo",  value: dist.bajo,  color: "#10b981" },
  ]

  const kpis = [
    {
      label: "Total Estudiantes",
      value: data.total_estudiantes?.toLocaleString("es-CO"),
      sub: "estudiantes evaluados",
      icon: Users,
      color: "text-slate-800",
    },
    {
      label: "Tasa de Deserción",
      value: `${data.tasa_desercion}%`,
      sub: null,
      icon: AlertTriangle,
      color: "text-red-600",
      bar: data.tasa_desercion,
      barColor: "bg-red-500",
    },
    {
      label: "Riesgo Alto",
      value: data.riesgo_alto?.toLocaleString("es-CO"),
      sub: "estudiantes en riesgo alto",
      icon: TrendingUp,
      color: "text-red-600",
    },
    {
      label: "Probabilidad Promedio",
      value: `${data.promedio_riesgo}%`,
      sub: "riesgo promedio del modelo",
      icon: GraduationCap,
      color: "text-slate-800",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Indicadores de Deserción</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Actualizado el{" "}
            {new Date(data.actualizado_el).toLocaleString("es-CO", {
              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboard}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Actualizar
        </Button>
      </div>

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
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">Hombres</p>
                <p className="text-lg font-bold">{hombres.total.toLocaleString("es-CO")}</p>
              </div>
              <div className="text-center p-2 bg-pink-50 rounded-lg">
                <p className="text-xs text-pink-600 font-medium">Mujeres</p>
                <p className="text-lg font-bold">{mujeres.total.toLocaleString("es-CO")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasa deserción por género */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Tasa de Deserción por Género
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={desercionGeneroData} barSize={52}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="genero" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                <Bar dataKey="tasa" radius={[4, 4, 0, 0]}>
                  {desercionGeneroData.map((_, i) => (
                    <Cell key={i} fill={["#3b82f6", "#ec4899"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Hombres</p>
                <p className="text-lg font-bold text-blue-600">{hombres.tasa_desercion}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Mujeres</p>
                <p className="text-lg font-bold text-pink-500">{mujeres.tasa_desercion}%</p>
              </div>
            </div>
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
        </CardContent>
      </Card>

      {/* Nota si no hay datos */}
      {data.total_estudiantes === 0 && (
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