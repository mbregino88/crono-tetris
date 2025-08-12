import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn, formatCurrency } from '@/lib/utils'
import { getVehicleColor, getIndexerColor, getSectorColor, getProductColor } from '@/lib/colors'
import { getHighlightedTextParts } from '@/lib/search'
import type { Deal } from '@/lib/types'

interface BacklogCardProps {
  deal: Deal
  isDragging?: boolean
  onClick?: () => void
  searchTerm?: string
}

export function BacklogCard({ deal, isDragging, onClick, searchTerm = '' }: BacklogCardProps) {
  // Get dynamic colors for 4 badge types only
  const vehicleColor = getVehicleColor(deal.veiculo || 'Outros')
  const indexerColor = getIndexerColor(deal.principal_indexador || 'Outros')
  const sectorColor = getSectorColor(deal.setor || 'Outros')
  const productColor = getProductColor(deal.produto || 'Outros')

  // Helper function to truncate text
  const truncate = (text: string | null, maxLength: number): string => {
    if (!text) return 'N/A'
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  // Get background color based on produto - case insensitive with more variants
  const getBackgroundColor = (produto: string | null): string => {
    if (!produto) return 'bg-white'
    
    const produtoLower = produto.toLowerCase().trim()
    
    switch (produtoLower) {
      case 'listado':
        return 'bg-blue-100'
      case 'cetipado':
        return 'bg-green-100'
      case 'r+':
      case 'r +':
      case 'renda+':
        return 'bg-purple-100'
      case 'tt. ret.':
      case 'tt ret':
      case 'título ret':
      case 'titulo ret':
        return 'bg-yellow-100'
      default:
        return 'bg-white'
    }
  }

  return (
    <div
      className={cn(
        "backlog-card border border-gray-200 rounded-md p-2 cursor-grab hover:shadow-lg hover:scale-102 transition-all duration-200",
        "w-52 min-h-[90px] flex-shrink-0 select-none",
        getBackgroundColor(deal.produto),
        isDragging && "opacity-50 rotate-1 scale-105 cursor-grabbing shadow-xl"
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      {/* Line 1: Fund Name */}
      <div className="font-semibold text-sm text-foreground dark:text-white mb-1 leading-tight">
        {getHighlightedTextParts(truncate(deal.nome_fundo, 40), searchTerm).map((part, index) => (
          part.isHighlighted ? (
            <mark key={index} className="bg-yellow-200 px-0.5 rounded">{part.text}</mark>
          ) : (
            <span key={index}>{part.text}</span>
          )
        ))}
      </div>
      
      {/* Line 2: Financial Values */}
      <div className="flex items-center gap-1 mb-1">
        <div className="text-green-600 font-medium text-sm">
          {formatCurrency(deal.oferta_base || 0)}
        </div>
        <div className="text-gray-400">|</div>
        <div className="text-purple-600 font-medium text-sm">
          {formatCurrency(deal.receita_potencial || 0)}
        </div>
      </div>

      {/* Line 3: 4 Colored Text Tags */}
      <div className="flex items-center gap-1 text-xs font-semibold truncate">
        <span className={vehicleColor.text || 'text-gray-600'}>
          {vehicleColor.label || 'N/A'}
        </span>
        <span className="text-gray-400">|</span>
        <span className={productColor.text || 'text-gray-600'}>
          {productColor.label || 'N/A'}
        </span>
        <span className="text-gray-400">|</span>
        <span className={sectorColor.text || 'text-gray-600'}>
          {sectorColor.label || 'N/A'}
        </span>
        <span className="text-gray-400">|</span>
        <span className={indexerColor.text || 'text-gray-600'}>
          {indexerColor.label || 'N/A'}
        </span>
      </div>
    </div>
  )
}

interface SortableBacklogCardProps {
  deal: Deal
  onClick?: () => void
  searchTerm?: string
}

export function SortableBacklogCard({ deal, onClick, searchTerm = '' }: SortableBacklogCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.deal_uuid })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "z-50"
      )}
    >
      <BacklogCard 
        deal={deal} 
        isDragging={isDragging}
        onClick={onClick}
        searchTerm={searchTerm}
      />
    </div>
  )
}