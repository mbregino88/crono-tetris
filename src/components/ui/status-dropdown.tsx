'use client'

import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type DealStatus = 'Ativa' | 'Encerrada' | 'Leitura' | 'Pre-Leitura' | 'Dead' | 'Backlog'

interface StatusDropdownProps {
  value: string | null
  onChange: (value: DealStatus) => void
  disabled?: boolean
}

const statusConfig: Record<DealStatus, { label: string; color: string; bgColor: string }> = {
  'Ativa': { 
    label: 'Ativa', 
    color: 'text-green-700',
    bgColor: 'bg-green-100 hover:bg-green-200'
  },
  'Encerrada': { 
    label: 'Encerrada', 
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 hover:bg-gray-200'
  },
  'Leitura': { 
    label: 'Leitura', 
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 hover:bg-blue-200'
  },
  'Pre-Leitura': { 
    label: 'Pré-Leitura', 
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100 hover:bg-yellow-200'
  },
  'Dead': { 
    label: 'Dead', 
    color: 'text-red-700',
    bgColor: 'bg-red-100 hover:bg-red-200'
  },
  'Backlog': { 
    label: 'Backlog', 
    color: 'text-purple-700',
    bgColor: 'bg-purple-100 hover:bg-purple-200'
  }
}

export function StatusDropdown({ value, onChange, disabled = false }: StatusDropdownProps) {
  const currentStatus = (value as DealStatus) || 'Ativa'
  const config = statusConfig[currentStatus] || statusConfig['Ativa']

  return (
    <Select 
      value={currentStatus} 
      onValueChange={(newValue) => onChange(newValue as DealStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="w-fit border-0 p-0 h-auto focus:ring-0">
        <SelectValue>
          <Badge 
            variant="secondary" 
            className={cn(
              "cursor-pointer text-xs px-2 py-0.5",
              config.bgColor,
              config.color
            )}
          >
            Status: {config.label}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusConfig).map(([status, cfg]) => (
          <SelectItem key={status} value={status}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                cfg.bgColor.replace('hover:', '').replace('bg-', 'bg-').replace('100', '500')
              )} />
              <span>{cfg.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}