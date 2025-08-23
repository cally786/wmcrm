"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import type { Event } from "./events-grid"

interface EventMetricsProps {
  event: Event
}

const downloadData = [
  { time: "18:00", downloads: 5 },
  { time: "19:00", downloads: 12 },
  { time: "20:00", downloads: 25 },
  { time: "21:00", downloads: 18 },
  { time: "22:00", downloads: 15 },
  { time: "23:00", downloads: 8 },
]

const attendanceData = [
  { hour: "18:00", attendees: 10 },
  { hour: "19:00", attendees: 25 },
  { hour: "20:00", attendees: 45 },
  { hour: "21:00", attendees: 58 },
  { hour: "22:00", attendees: 52 },
  { hour: "23:00", attendees: 35 },
]

export function EventMetrics({ event }: EventMetricsProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glassmorphism border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{event.downloads}</div>
            <div className="text-sm text-muted-foreground">Total Descargas</div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{event.attendees}</div>
            <div className="text-sm text-muted-foreground">Asistentes</div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-info">
              {event.capacity > 0 ? Math.round((event.attendees / event.capacity) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Ocupación</div>
          </CardContent>
        </Card>
      </div>

      {/* Downloads Chart */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Descargas en Tiempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={downloadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#353535" />
              <XAxis dataKey="time" stroke="#b0b0b0" fontSize={12} />
              <YAxis stroke="#b0b0b0" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #353535",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
              />
              <Line
                type="monotone"
                dataKey="downloads"
                stroke="#ff5f45"
                strokeWidth={3}
                dot={{ fill: "#ff5f45", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Attendance Chart */}
      <Card className="glassmorphism border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Flujo de Asistentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#353535" />
              <XAxis dataKey="hour" stroke="#b0b0b0" fontSize={12} />
              <YAxis stroke="#b0b0b0" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #353535",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
              />
              <Bar dataKey="attendees" fill="#00d4aa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
