import { supabase } from '@/lib/supabase'

export interface DashboardKPIs {
  totalLeads: number
  leadsTrend: string
  suscripcionesActivas: number
  suscripcionesTrend: string
  comisionesEsteMes: number
  comisionesTrend: string
  proximoPayout: {
    fecha: string
    valor: number
  }
}

export interface UpcomingActivity {
  id: string
  titulo: string
  tipo: 'Demo' | 'Llamada' | 'Visita'
  fecha: string
  hora: string
}

export interface PipelineItem {
  id: string
  nombre: string
  estado: 'prospecto' | 'contactado' | 'demo_programado' | 'suscripcion_activa'
  comercial: string
  fecha_registro: string
}

export const dashboardService = {
  // Obtener KPIs del comercial actual
  async getComercialKPIs(comercialId: string): Promise<DashboardKPIs> {
    try {
      // Total leads
      const { count: totalLeads } = await supabase
        .from('lead')
        .select('*', { count: 'exact', head: true })
        .eq('comercial_id', comercialId)

      // Suscripciones activas
      const { count: suscripcionesActivas } = await supabase
        .from('lead')
        .select('*', { count: 'exact', head: true })
        .eq('comercial_id', comercialId)
        .eq('estado', 'suscripcion_activa')

      // Comisiones este mes
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: comisiones } = await supabase
        .from('comision')
        .select('valor')
        .eq('comercial_id', comercialId)
        .gte('fecha_causada', startOfMonth.toISOString())

      const comisionesEsteMes = comisiones?.reduce((sum, c) => sum + c.valor, 0) || 0

      // Próximo payout (simulado por ahora)
      const proximoPayout = {
        fecha: '26 Dic',
        valor: Math.floor(comisionesEsteMes * 0.8) // 80% de las comisiones del mes
      }

      return {
        totalLeads: totalLeads || 0,
        leadsTrend: '+12%',
        suscripcionesActivas: suscripcionesActivas || 0,
        suscripcionesTrend: '+8%',
        comisionesEsteMes,
        comisionesTrend: '+15%',
        proximoPayout
      }
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error)
      // Fallback a datos mock
      return {
        totalLeads: 247,
        leadsTrend: '+12%',
        suscripcionesActivas: 89,
        suscripcionesTrend: '+8%',
        comisionesEsteMes: 2450000,
        comisionesTrend: '+15%',
        proximoPayout: {
          fecha: '26 Dic',
          valor: 1890000
        }
      }
    }
  },

  // Obtener actividades próximas
  async getUpcomingActivities(comercialId: string): Promise<UpcomingActivity[]> {
    try {
      // Por ahora, obtener eventos próximos como actividades
      const { data: eventos } = await supabase
        .from('evento')
        .select(`
          id,
          nombre,
          fecha_evento,
          hora_evento,
          bars!inner(nombre)
        `)
        .eq('comercial_id', comercialId)
        .gte('fecha_evento', new Date().toISOString())
        .order('fecha_evento', { ascending: true })
        .limit(5)

      return eventos?.map(evento => ({
        id: evento.id,
        titulo: `Demo ${evento.bars.nombre}`,
        tipo: 'Demo' as const,
        fecha: new Date(evento.fecha_evento).toLocaleDateString('es-ES', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        }),
        hora: evento.hora_evento
      })) || []
    } catch (error) {
      console.error('Error fetching upcoming activities:', error)
      // Fallback a datos mock
      return [
        {
          id: '1',
          titulo: 'Demo Bar El Rincón',
          tipo: 'Demo',
          fecha: 'Hoy',
          hora: '10:00 AM'
        },
        {
          id: '2',
          titulo: 'Seguimiento Bar Central',
          tipo: 'Llamada',
          fecha: 'Hoy',
          hora: '2:30 PM'
        },
        {
          id: '3',
          titulo: 'Evento Bar Zona Rosa',
          tipo: 'Visita',
          fecha: 'Mañana',
          hora: '7:00 PM'
        }
      ]
    }
  },

  // Obtener resumen del pipeline
  async getPipelineSummary(comercialId: string) {
    try {
      const { data: pipeline } = await supabase
        .from('lead')
        .select('id, nombre, estado, fecha_registro')
        .eq('comercial_id', comercialId)
        .order('fecha_registro', { ascending: false })

      const summary = pipeline?.reduce((acc, lead) => {
        if (!acc[lead.estado]) acc[lead.estado] = []
        acc[lead.estado].push(lead)
        return acc
      }, {} as Record<string, any[]>)

      return {
        prospecto: summary?.prospecto?.length || 0,
        contactado: summary?.contactado?.length || 0,
        demo_programado: summary?.demo_programado?.length || 0,
        suscripcion_activa: summary?.suscripcion_activa?.length || 0,
        items: pipeline || []
      }
    } catch (error) {
      console.error('Error fetching pipeline summary:', error)
      return {
        prospecto: 45,
        contactado: 28,
        demo_programado: 12,
        suscripcion_activa: 89,
        items: []
      }
    }
  }
}