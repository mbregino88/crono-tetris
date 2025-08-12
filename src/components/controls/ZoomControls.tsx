import React from 'react'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut } from 'lucide-react'

interface ZoomControlsProps {
  zoomLevel: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  minZoom?: number
  maxZoom?: number
}

export function ZoomControls({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  minZoom = 0.5,
  maxZoom = 1.5
}: ZoomControlsProps) {
  const zoomPercentage = Math.round(zoomLevel * 100)
  
  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={onZoomOut}
        variant="outline"
        size="sm"
        disabled={zoomLevel <= minZoom}
        className="h-8 w-8 p-0 border-gray-500 text-gray-500 hover:bg-gray-500/20 disabled:opacity-50"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        onClick={onZoomReset}
        variant="outline"
        size="sm"
        className="h-8 px-2 min-w-[60px] text-xs font-medium border-gray-500 text-gray-500 hover:bg-gray-500/20"
        title="Reset Zoom"
      >
        {zoomPercentage}%
      </Button>
      
      <Button
        onClick={onZoomIn}
        variant="outline"
        size="sm"
        disabled={zoomLevel >= maxZoom}
        className="h-8 w-8 p-0 border-gray-500 text-gray-500 hover:bg-gray-500/20 disabled:opacity-50"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  )
}