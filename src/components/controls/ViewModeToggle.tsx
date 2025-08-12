'use client'

import React from 'react'
import { Maximize, Minimize } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ViewModeToggleProps {
  isFullscreen: boolean
  onToggle: () => void
}

export function ViewModeToggle({ isFullscreen, onToggle }: ViewModeToggleProps) {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 border-gray-500 text-gray-500 hover:bg-gray-500/20"
      title={isFullscreen ? "Sair do modo tela cheia" : "Modo tela cheia"}
    >
      {isFullscreen ? (
        <>
          <Minimize className="h-4 w-4" />
          <span className="hidden sm:inline">Sair Tela Cheia</span>
        </>
      ) : (
        <>
          <Maximize className="h-4 w-4" />
          <span className="hidden sm:inline">Tela Cheia</span>
        </>
      )}
    </Button>
  )
}