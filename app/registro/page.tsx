"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { User, Mail, Phone, MapPin, ChevronLeft, ChevronRight, Check, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

const steps = [
  { id: 1, title: "Datos Personales" },
  { id: 2, title: "Experiencia Comercial" },
  { id: 3, title: "Configuración de Cuenta" },
]

const cities = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Pereira",
  "Manizales",
  "Ibagué",
  "Otra",
]

const sectors = [
  { id: "bares", label: "Bares y Discotecas" },
  { id: "restaurantes", label: "Restaurantes" },
  { id: "retail", label: "Retail y Comercio" },
  { id: "otros", label: "Otros sectores" },
]

export default function RegistroPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1
    nombre: "",
    email: "",
    telefono: "",
    ciudad: "",
    // Step 2
    experienciaVentas: false,
    anosExperiencia: [2],
    sectoresExperiencia: [] as string[],
    motivacion: "",
    // Step 3
    password: "",
    confirmPassword: "",
    aceptaTerminos: false,
    recibirNoticias: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegistro = async () => {
    try {
      setIsSubmitting(true)
      setErrors({})

      console.log('🚀 Iniciando registro de comercial:', { nombre: formData.nombre, email: formData.email })

      // First, create user in Supabase Auth (client-side)
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.nombre,
            role: 'comercial'
          }
        }
      })

      if (authError) {
        console.error('❌ Error en auth signup:', authError)
        setErrors({ general: authError.message })
        return
      }

      if (!authData.user) {
        setErrors({ general: 'Error al crear usuario' })
        return
      }

      console.log('✅ Usuario creado en Auth:', authData.user.id)

      // Then create comercial profile
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: authData.user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Error creando perfil comercial:', result)
        setErrors({ general: result.error || 'Error al crear el perfil comercial' })
        return
      }

      console.log('✅ Registro completado:', result)
      
      // Redirigir al login con mensaje de éxito
      window.location.href = `/login?message=${encodeURIComponent('Cuenta creada exitosamente. Puedes iniciar sesión.')}`

    } catch (error) {
      console.error('💥 Error en registro:', error)
      setErrors({ general: 'Error de conexión. Intenta nuevamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido"
      if (!formData.email.trim()) newErrors.email = "El email es requerido"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido"
      if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es requerido"
      if (!formData.ciudad) newErrors.ciudad = "La ciudad es requerida"
    }

    if (step === 3) {
      if (!formData.password) newErrors.password = "La contraseña es requerida"
      else if (formData.password.length < 8) newErrors.password = "Mínimo 8 caracteres"
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden"
      }
      if (!formData.aceptaTerminos) newErrors.aceptaTerminos = "Debes aceptar los términos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthColors = ["#FF4444", "#FF8800", "#FFAA00", "#00D4AA"]
  const strengthLabels = ["Débil", "Regular", "Buena", "Fuerte"]

  return (
    <div className="min-h-screen bg-[#202020] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-[#FF5F45]/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-[#FF7A63]/10 to-transparent rounded-full blur-2xl" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-[#FF5F45] mb-2">Wingman</div>
            <h1 className="text-2xl font-bold text-white mb-2">Únete al equipo Wingman</h1>
            <p className="text-[#e0e0e0]">Comienza a ganar comisiones captando bares</p>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${
                    currentStep > step.id
                      ? "bg-[#FF5F45] text-white shadow-[0_0_20px_rgba(255,95,69,0.5)]"
                      : currentStep === step.id
                        ? "bg-[#FF5F45] text-white shadow-[0_0_20px_rgba(255,95,69,0.5)]"
                        : "bg-[#4a4a4a] text-[#b0b0b0] border border-[#4a4a4a]"
                  }
                `}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 transition-colors duration-300 ${
                      currentStep > step.id ? "bg-[#FF5F45]" : "bg-[#4a4a4a]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20">
            {/* Step 1: Datos Personales */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-[#e0e0e0]">
                    Nombre completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0b0]" />
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className={`pl-10 bg-[#353535] border-transparent text-white placeholder-[#b0b0b0] focus:border-[#FF5F45] focus:shadow-[0_0_0_3px_rgba(255,95,69,0.3)] ${
                        errors.nombre ? "border-red-500 animate-shake" : ""
                      }`}
                      placeholder="Tu nombre completo"
                    />
                    {errors.nombre && <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>}
                  </div>
                </div>

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
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-[#e0e0e0]">
                    Teléfono
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0b0]" />
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className={`pl-10 bg-[#353535] border-transparent text-white placeholder-[#b0b0b0] focus:border-[#FF5F45] focus:shadow-[0_0_0_3px_rgba(255,95,69,0.3)] ${
                        errors.telefono ? "border-red-500 animate-shake" : ""
                      }`}
                      placeholder="+57 300 123 4567"
                    />
                    {errors.telefono && <p className="text-red-400 text-sm mt-1">{errors.telefono}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad" className="text-[#e0e0e0]">
                    Ciudad
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0b0] z-10" />
                    <Select
                      value={formData.ciudad}
                      onValueChange={(value) => setFormData({ ...formData, ciudad: value })}
                    >
                      <SelectTrigger
                        className={`pl-10 bg-[#353535] border-transparent text-white focus:border-[#FF5F45] focus:shadow-[0_0_0_3px_rgba(255,95,69,0.3)] ${
                          errors.ciudad ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Selecciona tu ciudad" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#353535] border-[#4a4a4a]">
                        {cities.map((city) => (
                          <SelectItem key={city} value={city} className="text-white hover:bg-[#4a4a4a]">
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.ciudad && <p className="text-red-400 text-sm mt-1">{errors.ciudad}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Experiencia Comercial */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[#e0e0e0]">¿Has trabajado en ventas?</Label>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={formData.experienciaVentas}
                      onCheckedChange={(checked) => setFormData({ ...formData, experienciaVentas: checked })}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FF5F45] data-[state=checked]:to-[#FF7A63]"
                    />
                    <span className="text-[#e0e0e0]">
                      {formData.experienciaVentas ? "Sí, tengo experiencia" : "No, soy nuevo en ventas"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[#e0e0e0]">Años de experiencia: {formData.anosExperiencia[0]}</Label>
                  <Slider
                    value={formData.anosExperiencia}
                    onValueChange={(value) => setFormData({ ...formData, anosExperiencia: value })}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-[#b0b0b0]">
                    <span>0 años</span>
                    <span>10+ años</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[#e0e0e0]">Sector de experiencia</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {sectors.map((sector) => (
                      <div key={sector.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={sector.id}
                          checked={formData.sectoresExperiencia.includes(sector.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                sectoresExperiencia: [...formData.sectoresExperiencia, sector.id],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                sectoresExperiencia: formData.sectoresExperiencia.filter((s) => s !== sector.id),
                              })
                            }
                          }}
                          className="border-[#4a4a4a] data-[state=checked]:bg-[#FF5F45] data-[state=checked]:border-[#FF5F45]"
                        />
                        <Label htmlFor={sector.id} className="text-[#e0e0e0] text-sm">
                          {sector.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivacion" className="text-[#e0e0e0]">
                    Cuéntanos tu motivación
                  </Label>
                  <Textarea
                    id="motivacion"
                    value={formData.motivacion}
                    onChange={(e) => setFormData({ ...formData, motivacion: e.target.value })}
                    className="bg-[#353535] border-transparent text-white placeholder-[#b0b0b0] focus:border-[#FF5F45] focus:shadow-[0_0_0_3px_rgba(255,95,69,0.3)] min-h-[100px]"
                    placeholder="¿Qué te motiva a trabajar con nosotros?"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Configuración de Cuenta */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#e0e0e0]">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`pr-10 bg-[#353535] border-transparent text-white placeholder-[#b0b0b0] focus:border-[#FF5F45] focus:shadow-[0_0_0_3px_rgba(255,95,69,0.3)] ${
                        errors.password ? "border-red-500 animate-shake" : ""
                      }`}
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b0b0b0] hover:text-[#FF5F45]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-[#4a4a4a] rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(passwordStrength / 4) * 100}%`,
                              backgroundColor: strengthColors[passwordStrength - 1] || "#4a4a4a",
                            }}
                          />
                        </div>
                        <span className="text-sm" style={{ color: strengthColors[passwordStrength - 1] || "#b0b0b0" }}>
                          {strengthLabels[passwordStrength - 1] || "Muy débil"}
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#e0e0e0]">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`pr-10 bg-[#353535] border-transparent text-white placeholder-[#b0b0b0] focus:border-[#FF5F45] focus:shadow-[0_0_0_3px_rgba(255,95,69,0.3)] ${
                        errors.confirmPassword ? "border-red-500 animate-shake" : ""
                      }`}
                      placeholder="Repite tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b0b0b0] hover:text-[#FF5F45]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <Check className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terminos"
                      checked={formData.aceptaTerminos}
                      onCheckedChange={(checked) => setFormData({ ...formData, aceptaTerminos: !!checked })}
                      className="border-[#4a4a4a] data-[state=checked]:bg-[#FF5F45] data-[state=checked]:border-[#FF5F45] mt-1"
                    />
                    <Label htmlFor="terminos" className="text-[#e0e0e0] text-sm leading-relaxed">
                      Acepto los{" "}
                      <Link href="/terminos" className="text-[#FF5F45] hover:underline">
                        términos y condiciones
                      </Link>{" "}
                      y la{" "}
                      <Link href="/privacidad" className="text-[#FF5F45] hover:underline">
                        política de privacidad
                      </Link>
                    </Label>
                  </div>
                  {errors.aceptaTerminos && <p className="text-red-400 text-sm">{errors.aceptaTerminos}</p>}

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="noticias"
                      checked={formData.recibirNoticias}
                      onCheckedChange={(checked) => setFormData({ ...formData, recibirNoticias: !!checked })}
                      className="border-[#4a4a4a] data-[state=checked]:bg-[#FF5F45] data-[state=checked]:border-[#FF5F45] mt-1"
                    />
                    <Label htmlFor="noticias" className="text-[#e0e0e0] text-sm leading-relaxed">
                      Quiero recibir noticias y actualizaciones de Wingman
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm text-center">{errors.general}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className="border-[#4a4a4a] text-[#e0e0e0] hover:bg-[#4a4a4a] disabled:opacity-50 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              <Button
                onClick={currentStep === 3 ? handleRegistro : nextStep}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#FF5F45] to-[#FF7A63] text-white font-semibold hover:shadow-[0_0_20px_rgba(255,95,69,0.5)] hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {currentStep === 3 ? (isSubmitting ? "Creando..." : "Crear Cuenta") : "Siguiente"}
                {currentStep !== 3 && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-[#b0b0b0]">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-[#FF5F45] hover:underline font-semibold">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
