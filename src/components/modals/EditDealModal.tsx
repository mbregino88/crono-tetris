'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateDeal } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import type { Deal } from '@/lib/types'

interface EditDealModalProps {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (updatedDeal: Deal) => void
}

export function EditDealModal({ deal, open, onOpenChange, onSuccess }: EditDealModalProps) {
  const [formData, setFormData] = useState<Partial<Deal>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form data when deal changes
  useEffect(() => {
    if (deal) {
      setFormData({
        nome_fundo: deal.nome_fundo || '',
        ticker_fundo: deal.ticker_fundo || '',
        cnpj_fundo: deal.cnpj_fundo || '',
        gestora: deal.gestora || '',
        publico_alvo: deal.publico_alvo || '',
        veiculo: deal.veiculo || '',
        produto: deal.produto || '',
        setor: deal.setor || '',
        principal_indexador: deal.principal_indexador || '',
        tipo: deal.tipo || '',
        tipo_cota: deal.tipo_cota || '',
        ipo_fon: deal.ipo_fon || '',
        data_janela: deal.data_janela || '',
        data_dp: deal.data_dp || '',
        data_sobras: deal.data_sobras || '',
        data_roadshow: deal.data_roadshow || '',
        data_bookbuilding: deal.data_bookbuilding || '',
        data_liquidacao: deal.data_liquidacao || '',
        oferta_base: deal.oferta_base || 0,
        oferta_minima: deal.oferta_minima || 0,
        volume_liquidado: deal.volume_liquidado || 0,
        receita_potencial: deal.receita_potencial || 0,
        receita_estimada: deal.receita_estimada || 0,
        demanda_estimada_total: deal.demanda_estimada_total || 0,
        demanda_pedra: deal.demanda_pedra || 0,
        demanda_inst: deal.demanda_inst || 0,
        demanda_varejo: deal.demanda_varejo || 0,
        vol_ancoragem: deal.vol_ancoragem || 0,
        fee_est: deal.fee_est || 0,
        fee_canal: deal.fee_canal || 0,
        rep_gestao: deal.rep_gestao || 0,
        rep_performance: deal.rep_performance || 0,
        perc_book: deal.perc_book || 0,
        canais: deal.canais || '',
        resp_dcm: deal.resp_dcm || '',
        bup_dcm: deal.bup_dcm || '',
        resp_dist: deal.resp_dist || '',
        bup_dist: deal.bup_dist || '',
        aprov_leitura: deal.aprov_leitura || '',
        aprov_analise: deal.aprov_analise || '',
        ancoragem_gf_alt: deal.ancoragem_gf_alt || '',
        status_deal: deal.status_deal || ''
      })
      setError(null)
    }
  }, [deal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deal) return

    setLoading(true)
    setError(null)

    try {
      // Convert empty strings to null for optional fields
      const sanitizedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      )

      const updatedDeal = await updateDeal(deal.deal_uuid, sanitizedData)
      
      if (updatedDeal) {
        onSuccess(updatedDeal)
        onOpenChange(false)
      } else {
        setError('Failed to update deal. Please try again.')
      }
    } catch (error) {
      console.error('Error updating deal:', error)
      setError(`Error updating deal: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Deal) => (value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!deal) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Deal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome_fundo">Nome do Fundo *</Label>
                <Input
                  id="nome_fundo"
                  value={formData.nome_fundo || ''}
                  onChange={(e) => handleInputChange('nome_fundo')(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ticker_fundo">Ticker</Label>
                <Input
                  id="ticker_fundo"
                  value={formData.ticker_fundo || ''}
                  onChange={(e) => handleInputChange('ticker_fundo')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cnpj_fundo">CNPJ</Label>
                <Input
                  id="cnpj_fundo"
                  value={formData.cnpj_fundo || ''}
                  onChange={(e) => handleInputChange('cnpj_fundo')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gestora">Gestora</Label>
                <Input
                  id="gestora"
                  value={formData.gestora || ''}
                  onChange={(e) => handleInputChange('gestora')(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Deal Characteristics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Características</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="veiculo">Veículo</Label>
                <Select
                  value={formData.veiculo || ''}
                  onValueChange={handleInputChange('veiculo')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FII">FII</SelectItem>
                    <SelectItem value="Debênture">Debênture</SelectItem>
                    <SelectItem value="CRI">CRI</SelectItem>
                    <SelectItem value="CRA">CRA</SelectItem>
                    <SelectItem value="LCA">LCA</SelectItem>
                    <SelectItem value="LCI">LCI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="produto">Produto</Label>
                <Select
                  value={formData.produto || ''}
                  onValueChange={handleInputChange('produto')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Listado">Listado</SelectItem>
                    <SelectItem value="Cetipado">Cetipado</SelectItem>
                    <SelectItem value="R+">R+</SelectItem>
                    <SelectItem value="Tt. Ret.">Tt. Ret.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="setor">Setor</Label>
                <Input
                  id="setor"
                  value={formData.setor || ''}
                  onChange={(e) => handleInputChange('setor')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="principal_indexador">Indexador Principal</Label>
                <Input
                  id="principal_indexador"
                  value={formData.principal_indexador || ''}
                  onChange={(e) => handleInputChange('principal_indexador')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  value={formData.tipo || ''}
                  onChange={(e) => handleInputChange('tipo')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tipo_cota">Tipo de Cota</Label>
                <Input
                  id="tipo_cota"
                  value={formData.tipo_cota || ''}
                  onChange={(e) => handleInputChange('tipo_cota')(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Financeiras</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="oferta_base">Oferta Base (R$)</Label>
                <Input
                  id="oferta_base"
                  type="number"
                  step="0.01"
                  value={formData.oferta_base || ''}
                  onChange={(e) => handleInputChange('oferta_base')(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="oferta_minima">Oferta Mínima (R$)</Label>
                <Input
                  id="oferta_minima"
                  type="number"
                  step="0.01"
                  value={formData.oferta_minima || ''}
                  onChange={(e) => handleInputChange('oferta_minima')(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="volume_liquidado">Volume Liquidado (R$)</Label>
                <Input
                  id="volume_liquidado"
                  type="number"
                  step="0.01"
                  value={formData.volume_liquidado || ''}
                  onChange={(e) => handleInputChange('volume_liquidado')(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="receita_potencial">Receita Potencial (R$)</Label>
                <Input
                  id="receita_potencial"
                  type="number"
                  step="0.01"
                  value={formData.receita_potencial || ''}
                  onChange={(e) => handleInputChange('receita_potencial')(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="receita_estimada">Receita Estimada (R$)</Label>
                <Input
                  id="receita_estimada"
                  type="number"
                  step="0.01"
                  value={formData.receita_estimada || ''}
                  onChange={(e) => handleInputChange('receita_estimada')(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Datas</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="data_janela">Data Janela</Label>
                <Input
                  id="data_janela"
                  type="date"
                  value={formData.data_janela || ''}
                  onChange={(e) => handleInputChange('data_janela')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="data_dp">Data DP</Label>
                <Input
                  id="data_dp"
                  type="date"
                  value={formData.data_dp || ''}
                  onChange={(e) => handleInputChange('data_dp')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="data_sobras">Data Sobras</Label>
                <Input
                  id="data_sobras"
                  type="date"
                  value={formData.data_sobras || ''}
                  onChange={(e) => handleInputChange('data_sobras')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="data_roadshow">Data Roadshow</Label>
                <Input
                  id="data_roadshow"
                  type="date"
                  value={formData.data_roadshow || ''}
                  onChange={(e) => handleInputChange('data_roadshow')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="data_bookbuilding">Data Bookbuilding</Label>
                <Input
                  id="data_bookbuilding"
                  type="date"
                  value={formData.data_bookbuilding || ''}
                  onChange={(e) => handleInputChange('data_bookbuilding')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="data_liquidacao">Data Liquidação</Label>
                <Input
                  id="data_liquidacao"
                  type="date"
                  value={formData.data_liquidacao || ''}
                  onChange={(e) => handleInputChange('data_liquidacao')(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Team and Distribution */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Equipe e Distribuição</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resp_dcm">Responsável DCM</Label>
                <Input
                  id="resp_dcm"
                  value={formData.resp_dcm || ''}
                  onChange={(e) => handleInputChange('resp_dcm')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bup_dcm">Backup DCM</Label>
                <Input
                  id="bup_dcm"
                  value={formData.bup_dcm || ''}
                  onChange={(e) => handleInputChange('bup_dcm')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="resp_dist">Responsável Distribuição</Label>
                <Input
                  id="resp_dist"
                  value={formData.resp_dist || ''}
                  onChange={(e) => handleInputChange('resp_dist')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bup_dist">Backup Distribuição</Label>
                <Input
                  id="bup_dist"
                  value={formData.bup_dist || ''}
                  onChange={(e) => handleInputChange('bup_dist')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="canais">Canais</Label>
                <Input
                  id="canais"
                  value={formData.canais || ''}
                  onChange={(e) => handleInputChange('canais')(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status_deal">Status</Label>
                <Input
                  id="status_deal"
                  value={formData.status_deal || ''}
                  onChange={(e) => handleInputChange('status_deal')(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}