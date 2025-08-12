'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { updateDeal } from '@/lib/supabase'
import { logObjectChanges } from '@/lib/audit'
import { formatNumberForDisplay, parseFormattedNumber } from '@/lib/formatting'
import type { Deal } from '@/lib/types'
import {
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
  FIELD_LABELS
} from '@/lib/database-enums'

interface EditDealModalProps {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (updatedDeal: Deal) => void
}

export function EditDealModalV2({ deal, open, onOpenChange, onSuccess }: EditDealModalProps) {
  const [formData, setFormData] = useState<Partial<Deal>>({})
  const [formattedNumbers, setFormattedNumbers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form data when deal changes
  useEffect(() => {
    if (deal) {
      setFormData(deal)
      
      // Format numeric fields for display
      const formatted: Record<string, string> = {}
      const numericFields = [
        'oferta_base', 'oferta_minima', 'volume_liquidado',
        'demanda_estimada_total', 'demanda_pedra', 'demanda_inst', 'demanda_varejo',
        'vol_ancoragem', 'fee_est', 'fee_canal', 'rep_gestao', 'rep_performance',
        'receita_potencial', 'receita_estimada', 'perc_book'
      ]
      
      numericFields.forEach(field => {
        const value = deal[field as keyof Deal]
        if (typeof value === 'number') {
          formatted[field] = formatNumberForDisplay(value)
        }
      })
      
      setFormattedNumbers(formatted)
    }
  }, [deal])

  const handleInputChange = (field: keyof Deal, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNumberChange = (field: keyof Deal, displayValue: string) => {
    setFormattedNumbers(prev => ({
      ...prev,
      [field]: displayValue
    }))
    
    const numericValue = parseFormattedNumber(displayValue)
    handleInputChange(field, numericValue)
  }

  const handleSubmit = async () => {
    if (!deal) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Log changes for audit
      await logObjectChanges(
        deal.deal_uuid,
        deal.nome_fundo || 'Unknown Deal',
        deal as unknown as Record<string, unknown>,
        formData as unknown as Record<string, unknown>
      )
      
      // Update deal
      const updatedDeal = await updateDeal(deal.deal_uuid, formData)
      if (updatedDeal) {
        onSuccess({ ...deal, ...formData } as Deal)
        onOpenChange(false)
      } else {
        setError('Failed to update deal')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!deal) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Deal - {formData.nome_fundo || 'Sem nome'}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Read-only Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Informações do Sistema</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.deal_uuid}</Label>
                  <Input value={deal.deal_uuid} disabled className="text-xs h-8" />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.criado_em}</Label>
                  <Input value={new Date(deal.criado_em).toLocaleString('pt-BR')} disabled className="text-xs h-8" />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.perc_book}</Label>
                  <Input value={formattedNumbers.perc_book || '0'} disabled className="text-xs h-8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.receita_estimada}</Label>
                  <Input value={formattedNumbers.receita_estimada || '0'} disabled className="text-xs h-8 font-semibold text-green-600" />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.receita_potencial}</Label>
                  <Input value={formattedNumbers.receita_potencial || '0'} disabled className="text-xs h-8 font-semibold text-purple-600" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Status and Fund Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Identificação do Fundo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.status_deal}</Label>
                  <Select value={formData.status_deal || ''} onValueChange={(v) => handleInputChange('status_deal', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_DEAL_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.publico_alvo}</Label>
                  <Select value={formData.publico_alvo || ''} onValueChange={(v) => handleInputChange('publico_alvo', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione o público" />
                    </SelectTrigger>
                    <SelectContent>
                      {PUBLICO_ALVO_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.nome_fundo}</Label>
                  <Input 
                    value={formData.nome_fundo || ''} 
                    onChange={(e) => handleInputChange('nome_fundo', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.ticker_fundo}</Label>
                  <Input 
                    value={formData.ticker_fundo || ''} 
                    onChange={(e) => handleInputChange('ticker_fundo', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.cnpj_fundo}</Label>
                  <Input 
                    value={formData.cnpj_fundo || ''} 
                    onChange={(e) => handleInputChange('cnpj_fundo', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.gestora}</Label>
                  <Input 
                    value={formData.gestora || ''} 
                    onChange={(e) => handleInputChange('gestora', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Deal Characteristics */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Características do Deal</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.veiculo}</Label>
                  <Select value={formData.veiculo || ''} onValueChange={(v) => handleInputChange('veiculo', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEICULO_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.produto}</Label>
                  <Select value={formData.produto || ''} onValueChange={(v) => handleInputChange('produto', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUTO_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.setor}</Label>
                  <Select value={formData.setor || ''} onValueChange={(v) => handleInputChange('setor', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {SETOR_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.tipo}</Label>
                  <Select value={formData.tipo || ''} onValueChange={(v) => handleInputChange('tipo', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.tipo_cota}</Label>
                  <Select value={formData.tipo_cota || ''} onValueChange={(v) => handleInputChange('tipo_cota', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_COTA_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.principal_indexador}</Label>
                  <Select value={formData.principal_indexador || ''} onValueChange={(v) => handleInputChange('principal_indexador', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRINCIPAL_INDEXADOR_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.ipo_fon}</Label>
                  <Select value={formData.ipo_fon || ''} onValueChange={(v) => handleInputChange('ipo_fon', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {IPO_FON_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Datas Importantes</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.data_janela}</Label>
                  <Input 
                    type="date"
                    value={formData.data_janela || ''} 
                    onChange={(e) => handleInputChange('data_janela', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.data_dp}</Label>
                  <Input 
                    type="date"
                    value={formData.data_dp || ''} 
                    onChange={(e) => handleInputChange('data_dp', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.data_sobras}</Label>
                  <Input 
                    type="date"
                    value={formData.data_sobras || ''} 
                    onChange={(e) => handleInputChange('data_sobras', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.data_roadshow}</Label>
                  <Input 
                    type="date"
                    value={formData.data_roadshow || ''} 
                    onChange={(e) => handleInputChange('data_roadshow', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.data_bookbuilding}</Label>
                  <Input 
                    type="date"
                    value={formData.data_bookbuilding || ''} 
                    onChange={(e) => handleInputChange('data_bookbuilding', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.data_liquidacao}</Label>
                  <Input 
                    type="date"
                    value={formData.data_liquidacao || ''} 
                    onChange={(e) => handleInputChange('data_liquidacao', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Financial Data */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Dados Financeiros</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.oferta_base}</Label>
                  <Input 
                    value={formattedNumbers.oferta_base || ''} 
                    onChange={(e) => handleNumberChange('oferta_base', e.target.value)}
                    placeholder="0,00"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.oferta_minima}</Label>
                  <Input 
                    value={formattedNumbers.oferta_minima || ''} 
                    onChange={(e) => handleNumberChange('oferta_minima', e.target.value)}
                    placeholder="0,00"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.volume_liquidado}</Label>
                  <Input 
                    value={formattedNumbers.volume_liquidado || ''} 
                    onChange={(e) => handleNumberChange('volume_liquidado', e.target.value)}
                    placeholder="0,00"
                    className="h-8"
                  />
                </div>
              </div>
              
              <h4 className="text-xs font-semibold mt-4 mb-2">Demandas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.demanda_estimada_total}</Label>
                  <Input 
                    value={formattedNumbers.demanda_estimada_total || ''} 
                    onChange={(e) => handleNumberChange('demanda_estimada_total', e.target.value)}
                    placeholder="0,00"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.demanda_pedra}</Label>
                  <Input 
                    value={formattedNumbers.demanda_pedra || ''} 
                    onChange={(e) => handleNumberChange('demanda_pedra', e.target.value)}
                    placeholder="0,00"
                    className="h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.demanda_inst}</Label>
                  <Input 
                    value={formattedNumbers.demanda_inst || ''} 
                    onChange={(e) => handleNumberChange('demanda_inst', e.target.value)}
                    placeholder="0,00"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.demanda_varejo}</Label>
                  <Input 
                    value={formattedNumbers.demanda_varejo || ''} 
                    onChange={(e) => handleNumberChange('demanda_varejo', e.target.value)}
                    placeholder="0,00"
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Anchorage */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Ancoragem</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.ancoragem_gf_alt}</Label>
                  <Select value={formData.ancoragem_gf_alt || ''} onValueChange={(v) => handleInputChange('ancoragem_gf_alt', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ANCORAGEM_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>
                          {option === 'S' ? 'Sim' : 'Não'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.vol_ancoragem}</Label>
                  <Input 
                    value={formattedNumbers.vol_ancoragem || ''} 
                    onChange={(e) => handleNumberChange('vol_ancoragem', e.target.value)}
                    placeholder="0,00"
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Fees */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Taxas e Comissões</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.fee_est} (%)</Label>
                  <Input 
                    value={formattedNumbers.fee_est || ''} 
                    onChange={(e) => handleNumberChange('fee_est', e.target.value)}
                    placeholder="0,00"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.fee_canal} (%)</Label>
                  <Input 
                    value={formattedNumbers.fee_canal || ''} 
                    onChange={(e) => handleNumberChange('fee_canal', e.target.value)}
                    placeholder="0,00"
                    className="h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.rep_gestao} (%)</Label>
                  <Input 
                    value={formattedNumbers.rep_gestao || ''} 
                    onChange={(e) => handleNumberChange('rep_gestao', e.target.value)}
                    placeholder="0,00"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.rep_performance} (%)</Label>
                  <Input 
                    value={formattedNumbers.rep_performance || ''} 
                    onChange={(e) => handleNumberChange('rep_performance', e.target.value)}
                    placeholder="0,00"
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Approvals */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Aprovações</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.aprov_leitura}</Label>
                  <Select value={formData.aprov_leitura || ''} onValueChange={(v) => handleInputChange('aprov_leitura', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPROVAL_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>
                          {option === 'S' ? 'Sim' : 'Não'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.aprov_analise}</Label>
                  <Select value={formData.aprov_analise || ''} onValueChange={(v) => handleInputChange('aprov_analise', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPROVAL_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>
                          {option === 'S' ? 'Sim' : 'Não'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Team */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Equipe Responsável</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.resp_dcm}</Label>
                  <Input 
                    value={formData.resp_dcm || ''} 
                    onChange={(e) => handleInputChange('resp_dcm', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.bup_dcm}</Label>
                  <Input 
                    value={formData.bup_dcm || ''} 
                    onChange={(e) => handleInputChange('bup_dcm', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-xs">{FIELD_LABELS.resp_dist}</Label>
                  <Input 
                    value={formData.resp_dist || ''} 
                    onChange={(e) => handleInputChange('resp_dist', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">{FIELD_LABELS.bup_dist}</Label>
                  <Input 
                    value={formData.bup_dist || ''} 
                    onChange={(e) => handleInputChange('bup_dist', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Distribution */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Distribuição</h3>
              <div>
                <Label className="text-xs">{FIELD_LABELS.canais}</Label>
                <Textarea 
                  value={formData.canais || ''} 
                  onChange={(e) => handleInputChange('canais', e.target.value)}
                  placeholder="Descreva os canais de distribuição"
                  className="min-h-[60px]"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}