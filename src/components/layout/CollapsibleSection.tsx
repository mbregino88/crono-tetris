'use client'

import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultCollapsed?: boolean
  className?: string
  // External state control
  isCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultCollapsed = false,
  className,
  isCollapsed: externalIsCollapsed,
  onCollapsedChange
}: CollapsibleSectionProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = React.useState(defaultCollapsed)
  
  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed
  
  const handleToggle = () => {
    const newCollapsed = !isCollapsed
    
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed)
    } else {
      setInternalIsCollapsed(newCollapsed)
    }
  }

  return (
    <div className={cn("border-b bg-background", className)}>
      <div className="px-4 py-1.5 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="h-6 w-6 p-0"
        >
          {isCollapsed ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          )}
        </Button>
      </div>
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isCollapsed ? "max-h-0" : "max-h-96"
        )}
      >
        <div className="pb-4">
          {children}
        </div>
      </div>
    </div>
  )
}