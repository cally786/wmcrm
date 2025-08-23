"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventInfo } from "./event-info"
import { EventEvidences } from "./event-evidences"
import { EventMetrics } from "./event-metrics"
import { EventQR } from "./event-qr"
import type { Event } from "./events-grid"

interface EventModalProps {
  event: Event
  isOpen: boolean
  onClose: () => void
}

export function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const [activeTab, setActiveTab] = useState("info")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden glassmorphism">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">{event.name}</DialogTitle>
          <p className="text-muted-foreground">{event.barName}</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 bg-muted/30">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="evidences">Evidencias</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="qr">QR</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[60vh]">
            <TabsContent value="info" className="mt-0">
              <EventInfo event={event} />
            </TabsContent>

            <TabsContent value="evidences" className="mt-0">
              <EventEvidences event={event} />
            </TabsContent>

            <TabsContent value="metrics" className="mt-0">
              <EventMetrics event={event} />
            </TabsContent>

            <TabsContent value="qr" className="mt-0">
              <EventQR event={event} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
