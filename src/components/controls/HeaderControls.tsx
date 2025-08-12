import React from 'react'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Maximize2 } from 'lucide-react'
import type { GroupingField } from '@/lib/types'

interface HeaderControlsProps {
  groupBy: GroupingField
  onGroupByChange: (field: GroupingField) => void
  stickyHorizontal: boolean
  onStickyHorizontalChange: (sticky: boolean) => void
  stickyVertical: boolean  
  onStickyVerticalChange: (sticky: boolean) => void
  onFullscreen?: () => void
}

export function HeaderControls({
  groupBy,
  onGroupByChange,
  stickyHorizontal,
  onStickyHorizontalChange,
  stickyVertical,
  onStickyVerticalChange,
  onFullscreen
}: HeaderControlsProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Agrupar verticalmente por:</label>
          <Select value={groupBy} onValueChange={(value) => onGroupByChange(value as GroupingField)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="setor">Setor</SelectItem>
              <SelectItem value="veiculo">Veículo</SelectItem>
              <SelectItem value="indexador">Indexador</SelectItem>
              <SelectItem value="ipo_fon">IPO/FOn</SelectItem>
              <SelectItem value="produto">Produto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Toggle 
          pressed={stickyHorizontal}
          onPressedChange={onStickyHorizontalChange}
          variant="outline"
          size="sm"
        >
          Headers Horizontais
        </Toggle>
        
        <Toggle 
          pressed={stickyVertical}
          onPressedChange={onStickyVerticalChange}
          variant="outline"
          size="sm"
        >
          Headers Verticais
        </Toggle>

        {onFullscreen && (
          <Button
            onClick={onFullscreen}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Maximize2 className="h-4 w-4" />
            Fullscreen
          </Button>
        )}
      </div>
    </div>
  )
}