/**
 * Database enum definitions based on the mapping document
 * These match exactly with the Supabase database schema
 */

// Status Deal options
export const STATUS_DEAL_OPTIONS = ['Pre-Leitura', 'Leitura', 'Ativa', 'Encerrada', 'Dead', 'Backlog'] as const

// Publico Alvo options  
export const PUBLICO_ALVO_OPTIONS = ['PG', 'IQ', 'IP', 'TBD'] as const

// Veiculo options
export const VEICULO_OPTIONS = [
  'FII', 
  'FI-Agro', 
  'FI-Infra', 
  'FIDC', 
  'FIP', 
  'FIP-IE', 
  'FIP/PCO', 
  'FIC FIDC'
] as const

// Produto options
export const PRODUTO_OPTIONS = ['Listado', 'Cetipado', 'R+', 'Tt. Ret', 'TBD'] as const

// Setor options
export const SETOR_OPTIONS = [
  'Lajes', 
  'Shop', 
  'R.Urb', 
  'Hib', 
  'CRI', 
  'HF', 
  'Log', 
  'Infra', 
  'Agro', 
  'GC', 
  'Espec.', 
  'Outro'
] as const

// Principal Indexador options
export const PRINCIPAL_INDEXADOR_OPTIONS = [
  'CDI', 
  'IPCA', 
  '%DI', 
  'Pre', 
  'Misto', 
  'N/A'
] as const

// IPO/FOn options
export const IPO_FON_OPTIONS = ['IPO', 'FOn', 'TBD'] as const

// Tipo Cota options
export const TIPO_COTA_OPTIONS = ['Unica', 'Sub', 'Mez', 'Senior'] as const

// Tipo options (for tipo field)
export const TIPO_OPTIONS = [
  'TIJOLO', 
  'CRI', 
  'AGRO', 
  'INFRA', 
  'ALTERNATIVO', 
  'FIDC'
] as const

// Approval options (S/N/TBD fields)
export const APPROVAL_OPTIONS = ['S', 'N', 'TBD'] as const

// Ancoragem options (S/N/TBD)
export const ANCORAGEM_OPTIONS = ['S', 'N', 'TBD'] as const

// Export type definitions
export type StatusDeal = typeof STATUS_DEAL_OPTIONS[number]
export type PublicoAlvo = typeof PUBLICO_ALVO_OPTIONS[number]
export type Veiculo = typeof VEICULO_OPTIONS[number]
export type Produto = typeof PRODUTO_OPTIONS[number]
export type Setor = typeof SETOR_OPTIONS[number]
export type PrincipalIndexador = typeof PRINCIPAL_INDEXADOR_OPTIONS[number]
export type IpoFon = typeof IPO_FON_OPTIONS[number]
export type TipoCota = typeof TIPO_COTA_OPTIONS[number]
export type Tipo = typeof TIPO_OPTIONS[number]
export type Approval = typeof APPROVAL_OPTIONS[number]
export type Ancoragem = typeof ANCORAGEM_OPTIONS[number]

// Helper function to get label for approval fields
export function getApprovalLabel(value: string | null): string {
  if (value === 'S') return 'Sim'
  if (value === 'N') return 'Não'
  return 'Pendente'
}

// Field labels mapping (Portuguese)
export const FIELD_LABELS = {
  deal_uuid: 'Deal ID',
  criado_em: 'Criado em',
  status_deal: 'Status',
  nome_fundo: 'Deal',
  ticker_fundo: 'Ticker',
  cnpj_fundo: 'CNPJ',
  gestora: 'Gestora',
  publico_alvo: 'Público Alvo',
  data_janela: 'Janela',
  data_dp: 'Data Enc. DP',
  data_sobras: 'Data Enc. Sobras',
  data_roadshow: 'Data Roadshow',
  data_bookbuilding: 'Data Bookbuilding',
  data_liquidacao: 'Data Liquidação',
  oferta_base: 'Oferta Base (R$)',
  oferta_minima: 'Oferta Mínima (R$)',
  volume_liquidado: 'Volume Liquidado (R$)',
  demanda_estimada_total: 'Demanda Estimada Total',
  demanda_pedra: 'Demanda Pedra',
  demanda_inst: 'Demanda Institucional',
  demanda_varejo: 'Demanda Varejo',
  ancoragem_gf_alt: 'Ancoragem?',
  vol_ancoragem: 'Volume Ancoragem',
  veiculo: 'Veículo',
  produto: 'Produto',
  setor: 'Setor',
  principal_indexador: 'Indexador Principal',
  ipo_fon: 'IPO/Fon',
  tipo: 'Tipo',
  tipo_cota: 'Tipo da Cota',
  fee_est: 'Fee Estruturação',
  fee_canal: 'Fee Canal',
  rep_gestao: 'ck',
  rep_performance: 'Repasse Tx. Performance',
  receita_potencial: 'Receita Potencial (R$)',
  receita_estimada: 'Receita Estimada (R$)',
  canais: 'Canais',
  arpov_leitura: 'Aprov. Leitura?',
  aprov_leitura: 'Aprov. Leitura?',
  aprov_analise: 'Aprov. Análise?',
  resp_dcm: 'Responsável DCM',
  bup_dcm: 'Backup DCM',
  resp_dist: 'Responsável Dist.',
  bup_dist: 'Backup Dist.',
  perc_book: '% Book',
  backlog_order: 'Ordem Backlog'
} as const

export default {
  STATUS_DEAL_OPTIONS,
  PUBLICO_ALVO_OPTIONS,
  VEICULO_OPTIONS,
  PRODUTO_OPTIONS,
  SETOR_OPTIONS,
  PRINCIPAL_INDEXADOR_OPTIONS,
  IPO_FON_OPTIONS,
  TIPO_COTA_OPTIONS,
  TIPO_OPTIONS,
  APPROVAL_OPTIONS,
  ANCORAGEM_OPTIONS,
  FIELD_LABELS,
  getApprovalLabel
}