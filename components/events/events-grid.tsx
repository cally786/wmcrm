"use client"

import { useState, useEffect } from "react"
import { createClient } from '@supabase/supabase-js'
import { EventCard } from "./event-card"
import { EventFilters } from "./event-filters"
import { EventModal } from "./event-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Event {
  id: string
  name: string
  barName: string
  date: string
  time: string
  status: "programado" | "en-curso" | "completado" | "cancelado"
  channel: "A" | "B"
  capacity: number
  attendees: number
  downloads: number
  location: string
  description: string
  evidences: string[]
}

export function EventsGrid() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
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

        console.log('Events: Using comercial ID:', comercialId)
      } else {
        // No user authenticated - use demo data
        console.warn('Events: No user authenticated - using demo comercial Juan Pérez')
        comercialId = '8db6ca40-993d-4305-add9-51c6b81df16e'
      }

      if (!comercialId) {
        console.error('Events: No comercial found')
        return
      }

      // Get events with bar information for this comercial
      const { data: eventos } = await supabase
        .from('evento')
        .select(`
          id,
          titulo,
          fecha,
          capacidad_meta,
          estado,
          bars(name, address)
        `)
        .eq('comercial_id', comercialId)
        .order('fecha', { ascending: false })

      console.log('Events: Fetched eventos:', eventos)

      if (eventos) {
        // Transform events to Event format
        const transformedEvents: Event[] = eventos.map((evento) => {
          const eventDate = new Date(evento.fecha)
          let status: Event['status'] = 'programado'
          
          // Map event status
          switch (evento.estado?.toUpperCase()) {
            case 'PROGRAMADO':
              status = 'programado'
              break
            case 'EN_CURSO':
              status = 'en-curso'
              break
            case 'COMPLETADO':
              status = 'completado'
              break
            case 'CANCELADO':
              status = 'cancelado'
              break
            case 'CONFIRMADO':
              status = 'programado'
              break
          }

          return {
            id: evento.id,
            name: evento.titulo || 'Evento Sin Título',
            barName: evento.bars?.name || 'Bar Sin Nombre',
            date: eventDate.toISOString().split('T')[0],
            time: eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            status,
            channel: Math.random() > 0.5 ? 'A' : 'B', // Random channel for now
            capacity: evento.capacidad_meta || 50,
            attendees: Math.floor(Math.random() * (evento.capacidad_meta || 50)), // Random attendees
            downloads: Math.floor(Math.random() * 100), // Random downloads
            location: evento.bars?.address || 'Sin dirección',
            description: `Evento ${evento.titulo} en ${evento.bars?.name || 'bar'}`,
            evidences: status === 'completado' ? ['/lively-bar-event.png'] : []
          }
        })

        setEvents(transformedEvents)
        setFilteredEvents(transformedEvents)
        console.log('Events: Transformed events:', transformedEvents)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filters: { month: string; status: string; channel: string }) => {
    let filtered = events

    if (filters.month !== "all") {
      filtered = filtered.filter((event) => {
        const eventMonth = new Date(event.date).getMonth().toString()
        return eventMonth === filters.month
      })
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((event) => event.status === filters.status)
    }

    if (filters.channel !== "all") {
      filtered = filtered.filter((event) => event.channel === filters.channel)
    }

    setFilteredEvents(filtered)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Filters Skeleton */}
        <div className="flex gap-4">
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>

        {/* Events Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-muted/30 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full mb-4"></div>
              <div className="flex justify-between">
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <EventFilters onFilterChange={handleFilterChange} />

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} onClick={() => handleEventClick(event)} />
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No hay eventos</h3>
            <p className="text-muted-foreground">No se encontraron eventos con los filtros seleccionados</p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 glow-coral shadow-lg"
        onClick={() => {
          /* Handle new event */
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Event Modal */}
      {selectedEvent && <EventModal event={selectedEvent} isOpen={isModalOpen} onClose={handleCloseModal} />}
    </div>
  )
}
