"use client"

import type React from "react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Phone, MapPin, Calendar, ExternalLink, CheckCircle, XCircle, CreditCard, Users, XCircle as XIcon, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Bar } from "./pipeline-kanban"
import { ScheduleEventModal } from "./schedule-event-modal"

interface BarCardProps {
  bar: Bar
  onDragStart: (bar: Bar) => void
  onDragEnd: () => void
  isDragging: boolean
  onBarUpdated?: () => void
}

export function BarCard({ bar, onDragStart, onDragEnd, isDragging, onBarUpdated }: BarCardProps) {
  const [showEventModal, setShowEventModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(bar)
  }

  const handleAction = async (action: string) => {
    setActionLoading(action)
    
    try {
      switch (action) {
        case 'payment-link':
          await handlePaymentLink()
          break
        case 'demo-event':
          setShowEventModal(true)
          break
        case 'lost':
          await handleMarkAsLost()
          break
      }
    } catch (error) {
      console.error(`Error with action ${action}:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePaymentLink = async () => {
    try {
      const response = await fetch('/api/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: bar.id,
          barName: bar.name,
          contactEmail: bar.contact?.includes('@') ? bar.contact : undefined,
          amount: 100000 // Default amount, could be configurable
        })
      })

      const result = await response.json()

      if (result.success) {
        // Open payment link in new tab
        window.open(result.paymentLink, '_blank')
        alert(`Link de pago generado exitosamente para ${bar.name}`)
        onBarUpdated?.()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Error generando link de pago')
    }
  }

  const handleMarkAsLost = async () => {
    const confirmed = confirm(`¿Estás seguro que quieres marcar ${bar.name} como perdido?`)
    if (!confirmed) return

    try {
      const response = await fetch('/api/mark-lost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: bar.id,
          reason: 'Negociación no exitosa - marcado desde pipeline'
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message)
        onBarUpdated?.()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Error marcando como perdido')
    }
  }

  const handleEventScheduled = (eventData: any) => {
    console.log('Event scheduled:', eventData)
    alert(`Evento programado exitosamente para ${bar.name}`)
    onBarUpdated?.()
  }

  const getActionButton = () => {
    switch (bar.status) {
      case "prospecto":
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                <MoreHorizontal className="h-4 w-4 mr-1" />
                Acciones
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                onClick={() => handleAction('payment-link')}
                disabled={actionLoading === 'payment-link'}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {actionLoading === 'payment-link' ? 'Generando...' : 'Generar Link de Pago'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleAction('demo-event')}
                disabled={actionLoading === 'demo-event'}
              >
                <Users className="h-4 w-4 mr-2" />
                {actionLoading === 'demo-event' ? 'Programando...' : 'Organizar Evento Demo'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleAction('lost')}
                disabled={actionLoading === 'lost'}
                className="text-destructive focus:text-destructive"
              >
                <XIcon className="h-4 w-4 mr-2" />
                {actionLoading === 'lost' ? 'Marcando...' : 'Marcar como Perdido'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      case "demo-programado":
        return (
          <Button size="sm" variant="outline" className="w-full bg-transparent" disabled={!bar.approved}>
            {bar.approved ? "Generar Usuario" : "Pendiente Aprobación"}
          </Button>
        )
      case "activa":
        return (
          <div className="flex items-center justify-between w-full">
            <Badge className="bg-success text-white">Pagando</Badge>
            <Button size="sm" variant="ghost" className="p-1">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "glassmorphism border-border/50 cursor-grab transition-wingman hover:glow-coral hover:scale-[1.02]",
        isDragging && "opacity-50 rotate-2 scale-105",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground truncate">{bar.name}</h3>
          <div className="flex items-center space-x-2">
            <Badge variant={bar.channel === "A" ? "default" : "secondary"} className="text-xs">
              Canal {bar.channel}
            </Badge>
            {bar.approved ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <div className="flex items-start space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="truncate">{bar.address}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4 flex-shrink-0" />
          <span>{bar.phone}</span>
        </div>

        {bar.contact && (
          <div className="text-sm">
            <span className="text-muted-foreground">Contacto: </span>
            <span className="text-foreground font-medium">{bar.contact}</span>
          </div>
        )}

        {bar.demoDate && (
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-pending" />
            <span className="text-foreground">Demo: {formatDate(bar.demoDate)}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">Reg: {formatDate(bar.registrationDate)}</span>
          <div className="flex-1 ml-3">{getActionButton()}</div>
        </div>
      </CardFooter>
      
      {/* Schedule Event Modal */}
      <ScheduleEventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        bar={bar}
        onEventScheduled={handleEventScheduled}
      />
    </Card>
  )
}
