import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
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

      console.log('Dashboard API: Authenticated user found comercial:', comercialId)
    } else {
      // No user authenticated - get Test User Nuevo from database
      console.warn('Dashboard API: No user authenticated - using demo comercial Test User Nuevo')
      const { data: demoComercial } = await supabase
        .from('comercial')
        .select('id')
        .eq('email', 'testnuevo@demo.com')
        .single()
      
      comercialId = demoComercial?.id
    }

    if (!comercialId) {
      console.error('Dashboard API: No comercial found')
      return NextResponse.json({ error: 'No comercial found' }, { status: 404 })
    }

    // Fetch all dashboard data in parallel using optimized views
    const [
      dashboardDataResult,
      upcomingEventsResult,
      commissionChartResult
    ] = await Promise.all([
      // Main KPI data
      supabase
        .from('dashboard_data')
        .select('*')
        .eq('comercial_id', comercialId)
        .single(),
      
      // Upcoming events (limited to 4)
      supabase
        .from('upcoming_events_view')
        .select('*')
        .eq('comercial_id', comercialId)
        .limit(4),
      
      // Commission chart data (last 6 months)
      supabase
        .from('commission_chart_view')
        .select('*')
        .eq('comercial_id', comercialId)
        .order('month_start', { ascending: true })
    ])

    // Check for errors
    if (dashboardDataResult.error) {
      console.error('Dashboard API: Error fetching dashboard data:', dashboardDataResult.error)
      return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
    }

    if (upcomingEventsResult.error) {
      console.error('Dashboard API: Error fetching events:', upcomingEventsResult.error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    if (commissionChartResult.error) {
      console.error('Dashboard API: Error fetching commission data:', commissionChartResult.error)
      return NextResponse.json({ error: 'Failed to fetch commission data' }, { status: 500 })
    }

    const dashboardData = dashboardDataResult.data
    const upcomingEvents = upcomingEventsResult.data || []
    const commissionChart = commissionChartResult.data || []

    // Transform data for frontend
    const kpiData = [
      {
        title: "Total Leads",
        value: dashboardData.total_leads.toString(),
        change: "+12%",
        trend: "up" as const,
        icon: "Users",
        description: "en pipeline",
      },
      {
        title: "Suscripciones Activas", 
        value: dashboardData.active_subscriptions.toString(),
        change: "+8%",
        trend: "up" as const,
        icon: "Target",
        description: "clientes activos",
      },
      {
        title: "Comisiones Este Mes",
        value: `$${Number(dashboardData.monthly_commissions_paid).toLocaleString()}`,
        change: `Total: $${Number(dashboardData.monthly_commissions_total).toLocaleString()}`,
        trend: "neutral" as const,
        icon: "DollarSign",
        description: "pagadas de total",
      },
      {
        title: "Próximo Payout",
        value: "26 Ago",
        change: `$${Number(dashboardData.pending_commissions).toLocaleString()}`,
        trend: "neutral" as const,
        icon: "Calendar",
        description: "estimado",
      },
    ]

    // Transform events
    const transformedEvents = upcomingEvents.map((evento) => {
      const eventDate = new Date(evento.fecha)
      const today = new Date()
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

      return {
        id: evento.id,
        type: evento.tipo_evento.charAt(0).toUpperCase() + evento.tipo_evento.slice(1).toLowerCase(),
        title: evento.titulo || `${evento.tipo_evento} - ${evento.bar_name || 'Sin bar'}`,
        time: timeStr,
        date: dateStr,
        status: isToday ? 'pending' : 'scheduled',
        icon: "Calendar"
      }
    })

    // Transform commission chart data
    const chartData = commissionChart.map((item) => ({
      month: item.month_name,
      amount: Number(item.amount)
    }))

    console.log('Dashboard API: Data loaded successfully', {
      kpis: kpiData.length,
      events: transformedEvents.length,
      chartPoints: chartData.length
    })

    return NextResponse.json({
      kpis: kpiData,
      upcomingEvents: transformedEvents,
      commissionChart: chartData,
      comercialInfo: {
        id: comercialId,
        nombre: dashboardData.nombre,
        email: dashboardData.email
      }
    })

  } catch (error) {
    console.error('Dashboard API: Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}