"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Phone, MapPin, Calendar, ExternalLink, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Bar } from "./pipeline-kanban"

interface BarCardProps {
  bar: Bar
  onDragStart: (bar: Bar) => void
  onDragEnd: () => void
  isDragging: boolean
}

export function BarCard({ bar, onDragStart, onDragEnd, isDragging }: BarCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(bar)
  }

  const getActionButton = () => {
    switch (bar.status) {
      case "prospecto":
        return (
          <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
            Contactar
          </Button>
        )
      case "contactado":
        return (
          <Button size="sm" variant="outline" className="w-full bg-transparent">
            Programar Demo
          </Button>
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
    </Card>
  )
}
