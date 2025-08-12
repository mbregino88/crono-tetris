'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => Promise<void>
  dealName: string
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  dealName
}: DeleteConfirmationDialogProps) {
  const [reason, setReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Por favor, forneça um motivo para a exclusão')
      return
    }

    if (reason.trim().length < 10) {
      setError('O motivo deve ter pelo menos 10 caracteres')
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await onConfirm(reason.trim())
      setReason('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting deal:', error)
      setError('Erro ao excluir o deal. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setReason('')
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Esta ação não pode ser desfeita
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              Você está prestes a excluir o deal:
            </p>
            <p className="font-semibold text-amber-900 mt-1">
              {dealName}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Motivo da exclusão <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError('')
              }}
              placeholder="Descreva o motivo para excluir este deal..."
              className="min-h-[100px] resize-none"
              disabled={isDeleting}
            />
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
            <p className="text-xs text-gray-500">
              Mínimo de 10 caracteres. Esta informação será registrada no log de auditoria.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || !reason.trim()}
          >
            {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}