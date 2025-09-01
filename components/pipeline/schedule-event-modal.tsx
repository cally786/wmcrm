"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { CalendarIcon, Clock, Users, MapPin } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Bar } from "./pipeline-kanban"

interface ScheduleEventModalProps {
  isOpen: boolean
  onClose: () => void
  bar: Bar
  onEventScheduled: (eventData: any) => void
}

export function ScheduleEventModal({ isOpen, onClose, bar, onEventScheduled }: ScheduleEventModalProps) {
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [eventData, setEventData] = useState({
    titulo: `Demo - ${bar.name}`,
    fecha: '',
    hora: '',
    capacidad_meta: '',
    descripcion: '',
    ubicacion: bar.address
  })

  const handleSubmit = async () => {
    if (!date) {
      alert('Por favor selecciona una fecha')
      return
    }

    setLoading(true)

    try {
      // Combine date and time
      const eventDateTime = new Date(date)
      if (eventData.hora) {
        const [hours, minutes] = eventData.hora.split(':')
        eventDateTime.setHours(parseInt(hours), parseInt(minutes))
      } else {
        eventDateTime.setHours(18, 0) // Default to 6 PM
      }

      const submitData = {
        leadId: bar.id,
        barName: bar.name,
        eventData: {
          ...eventData,
          fecha: eventDateTime.toISOString(),
        }
      }

      console.log('📅 Scheduling event:', submitData)

      const response = await fetch('/api/schedule-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()

      if (result.success) {
        onEventScheduled(result.event)
        onClose()
        // Reset form
        setDate(undefined)
        setEventData({
          titulo: `Demo - ${bar.name}`,
          fecha: '',
          hora: '',
          capacidad_meta: '',
          descripcion: '',
          ubicacion: bar.address
        })
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error scheduling event:', error)
      alert('Error al programar el evento')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEventData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Programar Evento Demo
          </DialogTitle>
          <DialogDescription>
            Programa una demostración para {bar.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título del Evento</Label>
            <Input
              id="titulo"
              value={eventData.titulo}
              onChange={(e) => handleInputChange("titulo", e.target.value)}
              placeholder="Demo - Nombre del Bar"
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Fecha del Evento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="hora">Hora (opcional)</Label>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                id="hora"
                type="time"
                value={eventData.hora}
                onChange={(e) => handleInputChange("hora", e.target.value)}
                placeholder="18:00"
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacidad">Aforo Estimado</Label>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Input
                id="capacidad"
                type="number"
                value={eventData.capacidad_meta}
                onChange={(e) => handleInputChange("capacidad_meta", e.target.value)}
                placeholder="50"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación</Label>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Input
                id="ubicacion"
                value={eventData.ubicacion}
                onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                placeholder="Dirección del evento"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={eventData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              placeholder="Detalles adicionales del evento..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Programando...
              </>
            ) : (
              <>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Programar Evento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}