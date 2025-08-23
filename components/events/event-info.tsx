import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Hash } from "lucide-react"
import type { Event } from "./events-grid"

interface EventInfoProps {
  event: Event
}

const statusColors = {
  programado: "bg-info text-white",
  "en-curso": "bg-pending text-black",
  completado: "bg-success text-white",
  cancelado: "bg-destructive text-white",
}

export function EventInfo({ event }: EventInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Información del Evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nombre del Evento</label>
              <p className="text-foreground font-medium">{event.name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <Badge className={statusColors[event.status]}>{event.status}</Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Fecha</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-foreground">{formatDate(event.date)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Hora</label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="text-foreground">{event.time}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <p className="text-foreground">{event.location}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Canal</label>
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-primary" />
                <Badge variant={event.channel === "A" ? "default" : "secondary"}>Canal {event.channel}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Capacidad</label>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="text-foreground">{event.capacity} personas</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Asistentes</label>
              <p className="text-foreground font-medium">{event.attendees} personas</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Descripción</label>
            <p className="text-foreground">{event.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
