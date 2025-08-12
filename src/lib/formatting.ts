/**
 * Format a number for display with Brazilian formatting:
 * - Period (.) for decimal separator
 * - Comma (,) for thousand separator
 */
export function formatNumberForDisplay(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  
  // Convert to string with fixed decimals
  const parts = value.toFixed(2).split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]
  
  // Add thousand separators to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // Combine with decimal part
  return `${formattedInteger}.${decimalPart}`
}

/**
 * Parse a formatted number string back to a number
 * Handles Brazilian format (comma for thousands, period for decimals)
 */
export function parseFormattedNumber(value: string): number {
  if (!value) return 0
  
  // Remove thousand separators (commas) and convert to number
  const cleanValue = value.replace(/,/g, '')
  const parsed = parseFloat(cleanValue)
  
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format currency for display (Brazilian Real)
 */
export function formatCurrencyForInput(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return formatNumberForDisplay(value)
}

/**
 * Format percentage for input display
 */
export function formatPercentageForInput(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return value.toFixed(2)
}

/**
 * Handle numeric input change with formatting
 */
export function handleNumericInput(
  value: string,
  isPercentage: boolean = false
): { display: string; numeric: number } {
  // Remove non-numeric characters except comma, period, and minus
  const cleaned = value.replace(/[^0-9.,-]/g, '')
  
  if (cleaned === '' || cleaned === '-') {
    return { display: cleaned, numeric: 0 }
  }
  
  // Parse the number
  const numeric = parseFormattedNumber(cleaned)
  
  // Format for display
  const display = isPercentage 
    ? formatPercentageForInput(numeric)
    : formatNumberForDisplay(numeric)
  
  return { display, numeric }
}

/**
 * Format date for month/year display
 */
export function formatMonthYear(date: Date): string {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]
  
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  
  return `${month}-${year}`
}

/**
 * Parse month/year string to Date
 */
export function parseMonthYear(monthYear: string): Date | null {
  const parts = monthYear.split('-')
  if (parts.length !== 2) return null
  
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]
  
  const monthIndex = months.indexOf(parts[0])
  if (monthIndex === -1) return null
  
  const year = parseInt(parts[1])
  if (isNaN(year)) return null
  
  return new Date(year, monthIndex, 15) // Use 15th day for consistency
}