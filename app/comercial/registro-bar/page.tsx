"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, ChevronRight, Check, MapPin, CalendarIcon, Upload, Building, FileText } from "lucide-react"
import { SidebarComercial } from "@/components/sidebar-comercial"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { SidebarOverlay } from "@/components/sidebar-overlay"

const steps = [
  { id: 1, title: "Info Básica", icon: Building },
  { id: 2, title: "Ubicación", icon: MapPin },
  { id: 3, title: "Canal y Evento", icon: CalendarIcon },
  { id: 4, title: "Confirmación", icon: Check },
]

export default function RegistroBarPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [date, setDate] = useState<Date>()
  const [metodoEnganche, setMetodoEnganche] = useState("evento")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  
  console.log("📄 RegistroBarPage: Component rendering...")
  
  // Test log después de un breve delay
  useEffect(() => {
    setTimeout(() => {
      console.log("🧪 TEST LOG: Este debería aparecer en la terminal después de 1 segundo")
    }, 1000)
  }, [])
  
  // Monitor sidebar state changes - removed since not needed
  
  const [formData, setFormData] = useState({
    // Paso 1: Info Básica
    nombreBar: "",
    nit: "",
    contactoNombre: "",
    contactoTelefono: "",
    contactoEmail: "",

    // Paso 2: Ubicación
    direccion: "",
    ciudad: "",
    barrio: "",
    coordenadas: "",

    // Paso 3: Método de Enganche y Evento
    metodo: "evento",
    fechaEvento: null as Date | null,
    tipoEvento: "",
    aforoEstimado: "",

    // Documentos
    documentos: [] as File[],
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitMessage("")
    
    try {
      // Prepare form data with current date selection
      const submitData = {
        ...formData,
        fechaEvento: date ? date.toISOString() : null
      }
      
      console.log("Formulario enviado:", submitData)
      
      const response = await fetch('/api/registro-bar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSubmitMessage("✅ Bar registrado exitosamente!")
        console.log("🎉 Registration successful:", result.data)
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setCurrentStep(1)
          setDate(undefined)
          setFormData({
            nombreBar: "",
            nit: "",
            contactoNombre: "",
            contactoTelefono: "",
            contactoEmail: "",
            direccion: "",
            ciudad: "",
            barrio: "",
            coordenadas: "",
            metodo: "evento",
            fechaEvento: null,
            tipoEvento: "",
            aforoEstimado: "",
            documentos: [],
          })
          setSubmitMessage("")
        }, 3000)
      } else {
        setSubmitMessage(`❌ Error: ${result.error}`)
        console.error("Registration failed:", result.error)
      }
      
    } catch (error) {
      setSubmitMessage("❌ Error de conexión. Por favor intenta de nuevo.")
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  console.log("📄 RegistroBarPage: About to render with Sidebar")
  
  return (
    <div className="flex h-screen bg-background">
      <SidebarComercial />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Registro de Nuevo Bar</h1>
          <p className="text-gray-400">Completa la información para registrar un nuevo establecimiento</p>
        </div>

      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    isActive
                      ? "border-[#FF5F45] bg-[#FF5F45] text-white"
                      : isCompleted
                        ? "border-[#00D4AA] bg-[#00D4AA] text-white"
                        : "border-gray-600 bg-[#2a2a2a] text-gray-400",
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="ml-3">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isActive ? "text-[#FF5F45]" : isCompleted ? "text-[#00D4AA]" : "text-gray-400",
                    )}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-4 transition-all duration-300",
                      isCompleted ? "bg-[#00D4AA]" : "bg-gray-600",
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <Card className="bg-[#2a2a2a] border-gray-700">
        <CardContent className="p-8">
          {/* Paso 1: Info Básica */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Información Básica del Bar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombreBar" className="text-white">
                      Nombre del Bar *
                    </Label>
                    <Input
                      id="nombreBar"
                      value={formData.nombreBar}
                      onChange={(e) => handleInputChange("nombreBar", e.target.value)}
                      className="bg-[#353535] border-gray-600 text-white"
                      placeholder="Ej: El Rincón Dorado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nit" className="text-white">
                      NIT *
                    </Label>
                    <Input
                      id="nit"
                      value={formData.nit}
                      onChange={(e) => handleInputChange("nit", e.target.value)}
                      className="bg-[#353535] border-gray-600 text-white"
                      placeholder="123456789-0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-4">Información de Contacto</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactoNombre" className="text-white">
                      Nombre Contacto *
                    </Label>
                    <Input
                      id="contactoNombre"
                      value={formData.contactoNombre}
                      onChange={(e) => handleInputChange("contactoNombre", e.target.value)}
                      className="bg-[#353535] border-gray-600 text-white"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactoTelefono" className="text-white">
                      Teléfono *
                    </Label>
                    <Input
                      id="contactoTelefono"
                      value={formData.contactoTelefono}
                      onChange={(e) => handleInputChange("contactoTelefono", e.target.value)}
                      className="bg-[#353535] border-gray-600 text-white"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactoEmail" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="contactoEmail"
                      type="email"
                      value={formData.contactoEmail}
                      onChange={(e) => handleInputChange("contactoEmail", e.target.value)}
                      className="bg-[#353535] border-gray-600 text-white"
                      placeholder="contacto@bar.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Ubicación */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Ubicación del Establecimiento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="direccion" className="text-white">
                      Dirección Completa *
                    </Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => handleInputChange("direccion", e.target.value)}
                      className="bg-[#353535] border-gray-600 text-white"
                      placeholder="Calle 123 #45-67"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ciudad" className="text-white">
                      Ciudad *
                    </Label>
                    <Input
                      id="ciudad"
                      value={formData.ciudad}
                      onChange={(e) => handleInputChange("ciudad", e.target.value)}
                      className="bg-[#353535] border-gray-600 text-white"
                      placeholder="Bogotá"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barrio" className="text-white">
                      Barrio/Localidad
                    </Label>
                    <Input
                      id="barrio"
                      value={formData.barrio}
                      onChange={(e) => handleInputChange("barrio", e.target.value)}
                      className="bg-[#353535] border-gray-600 text-white"
                      placeholder="Chapinero"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coordenadas" className="text-white">
                      Coordenadas GPS
                    </Label>
                    <Input
                      id="coordenadas"
                      value={formData.coordenadas}
                      onChange={(e) => handleInputChange("coordenadas", e.target.value)}
                      className="bg-[#353535] border-gray-600 text-white"
                      placeholder="4.6097, -74.0817"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#353535] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-[#FF5F45]" />
                  <span className="text-white font-medium">Vista Previa del Mapa</span>
                </div>
                <div className="bg-gray-600 rounded-lg h-48 flex items-center justify-center">
                  <p className="text-gray-400">Mapa interactivo aparecerá aquí</p>
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Método de Enganche y Evento */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Configuración de Método de Enganche</h3>

                <div className="bg-[#353535] rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-white">Método de Enganche</h4>
                      <p className="text-gray-400 text-sm">Selecciona cómo se realizará el enganche con este bar</p>
                    </div>
                    <Switch
                      checked={metodoEnganche === "evento"}
                      onCheckedChange={(checked) => {
                        const nuevoMetodo = checked ? "evento" : "estandar"
                        setMetodoEnganche(nuevoMetodo)
                        handleInputChange("metodo", nuevoMetodo)
                      }}
                      className="data-[state=checked]:bg-[#FF5F45]"
                    />
                  </div>
                  <div className="flex gap-4">
                    <Badge
                      variant={metodoEnganche === "evento" ? "default" : "secondary"}
                      className={metodoEnganche === "evento" ? "bg-[#FF5F45] text-white" : "bg-gray-600 text-gray-300"}
                    >
                      Con Evento
                    </Badge>
                    <Badge
                      variant={metodoEnganche === "estandar" ? "default" : "secondary"}
                      className={
                        metodoEnganche === "estandar" ? "bg-[#4A9EFF] text-white" : "bg-gray-600 text-gray-300"
                      }
                    >
                      Estándar
                    </Badge>
                  </div>
                </div>

                {metodoEnganche === "evento" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white">Fecha del Evento *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-[#353535] border-gray-600 text-white hover:bg-[#404040]",
                              !date && "text-gray-400",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#2a2a2a] border-gray-700">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(selectedDate) => {
                              setDate(selectedDate)
                              handleInputChange("fechaEvento", selectedDate)
                            }}
                            initialFocus
                            className="text-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipoEvento" className="text-white">
                        Tipo de Evento
                      </Label>
                      <Input
                        id="tipoEvento"
                        value={formData.tipoEvento}
                        onChange={(e) => handleInputChange("tipoEvento", e.target.value)}
                        className="bg-[#353535] border-gray-600 text-white"
                        placeholder="Lanzamiento, Happy Hour, etc."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="aforoEstimado" className="text-white">
                        Aforo Estimado
                      </Label>
                      <Input
                        id="aforoEstimado"
                        type="number"
                        value={formData.aforoEstimado}
                        onChange={(e) => handleInputChange("aforoEstimado", e.target.value)}
                        className="bg-[#353535] border-gray-600 text-white"
                        placeholder="Número de personas esperadas"
                      />
                    </div>
                  </div>
                )}

                {metodoEnganche === "estandar" && (
                  <div className="bg-[#353535] rounded-lg p-6 text-center">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">Método Estándar Seleccionado</h4>
                    <p className="text-gray-400">
                      No se requiere configuración de evento para este método de enganche. El bar será contactado
                      mediante el proceso estándar.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-4">Documentos Adjuntos</h4>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-[#FF5F45] transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
                  <p className="text-gray-400 text-sm">Formatos: PDF, JPG, PNG (máx. 10MB)</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-gray-600 text-white hover:bg-[#353535] bg-transparent"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Seleccionar Archivos
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Confirmación de Datos</h3>
                <p className="text-gray-400 mb-6">Revisa la información antes de enviar el registro</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#353535] border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Building className="w-5 h-5 text-[#FF5F45]" />
                      Información del Bar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nombre:</span>
                      <span className="text-white">{formData.nombreBar || "No especificado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">NIT:</span>
                      <span className="text-white">{formData.nit || "No especificado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contacto:</span>
                      <span className="text-white">{formData.contactoNombre || "No especificado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Teléfono:</span>
                      <span className="text-white">{formData.contactoTelefono || "No especificado"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#353535] border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#FF5F45]" />
                      Ubicación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dirección:</span>
                      <span className="text-white">{formData.direccion || "No especificado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ciudad:</span>
                      <span className="text-white">{formData.ciudad || "No especificado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Barrio:</span>
                      <span className="text-white">{formData.barrio || "No especificado"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#353535] border-gray-600 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-[#FF5F45]" />
                      Método de Enganche
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Método:</span>
                      <Badge
                        className={metodoEnganche === "evento" ? "bg-[#FF5F45] text-white" : "bg-[#4A9EFF] text-white"}
                      >
                        {metodoEnganche === "evento" ? "Con Evento" : "Estándar"}
                      </Badge>
                    </div>
                    {metodoEnganche === "evento" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fecha Evento:</span>
                          <span className="text-white">
                            {date ? format(date, "PPP", { locale: es }) : "No especificado"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tipo:</span>
                          <span className="text-white">{formData.tipoEvento || "No especificado"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Aforo:</span>
                          <span className="text-white">{formData.aforoEstimado || "No especificado"}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Status Message */}
          {submitMessage && (
            <div className={`mt-4 p-4 rounded-lg text-center font-medium ${
              submitMessage.includes("✅") 
                ? "bg-green-900/50 border border-green-700 text-green-300"
                : "bg-red-900/50 border border-red-700 text-red-300"
            }`}>
              {submitMessage}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-gray-600 text-white hover:bg-[#353535] bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-[#FF5F45] to-[#FF7A63] hover:from-[#E54A2E] hover:to-[#FF5F45] text-white"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#00D4AA] to-[#00E6C0] hover:from-[#00C49A] hover:to-[#00D4AA] text-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Registrar Bar
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
        </main>
      </div>
    </div>
  )
}
