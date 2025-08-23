import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

const cityData = [
  { city: "Bogotá", bars: 45, active: 38, pending: 7 },
  { city: "Medellín", bars: 28, active: 24, pending: 4 },
  { city: "Cali", bars: 19, active: 17, pending: 2 },
  { city: "Barranquilla", bars: 12, active: 11, pending: 1 },
  { city: "Cartagena", bars: 8, active: 7, pending: 1 },
]

export function GeographicMap() {
  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          Distribución Geográfica de Bares
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
