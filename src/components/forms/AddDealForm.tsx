'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { createDeal } from '@/lib/supabase'
import type { Deal } from '@/lib/types'
import {
  STATUS_DEAL_OPTIONS,
  PUBLICO_ALVO_OPTIONS,
  VEICULO_OPTIONS,
  PRODUTO_OPTIONS,
  SETOR_OPTIONS,
  PRINCIPAL_INDEXADOR_OPTIONS,
  TIPO_COTA_OPTIONS,
  TIPO_OPTIONS,
  APPROVAL_OPTIONS,
  ANCORAGEM_OPTIONS,
} from '@/lib/database-enums'

// Validation schema based on schema-updated.sql - matches TypeScript interface exactly
const addDealSchema = z.object({
  // Fund information
  nome_fundo: z.string().optional(),
  ticker_fundo: z.string().optional(),
  cnpj_fundo: z.string().optional(),
  gestora: z.string().optional(),
  publico_alvo: z.string().optional(),

  // Important dates
  data_janela: z.string().optional(),
  data_dp: z.string().optional(),
  data_sobras: z.string().optional(),
  data_roadshow: z.string().optional(),
  data_bookbuilding: z.string().optional(),
  data_liquidacao: z.string().optional(),

  // Financial data
  oferta_base: z.number().optional(),
  oferta_minima: z.number().optional(),
  volume_liquidado: z.number().optional(),
  demanda_estimada_total: z.number().optional(),
  demanda_pedra: z.number().optional(),
  demanda_inst: z.number().optional(),
  demanda_varejo: z.number().optional(),
  ancoragem_gf_alt: z.string().optional(),
  vol_ancoragem: z.number().optional(),

  // Deal characteristics
  veiculo: z.string().optional(),
  produto: z.string().optional(),
  setor: z.string().optional(),
  principal_indexador: z.string().optional(),
  ipo_fon: z.string().optional(),
  tipo: z.string().optional(),
  tipo_cota: z.string().optional(),

  // Fees
  fee_est: z.number().optional(),
  fee_canal: z.number().optional(),
  rep_gestao: z.number().optional(),
  rep_performance: z.number().optional(),
  perc_book: z.number().optional(),

  // Distribution
  canais: z.string().optional(),

  // Internal fields
  aprov_leitura: z.string().optional(),
  aprov_analise: z.string().optional(),
  resp_dcm: z.string().optional(),
  bup_dcm: z.string().optional(),
  resp_dist: z.string().optional(),
  bup_dist: z.string().optional(),

  // Status (defaults to Pre-Leitura)
  status_deal: z.string().optional()

  // NOTE: receita_estimada and receita_potencial are auto-calculated by database triggers
})

type AddDealFormData = z.infer<typeof addDealSchema>

interface AddDealFormProps {
  onSuccess: (deal: Deal) => void
  onCancel: () => void
}


export function AddDealForm({ onSuccess, onCancel }: AddDealFormProps) {
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting }
  } = useForm<AddDealFormData>({
    resolver: zodResolver(addDealSchema),
    defaultValues: {
      status_deal: 'Pre-Leitura'
    }
  })

  const onSubmit = async (data: AddDealFormData) => {
    try {
      
      // Convert numeric string inputs to numbers and handle empty strings
      // Only include fields that exist in the Deal interface
      const processedData: Omit<Deal, 'deal_uuid' | 'criado_em'> = {
        // Status and identification
        status_deal: data.status_deal || 'Pre-Leitura',
        
        // Fund information
        nome_fundo: data.nome_fundo || null,
        ticker_fundo: data.ticker_fundo || null,
        cnpj_fundo: data.cnpj_fundo || null,
        gestora: data.gestora || null,
        publico_alvo: data.publico_alvo || 'Geral',
        
        // Important dates (convert to ISO string if provided)
        data_janela: data.data_janela || null,
        data_dp: data.data_dp || null,
        data_sobras: data.data_sobras || null,
        data_roadshow: data.data_roadshow || null,
        data_bookbuilding: data.data_bookbuilding || null,
        data_liquidacao: data.data_liquidacao || null,
        
        // Financial data (convert to numbers)
        oferta_base: data.oferta_base ? Number(data.oferta_base) : null,
        oferta_minima: data.oferta_minima ? Number(data.oferta_minima) : null,
        volume_liquidado: data.volume_liquidado ? Number(data.volume_liquidado) : null,
        demanda_estimada_total: data.demanda_estimada_total ? Number(data.demanda_estimada_total) : null,
        demanda_pedra: data.demanda_pedra ? Number(data.demanda_pedra) : null,
        demanda_inst: data.demanda_inst ? Number(data.demanda_inst) : null,
        demanda_varejo: data.demanda_varejo ? Number(data.demanda_varejo) : null,
        ancoragem_gf_alt: data.ancoragem_gf_alt || null,
        vol_ancoragem: data.vol_ancoragem ? Number(data.vol_ancoragem) : null,
        
        // Deal characteristics
        veiculo: data.veiculo || null,
        produto: data.produto || null,
        setor: data.setor || null,
        principal_indexador: data.principal_indexador || null,
        ipo_fon: data.ipo_fon || null,
        tipo: data.tipo || null,
        
        // Fees
        fee_est: data.fee_est ? Number(data.fee_est) : null,
        fee_canal: data.fee_canal ? Number(data.fee_canal) : null,
        rep_gestao: data.rep_gestao ? Number(data.rep_gestao) : null,
        rep_performance: data.rep_performance ? Number(data.rep_performance) : null,
        
        // Revenue fields (will be calculated by triggers/backend)
        receita_estimada: null,
        receita_potencial: null,
        
        // Distribution
        canais: data.canais || null,
        
        // Internal fields
        aprov_leitura: data.aprov_leitura || 'TBD',
        aprov_analise: data.aprov_analise || 'TBD',
        resp_dcm: data.resp_dcm || 'Não definido',
        bup_dcm: data.bup_dcm || null,
        resp_dist: data.resp_dist || null,
        bup_dist: data.bup_dist || null,
        tipo_cota: data.tipo_cota || null,
        perc_book: data.perc_book ? Number(data.perc_book) : null,
        
        // Backlog ordering (null for new deals)
        backlog_order: null
      }
      
      const newDeal = await createDeal(processedData)
      
      if (newDeal) {
        onSuccess(newDeal)
      } else {
        throw new Error('Failed to create deal')
      }
    } catch (error) {
      console.error('Error creating deal:', error)
      alert('Erro ao criar deal. Verifique os dados e tente novamente.')
    }
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <ScrollArea className="h-[600px] pr-4">
        {/* Fund Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações do Fundo</h3>
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome_fundo">Nome do Fundo</Label>
              <Input
                id="nome_fundo"
                {...register('nome_fundo')}
                placeholder="Nome do fundo"
              />
            </div>
            
            <div>
              <Label htmlFor="ticker_fundo">Ticker</Label>
              <Input
                id="ticker_fundo"
                {...register('ticker_fundo')}
                placeholder="Ticker do fundo"
              />
            </div>
            
            <div>
              <Label htmlFor="cnpj_fundo">CNPJ</Label>
              <Input
                id="cnpj_fundo"
                {...register('cnpj_fundo')}
                placeholder="CNPJ do fundo"
              />
            </div>
            
            <div>
              <Label htmlFor="gestora">Gestora</Label>
              <Input
                id="gestora"
                {...register('gestora')}
                placeholder="Nome da gestora"
              />
            </div>

            <div>
              <Label htmlFor="publico_alvo">Público Alvo</Label>
              <Select onValueChange={(value) => setValue('publico_alvo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o público alvo" />
                </SelectTrigger>
                <SelectContent>
                  {PUBLICO_ALVO_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Deal Characteristics */}
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Características do Deal</h3>
          <Separator />
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="veiculo">Veículo</Label>
              <Select onValueChange={(value) => setValue('veiculo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o veículo" />
                </SelectTrigger>
                <SelectContent>
                  {VEICULO_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="produto">Produto</Label>
              <Select onValueChange={(value) => setValue('produto', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUTO_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="setor">Setor</Label>
              <Select onValueChange={(value) => setValue('setor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {SETOR_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="principal_indexador">Indexador Principal</Label>
              <Select onValueChange={(value) => setValue('principal_indexador', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o indexador" />
                </SelectTrigger>
                <SelectContent>
                  {PRINCIPAL_INDEXADOR_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select onValueChange={(value) => setValue('tipo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipo_cota">Tipo de Cota</Label>
              <Select onValueChange={(value) => setValue('tipo_cota', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de cota" />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_COTA_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ipo_fon">IPO/FOn</Label>
              <Select onValueChange={(value) => setValue('ipo_fon', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione IPO/FOn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IPO">IPO</SelectItem>
                  <SelectItem value="Follow-on">Follow-on</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Important Dates */}
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Datas Importantes</h3>
          <Separator />
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="data_janela">Data Janela</Label>
              <Input
                id="data_janela"
                type="date"
                {...register('data_janela')}
              />
            </div>
            
            <div>
              <Label htmlFor="data_dp">Data DP</Label>
              <Input
                id="data_dp"
                type="date"
                {...register('data_dp')}
              />
            </div>
            
            <div>
              <Label htmlFor="data_sobras">Data Sobras</Label>
              <Input
                id="data_sobras"
                type="date"
                {...register('data_sobras')}
              />
            </div>
            
            <div>
              <Label htmlFor="data_roadshow">Data Roadshow</Label>
              <Input
                id="data_roadshow"
                type="date"
                {...register('data_roadshow')}
              />
            </div>

            <div>
              <Label htmlFor="data_bookbuilding">Data Bookbuilding</Label>
              <Input
                id="data_bookbuilding"
                type="date"
                {...register('data_bookbuilding')}
              />
            </div>
            
            <div>
              <Label htmlFor="data_liquidacao">Data Liquidação</Label>
              <Input
                id="data_liquidacao"
                type="date"
                {...register('data_liquidacao')}
              />
            </div>
          </div>
        </div>

        {/* Financial Data */}
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Dados Financeiros</h3>
          <Separator />
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="oferta_base">Oferta Base (R$)</Label>
              <Input
                id="oferta_base"
                type="number"
                step="0.01"
                {...register('oferta_base', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="oferta_minima">Oferta Mínima (R$)</Label>
              <Input
                id="oferta_minima"
                type="number"
                step="0.01"
                {...register('oferta_minima', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="volume_liquidado">Volume Liquidado (R$)</Label>
              <Input
                id="volume_liquidado"
                type="number"
                step="0.01"
                {...register('volume_liquidado', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="demanda_estimada_total">Demanda Total (R$)</Label>
              <Input
                id="demanda_estimada_total"
                type="number"
                step="0.01"
                {...register('demanda_estimada_total', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="demanda_pedra">Demanda Pedra (R$)</Label>
              <Input
                id="demanda_pedra"
                type="number"
                step="0.01"
                {...register('demanda_pedra', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="demanda_inst">Demanda Institucional (R$)</Label>
              <Input
                id="demanda_inst"
                type="number"
                step="0.01"
                {...register('demanda_inst', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="demanda_varejo">Demanda Varejo (R$)</Label>
              <Input
                id="demanda_varejo"
                type="number"
                step="0.01"
                {...register('demanda_varejo', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="vol_ancoragem">Volume Ancoragem (R$)</Label>
              <Input
                id="vol_ancoragem"
                type="number"
                step="0.01"
                {...register('vol_ancoragem', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="fee_est">Fee Estruturação (%)</Label>
              <Input
                id="fee_est"
                type="number"
                step="0.01"
                {...register('fee_est', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="fee_canal">Fee Canal (%)</Label>
              <Input
                id="fee_canal"
                type="number"
                step="0.01"
                {...register('fee_canal', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="rep_gestao">Rep. Gestão (%)</Label>
              <Input
                id="rep_gestao"
                type="number"
                step="0.01"
                {...register('rep_gestao', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="rep_performance">Rep. Performance (%)</Label>
              <Input
                id="rep_performance"
                type="number"
                step="0.01"
                {...register('rep_performance', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="perc_book">% Book</Label>
              <Input
                id="perc_book"
                type="number"
                step="0.01"
                {...register('perc_book', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="ancoragem_gf_alt">Ancoragem GF Alt</Label>
              <Select onValueChange={(value) => setValue('ancoragem_gf_alt', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione ancoragem" />
                </SelectTrigger>
                <SelectContent>
                  {ANCORAGEM_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Revenue fields - Auto-calculated by database, shown as info only */}
            <div className="col-span-3 p-4 bg-blue-50 rounded-lg border">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">📊 Receitas (Calculadas Automaticamente)</h4>
              <p className="text-xs text-blue-600">
                Os campos <strong>Receita Estimada</strong> e <strong>Receita Potencial</strong> são calculados automaticamente pelo sistema com base nos valores financeiros inseridos.
              </p>
            </div>
          </div>
        </div>

        {/* Internal Fields */}
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Campos Internos</h3>
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="resp_dcm">Responsável DCM</Label>
              <Input
                id="resp_dcm"
                {...register('resp_dcm')}
                placeholder="Nome do responsável"
              />
            </div>
            
            <div>
              <Label htmlFor="bup_dcm">Backup DCM</Label>
              <Input
                id="bup_dcm"
                {...register('bup_dcm')}
                placeholder="Nome do backup"
              />
            </div>
            
            <div>
              <Label htmlFor="resp_dist">Responsável Distribuição</Label>
              <Input
                id="resp_dist"
                {...register('resp_dist')}
                placeholder="Nome do responsável"
              />
            </div>

            <div>
              <Label htmlFor="bup_dist">Backup Distribuição</Label>
              <Input
                id="bup_dist"
                {...register('bup_dist')}
                placeholder="Nome do backup"
              />
            </div>

            <div>
              <Label htmlFor="canais">Canais</Label>
              <Input
                id="canais"
                {...register('canais')}
                placeholder="Canais de distribuição"
              />
            </div>

            <div>
              <Label htmlFor="aprov_leitura">Aprovação Leitura</Label>
              <Select onValueChange={(value) => setValue('aprov_leitura', value)} defaultValue="TBD">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione aprovação" />
                </SelectTrigger>
                <SelectContent>
                  {APPROVAL_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="aprov_analise">Aprovação Análise</Label>
              <Select onValueChange={(value) => setValue('aprov_analise', value)} defaultValue="TBD">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione aprovação" />
                </SelectTrigger>
                <SelectContent>
                  {APPROVAL_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Status do Deal</h3>
          <Separator />
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="status_deal">Status</Label>
              <Select 
                defaultValue="Pre-Leitura" 
                onValueChange={(value) => setValue('status_deal', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_DEAL_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar Deal'}
        </Button>
      </div>
    </form>
  )
}