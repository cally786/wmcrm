"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const leadId = searchParams.get('lead')
  const [leadInfo, setLeadInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (leadId) {
      fetchLeadInfo()
    } else {
      setLoading(false)
    }
  }, [leadId])

  const fetchLeadInfo = async () => {
    try {
      // You could create an API to get lead info, for now just set loading to false
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching lead info:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando pago...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md glassmorphism border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <CardTitle className="text-2xl text-success">¡Pago Exitoso!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-foreground">
              Tu pago ha sido procesado correctamente.
            </p>
            <p className="text-sm text-muted-foreground">
              En breve recibirás un correo de confirmación con los detalles de tu suscripción a Wingman.
            </p>
          </div>

          {leadId && (
            <div className="bg-muted/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Referencia del pago:</p>
              <p className="text-sm font-mono text-foreground">{leadId}</p>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <p className="text-sm font-medium text-foreground">
              ¿Qué sigue?
            </p>
            <div className="text-left space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>Recibirás acceso a la plataforma Wingman para tu establecimiento</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>Comenzarás a recibir clientes a través de nuestra red</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-6">
            <Link href="/comercial/pipeline">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Pipeline
              </Button>
            </Link>
            <Link href="/comercial/dashboard">
              <Button variant="outline" className="w-full">
                Ir al Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}