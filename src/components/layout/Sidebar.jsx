import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LayoutDashboard, Bell, FileText, Crosshair, Brain, LogIn, LogOut } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import LoginModal from "@/components/auth/LoginModal"

const navItems = [
  { to: "/indicadores", icon: LayoutDashboard, label: "Indicadores", protected: true },
  { to: "/prediccion",  icon: Crosshair,       label: "Predicción",  protected: false },
  { to: "/registros",   icon: FileText,        label: "Registros",   protected: true },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleLoginSuccess = () => {
    const currentPath = window.location.pathname
    if (["/indicadores", "/registros"].includes(currentPath)) {
      navigate(currentPath)
    }
  }

  const itemsToShow = user ? navItems : navItems.filter(item => !item.protected)

  return (
    <>
      <aside className="w-56 flex-shrink-0 bg-sidebar border-r border-sidebar-border sticky top-0 h-screen flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-sidebar-border shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm text-sidebar-foreground">EduPredict</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {itemsToShow.map(({ to, icon: Icon, label, protected: isProtected }) => (
            <button
              key={to}
              onClick={() => {
                if (isProtected && !user) {
                  setShowLoginModal(true)
                } else {
                  navigate(to)
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
                window.location.pathname === to
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
            </button>
          ))}
        </nav>

        <Separator className="bg-sidebar-border shrink-0" />

        {/* Login / Logout */}
        <div className="px-3 py-3 shrink-0">
          {!user ? (
            <Button
              onClick={() => setShowLoginModal(true)}
              className="w-full gap-2"
              size="sm"
              variant="default"
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </Button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          )}
        </div>

        {/* Info de usuario */}
        {user && (
          <div className="px-4 py-3 border-t border-sidebar-border shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name || "Usuario"}</p>
                <p className="text-[10px] text-sidebar-foreground/50">{user.role || "Coordinador"}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={handleLoginSuccess}
      />
    </>
  )
}