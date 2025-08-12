import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter } from 'lucide-react'
import { MultiSelectDropdown } from '@/components/ui/multiselect-dropdown'
import type { Deal } from '@/lib/types'

export interface FilterState {
  dataJanela: string[]
  indexador: string[]
  tipo: string[]
  tipoNovo: string[]
  veiculo: string[]
  produto: string[]
  gestora: string[]
  setor: string[]
  tipoCota: string[]
}

interface FilterControlsProps {
  deals: Deal[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function FilterControls({ deals, filters, onFiltersChange }: FilterControlsProps) {
  // Extract unique values from deals for each filter
  const getUniqueValues = (field: keyof Deal) => {
    const values = deals
      .map(deal => deal[field])
      .filter((value): value is string => 
        value !== null && value !== undefined && value !== ''
      )
    return [...new Set(values)].sort()
  }

  // Extract unique months from data_janela and add future months
  const getUniqueMonths = () => {
    // Get months from existing deals
    const dealsMonths = deals
      .map(deal => deal.data_janela)
      .filter((date): date is string => date !== null && date !== undefined && date !== '')
      .map(date => {
        try {
          const dateObj = new Date(date)
          return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
        } catch {
          return null
        }
      })
      .filter((month): month is string => month !== null)
    
    // Generate future months (current month + 12 months ahead)
    const futureMonths: string[] = []
    const now = new Date()
    for (let i = 0; i <= 12; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const monthStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`
      futureMonths.push(monthStr)
    }
    
    // Combine and deduplicate
    const allMonths = [...new Set([...dealsMonths, ...futureMonths])]
    
    return allMonths.sort()
  }


  const clearAllFilters = () => {
    onFiltersChange({
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
  }

  const getTotalActiveFilters = () => {
    return Object.values(filters).reduce((sum, filterArray) => sum + filterArray.length, 0)
  }

  const filterOptions = [
    {
      key: 'dataJanela' as keyof FilterState,
      label: 'Data Janela',
      values: getUniqueMonths(),
      format: (value: string) => {
        const [year, month] = value.split('-')
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                           'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        return `${monthNames[parseInt(month) - 1]} ${year}`
      }
    },
    {
      key: 'indexador' as keyof FilterState,
      label: 'Indexador',
      values: getUniqueValues('principal_indexador'),
      format: (value: string) => value
    },
    {
      key: 'tipo' as keyof FilterState,
      label: 'Tipo',
      values: getUniqueValues('tipo_cota'),
      format: (value: string) => value
    },
    {
      key: 'tipoNovo' as keyof FilterState,
      label: 'Tipo Novo',
      values: getUniqueValues('tipo'),
      format: (value: string) => value
    },
    {
      key: 'veiculo' as keyof FilterState,
      label: 'Veículo',
      values: getUniqueValues('veiculo'),
      format: (value: string) => value
    },
    {
      key: 'produto' as keyof FilterState,
      label: 'Produto',
      values: getUniqueValues('produto'),
      format: (value: string) => value
    },
    {
      key: 'gestora' as keyof FilterState,
      label: 'Gestora',
      values: getUniqueValues('gestora'),
      format: (value: string) => value
    },
    {
      key: 'setor' as keyof FilterState,
      label: 'Setor',
      values: getUniqueValues('setor'),
      format: (value: string) => value
    },
    {
      key: 'tipoCota' as keyof FilterState,
      label: 'Tipo de Cota',
      values: getUniqueValues('tipo_cota'),
      format: (value: string) => value
    }
  ]

  return (
    <div className="border-b bg-background w-full">
      <div className="px-4 py-2">
        {/* Filter Header - Compact */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros</span>
            {getTotalActiveFilters() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getTotalActiveFilters()} aplicados
              </Badge>
            )}
          </div>
          
          {getTotalActiveFilters() > 0 && (
            <Button
              onClick={clearAllFilters}
              variant="outline"
              size="sm"
              className="text-xs h-6"
            >
              Limpar todos
            </Button>
          )}
        </div>

        {/* Filter Dropdowns - Multiselect with Ctrl+click */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
          {filterOptions.map(({ key, label, values, format }) => (
            <MultiSelectDropdown
              key={key}
              label={label}
              options={values}
              selectedValues={filters[key]}
              onSelectionChange={(selectedValues) => {
                onFiltersChange({
                  ...filters,
                  [key]: selectedValues
                })
              }}
              formatValue={format}
              placeholder={`Selecionar ${label}...`}
              className="w-full"
            />
          ))}
        </div>

        {/* Active Filter Tags - Minimized */}
        {getTotalActiveFilters() > 3 && (
          <div className="text-xs text-muted-foreground">
            Múltiplos filtros ativos - use os dropdowns para gerenciar
          </div>
        )}
      </div>
    </div>
  )
}