"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, Download, DollarSign, Receipt, FileText, CheckCircle } from "lucide-react"
import type { Payout } from "./payouts-calendar"

interface PayoutModalProps {
  payout: Payout
  isOpen: boolean
  onClose: () => void
}

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

export function PayoutModal({ payout, isOpen, onClose }: PayoutModalProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    // Handle file drop
  }

  const getProgressValue = () => {
    const currentIndex = statusOrder.indexOf(payout.status)
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0
  }

  const formatPeriod = (period: string) => {
    const [year, month] = period.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden glassmorphism">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">{payout.commercial}</DialogTitle>
              <p className="text-muted-foreground capitalize">Payout {formatPeriod(payout.period)}</p>
            </div>
            <Badge className={statusColors[payout.status]}>{statusLabels[payout.status]}</Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
          {/* Left Side - Payout Details */}
          <div className="space-y-6">
            {/* Summary */}
            <Card className="glassmorphism border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Comisiones:</span>
                  <span className="font-bold text-foreground">${payout.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Retención Fiscal:</span>
                  <span className="text-destructive">-${payout.retentions.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Otras Retenciones:</span>
                  <span className="text-destructive">-${payout.retentions.other.toLocaleString()}</span>
                </div>
                <div className="border-t border-border/50 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Monto Neto:</span>
                    <span className="text-xl font-bold text-success">${payout.netAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commissions Breakdown */}
            <Card className="glassmorphism border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Receipt className="h-5 w-5 mr-2 text-primary" />
                  Comisiones Incluidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payout.commissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{commission.barName}</div>
                        <div className="text-sm text-muted-foreground">{commission.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground">${commission.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Progress */}
            <Card className="glassmorphism border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Estado del Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pendiente</span>
                  <span>Procesando</span>
                  <span>Pagado</span>
                </div>
                <Progress value={getProgressValue()} className="h-3" />
                <div className="text-center">
                  <Badge className={statusColors[payout.status]}>{statusLabels[payout.status]}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Payment Actions */}
          <div className="space-y-6">
            {/* Payment Proof Upload */}
            <Card className="glassmorphism border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-primary" />
                  Comprobante de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payout.paymentProof ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-success/10 border border-success/20">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">Comprobante subido</div>
                        <div className="text-sm text-muted-foreground">comprobante_pago.pdf</div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-wingman ${
                      dragOver ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <h4 className="font-medium text-foreground mb-2">Subir Comprobante</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Arrastra el archivo aquí o haz clic para seleccionar
                    </p>
                    <Button variant="outline" size="sm">
                      Seleccionar Archivo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">PDF, JPG, PNG hasta 5MB</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Actions */}
            <Card className="glassmorphism border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {payout.status === "PENDIENTE" && (
                  <Button className="w-full bg-primary hover:bg-primary/90">Procesar Pago</Button>
                )}

                {payout.status === "PROCESANDO" && (
                  <Button className="w-full bg-success hover:bg-success/90">Marcar como Pagado</Button>
                )}

                <Button variant="outline" className="w-full bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>

                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Detalle
                </Button>
              </CardContent>
            </Card>

            {/* Payment Info */}
            {payout.paymentDate && (
              <Card className="glassmorphism border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Información de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha de Pago:</span>
                      <span className="text-foreground">
                        {new Date(payout.paymentDate).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Método:</span>
                      <span className="text-foreground">Transferencia Bancaria</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
