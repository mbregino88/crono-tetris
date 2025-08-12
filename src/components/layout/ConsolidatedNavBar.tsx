import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchBar } from '@/components/search/SearchBar'
import { ZoomControls } from '@/components/controls/ZoomControls'
import { ViewModeToggle } from '@/components/controls/ViewModeToggle'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Plus, ArrowUpDown, Calendar, Expand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GroupingField } from '@/lib/types'

interface ConsolidatedNavBarProps {
  // Search props
  searchTerm: string
  onSearchChange: (value: string) => void
  
  // Grouping props
  groupBy: GroupingField
  onGroupByChange: (field: GroupingField) => void
  
  // Zoom props
  zoomLevel: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  
  // View mode props
  isFullscreen: boolean
  onFullscreenToggle: () => void
  isTransposed: boolean
  onTransposeToggle: () => void
  wideColumns: boolean
  onWideColumnsToggle: () => void
  onAddDeal: () => void
  
  // Results counter
  filteredCount?: number
  totalCount?: number
  hasFilters?: boolean
  
  // User avatar props
  onSettingsClick?: () => void
  onLogoutClick?: () => void
}

export function ConsolidatedNavBar({
  searchTerm,
  onSearchChange,
  groupBy,
  onGroupByChange,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isFullscreen,
  onFullscreenToggle,
  isTransposed,
  onTransposeToggle,
  wideColumns,
  onWideColumnsToggle,
  onAddDeal,
  filteredCount,
  totalCount,
  hasFilters,
  onSettingsClick,
  onLogoutClick
}: ConsolidatedNavBarProps) {
  return (
    <div className="border-b bg-[#1F2F44] shadow-sm w-full">
      <div className="px-4 py-2">
        {/* Single Consolidated Header */}
        <div className="flex items-center justify-between gap-2">
          {/* Left Side: Page Title */}
          <h1 className="text-lg font-semibold text-white flex-shrink-0 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma de Fundos
          </h1>

          {/* Right Side: All Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Novo Deal Button */}
            <Button
              onClick={onAddDeal}
              variant="default"
              size="sm"
              className="flex items-center gap-2 flex-shrink-0 bg-[#F9C113] text-[#1F2F44] hover:bg-[#F9C113]/90"
            >
              <Plus className="h-4 w-4" />
              Novo Deal
            </Button>

            {/* Search Bar */}
            <div className="flex-1 min-w-[200px] max-w-[300px]">
              <SearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Buscar por nome, setor, veículo..."
                className="w-full h-8"
              />
            </div>

            {/* Agrupamento */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <label className="text-sm font-medium whitespace-nowrap text-white">Agrupamento:</label>
              <Select value={groupBy} onValueChange={(value) => onGroupByChange(value as GroupingField)}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="setor">Setor</SelectItem>
                  <SelectItem value="veiculo">Veículo</SelectItem>
                  <SelectItem value="principal_indexador">Indexador</SelectItem>
                  <SelectItem value="ipo_fon">IPO/FOn</SelectItem>
                  <SelectItem value="produto">Produto</SelectItem>
                  <SelectItem value="tipo">Tipo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transpose Toggle */}
            <Button
              onClick={onTransposeToggle}
              variant={isTransposed ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 px-3 flex items-center gap-1",
                isTransposed 
                  ? "bg-[#F9C113] text-[#1F2F44] hover:bg-[#F9C113]/90" 
                  : "border-gray-500 text-gray-500 hover:bg-gray-500/20"
              )}
              title="Transpor linhas e colunas"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>

            {/* Column Width Toggle */}
            <Button
              onClick={onWideColumnsToggle}
              variant={wideColumns ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 px-3 flex items-center gap-1",
                wideColumns 
                  ? "bg-[#F9C113] text-[#1F2F44] hover:bg-[#F9C113]/90" 
                  : "border-gray-500 text-gray-500 hover:bg-gray-500/20"
              )}
              title="Dobrar largura das colunas"
            >
              <Expand className="h-4 w-4" />
            </Button>

            {/* Fullscreen Toggle */}
            <ViewModeToggle
              isFullscreen={isFullscreen}
              onToggle={onFullscreenToggle}
            />
            
            {/* Zoom Controls */}
            <ZoomControls
              zoomLevel={zoomLevel}
              onZoomIn={onZoomIn}
              onZoomOut={onZoomOut}
              onZoomReset={onZoomReset}
            />

            {/* User Avatar */}
            <UserAvatar
              onSettingsClick={onSettingsClick}
              onLogoutClick={onLogoutClick}
              className="ml-2"
            />
          </div>
        </div>

        {/* Results Counter Row - Compact */}
        {(searchTerm || hasFilters) && filteredCount !== undefined && totalCount !== undefined && (
          <div className="text-xs text-white/70 mt-1">
            {filteredCount} de {totalCount} deals encontrados
          </div>
        )}
      </div>
    </div>
  )
}