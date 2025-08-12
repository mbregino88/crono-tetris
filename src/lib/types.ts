export interface Deal {
  // Primary key and metadata
  deal_uuid: string
  criado_em: string
  status_deal: string | null
  
  // Fund information
  nome_fundo: string | null
  ticker_fundo: string | null
  cnpj_fundo: string | null
  gestora: string | null
  publico_alvo: string
  
  // Important dates
  data_janela: string | null
  data_dp: string | null
  data_sobras: string | null
  data_roadshow: string | null
  data_bookbuilding: string | null
  data_liquidacao: string | null
  
  // Financial data
  oferta_base: number | null
  oferta_minima: number | null
  volume_liquidado: number | null
  demanda_estimada_total: number | null
  demanda_pedra: number | null
  demanda_inst: number | null
  demanda_varejo: number | null
  ancoragem_gf_alt: string | null
  vol_ancoragem: number | null
  
  // Deal characteristics
  veiculo: string | null
  produto: string | null
  setor: string | null
  principal_indexador: string | null
  ipo_fon: string | null
  tipo: string | null
  
  // Fees
  fee_est: number | null
  fee_canal: number | null
  rep_gestao: number | null
  rep_performance: number | null

  // Revenue fields
  receita_estimada: number | null
  receita_potencial: number | null
  
  // Distribution
  canais: string | null
  
  // Internal fields
  aprov_leitura: string
  aprov_analise: string
  resp_dcm: string
  bup_dcm: string | null
  resp_dist: string | null
  bup_dist: string | null
  tipo_cota: string | null
  perc_book: number | null
  
  // Backlog ordering
  backlog_order: number | null
}

export type GroupingField = keyof Pick<Deal, 'setor' | 'veiculo' | 'principal_indexador' | 'ipo_fon' | 'produto' | 'tipo'>

export interface KanbanCell {
  rowKey: string
  colKey: string
  deals: Deal[]
}

export interface SummaryStats {
  count: number
  volume: number
  revenue: number
}

export interface HeaderControls {
  groupBy: GroupingField
  stickyHorizontal: boolean
  stickyVertical: boolean
}