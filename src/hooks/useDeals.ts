import { useState, useEffect, useCallback } from 'react'
import { fetchDeals, updateDeal, createDeal, deleteDeal, updateBacklogOrder } from '@/lib/supabase'
import { Deal } from '@/lib/types'
import logger from '@/lib/logger'

interface UseDealsReturn {
  deals: Deal[]
  loading: boolean
  error: string | null
  loadDeals: () => Promise<void>
  updateDealData: (dealId: string, updates: Partial<Deal>) => Promise<boolean>
  createNewDeal: (deal: Omit<Deal, 'deal_uuid' | 'criado_em'>) => Promise<Deal | null>
  removeDeal: (dealId: string) => Promise<boolean>
  updateBacklogOrdering: (updates: { deal_uuid: string, backlog_order: number }[]) => Promise<boolean>
  optimisticUpdate: (dealId: string, updates: Partial<Deal>) => void
  rollbackUpdate: (dealId: string, originalDeal: Deal) => void
}

export function useDeals(): UseDealsReturn {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const loadDeals = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await fetchDeals()
      setDeals(data)
      
      if (data.length === 0) {
        setError('No deals found in database. The deals table may be empty or not exist.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      logger.error('Failed to load deals:', err)
      setError(`Failed to load deals: ${message}`)
      setDeals([])
    } finally {
      setLoading(false)
    }
  }, [])
  
  const updateDealData = useCallback(async (dealId: string, updates: Partial<Deal>): Promise<boolean> => {
    try {
      const result = await updateDeal(dealId, updates)
      if (result) {
        setDeals(prev => prev.map(d => 
          d.deal_uuid === dealId ? { ...d, ...updates } : d
        ))
        return true
      }
      return false
    } catch (err) {
      logger.error('Failed to update deal:', err)
      return false
    }
  }, [])
  
  const createNewDeal = useCallback(async (deal: Omit<Deal, 'deal_uuid' | 'criado_em'>): Promise<Deal | null> => {
    try {
      const newDeal = await createDeal(deal)
      if (newDeal) {
        setDeals(prev => [...prev, newDeal])
        return newDeal
      }
      return null
    } catch (err) {
      logger.error('Failed to create deal:', err)
      return null
    }
  }, [])
  
  const removeDeal = useCallback(async (dealId: string): Promise<boolean> => {
    try {
      const success = await deleteDeal(dealId)
      if (success) {
        setDeals(prev => prev.filter(d => d.deal_uuid !== dealId))
        return true
      }
      return false
    } catch (err) {
      logger.error('Failed to delete deal:', err)
      return false
    }
  }, [])
  
  const updateBacklogOrdering = useCallback(async (updates: { deal_uuid: string, backlog_order: number }[]): Promise<boolean> => {
    try {
      const success = await updateBacklogOrder(updates)
      if (success) {
        setDeals(prev => prev.map(deal => {
          const update = updates.find(u => u.deal_uuid === deal.deal_uuid)
          return update ? { ...deal, backlog_order: update.backlog_order } : deal
        }))
        return true
      }
      return false
    } catch (err) {
      logger.error('Failed to update backlog order:', err)
      return false
    }
  }, [])
  
  const optimisticUpdate = useCallback((dealId: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => 
      d.deal_uuid === dealId ? { ...d, ...updates } : d
    ))
  }, [])
  
  const rollbackUpdate = useCallback((dealId: string, originalDeal: Deal) => {
    setDeals(prev => prev.map(d => 
      d.deal_uuid === dealId ? originalDeal : d
    ))
  }, [])
  
  useEffect(() => {
    loadDeals()
  }, [loadDeals])
  
  return {
    deals,
    loading,
    error,
    loadDeals,
    updateDealData,
    createNewDeal,
    removeDeal,
    updateBacklogOrdering,
    optimisticUpdate,
    rollbackUpdate
  }
}

export default useDeals