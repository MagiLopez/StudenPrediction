import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import LoginModal from "@/components/auth/LoginModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Brain, 
  Crosshair, 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  ArrowRight,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Shield,
  Clock
} from "lucide-react"

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleDashboardAccess = () => {
    if (user) {
      navigate("/indicadores")
    } else {
      setShowLoginModal(true)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Hero Section - Elegante y minimalista */}
        <section className="relative overflow-hidden">
          {/* Fondo decorativo sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
          
          <div className="relative container mx-auto px-4 py-24 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>IA para educación</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                EduPredict
              </h1>
              
              <p className="text-xl text-slate-600 mb-4 max-w-2xl mx-auto leading-relaxed">
                Predicción inteligente de deserción estudiantil
              </p>
              
              <p className="text-slate-500 max-w-xl mx-auto mb-10">
                Análisis predictivo basado en machine learning para identificar 
                estudiantes en riesgo y optimizar recursos institucionales.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/prediccion")}
                  className="gap-2 px-8"
                >
                  Probar predicción
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleDashboardAccess}
                  className="gap-2 px-8"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Panel de control
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features - 3 columnas limpias */}
        <section className="py-20 border-t border-slate-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 mb-3">
                Capacidades del sistema
              </h2>
              <p className="text-slate-500">
                Análisis multidimensional para una visión completa
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Crosshair className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="font-medium text-slate-800 mb-2">Evaluación de riesgo</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Calcula probabilidad de deserción basado en variables académicas, 
                  económicas y sociales.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="font-medium text-slate-800 mb-2">Visualización analítica</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Gráficos interactivos y tendencias históricas para seguimiento institucional.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="font-medium text-slate-800 mb-2">Gestión integral</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Registro y seguimiento de estudiantes con alertas tempranas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Métricas/Estadísticas - Elegante */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              <div>
                <p className="text-3xl font-bold text-slate-800 mb-1">85%</p>
                <p className="text-sm text-slate-500">Precisión del modelo</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800 mb-1">4s</p>
                <p className="text-sm text-slate-500">Tiempo de predicción</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800 mb-1">24/7</p>
                <p className="text-sm text-slate-500">Disponibilidad</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona - Limpio */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 mb-3">
                Flujo de trabajo
              </h2>
              <p className="text-slate-500">
                Simple, rápido y efectivo
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-3xl mx-auto">
              <div className="text-center flex-1">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-medium mx-auto mb-3">
                  1
                </div>
                <p className="text-sm text-slate-600">Ingreso de datos</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />
              <div className="text-center flex-1">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-medium mx-auto mb-3">
                  2
                </div>
                <p className="text-sm text-slate-600">Análisis predictivo</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />
              <div className="text-center flex-1">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-medium mx-auto mb-3">
                  3
                </div>
                <p className="text-sm text-slate-600">Resultados y acciones</p>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios clave */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-semibold text-slate-800 mb-3">
                  Beneficios estratégicos
                </h2>
                <p className="text-slate-500">
                  Decisiones basadas en datos para tu institución
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <TrendingUp className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">Reducción de deserción</h4>
                    <p className="text-sm text-slate-500">Identificación temprana de estudiantes en riesgo.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">Asignación eficiente</h4>
                    <p className="text-sm text-slate-500">Optimiza recursos de apoyo académico.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">Respuesta oportuna</h4>
                    <p className="text-sm text-slate-500">Intervención antes de que sea tarde.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Brain className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">IA especializada</h4>
                    <p className="text-sm text-slate-500">Modelo entrenado con datos académicos reales.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Card className="max-w-2xl mx-auto border-0 shadow-none">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  ¿Listo para transformar la retención estudiantil?
                </h3>
                <p className="text-slate-500 mb-6">
                  Comienza a utilizar la plataforma hoy mismo.
                </p>
                <Button size="lg" onClick={() => navigate("/prediccion")} className="px-8">
                  Comenzar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer simple */}
        <footer className="py-8 border-t border-slate-100">
          <div className="container mx-auto px-4 text-center text-sm text-slate-400">
            <p>© 2024 EduPredict · Sistema de predicción de deserción estudiantil</p>
          </div>
        </footer>
      </div>

      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
        onSuccess={() => navigate("/indicadores")}
      />
    </>
  )
}