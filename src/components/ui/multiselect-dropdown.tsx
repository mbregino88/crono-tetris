import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiSelectDropdownProps {
  label: string
  options: string[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  placeholder?: string
  formatValue?: (value: string) => string
  className?: string
}

export function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Selecione opções...",
  formatValue = (value) => value,
  className
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle option selection with Ctrl+click support
  const handleOptionSelect = (value: string, event: React.MouseEvent) => {
    event.preventDefault()
    
    if (event.ctrlKey || event.metaKey) {
      // Ctrl+click: toggle selection
      if (selectedValues.includes(value)) {
        onSelectionChange(selectedValues.filter(v => v !== value))
      } else {
        onSelectionChange([...selectedValues, value])
      }
    } else {
      // Regular click: single selection or toggle if already selected
      if (selectedValues.includes(value) && selectedValues.length === 1) {
        onSelectionChange([])
      } else {
        onSelectionChange([value])
      }
    }
  }

  // Handle badge removal
  const handleRemoveValue = (valueToRemove: string) => {
    onSelectionChange(selectedValues.filter(v => v !== valueToRemove))
  }

  // Clear all selections
  const handleClearAll = () => {
    onSelectionChange([])
  }

  // Select all filtered options
  const handleSelectAll = () => {
    const allValues = Array.from(new Set([...selectedValues, ...filteredOptions]))
    onSelectionChange(allValues)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between h-auto min-h-[2.5rem] px-3 py-2"
          >
            <div className="flex flex-wrap gap-1 flex-1 text-left">
              {selectedValues.length === 0 ? (
                <span className="text-muted-foreground text-sm">{placeholder}</span>
              ) : (
                selectedValues.map((value) => (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="text-xs flex items-center gap-1 px-2 py-0.5"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveValue(value)
                    }}
                  >
                    {formatValue(value)}
                    <X className="h-3 w-3 cursor-pointer hover:text-red-500" />
                  </Badge>
                ))
              )}
            </div>
            <div className="flex items-center gap-1 ml-2">
              {selectedValues.length > 0 && (
                <Badge variant="outline" className="text-xs px-1 py-0.5">
                  {selectedValues.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 shrink-0" />
            </div>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <Input
              placeholder="Buscar opções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          
          <div className="p-2 border-b flex justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredOptions.length === 0}
              className="h-6 px-2 text-xs"
            >
              Selecionar Todos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedValues.length === 0}
              className="h-6 px-2 text-xs"
            >
              Limpar
            </Button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma opção encontrada
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option)
                  return (
                    <div
                      key={option}
                      onMouseDown={(e) => handleOptionSelect(option, e)}
                      className={cn(
                        "flex items-center justify-between px-2 py-2 text-sm cursor-pointer rounded-sm",
                        "hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 border rounded-sm flex items-center justify-center",
                          isSelected ? "bg-primary border-primary" : "border-gray-300"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span>{formatValue(option)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isSelected && "Ctrl+click"}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-2 border-t bg-muted/20">
            <div className="text-xs text-muted-foreground text-center">
              💡 Dica: Use Ctrl+click para seleções múltiplas
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}