'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RoleAuthState {
  role: string
  hasAccess: boolean
  userName: string
  loading: boolean
  error: string | null
}

export function useRoleAuth(requiredRole?: 'admin' | 'comercial'): RoleAuthState {
  const [authState, setAuthState] = useState<RoleAuthState>({
    role: '',
    hasAccess: false,
    userName: '',
    loading: true,
    error: null
  })

  useEffect(() => {
    async function checkAuth() {
      try {
        setAuthState(prev => ({ ...prev, loading: true, error: null }))
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setAuthState({
            role: '',
            hasAccess: false,
            userName: '',
            loading: false,
            error: 'Not authenticated'
          })
          return
        }

        // Get user role from database
        const { data: roleData, error } = await supabase
          .from('crm_roles')
          .select('role, activo, comercial(nombre)')
          .eq('user_id', user.id)
          .eq('activo', true)
          .single()

        if (error || !roleData) {
          console.error('Role verification error:', error)
          setAuthState({
            role: '',
            hasAccess: false,
            userName: user.email || '',
            loading: false,
            error: 'Role not found'
          })
          return
        }

        const userRole = roleData.role.toLowerCase()
        const hasAccess = !requiredRole || (
          (requiredRole === 'admin' && userRole === 'admin') ||
          (requiredRole === 'comercial' && (userRole === 'comercial' || userRole === 'admin'))
        )

        setAuthState({
          role: roleData.role,
          hasAccess,
          userName: roleData.comercial?.nombre || user.email || '',
          loading: false,
          error: null
        })

        console.log('🔍 Role auth verification:', {
          userRole: roleData.role,
          requiredRole,
          hasAccess,
          userName: roleData.comercial?.nombre
        })

      } catch (error) {
        console.error('Role auth error:', error)
        setAuthState({
          role: '',
          hasAccess: false,
          userName: '',
          loading: false,
          error: 'Role verification failed'
        })
      }
    }

    checkAuth()
  }, [requiredRole])

  return authState
}