"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MapPin, Phone, User, Calendar } from "lucide-react"
import type { BarApproval } from "./approvals-grid"

interface ApprovalCardProps {
  approval: BarApproval
  onClick: () => void
}

const statusColors = {
  pending: "bg-pending text-black",
  approved: "bg-success text-white",
  rejected: "bg-destructive text-white",
}

const statusLabels = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
}

export function ApprovalCard({ approval, onClick }: ApprovalCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <Card
      className="glassmorphism border-border/50 transition-wingman hover:glow-coral hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground truncate">{approval.name}</h3>
            <p className="text-sm text-muted-foreground">{approval.city}</p>
          </div>
          <Badge className={statusColors[approval.status]}>{statusLabels[approval.status]}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bar Image Placeholder */}
        <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
          {approval.documents.length > 0 ? (
            <img
              src={approval.documents[0] || "/placeholder.svg"}
              alt={approval.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-muted rounded-lg mx-auto" />
              <p className="text-xs text-muted-foreground">Sin foto</p>
            </div>
          )}
        </div>

        {/* Bar Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{approval.address}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{approval.phone}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{approval.commercial}</span>
          </div>

          {approval.eventDate && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-foreground">Evento: {formatDate(approval.eventDate)}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        <div className="flex items-center justify-between w-full">
          <Badge variant={approval.channel === "A" ? "default" : "secondary"}>Canal {approval.channel}</Badge>
          <span className="text-xs text-muted-foreground">Reg: {formatDate(approval.registrationDate)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
