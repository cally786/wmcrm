"use client"

import type React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  id: string
  title: string
  badgeColor: string
  count: number
  children: React.ReactNode
  onDrop: (columnId: string) => void
  isDragOver: boolean
  isDropDisabled?: boolean
}

export function KanbanColumn({ id, title, badgeColor, count, children, onDrop, isDragOver, isDropDisabled = false }: KanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isDropDisabled) {
      setDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (!isDropDisabled) {
      onDrop(id)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col w-80 h-full bg-card/50 rounded-lg border border-border/50 transition-wingman",
        dragOver && isDragOver && !isDropDisabled && "ring-2 ring-primary/50 bg-primary/5",
        isDropDisabled && "opacity-60 cursor-not-allowed",
        isDropDisabled && dragOver && "ring-2 ring-destructive/50 bg-destructive/5",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <Badge className={cn("text-sm font-medium", badgeColor)}>{title}</Badge>
          <span className="text-sm text-muted-foreground">({count})</span>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {children}
        {count === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No hay bares en esta etapa</p>
          </div>
        )}
      </div>
    </div>
  )
}
