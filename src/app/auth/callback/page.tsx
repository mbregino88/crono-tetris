'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        
        // Check for error parameters in URL
        const errorCode = searchParams.get('error_code')
        const errorDescription = searchParams.get('error_description')
        const error = searchParams.get('error')
        
        if (error) {
          console.error('❌ Auth callback error:', { error, errorCode, errorDescription })
          
          if (errorCode === 'otp_expired') {
            setError('O link de verificação expirou. Por favor, solicite um novo link de verificação.')
          } else if (errorCode === 'access_denied') {
            setError('Acesso negado. O link pode ter sido usado já ou ser inválido.')
          } else {
            setError(`Erro de autenticação: ${errorDescription || error}`)
          }
          setLoading(false)
          return
        }

        // Check if this is a password recovery callback by looking for hash fragments
        if (typeof window !== 'undefined' && window.location.hash) {
          const hash = window.location.hash.substring(1)
          const params = new URLSearchParams(hash)
          const accessToken = params.get('access_token')
          const type = params.get('type')
          
          if (type === 'recovery' && accessToken) {
            router.push('/reset-password')
            return
          }
        }

        // Handle the auth callback
        const { data, error: authError } = await supabase.auth.getSession()
        
        if (authError) {
          console.error('❌ Session error:', authError)
          setError(`Erro ao verificar sessão: ${authError.message}`)
          setLoading(false)
          return
        }

        if (data.session) {
          setSuccess(true)
          
          // Wait a moment to show success, then redirect
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          // Try to exchange the code for a session
          const code = searchParams.get('code')
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            
            if (exchangeError) {
              console.error('❌ Code exchange error:', exchangeError)
              setError(`Erro ao processar verificação: ${exchangeError.message}`)
            } else {
              setSuccess(true)
              setTimeout(() => {
                router.push('/')
              }, 2000)
            }
          } else {
            setError('Nenhuma sessão de autenticação encontrada.')
          }
        }
      } catch (error) {
        console.error('💥 Unexpected auth callback error:', error)
        setError(`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Verificando autenticação...
          </h1>
          <p className="text-gray-600">
            Processando seu link de verificação
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            ✅ Autenticação realizada com sucesso!
          </h1>
          <p className="text-gray-600 mb-4">
            Redirecionando para a aplicação...
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Aguarde alguns segundos
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Erro na Verificação
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Ir para Login
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </div>
          
          <div className="mt-6 text-xs text-gray-500 bg-gray-100 p-3 rounded">
            💡 Se o link expirou, você pode solicitar um novo link de verificação na página de login.
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Carregando...
          </h1>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}