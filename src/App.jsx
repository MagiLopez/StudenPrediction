import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import Layout from "@/components/layout/Layout"
import Navbar from "@/components/layout/Navbar"
import Home from "@/pages/Home"
import Indicadores from "@/pages/Indicadores"
import Prediccion from "@/pages/Prediccion"
import Registros from "@/pages/Registros"

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      {!user && <Navbar />}

      <Routes>
        {user ? (
          <Route element={<Layout />}>
            <Route path="/indicadores" element={<Indicadores />} />
            <Route path="/prediccion"  element={<Prediccion />} />
            <Route path="/registros"   element={<Registros />} />
            <Route path="/"            element={<Home />} />
            <Route path="*"            element={<Navigate to="/indicadores" replace />} />
          </Route>
        ) : (
          <>
            <Route path="/"           element={<Home />} />
            <Route path="/prediccion" element={<Prediccion />} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App