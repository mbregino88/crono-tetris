'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { getVehicleColor, getIndexerColor, getSectorColor, getProductColor, getTipoColor } from '@/lib/colors'
import { deleteDeal, updateDeal } from '@/lib/supabase'
import { logDealDeletion, logStatusChange } from '@/lib/audit'
import { EditDealModalV2 } from './EditDealModalV2'
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'
import { StatusDropdown, type DealStatus } from '@/components/ui/status-dropdown'
import { Pencil, Trash2 } from 'lucide-react'
import type { Deal } from '@/lib/types'

interface DealDetailsModalProps {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDealUpdated?: (updatedDeal: Deal) => void
  onDealDeleted?: (dealId: string) => void
}

export function DealDetailsModal({ deal, open, onOpenChange, onDealUpdated, onDealDeleted }: DealDetailsModalProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  
  if (!deal) return null

  const handleStatusChange = async (newStatus: DealStatus) => {
    setIsUpdatingStatus(true)
    try {
      const oldStatus = deal.status_deal || ''
      const updatedDeal = await updateDeal(deal.deal_uuid, { status_deal: newStatus })
      if (updatedDeal) {
        // Log the status change
        await logStatusChange(
          deal.deal_uuid,
          deal.nome_fundo || 'Unknown',
          oldStatus,
          newStatus
        )
        onDealUpdated?.(updatedDeal)
      }
    } catch (error) {
      console.error('Error updating deal status:', error)
      alert('Erro ao atualizar status. Tente novamente.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDeleteConfirm = async (reason: string) => {
    // Log the deletion with reason
    await logDealDeletion(
      deal.deal_uuid,
      deal.nome_fundo || 'Unknown',
      reason
    )
    
    const success = await deleteDeal(deal.deal_uuid)
    if (success) {
      onDealDeleted?.(deal.deal_uuid)
      onOpenChange(false)
    } else {
      throw new Error('Failed to delete deal')
    }
  }

  const handleEditSuccess = (updatedDeal: Deal) => {
    onDealUpdated?.(updatedDeal)
    setShowEditModal(false)
  }

  // Get colors for all tags
  const vehicleColor = getVehicleColor(deal.veiculo || 'Outros')
  const indexerColor = getIndexerColor(deal.principal_indexador || 'Outros')
  const sectorColor = getSectorColor(deal.setor || 'Outros')
  const productColor = getProductColor(deal.produto || 'Outros')
  const tipoColor = getTipoColor(deal.tipo_cota || 'Outros')

  // Get revenue from database fields
  const receitaEstimada = deal.receita_estimada || 0
  const receitaPotencial = deal.receita_potencial || 0

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const formatPercentage = (value: number | null) => {
    if (!value) return 'N/A'
    return `${value.toFixed(2)}%`
  }

  const formatApprovalValue = (value: string | null) => {
    if (!value) return 'Não informado'
    switch (value) {
      case 'S': return 'Sim'
      case 'N': return 'Não'
      case 'TBD': return 'A definir'
      default: return value
    }
  }

  const getApprovalStyle = (value: string | null) => {
    switch (value) {
      case 'S': return 'text-green-600 font-semibold'
      case 'N': return 'text-red-600 font-semibold'
      case 'TBD': return 'text-yellow-600 font-semibold'
      default: return 'text-gray-900'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {deal.nome_fundo || 'Deal sem nome'}
              </DialogTitle>
              <DialogDescription>
                {deal.ticker_fundo && (
                  <span className="text-sm text-gray-600">Ticker: {deal.ticker_fundo}</span>
                )}
              </DialogDescription>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
          
          {/* Status and Tags Row */}
          <div className="flex items-center gap-2 pt-3 flex-wrap">
            <StatusDropdown
              value={deal.status_deal}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
            />
            
            {/* All 5 colored tags */}
            <span className={cn(
              "inline-block px-2 py-0.5 text-xs font-medium rounded",
              vehicleColor.bg,
              vehicleColor.text
            )}>
              {vehicleColor.label}
            </span>
            <span className={cn(
              "inline-block px-2 py-0.5 text-xs font-medium rounded",
              indexerColor.bg,
              indexerColor.text
            )}>
              {indexerColor.label}
            </span>
            <span className={cn(
              "inline-block px-2 py-0.5 text-xs font-medium rounded",
              sectorColor.bg,
              sectorColor.text
            )}>
              {sectorColor.label}
            </span>
            <span className={cn(
              "inline-block px-2 py-0.5 text-xs font-medium rounded",
              productColor.bg,
              productColor.text
            )}>
              {productColor.label}
            </span>
            <span className={cn(
              "inline-block px-2 py-0.5 text-xs font-medium rounded",
              tipoColor.bg,
              tipoColor.text
            )}>
              {tipoColor.label}
            </span>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            
            {/* Fund Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Informações do Fundo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">CNPJ:</span>
                    <p className="text-gray-900">{deal.cnpj_fundo || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Gestora:</span>
                    <p className="text-gray-900">{deal.gestora || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Público Alvo:</span>
                    <p className="text-gray-900">{deal.publico_alvo || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">IPO/FOn:</span>
                    <p className="text-gray-900">{deal.ipo_fon || 'Não informado'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                  <div>
                    <span className="font-medium text-gray-600">Tipo:</span>
                    <p className="text-gray-900">{deal.tipo || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Tipo de Cota:</span>
                    <p className="text-gray-900">{deal.tipo_cota || 'Não informado'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Data */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Dados Financeiros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Oferta Base:</span>
                    <p className="text-green-600 font-semibold">
                      {formatCurrency(deal.oferta_base || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Volume Liquidado:</span>
                    <p className="text-green-600 font-semibold">
                      {formatCurrency(deal.volume_liquidado || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Demanda Total:</span>
                    <p className="text-blue-600 font-semibold">
                      {formatCurrency(deal.demanda_estimada_total || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Receita Estimada:</span>
                    <p className="text-purple-600 font-semibold">
                      {formatCurrency(receitaEstimada)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Receita Potencial:</span>
                    <p className="text-blue-600 font-semibold">
                      {formatCurrency(receitaPotencial)}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Fee Estruturação:</span>
                    <p className="text-gray-900">{formatPercentage(deal.fee_est)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Fee Canal:</span>
                    <p className="text-gray-900">{formatPercentage(deal.fee_canal)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">% Book:</span>
                    <p className="text-gray-900">{formatPercentage(deal.perc_book)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Datas Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Data Janela:</span>
                    <p className="text-gray-900">{formatDate(deal.data_janela)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Data DP:</span>
                    <p className="text-gray-900">{formatDate(deal.data_dp)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Data Roadshow:</span>
                    <p className="text-gray-900">{formatDate(deal.data_roadshow)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Data Liquidação:</span>
                    <p className="text-gray-900">{formatDate(deal.data_liquidacao)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Data Bookbuilding:</span>
                    <p className="text-gray-900">{formatDate(deal.data_bookbuilding)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Data Sobras:</span>
                    <p className="text-gray-900">{formatDate(deal.data_sobras)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Internal Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Informações Internas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Responsável DCM:</span>
                    <p className="text-gray-900">{deal.resp_dcm || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Backup DCM:</span>
                    <p className="text-gray-900">{deal.bup_dcm || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Responsável Distribuição:</span>
                    <p className="text-gray-900">{deal.resp_dist || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Backup Distribuição:</span>
                    <p className="text-gray-900">{deal.bup_dist || 'Não informado'}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Aprovação Leitura:</span>
                    <p className={getApprovalStyle(deal.aprov_leitura)}>
                      {formatApprovalValue(deal.aprov_leitura)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Aprovação Análise:</span>
                    <p className={getApprovalStyle(deal.aprov_analise)}>
                      {formatApprovalValue(deal.aprov_analise)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Financial Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Detalhes da Demanda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Demanda Pedra:</span>
                    <p className="text-blue-600 font-medium">
                      {formatCurrency(deal.demanda_pedra || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Demanda Institucional:</span>
                    <p className="text-blue-600 font-medium">
                      {formatCurrency(deal.demanda_inst || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Demanda Varejo:</span>
                    <p className="text-blue-600 font-medium">
                      {formatCurrency(deal.demanda_varejo || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Volume Ancoragem:</span>
                    <p className="text-gray-900">
                      {formatCurrency(deal.vol_ancoragem || 0)}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Ancoragem GF Alt:</span>
                  <p className={`mt-1 ${getApprovalStyle(deal.ancoragem_gf_alt)}`}>
                    {formatApprovalValue(deal.ancoragem_gf_alt)}
                  </p>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Canais:</span>
                  <p className="text-gray-900 mt-1">{deal.canais || 'Não informado'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Oferta Mínima:</span>
                    <p className="text-green-600 font-medium">
                      {formatCurrency(deal.oferta_minima || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Rep. Gestão:</span>
                    <p className="text-gray-900">{formatPercentage(deal.rep_gestao)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Rep. Performance:</span>
                    <p className="text-gray-900">{formatPercentage(deal.rep_performance)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Criado em:</span>
                    <p className="text-gray-900">{formatDate(deal.criado_em)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Edit Deal Modal */}
        <EditDealModalV2
          deal={deal}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleEditSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteConfirm}
          dealName={deal.nome_fundo || 'Unknown Deal'}
        />
      </DialogContent>
    </Dialog>
  )
}