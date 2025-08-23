"use client"

import { useState, useEffect } from "react"
import { createClient } from '@supabase/supabase-js'
import { KanbanColumn } from "./kanban-column"
import { BarCard } from "./bar-card"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Bar {
  id: string
  name: string
  address: string
  phone: string
  channel: "A" | "B"
  registrationDate: string
  approved: boolean
  status: "prospecto" | "contactado" | "demo-programado" | "activa"
  contact?: string
  demoDate?: string
}

const columns = [
  {
    id: "prospecto",
    title: "Prospecto",
    badgeColor: "bg-muted-foreground text-white",
    count: 0,
  },
  {
    id: "contactado",
    title: "Contactado",
    badgeColor: "bg-info text-white",
    count: 0,
  },
  {
    id: "demo-programado",
    title: "Demo Programado",
    badgeColor: "bg-pending text-black",
    count: 0,
  },
  {
    id: "activa",
    title: "Suscripción Activa",
    badgeColor: "bg-success text-white",
    count: 0,
  },
]

export function PipelineKanban() {
  const [bars, setBars] = useState<Bar[]>([])
  const [draggedBar, setDraggedBar] = useState<Bar | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPipelineData()
  }, [])

  async function fetchPipelineData() {
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

        console.log('Pipeline: Using comercial ID:', comercialId)
      } else {
        // No user authenticated - use demo data
        console.warn('Pipeline: No user authenticated - using demo comercial Juan Pérez')
        comercialId = '8db6ca40-993d-4305-add9-51c6b81df16e'
      }

      if (!comercialId) {
        console.error('Pipeline: No comercial found')
        return
      }

      // Get leads with bar information for this comercial
      const { data: leads } = await supabase
        .from('lead')
        .select(`
          id,
          nombre_contacto,
          email_contacto,
          telefono_contacto,
          etapa,
          created_at,
          nota,
          bars(id, name, address, phone, contacto_nombre)
        `)
        .eq('owner_id', comercialId)

      console.log('Pipeline: Leads fetched:', leads)

      if (leads) {
        // Transform leads to Bar format
        const transformedBars: Bar[] = leads.map((lead) => {
          let status: Bar['status'] = 'prospecto'
          
          // Map pipeline statuses
          switch (lead.etapa) {
            case 'PROSPECTO':
              status = 'prospecto'
              break
            case 'CONTACTADO':
              status = 'contactado'
              break
            case 'DEMO_PROG':
            case 'DEMO_REAL':
              status = 'demo-programado'
              break
            case 'ACTIVO':
            case 'SUSCRIPCION':
            case 'ONBOARDING':
            case 'RENOVACION':
              status = 'activa'
              break
          }

          return {
            id: lead.id,
            name: lead.bars?.name || 'Bar Sin Nombre',
            address: lead.bars?.address || 'Sin dirección',
            phone: lead.bars?.phone || lead.telefono_contacto || 'Sin teléfono',
            channel: Math.random() > 0.5 ? 'A' : 'B', // Random channel for now
            registrationDate: new Date(lead.created_at).toISOString().split('T')[0],
            approved: true,
            status,
            contact: lead.bars?.contacto_nombre || lead.nombre_contacto || 'Sin contacto',
            demoDate: status === 'demo-programado' ? '2025-08-25' : undefined
          }
        })

        setBars(transformedBars)
        console.log('Pipeline: Transformed bars:', transformedBars)
      }
    } catch (error) {
      console.error('Error fetching pipeline data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (bar: Bar) => {
    setDraggedBar(bar)
  }

  const handleDragEnd = () => {
    setDraggedBar(null)
  }

  const handleDrop = (columnId: string) => {
    if (!draggedBar) return

    setBars((prevBars) =>
      prevBars.map((bar) => (bar.id === draggedBar.id ? { ...bar, status: columnId as Bar["status"] } : bar)),
    )
    setDraggedBar(null)
  }

  const getBarsByStatus = (status: string) => {
    return bars.filter((bar) => bar.status === status)
  }

  const updateColumns = () => {
    return columns.map((column) => ({
      ...column,
      count: getBarsByStatus(column.id).length,
    }))
  }

  if (loading) {
    return (
      <div className="h-full overflow-x-auto">
        <div className="flex gap-6 min-w-max h-full pb-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              badgeColor={column.badgeColor}
              count={0}
              onDrop={() => {}}
              isDragOver={false}
            >
              <div className="space-y-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                ))}
              </div>
            </KanbanColumn>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-6 min-w-max h-full pb-6">
        {updateColumns().map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            badgeColor={column.badgeColor}
            count={column.count}
            onDrop={handleDrop}
            isDragOver={draggedBar?.status !== column.id}
          >
            <div className="space-y-4">
              {getBarsByStatus(column.id).map((bar) => (
                <BarCard
                  key={bar.id}
                  bar={bar}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedBar?.id === bar.id}
                />
              ))}
            </div>
          </KanbanColumn>
        ))}
      </div>
    </div>
  )
}
