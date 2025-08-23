"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface KPIData {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: any
  description: string
}

interface KpiCardsProps {
  data?: KPIData[]
}

export function KpiCards({ data }: KpiCardsProps) {
  const [kpiData, setKpiData] = useState<KPIData[]>(data || [])
  const [loading, setLoading] = useState(!data)

  useEffect(() => {
    if (!data) {
      fetchKPIData()
    }
  }, [])

  async function fetchKPIData() {
    try {
      setLoading(true)

      // Get current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser()
      let comercialId = null
      let comercialInfo = null
      
      if (user) {
        // Find comercial by user_id in crm_roles
        const { data: roleData } = await supabase
          .from('crm_roles')
          .select('comercial_id, comercial(id, nombre)')
          .eq('user_id', user.id)
          .eq('activo', true)
          .single()

        comercialId = roleData?.comercial_id
        comercialInfo = roleData?.comercial
        
        // If no role found, try to find comercial by email
        if (!comercialId) {
          const { data: comercialData } = await supabase
            .from('comercial')
            .select('id, nombre')
            .eq('email', user.email)
            .single()
          
          comercialId = comercialData?.id
          comercialInfo = comercialData
        }

        console.log('Authenticated user found comercial:', { comercialId, nombre: comercialInfo?.nombre, email: user.email })
      } else {
        // No user authenticated - get Test User Nuevo from database
        console.warn('No user authenticated - using demo comercial Test User Nuevo')
        const { data: demoComercial } = await supabase
          .from('comercial')
          .select('id, nombre')
          .eq('email', 'testnuevo@demo.com')
          .single()
        
        comercialId = demoComercial?.id
        comercialInfo = demoComercial ? { nombre: `${demoComercial.nombre} (Demo)` } : null
      }

      if (!comercialId) {
        console.error('No comercial found')
        return
      }

      console.log('Using comercial:', { comercialId, nombre: comercialInfo?.nombre })

      // 1. Get total leads
      const { count: totalLeads } = await supabase
        .from('lead')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', comercialId)

      // 2. Get active subscriptions (leads with ACTIVO status)
      const { count: activeSubs } = await supabase
        .from('lead')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', comercialId)
        .eq('etapa', 'ACTIVO')

      // 3. Get current month commissions
      const currentMonth = new Date()
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      
      const { data: monthCommissions } = await supabase
        .from('comision')
        .select('monto_neto')
        .eq('comercial_id', comercialId)
        .gte('causado_at', firstDay.toISOString())
        .eq('estado', 'PAGADA')

      const monthlyTotal = monthCommissions?.reduce((sum, comm) => sum + Number(comm.monto_neto), 0) || 0

      // 4. Get all month commissions for total causado
      const { data: allMonthCommissions } = await supabase
        .from('comision')
        .select('monto_neto')
        .eq('comercial_id', comercialId)
        .gte('causado_at', firstDay.toISOString())

      const monthlyTotalCausado = allMonthCommissions?.reduce((sum, comm) => sum + Number(comm.monto_neto), 0) || 0

      // 5. Get pending commissions for next payout
      const { data: pendingCommissions } = await supabase
        .from('comision')
        .select('monto_neto')
        .eq('comercial_id', comercialId)
        .in('estado', ['CAUSADA', 'VALIDADA', 'POR_PAGAR'])

      const pendingTotal = pendingCommissions?.reduce((sum, comm) => sum + Number(comm.monto_neto), 0) || 0

      const newKpiData: KPIData[] = [
        {
          title: "Total Leads",
          value: (totalLeads || 0).toString(),
          change: "+12%",
          trend: "up" as const,
          icon: Users,
          description: "en pipeline",
        },
        {
          title: "Suscripciones Activas", 
          value: (activeSubs || 0).toString(),
          change: "+8%",
          trend: "up" as const,
          icon: Target,
          description: "clientes activos",
        },
        {
          title: "Comisiones Este Mes",
          value: `$${monthlyTotal.toLocaleString()}`,
          change: `Total: $${monthlyTotalCausado.toLocaleString()}`,
          trend: "neutral" as const,
          icon: DollarSign,
          description: "pagadas de total",
        },
        {
          title: "Próximo Payout",
          value: "26 Ago",
          change: `$${pendingTotal.toLocaleString()}`,
          trend: "neutral" as const,
          icon: Calendar,
          description: "estimado",
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
        const Icon = kpi.icon
        const TrendIcon = kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : null

        return (
          <Card key={index} className="glassmorphism border-border/50 transition-wingman hover:glow-coral">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
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
