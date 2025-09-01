"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Usar directamente Supabase Auth en el cliente
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error('❌ Error en login:', error)
        setErrors({ general: "Credenciales incorrectas" })
        return
      }

      if (data.user) {
        console.log('✅ Login exitoso:', { user_id: data.user.id, email: data.user.email })
        
        try {
          // Verificar si es admin consultando la base de datos
          const { data: roleData } = await supabase
            .from('crm_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .eq('activo', true)
            .single()
          
          const isAdmin = roleData?.role === 'admin' || formData.email === 'admin@wingman.com' || formData.email.includes('admin')
          
          if (isAdmin) {
            console.log('🔐 Redirigiendo a admin dashboard')
            router.push("/admin/dashboard")
          } else {
            console.log('👤 Redirigiendo a comercial dashboard')
            router.push("/comercial/dashboard")
          }
        } catch (roleError) {
          console.log('⚠️ No se pudo verificar rol, usando email como fallback')
          // Fallback: usar email para determinar rol
          const isAdmin = formData.email === 'admin@wingman.com' || formData.email.includes('admin')
          
          if (isAdmin) {
            router.push("/admin/dashboard")
          } else {
            router.push("/comercial/dashboard")
          }
        }
        
        router.refresh() // Forzar refresh para actualizar datos
      } else {
        setErrors({ general: "No se pudo autenticar" })
      }
    } catch (error) {
      console.error('💥 Error en login:', error)
      setErrors({ general: "Error de conexión. Intenta nuevamente." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#202020] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-[#FF5F45]/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-[#FF7A63]/10 to-transparent rounded-full blur-2xl" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-[#FF5F45] mb-2">Wingman</div>
            <h1 className="text-2xl font-semibold text-white mb-2">Accede a tu panel</h1>
            <p className="text-[#e0e0e0]">Gestiona tus leads y comisiones</p>
          </div>

          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20">
            {/* Error Message */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center animate-shake">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#e0e0e0]">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0b0]" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`pl-10 bg-[#353535] border-transparent text-white placeholder-[#b0b0b0] focus:border-[#FF5F45] focus:shadow-[0_0_0_3px_rgba(255,95,69,0.3)] ${
                      errors.email ? "border-red-500 animate-shake" : ""
                    }`}
                    placeholder="tu@email.com"
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#e0e0e0]">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0b0]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`pl-10 pr-10 bg-[#353535] border-transparent text-white placeholder-[#b0b0b0] focus:border-[#FF5F45] focus:shadow-[0_0_0_3px_rgba(255,95,69,0.3)] ${
                      errors.password ? "border-red-500 animate-shake" : ""
                    }`}
                    placeholder="Tu contraseña"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b0b0b0] hover:text-[#FF5F45] transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) => setFormData({ ...formData, remember: !!checked })}
                  className="border-[#4a4a4a] data-[state=checked]:bg-[#FF5F45] data-[state=checked]:border-[#FF5F45]"
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-[#e0e0e0] text-sm">
                  Recordarme
                </Label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#FF5F45] to-[#FF7A63] text-white font-semibold py-3 hover:shadow-[0_0_20px_rgba(255,95,69,0.5)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Forgot Password */}
            <div className="text-center mt-6">
              <Link href="/recuperar-password" className="text-[#FF5F45] hover:underline text-sm font-medium">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#4a4a4a]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#202020] text-[#b0b0b0]">o</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-[#b0b0b0] text-sm">
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="text-[#FF5F45] hover:underline font-semibold">
                  Regístrate aquí
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-3 bg-[#353535]/50 rounded-lg border border-[#4a4a4a]">
              <p className="text-[#b0b0b0] text-xs text-center mb-2">Credenciales de demo:</p>
              <div className="text-[#e0e0e0] text-xs text-center space-y-1">
                <div>
                  <strong>Comercial:</strong> testnuevo@demo.com / testpassword123
                </div>
                <div>
                  <strong>Admin:</strong> admin@wingman.com / admin123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
