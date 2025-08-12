'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null)
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [stayConnected, setStayConnected] = useState(false)

  // Handle URL messages on mount
  useEffect(() => {
    // Check for URL messages
    const urlParams = new URLSearchParams(window.location.search)
    const urlMessage = urlParams.get('message')
    
    if (urlMessage === 'password-updated') {
      setMessage({
        type: 'success',
        text: 'Senha alterada com sucesso! Você pode fazer login com sua nova senha.'
      })
    }
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      
      // Direct Supabase authentication
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })


      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setMessage({
            type: 'info',
            text: 'Por favor, verifique seu email e clique no link de confirmação antes de fazer login.'
          })
        } else if (error.message.includes('Invalid login credentials')) {
          setMessage({
            type: 'error',
            text: 'Email ou senha incorretos. Verifique suas credenciais.'
          })
        } else {
          setMessage({
            type: 'error',
            text: `Erro ao fazer login: ${error.message}`
          })
        }
      } else {
        
        setMessage({
          type: 'success',
          text: 'Login realizado com sucesso! Redirecionando para o kanban...'
        })
        
        // DIRECT REDIRECT - Don't wait for auth state
        
        // Force a small delay to show success message, then redirect
        setTimeout(() => {
          // Use window.location for a hard redirect that bypasses client-side routing
          window.location.href = '/'
        }, 500)
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setMessage({
          type: 'error',
          text: `Erro ao criar conta: ${error.message}`
        })
      } else {
        setMessage({
          type: 'success',
          text: 'Conta criada! Verifique seu email e clique no link de confirmação para ativar sua conta.'
        })
        setMode('signin')
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`
      })

      if (error) {
        setMessage({
          type: 'error',
          text: `Erro ao solicitar recuperação: ${error.message}`
        })
      } else {
        setMessage({
          type: 'success',
          text: 'Email de recuperação enviado! Verifique sua caixa de entrada.'
        })
        setMode('signin')
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      })
    } finally {
      setLoading(false)
    }
  }

  const getSubmitHandler = () => {
    switch (mode) {
      case 'signup': return handleSignUp
      case 'reset': return handlePasswordReset
      default: return handleSignIn
    }
  }

  const getSubmitText = () => {
    switch (mode) {
      case 'signup': return 'Criar Conta'
      case 'reset': return 'Enviar Email'
      default: return 'Entrar'
    }
  }

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Criar Conta'
      case 'reset': return 'Recuperar Senha'
      default: return 'Entrar na Aplicação'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {getTitle()}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'signin' && 'Entre com suas credenciais para acessar o sistema'}
            {mode === 'signup' && 'Crie uma nova conta para acessar o sistema'}
            {mode === 'reset' && 'Digite seu email para receber instruções de recuperação'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={getSubmitHandler()}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pl-10"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stayConnected"
                  checked={stayConnected}
                  onCheckedChange={(checked) => setStayConnected(checked === true)}
                />
                <Label 
                  htmlFor="stayConnected" 
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Manter-me conectado
                </Label>
              </div>
            )}
          </div>

          {message && (
            <div className={`rounded-md p-4 ${
              message.type === 'error' ? 'bg-red-50 border border-red-200' :
              message.type === 'success' ? 'bg-green-50 border border-green-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
                  {message.type === 'success' && <CheckCircle className="h-5 w-5 text-green-400" />}
                  {message.type === 'info' && <Mail className="h-5 w-5 text-blue-400" />}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    message.type === 'error' ? 'text-red-800' :
                    message.type === 'success' ? 'text-green-800' :
                    'text-blue-800'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4" />
                  Processando...
                </>
              ) : (
                getSubmitText()
              )}
            </Button>
          </div>

          <div className="flex flex-col space-y-2 text-center text-sm">
            {mode === 'signin' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Esqueceu sua senha?
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-gray-600 hover:text-gray-500"
                >
                  Não tem conta? <span className="text-blue-600 hover:underline">Criar conta</span>
                </button>
              </>
            )}
            
            {(mode === 'signup' || mode === 'reset') && (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Voltar para login
              </button>
            )}
          </div>
        </form>

        <div className="text-xs text-center text-gray-500 bg-gray-100 p-3 rounded">
          💡 <strong>Para administradores:</strong> Novos usuários podem ser convidados através do painel administrativo do Supabase.
        </div>
      </div>
    </div>
  )
}