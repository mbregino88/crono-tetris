import { useEffect, useRef, useCallback } from 'react'

interface ScrollSyncOptions {
  enabled?: boolean
  throttleMs?: number
}

export function useScrollSync(
  options: ScrollSyncOptions = {}
) {
  const { enabled = true, throttleMs = 16 } = options
  
  const headersContainerRef = useRef<HTMLDivElement>(null)
  const rowsContainerRef = useRef<HTMLDivElement>(null)
  const contentContainerRef = useRef<HTMLDivElement>(null)
  
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  
  const throttleScroll = useCallback((fn: () => void) => {
    if (!isScrollingRef.current) {
      requestAnimationFrame(() => {
        fn()
        isScrollingRef.current = false
      })
      isScrollingRef.current = true
    }
  }, [])
  
  const handleContentScroll = useCallback(() => {
    if (!enabled) return
    
    throttleScroll(() => {
      const contentContainer = contentContainerRef.current
      const headersContainer = headersContainerRef.current
      const rowsContainer = rowsContainerRef.current
      
      if (!contentContainer || !headersContainer || !rowsContainer) return
      
      const { scrollLeft, scrollTop } = contentContainer
      
      if (Math.abs(headersContainer.scrollLeft - scrollLeft) > 1) {
        headersContainer.scrollLeft = scrollLeft
      }
      
      if (Math.abs(rowsContainer.scrollTop - scrollTop) > 1) {
        rowsContainer.scrollTop = scrollTop
      }
    })
  }, [enabled, throttleScroll])
  
  const handleHeadersScroll = useCallback(() => {
    if (!enabled) return
    
    throttleScroll(() => {
      const headersContainer = headersContainerRef.current
      const contentContainer = contentContainerRef.current
      
      if (!headersContainer || !contentContainer) return
      
      const { scrollLeft } = headersContainer
      if (Math.abs(contentContainer.scrollLeft - scrollLeft) > 1) {
        contentContainer.scrollLeft = scrollLeft
      }
    })
  }, [enabled, throttleScroll])
  
  const handleRowsScroll = useCallback(() => {
    if (!enabled) return
    
    throttleScroll(() => {
      const rowsContainer = rowsContainerRef.current
      const contentContainer = contentContainerRef.current
      
      if (!rowsContainer || !contentContainer) return
      
      const { scrollTop } = rowsContainer
      if (Math.abs(contentContainer.scrollTop - scrollTop) > 1) {
        contentContainer.scrollTop = scrollTop
      }
    })
  }, [enabled, throttleScroll])
  
  useEffect(() => {
    if (!enabled) return
    
    const headersContainer = headersContainerRef.current
    const rowsContainer = rowsContainerRef.current
    const contentContainer = contentContainerRef.current
    
    if (!headersContainer || !rowsContainer || !contentContainer) return
    
    contentContainer.addEventListener('scroll', handleContentScroll, { passive: true })
    headersContainer.addEventListener('scroll', handleHeadersScroll, { passive: true })
    rowsContainer.addEventListener('scroll', handleRowsScroll, { passive: true })
    
    return () => {
      contentContainer.removeEventListener('scroll', handleContentScroll)
      headersContainer.removeEventListener('scroll', handleHeadersScroll)
      rowsContainer.removeEventListener('scroll', handleRowsScroll)
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [enabled, handleContentScroll, handleHeadersScroll, handleRowsScroll])
  
  return {
    headersContainerRef,
    rowsContainerRef,
    contentContainerRef
  }
}

export default useScrollSync