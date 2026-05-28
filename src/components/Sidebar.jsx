import { NavLink } from "react-router-dom"
import { LayoutDashboard, Bell, Users, FileText, Crosshair, Settings, Brain } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/",           icon: LayoutDashboard, label: "Indicadores" },
  { to: "/prediccion", icon: Crosshair,        label: "Predicción" },
  { to: "/consultas",    icon: Bell,             label: "Consultas" },
  { to: "/registros",  icon: FileText,         label: "Registros" },
]

export default function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 bg-sidebar border-r border-sidebar-border sticky top-0 h-screen flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-sidebar-border">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm text-sidebar-foreground">EduPredict</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="bg-destructive/10 text-destructive text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Footer */}
      <div className="px-3 py-3 space-y-0.5">
        <NavLink to="/configuracion"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configuración
        </NavLink>
      </div>

      <div className="px-4 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
            AC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">Ana Coordinadora</p>
            <p className="text-[10px] text-sidebar-foreground/50">Coordinadora</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
