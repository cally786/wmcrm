"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Phone, Users, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Activity {
  id: string
  type: string
  title: string
  time: string
  date: string
  status: string
  icon: any
}

interface UpcomingActivitiesProps {
  data?: Activity[]
}

const statusColors = {
  pending: "bg-pending text-black",
  scheduled: "bg-info text-white", 
  confirmed: "bg-success text-white",
  demo: "bg-warning text-white",
  visita: "bg-info text-white",
  llamada: "bg-secondary text-black",
}

const typeIcons = {
  'DEMO': Users,
  'VISITA': MapPin,
  'LLAMADA': Phone,
  'EVENTO': Calendar,
  'SEGUIMIENTO': Phone,
}

export function UpcomingActivities({ data }: UpcomingActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>(data || [])
  const [loading, setLoading] = useState(!data)

  useEffect(() => {
    if (!data) {
      fetchUpcomingActivities()
    }
  }, [])

  async function fetchUpcomingActivities() {
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

        console.log('Upcoming Activities: Authenticated user found comercial:', comercialId)
      } else {
        // No user authenticated - get Test User Nuevo from database
        console.warn('Upcoming Activities: No user authenticated - using demo comercial Test User Nuevo')
        const { data: demoComercial } = await supabase
          .from('comercial')
          .select('id')
          .eq('email', 'testnuevo@demo.com')
          .single()
        
        comercialId = demoComercial?.id
      }

      if (!comercialId) {
        console.error('Upcoming Activities: No comercial found')
        return
      }
      
      // Get upcoming events (next 30 days to ensure we have data)
      const today = new Date()
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      console.log('Upcoming Activities: Querying events from', today.toISOString(), 'to', nextMonth.toISOString())
      
      const { data: eventos, error } = await supabase
        .from('evento')
        .select(`
          id,
          titulo,
          fecha
        `)
        .eq('comercial_id', comercialId)
        .gte('fecha', today.toISOString())
        .lte('fecha', nextMonth.toISOString())
        .order('fecha', { ascending: true })
        .limit(4)

      console.log('Upcoming Activities: Query result:', { eventos, error, comercialId })
      
      if (error) {
        console.error('Upcoming Activities: Query error:', error)
        console.error('Upcoming Activities: Error details:', JSON.stringify(error, null, 2))
      }

      const transformedActivities = eventos?.map((evento) => {
        const eventDate = new Date(evento.fecha)
        const isToday = eventDate.toDateString() === today.toDateString()
        const isTomorrow = eventDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString()
        
        let dateStr = 'Hoy'
        if (isTomorrow) dateStr = 'Mañana'
        else if (!isToday) dateStr = eventDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        
        const timeStr = eventDate.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })

        const type = 'EVENTO' // Default since tipo_evento column doesn't exist
        const IconComponent = typeIcons[type as keyof typeof typeIcons] || Calendar
        
        return {
          id: evento.id,
          type: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
          title: evento.titulo || `${type} - Sin título`,
          time: timeStr,
          date: dateStr,
          status: isToday ? 'pending' : 'scheduled',
          icon: IconComponent
        }
      }) || []

      setActivities(transformedActivities)
      console.log('Upcoming activities loaded:', transformedActivities)
    } catch (error) {
      console.error('Error fetching upcoming activities:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Próximas Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                <div className="animate-pulse space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-muted rounded"></div>
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
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          Próximas Actividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 transition-wingman hover:bg-muted/50"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                    <Badge className={statusColors[activity.status as keyof typeof statusColors]}>
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.date} • {activity.time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
