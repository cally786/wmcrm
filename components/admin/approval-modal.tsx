"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, User, Calendar, Hash } from "lucide-react"
import type { BarApproval } from "./approvals-grid"

interface ApprovalModalProps {
  approval: BarApproval
  isOpen: boolean
  onClose: () => void
  onUpdate: (approval: BarApproval) => void
}

export function ApprovalModal({ approval, isOpen, onClose, onUpdate }: ApprovalModalProps) {
  const [isApproved, setIsApproved] = useState(approval.status === "approved")
  const [channelAuthorized, setChannelAuthorized] = useState(true)
  const [rejectionReason, setRejectionReason] = useState(approval.rejectionReason || "")

  const handleSave = () => {
    const updatedApproval: BarApproval = {
      ...approval,
      status: isApproved ? "approved" : "rejected",
      rejectionReason: !isApproved ? rejectionReason : undefined,
    }

    onUpdate(updatedApproval)
    onClose()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden glassmorphism">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">{approval.name}</DialogTitle>
          <p className="text-muted-foreground">Revisión de aprobación</p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[60vh]">
          {/* Left Side - Bar Information */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Información del Bar</h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                  <p className="text-foreground font-medium">{approval.name}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">NIT</label>
                  <p className="text-foreground">{approval.nit}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <p className="text-foreground">
                      {approval.address}, {approval.city}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <p className="text-foreground">{approval.phone}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <p className="text-foreground">{approval.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary" />
                    <p className="text-foreground">{approval.contact}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Comercial Asignado</label>
                  <p className="text-foreground font-medium">{approval.commercial}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Canal Propuesto</label>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-primary" />
                    <Badge variant={approval.channel === "A" ? "default" : "secondary"}>Canal {approval.channel}</Badge>
                  </div>
                </div>

                {approval.eventDate && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Fecha de Evento</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <p className="text-foreground">{formatDate(approval.eventDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Documentos</h3>
              <div className="grid grid-cols-2 gap-4">
                {approval.documents.map((doc, index) => (
                  <div key={index} className="aspect-square bg-muted/30 rounded-lg overflow-hidden">
                    <img
                      src={doc || "/placeholder.svg"}
                      alt={`Documento ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Acciones de Aprobación</h3>

            <div className="space-y-6">
              {/* Approve Bar Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground">Aprobar Bar</h4>
                  <p className="text-sm text-muted-foreground">Autorizar el registro del bar en la plataforma</p>
                </div>
                <Switch
                  checked={isApproved}
                  onCheckedChange={setIsApproved}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* Channel Authorization Toggle */}
              {isApproved && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="space-y-1">
                    <h4 className="font-medium text-foreground">Autorizar Canal {approval.channel}</h4>
                    <p className="text-sm text-muted-foreground">Permitir el uso del canal propuesto</p>
                  </div>
                  <Switch
                    checked={channelAuthorized}
                    onCheckedChange={setChannelAuthorized}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              )}

              {/* Rejection Reason */}
              {!isApproved && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Motivo de Rechazo</label>
                  <Textarea
                    placeholder="Describe el motivo del rechazo..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="bg-input border-border min-h-24"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90">
                  Guardar
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
