"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface EventFiltersProps {
  onFilterChange: (filters: { month: string; status: string; channel: string }) => void
}

export function EventFilters({ onFilterChange }: EventFiltersProps) {
  const [filters, setFilters] = useState({
    month: "all",
    status: "all",
    channel: "all",
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const months = [
    { value: "all", label: "Todos los meses" },
    { value: "11", label: "Diciembre" },
    { value: "10", label: "Noviembre" },
    { value: "9", label: "Octubre" },
  ]

  const statuses = [
    { value: "all", label: "Todos los estados" },
    { value: "programado", label: "Programado" },
    { value: "en-curso", label: "En Curso" },
    { value: "completado", label: "Completado" },
    { value: "cancelado", label: "Cancelado" },
  ]

  const channels = [
    { value: "all", label: "Todos los métodos" },
    { value: "evento", label: "Con Evento" },
    { value: "estandar", label: "Estándar" },
  ]

  return (
    <Card className="glassmorphism border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-foreground mb-2 block">Mes</label>
            <Select value={filters.month} onValueChange={(value) => handleFilterChange("month", value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
        </div>
      </CardContent>
    </Card>
  )
}
