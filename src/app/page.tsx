'use client'

import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <KanbanBoard />
    </div>
  )
}