// Dynamic color system for deal tags

interface ColorConfig {
  bg: string
  text: string
  label: string
}

// Vehicle type colors
const VEHICLE_COLORS: Record<string, ColorConfig> = {
  'Debênture': { bg: 'bg-blue-500', text: 'text-blue-600', label: 'Debênture' },
  'CRI': { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'CRI' },
  'CRA': { bg: 'bg-orange-500', text: 'text-orange-600', label: 'CRA' },
  'FII': { bg: 'bg-cyan-500', text: 'text-cyan-600', label: 'FII' },
  'FIDC': { bg: 'bg-pink-500', text: 'text-pink-600', label: 'FIDC' },
  'LCA': { bg: 'bg-lime-500', text: 'text-lime-600', label: 'LCA' },
  'LCI': { bg: 'bg-violet-500', text: 'text-violet-600', label: 'LCI' },
}

// Indexer colors  
const INDEXER_COLORS: Record<string, ColorConfig> = {
  'IPCA+': { bg: 'bg-purple-500', text: 'text-purple-600', label: 'IPCA+' },
  'CDI+': { bg: 'bg-teal-500', text: 'text-teal-600', label: 'CDI+' },
  'CDI': { bg: 'bg-sky-500', text: 'text-sky-600', label: 'CDI' },
  'IPCA': { bg: 'bg-indigo-500', text: 'text-indigo-600', label: 'IPCA' },
  'IGP-M': { bg: 'bg-rose-500', text: 'text-rose-600', label: 'IGP-M' },
  'TR+': { bg: 'bg-amber-500', text: 'text-amber-600', label: 'TR+' },
  'Selic': { bg: 'bg-slate-500', text: 'text-slate-600', label: 'Selic' },
  'Pré': { bg: 'bg-stone-500', text: 'text-stone-600', label: 'Pré' },
}

// Sector colors
const SECTOR_COLORS: Record<string, ColorConfig> = {
  'Agronegócio': { bg: 'bg-green-600', text: 'text-green-700', label: 'Agronegócio' },
  'Energia': { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Energia' },
  'Imobiliário': { bg: 'bg-red-500', text: 'text-red-600', label: 'Imobiliário' },
  'Logística': { bg: 'bg-indigo-600', text: 'text-indigo-700', label: 'Logística' },
  'Infraestrutura': { bg: 'bg-gray-600', text: 'text-gray-700', label: 'Infraestrutura' },
  'Varejo': { bg: 'bg-fuchsia-500', text: 'text-fuchsia-600', label: 'Varejo' },
  'Tecnologia': { bg: 'bg-blue-600', text: 'text-blue-700', label: 'Tecnologia' },
  'Saúde': { bg: 'bg-emerald-600', text: 'text-emerald-700', label: 'Saúde' },
  'Educação': { bg: 'bg-orange-600', text: 'text-orange-700', label: 'Educação' },
  'Financeiro': { bg: 'bg-purple-600', text: 'text-purple-700', label: 'Financeiro' },
}

// Product colors
const PRODUCT_COLORS: Record<string, ColorConfig> = {
  'Private Credit': { bg: 'bg-slate-600', text: 'text-slate-700', label: 'Private Credit' },
  'Real Estate': { bg: 'bg-amber-600', text: 'text-amber-700', label: 'Real Estate' },
  'Infrastructure': { bg: 'bg-zinc-600', text: 'text-zinc-700', label: 'Infrastructure' },
  'Agribusiness': { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Agribusiness' },
  'Structured': { bg: 'bg-neutral-600', text: 'text-neutral-700', label: 'Structured' },
  'Credit': { bg: 'bg-blue-700', text: 'text-blue-700', label: 'Credit' },
  'Mixed': { bg: 'bg-gradient-to-r from-blue-500 to-purple-500', text: 'text-purple-600', label: 'Mixed' },
  'Listado': { bg: 'bg-blue-500', text: 'text-blue-600', label: 'Listado' },
  'Cetipado': { bg: 'bg-green-500', text: 'text-green-600', label: 'Cetipado' },
  'R+': { bg: 'bg-purple-500', text: 'text-purple-600', label: 'R+' },
  'Tt. Ret.': { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Tt. Ret.' },
}

// Tipo (Tipo de Cota) colors
const TIPO_COLORS: Record<string, ColorConfig> = {
  'A': { bg: 'bg-emerald-600', text: 'text-white', label: 'Tipo A' },
  'B': { bg: 'bg-blue-600', text: 'text-white', label: 'Tipo B' },
  'C': { bg: 'bg-orange-600', text: 'text-white', label: 'Tipo C' },
  'Senior': { bg: 'bg-green-700', text: 'text-white', label: 'Senior' },
  'Sênior': { bg: 'bg-green-700', text: 'text-white', label: 'Sênior' },
  'Subordinada': { bg: 'bg-red-600', text: 'text-white', label: 'Subordinada' },
  'Subordinado': { bg: 'bg-red-600', text: 'text-white', label: 'Subordinado' },
  'Mezanino': { bg: 'bg-yellow-600', text: 'text-white', label: 'Mezanino' },
  'Preferencial': { bg: 'bg-purple-600', text: 'text-white', label: 'Preferencial' },
}

// Default colors for unknown values
const DEFAULT_COLORS: ColorConfig = { 
  bg: 'bg-gray-400', 
  text: 'text-gray-600', 
  label: 'N/A' 
}

/**
 * Get color configuration for a vehicle type
 */
export function getVehicleColor(vehicle: string): ColorConfig {
  return VEHICLE_COLORS[vehicle] || { ...DEFAULT_COLORS, label: vehicle || 'Outros' }
}

/**
 * Get color configuration for an indexer
 */
export function getIndexerColor(indexer: string): ColorConfig {
  return INDEXER_COLORS[indexer] || { ...DEFAULT_COLORS, label: indexer || 'Outros' }
}

/**
 * Get color configuration for a sector
 */
export function getSectorColor(sector: string): ColorConfig {
  return SECTOR_COLORS[sector] || { ...DEFAULT_COLORS, label: sector || 'Outros' }
}

/**
 * Get color configuration for a product
 */
export function getProductColor(product: string): ColorConfig {
  return PRODUCT_COLORS[product] || { ...DEFAULT_COLORS, label: product || 'Outros' }
}

/**
 * Get color configuration for a tipo de cota
 */
export function getTipoColor(tipo: string): ColorConfig {
  return TIPO_COLORS[tipo] || { ...DEFAULT_COLORS, label: tipo || 'Outros' }
}

/**
 * Get all available vehicle types
 */
export function getAvailableVehicles(): string[] {
  return Object.keys(VEHICLE_COLORS)
}

/**
 * Get all available indexers
 */
export function getAvailableIndexers(): string[] {
  return Object.keys(INDEXER_COLORS)
}

/**
 * Get all available sectors
 */
export function getAvailableSectors(): string[] {
  return Object.keys(SECTOR_COLORS)
}

/**
 * Get all available products
 */
export function getAvailableProducts(): string[] {
  return Object.keys(PRODUCT_COLORS)
}

/**
 * Get all available tipos
 */
export function getAvailableTipos(): string[] {
  return Object.keys(TIPO_COLORS)
}