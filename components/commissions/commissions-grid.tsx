"use client"

import { useState } from "react"
import { CommissionCard } from "./commission-card"
import { CommissionFilters } from "./commission-filters"
import { EarningsSimulator } from "./earnings-simulator"

export interface Commission {
  id: string
  type: "A_BASE" | "A_BONO" | "B" | "RENOVACION"
  amount: number
  barName: string
  barId: string
  causedDate: string
  status: "CAUSADA" | "VALIDADA" | "POR_PAGAR" | "PAGADA"
  payoutDate?: string
  description: string
  channel: "A" | "B"
}

const mockCommissions: Commission[] = [
  {
    id: "1",
    type: "A_BASE",
    amount: 150000,
    barName: "Bar El Rincón",
    barId: "bar-1",
    causedDate: "2024-12-15",
    status: "VALIDADA",
    description: "Comisión base por suscripción Canal A",
    channel: "A",
  },
  {
    id: "2",
    type: "A_BONO",
    amount: 75000,
    barName: "Bar El Rincón",
    barId: "bar-1",
    causedDate: "2024-12-15",
    status: "VALIDADA",
    description: "Bono por evento exitoso Canal A",
    channel: "A",
  },
  {
    id: "3",
    type: "B",
    amount: 200000,
    barName: "Bar Central",
    barId: "bar-2",
    causedDate: "2024-12-14",
    status: "POR_PAGAR",
    description: "Comisión Canal B",
    channel: "B",
  },
  {
    id: "4",
    type: "RENOVACION",
    amount: 120000,
    barName: "La Terraza",
    barId: "bar-3",
    causedDate: "2024-12-13",
    status: "PAGADA",
    payoutDate: "2024-12-26",
    description: "Comisión por renovación",
    channel: "A",
  },
  {
    id: "5",
    type: "A_BASE",
    amount: 150000,
    barName: "Bar Zona Rosa",
    barId: "bar-4",
    causedDate: "2024-12-12",
    status: "CAUSADA",
    description: "Comisión base por suscripción Canal A",
    channel: "A",
  },
  {
    id: "6",
    type: "B",
    amount: 200000,
    barName: "Bar Premium",
    barId: "bar-5",
    causedDate: "2024-12-10",
    status: "PAGADA",
    payoutDate: "2024-12-26",
    description: "Comisión Canal B",
    channel: "B",
  },
]

export function CommissionsGrid() {
  const [commissions, setCommissions] = useState<Commission[]>(mockCommissions)
  const [filteredCommissions, setFilteredCommissions] = useState<Commission[]>(mockCommissions)

  const handleFilterChange = (filters: { period: string; status: string; type: string }) => {
    let filtered = commissions

    if (filters.period !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (filters.period) {
        case "this-month":
          filterDate.setMonth(now.getMonth())
          break
        case "last-month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "this-quarter":
          filterDate.setMonth(now.getMonth() - 3)
          break
      }

      filtered = filtered.filter((commission) => new Date(commission.causedDate) >= filterDate)
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((commission) => commission.status === filters.status)
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((commission) => commission.type === filters.type)
    }

    setFilteredCommissions(filtered)
  }

  const totalCommissions = filteredCommissions.reduce((sum, commission) => sum + commission.amount, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Filters */}
        <CommissionFilters onFilterChange={handleFilterChange} />

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glassmorphism border-border/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{filteredCommissions.length}</div>
            <div className="text-sm text-muted-foreground">Total Comisiones</div>
          </div>
          <div className="glassmorphism border-border/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-success">${totalCommissions.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Valor Total</div>
          </div>
          <div className="glassmorphism border-border/50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-info">
              {filteredCommissions.filter((c) => c.status === "PAGADA").length}
            </div>
            <div className="text-sm text-muted-foreground">Pagadas</div>
          </div>
        </div>

        {/* Commissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCommissions.map((commission) => (
            <CommissionCard key={commission.id} commission={commission} />
          ))}
        </div>

        {/* Empty State */}
        {filteredCommissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-foreground">No hay comisiones</h3>
              <p className="text-muted-foreground">No se encontraron comisiones con los filtros seleccionados</p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Earnings Simulator */}
      <div className="lg:col-span-1">
        <EarningsSimulator />
      </div>
    </div>
  )
}
