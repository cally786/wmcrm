import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, User, CheckCircle, XCircle } from "lucide-react"

const pendingApprovals = [
  {
    id: "1",
    barName: "Bar El Nuevo Rincón",
    commercial: "Juan Pérez",
    location: "Zona Rosa, Bogotá",
    channel: "A",
    daysWaiting: 3,
    priority: "high",
  },
  {
    id: "2",
    barName: "Cantina Central",
    commercial: "María García",
    location: "Centro, Medellín",
    channel: "B",
    daysWaiting: 1,
    priority: "normal",
  },
  {
    id: "3",
    barName: "La Terraza Premium",
    commercial: "Carlos López",
    location: "Chapinero, Bogotá",
    channel: "A",
    daysWaiting: 5,
    priority: "high",
  },
  {
    id: "4",
    barName: "Bar Nocturno",
    commercial: "Ana Rodríguez",
    location: "Poblado, Medellín",
    channel: "B",
    daysWaiting: 2,
    priority: "normal",
  },
]

const priorityColors = {
  high: "bg-destructive text-destructive-foreground",
  normal: "bg-muted-foreground text-white",
}

export function PendingApprovals() {
  return (
    <Card className="glassmorphism border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary" />
          Aprobaciones Pendientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <div
              key={approval.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-wingman hover:bg-muted/50"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-foreground">{approval.barName}</h4>
                  <Badge className={priorityColors[approval.priority as keyof typeof priorityColors]}>
                    {approval.daysWaiting}d
                  </Badge>
                  <Badge variant={approval.channel === "A" ? "default" : "secondary"}>Canal {approval.channel}</Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{approval.commercial}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{approval.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-success/20 border-success text-success hover:bg-success hover:text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-destructive/20 border-destructive text-destructive hover:bg-destructive hover:text-white"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
