import { supabase } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
  role: 'comercial' | 'admin'
  profile?: {
    id: string
    nombre: string
    telefono?: string
    ciudad?: string
  }
}

export const authService = {
  // Login con email y password
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null, error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (!data.user) {
        return { user: null, error: 'Usuario no encontrado' }
      }

      // Obtener perfil del usuario
      const profile = await this.getUserProfile(data.user.id)
      
      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: this.determineUserRole(data.user.email!),
          profile
        },
        error: null
      }
    } catch (error) {
      console.error('Error signing in:', error)
      return { user: null, error: 'Error de conexión' }
    }
  },

  // Registro de nuevo usuario
  async signUp(email: string, password: string, userData: {
    nombre: string
    telefono?: string
    ciudad?: string
  }): Promise<{ user: AuthUser | null, error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: userData.nombre,
            telefono: userData.telefono,
            ciudad: userData.ciudad
          }
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (!data.user) {
        return { user: null, error: 'Error creando usuario' }
      }

      // Crear perfil en la tabla comercial
      await supabase
        .from('comercial')
        .insert({
          id: data.user.id,
          nombre: userData.nombre,
          email: email,
          telefono: userData.telefono,
          ciudad: userData.ciudad,
          activo: true
        })

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: 'comercial',
          profile: {
            id: data.user.id,
            nombre: userData.nombre,
            telefono: userData.telefono,
            ciudad: userData.ciudad
          }
        },
        error: null
      }
    } catch (error) {
      console.error('Error signing up:', error)
      return { user: null, error: 'Error creando cuenta' }
    }
  },

  // Cerrar sesión
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error) {
      console.error('Error signing out:', error)
      return { error: 'Error cerrando sesión' }
    }
  },

  // Obtener usuario actual
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      const profile = await this.getUserProfile(user.id)
      
      return {
        id: user.id,
        email: user.email!,
        role: this.determineUserRole(user.email!),
        profile
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // Obtener perfil del usuario
  async getUserProfile(userId: string) {
    try {
      // Primero intentar en la tabla comercial
      const { data: comercial } = await supabase
        .from('comercial')
        .select('id, nombre, telefono, ciudad')
        .eq('id', userId)
        .single()

      if (comercial) {
        return comercial
      }

      // Si no está en comercial, intentar en administradores
      const { data: admin } = await supabase
        .from('administradores')
        .select('id, nombre, telefono, ciudad')
        .eq('id', userId)
        .single()

      return admin || null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Determinar rol del usuario
  determineUserRole(email: string): 'comercial' | 'admin' {
    // Lógica simple: si el email contiene 'admin', es admin
    return email.includes('admin') ? 'admin' : 'comercial'
  },

  // Escuchar cambios en la sesión
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id)
        callback({
          id: session.user.id,
          email: session.user.email!,
          role: this.determineUserRole(session.user.email!),
          profile
        })
      } else {
        callback(null)
      }
    })
  }
}