import { useState } from "react"
import axios from "axios"
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2, BookOpen, Wallet, Users, User, Loader2, AlertCircle, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const API_BASE = "http://localhost:8000"

const STEPS = [
  { id: 0, label: "Variables Académicas",  icon: BookOpen },
  { id: 1, label: "Variables Económicas",  icon: Wallet },
  { id: 2, label: "Variables Sociales",    icon: Users },
  { id: 3, label: "Variables Personales",  icon: User },
]

// ── Mapeo de valores del form → formato que espera la API ────────────────────
function mapFormToAPI(form) {
  // sexo: "0" = Femenino, "1" = Masculino, "2" = Otro → "F" / "M" / "M"
  const sexoMap = { "0": "F", "1": "M", "2": "M" }

  // apoyo_familiar: "3"=Alto, "2"=Medio, "1"=Bajo, "0"=Ninguno → "Alto"/"Medio"/"Bajo"
  const apoyoMap = { "3": "Alto", "2": "Medio", "1": "Bajo", "0": "Bajo" }

  // responsabilidades: "0"=Ninguna, "1"=Leve, "2"=Moderada, "3"=Alta → "Bajo"/"Medio"/"Alto"
  const responsMap = { "0": "Bajo", "1": "Bajo", "2": "Medio", "3": "Alto" }

  // tipo_vivienda: "0"=Propia, "1"=Arrendada, "2"=Familiar, "3"=Otro → "Propia"/"Alquilada"/"Familiar"
  const viviendaMap = { "0": "Propia", "1": "Alquilada", "2": "Familiar", "3": "Familiar" }

  // becado, matricula_al_dia, deudor, desplazado, trabaja, materias_repetidas
  // "1" → "Sí", "0" → "No"
  const siNo = (v) => v === "1" ? "Sí" : "No"

  return {
    edad:                       parseInt(form.edad),
    sexo:                       sexoMap[form.sexo],
    promedio_general:           parseFloat(form.promedio_general),
    materias_repetidas:         siNo(form.materias_repetidas === "" ? "0" : String(parseInt(form.materias_repetidas) > 0 ? "1" : "0")),
    horas_tutoria:              parseFloat(form.horas_tutoria),
    trabaja:                    siNo(form.trabaja),
    ingreso_mensual:            parseFloat(form.ingreso_mensual),
    apoyo_familiar:             apoyoMap[form.apoyo_familiar],
    responsabilidades_familiares: responsMap[form.responsabilidades],
    becado:                     siNo(form.becado),
    matricula_al_dia:           siNo(form.matricula_al_dia),
    deudor:                     siNo(form.deudor),
    desplazado:                 siNo(form.desplazado),
    tipo_vivienda:              viviendaMap[form.tipo_vivienda],
    ratio_aprobacion_sem1:      parseFloat(form.ratio_sem1),
    ratio_aprobacion_sem2:      parseFloat(form.ratio_sem2),
  }
}

// ── Componentes de UI ─────────────────────────────────────────────────────────
function Field({ label, children, required }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  )
}

function SiNo({ value, onValueChange }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-11 text-base"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Sí</SelectItem>
        <SelectItem value="0">No</SelectItem>
      </SelectContent>
    </Select>
  )
}

const NIVEL_CONFIG = {
  Alto:  { color: "bg-red-50 border-red-200 text-red-700",     bar: "bg-red-500",     icon: TrendingDown, label: "Alto riesgo de deserción" },
  Medio: { color: "bg-amber-50 border-amber-200 text-amber-700", bar: "bg-amber-400",  icon: Minus,        label: "Riesgo moderado" },
  Bajo:  { color: "bg-emerald-50 border-emerald-200 text-emerald-700", bar: "bg-emerald-500", icon: TrendingUp, label: "Bajo riesgo de deserción" },
}

function ResultadoReal({ data }) {
  const cfg = NIVEL_CONFIG[data.nivel_riesgo] || NIVEL_CONFIG.Medio
  const Icon = cfg.icon
  const pct = Math.round(data.probabilidad_riesgo * 100)

  return (
    <div className={cn("rounded-xl border p-6 space-y-5", cfg.color)}>
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center shrink-0",
          data.nivel_riesgo === "Alto" ? "bg-red-100" : data.nivel_riesgo === "Medio" ? "bg-amber-100" : "bg-emerald-100"
        )}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-lg font-bold">{cfg.label}</p>
          <p className="text-sm opacity-70 mt-0.5">
            Riesgo nivel <span className="font-semibold">{data.nivel_riesgo}</span>
          </p>
        </div>
      </div>

      {/* Barra de probabilidad */}
      <div className="space-y-2 bg-white/60 rounded-lg p-4">
        <div className="flex justify-between text-sm font-medium">
          <span>Probabilidad de deserción</span>
          <span className="text-xl font-bold">{pct}%</span>
        </div>
        <div className="h-3 bg-white/80 rounded-full overflow-hidden border">
          <div
            className={cn("h-full rounded-full transition-all duration-700", cfg.bar)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Detalle */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white/60 rounded-lg p-3">
          <p className="opacity-60 text-xs mb-0.5">Clasificación</p>
          <p className="font-semibold">{data.riesgo === 1 ? "Posible desertor" : "Continúa estudiando"}</p>
        </div>
        <div className="bg-white/60 rounded-lg p-3">
          <p className="opacity-60 text-xs mb-0.5">Fecha de predicción</p>
          <p className="font-semibold">
            {new Date(data.timestamp).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Validaciones ──────────────────────────────────────────────────────────────
function isStepComplete(step, form) {
  const requiredFieldsByStep = {
    0: ["promedio_general", "materias_repetidas", "ratio_sem1", "ratio_sem2", "horas_tutoria"],
    1: ["ingreso_mensual", "becado", "matricula_al_dia", "deudor"],
    2: ["apoyo_familiar", "responsabilidades", "tipo_vivienda", "desplazado"],
    3: ["edad", "sexo", "trabaja"],
  }
  return (requiredFieldsByStep[step] || []).every(f => {
    const v = form[f]; return v !== "" && v !== null && v !== undefined
  })
}

function isFormComplete(form) {
  return [
    "promedio_general", "materias_repetidas", "ratio_sem1", "ratio_sem2", "horas_tutoria",
    "ingreso_mensual", "becado", "matricula_al_dia", "deudor",
    "apoyo_familiar", "responsabilidades", "tipo_vivienda", "desplazado",
    "edad", "sexo", "trabaja",
  ].every(f => { const v = form[f]; return v !== "" && v !== null && v !== undefined })
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Prediccion() {
  const [step, setStep] = useState(0)
  const [resultado, setResultado] = useState(null)   // { riesgo, probabilidad_riesgo, nivel_riesgo, timestamp }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    promedio_general: "", materias_repetidas: "", ratio_sem1: "", ratio_sem2: "", horas_tutoria: "",
    ingreso_mensual: "", becado: "", matricula_al_dia: "", deudor: "",
    apoyo_familiar: "", responsabilidades: "", tipo_vivienda: "", desplazado: "",
    edad: "", sexo: "", trabaja: "",
  })

  const setField = (k) => (v) => setForm(f => ({ ...f, [k]: v }))
  const setInput = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handlePredict = async () => {
    if (!isFormComplete(form)) {
      alert("Por favor completa todos los campos del formulario antes de predecir.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const payload = mapFormToAPI(form)
      const { data } = await axios.post(`${API_BASE}/api/v1/predict`, payload)
      setResultado(data)
    } catch (err) {
      if (err.response?.status === 422) {
        setError("Datos inválidos. Revisa los campos e intenta nuevamente.")
      } else if (err.response?.status === 503) {
        setError("El modelo no está cargado en el servidor. Ejecuta el entrenamiento primero.")
      } else if (err.code === "ERR_NETWORK") {
        setError("No se pudo conectar al servidor. Verifica que la API esté corriendo en localhost:8000.")
      } else {
        setError("Error inesperado. Intenta nuevamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (isStepComplete(step, form)) {
      setStep(s => s + 1)
    } else {
      alert("Por favor completa todos los campos de esta sección antes de continuar.")
    }
  }

  const inputCls = "h-11 text-base"
  const selectCls = "h-11 text-base"

  const stepContent = [
    <div key="ac" className="grid grid-cols-2 gap-5">
      <Field label="Promedio General" required>
        <Input className={inputCls} placeholder="Ej: 3.5" type="number" step="0.1" min="0" max="5" value={form.promedio_general} onChange={setInput("promedio_general")} />
      </Field>
      <Field label="Materias Repetidas" required>
        <Input className={inputCls} placeholder="Ej: 2" type="number" min="0" value={form.materias_repetidas} onChange={setInput("materias_repetidas")} />
      </Field>
      <Field label="Ratio Aprobación Semestre 1" required>
        <Input className={inputCls} placeholder="Ej: 0.80" type="number" step="0.01" min="0" max="1" value={form.ratio_sem1} onChange={setInput("ratio_sem1")} />
      </Field>
      <Field label="Ratio Aprobación Semestre 2" required>
        <Input className={inputCls} placeholder="Ej: 0.75" type="number" step="0.01" min="0" max="1" value={form.ratio_sem2} onChange={setInput("ratio_sem2")} />
      </Field>
      <Field label="Horas de Tutoría" required>
        <Input className={inputCls} placeholder="Ej: 10" type="number" min="0" value={form.horas_tutoria} onChange={setInput("horas_tutoria")} />
      </Field>
    </div>,

    <div key="ec" className="grid grid-cols-2 gap-5">
      <Field label="Ingreso Mensual (COP)" required>
        <Input className={inputCls} placeholder="Ej: 1500000" type="number" min="0" value={form.ingreso_mensual} onChange={setInput("ingreso_mensual")} />
      </Field>
      <Field label="¿Tiene Beca?" required><SiNo value={form.becado} onValueChange={setField("becado")} /></Field>
      <Field label="¿Matrícula al Día?" required><SiNo value={form.matricula_al_dia} onValueChange={setField("matricula_al_dia")} /></Field>
      <Field label="¿Es Deudor?" required><SiNo value={form.deudor} onValueChange={setField("deudor")} /></Field>
    </div>,

    <div key="so" className="grid grid-cols-2 gap-5">
      <Field label="Apoyo Familiar" required>
        <Select value={form.apoyo_familiar} onValueChange={setField("apoyo_familiar")}>
          <SelectTrigger className={selectCls}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Alto</SelectItem>
            <SelectItem value="2">Medio</SelectItem>
            <SelectItem value="1">Bajo</SelectItem>
            <SelectItem value="0">Ninguno</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Responsabilidades Familiares" required>
        <Select value={form.responsabilidades} onValueChange={setField("responsabilidades")}>
          <SelectTrigger className={selectCls}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Ninguna</SelectItem>
            <SelectItem value="1">Leve</SelectItem>
            <SelectItem value="2">Moderada</SelectItem>
            <SelectItem value="3">Alta</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Tipo de Vivienda" required>
        <Select value={form.tipo_vivienda} onValueChange={setField("tipo_vivienda")}>
          <SelectTrigger className={selectCls}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Propia</SelectItem>
            <SelectItem value="1">Arrendada</SelectItem>
            <SelectItem value="2">Familiar</SelectItem>
            <SelectItem value="3">Otro</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="¿Es Desplazado?" required><SiNo value={form.desplazado} onValueChange={setField("desplazado")} /></Field>
    </div>,

    <div key="pe" className="grid grid-cols-2 gap-5">
      <Field label="Edad" required>
        <Input className={inputCls} placeholder="Ej: 20" type="number" min="15" max="60" value={form.edad} onChange={setInput("edad")} />
      </Field>
      <Field label="Sexo" required>
        <Select value={form.sexo} onValueChange={setField("sexo")}>
          <SelectTrigger className={selectCls}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Femenino</SelectItem>
            <SelectItem value="1">Masculino</SelectItem>
            <SelectItem value="2">Otro</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="¿Trabaja Actualmente?" required><SiNo value={form.trabaja} onValueChange={setField("trabaja")} /></Field>
    </div>,
  ]

  return (
    <div className="p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Predicción de Deserción</h1>
        <p className="text-base text-muted-foreground mt-1">Ingresa los datos del estudiante para obtener la predicción</p>
      </div>

      {/* Barra de progreso */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Datos del estudiante</span>
          <span>Riesgo de deserción</span>
        </div>
        <Progress value={resultado ? 100 : (step / STEPS.length) * 100} className="h-2" />
        <div className="flex gap-1 pt-1">
          {STEPS.map((s, i) => {
            const isDone = step > i
            const isActive = step === i
            return (
              <button
                key={i}
                onClick={() => isDone && setStep(i)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary"
                  : isDone ? "text-primary cursor-pointer hover:bg-primary/5"
                  : "text-muted-foreground cursor-default"
                )}
              >
                {isDone && !isActive
                  ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  : <s.icon className="w-3.5 h-3.5 shrink-0" />
                }
                <span className="hidden sm:inline">{s.label.split(" ")[1]}</span>
              </button>
            )
          })}
          <div className={cn(
            "flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium",
            resultado ? "bg-primary/10 text-primary" : "text-muted-foreground"
          )}>
            Resultado
          </div>
        </div>
      </div>

      {!resultado ? (
        <Card>
          <CardContent className="p-8 flex flex-col gap-6 min-h-[420px]">
            <h2 className="text-base font-semibold flex items-center gap-2 border-b pb-4">
              {(() => { const Icon = STEPS[step].icon; return <Icon className="w-5 h-5 text-primary" /> })()}
              {STEPS[step].label}
            </h2>

            <div className="flex-1">{stepContent[step]}</div>

            {/* Error de API */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0 || loading}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={loading}>
                  Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handlePredict} disabled={loading}>
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analizando...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-1" /> Predecir Deserción</>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" /> Resultado de la Predicción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-8">
            <ResultadoReal data={resultado} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setResultado(null); setStep(0); setError("") }}>
                Nueva predicción
              </Button>
              <Button>Guardar y generar alerta</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}