"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface CommissionFiltersProps {
  onFilterChange: (filters: { period: string; status: string; type: string }) => void
}

export function CommissionFilters({ onFilterChange }: CommissionFiltersProps) {
  const [filters, setFilters] = useState({
    period: "all",
    status: "all",
    type: "all",
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const periods = [
    { value: "all", label: "Todos los períodos" },
    { value: "this-month", label: "Este mes" },
    { value: "last-month", label: "Mes anterior" },
    { value: "this-quarter", label: "Este trimestre" },
  ]

  const statuses = [
    { value: "all", label: "Todos los estados" },
    { value: "CAUSADA", label: "Causada" },
    { value: "VALIDADA", label: "Validada" },
    { value: "POR_PAGAR", label: "Por Pagar" },
    { value: "PAGADA", label: "Pagada" },
  ]

  const types = [
    { value: "all", label: "Todos los tipos" },
    { value: "EVENTO_BASE", label: "Con Evento - Base" },
    { value: "EVENTO_BONO", label: "Con Evento - Bono" },
    { value: "ESTANDAR", label: "Estándar" },
    { value: "RENOVACION", label: "Renovación" },
  ]

  return (
    <Card className="glassmorphism border-border/50">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Período</label>
            <Select value={filters.period} onValueChange={(value) => handleFilterChange("period", value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Estado</label>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo</label>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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
