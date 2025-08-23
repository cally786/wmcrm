"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PayoutModal } from "./payout-modal"
import { Calendar, ChevronLeft, ChevronRight, DollarSign, Users } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Payout {
  id: string
  commercial: string
  period: string
  totalAmount: number
  commissions: Array<{
    id: string
    type: string
    amount: number
    barName: string
  }>
  retentions: {
    tax: number
    other: number
  }
  netAmount: number
  status: "PENDIENTE" | "PROCESANDO" | "PAGADO" | "RECHAZADO"
  paymentDate?: string
  paymentProof?: string
}

const mockPayouts: Payout[] = [
  {
    id: "1",
    commercial: "Juan Pérez",
    period: "2024-12",
    totalAmount: 2450000,
    commissions: [
      { id: "1", type: "A_BASE", amount: 150000, barName: "Bar El Rincón" },
      { id: "2", type: "A_BONO", amount: 75000, barName: "Bar El Rincón" },
      { id: "3", type: "B", amount: 200000, barName: "Bar Central" },
      { id: "4", type: "RENOVACION", amount: 120000, barName: "La Terraza" },
    ],
    retentions: { tax: 245000, other: 50000 },
    netAmount: 2155000,
    status: "PENDIENTE",
  },
  {
    id: "2",
    commercial: "María García",
    period: "2024-12",
    totalAmount: 1890000,
    commissions: [
      { id: "5", type: "A_BASE", amount: 150000, barName: "Bar Zona Rosa" },
      { id: "6", type: "B", amount: 200000, barName: "Bar Premium" },
    ],
    retentions: { tax: 189000, other: 30000 },
    netAmount: 1671000,
    status: "PROCESANDO",
  },
]

export function PayoutsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayouts()
  }, [currentDate])

  async function fetchPayouts() {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const monthStr = month.toString().padStart(2, '0')
      
      // Get payouts for current month
      const { data: payoutsData, error } = await supabase
        .from('payout')
        .select(`
          *,
          comercial!inner(
            nombre
          )
        `)
        .eq('corte_date', `${year}-${monthStr}-26`)
      
      if (error) {
        console.error('Error fetching payouts:', error)
        return
      }

      const formattedPayouts: Payout[] = payoutsData?.map(payout => ({
        id: payout.id,
        commercial: payout.comercial.nombre,
        period: `${year}-${monthStr}`,
        totalAmount: Number(payout.monto_bruto),
        commissions: [], // TODO: Get real commission details
        retentions: {
          tax: Number(payout.monto_retenciones),
          other: 0
        },
        netAmount: Number(payout.monto_neto),
        status: payout.estado === 'PROGRAMADO' ? 'PENDIENTE' as const : 
                payout.estado === 'PAGADO' ? 'PAGADO' as const :
                payout.estado === 'CANCELADO' ? 'RECHAZADO' as const :
                'PROCESANDO' as const,
        paymentDate: payout.pagado_at,
        paymentProof: payout.comprobante_url
      })) || []

      setPayouts(formattedPayouts)
      console.log('Payouts loaded:', formattedPayouts)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  const hasPayoutActivity = (day: number) => {
    return day === 26 // Payout day
  }

  const handlePayoutClick = (payout: Payout) => {
    setSelectedPayout(payout)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPayout(null)
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const totalPayouts = payouts.reduce((sum, payout) => sum + payout.totalAmount, 0)
  const pendingPayouts = payouts.filter((p) => p.status === "PENDIENTE").length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-3">
        <Card className="glassmorphism border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-foreground flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-primary" />
                Calendario de Payouts
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold text-foreground capitalize min-w-48 text-center">
                  {formatMonth(currentDate)}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {days.map((day) => {
                const isPayoutDay = day === 26
                const hasActivity = hasPayoutActivity(day)

                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-lg border transition-wingman cursor-pointer ${
                      isPayoutDay
                        ? "bg-primary text-primary-foreground glow-coral border-primary"
                        : hasActivity
                          ? "bg-muted/50 border-border hover:bg-muted"
                          : "border-border/30 hover:bg-muted/30"
                    }`}
                  >
                    <span className={`text-sm font-medium ${isPayoutDay ? "text-white" : "text-foreground"}`}>
                      {day}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted/30">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <div className="w-3 h-3 bg-primary rounded-full glow-coral" />
                <span>Día 26: Fecha de pago oficial</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Los pagos se procesan automáticamente el día 26 de cada mes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Period Summary */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="glassmorphism border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Resumen del Período</CardTitle>
            <p className="text-sm text-muted-foreground capitalize">{formatMonth(currentDate)}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total a Pagar</span>
              </div>
              <div className="text-xl font-bold text-primary">${totalPayouts.toLocaleString()}</div>
            </div>

            <div className="text-center p-3 rounded-lg bg-pending/10 border border-pending/20">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Users className="h-4 w-4 text-pending" />
                <span className="text-sm text-muted-foreground">Pendientes</span>
              </div>
              <div className="text-xl font-bold text-pending">{pendingPayouts}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Payouts Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center text-muted-foreground">Cargando payouts...</div>
            ) : payouts.length === 0 ? (
              <div className="text-center text-muted-foreground">No hay payouts para este mes</div>
            ) : (
              payouts
                .filter((p) => p.status === "PENDIENTE")
                .map((payout) => (
                  <div
                    key={payout.id}
                    className="p-3 rounded-lg bg-muted/30 transition-wingman hover:bg-muted/50 cursor-pointer"
                    onClick={() => handlePayoutClick(payout)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{payout.commercial}</span>
                      <Badge className="bg-pending text-black">Pendiente</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">${payout.netAmount.toLocaleString()}</div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payout Modal */}
      {selectedPayout && <PayoutModal payout={selectedPayout} isOpen={isModalOpen} onClose={handleCloseModal} />}
    </div>
  )
}
