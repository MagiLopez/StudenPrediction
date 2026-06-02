import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import LoginModal from "@/components/auth/LoginModal"
import { Button } from "@/components/ui/button"
import { Brain, LogIn, LogOut, User, Menu, X } from "lucide-react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = user
    ? [
        { label: "Inicio", href: "/" },
        { label: "Predicción", href: "/prediccion" },
        { label: "Indicadores", href: "/indicadores" },
        { label: "Registros", href: "/registros" },
      ]
    : [
        { label: "Inicio", href: "/" },
        { label: "Predicción", href: "/prediccion" },
      ]

  const handleNavClick = (href) => {
    setMobileMenuOpen(false)
    navigate(href)
  }

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    navigate("/")
  }

  // Obtener el nombre completo del usuario
  const getDisplayName = () => {
    if (user?.nombre && user?.apellido) {
      return `${user.nombre} ${user.apellido}`
    }
    if (user?.nombre) {
      return user.nombre
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return "Usuario"
  }

  // Obtener iniciales para el avatar
  const getInitials = () => {
    if (user?.nombre && user?.apellido) {
      return `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
    }
    if (user?.nombre) {
      return user.nombre.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            {/* Logo */}
            <div className="flex-1">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-slate-800">
                  EduPredict
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 justify-center items-center gap-8">
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
            <div className="hidden md:flex flex-1 justify-end items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {getInitials()}
                      </span>
                    </div>
                    <span className="text-sm text-slate-700">
                      {getDisplayName()}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setShowLoginModal(true)}
                  className="gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar sesión
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden ml-auto">
              <button
                className="p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
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
                  }`}>
                  {link.label}
                </button>
              ))}

              {user ? (
                <>
                  <div className="border-t border-slate-100 my-2" />
                  <div className="px-3 py-2">
                    <p className="text-xs text-slate-500">Conectado como</p>
                    <p className="text-sm font-medium text-slate-800"> {getDisplayName()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg text-left text-sm text-red-600 hover:bg-red-50">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setShowLoginModal(true)
                  }}
                  className="mt-2 px-3 py-2 rounded-lg text-left text-sm text-primary hover:bg-primary/10">
                  Iniciar sesión
                </button>
              )}
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