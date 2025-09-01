"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, User, CheckCircle, XCircle } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PendingApproval {
  id: string
  barName: string
  commercial: string
  location: string
  channel: "A" | "B"
  daysWaiting: number
  priority: "high" | "normal"
}

const priorityColors = {
  high: "bg-destructive text-destructive-foreground",
  normal: "bg-muted-foreground text-white",
}

export function PendingApprovals() {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  async function fetchPendingApprovals() {
    try {
      setLoading(true)
      
      // Since we deleted all bars from approvals, this will return empty
      // But keeping the structure for when new bars are added
      const { data: barsData, error } = await supabase
        .from('bars')
        .select('*')
        .eq('account_status', 'pending_verification')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) {
        console.error('Error fetching pending approvals:', error)
        return
      }

      const transformedApprovals: PendingApproval[] = barsData?.map(bar => {
        const createdDate = new Date(bar.created_at)
        const now = new Date()
        const daysWaiting = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24))
        
        return {
          id: bar.id,
          barName: bar.name,
          commercial: "Admin", // TODO: Connect to real comercial
          location: bar.ciudad ? `${bar.ciudad}` : "N/A",
          channel: Math.random() > 0.5 ? "A" : "B", // TODO: Add real channel field
          daysWaiting: daysWaiting,
          priority: daysWaiting > 3 ? "high" : "normal"
        }
      }) || []

      setPendingApprovals(transformedApprovals)
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
          <Clock className="h-5 w-5 mr-2 text-primary" />
          Aprobaciones Pendientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay aprobaciones pendientes</p>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  )
}