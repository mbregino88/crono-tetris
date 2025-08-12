'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark')
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Personalize sua experiência no sistema</p>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Configure como você prefere ver a interface do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Tema
                </label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Escolha entre tema claro ou escuro
                </p>
              </div>

              {/* Theme Preview */}
              <div className="mt-6">
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Prévia do Tema
                </label>
                <div className="flex gap-4">
                  {themeOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = theme === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleThemeChange(option.value)}
                        className={`
                          relative p-3 rounded-lg border-2 transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                          }
                        `}
                      >
                        <div className={`
                          w-20 h-12 rounded border mb-2
                          ${option.value === 'light' 
                            ? 'bg-white border-gray-200' 
                            : 'bg-gray-900 border-gray-700'
                          }
                        `}>
                          <div className={`
                            w-full h-3 rounded-t border-b
                            ${option.value === 'light' 
                              ? 'bg-gray-50 border-gray-200' 
                              : 'bg-gray-800 border-gray-700'
                            }
                          `} />
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Icon className="h-3 w-3" />
                          {option.label}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
              <CardDescription>
                Detalhes sobre a aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">Versão:</span>
                  <span className="text-muted-foreground ml-2">1.0.0</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Ambiente:</span>
                  <span className="text-muted-foreground ml-2">Desenvolvimento</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Framework:</span>
                  <span className="text-muted-foreground ml-2">Next.js</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Última atualização:</span>
                  <span className="text-muted-foreground ml-2">Hoje</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}