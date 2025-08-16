'use client'

export interface UserPreferences {
  // View settings
  zoomLevel: number
  wideColumns: boolean
  
  // Filter settings
  defaultDateFilter: string[] // Array of month strings like ['2025-08', '2025-09', '2025-10', '2025-11']
  
  // Collapsible sections
  sectionsCollapsed: {
    filters: boolean
    // Add more sections as needed
  }
  
  // System flags
  isFirstTimeUser: boolean
  hasAppliedDefaults: boolean
  lastVisit: string
}

const PREFERENCES_KEY = 'crono-tetris-preferences'

const defaultPreferences: UserPreferences = {
  zoomLevel: 1.0,
  wideColumns: false,
  defaultDateFilter: [],
  sectionsCollapsed: {
    filters: false
  },
  isFirstTimeUser: true,
  hasAppliedDefaults: false,
  lastVisit: new Date().toISOString()
}

// Generate default date filter: current month + next 3 months
export function generateDefaultDateFilter(): string[] {
  const dates: string[] = []
  const now = new Date()
  
  for (let i = 0; i <= 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    dates.push(monthStr)
  }
  
  return dates
}

export function getStandardViewDefaults(): Partial<UserPreferences> {
  return {
    zoomLevel: 0.8, // 80% zoom
    wideColumns: true, // Double width columns
    defaultDateFilter: generateDefaultDateFilter(),
    sectionsCollapsed: {
      filters: true // Start with filters collapsed
    },
    hasAppliedDefaults: true,
    isFirstTimeUser: false
  }
}

export function loadUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return defaultPreferences
  }
  
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY)
    if (!stored) {
      return defaultPreferences
    }
    
    const parsed = JSON.parse(stored) as UserPreferences
    
    // Merge with defaults to handle new fields
    return {
      ...defaultPreferences,
      ...parsed,
      sectionsCollapsed: {
        ...defaultPreferences.sectionsCollapsed,
        ...parsed.sectionsCollapsed
      }
    }
  } catch (error) {
    console.error('Failed to load user preferences:', error)
    return defaultPreferences
  }
}

export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    const current = loadUserPreferences()
    const updated: UserPreferences = {
      ...current,
      ...preferences,
      sectionsCollapsed: {
        ...current.sectionsCollapsed,
        ...preferences.sectionsCollapsed
      },
      lastVisit: new Date().toISOString()
    }
    
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save user preferences:', error)
  }
}

export function isFirstTimeUser(): boolean {
  const preferences = loadUserPreferences()
  return preferences.isFirstTimeUser
}

export function shouldApplyStandardView(): boolean {
  const preferences = loadUserPreferences()
  return preferences.isFirstTimeUser && !preferences.hasAppliedDefaults
}

export function markStandardViewApplied(): void {
  saveUserPreferences({
    isFirstTimeUser: false,
    hasAppliedDefaults: true
  })
}

// Hook for React components
export function useUserPreferences() {
  const [preferences, setPreferencesState] = React.useState<UserPreferences>(defaultPreferences)
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setPreferencesState(loadUserPreferences())
    setMounted(true)
  }, [])
  
  const updatePreferences = React.useCallback((updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    setPreferencesState(newPreferences)
    saveUserPreferences(updates)
  }, [preferences])
  
  return {
    preferences: mounted ? preferences : defaultPreferences,
    updatePreferences,
    mounted
  }
}

// We need to import React for the hook
import React from 'react'