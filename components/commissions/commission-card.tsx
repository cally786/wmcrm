"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, Building, DollarSign } from "lucide-react"
import type { Commission } from "./commissions-grid"

interface CommissionCardProps {
  commission: Commission
}

const typeColors = {
  A_BASE: "bg-primary text-primary-foreground",
  A_BONO: "bg-accent text-accent-foreground",
  B: "bg-info text-white",
  RENOVACION: "bg-success text-white",
}

const typeLabels = {
  A_BASE: "Canal A - Base",
  A_BONO: "Canal A - Bono",
  B: "Canal B",
  RENOVACION: "Renovación",
}

const statusColors = {
  CAUSADA: "bg-muted-foreground text-white",
  VALIDADA: "bg-info text-white",
  POR_PAGAR: "bg-pending text-black",
  PAGADA: "bg-success text-white",
}

const statusLabels = {
  CAUSADA: "Causada",
  VALIDADA: "Validada",
  POR_PAGAR: "Por Pagar",
  PAGADA: "Pagada",
}

const statusOrder = ["CAUSADA", "VALIDADA", "POR_PAGAR", "PAGADA"]

export function CommissionCard({ commission }: CommissionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getProgressValue = () => {
    const currentIndex = statusOrder.indexOf(commission.status)
    return ((currentIndex + 1) / statusOrder.length) * 100
  }

  return (
    <Card className="glassmorphism border-border/50 transition-wingman hover:glow-coral hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className={typeColors[commission.type]}>{typeLabels[commission.type]}</Badge>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-lg font-bold text-foreground">${commission.amount.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bar Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{commission.barName}</span>
          </div>
          <p className="text-sm text-muted-foreground">{commission.description}</p>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Causada:</span>
            <span className="text-foreground">{formatDate(commission.causedDate)}</span>
          </div>
          {commission.payoutDate && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-success" />
              <span className="text-muted-foreground">Pagada:</span>
              <span className="text-foreground">{formatDate(commission.payoutDate)}</span>
            </div>
          )}
        </div>

        {/* Current Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estado actual:</span>
          <Badge className={statusColors[commission.status]}>{statusLabels[commission.status]}</Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Causada</span>
            <span>Validada</span>
            <span>Por Pagar</span>
            <span>Pagada</span>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
        </div>
      </CardFooter>
    </Card>
  )
}
