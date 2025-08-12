import type { Deal } from './types'
import type { FilterState } from '@/components/filters/FilterControls'

/**
 * Search function that filters deals across all fields
 * @param deals - Array of deals to search through
 * @param searchTerm - Search term to filter by
 * @returns Filtered array of deals
 */
export function searchDeals(deals: Deal[], searchTerm: string): Deal[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return deals
  }

  const normalizedSearchTerm = searchTerm.toLowerCase().trim()

  return deals.filter((deal) => {
    // Helper function to safely convert value to searchable string
    const toSearchableString = (value: unknown): string => {
      if (value === null || value === undefined) return ''
      if (typeof value === 'number') return value.toString()
      if (typeof value === 'boolean') return value.toString()
      if (value instanceof Date) return value.toISOString()
      return String(value).toLowerCase()
    }

    // Search across all fields
    const searchableFields = [
      // Fund information
      deal.nome_fundo,
      deal.ticker_fundo,
      deal.cnpj_fundo,
      deal.gestora,
      deal.publico_alvo,
      deal.status_deal,

      // Deal characteristics
      deal.veiculo,
      deal.produto,
      deal.setor,
      deal.principal_indexador,
      deal.ipo_fon,
      deal.tipo_cota,
      deal.tipo,

      // Distribution and team
      deal.canais,
      deal.resp_dcm,
      deal.bup_dcm,
      deal.resp_dist,
      deal.bup_dist,
      deal.aprov_leitura,
      deal.aprov_analise,

      // Anchorage info
      deal.ancoragem_gf_alt,

      // Financial data (convert numbers to strings for searching)
      deal.oferta_base,
      deal.oferta_minima,
      deal.volume_liquidado,
      deal.demanda_estimada_total,
      deal.demanda_pedra,
      deal.demanda_inst,
      deal.demanda_varejo,
      deal.vol_ancoragem,
      deal.fee_est,
      deal.fee_canal,
      deal.rep_gestao,
      deal.rep_performance,
      deal.perc_book,

      // Dates (convert to readable format)
      deal.data_janela,
      deal.data_dp,
      deal.data_sobras,
      deal.data_roadshow,
      deal.data_bookbuilding,
      deal.data_liquidacao,
      deal.criado_em,
    ]

    // Check if any field contains the search term
    return searchableFields.some((field) => {
      const searchableValue = toSearchableString(field)
      return searchableValue.includes(normalizedSearchTerm)
    })
  })
}

/**
 * Get highlighted text parts for rendering
 * @param text - Text to highlight
 * @param searchTerm - Term to highlight
 * @returns Array of text parts with highlighting info
 */
export function getHighlightedTextParts(text: string, searchTerm: string): Array<{ text: string; isHighlighted: boolean }> {
  if (!searchTerm || !text) return [{ text, isHighlighted: false }]

  const normalizedSearchTerm = searchTerm.toLowerCase().trim()
  const normalizedText = text.toLowerCase()
  
  const parts: Array<{ text: string; isHighlighted: boolean }> = []
  let currentIndex = 0

  while (currentIndex < text.length) {
    const searchIndex = normalizedText.indexOf(normalizedSearchTerm, currentIndex)
    
    if (searchIndex === -1) {
      // No more matches, add remaining text
      if (currentIndex < text.length) {
        parts.push({
          text: text.slice(currentIndex),
          isHighlighted: false
        })
      }
      break
    }

    // Add text before match
    if (searchIndex > currentIndex) {
      parts.push({
        text: text.slice(currentIndex, searchIndex),
        isHighlighted: false
      })
    }

    // Add highlighted match
    parts.push({
      text: text.slice(searchIndex, searchIndex + normalizedSearchTerm.length),
      isHighlighted: true
    })

    currentIndex = searchIndex + normalizedSearchTerm.length
  }

  return parts
}

/**
 * Filter deals based on multiple filter criteria
 * @param deals - Array of deals to filter
 * @param filters - Filter state object
 * @returns Filtered array of deals
 */
export function filterDeals(deals: Deal[], filters: FilterState): Deal[] {
  return deals.filter((deal) => {
    // Data Janela filter (month-based) - PRESERVE NULL VALUES FOR BACKLOG
    if (filters.dataJanela.length > 0) {
      const dealMonth = deal.data_janela ? (() => {
        try {
          const date = new Date(deal.data_janela)
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        } catch {
          return null
        }
      })() : null
      
      // CRITICAL FIX: Don't filter out NULL dates - they should go to backlog!
      // Only filter out deals that have a valid date but don't match the filter
      if (dealMonth !== null && !filters.dataJanela.includes(dealMonth)) {
        return false
      }
      // Let deals with NULL data_janela pass through to reach backlog logic
    }

    // Indexador filter
    if (filters.indexador.length > 0) {
      if (!deal.principal_indexador || !filters.indexador.includes(deal.principal_indexador)) {
        return false
      }
    }

    // Veiculo filter
    if (filters.veiculo.length > 0) {
      if (!deal.veiculo || !filters.veiculo.includes(deal.veiculo)) {
        return false
      }
    }

    // Produto filter
    if (filters.produto.length > 0) {
      if (!deal.produto || !filters.produto.includes(deal.produto)) {
        return false
      }
    }

    // Setor filter
    if (filters.setor.length > 0) {
      if (!deal.setor || !filters.setor.includes(deal.setor)) {
        return false
      }
    }

    // Gestora filter
    if (filters.gestora.length > 0) {
      if (!deal.gestora || !filters.gestora.includes(deal.gestora)) {
        return false
      }
    }

    // Tipo filter (using tipo_cota)
    if (filters.tipo.length > 0) {
      if (!deal.tipo_cota || !filters.tipo.includes(deal.tipo_cota)) {
        return false
      }
    }

    // Tipo Cota filter
    if (filters.tipoCota.length > 0) {
      if (!deal.tipo_cota || !filters.tipoCota.includes(deal.tipo_cota)) {
        return false
      }
    }

    // TipoNovo filter (using tipo)
    if (filters.tipoNovo.length > 0) {
      if (!deal.tipo || !filters.tipoNovo.includes(deal.tipo)) {
        return false
      }
    }

    return true
  })
}

/**
 * Search and filter deals with both text search and filters
 * @param deals - Array of deals to process
 * @param searchTerm - Text search term
 * @param filters - Filter state object
 * @returns Filtered and searched array of deals
 */
export function searchAndFilterDeals(deals: Deal[], searchTerm: string, filters: FilterState): Deal[] {
  // First apply filters
  let filtered = filterDeals(deals, filters)
  
  // Then apply text search
  filtered = searchDeals(filtered, searchTerm)
  
  return filtered
}