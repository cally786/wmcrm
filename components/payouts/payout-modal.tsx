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

  const getProgressValue = () => {
    const currentIndex = statusOrder.indexOf(payout.status)
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0
  }

  const formatPeriod = (period: string) => {
    const [year, month] = period.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  const handleGenerateReport = () => {
    // Generate PDF using browser's print functionality
    const reportData = {
      commercial: payout.commercial,
      period: formatPeriod(payout.period),
      totalAmount: payout.totalAmount,
      netAmount: payout.netAmount,
      retentions: payout.retentions,
      commissions: payout.commissions,
      status: payout.status,
      paymentDate: payout.paymentDate
    }

    // Create a new window with the report content
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para generar el reporte')
      return
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte de Payout - ${reportData.commercial}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #FF5F45;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .header h1 {
            color: #FF5F45;
            font-size: 24px;
            margin-bottom: 5px;
        }
        .header p {
            color: #666;
            font-size: 14px;
        }
        .section {
            margin: 20px 0;
            page-break-inside: avoid;
        }
        .section h3 {
            color: #FF5F45;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        .info-item.full-width {
            grid-column: span 2;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            color: #333;
        }
        .amount {
            font-weight: bold;
            color: #28a745;
        }
        .negative {
            color: #dc3545;
        }
        .commission-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 8px;
            background: white;
        }
        .commission-info h4 {
            font-size: 14px;
            margin-bottom: 4px;
        }
        .commission-info p {
            font-size: 12px;
            color: #666;
        }
        .commission-amount {
            font-weight: bold;
            color: #28a745;
        }
        .total-box {
            background: #e8f5e8;
            border: 2px solid #28a745;
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
        }
        .total-amount {
            font-size: 20px;
            font-weight: bold;
            color: #28a745;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            background: #007bff;
            color: white;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 11px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        @media print {
            body { padding: 15px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>REPORTE DE PAYOUT</h1>
        <p>Wingman CRM - Sistema de Comisiones</p>
    </div>

    <div class="section">
        <h3>Información General</h3>
        <div class="info-grid">
            <div class="info-item">
                <span class="label">Comercial:</span>
                <span class="value">${reportData.commercial}</span>
            </div>
            <div class="info-item">
                <span class="label">Período:</span>
                <span class="value">${reportData.period}</span>
            </div>
            <div class="info-item">
                <span class="label">Estado:</span>
                <span class="status-badge">${statusLabels[payout.status]}</span>
            </div>
            ${reportData.paymentDate ? `
            <div class="info-item">
                <span class="label">Fecha de Pago:</span>
                <span class="value">${new Date(reportData.paymentDate).toLocaleDateString('es-ES')}</span>
            </div>
            ` : ''}
        </div>
    </div>

    <div class="section">
        <h3>Resumen Financiero</h3>
        <div class="info-grid">
            <div class="info-item">
                <span class="label">Total Comisiones:</span>
                <span class="value amount">$${reportData.totalAmount.toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="label">Retención Fiscal:</span>
                <span class="value negative">-$${reportData.retentions.tax.toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="label">Otras Retenciones:</span>
                <span class="value negative">-$${reportData.retentions.other.toLocaleString()}</span>
            </div>
        </div>
        
        <div class="total-box">
            <div class="total-amount">Monto Neto: $${reportData.netAmount.toLocaleString()}</div>
        </div>
    </div>

    <div class="section">
        <h3>Detalle de Comisiones (${reportData.commissions.length} elementos)</h3>
        ${reportData.commissions.map(commission => `
            <div class="commission-item">
                <div class="commission-info">
                    <h4>${commission.barName}</h4>
                    <p>Tipo: ${commission.type}</p>
                </div>
                <div class="commission-amount">$${commission.amount.toLocaleString()}</div>
            </div>
        `).join('')}
    </div>

    <div class="footer">
        <p>Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
        <p>© ${new Date().getFullYear()} Wingman CRM. Todos los derechos reservados.</p>
    </div>

    <div class="no-print" style="position: fixed; top: 10px; right: 10px; z-index: 1000;">
        <button onclick="window.print()" style="background: #FF5F45; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
            📄 Guardar como PDF
        </button>
        <button onclick="window.close()" style="background: #666; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">
            ✕ Cerrar
        </button>
    </div>

</body>
</html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Auto-trigger print dialog after a short delay
    setTimeout(() => {
      printWindow.focus()
    }, 500)
  }

  const handleDownloadDetail = () => {
    // Generate detailed PDF using print window
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para generar el detalle')
      return
    }

    const detailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Detalle de Payout - ${formatPeriod(payout.period)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            color: #333;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #4A90E2;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4A90E2;
            font-size: 26px;
            margin-bottom: 8px;
        }
        .header p {
            color: #666;
            font-size: 14px;
        }
        .section {
            margin: 25px 0;
            page-break-inside: avoid;
        }
        .section-title {
            color: #4A90E2;
            font-size: 18px;
            border-bottom: 2px solid #4A90E2;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-weight: bold;
        }
        .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        .detail-item {
            background: #f8f9fa;
            border-left: 4px solid #4A90E2;
            padding: 12px;
            border-radius: 4px;
        }
        .detail-item.full-width {
            grid-column: span 2;
        }
        .detail-label {
            font-weight: bold;
            color: #555;
            display: block;
            margin-bottom: 4px;
        }
        .detail-value {
            color: #333;
            font-size: 16px;
        }
        .amount-positive {
            color: #28a745;
            font-weight: bold;
        }
        .amount-negative {
            color: #dc3545;
            font-weight: bold;
        }
        .commission-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .commission-table th {
            background: #4A90E2;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }
        .commission-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
        }
        .commission-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .commission-table tr:hover {
            background: #e9ecef;
        }
        .status-section {
            background: linear-gradient(135deg, #e3f2fd, #f8f9fa);
            border: 1px solid #4A90E2;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            background: #4A90E2;
            color: white;
            font-size: 14px;
        }
        .summary-box {
            background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
            border: 2px solid #28a745;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .summary-amount {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            text-align: center;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 11px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        @media print {
            body { padding: 15px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>DETALLE COMPLETO DE PAYOUT</h1>
        <p>Wingman CRM - Análisis Detallado de Comisiones</p>
    </div>

    <div class="section">
        <div class="section-title">📊 Información General</div>
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Comercial:</span>
                <span class="detail-value">${payout.commercial}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Período:</span>
                <span class="detail-value">${formatPeriod(payout.period)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">ID de Payout:</span>
                <span class="detail-value">${payout.id}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Total de Comisiones:</span>
                <span class="detail-value">${payout.commissions.length} elementos</span>
            </div>
            ${payout.paymentDate ? `
            <div class="detail-item">
                <span class="detail-label">Fecha de Pago:</span>
                <span class="detail-value">${new Date(payout.paymentDate).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Método de Pago:</span>
                <span class="detail-value">Transferencia Bancaria</span>
            </div>
            ` : ''}
        </div>
        
        <div class="status-section">
            <span class="status-badge">${statusLabels[payout.status]}</span>
            <p style="margin-top: 10px; color: #666;">Estado actual del pago</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">💰 Resumen Financiero Detallado</div>
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Total Bruto:</span>
                <span class="detail-value amount-positive">$${payout.totalAmount.toLocaleString()} COP</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Retención Fiscal:</span>
                <span class="detail-value amount-negative">-$${payout.retentions.tax.toLocaleString()} COP</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Otras Retenciones:</span>
                <span class="detail-value amount-negative">-$${payout.retentions.other.toLocaleString()} COP</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Porcentaje Retención:</span>
                <span class="detail-value">${((payout.retentions.tax + payout.retentions.other) / payout.totalAmount * 100).toFixed(1)}%</span>
            </div>
        </div>
        
        <div class="summary-box">
            <div class="summary-amount">Monto Neto Final: $${payout.netAmount.toLocaleString()} COP</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">📋 Detalle de Comisiones por Establecimiento</div>
        <table class="commission-table">
            <thead>
                <tr>
                    <th>Establecimiento</th>
                    <th>Tipo de Comisión</th>
                    <th>Monto</th>
                    <th>% del Total</th>
                </tr>
            </thead>
            <tbody>
                ${payout.commissions.map(commission => {
                  const percentage = (commission.amount / payout.totalAmount * 100).toFixed(1)
                  return `
                    <tr>
                        <td><strong>${commission.barName}</strong></td>
                        <td>${commission.type}</td>
                        <td class="amount-positive">$${commission.amount.toLocaleString()}</td>
                        <td>${percentage}%</td>
                    </tr>
                  `
                }).join('')}
            </tbody>
        </table>
    </div>

    ${payout.paymentProof ? `
    <div class="section">
        <div class="section-title">📄 Documentación</div>
        <div class="detail-item full-width">
            <span class="detail-label">Comprobante de Pago:</span>
            <span class="detail-value">${payout.paymentProof}</span>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p><strong>Documento generado automáticamente</strong></p>
        <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
        <p>© ${new Date().getFullYear()} Wingman CRM. Todos los derechos reservados.</p>
        <p>Este documento contiene información confidencial y está destinado únicamente al comercial autorizado.</p>
    </div>

    <div class="no-print" style="position: fixed; top: 10px; right: 10px; z-index: 1000;">
        <button onclick="window.print()" style="background: #4A90E2; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
            📄 Guardar como PDF
        </button>
        <button onclick="window.close()" style="background: #666; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">
            ✕ Cerrar
        </button>
    </div>

</body>
</html>
    `

    printWindow.document.write(detailContent)
    printWindow.document.close()
    
    // Auto-trigger print dialog after a short delay
    setTimeout(() => {
      printWindow.focus()
    }, 500)
  }

  const handleDownloadProof = () => {
    if (!payout.paymentProof) return
    
    // Generate PDF-style receipt using print window
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para descargar el comprobante')
      return
    }

    const receiptContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Comprobante de Pago - ${formatPeriod(payout.period)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', monospace;
            line-height: 1.4;
            color: #333;
            padding: 30px;
            background: white;
            max-width: 600px;
            margin: 0 auto;
        }
        .receipt-header {
            text-align: center;
            border: 2px solid #333;
            padding: 20px;
            margin-bottom: 25px;
            background: #f8f9fa;
        }
        .receipt-header h1 {
            font-size: 18px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .receipt-header p {
            font-size: 12px;
            color: #666;
        }
        .receipt-body {
            border: 1px solid #333;
            padding: 20px;
        }
        .receipt-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dotted #ccc;
        }
        .receipt-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 16px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #333;
        }
        .label {
            font-weight: bold;
        }
        .value {
            text-align: right;
        }
        .receipt-footer {
            text-align: center;
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
            font-size: 11px;
            color: #666;
        }
        .stamp {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            border: 3px double #333;
            background: #f0f8f0;
        }
        .stamp .status {
            font-size: 20px;
            font-weight: bold;
            color: #28a745;
        }
        @media print {
            body { padding: 15px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="receipt-header">
        <h1>COMPROBANTE DE PAGO</h1>
        <p>WINGMAN CRM - SISTEMA DE COMISIONES</p>
        <p>Documento Oficial de Pago</p>
    </div>

    <div class="receipt-body">
        <div class="receipt-row">
            <span class="label">COMERCIAL:</span>
            <span class="value">${payout.commercial}</span>
        </div>
        <div class="receipt-row">
            <span class="label">PERÍODO:</span>
            <span class="value">${formatPeriod(payout.period)}</span>
        </div>
        <div class="receipt-row">
            <span class="label">FECHA DE PAGO:</span>
            <span class="value">${payout.paymentDate ? new Date(payout.paymentDate).toLocaleDateString('es-ES') : 'N/A'}</span>
        </div>
        <div class="receipt-row">
            <span class="label">REFERENCIA:</span>
            <span class="value">WM-${payout.id.toUpperCase()}-${Date.now().toString().slice(-6)}</span>
        </div>
        <div class="receipt-row">
            <span class="label">MÉTODO DE PAGO:</span>
            <span class="value">Transferencia Bancaria</span>
        </div>
        <div class="receipt-row">
            <span class="label">MONTO PAGADO:</span>
            <span class="value">$${payout.netAmount.toLocaleString()} COP</span>
        </div>
    </div>

    <div class="stamp">
        <div class="status">✓ PAGADO</div>
        <p>Transacción Completada Exitosamente</p>
    </div>

    <div class="receipt-footer">
        <p><strong>Documento generado automáticamente</strong></p>
        <p>Fecha de emisión: ${new Date().toLocaleDateString('es-ES')} - ${new Date().toLocaleTimeString('es-ES')}</p>
        <p>© ${new Date().getFullYear()} Wingman CRM. Todos los derechos reservados.</p>
        <p>Este comprobante es válido como prueba de pago oficial</p>
        <p>Archivo original: ${payout.paymentProof}</p>
    </div>

    <div class="no-print" style="position: fixed; top: 10px; right: 10px; z-index: 1000;">
        <button onclick="window.print()" style="background: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px; font-size: 12px;">
            💾 Descargar PDF
        </button>
        <button onclick="window.close()" style="background: #666; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
            ✕ Cerrar
        </button>
    </div>
</body>
</html>
    `

    printWindow.document.write(receiptContent)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.focus()
    }, 500)
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

          {/* Right Side - Commercial Actions */}
          <div className="space-y-6">
            {/* Payment Proof (Read-Only for Commercial) */}
            {payout.paymentProof && (
              <Card className="glassmorphism border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Receipt className="h-5 w-5 mr-2 text-primary" />
                    Comprobante de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-success/10 border border-success/20">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">Comprobante disponible</div>
                      <div className="text-sm text-muted-foreground">{payout.paymentProof}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleDownloadProof}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Commercial Actions */}
            <Card className="glassmorphism border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent" onClick={handleGenerateReport}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>

                <Button variant="outline" className="w-full bg-transparent" onClick={handleDownloadDetail}>
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
