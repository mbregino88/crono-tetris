import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

interface DroppableColumnProps {
  id: string
  monthKey: string
  children: React.ReactNode
  className?: string
}

export function DroppableColumn({ monthKey, children, className }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ 
    id: `column-${monthKey}`,
    data: {
      type: 'column',
      monthKey
    }
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative',
        isOver && 'bg-blue-50',
        className
      )}
    >
      {/* Visual indicator for column drop */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50/50 z-10 pointer-events-none">
          <div className="flex items-center justify-center h-full">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs font-medium">
              Soltar aqui para {monthKey}
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}