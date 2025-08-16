'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { safeParseISO, safeFormatMonthYear, isValidDateString } from '@/lib/date-utils'
import { fetchDeals, updateDeal, updateBacklogOrder } from '@/lib/supabase'
import { logObjectChanges } from '@/lib/audit'
import { searchAndFilterDeals } from '@/lib/search'
import { FilterControls, type FilterState } from '@/components/filters/FilterControls'
import { 
  shouldApplyStandardView, 
  markStandardViewApplied, 
  getStandardViewDefaults,
  generateDefaultDateFilter,
  loadUserPreferences,
  useUserPreferences
} from '@/lib/user-preferences'
import { BacklogStrip } from '@/components/backlog/BacklogStrip'
import { ConsolidatedNavBar } from '@/components/layout/ConsolidatedNavBar'
import { CollapsibleSection } from '@/components/layout/CollapsibleSection'
import { AddDealDialog } from '@/components/dialogs/AddDealDialog'
import { DealDetailsModal } from '@/components/modals/DealDetailsModal'
import { ZoomControls } from '@/components/controls/ZoomControls'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { SimplifiedKanbanGrid } from './SimplifiedKanbanGrid'
import { DealCard } from './DealCard'
import type { Deal, GroupingField, SummaryStats } from '@/lib/types'


export function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filters, setFilters] = useState<FilterState>({
    dataJanela: [],
    indexador: [],
    tipo: [],
    tipoNovo: [],
    veiculo: [],
    produto: [],
    gestora: [],
    setor: [],
    tipoCota: []
  })
  const [groupBy, setGroupBy] = useState<GroupingField>('tipo')
  const [stickyHorizontal] = useState(false)
  const [stickyVertical] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTransposed, setIsTransposed] = useState(false)
  const [wideColumns, setWideColumns] = useState(false)
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const { preferences, updatePreferences, mounted: preferencesLoaded } = useUserPreferences()
  const [showAddDealDialog, setShowAddDealDialog] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showDealModal, setShowDealModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Refs for scroll synchronization
  const headersContainerRef = React.useRef<HTMLDivElement>(null)
  const rowsContainerRef = React.useRef<HTMLDivElement>(null)
  const contentContainerRef = React.useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )

  // Handle mounting for hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Apply standard view settings immediately on mount
  useEffect(() => {
    if (!mounted) return
    
    // Check and apply standard view without waiting for preferencesLoaded
    const checkAndApplyStandardView = () => {
      if (shouldApplyStandardView()) {
        const defaults = getStandardViewDefaults()
        
        // Apply default settings immediately
        if (defaults.zoomLevel) setZoomLevel(defaults.zoomLevel)
        if (defaults.wideColumns !== undefined) setWideColumns(defaults.wideColumns)
        if (defaults.sectionsCollapsed?.filters !== undefined) {
          setFiltersCollapsed(defaults.sectionsCollapsed.filters)
        }
        
        // Apply default date filter
        if (defaults.defaultDateFilter) {
          setFilters(prev => ({
            ...prev,
            dataJanela: defaults.defaultDateFilter!
          }))
        }
        
        // Mark as applied and save preferences
        markStandardViewApplied()
        if (preferencesLoaded) {
          updatePreferences(defaults)
        }
        
        console.log('✅ Applied standard view for first-time user')
      } else {
        // Load existing preferences for returning users
        const currentPrefs = loadUserPreferences()
        if (currentPrefs.zoomLevel !== 1.0) setZoomLevel(currentPrefs.zoomLevel)
        if (currentPrefs.wideColumns) setWideColumns(currentPrefs.wideColumns)
        if (currentPrefs.sectionsCollapsed?.filters !== undefined) {
          setFiltersCollapsed(currentPrefs.sectionsCollapsed.filters)
        }
      }
    }
    
    // Apply immediately
    checkAndApplyStandardView()
  }, [mounted, preferencesLoaded, updatePreferences])

  // Load deals
  useEffect(() => {
    loadDeals()
  }, [])

  // Enhanced scroll synchronization with throttling
  useEffect(() => {
    const headersContainer = headersContainerRef.current
    const rowsContainer = rowsContainerRef.current
    const contentContainer = contentContainerRef.current

    if (!headersContainer || !rowsContainer || !contentContainer) return

    let isScrolling = false
    
    // Throttled scroll handler to improve performance
    const throttleScroll = (fn: () => void) => {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          fn()
          isScrolling = false
        })
        isScrolling = true
      }
    }

    const handleContentScroll = () => {
      throttleScroll(() => {
        const { scrollLeft, scrollTop } = contentContainer
        
        // Sync horizontal scroll with headers (pixel-perfect)
        if (Math.abs(headersContainer.scrollLeft - scrollLeft) > 1) {
          headersContainer.scrollLeft = scrollLeft
        }
        
        // Sync vertical scroll with rows (pixel-perfect)
        if (Math.abs(rowsContainer.scrollTop - scrollTop) > 1) {
          rowsContainer.scrollTop = scrollTop
        }
      })
    }

    const handleHeadersScroll = () => {
      throttleScroll(() => {
        const { scrollLeft } = headersContainer
        if (Math.abs(contentContainer.scrollLeft - scrollLeft) > 1) {
          contentContainer.scrollLeft = scrollLeft
        }
      })
    }

    const handleRowsScroll = () => {
      throttleScroll(() => {
        const { scrollTop } = rowsContainer
        if (Math.abs(contentContainer.scrollTop - scrollTop) > 1) {
          contentContainer.scrollTop = scrollTop
        }
      })
    }

    // Add scroll event listeners with passive option for better performance
    contentContainer.addEventListener('scroll', handleContentScroll, { passive: true })
    headersContainer.addEventListener('scroll', handleHeadersScroll, { passive: true })
    rowsContainer.addEventListener('scroll', handleRowsScroll, { passive: true })

    return () => {
      contentContainer.removeEventListener('scroll', handleContentScroll)
      headersContainer.removeEventListener('scroll', handleHeadersScroll)
      rowsContainer.removeEventListener('scroll', handleRowsScroll)
    }
  }, [mounted])

  const loadDeals = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true)
    setError(null)
    try {
      const data = await fetchDeals()
      setDeals(data)
      
      if (data.length === 0) {
        setError('No deals found in database. The deals table may be empty or not exist.')
      }
    } catch (error) {
      console.error('💥 KanbanBoard: Failed to load deals:', error)
      setError(`Failed to load deals: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setDeals([])
    } finally {
      if (showLoadingState) setLoading(false)
    }
  }

  // Refresh function for manual sync
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadDeals(false) // Don't show full loading state
    setIsRefreshing(false)
  }

  // Helper functions for robust backlog detection
  const isDataJanelaNullOrBlank = (dataJanela: string | null | undefined): boolean => {
    return (
      dataJanela === null ||
      dataJanela === undefined ||
      dataJanela === '' ||
      (typeof dataJanela === 'string' && dataJanela.trim() === '') ||
      dataJanela === 'null' ||  // String "null" from API
      dataJanela === 'undefined' // String "undefined" from API
    )
  }

  const isValidDate = (dateString: string): boolean => {
    return isValidDateString(dateString)
  }

  // Filter deals based on search term and filters
  const filteredDeals = useMemo(() => {
    return searchAndFilterDeals(deals, searchTerm, filters)
  }, [deals, searchTerm, filters])

  // Separate backlog deals (status-based) from dated deals  
  const { backlogDeals, datedDeals } = useMemo(() => {
    const backlog: Deal[] = []
    const dated: Deal[] = []
    
    filteredDeals.forEach(deal => {
      // Deals go to backlog if they have 'Pre-Leitura', 'Leitura', or 'Backlog' status
      // OR if they don't have a valid date
      const isBacklogStatus = deal.status_deal === 'Pre-Leitura' || 
                              deal.status_deal === 'Backlog' || 
                              deal.status_deal === 'Leitura'
      const hasNoValidDate = isDataJanelaNullOrBlank(deal.data_janela) || 
                             (deal.data_janela && !isValidDate(deal.data_janela))
      
      if (isBacklogStatus || hasNoValidDate) {
        backlog.push(deal)
      } else {
        dated.push(deal)
      }
    })
    
    return { backlogDeals: backlog, datedDeals: dated }
  }, [filteredDeals])

  // Organize data by rows and columns (only dated deals)
  const organizedData = useMemo(() => {
    const grouped: Record<string, Record<string, Deal[]>> = {}
    
    datedDeals.forEach((deal) => {
      const rowKey = String(deal[groupBy] || 'Outros')
      
      const colKey = deal.data_janela
        ? safeFormatMonthYear(deal.data_janela)
        : 'Sem Data' // This shouldn't happen since we filtered out undated deals
      
      if (!grouped[rowKey]) {
        grouped[rowKey] = {}
      }
      
      if (!grouped[rowKey][colKey]) {
        grouped[rowKey][colKey] = []
      }
      
      grouped[rowKey][colKey].push(deal)
    })
    
    return grouped
  }, [datedDeals, groupBy])

  // Get row keys (sectors/groups) - show all lanes for the selected groupBy field
  const rowKeys = useMemo(() => {
    if (groupBy === 'tipo') {
      // When grouping by 'tipo', show ALL possible tipo values, not just ones with deals
      const allTipoValues = new Set<string>()
      
      // Get all tipo values from the complete dataset (not just filtered deals)
      deals.forEach(deal => {
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
  }, [organizedData, groupBy, deals])

  // Get column keys (months) - only from dated deals
  const colKeys = useMemo(() => {
    const monthSet = new Set<string>()
    datedDeals.forEach((deal) => {
      const monthKey = deal.data_janela
        ? safeFormatMonthYear(deal.data_janela)
        : 'Outros' // Fallback, shouldn't happen
      monthSet.add(monthKey)
    })
    
    return Array.from(monthSet).sort((a, b) => {
      try {
        const dealA = datedDeals.find(d => 
          d.data_janela && safeFormatMonthYear(d.data_janela) === a
        )
        const dealB = datedDeals.find(d => 
          d.data_janela && safeFormatMonthYear(d.data_janela) === b
        )
        const dateA = dealA?.data_janela ? safeParseISO(dealA.data_janela) : null
        const dateB = dealB?.data_janela ? safeParseISO(dealB.data_janela) : null
        if (!dateA || !dateB) return 0
        return dateA.getTime() - dateB.getTime()
      } catch {
        return 0
      }
    })
  }, [datedDeals])

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

  // Helper function to parse Portuguese month-year format using date-fns
  const parseMonthYearToDate = (monthYearKey: string, useLastDay: boolean = false): string | null => {
    try {
      
      // Validate format - should now always have year thanks to fixed parsing
      if (!monthYearKey.includes('-')) {
        console.error('🗓️ Month-year key missing year component:', monthYearKey)
        // Try to add current year as fallback
        const currentYear = new Date().getFullYear()
        monthYearKey = `${monthYearKey}-${currentYear}`
      }

      // Use date-fns to parse using same format and locale as generation
      const parsedDate = parse(monthYearKey, 'MMM-yyyy', new Date(), { locale: ptBR })
      
      // Validate the parsed date
      if (isNaN(parsedDate.getTime())) {
        console.error('🗓️ Invalid date parsed from:', monthYearKey)
        return null
      }

      if (useLastDay) {
        // Set to last day of the month
        const year = parsedDate.getFullYear()
        const month = parsedDate.getMonth()
        const lastDay = new Date(year, month + 1, 0).getDate()
        parsedDate.setDate(lastDay)
      } else {
        // Set to 15th day of the month for consistency
        parsedDate.setDate(15)
      }
      
      const dateString = parsedDate.toISOString().split('T')[0]
      return dateString
    } catch (error) {
      console.error('🗓️ Error parsing month-year:', error, 'for key:', monthYearKey)
      return null
    }
  }

  // Row totals
  // Row totals - kept for potential future use
  useMemo(() => {
    const totals: Record<string, SummaryStats> = {}
    rowKeys.forEach((rowKey) => {
      const allDeals = colKeys.flatMap(colKey => organizedData[rowKey]?.[colKey] || [])
      totals[rowKey] = calculateStats(allDeals)
    })
    return totals
  }, [organizedData, rowKeys, colKeys])

  // Column totals - kept for potential future use
  useMemo(() => {
    const totals: Record<string, SummaryStats> = {}
    colKeys.forEach((colKey) => {
      const allDeals = rowKeys.flatMap(rowKey => organizedData[rowKey]?.[colKey] || [])
      totals[colKey] = calculateStats(allDeals)
    })
    return totals
  }, [organizedData, rowKeys, colKeys])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const activeDeal = deals.find(d => d.deal_uuid === active.id)
    if (!activeDeal) return


    // Parse drop zone ID and data
    const overId = over.id as string
    const overData = over.data?.current
    const updates: Partial<Deal> = {}

    try {
      // Check if this is a backlog reordering (deal moved within backlog)
      const isActiveDealInBacklog = !activeDeal.data_janela
      const isDropTargetAnotherDeal = deals.some(d => d.deal_uuid === overId)
      
      if (isActiveDealInBacklog && isDropTargetAnotherDeal) {
        // Backlog reordering detected
        const targetDeal = deals.find(d => d.deal_uuid === overId)
        
        if (targetDeal && !targetDeal.data_janela) {
          
          // Get current backlog deals in their current order
          const currentBacklogDeals = backlogDeals.slice()
          
          // Remove the active deal from its current position
          const activeIndex = currentBacklogDeals.findIndex(d => d.deal_uuid === active.id)
          const targetIndex = currentBacklogDeals.findIndex(d => d.deal_uuid === over.id)
          
          if (activeIndex !== -1 && targetIndex !== -1) {
            // Remove active deal from current position
            const [movedDeal] = currentBacklogDeals.splice(activeIndex, 1)
            
            // Insert at target position
            currentBacklogDeals.splice(targetIndex, 0, movedDeal)
            
            // Calculate new backlog_order values
            const dealUpdates = currentBacklogDeals.map((deal, index) => ({
              deal_uuid: deal.deal_uuid,
              backlog_order: index + 1
            }))
            
            
            // Optimistic update
            setDeals(prev => prev.map(deal => {
              const update = dealUpdates.find(u => u.deal_uuid === deal.deal_uuid)
              return update ? { ...deal, backlog_order: update.backlog_order } : deal
            }))
            
            // Database update
            try {
              await updateBacklogOrder(dealUpdates)
            } catch (error) {
              console.error('💥 Failed to update backlog order:', error)
              // Rollback on failure - reload deals
              loadDeals()
            }
            
            return // Exit early for backlog reordering
          }
        }
      }
      
      if (overId === 'backlog') {
        // Moving to backlog - clear the date and assign backlog order
        updates.data_janela = null
        
        // Assign next available backlog order
        const maxBacklogOrder = Math.max(...backlogDeals.map(d => d.backlog_order || 0), 0)
        updates.backlog_order = maxBacklogOrder + 1
      } else if (overData?.type === 'cell') {
        // Cell drop with metadata - use the provided row and column keys
        const newRowKey = overData.rowKey
        const newColKey = overData.colKey
        
        if (!newRowKey || !newColKey) return

        // If dragging from backlog to a cell, auto-assign the row's grouping value
        const isFromBacklog = !activeDeal.data_janela
        if (isFromBacklog) {
          // Update the grouping field to match the target row
          updates[groupBy] = newRowKey === 'Outros' ? null : newRowKey
        }

        // Update the date (month) - use last day of month
        const newDateString = parseMonthYearToDate(newColKey, true)
        if (newDateString) {
          updates.data_janela = newDateString
          
          // Clear backlog_order when moving from backlog
          if (isFromBacklog) {
            updates.backlog_order = null
          }
        } else {
          console.error('❌ Failed to parse target month from cell:', newColKey)
          return
        }
        
      } else if (overData?.type === 'column') {
        // Column drop - change the month only
        const targetMonth = overData.monthKey
        
        // Parse the target month to get a proper date (use last day of month)
        const newDateString = parseMonthYearToDate(targetMonth, true)
        if (newDateString) {
          updates.data_janela = newDateString
          
          // If coming from backlog, clear backlog_order
          if (!activeDeal.data_janela) {
            updates.backlog_order = null
          }
        } else {
          console.error('❌ Failed to parse target month:', targetMonth)
          return
        }
        
      } else if (overId.includes('-') && !overData) {
        // Cell drop - change month and potentially row group
        
        // Fix: Split properly to preserve full month-year format
        const firstDashIndex = overId.indexOf('-')
        const newRowKey = overId.substring(0, firstDashIndex)
        const newColKey = overId.substring(firstDashIndex + 1)
        
        
        if (!newRowKey || !newColKey) return

        // If dragging from backlog to a cell, auto-assign the row's grouping value
        const isFromBacklog = !activeDeal.data_janela
        if (isFromBacklog) {
          // Update the grouping field to match the target row
          updates[groupBy] = newRowKey === 'Outros' ? null : newRowKey
        }


        // Update the date (month) - use last day of month
        const newDateString = parseMonthYearToDate(newColKey, true)
        if (newDateString) {
          updates.data_janela = newDateString
          
          // Clear backlog_order when moving from backlog
          if (isFromBacklog) {
            updates.backlog_order = null
          }
        } else {
          console.error('❌ Failed to parse target month from cell:', newColKey)
          return
        }
      } else {
        // Unknown drop zone
        return
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        
        // Optimistic update
        setDeals(prev => prev.map(d => 
          d.deal_uuid === activeDeal.deal_uuid ? { ...d, ...updates } : d
        ))
        
        // Database update
        try {
          // Log the changes before updating
          await logObjectChanges(
            activeDeal.deal_uuid,
            activeDeal.nome_fundo || 'Unknown Deal',
            activeDeal as unknown as Record<string, unknown>,
            { ...activeDeal, ...updates } as unknown as Record<string, unknown>
          )
          
          await updateDeal(activeDeal.deal_uuid, updates)
        } catch (error) {
          console.error('💥 Failed to update deal:', error)
          // Rollback on failure
          setDeals(prev => prev.map(d => 
            d.deal_uuid === activeDeal.deal_uuid ? activeDeal : d
          ))
        }
      }
    } catch (error) {
      console.error('💥 Error in drag handler:', error)
    }
  }

  const activeDeal = activeId ? deals.find(d => d.deal_uuid === activeId) : null

  // Handle successful deal creation
  const handleDealCreated = (newDeal: Deal) => {
    setDeals(prev => [newDeal, ...prev])
    setShowAddDealDialog(false)
  }

  // Handle deal click
  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal)
    setShowDealModal(true)
  }

  // Handle deal updated
  const handleDealUpdated = (updatedDeal: Deal) => {
    setDeals(prev => prev.map(d => 
      d.deal_uuid === updatedDeal.deal_uuid ? updatedDeal : d
    ))
  }

  // Handle deal deleted
  const handleDealDeleted = (dealId: string) => {
    setDeals(prev => prev.filter(d => d.deal_uuid !== dealId))
  }

  // Handle settings click
  const handleSettingsClick = () => {
    window.location.href = '/settings'
  }

  // Handle logout click
  const handleLogoutClick = () => {
    // Logout is now handled by the UserAvatar component
    window.location.href = '/login'
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg mb-2">Loading deals...</div>
          <div className="text-sm text-gray-500">Connecting to Supabase database</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <div className="text-xl text-red-600 mb-4">⚠️ Database Connection Issue</div>
          <div className="text-gray-700 mb-4">{error}</div>
          <div className="text-sm text-gray-500 mb-4">
            Check the browser console for more details.
          </div>
          <button 
            onClick={() => loadDeals()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Consolidated Navigation Bar - Always visible */}
      {!isFullscreen && (
        <ConsolidatedNavBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          zoomLevel={zoomLevel}
          onZoomIn={() => {
            const newLevel = Math.min(zoomLevel + 0.1, 1.5)
            setZoomLevel(newLevel)
            updatePreferences({ zoomLevel: newLevel })
          }}
          onZoomOut={() => {
            const newLevel = Math.max(zoomLevel - 0.1, 0.5)
            setZoomLevel(newLevel)
            updatePreferences({ zoomLevel: newLevel })
          }}
          onZoomReset={() => {
            setZoomLevel(1)
            updatePreferences({ zoomLevel: 1 })
          }}
          isFullscreen={isFullscreen}
          onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
          isTransposed={isTransposed}
          onTransposeToggle={() => setIsTransposed(!isTransposed)}
          wideColumns={wideColumns}
          onWideColumnsToggle={() => {
            const newWideColumns = !wideColumns
            setWideColumns(newWideColumns)
            updatePreferences({ wideColumns: newWideColumns })
          }}
          onAddDeal={() => setShowAddDealDialog(true)}
          filteredCount={filteredDeals.length}
          totalCount={deals.length}
          hasFilters={Object.values(filters).some(f => f.length > 0)}
          onSettingsClick={handleSettingsClick}
          onLogoutClick={handleLogoutClick}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      )}

      {/* Filter Controls - Collapsible */}
      {!isFullscreen && (
        <CollapsibleSection 
          title="Filtros"
          isCollapsed={filtersCollapsed}
          onCollapsedChange={(collapsed) => {
            setFiltersCollapsed(collapsed)
            updatePreferences({ 
              sectionsCollapsed: { 
                ...preferences.sectionsCollapsed,
                filters: collapsed 
              }
            })
          }}
        >
          <FilterControls
            deals={deals}
            filters={filters}
            onFiltersChange={setFilters}
            onApplyDefaultDateFilter={() => {
              const defaultFilter = generateDefaultDateFilter()
              setFilters(prev => ({
                ...prev,
                dataJanela: defaultFilter
              }))
            }}
          />
        </CollapsibleSection>
      )}

      {/* Fullscreen controls - minimal header */}
      {isFullscreen && (
        <div className="border-b bg-[#1F2F44] px-4 py-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Cronograma de Fundos</h2>
          <div className="flex items-center gap-2">
            <ZoomControls
              zoomLevel={zoomLevel}
              onZoomIn={() => {
                const newLevel = Math.min(zoomLevel + 0.1, 1.5)
                setZoomLevel(newLevel)
                updatePreferences({ zoomLevel: newLevel })
              }}
              onZoomOut={() => {
                const newLevel = Math.max(zoomLevel - 0.1, 0.5)
                setZoomLevel(newLevel)
                updatePreferences({ zoomLevel: newLevel })
              }}
              onZoomReset={() => {
                setZoomLevel(1)
                updatePreferences({ zoomLevel: 1 })
              }}
            />
            <Button
              onClick={() => setShowAddDealDialog(true)}
              variant="default"
              size="sm"
              className="flex items-center gap-2 bg-[#F9C113] text-[#1F2F44] hover:bg-[#F9C113]/90"
            >
              <Plus className="h-4 w-4" />
              Novo Deal
            </Button>
            <Button
              onClick={() => setIsFullscreen(false)}
              variant="outline"
              size="sm"
              className="border-gray-500 text-gray-500 hover:bg-gray-500/20"
            >
              Sair Tela Cheia
            </Button>
          </div>
        </div>
      )}

      {/* Backlog Strip */}
      <BacklogStrip 
        deals={backlogDeals}
        searchTerm={searchTerm}
        onDealClick={handleDealClick}
      />

      {/* Legend for cell totals */}
      <div className="px-4 py-1 bg-background">
        <div className="text-[10px] inline-flex items-center gap-1 opacity-60">
          <span className="text-muted-foreground"># Deals</span>
          <span className="text-gray-400">|</span>
          <span className="text-green-600">Oferta Base</span>
          <span className="text-gray-400">|</span>
          <span className="text-purple-600">Receita Potencial</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {mounted ? (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={[...backlogDeals, ...datedDeals].map(d => d.deal_uuid)}
              strategy={verticalListSortingStrategy}
            >
              <SimplifiedKanbanGrid
                deals={datedDeals}
                allDeals={deals}
                groupBy={groupBy}
                isTransposed={isTransposed}
                searchTerm={searchTerm}
                stickyHorizontal={stickyHorizontal}
                stickyVertical={stickyVertical}
                zoomLevel={zoomLevel}
                wideColumns={wideColumns}
                onDealClick={handleDealClick}
                filters={filters}
              />

              <DragOverlay>
                {activeDeal ? (
                  <DealCard 
                    deal={activeDeal} 
                    isDragging 
                    searchTerm={searchTerm}
                  />
                ) : null}
              </DragOverlay>
            </SortableContext>
          </DndContext>
        ) : (
          // SSR-safe static version
          <div className="text-center text-gray-400 p-8">
            Loading kanban board...
          </div>
        )}
      </div>

      {/* Add Deal Dialog */}
      <AddDealDialog
        open={showAddDealDialog}
        onOpenChange={setShowAddDealDialog}
        onSuccess={handleDealCreated}
      />

      {/* Deal Details Modal */}
      <DealDetailsModal
        deal={selectedDeal}
        open={showDealModal}
        onOpenChange={setShowDealModal}
        onDealUpdated={handleDealUpdated}
        onDealDeleted={handleDealDeleted}
      />
    </div>
  )
}