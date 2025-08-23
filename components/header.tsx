"use client"

import { useState, useEffect } from "react"
import { Bell, Search, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface HeaderProps {
  title?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function Header({ title, breadcrumbs }: HeaderProps) {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('Cargando...')

  useEffect(() => {
    fetchUserName()
  }, [])

  async function fetchUserName() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Find comercial by user_id in crm_roles
        const { data: roleData } = await supabase
          .from('crm_roles')
          .select('comercial_id, comercial(nombre)')
          .eq('user_id', user.id)
          .eq('activo', true)
          .single()

        if (roleData?.comercial?.nombre) {
          setUserName(roleData.comercial.nombre)
        } else {
          // Try to find comercial by email if no role found
          const { data: comercialData } = await supabase
            .from('comercial')
            .select('nombre')
            .eq('email', user.email)
            .single()

          if (comercialData?.nombre) {
            setUserName(comercialData.nombre)
          } else {
            // Fallback to email
            setUserName(user.email?.split('@')[0] || 'Usuario')
          }
        }
      } else {
        setUserName('Juan Pérez (Demo)')
      }
    } catch (error) {
      console.error('Error fetching user name:', error)
      setUserName('Usuario')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem("wingman_auth")
      router.push("/")
    } catch (error) {
      console.error('Error during logout:', error)
      router.push("/")
    }
  }

  return (
    <header className="flex items-center justify-between p-4 bg-card border-b border-border">
      {/* Left side - Title and Breadcrumbs */}
      <div className="flex items-center space-x-4">
        {breadcrumbs && (
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center space-x-2">
                {index > 0 && <span>/</span>}
                <span className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
                  {crumb.label}
                </span>
              </div>
            ))}
          </nav>
        )}
        {title && !breadcrumbs && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
      </div>

      {/* Right side - Search, Notifications, Profile */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-10 w-64 bg-input border-border" />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xs text-primary-foreground">3</span>
          </span>
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-sm font-medium">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configuración</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
