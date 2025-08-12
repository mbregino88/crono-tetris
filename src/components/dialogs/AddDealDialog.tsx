'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AddDealForm } from '@/components/forms/AddDealForm'
import type { Deal } from '@/lib/types'

interface AddDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (deal: Deal) => void
}

export function AddDealDialog({ open, onOpenChange, onSuccess }: AddDealDialogProps) {
  const handleSuccess = (deal: Deal) => {
    onSuccess(deal)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Adicionar Novo Deal
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do novo deal. Os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <AddDealForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}