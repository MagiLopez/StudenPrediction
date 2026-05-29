import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import LoginModal from "@/components/auth/LoginModal"
import { Button } from "@/components/ui/button"
import { Brain, LogIn, User, Menu, X } from "lucide-react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // App.jsx ya se encarga de no renderizar Navbar si hay sesión.
  // Aquí solo manejamos qué links mostrar según la ruta.
  const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Predicción", href: "/prediccion" },
  ]

  const handleNavClick = (href) => {
    setMobileMenuOpen(false)
    navigate(href)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-slate-800">EduPredict</span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-sm transition-colors ${
                    location.pathname === link.href
                      ? "text-primary font-medium"
                      : "text-slate-600 hover:text-primary"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => setShowLoginModal(true)}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 bg-white">
            <div className="flex flex-col gap-1 px-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setShowLoginModal(true)
                }}
                className="mt-2 px-3 py-2 rounded-lg text-left text-sm text-primary hover:bg-primary/10"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={() => navigate("/indicadores")}
      />
    </>
  )
}