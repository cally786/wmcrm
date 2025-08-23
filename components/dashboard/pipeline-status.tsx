"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PipelineStage {
  stage: string
  count: number
  color: string
  bars: Array<{ name: string; status: string }>
}

export function PipelineStatus() {
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([])
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

        console.log('Pipeline: Authenticated user found comercial:', comercialId)
      } else {
        // No user authenticated - use Juan Pérez as demo
        console.warn('Pipeline: No user authenticated - using demo comercial Juan Pérez')
        comercialId = '8db6ca40-993d-4305-add9-51c6b81df16e'
      }

      if (!comercialId) {
        console.error('Pipeline: No comercial found')
        return
      }

      // Get leads by stage
      const { data: leads } = await supabase
        .from('lead')
        .select('etapa, nombre_contacto, nota')
        .eq('owner_id', comercialId)

      // Group leads by stage
      const stageGroups = leads?.reduce((acc, lead) => {
        const stage = lead.etapa
        if (!acc[stage]) {
          acc[stage] = []
        }
        acc[stage].push({
          name: lead.nombre_contacto || 'Sin nombre',
          status: lead.nota?.toLowerCase()?.includes('new') ? 'new' : 
                  lead.nota?.toLowerCase()?.includes('contactado') ? 'contacted' :
                  lead.nota?.toLowerCase()?.includes('demo') ? 'demo-scheduled' :
                  lead.nota?.toLowerCase()?.includes('activo') ? 'active' : 'pending'
        })
        return acc
      }, {} as Record<string, any[]>) || {}

      const stageMapping = {
        'PROSPECTO': { name: 'Prospecto', color: 'bg-muted-foreground' },
        'CONTACTADO': { name: 'Contactado', color: 'bg-info' },
        'DEMO_PROG': { name: 'Demo Programado', color: 'bg-pending' },
        'DEMO_REAL': { name: 'Demo Realizado', color: 'bg-warning' },
        'ACTIVO': { name: 'Suscripción Activa', color: 'bg-success' },
        'SUSCRIPCION': { name: 'Suscripción', color: 'bg-success' },
        'ONBOARDING': { name: 'Onboarding', color: 'bg-info' },
        'RENOVACION': { name: 'Renovación', color: 'bg-success' }
      }

      const transformedData: PipelineStage[] = Object.entries(stageGroups).map(([stageKey, stageLeads]) => {
        const stageInfo = stageMapping[stageKey as keyof typeof stageMapping] || { name: stageKey, color: 'bg-muted' }
        return {
          stage: stageInfo.name,
          count: stageLeads.length,
          color: stageInfo.color,
          bars: stageLeads.slice(0, 3) // Show first 3
        }
      })

      setPipelineData(transformedData)
      console.log('Pipeline data loaded:', transformedData)
    } catch (error) {
      console.error('Error fetching pipeline data:', error)
    } finally {
      setLoading(false)
    }
  }
  if (loading) {
    return (
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Estado del Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-primary" />
          Estado del Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineData.map((stage, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">{stage.stage}</h4>
                <Badge variant="secondary" className="text-xs">
                  {stage.count}
                </Badge>
              </div>

              <div className="space-y-2">
                {stage.bars.slice(0, 3).map((bar, barIndex) => (
                  <div
                    key={barIndex}
                    className="p-2 rounded bg-muted/30 border border-border/50 transition-wingman hover:bg-muted/50"
                  >
                    <p className="text-xs font-medium text-foreground truncate">{bar.name}</p>
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full ${stage.color} mr-2`} />
                      <span className="text-xs text-muted-foreground capitalize">{bar.status.replace("-", " ")}</span>
                    </div>
                  </div>
                ))}

                {stage.count > 3 && (
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">+{stage.count - 3} más</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
