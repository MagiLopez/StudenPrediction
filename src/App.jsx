import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Home from "@/pages/Home";
import Indicadores from "@/pages/Indicadores";
import Prediccion from "@/pages/Prediccion";
import Historial from "@/pages/Historial";
import Registros from "@/pages/Registros";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />

      <Routes>
        {user ? (
          // ── Usuario logueado: todas las rutas disponibles ──────────────────
          <>
            <Route path="/" element={<Home />} />
            <Route path="/indicadores" element={<Indicadores />} />
            <Route path="/prediccion" element={<Prediccion />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/registros" element={<Registros />} />
            <Route path="*" element={<Navigate to="/indicadores" replace />} />
          </>
        ) : (
          // ── Sin sesión: solo rutas públicas ──────────────────────────────
          <>
            <Route path="/" element={<Home />} />
            <Route path="/prediccion" element={<Prediccion />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
