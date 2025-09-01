"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { dashboardService, DashboardKPIs } from "@/lib/services/dashboard-service"

interface KpiCardsProps {
  comercialId: string
}

export function KpiCardsReal({ comercialId }: KpiCardsProps) {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (comercialId) {
      loadKPIs()
    }
  }, [comercialId])

  const loadKPIs = async () => {
    try {
      const data = await dashboardService.getComercialKPIs(comercialId)
      setKpis(data)
    } catch (error) {
      console.error('Error loading KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="glassmorphism border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const kpiData = [
    {
      title: "Total Leads",
      value: kpis.totalLeads.toString(),
      change: kpis.leadsTrend,
      trend: "up",
      icon: Users,
      description: "vs mes anterior",
    },
    {
      title: "Suscripciones Activas",
      value: kpis.suscripcionesActivas.toString(),
      change: kpis.suscripcionesTrend,
      trend: "up",
      icon: Target,
      description: "este mes",
    },
    {
      title: "Comisiones Este Mes",
      value: formatCurrency(kpis.comisionesEsteMes),
      change: kpis.comisionesTrend,
      trend: "up",
      icon: DollarSign,
      description: "COP",
    },
    {
      title: "Próximo Payout",
      value: kpis.proximoPayout.fecha,
      change: formatCurrency(kpis.proximoPayout.valor),
      trend: "neutral",
      icon: Calendar,
      description: "estimado",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => {
        const IconComponent = kpi.icon
        const TrendIcon = kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : null

        return (
          <Card key={index} className="glassmorphism border-border/50 transition-wingman hover:glow-coral">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="flex items-center space-x-2 text-xs">
                {TrendIcon && (
                  <div className={`flex items-center ${kpi.trend === "up" ? "text-success" : "text-destructive"}`}>
                    <TrendIcon className="h-3 w-3 mr-1" />
                    <span>{kpi.change}</span>
                  </div>
                )}
                <span className="text-muted-foreground">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}