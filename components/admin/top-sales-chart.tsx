"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SalesData {
  name: string;
  commissions: number;
}

export function TopSalesChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopComerciales()
  }, [])

  async function fetchTopComerciales() {
    try {
      setLoading(true)
      
      // Get comerciales with their total commissions from the last month
      const { data: comercialesData, error } = await supabase
        .from('comercial')
        .select('id, nombre')
        .eq('activo', true)
        .limit(5)
      
      if (error) {
        console.error('Error fetching comerciales:', error)
        return
      }

      // Get commissions for each comercial for the last 3 months
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      
      const comercialesWithCommissions = await Promise.all(
        comercialesData?.map(async (comercial) => {
          const { data: commissions, error: commError } = await supabase
            .from('comision')
            .select('monto_neto')
            .eq('comercial_id', comercial.id)
            .gte('causado_at', threeMonthsAgo.toISOString())
            .eq('estado', 'PAGADA')
          
          if (commError) {
            console.error('Error fetching commissions for comercial:', comercial.id, commError)
          }

          const totalCommissions = commissions?.reduce((sum, comm) => sum + Number(comm.monto_neto), 0) || 0
          
          console.log(`Comercial ${comercial.nombre} (${comercial.id}):`, {
            commissions: commissions?.length || 0,
            total: totalCommissions,
            rawCommissions: commissions
          })
          
          return {
            name: `${comercial.nombre} (${comercial.id.slice(-8)})`,
            commissions: totalCommissions,
            comercialId: comercial.id
          }
        }) || []
      )

      // Sort by commissions and take top 5
      const sortedData = comercialesWithCommissions
        .sort((a, b) => b.commissions - a.commissions)
        .slice(0, 5)

      setSalesData(sortedData)
      console.log('Top comerciales loaded:', sortedData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Comerciales Top</CardTitle>
        <p className="text-sm text-muted-foreground">Por comisiones últimos 3 meses</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-muted-foreground">Cargando datos...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#353535" />
            <XAxis
              type="number"
              stroke="#b0b0b0"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
            />
            <YAxis type="category" dataKey="name" stroke="#b0b0b0" fontSize={12} width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2a2a2a",
                border: "1px solid #353535",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Comisiones"]}
            />
            <Bar dataKey="commissions" fill="#ff5f45" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
