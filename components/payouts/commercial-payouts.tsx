"use client"

import { useState, useEffect } from "react"
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PayoutModal } from "./payout-modal"
import { Calendar, DollarSign, TrendingUp, Clock, Download } from "lucide-react"
import type { Payout } from "./payouts-calendar"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const mockCommercialPayouts: Payout[] = [
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
    status: "PROCESANDO",
  },
  {
    id: "2",
    commercial: "Juan Pérez",
    period: "2024-11",
    totalAmount: 1890000,
    commissions: [
      { id: "5", type: "A_BASE", amount: 150000, barName: "Bar Zona Rosa" },
      { id: "6", type: "B", amount: 200000, barName: "Bar Premium" },
    ],
    retentions: { tax: 189000, other: 30000 },
    netAmount: 1671000,
    status: "PAGADO",
    paymentDate: "2024-11-26",
    paymentProof: "comprobante_nov.pdf",
  },
  {
    id: "3",
    commercial: "Juan Pérez",
    period: "2024-10",
    totalAmount: 1650000,
    commissions: [
      { id: "7", type: "A_BASE", amount: 150000, barName: "Bar Norte" },
      { id: "8", type: "A_BONO", amount: 75000, barName: "Bar Norte" },
    ],
    retentions: { tax: 165000, other: 25000 },
    netAmount: 1460000,
    status: "PAGADO",
    paymentDate: "2024-10-26",
    paymentProof: "comprobante_oct.pdf",
  },
]

const statusColors = {
  PENDIENTE: "bg-pending text-black",
  PROCESANDO: "bg-info text-white",
  PAGADO: "bg-success text-white",
  RECHAZADO: "bg-destructive text-white",
}

const statusLabels = {
  PENDIENTE: "Pendiente",
  PROCESANDO: "Procesando",
  PAGADO: "Pagado",
  RECHAZADO: "Rechazado",
}

const statusOrder = ["PENDIENTE", "PROCESANDO", "PAGADO"]

export function CommercialPayouts() {
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [paidPayouts, setPaidPayouts] = useState(0)

  useEffect(() => {
    fetchPayouts()
  }, [])

  async function fetchPayouts() {
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
            .select('id, nombre')
            .eq('email', user.email)
            .single()
          
          comercialId = comercialData?.id
        }

        console.log('Payouts: Using comercial ID:', comercialId)
      } else {
        // No user authenticated - use demo data
        console.warn('Payouts: No user authenticated - using demo comercial Test User Nuevo')
        comercialId = 'a69aa47e-4b3f-4b57-8de0-b625b2e6f2be'
      }

      if (!comercialId) {
        console.error('Payouts: No comercial found')
        return
      }

      // Get commissions for this comercial grouped by month
      const { data: commissionsData } = await supabase
        .from('comision')
        .select(`
          id,
          tipo,
          estado,
          monto_bruto,
          monto_neto,
          causado_at,
          validado_at,
          referencia_entidad,
          bars(name)
        `)
        .eq('comercial_id', comercialId)
        .order('causado_at', { ascending: false })

      console.log('Payouts: Commissions data:', commissionsData)

      if (commissionsData) {
        // Group commissions by month/year for payouts
        const payoutGroups: { [key: string]: any[] } = {}
        
        commissionsData.forEach(commission => {
          const date = new Date(commission.causado_at)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          
          if (!payoutGroups[monthKey]) {
            payoutGroups[monthKey] = []
          }
          payoutGroups[monthKey].push(commission)
        })

        // Transform to Payout format
        const transformedPayouts: Payout[] = Object.entries(payoutGroups).map(([period, commissions]) => {
          const totalAmount = commissions.reduce((sum, c) => sum + (c.monto_bruto || 0), 0)
          const netAmount = commissions.reduce((sum, c) => sum + (c.monto_neto || 0), 0)
          const retentions = { tax: totalAmount - netAmount, other: 0 }

          // Determine overall status
          const allPaid = commissions.every(c => c.estado === 'PAGADA')
          const anyProcessing = commissions.some(c => c.estado === 'POR_PAGAR' || c.estado === 'VALIDADA')
          let status: Payout['status'] = 'PENDIENTE'
          
          if (allPaid) {
            status = 'PAGADO'
          } else if (anyProcessing) {
            status = 'PROCESANDO'
          }

          // Map commission types
          const mappedCommissions = commissions.map(c => ({
            id: c.id,
            type: c.tipo === 'AFILIACION_EVENTO_BASE' ? 'A_BASE' : 
                  c.tipo === 'AFILIACION_EVENTO_BONO' ? 'A_BONO' :
                  c.tipo === 'AFILIACION_DIRECTA' ? 'B' : 'RENOVACION',
            amount: c.monto_neto || 0,
            barName: c.bars?.name || 'Bar sin nombre'
          }))

          const [year, month] = period.split('-')
          const isCurrentMonth = period === '2024-12'
          
          return {
            id: period,
            commercial: 'Test User Nuevo',
            period,
            totalAmount,
            commissions: mappedCommissions,
            retentions,
            netAmount,
            status,
            paymentDate: status === 'PAGADO' ? `${year}-${month}-26` : undefined,
            paymentProof: status === 'PAGADO' ? `comprobante_${month}_${year}.pdf` : undefined
          }
        }).sort((a, b) => b.period.localeCompare(a.period))

        setPayouts(transformedPayouts)
        
        // Calculate totals
        const totalNet = transformedPayouts.reduce((sum, p) => sum + p.netAmount, 0)
        const paidCount = transformedPayouts.filter(p => p.status === 'PAGADO').length
        
        setTotalEarnings(totalNet)
        setPaidPayouts(paidCount)
        console.log('Payouts: Transformed payouts:', transformedPayouts)
      }
    } catch (error) {
      console.error('Error fetching payouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayoutClick = (payout: Payout) => {
    setSelectedPayout(payout)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPayout(null)
  }

  const formatPeriod = (period: string) => {
    const [year, month] = period.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  const getProgressValue = (status: string) => {
    const currentIndex = statusOrder.indexOf(status)
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0
  }

  const nextPayoutDate = "26 de Diciembre, 2024"

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glassmorphism border-border/50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Ganado</span>
            </div>
            <div className="text-2xl font-bold text-primary">{loading ? "..." : `$${totalEarnings.toLocaleString()}`}</div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-sm text-muted-foreground">Payouts Pagados</span>
            </div>
            <div className="text-2xl font-bold text-success">{loading ? "..." : paidPayouts}</div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-info" />
              <span className="text-sm text-muted-foreground">Próximo Pago</span>
            </div>
            <div className="text-lg font-bold text-info">{nextPayoutDate}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts List */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-primary" />
            Historial de Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/30 animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="h-6 bg-muted rounded w-20"></div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded w-full"></div>
                </div>
              ))
            ) : payouts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No se encontraron payouts</p>
              </div>
            ) : (
              payouts.map((payout) => (
              <div
                key={payout.id}
                className="p-4 rounded-lg bg-muted/30 transition-wingman hover:bg-muted/50 cursor-pointer"
                onClick={() => handlePayoutClick(payout)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground capitalize">Payout {formatPeriod(payout.period)}</h3>
                    <p className="text-sm text-muted-foreground">{payout.commissions.length} comisiones incluidas</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xl font-bold text-foreground">${payout.netAmount.toLocaleString()}</div>
                    <Badge className={statusColors[payout.status]}>{statusLabels[payout.status]}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Pendiente</span>
                    <span>Procesando</span>
                    <span>Pagado</span>
                  </div>
                  <Progress value={getProgressValue(payout.status)} className="h-2" />
                </div>

                {payout.paymentDate && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">
                      Pagado el {new Date(payout.paymentDate).toLocaleDateString("es-ES")}
                    </span>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Comprobante
                    </Button>
                  </div>
                )}
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payout Modal */}
      {selectedPayout && <PayoutModal payout={selectedPayout} isOpen={isModalOpen} onClose={handleCloseModal} />}
    </div>
  )
}
