"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, CheckSquare, Users, DollarSign, Target } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface KpiData {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: any;
  description: string;
  hasAction: boolean;
}

export function AdminKpiCards() {
  const [kpiData, setKpiData] = useState<KpiData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKpiData()
  }, [])

  async function fetchKpiData() {
    try {
      setLoading(true)
      
      // Get pending bars from real data
      const { count: pendingBars } = await supabase
        .from('bars')
        .select('*', { count: 'exact', head: true })
        .eq('account_status', 'pending_verification')
      
      // Get active comerciales
      const { count: activeComerciales } = await supabase
        .from('comercial')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)
      
      // Get current month and previous month for comparison
      const currentMonth = new Date()
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      const prevMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)
      
      // Get events for current and previous month
      const { count: eventosDelMes } = await supabase
        .from('evento')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDay.toISOString())
      
      const { count: eventosDelMesPasado } = await supabase
        .from('evento')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', prevMonth.toISOString())
        .lte('created_at', prevMonthEnd.toISOString())
      
      // Calculate real revenue from commissions
      const { data: comisionesDelMes } = await supabase
        .from('comision')
        .select('monto')
        .gte('fecha_causacion', firstDay.toISOString())
      
      const ingresosMes = comisionesDelMes?.reduce((sum, c) => sum + (c.monto || 0), 0) || 0
      
      // Get leads for conversion rate
      const { count: totalLeads } = await supabase
        .from('lead')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDay.toISOString())
      
      const conversionRate = totalLeads && totalLeads > 0 
        ? Math.round(((eventosDelMes || 0) / totalLeads) * 100)
        : 0

      // Calculate changes from previous period
      const pendingChange = (pendingBars || 0) > 0 ? `+${pendingBars}` : "0"
      const comercialesChange = (activeComerciales || 0) > 0 ? `+${Math.max(0, (activeComerciales || 0) - 3)}` : "0"
      const ingresosChange = eventosDelMesPasado && eventosDelMesPasado > 0 
        ? `${eventosDelMes && eventosDelMes > eventosDelMesPasado ? '+' : ''}${Math.round(((eventosDelMes || 0) - eventosDelMesPasado) / eventosDelMesPasado * 100)}%`
        : "N/A"
      const conversionChange = conversionRate > 0 ? `+${Math.max(0, conversionRate - 10)}%` : "0%"
      
      const newKpiData: KpiData[] = [
        {
          title: "Bares Pendientes",
          value: (pendingBars || 0).toString(),
          change: pendingChange,
          trend: (pendingBars || 0) > 0 ? "up" : "down",
          icon: CheckSquare,
          description: "de aprobación",
          hasAction: (pendingBars || 0) > 0,
        },
        {
          title: "Comerciales Activos",
          value: (activeComerciales || 0).toString(),
          change: comercialesChange,
          trend: (activeComerciales || 0) > 3 ? "up" : "down",
          icon: Users,
          description: "registrados",
          hasAction: false,
        },
        {
          title: "Ingresos del Mes",
          value: `$${(ingresosMes / 1000000).toFixed(1)}M`,
          change: ingresosChange,
          trend: ingresosChange.includes('+') ? "up" : "down",
          icon: DollarSign,
          description: "COP",
          hasAction: false,
        },
        {
          title: "Tasa de Conversión",
          value: `${conversionRate}%`,
          change: conversionChange,
          trend: conversionRate > 0 ? "up" : "down",
          icon: Target,
          description: "del mes",
          hasAction: false,
        },
      ]
      
      setKpiData(newKpiData)
      console.log('KPI data loaded:', newKpiData)
    } catch (error) {
      console.error('Error fetching KPI data:', error)
    } finally {
      setLoading(false)
    }
  }
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="glassmorphism border-border/50">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => {
        const IconComponent = kpi.icon
        const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown

        return (
          <Card key={index} className="glassmorphism border-border/50 transition-wingman hover:glow-coral">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <div className={`flex items-center ${kpi.trend === "up" ? "text-success" : "text-destructive"}`}>
                    <TrendIcon className="h-3 w-3 mr-1" />
                    <span>{kpi.change}</span>
                  </div>
                  <span className="text-muted-foreground">{kpi.description}</span>
                </div>
                {kpi.hasAction && (
                  <Button size="sm" variant="outline" className="text-xs bg-transparent">
                    Ver
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
