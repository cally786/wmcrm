"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CityData {
  city: string
  bars: number
  active: number
  pending: number
}

export function GeographicMap() {
  const [cityData, setCityData] = useState<CityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGeographicData()
  }, [])

  async function fetchGeographicData() {
    try {
      setLoading(true)
      
      // Since we deleted all bars, this will return empty but structure is ready
      const { data: barsData, error } = await supabase
        .from('bars')
        .select('ciudad, account_status')
      
      if (error) {
        console.error('Error fetching geographic data:', error)
        return
      }

      // Group by city and count status
      const cityGroups: { [key: string]: { active: number; pending: number } } = {}
      
      barsData?.forEach(bar => {
        const city = bar.ciudad || 'Sin ciudad'
        if (!cityGroups[city]) {
          cityGroups[city] = { active: 0, pending: 0 }
        }
        
        if (bar.account_status === 'active') {
          cityGroups[city].active++
        } else if (bar.account_status === 'pending_verification') {
          cityGroups[city].pending++
        }
      })

      const transformedData: CityData[] = Object.entries(cityGroups)
        .map(([city, counts]) => ({
          city,
          bars: counts.active + counts.pending,
          active: counts.active,
          pending: counts.pending
        }))
        .sort((a, b) => b.bars - a.bars)
        .slice(0, 5)

      setCityData(transformedData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          Distribución Geográfica de Bares
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/30 animate-pulse">
                <div className="h-6 bg-muted rounded w-20 mx-auto mb-2"></div>
                <div className="h-8 bg-muted rounded w-10 mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : cityData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay datos geográficos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {cityData.map((city, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted/30 transition-wingman hover:bg-muted/50 text-center">
              <h3 className="font-semibold text-foreground mb-2">{city.city}</h3>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">{city.bars}</div>
                <div className="text-xs text-muted-foreground">Total Bares</div>
                <div className="flex justify-center space-x-2">
                  <Badge className="bg-success text-white text-xs">{city.active} Activos</Badge>
                  {city.pending > 0 && (
                    <Badge className="bg-pending text-black text-xs">{city.pending} Pendientes</Badge>
                  )}
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
