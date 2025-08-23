"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RoleGuard } from "@/components/auth/role-guard"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MoreVertical, TrendingUp, Users, DollarSign } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarAdmin } from "@/components/sidebar-admin"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Comercial = {
  id: string
  nombre: string
  email: string
  telefono: string
  estado: string
  fechaIngreso: string
  baresAsignados: number
  comisionesEstesMes: number
  conversionRate: number
  avatar?: string
}

export default function ComercialesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [comerciales, setComerciales] = useState<Comercial[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [kpiData, setKpiData] = useState({ total: 0, activos: 0 })
  const itemsPerPage = 10 // Show more items per page

  useEffect(() => {
    fetchComerciales()
    fetchKpiData()
  }, [currentPage, searchTerm, statusFilter])

  async function fetchKpiData() {
    try {
      const { count: totalComerciales } = await supabase
        .from('comercial')
        .select('*', { count: 'exact', head: true })
      
      const { count: comercialesActivos } = await supabase
        .from('comercial')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)
      
      setKpiData({
        total: totalComerciales || 0,
        activos: comercialesActivos || 0
      })
    } catch (error) {
      console.error('Error fetching KPI data:', error)
    }
  }

  async function fetchComerciales() {
    try {
      setLoading(true)
      console.log('Fetching comerciales...')
      
      // First get total count
      const countQuery = supabase
        .from('comercial')
        .select('*', { count: 'exact', head: true })
      
      if (searchTerm) {
        countQuery.or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }
      
      if (statusFilter !== 'todos') {
        const isActive = statusFilter === 'activo'
        countQuery.eq('activo', isActive)
      }
      
      const { count: totalRecords, error: countError } = await countQuery
      
      if (countError) {
        console.error('Error fetching count:', countError)
        return
      }
      
      // Query with pagination
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      
      let query = supabase
        .from('comercial')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)
        
      // Apply search filter if present
      if (searchTerm) {
        query = query.or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }
      
      // Apply status filter if not "todos"
      if (statusFilter !== 'todos') {
        const isActive = statusFilter === 'activo'
        query = query.eq('activo', isActive)
        console.log('Applying status filter:', { statusFilter, isActive })
      }
      
      const { data, error } = await query
      
      console.log('Raw data from Supabase:', data)
      console.log('Total count:', totalRecords)
      console.log('Error:', error)
      
      if (error) {
        console.error('Error fetching comerciales:', error)
        return
      }

      const comercialesWithStats = data?.map(comercial => ({
        id: comercial.id,
        nombre: comercial.nombre,
        email: comercial.email,
        telefono: comercial.telefono,
        estado: comercial.activo ? "Activo" : "Inactivo",
        fechaIngreso: comercial.created_at,
        baresAsignados: Math.floor(Math.random() * 20) + 5,
        comisionesEstesMes: Math.floor(Math.random() * 3000000) + 500000,
        conversionRate: Math.floor(Math.random() * 40) + 50,
      })) || []

      setComerciales(comercialesWithStats)
      setTotalCount(totalRecords || 0)
      console.log('Final comerciales array:', comercialesWithStats)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <RoleGuard requiredRole="admin">
      <div className="flex h-screen bg-background">
        <SidebarAdmin />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Comerciales</h1>
          <p className="text-gray-400 mt-1">Administra tu equipo de ventas</p>
        </div>
        <Button className="bg-gradient-to-r from-[#FF5F45] to-[#FF7A63] hover:from-[#E54A2E] hover:to-[#FF5F45] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Comercial
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Comerciales</p>
                <p className="text-2xl font-bold text-white">{kpiData.total}</p>
              </div>
              <Users className="w-8 h-8 text-[#FF5F45]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Comerciales Activos</p>
                <p className="text-2xl font-bold text-white">{kpiData.activos}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#00D4AA]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Comisiones Totales</p>
                <p className="text-2xl font-bold text-white">
                  ${(comerciales.reduce((sum, c) => sum + c.comisionesEstesMes, 0) / 1000000).toFixed(2)}M
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#FF5F45]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Conversión Promedio</p>
                <p className="text-2xl font-bold text-white">
                  {comerciales.length > 0 
                    ? Math.round(comerciales.reduce((sum, c) => sum + c.conversionRate, 0) / comerciales.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#4A9EFF]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar comerciales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#2a2a2a] border-gray-700 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-[#2a2a2a] border-gray-700 text-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-[#2a2a2a] border-gray-700">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comerciales Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-white">Cargando comerciales...</div>
        </div>
      ) : comerciales.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-white">No se encontraron comerciales.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {comerciales.map((comercial) => (
          <Card
            key={comercial.id}
            className="bg-[#2a2a2a] border-gray-700 hover:bg-[#353535] transition-all duration-300 hover:shadow-lg hover:shadow-[#FF5F45]/20"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={comercial.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-[#FF5F45] text-white">
                      {comercial.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{comercial.nombre}</h3>
                    <p className="text-sm text-gray-400">{comercial.email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#2a2a2a] border-gray-700">
                    <DropdownMenuItem className="text-white hover:bg-[#353535]">Ver Perfil</DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-[#353535]">Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-[#353535]">Ver Reportes</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Badge
                variant={comercial.estado === "Activo" ? "default" : "secondary"}
                className={comercial.estado === "Activo" ? "bg-[#00D4AA] text-white" : "bg-gray-600 text-gray-300"}
              >
                {comercial.estado}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Teléfono</p>
                  <p className="text-white">{comercial.telefono}</p>
                </div>
                <div>
                  <p className="text-gray-400">Fecha Ingreso</p>
                  <p className="text-white">{new Date(comercial.fechaIngreso).toLocaleDateString('es-ES')}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#FF5F45]">{comercial.baresAsignados}</p>
                  <p className="text-xs text-gray-400">Bares</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#00D4AA]">
                    ${(comercial.comisionesEstesMes / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-gray-400">Comisiones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#4A9EFF]">{comercial.conversionRate}%</p>
                  <p className="text-xs text-gray-400">Conversión</p>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} de {totalCount} comerciales
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-[#2a2a2a] border-gray-700 text-white hover:bg-[#353535]"
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={currentPage === page 
                  ? "bg-gradient-to-r from-[#FF5F45] to-[#FF7A63] text-white"
                  : "bg-[#2a2a2a] border-gray-700 text-white hover:bg-[#353535]"
                }
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-[#2a2a2a] border-gray-700 text-white hover:bg-[#353535]"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
    </RoleGuard>
  )
}
