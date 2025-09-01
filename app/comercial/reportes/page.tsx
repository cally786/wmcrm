"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, TrendingUp, Target, DollarSign, Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarComercial } from "@/components/sidebar-comercial"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const misVentasData = [
  { mes: "Ene", leads: 15, conversiones: 8, comisiones: 850000 },
  { mes: "Feb", leads: 18, conversiones: 12, comisiones: 1200000 },
  { mes: "Mar", leads: 22, conversiones: 14, comisiones: 1450000 },
  { mes: "Apr", leads: 20, conversiones: 13, comisiones: 1350000 },
  { mes: "May", leads: 25, conversiones: 17, comisiones: 1750000 },
  { mes: "Jun", leads: 28, conversiones: 19, comisiones: 1950000 },
]

const pipelineData = [
  { etapa: "Prospecto", cantidad: 12, valor: 2400000 },
  { etapa: "Contactado", cantidad: 8, valor: 1600000 },
  { etapa: "Demo", cantidad: 5, valor: 1000000 },
  { etapa: "Activo", cantidad: 3, valor: 600000 },
]

const tipoComisionData = [
  { name: "A_BASE", value: 45, color: "#FF5F45" },
  { name: "A_BONO", value: 25, color: "#00D4AA" },
  { name: "B", value: 20, color: "#4A9EFF" },
  { name: "RENOVACION", value: 10, color: "#FFB800" },
]

export default function ReportesComercialesPage() {
  const [periodo, setPeriodo] = useState("6m")
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    leadsGenerados: 0,
    conversiones: 0,
    tasaConversion: 0,
    comisiones: 0
  })
  const [chartData, setChartData] = useState({
    misVentasData: [],
    pipelineData: [],
    tipoComisionData: []
  })

  useEffect(() => {
    fetchComercialMetrics()
    fetchChartData()
  }, [])

  async function fetchComercialMetrics() {
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

        console.log('Reports: Using comercial ID:', comercialId)
      } else {
        // No user authenticated - use demo data
        console.warn('Reports: No user authenticated - using demo comercial Test User Nuevo')
        comercialId = 'f4e7b623-3d9a-4b8c-a1e2-9f8a7c6d5e3b'
      }

      if (!comercialId) {
        console.error('Reports: No comercial found')
        return
      }

      // Get leads for this comercial
      const { data: leadsData } = await supabase
        .from('lead')
        .select('id, etapa')
        .eq('owner_id', comercialId)
      
      // Get events for this comercial
      const { data: eventsData } = await supabase
        .from('evento')
        .select('id, estado')
        .eq('comercial_id', comercialId)
        
      // Get commissions for this comercial
      const { data: commissionsData } = await supabase
        .from('comision')
        .select('amount')
        .eq('comercial_id', comercialId)

      console.log('Reports: Leads data:', leadsData)
      console.log('Reports: Events data:', eventsData)
      console.log('Reports: Commissions data:', commissionsData)

      const totalLeads = leadsData?.length || 0
      const totalEvents = eventsData?.length || 0
      const totalCommissions = commissionsData?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0
      
      // Calculate conversions (active leads)
      const activeLeads = leadsData?.filter(l => l.etapa === 'ACTIVO' || l.etapa === 'SUSCRIPCION').length || 0
      const conversion = totalLeads > 0 ? (activeLeads / totalLeads) * 100 : 0

      setMetrics({
        leadsGenerados: totalLeads,
        conversiones: activeLeads,
        tasaConversion: Math.round(conversion * 10) / 10,
        comisiones: totalCommissions
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    // Create Excel-compatible data
    const excelData = []
    
    // Add metrics summary
    excelData.push(['REPORTE DE COMERCIAL - RESUMEN EJECUTIVO'])
    excelData.push([''])
    excelData.push(['Generado el:', new Date().toLocaleDateString('es-ES')])
    excelData.push(['Período:', periodo])
    excelData.push([''])
    
    // Add KPIs
    excelData.push(['INDICADORES CLAVE (KPIs)'])
    excelData.push(['Métrica', 'Valor', 'Variación vs Mes Anterior'])
    excelData.push(['Leads Generados', metrics.leadsGenerados, '+15%'])
    excelData.push(['Conversiones', metrics.conversiones, '+8%'])
    excelData.push(['Tasa de Conversión', `${metrics.tasaConversion}%`, '-2.1%'])
    excelData.push(['Comisiones Totales', `$${metrics.comisiones.toLocaleString()}`, '+22%'])
    excelData.push([''])
    
    // Add monthly performance data
    excelData.push(['EVOLUCIÓN MENSUAL'])
    excelData.push(['Mes', 'Leads', 'Conversiones', 'Comisiones'])
    chartData.misVentasData.forEach(month => {
      excelData.push([month.mes, month.leads, month.conversiones, `$${month.comisiones.toLocaleString()}`])
    })
    excelData.push([''])
    
    // Add pipeline data
    excelData.push(['ESTADO DEL PIPELINE'])
    excelData.push(['Etapa', 'Cantidad', 'Valor Estimado'])
    chartData.pipelineData.forEach(stage => {
      excelData.push([stage.etapa, stage.cantidad, `$${stage.valor.toLocaleString()}`])
    })
    excelData.push([''])
    
    // Add commission types
    excelData.push(['TIPOS DE COMISIÓN'])
    excelData.push(['Tipo', 'Porcentaje'])
    chartData.tipoComisionData.forEach(type => {
      excelData.push([type.name, `${type.value}%`])
    })
    excelData.push([''])
    
    // Add goals tracking
    excelData.push(['SEGUIMIENTO DE METAS'])
    excelData.push(['Métrica', 'Actual', 'Meta', 'Progreso'])
    excelData.push(['Leads', metrics.leadsGenerados, '5', `${Math.min((metrics.leadsGenerados / 5) * 100, 100).toFixed(1)}%`])
    excelData.push(['Conversiones', metrics.conversiones, '3', `${Math.min((metrics.conversiones / 3) * 100, 100).toFixed(1)}%`])
    excelData.push(['Comisiones', `$${(metrics.comisiones / 1000000).toFixed(2)}M`, '$2.5M', `${Math.min((metrics.comisiones / 2500000) * 100, 100).toFixed(1)}%`])

    // Convert to CSV format
    const csvContent = excelData.map(row => 
      row.map(cell => {
        if (typeof cell === 'string' && cell.includes(',')) {
          return `"${cell}"`
        }
        return cell
      }).join(',')
    ).join('\n')

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const date = new Date().toLocaleDateString('es-ES').replace(/\//g, '-')
    link.download = `reporte_comercial_${date}.csv`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async function fetchChartData() {
    try {
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
      } else {
        comercialId = 'f4e7b623-3d9a-4b8c-a1e2-9f8a7c6d5e3b'
      }

      if (!comercialId) {
        console.error('Reports Charts: No comercial found')
        return
      }

      // Get pipeline data
      const { data: leadsData } = await supabase
        .from('lead')
        .select('etapa')
        .eq('owner_id', comercialId)

      // Count leads by pipeline stage
      const pipelineCounts = {
        'PROSPECTO': 0,
        'CONTACTADO': 0,
        'DEMO_PROG': 0,
        'ACTIVO': 0
      }

      leadsData?.forEach(lead => {
        if (pipelineCounts.hasOwnProperty(lead.etapa)) {
          pipelineCounts[lead.etapa]++
        } else if (lead.etapa === 'DEMO_REAL') {
          pipelineCounts['DEMO_PROG']++
        } else if (lead.etapa === 'SUSCRIPCION' || lead.etapa === 'ONBOARDING' || lead.etapa === 'RENOVACION') {
          pipelineCounts['ACTIVO']++
        }
      })

      // Get commission type data
      const { data: commissionsData } = await supabase
        .from('comision')
        .select('tipo')
        .eq('comercial_id', comercialId)

      // Count commissions by type
      const commissionTypes = {
        'A_BASE': 0,
        'A_BONO': 0,
        'B': 0,
        'RENOVACION': 0
      }

      commissionsData?.forEach(commission => {
        if (commissionTypes.hasOwnProperty(commission.tipo)) {
          commissionTypes[commission.tipo]++
        }
      })

      const totalCommissions = Object.values(commissionTypes).reduce((sum, count) => sum + count, 0)

      // Get monthly data for the last 6 months
      const monthsData = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        
        // Get leads count for this month
        const { count: monthLeads } = await supabase
          .from('lead')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', comercialId)
          .gte('created_at', `${year}-${String(month).padStart(2, '0')}-01`)
          .lt('created_at', month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`)

        // Get conversions (active leads) count for this month
        const { count: monthConversions } = await supabase
          .from('lead')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', comercialId)
          .eq('etapa', 'ACTIVO')
          .gte('created_at', `${year}-${String(month).padStart(2, '0')}-01`)
          .lt('created_at', month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`)

        // Get commissions sum for this month
        const { data: monthCommissionsData } = await supabase
          .from('comision')
          .select('monto_neto')
          .eq('comercial_id', comercialId)
          .eq('estado', 'PAGADA')
          .gte('causado_at', `${year}-${String(month).padStart(2, '0')}-01`)
          .lt('causado_at', month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`)

        const monthCommissions = monthCommissionsData?.reduce((sum, c) => sum + (c.monto_neto || 0), 0) || 0

        monthsData.push({
          mes: date.toLocaleDateString('es-ES', { month: 'short' }),
          leads: monthLeads || 0,
          conversiones: monthConversions || 0,
          comisiones: monthCommissions
        })
      }

      // Generate chart data based on real metrics
      setChartData({
        misVentasData: monthsData,
        pipelineData: [
          { etapa: "Prospecto", cantidad: pipelineCounts.PROSPECTO, valor: pipelineCounts.PROSPECTO * 200000 },
          { etapa: "Contactado", cantidad: pipelineCounts.CONTACTADO, valor: pipelineCounts.CONTACTADO * 200000 },
          { etapa: "Demo", cantidad: pipelineCounts.DEMO_PROG, valor: pipelineCounts.DEMO_PROG * 200000 },
          { etapa: "Activo", cantidad: pipelineCounts.ACTIVO, valor: pipelineCounts.ACTIVO * 200000 },
        ],
        tipoComisionData: totalCommissions > 0 ? [
          { name: "A_BASE", value: Math.round((commissionTypes.A_BASE / totalCommissions) * 100), color: "#FF5F45" },
          { name: "A_BONO", value: Math.round((commissionTypes.A_BONO / totalCommissions) * 100), color: "#00D4AA" },
          { name: "B", value: Math.round((commissionTypes.B / totalCommissions) * 100), color: "#4A9EFF" },
          { name: "RENOVACION", value: Math.round((commissionTypes.RENOVACION / totalCommissions) * 100), color: "#FFB800" },
        ] : [
          { name: "A_BASE", value: 40, color: "#FF5F45" },
          { name: "A_BONO", value: 25, color: "#00D4AA" },
          { name: "B", value: 25, color: "#4A9EFF" },
          { name: "RENOVACION", value: 10, color: "#FFB800" },
        ]
      })
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarComercial />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Mis Reportes</h1>
          <p className="text-gray-400 mt-1">Análisis de tu performance comercial</p>
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
          <Button 
            onClick={exportToExcel}
            className="bg-gradient-to-r from-[#FF5F45] to-[#FF7A63] hover:from-[#E54A2E] hover:to-[#FF5F45] text-white"
          >
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
                <p className="text-gray-400 text-sm">Leads Generados</p>
                <p className="text-2xl font-bold text-white">{loading ? "..." : metrics.leadsGenerados}</p>
                <p className="text-xs text-[#00D4AA] flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% vs mes anterior
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
                <p className="text-gray-400 text-sm">Conversiones</p>
                <p className="text-2xl font-bold text-white">{loading ? "..." : metrics.conversiones}</p>
                <p className="text-xs text-[#00D4AA] flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% vs mes anterior
                </p>
              </div>
              <Users className="w-8 h-8 text-[#00D4AA]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tasa Conversión</p>
                <p className="text-2xl font-bold text-white">{loading ? "..." : `${metrics.tasaConversion}%`}</p>
                <p className="text-xs text-[#FFB800] flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  -2.1% vs mes anterior
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
                <p className="text-gray-400 text-sm">Comisiones</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? "..." : `$${(metrics.comisiones / 1000000).toFixed(2)}M`}
                </p>
                <p className="text-xs text-[#00D4AA] flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +22% vs mes anterior
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#FF5F45]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución de Performance */}
        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Evolución de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.misVentasData}>
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
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#4A9EFF"
                  strokeWidth={3}
                  dot={{ fill: "#4A9EFF", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="conversiones"
                  stroke="#FF5F45"
                  strokeWidth={3}
                  dot={{ fill: "#FF5F45", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Estado del Pipeline */}
        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Estado del Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="etapa" stroke="#b0b0b0" />
                <YAxis stroke="#b0b0b0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#353535",
                    border: "1px solid #404040",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
                <Bar dataKey="cantidad" fill="#FF5F45" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de Comisiones */}
        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Tipos de Comisión</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.tipoComisionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.tipoComisionData.map((entry, index) => (
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
            <div className="grid grid-cols-2 gap-2 mt-4">
              {chartData.tipoComisionData.map((entry, index) => (
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

        {/* Metas y Objetivos */}
        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Metas del Mes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Leads (Meta: 5)</span>
                <span className="text-white">{metrics.leadsGenerados}/5</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#FF5F45] to-[#FF7A63] h-2 rounded-full"
                  style={{ width: `${Math.min((metrics.leadsGenerados / 5) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Conversiones (Meta: 3)</span>
                <span className="text-white">{metrics.conversiones}/3</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#00D4AA] to-[#00E6C0] h-2 rounded-full"
                  style={{ width: `${Math.min((metrics.conversiones / 3) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Comisiones (Meta: $2.5M)</span>
                <span className="text-white">${(metrics.comisiones / 1000000).toFixed(2)}M/2.5M</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#4A9EFF] to-[#6BB6FF] h-2 rounded-full"
                  style={{ width: `${Math.min((metrics.comisiones / 2500000) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Performance General</span>
                <Badge className="bg-[#00D4AA] text-white">Excelente</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </main>
      </div>
    </div>
  )
}
