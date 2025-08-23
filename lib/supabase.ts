import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos básicos para TypeScript
export interface Comercial {
  id: string
  nombre: string
  email: string
  telefono?: string
  ciudad?: string
  activo: boolean
  fecha_ingreso: string
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  estado: 'prospecto' | 'contactado' | 'demo_programado' | 'suscripcion_activa' | 'rechazado'
  comercial_id: string
  canal: 'A' | 'B'
  fecha_registro: string
  created_at: string
  updated_at: string
}

export interface Comision {
  id: string
  comercial_id: string
  lead_id?: string
  tipo: 'A_BASE' | 'A_BONO' | 'B' | 'RENOVACION'
  valor: number
  estado: 'causada' | 'validada' | 'por_pagar' | 'pagada'
  fecha_causada: string
  fecha_pagada?: string
  descripcion?: string
  created_at: string
  updated_at: string
}

export interface Evento {
  id: string
  nombre: string
  bar_id: string
  fecha_evento: string
  hora_evento: string
  estado: 'programado' | 'en_curso' | 'completado' | 'cancelado'
  aforo_maximo: number
  aforo_actual: number
  descargas: number
  evidencias?: string[]
  comercial_id: string
  created_at: string
  updated_at: string
}