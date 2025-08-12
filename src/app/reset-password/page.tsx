'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkRecoverySession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error checking session:', error)
          setMessage({
            type: 'error',
            text: 'Erro ao verificar sessão de recuperação.'
          })
        } else if (session) {
          setIsValidSession(true)
        } else {
          setMessage({
            type: 'error',
            text: 'Sessão de recuperação inválida ou expirada. Por favor, solicite um novo link de recuperação.'
          })
        }
      } catch (error) {
        console.error('Unexpected error checking session:', error)
        setMessage({
          type: 'error',
          text: 'Erro inesperado ao verificar sessão.'
        })
      } finally {
        setCheckingSession(false)
      }
    }

    checkRecoverySession()
  }, [])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Por favor, preencha todos os campos.'
      })
      return
    }

    if (password.length < 6) {
      setMessage({
        type: 'error',
        text: 'A senha deve ter pelo menos 6 caracteres.'
      })
      return
    }

    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'As senhas não coincidem.'
      })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('Password update error:', error)
        setMessage({
          type: 'error',
          text: `Erro ao alterar senha: ${error.message}`
        })
      } else {
        setMessage({
          type: 'success',
          text: 'Senha alterada com sucesso! Redirecionando para o login...'
        })
        
        // Wait a moment, then sign out and redirect to login
        setTimeout(async () => {
          await supabase.auth.signOut()
          router.push('/login?message=password-updated')
        }, 2000)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setMessage({
        type: 'error',
        text: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Verificando sessão de recuperação...
          </h1>
          <p className="text-gray-600">
            Aguarde enquanto validamos seu link de recuperação
          </p>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Sessão Inválida
          </h1>
          {message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{message.text}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={handleBackToLogin} 
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </div>
          
          <div className="mt-6 text-xs text-gray-500 bg-gray-100 p-3 rounded">
            💡 Para alterar sua senha, solicite um novo link de recuperação na página de login.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Alterar Senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite sua nova senha para alterar sua senha atual
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="pl-10"
                  minLength={6}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente sua nova senha"
                  className="pl-10"
                  minLength={6}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {message && (
            <div className={`rounded-md p-4 ${
              message.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-green-50 border border-green-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
                  {message.type === 'success' && <CheckCircle className="h-5 w-5 text-green-400" />}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    message.type === 'error' ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4" />
                  Alterando Senha...
                </>
              ) : (
                'Alterar Senha'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleBackToLogin}
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </div>
        </form>

        <div className="text-xs text-center text-gray-500 bg-gray-100 p-3 rounded">
          🔒 <strong>Segurança:</strong> Sua nova senha deve ter pelo menos 6 caracteres.
        </div>
      </div>
    </div>
  )
}