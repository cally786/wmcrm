"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface ApprovalFiltersProps {
  onFilterChange: (filters: { status: string; channel: string; commercial: string }) => void
}

export function ApprovalFilters({ onFilterChange }: ApprovalFiltersProps) {
  const [filters, setFilters] = useState({
    status: "all",
    channel: "all",
    commercial: "all",
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const statuses = [
    { value: "all", label: "Todos los estados" },
    { value: "pending", label: "Pendiente" },
    { value: "approved", label: "Aprobado" },
    { value: "rejected", label: "Rechazado" },
  ]

  const channels = [
    { value: "all", label: "Todos los métodos" },
    { value: "evento", label: "Con Evento" },
    { value: "estandar", label: "Estándar" },
  ]

  const commercials = [
    { value: "all", label: "Todos los comerciales" },
    { value: "Juan Pérez", label: "Juan Pérez" },
    { value: "María García", label: "María García" },
    { value: "Carlos López", label: "Carlos López" },
    { value: "Ana Rodríguez", label: "Ana Rodríguez" },
  ]

  return (
    <Card className="glassmorphism border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-foreground mb-2 block">Estado</label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-foreground mb-2 block">Método</label>
            <Select value={filters.channel} onValueChange={(value) => handleFilterChange("channel", value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel.value} value={channel.value}>
                    {channel.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-foreground mb-2 block">Comercial</label>
            <Select value={filters.commercial} onValueChange={(value) => handleFilterChange("commercial", value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {commercials.map((commercial) => (
                  <SelectItem key={commercial.value} value={commercial.value}>
                    {commercial.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
