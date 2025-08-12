import { parseISO, format, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Safely parse an ISO date string with validation
 * @param dateString - The date string to parse
 * @returns Parsed Date object or null if invalid
 */
export function safeParseISO(dateString: string | null | undefined): Date | null {
  if (!dateString || typeof dateString !== 'string') {
    return null
  }
  
  // Check if it looks like a valid date string (basic validation)
  // Valid ISO dates: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss, etc.
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/
  if (!isoDateRegex.test(dateString)) {
    console.warn(`🗓️ Invalid date format detected: "${dateString}" - skipping date parsing`)
    return null
  }
  
  try {
    const date = parseISO(dateString)
    
    // Check if the parsed date is valid
    if (!isValid(date)) {
      console.warn(`🗓️ Invalid date parsed from: "${dateString}"`)
      return null
    }
    
    return date
  } catch (error) {
    console.error(`🗓️ Error parsing date "${dateString}":`, error)
    return null
  }
}

/**
 * Safely format a date string to MMM-yyyy format
 * @param dateString - The date string to format
 * @returns Formatted date string or 'Sem Data' if invalid
 */
export function safeFormatMonthYear(dateString: string | null | undefined): string {
  const date = safeParseISO(dateString)
  
  if (!date) {
    return 'Sem Data'
  }
  
  try {
    return format(date, 'MMM-yyyy', { locale: ptBR })
  } catch (error) {
    console.error(`🗓️ Error formatting date "${dateString}":`, error)
    return 'Sem Data'
  }
}

/**
 * Check if a date string is valid
 * @param dateString - The date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidDateString(dateString: string | null | undefined): boolean {
  return safeParseISO(dateString) !== null
}