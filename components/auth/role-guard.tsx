'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRoleAuth } from '@/hooks/use-role-auth'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: 'admin' | 'comercial'
  fallbackPath?: string
}

export function RoleGuard({ children, requiredRole, fallbackPath }: RoleGuardProps) {
  const { hasAccess, loading, error, role } = useRoleAuth(requiredRole)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !hasAccess) {
      console.log(`🚫 Access denied. User role: ${role}, Required: ${requiredRole}`)
      
      // Determine where to redirect based on user's actual role
      if (role === 'ADMIN' && requiredRole === 'comercial') {
        router.push('/admin/dashboard')
      } else if (role === 'COMERCIAL' && requiredRole === 'admin') {
        router.push('/comercial/dashboard')
      } else if (fallbackPath) {
        router.push(fallbackPath)
      } else {
        router.push('/login')
      }
    }
  }, [hasAccess, loading, role, requiredRole, router, fallbackPath])

  // Show loading while checking permissions
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Show error if something went wrong
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="text-destructive text-xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold mb-2">Error de Verificación</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => router.push('/login')} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Volver al Login
          </button>
        </div>
      </div>
    )
  }

  // Show access denied if user doesn't have permission
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="text-destructive text-xl mb-4">🚫</div>
          <h2 className="text-lg font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground mb-4">
            No tienes permisos para acceder a esta sección.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Tu rol: <strong>{role}</strong> | Requerido: <strong>{requiredRole.toUpperCase()}</strong>
          </p>
          <button 
            onClick={() => {
              if (role === 'ADMIN') {
                router.push('/admin/dashboard')
              } else if (role === 'COMERCIAL') {
                router.push('/comercial/dashboard')
              } else {
                router.push('/login')
              }
            }} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Ir a tu Dashboard
          </button>
        </div>
      </div>
    )
  }

  // User has access, render children
  return <>{children}</>
}