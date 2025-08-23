"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/auth/role-guard"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { Download, TrendingUp, Users, DollarSign, Target } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarAdmin } from "@/components/sidebar-admin"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ventasData = [
  { mes: "Ene", ventas: 45, comisiones: 2100000, conversion: 65 },
  { mes: "Feb", ventas: 52, comisiones: 2450000, conversion: 68 },
  { mes: "Mar", ventas: 48, comisiones: 2280000, conversion: 62 },
  { mes: "Apr", ventas: 61, comisiones: 2890000, conversion: 71 },
  { mes: "May", ventas: 55, comisiones: 2650000, conversion: 69 },
  { mes: "Jun", ventas: 67, comisiones: 3200000, conversion: 74 },
]

const comercialesData = [
  { nombre: "Carlos M.", ventas: 28, comisiones: 1450000 },
  { nombre: "Ana G.", ventas: 24, comisiones: 1280000 },
  { nombre: "Miguel T.", ventas: 18, comisiones: 920000 },
  { nombre: "Sofia R.", ventas: 22, comisiones: 1150000 },
]

const canalData = [
  { name: "Canal A", value: 65, color: "#FF5F45" },
  { name: "Canal B", value: 35, color: "#4A9EFF" },
]

const regionData = [
  { region: "Bogotá", bares: 45, ingresos: 12500000 },
  { region: "Medellín", bares: 32, ingresos: 8900000 },
  { region: "Cali", bares: 28, ingresos: 7800000 },
  { region: "Barranquilla", bares: 18, ingresos: 5200000 },
]

export default function ReportesAdminPage() {
  const [periodo, setPeriodo] = useState("6m")
  const [tipoReporte, setTipoReporte] = useState("general")
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalVentas: 0,
    ingresosTotal: 0,
    tasaConversion: 0,
    baresActivos: 0
  })
  const [chartData, setChartData] = useState({
    ventasData: [],
    comercialesData: [],
    canalData: [],
    regionData: []
  })

  useEffect(() => {
    fetchMetrics()
    fetchChartData()
  }, [periodo])

  async function fetchMetrics() {
    try {
      setLoading(true)
      
      // Calculate date range based on periodo
      const now = new Date()
      const startDate = new Date()
      
      switch(periodo) {
        case "1m":
          startDate.setMonth(now.getMonth() - 1)
          break
        case "3m":
          startDate.setMonth(now.getMonth() - 3)
          break
        case "6m":
          startDate.setMonth(now.getMonth() - 6)
          break
        case "1y":
          startDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          startDate.setMonth(now.getMonth() - 6)
      }
      
      // Get bars count (all time since bars don't have creation dates for filtering)
      const { data: barsData, error: barsError } = await supabase
        .from('bars')
        .select('*', { count: 'exact' })
      
      // Get leads count with date filter
      const { data: leadsData, error: leadsError } = await supabase
        .from('lead')
        .select('*', { count: 'exact' })
        .gte('created_at', startDate.toISOString())

      // Get events count with date filter
      const { data: eventsData, error: eventsError } = await supabase
        .from('evento')
        .select('*', { count: 'exact' })
        .gte('created_at', startDate.toISOString())

      if (barsError || leadsError || eventsError) {
        console.error('Error fetching metrics:', barsError || leadsError || eventsError)
        return
      }

      const totalBars = barsData?.length || 0
      const totalLeads = leadsData?.length || 0
      const totalEvents = eventsData?.length || 0

      setMetrics({
        totalVentas: totalEvents,
        ingresosTotal: totalEvents * 1200000, // Estimate based on avg event value
        tasaConversion: totalLeads > 0 ? Math.round((totalEvents / totalLeads) * 100) : 0,
        baresActivos: totalBars
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchChartData() {
    try {
      // Generate monthly data for the last 6 months
      const monthlyData = []
      const now = new Date()
      const monthNames = ["Ene", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
        
        // Get leads and events for this month
        const { data: monthLeads } = await supabase
          .from('lead')
          .select('*', { count: 'exact' })
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString())
          
        const { data: monthEvents } = await supabase
          .from('evento')
          .select('*', { count: 'exact' })
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString())
        
        const leadsCount = monthLeads?.length || 0
        const eventsCount = monthEvents?.length || 0
        const conversion = leadsCount > 0 ? Math.round((eventsCount / leadsCount) * 100) : 0
        
        monthlyData.push({
          mes: monthNames[monthStart.getMonth()],
          ventas: eventsCount,
          comisiones: eventsCount * 850000,
          conversion
        })
      }

      // Get comerciales data for chart
      const { data: comercialesData, error: comercialesError } = await supabase
        .from('comercial')
        .select('nombre')
        .eq('activo', true)

      // Get bars by location for region data  
      const { data: barsData, error: barsError } = await supabase
        .from('bars')
        .select('location')

      if (comercialesError || barsError) {
        console.error('Error fetching chart data:', comercialesError || barsError)
        return
      }

      // Process comerciales data
      const comercialesChartData = comercialesData?.map((comercial, index) => ({
        nombre: comercial.nombre.split(' ').slice(0, 2).join(' ').substring(0, 10) + '.',
        ventas: Math.floor(Math.random() * 30) + 10, // TODO: Get real sales data
        comisiones: Math.floor(Math.random() * 2000000) + 800000 // TODO: Get real commission data
      })) || []

      // Process region data from bars
      const regionCounts = {}
      barsData?.forEach(bar => {
        if (bar.location && typeof bar.location === 'object' && bar.location.city) {
          const city = bar.location.city
          regionCounts[city] = (regionCounts[city] || 0) + 1
        }
      })

      const regionChartData = Object.entries(regionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([region, count]) => ({
          region,
          bares: count,
          ingresos: count * 200000 // Estimate based on bars count
        }))

      setChartData({
        ventasData: monthlyData,
        comercialesData: comercialesChartData,
        canalData: [
          { name: "Directo", value: 70, color: "#FF5F45" },
          { name: "Referido", value: 30, color: "#4A9EFF" },
        ], // TODO: Get real channel data
        regionData: regionChartData.length > 0 ? regionChartData : [
          { region: "Sin datos", bares: 0, ingresos: 0 }
        ]
      })
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="flex h-screen bg-background">
        <SidebarAdmin />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Reportes y Analytics</h1>
          <p className="text-gray-400 mt-1">Análisis completo del rendimiento del sistema</p>
        </div>
        <div className="flex gap-3">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[140px] bg-[#2a2a2a] border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2a] border-gray-700">
              <SelectItem value="1m">Último mes</SelectItem>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-gradient-to-r from-[#FF5F45] to-[#FF7A63] hover:from-[#E54A2E] hover:to-[#FF5F45] text-white">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ventas Totales</p>
                <p className="text-2xl font-bold text-white">{loading ? "..." : metrics.totalVentas}</p>
                <p className="text-xs text-[#00D4AA] flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% vs mes anterior
                </p>
              </div>
              <Target className="w-8 h-8 text-[#FF5F45]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ingresos Totales</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? "..." : `$${(metrics.ingresosTotal / 1000000).toFixed(1)}M`}
                </p>
                <p className="text-xs text-[#00D4AA] flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% vs mes anterior
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#00D4AA]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tasa Conversión</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? "..." : `${metrics.tasaConversion}%`}
                </p>
                <p className="text-xs text-[#00D4AA] flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3.2% vs mes anterior
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#4A9EFF]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Bares Activos</p>
                <p className="text-2xl font-bold text-white">{loading ? "..." : metrics.baresActivos}</p>
                <p className="text-xs text-[#00D4AA] flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15 este mes
                </p>
              </div>
              <Users className="w-8 h-8 text-[#FFB800]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución de Ventas */}
        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Evolución de Ventas y Comisiones</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.ventasData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="mes" stroke="#b0b0b0" />
                <YAxis stroke="#b0b0b0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#353535",
                    border: "1px solid #404040",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
                <Area type="monotone" dataKey="ventas" stroke="#FF5F45" fill="url(#colorVentas)" strokeWidth={2} />
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5F45" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF5F45" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance por Comercial */}
        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Performance por Comercial</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.comercialesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="nombre" stroke="#b0b0b0" />
                <YAxis stroke="#b0b0b0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#353535",
                    border: "1px solid #404040",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
                <Bar dataKey="ventas" fill="#FF5F45" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución por Canal */}
        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Distribución por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.canalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.canalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#353535",
                    border: "1px solid #404040",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {chartData.canalData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-gray-300">
                    {entry.name}: {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance por Región */}
        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Performance por Región</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.regionData.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#353535] rounded-lg">
                  <div>
                    <p className="font-medium text-white">{region.region}</p>
                    <p className="text-sm text-gray-400">{region.bares} bares activos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#00D4AA]">${(region.ingresos / 1000000).toFixed(1)}M</p>
                    <div className="w-24 bg-gray-600 rounded-full h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-[#FF5F45] to-[#FF7A63] h-2 rounded-full"
                        style={{ width: `${Math.min((region.ingresos / Math.max(...chartData.regionData.map(r => r.ingresos), 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
        </main>
      </div>
    </div>
    </RoleGuard>
  )
}
