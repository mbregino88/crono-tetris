import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { SortableBacklogCard } from './BacklogCard'
import { cn, formatCurrencyApproximate } from '@/lib/utils'
import type { Deal, SummaryStats } from '@/lib/types'

interface BacklogStripProps {
  deals: Deal[]
  searchTerm: string
  className?: string
  onDealClick?: (deal: Deal) => void
}

export function BacklogStrip({ deals, searchTerm, className, onDealClick }: BacklogStripProps) {
  const { isOver, setNodeRef } = useDroppable({ id: 'backlog' })
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Calculate backlog statistics
  const stats: SummaryStats = {
    count: deals.length,
    volume: deals.reduce((sum, deal) => sum + (deal.oferta_base || deal.volume_liquidado || 0), 0),
    revenue: deals.reduce((sum, deal) => sum + (deal.receita_potencial || 0), 0)
  }

  return (
    <div className={cn("bg-background border-b shadow-sm w-full", className)}>
      <div className="px-4 py-4">
        {/* Backlog Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-foreground">Backlog</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="font-medium"># {stats.count}</span>
              <span className="text-muted-foreground/50">|</span>
              <span className="text-green-600 font-medium">
                {formatCurrencyApproximate(stats.volume)}
              </span>
              <span className="text-muted-foreground/50">|</span>
              <span className="text-purple-600 font-medium">
                {formatCurrencyApproximate(stats.revenue)}
              </span>
            </div>
          </div>
          
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Backlog Cards Container - Collapsible */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isCollapsed ? "max-h-0" : "max-h-96"
          )}
        >
          <div
            ref={setNodeRef}
            className={cn(
              "relative min-h-[120px] rounded-lg border-2 border-dashed border-gray-200 transition-all duration-200 overflow-x-auto",
              isOver && "border-blue-400 bg-blue-50 shadow-lg scale-102"
            )}
          >
            {deals.length === 0 ? (
              <div className="flex items-center justify-center h-[120px] text-muted-foreground text-sm">
                <div className="text-center">
                  <div className="mb-1">🎯 Nenhum deal no backlog</div>
                  <div className="text-xs">Deals sem data aparecerão aqui</div>
                </div>
              </div>
            ) : (
              <SortableContext
                items={deals.map(d => d.deal_uuid)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex gap-3 p-3 pb-2 min-w-max">
                  {deals.map((deal) => (
                    <SortableBacklogCard
                      key={deal.deal_uuid}
                      deal={deal}
                      searchTerm={searchTerm}
                      onClick={() => onDealClick?.(deal)}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}