"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, MapPin, Users, Download, Eye, Upload, QrCode } from "lucide-react"
import type { Event } from "./events-grid"

interface EventCardProps {
  event: Event
  onClick: () => void
}

const statusColors = {
  programado: "bg-info text-white",
  "en-curso": "bg-pending text-black",
  completado: "bg-success text-white",
  cancelado: "bg-destructive text-white",
}

const statusLabels = {
  programado: "Programado",
  "en-curso": "En Curso",
  completado: "Completado",
  cancelado: "Cancelado",
}

export function EventCard({ event, onClick }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const attendancePercentage = event.capacity > 0 ? (event.attendees / event.capacity) * 100 : 0

  return (
    <Card className="glassmorphism border-border/50 transition-wingman hover:glow-coral hover:scale-[1.02] cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-foreground">{formatDate(event.date)}</span>
            </div>
            <p className="text-sm text-muted-foreground">{event.time}</p>
          </div>
          <Badge className={statusColors[event.status]}>{statusLabels[event.status]}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Image Placeholder */}
        <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
          {event.evidences.length > 0 ? (
            <img
              src={event.evidences[0] || "/placeholder.svg"}
              alt={event.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">Sin evidencias</p>
            </div>
          )}
        </div>

        {/* Event Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{event.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{event.barName}</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Aforo</span>
              </div>
              <span className="text-foreground font-medium">
                {event.attendees}/{event.capacity}
              </span>
            </div>
            <Progress value={attendancePercentage} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Descargas</span>
            </div>
            <span className="text-foreground font-medium">{event.downloads}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        <div className="flex space-x-2 w-full">
          <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={onClick}>
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalles
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
            <Upload className="h-4 w-4 mr-2" />
            Evidencias
          </Button>
          <Button size="sm" variant="outline">
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
