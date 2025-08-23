import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Copy, RefreshCw } from "lucide-react"
import type { Event } from "./events-grid"

interface EventQRProps {
  event: Event
}

export function EventQR({ event }: EventQRProps) {
  const qrUrl = `https://wingman.app/event/${event.id}`

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Código QR del Evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <img
                src={`/generic-qr-code.png?height=200&width=200&query=QR code for ${event.name}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
          </div>

          {/* QR URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">URL del Evento</label>
            <div className="flex space-x-2">
              <Input value={qrUrl} readOnly className="bg-input border-border" />
              <Button size="sm" variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button className="flex-1 bg-primary hover:bg-primary/90">
              <Download className="h-4 w-4 mr-2" />
              Descargar QR
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerar
            </Button>
          </div>

          {/* QR Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{event.downloads}</div>
              <div className="text-sm text-muted-foreground">Escaneos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {event.capacity > 0 ? Math.round((event.downloads / event.capacity) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Tasa de Escaneo</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
