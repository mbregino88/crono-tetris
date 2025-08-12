import React, { useRef, useEffect } from 'react'
import {
  DragEndEvent,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { safeParseISO, safeFormatMonthYear, isValidDateString } from '@/lib/date-utils'
import { cn, formatCurrency, formatCurrencyApproximate } from '@/lib/utils'
import { DealCard, SortableDealCard } from './DealCard'
import { DroppableColumn } from './DroppableColumn'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Deal, GroupingField, SummaryStats } from '@/lib/types'
import type { FilterState } from '@/components/filters/FilterControls'

interface SimplifiedKanbanGridProps {
  deals: Deal[]
  allDeals: Deal[]  // Complete dataset for getting all tipo values
  groupBy: GroupingField
  isTransposed: boolean
  searchTerm: string
  stickyHorizontal: boolean
  stickyVertical: boolean
  zoomLevel: number
  wideColumns: boolean
  onDealClick?: (deal: Deal) => void
  filters: FilterState
}

interface DroppableCellProps {
  id: string
  children: React.ReactNode
  className?: string
}

function DroppableCell({ id, children, className }: DroppableCellProps) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'kanban-cell min-h-[120px] p-2 rounded-lg border-2 border-dashed border-gray-200 transition-all duration-200',
        isOver && 'bg-blue-50 border-blue-400 shadow-lg scale-102',
        className
      )}
    >
      {children}
    </div>
  )
}

export function SimplifiedKanbanGrid({
  deals,
  allDeals,
  groupBy,
  isTransposed,
  searchTerm,
  stickyHorizontal,
  stickyVertical,
  zoomLevel,
  wideColumns,
  onDealClick,
  filters
}: SimplifiedKanbanGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)


  // Organize data by rows and columns (transpose-aware)
  const organizedData = React.useMemo(() => {
    const grouped: Record<string, Record<string, Deal[]>> = {}
    
    deals.forEach((deal) => {
      let rowKey: string
      let colKey: string
      
      if (isTransposed) {
        // When transposed: rows = dates, columns = groupBy values
        rowKey = deal.data_janela
          ? safeFormatMonthYear(deal.data_janela)
          : 'Sem Data'
        colKey = String(deal[groupBy] || 'Outros')
      } else {
        // Normal: rows = groupBy values, columns = dates
        rowKey = String(deal[groupBy] || 'Outros')
        colKey = deal.data_janela
          ? safeFormatMonthYear(deal.data_janela)
          : 'Sem Data'
      }
      
      if (!grouped[rowKey]) {
        grouped[rowKey] = {}
      }
      
      if (!grouped[rowKey][colKey]) {
        grouped[rowKey][colKey] = []
      }
      
      grouped[rowKey][colKey].push(deal)
    })
    
    return grouped
  }, [deals, groupBy, isTransposed])

  // Get row keys - transpose-aware and show all tipo lanes when needed
  const rowKeys = React.useMemo(() => {
    if (isTransposed) {
      // When transposed: rows = dates (month-year keys)
      const monthSet = new Set<string>()
      
      // Add months from existing deals
      deals.forEach((deal) => {
        if (deal.data_janela) {
          const monthKey = safeFormatMonthYear(deal.data_janela)
          monthSet.add(monthKey)
        } else {
          monthSet.add('Sem Data')
        }
      })
      
      // Add months from selected filters (dataJanela filter) - this ensures selected months appear even if no deals exist
      if (filters.dataJanela && filters.dataJanela.length > 0) {
        filters.dataJanela.forEach(monthFilter => {
          try {
            // monthFilter is in format "YYYY-MM", convert to date and then to display format
            const [year, month] = monthFilter.split('-')
            const date = new Date(parseInt(year), parseInt(month) - 1, 15) // 15th of the month
            const monthKey = format(date, 'MMM-yyyy', { locale: ptBR })
            monthSet.add(monthKey)
          } catch (error) {
            console.error('🗓️ Failed to parse filter month for rows (transposed):', monthFilter, error)
          }
        })
      }
      
      return Array.from(monthSet).sort((a, b) => {
        if (a === 'Sem Data') return -1
        if (b === 'Sem Data') return 1
        try {
          // For sorting, try to find actual date from deals first, then parse the display format
          let dateA: Date
          let dateB: Date
          
          const dealWithDateA = deals.find(d => 
            d.data_janela && safeFormatMonthYear(d.data_janela) === a
          )
          const dealWithDateB = deals.find(d => 
            d.data_janela && safeFormatMonthYear(d.data_janela) === b
          )
          
          if (dealWithDateA?.data_janela) {
            dateA = safeParseISO(dealWithDateA.data_janela)
          } else {
            // Parse from display format if no deal found (this handles filter-only months)
            // Use date-fns parse with Portuguese locale to handle "dez-2025", "ago-2025" etc.
            dateA = parse(a, 'MMM-yyyy', new Date(), { locale: ptBR })
          }
          
          if (dealWithDateB?.data_janela) {
            dateB = safeParseISO(dealWithDateB.data_janela)
          } else {
            // Parse from display format if no deal found (this handles filter-only months)
            // Use date-fns parse with Portuguese locale to handle "dez-2025", "ago-2025" etc.
            dateB = parse(b, 'MMM-yyyy', new Date(), { locale: ptBR })
          }
          
          return dateA.getTime() - dateB.getTime()
        } catch {
          return a.localeCompare(b) // Fallback to string comparison
        }
      })
    } else {
      // Normal mode: rows = groupBy values
      if (groupBy === 'tipo') {
        // Show ALL possible tipo values, not just ones with deals
        const allTipoValues = new Set<string>()
        allDeals.forEach(deal => {
          const tipoValue = deal.tipo || 'Outros'
          allTipoValues.add(tipoValue)
        })
        return Array.from(allTipoValues).sort()
      } else {
        // For other groupings, only include rows that have at least one deal
        return Object.keys(organizedData).filter(key => {
          const rowDeals = Object.values(organizedData[key] || {}).flat()
          return rowDeals.length > 0
        }).sort()
      }
    }
  }, [organizedData, groupBy, allDeals, isTransposed, deals, filters])

  // Get column keys - transpose-aware
  const colKeys = React.useMemo(() => {
    if (isTransposed) {
      // When transposed: columns = groupBy values
      if (groupBy === 'tipo') {
        // Show ALL possible tipo values as columns
        const allTipoValues = new Set<string>()
        allDeals.forEach(deal => {
          const tipoValue = deal.tipo || 'Outros'
          allTipoValues.add(tipoValue)
        })
        return Array.from(allTipoValues).sort()
      } else {
        // For other groupings, only include columns that have at least one deal
        return Object.keys(organizedData).length > 0 
          ? Array.from(new Set(
              Object.values(organizedData)
                .flatMap(row => Object.keys(row))
            )).sort()
          : []
      }
    } else {
      // Normal mode: columns = dates (month-year keys)
      const monthSet = new Set<string>()
      
      // Add months from existing deals
      deals.forEach((deal) => {
        if (deal.data_janela) {
          const monthKey = safeFormatMonthYear(deal.data_janela)
          monthSet.add(monthKey)
        }
      })
      
      // Add months from selected filters (dataJanela filter) - this ensures selected months appear even if no deals exist
      if (filters.dataJanela && filters.dataJanela.length > 0) {
        filters.dataJanela.forEach(monthFilter => {
          try {
            // monthFilter is in format "YYYY-MM", convert to date and then to display format
            const [year, month] = monthFilter.split('-')
            const date = new Date(parseInt(year), parseInt(month) - 1, 15) // 15th of the month
            const monthKey = format(date, 'MMM-yyyy', { locale: ptBR })
            monthSet.add(monthKey)
          } catch (error) {
            console.error('🗓️ Failed to parse filter month:', monthFilter, error)
          }
        })
      }
      
      return Array.from(monthSet).sort((a, b) => {
        try {
          // For sorting, try to find actual date from deals first, then parse the display format
          let dateA: Date
          let dateB: Date
          
          const dealWithDateA = deals.find(d => 
            d.data_janela && safeFormatMonthYear(d.data_janela) === a
          )
          const dealWithDateB = deals.find(d => 
            d.data_janela && safeFormatMonthYear(d.data_janela) === b
          )
          
          if (dealWithDateA?.data_janela) {
            dateA = safeParseISO(dealWithDateA.data_janela)
          } else {
            // Parse from display format if no deal found (this handles filter-only months)
            // Use date-fns parse with Portuguese locale to handle "dez-2025", "ago-2025" etc.
            dateA = parse(a, 'MMM-yyyy', new Date(), { locale: ptBR })
          }
          
          if (dealWithDateB?.data_janela) {
            dateB = safeParseISO(dealWithDateB.data_janela)
          } else {
            // Parse from display format if no deal found (this handles filter-only months)
            // Use date-fns parse with Portuguese locale to handle "dez-2025", "ago-2025" etc.
            dateB = parse(b, 'MMM-yyyy', new Date(), { locale: ptBR })
          }
          
          return dateA.getTime() - dateB.getTime()
        } catch {
          return a.localeCompare(b) // Fallback to string comparison
        }
      })
    }
  }, [deals, organizedData, groupBy, allDeals, isTransposed, filters])

  // Calculate statistics
  const calculateStats = (dealsArray: Deal[]): SummaryStats => {
    const count = dealsArray.length
    const volume = dealsArray.reduce((sum, deal) => 
      sum + (deal.oferta_base || deal.volume_liquidado || 0), 0
    )
    const revenue = dealsArray.reduce((sum, deal) => 
      sum + (deal.receita_potencial || 0), 0
    )
    return { count, volume, revenue }
  }

  // Row totals
  const rowTotals = React.useMemo(() => {
    const totals: Record<string, SummaryStats> = {}
    rowKeys.forEach((rowKey) => {
      const allDeals = colKeys.flatMap(colKey => organizedData[rowKey]?.[colKey] || [])
      totals[rowKey] = calculateStats(allDeals)
    })
    return totals
  }, [organizedData, rowKeys, colKeys])

  // Column totals
  const colTotals = React.useMemo(() => {
    const totals: Record<string, SummaryStats> = {}
    colKeys.forEach((colKey) => {
      const allDeals = rowKeys.flatMap(rowKey => organizedData[rowKey]?.[colKey] || [])
      totals[colKey] = calculateStats(allDeals)
    })
    return totals
  }, [organizedData, rowKeys, colKeys])

  // Cell totals - sum of oferta_base and receita_potencial for each individual cell
  const cellTotals = React.useMemo(() => {
    const totals: Record<string, { ofertaBase: number; receitaPotencial: number }> = {}
    
    rowKeys.forEach((rowKey) => {
      colKeys.forEach((colKey) => {
        const cellDeals = organizedData[rowKey]?.[colKey] || []
        const ofertaBase = cellDeals.reduce((sum, deal) => 
          sum + (typeof deal.oferta_base === 'number' ? deal.oferta_base : 0), 0
        )
        const receitaPotencial = cellDeals.reduce((sum, deal) => 
          sum + (typeof deal.receita_potencial === 'number' ? deal.receita_potencial : 0), 0
        )
        totals[`${rowKey}-${colKey}`] = { ofertaBase, receitaPotencial }
        
        // Debug log for cells with deals
        if (cellDeals.length > 0) {
          console.log(`Cell ${rowKey}-${colKey}: ${cellDeals.length} deals, oferta_base: ${ofertaBase}, receita_potencial: ${receitaPotencial}`)
        }
      })
    })
    
    return totals
  }, [organizedData, rowKeys, colKeys])

  return (
    <div 
      className="kanban-wrapper"
      ref={wrapperRef}
      style={{
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top left',
        width: `${100 / zoomLevel}%`,
        height: `${100 / zoomLevel}%`
      }}
    >
      <div 
        className={cn(
          'kanban-grid',
          wideColumns && 'wide-columns',
          stickyHorizontal && 'sticky-horizontal',
          stickyVertical && 'sticky-vertical'
        )}
        style={{ 
          '--columns': colKeys.length.toString()
        } as React.CSSProperties}
      >
        {/* Header Row */}
        <div className="kanban-header-row">
          {/* Corner cell */}
          <div className="kanban-corner-cell text-sm font-semibold">
            {isTransposed ? `Data / ${groupBy}` : `${groupBy} / Data`}
          </div>
          
          {/* Column headers */}
          {colKeys.map((colKey) => (
            <div key={colKey} className="kanban-header-cell text-sm font-semibold">
              <div className="mb-1">{colKey}</div>
              <div className="text-xs flex items-center justify-center gap-1 opacity-75">
                <span># {colTotals[colKey]?.count || 0}</span>
                <span className="text-gray-400">|</span>
                <span className="text-green-600 font-medium">
                  {formatCurrencyApproximate(colTotals[colKey]?.volume || 0)}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-purple-600 font-medium">
                  {formatCurrencyApproximate(colTotals[colKey]?.revenue || 0)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Data Rows */}
        {rowKeys.map((rowKey) => (
          <div key={rowKey} className="kanban-data-row">
            {/* Row header */}
            <div className="kanban-row-header text-sm font-semibold">
              <div className="mb-1">{rowKey}</div>
              <div className="text-xs flex items-center justify-center gap-1 opacity-75">
                <span># {rowTotals[rowKey]?.count || 0}</span>
                <span className="text-gray-400">|</span>
                <span className="text-green-600 font-medium">
                  {formatCurrencyApproximate(rowTotals[rowKey]?.volume || 0)}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-purple-600 font-medium">
                  {formatCurrencyApproximate(rowTotals[rowKey]?.revenue || 0)}
                </span>
              </div>
            </div>

            {/* Data cells */}
            {colKeys.map((colKey) => {
              const cellDeals = organizedData[rowKey]?.[colKey] || []
              const cellId = `${rowKey}-${colKey}`
              const cellTotalData = cellTotals[cellId] || { ofertaBase: 0, receitaPotencial: 0 }

              return (
                <DroppableCell key={cellId} id={cellId}>
                  {/* Cell Summary at top center - Always show when there are deals */}
                  {cellDeals.length > 0 && (
                    <div className="text-center mb-2 text-xs bg-muted/20 rounded px-2 py-1 mx-auto w-fit border border-muted/30">
                      <div className="flex items-center gap-1 opacity-75">
                        <span># {cellDeals.length}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-green-600 font-medium">
                          {formatCurrencyApproximate(cellTotalData.ofertaBase)}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-purple-600 font-medium">
                          {formatCurrencyApproximate(cellTotalData.receitaPotencial)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <ScrollArea className="h-full">
                    <div className={cn(
                      wideColumns 
                        ? "grid grid-cols-2 gap-2" 
                        : "space-y-1"
                    )}>
                      {cellDeals.map((deal) => (
                        <SortableDealCard 
                          key={deal.deal_uuid} 
                          deal={deal} 
                          searchTerm={searchTerm}
                          onClick={() => onDealClick?.(deal)}
                        />
                      ))}
                      {cellDeals.length === 0 && (
                        <div className="text-center text-gray-400 text-xs py-8 col-span-2">
                          Nenhum deal
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DroppableCell>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}