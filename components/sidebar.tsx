"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from '@supabase/supabase-js'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  BarChart3,
  Target,
  DollarSign,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckSquare,
  Users,
  TrendingUp,
  PlusCircle,
  FileBarChart,
} from "lucide-react"

const commercialNavigation = [
  {
    title: "Dashboard",
    href: "/comercial/dashboard",
    icon: Home,
  },
  {
    title: "Pipeline",
    href: "/comercial/pipeline",
    icon: BarChart3,
  },
  {
    title: "Eventos",
    href: "/comercial/eventos",
    icon: Target,
  },
  {
    title: "Registro Bar",
    href: "/comercial/registro-bar",
    icon: PlusCircle,
  },
  {
    title: "Comisiones",
    href: "/comercial/comisiones",
    icon: DollarSign,
  },
  {
    title: "Reportes",
    href: "/comercial/reportes",
    icon: FileBarChart,
  },
  {
    title: "Payouts",
    href: "/comercial/payouts",
    icon: CreditCard,
  },
  {
    title: "Configuración",
    href: "/comercial/configuracion",
    icon: Settings,
  },
]

const adminNavigation = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Aprobaciones",
    href: "/admin/aprobaciones",
    icon: CheckSquare,
    badge: 12,
  },
  {
    title: "Comerciales",
    href: "/admin/comerciales",
    icon: Users,
  },
  {
    title: "Reportes",
    href: "/admin/reportes",
    icon: TrendingUp,
  },
  {
    title: "Payouts",
    href: "/admin/payouts",
    icon: CreditCard,
  },
  {
    title: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
  },
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SidebarProps {
  className?: string
  userRole?: "comercial" | "admin" // Force a specific role instead of detecting from pathname
}

export function Sidebar({ className, userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [userInfo, setUserInfo] = useState<{ name: string; initials: string } | null>(null)
  const pathname = usePathname()

  // Determine if we're in admin or commercial section
  // Use userRole prop if provided, otherwise detect from pathname
  const isAdmin = userRole ? userRole === "admin" : pathname.startsWith("/admin")
  const navigationItems = isAdmin ? adminNavigation : commercialNavigation

  useEffect(() => {
    fetchUserInfo()
  }, [])

  async function fetchUserInfo() {
    try {
      // Get current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Find comercial by user_id in crm_roles
        const { data: roleData } = await supabase
          .from('crm_roles')
          .select('comercial_id, comercial(id, nombre)')
          .eq('user_id', user.id)
          .eq('activo', true)
          .single()

        if (roleData?.comercial) {
          const name = roleData.comercial.nombre || 'Usuario'
          const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
          setUserInfo({ name, initials })
        } else {
          // Try to find comercial by email if no role found
          const { data: comercialData } = await supabase
            .from('comercial')
            .select('nombre')
            .eq('email', user.email)
            .single()

          if (comercialData?.nombre) {
            const name = comercialData.nombre
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
            setUserInfo({ name, initials })
          } else {
            // Fallback to email
            const name = user.email?.split('@')[0] || 'Usuario'
            const initials = name.substring(0, 2).toUpperCase()
            setUserInfo({ name, initials })
          }
        }
      } else {
        // No user authenticated - use demo data
        setUserInfo({ name: 'Juan Pérez (Demo)', initials: 'JD' })
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
      setUserInfo({ name: 'Usuario', initials: 'U' })
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-wingman",
        collapsed ? "w-16" : "w-60",
        className,
      )}
    >
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">W</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-sidebar-foreground">Wingman</span>
              {isAdmin && (
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3 text-primary" />
                  <span className="text-xs text-primary font-medium">ADMIN</span>
                </div>
              )}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>


      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start transition-wingman",
                  collapsed ? "px-2" : "px-3",
                  isActive && "bg-primary text-primary-foreground glow-coral",
                  !isActive && "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs">{item.badge}</Badge>
                    )}
                  </div>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn("flex items-center space-x-3", collapsed && "justify-center")}>
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-accent-foreground font-medium text-sm">
              {userInfo?.initials || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {userInfo?.name || 'Cargando...'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{isAdmin ? "Admin" : "Comercial"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
