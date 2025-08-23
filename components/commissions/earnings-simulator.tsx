"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Calculator, TrendingUp } from "lucide-react"

export function EarningsSimulator() {
  const [leadsPerMonth, setLeadsPerMonth] = useState(20)
  const [conversionRate, setConversionRate] = useState(25)
  const [channelAMix, setChannelAMix] = useState(60)

  // Commission rates (in COP)
  const commissionRates = {
    EVENTO_BASE: 150000, // Changed from A_BASE
    EVENTO_BONO: 75000, // Changed from A_BONO
    ESTANDAR: 200000, // Changed from B
    RENOVACION: 120000,
  }

  const calculateProjections = () => {
    const conversions = (leadsPerMonth * conversionRate) / 100
    const eventoConversions = (conversions * channelAMix) / 100 // Renamed variable
    const estandarConversions = conversions - eventoConversions // Renamed variable

    // Monthly calculations
    const monthlyEvento = eventoConversions * (commissionRates.EVENTO_BASE + commissionRates.EVENTO_BONO * 0.5) // Updated calculation
    const monthlyEstandar = estandarConversions * commissionRates.ESTANDAR // Updated calculation
    const monthlyRenewals = conversions * 0.8 * commissionRates.RENOVACION

    const monthlyTotal = monthlyEvento + monthlyEstandar + monthlyRenewals
    const annualTotal = monthlyTotal * 12

    return {
      monthly: monthlyTotal,
      annual: annualTotal,
      conversions: Math.round(conversions),
      eventoConversions: Math.round(eventoConversions), // Renamed
      estandarConversions: Math.round(estandarConversions), // Renamed
    }
  }

  const projections = calculateProjections()

  return (
    <Card className="glassmorphism border-border/50 sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-primary" />
          Simulador de Ganancias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Leads esperados por mes</Label>
            <Input
              type="number"
              value={leadsPerMonth}
              onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">% Conversión estimado</Label>
            <div className="px-2">
              <Slider
                value={[conversionRate]}
                onValueChange={(value) => setConversionRate(value[0])}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">{conversionRate}%</div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Mix Con Evento/Estándar</Label> {/* Updated label */}
            <div className="px-2">
              <Slider
                value={[channelAMix]}
                onValueChange={(value) => setChannelAMix(value[0])}
                max={100}
                step={10}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Con Evento: {channelAMix}%</span> {/* Updated label */}
              <span>Estándar: {100 - channelAMix}%</span> {/* Updated label */}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-primary" />
              Proyección
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conversiones/mes:</span>
                <span className="text-foreground font-medium">{projections.conversions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Con Evento:</span> {/* Updated label */}
                <span className="text-foreground">{projections.eventoConversions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estándar:</span> {/* Updated label */}
                <span className="text-foreground">{projections.estandarConversions}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/50">
            <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="text-sm text-muted-foreground">Mensual</div>
              <div className="text-xl font-bold text-primary">${projections.monthly.toLocaleString()}</div>
            </div>

            <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="text-sm text-muted-foreground">Anual</div>
              <div className="text-xl font-bold text-success">${projections.annual.toLocaleString()}</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            * Proyección basada en tasas históricas de comisión y renovación
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
