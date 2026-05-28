import { useState } from "react"
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2, BookOpen, Wallet, Users, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: 0, label: "Variables Académicas", icon: BookOpen },
  { id: 1, label: "Variables Económicas", icon: Wallet },
  { id: 2, label: "Variables Sociales", icon: Users },
  { id: 3, label: "Variables Personales", icon: User },
]

function Field({ label, children, required }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  )
}

function SiNo({ value, onValueChange }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Sí</SelectItem>
        <SelectItem value="0">No</SelectItem>
      </SelectContent>
    </Select>
  )
}

// Componente de resultado fijo para simular "ok"
function ResultMock() {
  return (
    <div className="rounded-xl border p-5 text-center space-y-3 bg-green-50 border-green-200">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold bg-green-100 text-green-600">
        ✓
      </div>
      <div>
        <p className="text-base font-semibold text-green-600">Predicción exitosa</p>
        <p className="text-xs text-muted-foreground mt-1">Formulario validado correctamente</p>
      </div>
      <div className="bg-white/70 border rounded-lg p-3 text-left flex gap-2">
        <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
        <p className="text-xs text-foreground">
          <span className="font-semibold text-violet-700">OK: </span>
          Todos los campos obligatorios han sido llenados. (API no conectada aún)
        </p>
      </div>
    </div>
  )
}

// Verifica si todos los campos del paso actual están llenos
function isStepComplete(step, form) {
  const requiredFieldsByStep = {
    0: ["promedio_general", "materias_repetidas", "ratio_sem1", "ratio_sem2", "horas_tutoria"],
    1: ["ingreso_mensual", "becado", "matricula_al_dia", "deudor"],
    2: ["apoyo_familiar", "responsabilidades", "tipo_vivienda", "desplazado"],
    3: ["edad", "sexo", "trabaja"],
  }
  
  const fields = requiredFieldsByStep[step] || []
  return fields.every(field => {
    const value = form[field]
    return value !== "" && value !== null && value !== undefined
  })
}

// Verifica si TODOS los campos del formulario están llenos
function isFormComplete(form) {
  const allFields = [
    "promedio_general", "materias_repetidas", "ratio_sem1", "ratio_sem2", "horas_tutoria",
    "ingreso_mensual", "becado", "matricula_al_dia", "deudor",
    "apoyo_familiar", "responsabilidades", "tipo_vivienda", "desplazado",
    "edad", "sexo", "trabaja",
  ]
  return allFields.every(field => {
    const value = form[field]
    return value !== "" && value !== null && value !== undefined
  })
}

export default function Prediccion() {
  const [step, setStep] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [form, setForm] = useState({
    promedio_general: "", materias_repetidas: "", ratio_sem1: "", ratio_sem2: "", horas_tutoria: "",
    ingreso_mensual: "", becado: "", matricula_al_dia: "", deudor: "",
    apoyo_familiar: "", responsabilidades: "", tipo_vivienda: "", desplazado: "",
    edad: "", sexo: "", trabaja: "",
  })

  const setField = (k) => (v) => setForm(f => ({ ...f, [k]: v }))
  const setInput = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handlePredict = () => {
    if (!isFormComplete(form)) {
      alert("Por favor completa todos los campos del formulario antes de predecir.")
      return
    }
    // Simplemente muestra "ok" sin API ni loading
    setResultado("ok")
  }

  const handleNext = () => {
    if (isStepComplete(step, form)) {
      setStep(s => s + 1)
    } else {
      alert("Por favor completa todos los campos de esta sección antes de continuar.")
    }
  }

  const stepContent = [
    // Paso 0 — Académicas
    <div key="ac" className="grid grid-cols-2 gap-4">
      <Field label="Promedio General" required>
        <Input placeholder="Ej: 3.5" type="number" step="0.1" min="0" max="5" value={form.promedio_general} onChange={setInput("promedio_general")} />
      </Field>
      <Field label="Materias Repetidas" required>
        <Input placeholder="Ej: 2" type="number" min="0" value={form.materias_repetidas} onChange={setInput("materias_repetidas")} />
      </Field>
      <Field label="Ratio Aprobación Semestre 1" required>
        <Input placeholder="Ej: 0.80" type="number" step="0.01" min="0" max="1" value={form.ratio_sem1} onChange={setInput("ratio_sem1")} />
      </Field>
      <Field label="Ratio Aprobación Semestre 2" required>
        <Input placeholder="Ej: 0.75" type="number" step="0.01" min="0" max="1" value={form.ratio_sem2} onChange={setInput("ratio_sem2")} />
      </Field>
      <Field label="Horas de Tutoría" required>
        <Input placeholder="Ej: 10" type="number" min="0" value={form.horas_tutoria} onChange={setInput("horas_tutoria")} />
      </Field>
    </div>,

    // Paso 1 — Económicas
    <div key="ec" className="grid grid-cols-2 gap-4">
      <Field label="Ingreso Mensual (COP)" required>
        <Input placeholder="Ej: 1500000" type="number" min="0" value={form.ingreso_mensual} onChange={setInput("ingreso_mensual")} />
      </Field>
      <Field label="¿Tiene Beca?" required><SiNo value={form.becado} onValueChange={setField("becado")} /></Field>
      <Field label="¿Matrícula al Día?" required><SiNo value={form.matricula_al_dia} onValueChange={setField("matricula_al_dia")} /></Field>
      <Field label="¿Es Deudor?" required><SiNo value={form.deudor} onValueChange={setField("deudor")} /></Field>
    </div>,

    // Paso 2 — Sociales
    <div key="so" className="grid grid-cols-2 gap-4">
      <Field label="Apoyo Familiar" required>
        <Select value={form.apoyo_familiar} onValueChange={setField("apoyo_familiar")}>
          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
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
          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
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
          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
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

    // Paso 3 — Personales
    <div key="pe" className="grid grid-cols-2 gap-4">
      <Field label="Edad" required>
        <Input placeholder="Ej: 20" type="number" min="15" max="60" value={form.edad} onChange={setInput("edad")} />
      </Field>
      <Field label="Sexo" required>
        <Select value={form.sexo} onValueChange={setField("sexo")}>
          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
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
    <div className="p-6 space-y-5 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Predicción de Deserción</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ingresa los datos del estudiante para obtener la predicción</p>
      </div>

      {/* Barra de progreso */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Datos del estudiante</span>
          <span>Riesgo de deserción</span>
        </div>
        <Progress value={resultado ? 100 : (step / STEPS.length) * 100} className="h-1.5" />
        <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
          {STEPS.map((s, i) => (
            <span key={i} className={cn(i <= step && !resultado ? "text-primary font-medium" : "")}>{s.label.split(" ")[1]}</span>
          ))}
          <span className={cn(resultado ? "text-primary font-medium" : "")}>Resultado</span>
        </div>
      </div>

      {!resultado ? (
        <Card>
          <CardContent className="p-0 flex min-h-[400px]">
            {/* Sidebar pasos */}
            <div className="w-44 shrink-0 bg-muted/30 rounded-l-xl border-r p-3 space-y-1">
              {STEPS.map((s) => {
                const Icon = s.icon
                const isActive = step === s.id
                const isDone = step > s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => isDone && setStep(s.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left",
                      isActive ? "bg-primary text-primary-foreground shadow-sm"
                        : isDone ? "bg-primary/10 text-primary cursor-pointer"
                        : "text-muted-foreground cursor-default"
                    )}
                  >
                    {isDone && !isActive
                      ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                      : <Icon className="w-4 h-4 shrink-0" />}
                    {s.label}
                  </button>
                )
              })}
            </div>

            {/* Contenido */}
            <div className="flex-1 p-6 flex flex-col">
              <h2 className="text-sm font-semibold mb-5 flex items-center gap-2">
                {(() => { const Icon = STEPS[step].icon; return <Icon className="w-4 h-4 text-primary" /> })()}
                {STEPS[step].label}
              </h2>
              <div className="flex-1">{stepContent[step]}</div>
              <div className="flex justify-between pt-5 border-t mt-5">
                <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
                  <ChevronLeft /> Anterior
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button size="sm" onClick={handleNext}>
                    Siguiente <ChevronRight />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handlePredict}>
                    <Sparkles /> Predecir Deserción
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" /> Resultado de la Predicción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResultMock />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setResultado(null); setStep(0) }}>
                Nueva predicción
              </Button>
              <Button size="sm">Guardar y generar alerta</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}