"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, X } from "lucide-react"
import type { Event } from "./events-grid"

interface EventEvidencesProps {
  event: Event
}

export function EventEvidences({ event }: EventEvidencesProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    // Handle file drop
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Subir Evidencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-wingman ${
              dragOver ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Arrastra archivos aquí</h3>
            <p className="text-muted-foreground mb-4">o haz clic para seleccionar</p>
            <Button variant="outline">Seleccionar Archivos</Button>
            <p className="text-xs text-muted-foreground mt-2">Formatos soportados: JPG, PNG, MP4, MOV</p>
          </div>
        </CardContent>
      </Card>

      {/* Existing Evidences */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Evidencias Subidas</CardTitle>
        </CardHeader>
        <CardContent>
          {event.evidences.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {event.evidences.map((evidence, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden">
                    <img
                      src={evidence || "/placeholder.svg"}
                      alt={`Evidencia ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="destructive" className="h-6 w-6 p-0">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <div className="bg-black/50 rounded px-2 py-1 flex items-center space-x-1">
                      <ImageIcon className="h-3 w-3 text-white" />
                      <span className="text-xs text-white">IMG</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No hay evidencias</h3>
              <p className="text-muted-foreground">Sube fotos y videos del evento</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
