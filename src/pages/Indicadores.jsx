import { useState, useEffect } from "react"
import { RefreshCw, Filter, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"

const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent <= 0.08) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  return (
    <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)}
      fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function Indicadores() {
  const [carrera, setCarrera] = useState("")
  const [anio, setAnio] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Datos desde API (inicialmente vacíos)
  const [lineData, setLineData] = useState([])
  const [pieData, setPieData] = useState([])
  const [barData, setBarData] = useState([])

  // Función para cargar datos desde la API
  const fetchData = async () => {
    setLoading(true)
    try {
      // const params = new URLSearchParams()
      // if (carrera) params.append('carrera', carrera)
      // if (anio) params.append('anio', anio)
      // const response = await fetch(`/api/indicadores?${params}`)
      // const data = await response.json()
      // setLineData(data.lineData || [])
      // setPieData(data.pieData || [])
      // setBarData(data.barData || [])
      
      // Simulación de carga 
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Datos mock temporales
      setLineData([
        { mes: "ene 21", Programacion: 12, BasesDatos: 8, Redes: 5 },
        { mes: "jul 21", Programacion: 18, BasesDatos: 10, Redes: 6 },
        { mes: "ene 22", Programacion: 22, BasesDatos: 14, Redes: 8 },
      ])
      setPieData([
        { name: "Programación", value: 40, color: "#6d4ce6" },
        { name: "Bases de Datos", value: 30, color: "#38bdf8" },
        { name: "Redes", value: 20, color: "#f59e0b" },
      ])
      setBarData([
        { semestre: "1° Semestre", valor: 45 },
        { semestre: "2° Semestre", valor: 72 },
      ])
      // Fin datos mock temporales
      
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    fetchData()
  }, [carrera, anio])

  const handleRefresh = () => {
    fetchData()
  }

  // Componente vacío para cuando no hay datos
  const EmptyState = ({ message = "No hay datos disponibles" }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-muted-foreground">
      <div className="text-sm">{message}</div>
      <p className="text-xs mt-1">Conecta con la API para visualizar los indicadores</p>
    </div>
  )

  // Estado de carga
  if (loading) {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Indicadores de Deserción</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Visualización histórica por carrera y período</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading}>
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Indicadores de Deserción</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visualización histórica por carrera y período</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className="w-4 h-4" /> Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="w-48">
              <Select value={carrera} onValueChange={setCarrera}>
                <SelectTrigger>
                  <SelectValue placeholder="Carrera — Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prog">Programación</SelectItem>
                  <SelectItem value="bd">Bases de Datos</SelectItem>
                  <SelectItem value="redes">Redes</SelectItem>
                  <SelectItem value="ia">Inteligencia Artificial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-36">
              <Select value={anio} onValueChange={setAnio}>
                <SelectTrigger>
                  <SelectValue placeholder="Año — Todos" />
                </SelectTrigger>
                <SelectContent>
                  {[2021, 2022, 2023, 2024, 2025].map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-3 gap-4">
        {/* Gráfico de línea - evolución */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Evolución de deserciones por carrera</CardTitle>
          </CardHeader>
          <CardContent>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {Object.keys(lineData[0] || {})
                    .filter(key => key !== "mes")
                    .map((key, idx) => (
                      <Line 
                        key={key}
                        type="monotone" 
                        dataKey={key} 
                        stroke={["#6d4ce6", "#f59e0b", "#a78bfa", "#38bdf8"][idx % 4]} 
                        strokeWidth={2} 
                        dot={false} 
                        name={key} 
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Selecciona filtros para ver la evolución" />
            )}
          </CardContent>
        </Card>

        {/* Gráfico de pastel - distribución */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribución por carrera</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" labelLine={false} label={renderLabel}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`${v}%`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 w-full mt-1">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-semibold">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState message="Sin datos de distribución" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de barras - deserciones por semestre */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Deserciones por semestre</CardTitle>
        </CardHeader>
        <CardContent>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={barData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="semestre" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={["#6d4ce6", "#f59e0b", "#38bdf8", "#a78bfa"][i % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Sin datos por semestre" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}