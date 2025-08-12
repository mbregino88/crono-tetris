import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Loader2, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { getUserInitials, getUserDisplayName } from '@/lib/auth'

interface UserAvatarProps {
  userName?: string
  userEmail?: string
  onSettingsClick?: () => void
  onLogoutClick?: () => void
  className?: string
}

export function UserAvatar({
  userName,
  userEmail,
  onLogoutClick,
  className
}: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Use auth data if available, otherwise fallback to props
  const displayName = user ? getUserDisplayName(user) : (userName || 'Usuário')
  const displayEmail = user?.email || userEmail || ''
  const initials = user ? getUserInitials(user) : displayName.slice(0, 2).toUpperCase()

  const handleThemeToggle = () => {
    toggleTheme()
    // Keep dropdown open for theme toggle
  }

  const handleLogoutClick = async () => {
    setIsOpen(false)
    try {
      await signOut()
      onLogoutClick?.()
    } catch (error) {
      console.error('Error signing out:', error)
      // Still call the callback even if signOut fails
      onLogoutClick?.()
    }
  }

  if (loading) {
    return (
      <div className={`h-8 px-2 flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`h-8 w-8 p-0 flex items-center justify-center hover:bg-muted ${className}`}
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs font-medium bg-blue-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-64 p-0 mr-2" 
        align="end"
        side="bottom"
        alignOffset={-4}
      >
        {/* User Info Header */}
        <div className="px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm font-semibold bg-blue-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {displayEmail}
              </p>
              {user && (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  • Online
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 h-auto font-normal text-sm hover:bg-muted"
            onClick={handleThemeToggle}
          >
            {theme === 'light' ? (
              <Moon className="mr-3 h-4 w-4 text-muted-foreground" />
            ) : (
              <Sun className="mr-3 h-4 w-4 text-muted-foreground" />
            )}
            {theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}
          </Button>
          
          <div className="border-t my-1" />
          
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 h-auto font-normal text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300"
            onClick={handleLogoutClick}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sair
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}