"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ChartDataPoint {
  month: string
  amount: number
}

interface CommissionChartProps {
  data?: ChartDataPoint[]
}

export function CommissionChart({ data }: CommissionChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>(data || [])
  const [loading, setLoading] = useState(!data)

  useEffect(() => {
    if (!data) {
      fetchCommissionData()
    }
  }, [])

  async function fetchCommissionData() {
    try {
      setLoading(true)
      
      // Get current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser()
      let comercialId = null
      
      if (user) {
        // Find comercial by user_id in crm_roles or by email
        const { data: roleData } = await supabase
          .from('crm_roles')
          .select('comercial_id')
          .eq('user_id', user.id)
          .eq('activo', true)
          .single()

        comercialId = roleData?.comercial_id
        
        if (!comercialId) {
          const { data: comercialData } = await supabase
            .from('comercial')
            .select('id')
            .eq('email', user.email)
            .single()
          
          comercialId = comercialData?.id
        }

        console.log('Commission Chart: Authenticated user found comercial:', comercialId)
      } else {
        // No user authenticated - get Test User Nuevo from database
        console.warn('Commission Chart: No user authenticated - using demo comercial Test User Nuevo')
        const { data: demoComercial } = await supabase
          .from('comercial')
          .select('id')
          .eq('email', 'testnuevo@demo.com')
          .single()
        
        comercialId = demoComercial?.id
      }

      if (!comercialId) {
        console.error('Commission Chart: No comercial found')
        return
      }

      // Get last 6 months of commission data
      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        months.push({
          date: date,
          month: date.toLocaleDateString('es-ES', { month: 'short' }).charAt(0).toUpperCase() + date.toLocaleDateString('es-ES', { month: 'short' }).slice(1),
          year: date.getFullYear(),
          firstDay: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
          lastDay: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString()
        })
      }

      const chartDataPoints = await Promise.all(
        months.map(async (monthInfo) => {
          const { data: commissions } = await supabase
            .from('comision')
            .select('monto_neto')
            .eq('comercial_id', comercialId)
            .gte('causado_at', monthInfo.firstDay)
            .lte('causado_at', monthInfo.lastDay)
            .in('estado', ['CAUSADA', 'VALIDADA', 'POR_PAGAR', 'PAGADA'])

          const monthTotal = commissions?.reduce((sum, comm) => sum + Number(comm.monto_neto), 0) || 0
          
          return {
            month: monthInfo.month,
            amount: monthTotal
          }
        })
      )

      setChartData(chartDataPoints)
      console.log('Commission chart data loaded:', chartDataPoints)
    } catch (error) {
      console.error('Error fetching commission chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Evolución de Comisiones</CardTitle>
          <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-40 bg-muted rounded"></div>
              <div className="flex space-x-4">
                <div className="h-3 bg-muted rounded w-10"></div>
                <div className="h-3 bg-muted rounded w-10"></div>
                <div className="h-3 bg-muted rounded w-10"></div>
                <div className="h-3 bg-muted rounded w-10"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Evolución de Comisiones</CardTitle>
        <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#353535" />
            <XAxis dataKey="month" stroke="#b0b0b0" fontSize={12} />
            <YAxis stroke="#b0b0b0" fontSize={12} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2a2a2a",
                border: "1px solid #353535",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Comisiones"]}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#ff5f45"
              strokeWidth={3}
              dot={{ fill: "#ff5f45", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#ff5f45", strokeWidth: 2, fill: "#ffffff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
