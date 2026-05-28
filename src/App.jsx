import { BrowserRouter, Routes, Route } from "react-router-dom"
import Sidebar from "@/components/Sidebar"
import Indicadores from "@/pages/Indicadores"
import Prediccion from "@/pages/Prediccion"
import Registros from "@/pages/Registros"
import Consultas from "@/pages/Consultas"


function Placeholder({ title }) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">{title}</h1>
      <div className="rounded-xl border bg-card p-20 flex items-center justify-center text-sm text-muted-foreground">
        Módulo en construcción
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-muted/30 min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/"              element={<Indicadores />} />
            <Route path="/prediccion"    element={<Prediccion />} />
            <Route path="/consultas"       element={<Consultas />} />
            <Route path="/registros"     element={<Registros />} />
            <Route path="/configuracion" element={<Placeholder title="Configuración" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
