import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting for Brazilian Real
export function formatCurrency(value: number): string {
  if (!value) return "R$ 0"
  
  const millions = value / 1000000
  
  if (millions >= 1000) {
    const billions = millions / 1000
    if (billions === Math.floor(billions)) {
      return `R$ ${Math.floor(billions)} bi`
    } else {
      return `R$ ${billions.toFixed(1).replace('.', ',')} bi`
    }
  } else if (millions >= 1) {
    if (millions === Math.floor(millions)) {
      return `R$ ${Math.floor(millions)} mi`
    } else {
      const formatted = millions.toFixed(1).replace('.', ',')
      const clean = formatted.endsWith(',0') ? formatted.slice(0, -2) : formatted
      return `R$ ${clean} mi`
    }
  } else {
    return `R$ ${Math.floor(value / 1000)} mil`
  }
}

// Approximated currency formatting - more rounded for deal cards
export function formatCurrencyApproximate(value: number): string {
  if (!value) return "R$ 0"
  
  const millions = value / 1000000
  
  if (millions >= 1000) {
    const billions = millions / 1000
    return `R$ ${Math.round(billions)} bi`
  } else if (millions >= 1) {
    return `R$ ${Math.round(millions)} mi`
  } else {
    return `R$ ${Math.round(value / 1000)} mil`
  }
}