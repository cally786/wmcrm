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
    EVENTO_TOTAL: 800000, // Con evento: 800k total
    ESTANDAR: 650000,     // Estándar: 650k total  
    RENOVACION: 200000,   // Renovación: 200k
  }

  const calculateProjections = () => {
    const conversions = (leadsPerMonth * conversionRate) / 100
    const eventoConversions = (conversions * channelAMix) / 100
    const estandarConversions = conversions - eventoConversions

    // Monthly calculations (new bars only)
    const monthlyEvento = eventoConversions * commissionRates.EVENTO_TOTAL
    const monthlyEstandar = estandarConversions * commissionRates.ESTANDAR
    const monthlyBaseCommissions = monthlyEvento + monthlyEstandar
    
    // Calculate renewals for a typical month (assuming we have bars from previous months)
    // Average monthly renewal assuming steady state after several months
    const averageMonthlyRenewals = conversions * 6 * commissionRates.RENOVACION // Assume 6 months of accumulated bars on average
    const monthlyWithRenewals = monthlyBaseCommissions + averageMonthlyRenewals

    // Annual calculation with escalating renewals
    let annualTotal = 0
    let cumulativeBars = 0

    for (let month = 1; month <= 12; month++) {
      // Add new bars this month
      const newBarsThisMonth = Math.round(conversions)
      cumulativeBars += newBarsThisMonth

      // Base commissions for new bars
      annualTotal += monthlyBaseCommissions

      // Renewal commissions for all existing bars from previous months
      if (month > 1) {
        // Each bar from previous months generates 200k renewal
        const renewalBars = cumulativeBars - newBarsThisMonth
        annualTotal += renewalBars * commissionRates.RENOVACION
      }
    }

    // Calculate renewal breakdown for display
    let renewalBreakdown = []
    let totalRenewals = 0
    
    for (let month = 1; month <= 12; month++) {
      const barsFromMonth = Math.round(conversions)
      const renewalMonths = 12 - month // How many times this month's bars will renew
      const renewalAmount = barsFromMonth * commissionRates.RENOVACION * renewalMonths
      
      if (renewalMonths > 0) {
        renewalBreakdown.push({
          month,
          bars: barsFromMonth,
          renewals: renewalMonths,
          amount: renewalAmount
        })
        totalRenewals += renewalAmount
      }
    }

    return {
      monthly: monthlyBaseCommissions,
      annual: annualTotal,
      renewalsBreakdown: renewalBreakdown,
      totalRenewals: totalRenewals,
      totalBaseCommissions: monthlyBaseCommissions * 12,
      conversions: Math.round(conversions),
      eventoConversions: Math.round(eventoConversions),
      estandarConversions: Math.round(estandarConversions),
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
                <span className="text-muted-foreground">Con Evento:</span>
                <span className="text-foreground">{projections.eventoConversions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estándar:</span>
                <span className="text-foreground">{projections.estandarConversions}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/50">
            <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="text-sm text-muted-foreground">Mensual (Nuevos bares)</div>
              <div className="text-xl font-bold text-primary">${projections.monthly.toLocaleString()}</div>
            </div>

            <div className="space-y-2 p-3 rounded-lg bg-info/10 border border-info/20">
              <div className="text-sm text-muted-foreground text-center">Desglose Anual</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Comisiones base:</span>
                  <span className="text-foreground">${projections.totalBaseCommissions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Renovaciones:</span>
                  <span className="text-foreground">${projections.totalRenewals.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="text-sm text-muted-foreground">Total Anual</div>
              <div className="text-xl font-bold text-success">${projections.annual.toLocaleString()}</div>
            </div>
          </div>

          {/* Renewal breakdown details */}
          <div className="pt-3 border-t border-border/50">
            <div className="text-xs text-muted-foreground mb-2">Renovaciones por mes de incorporación:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {projections.renewalsBreakdown.slice(0, 4).map((item) => (
                <div key={item.month} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Mes {item.month}: {item.bars} bares × {item.renewals} reno.</span>
                  <span className="text-foreground">${item.amount.toLocaleString()}</span>
                </div>
              ))}
              {projections.renewalsBreakdown.length > 4 && (
                <div className="text-xs text-muted-foreground text-center">... y {projections.renewalsBreakdown.length - 4} meses más</div>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            * Incluye escalonamiento: bares mes 1 renuevan 11 veces, mes 2 renuevan 10 veces, etc.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
