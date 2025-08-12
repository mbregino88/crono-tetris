import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  role?: string
  created_at: string
  last_sign_in?: string
}

// Convert Supabase User to AuthUser
export function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
    avatar: user.user_metadata?.avatar_url,
    role: user.user_metadata?.role || 'user',
    created_at: user.created_at,
    last_sign_in: user.last_sign_in_at,
  }
}

// Get current authenticated user
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  
  if (!user) {
    return null
  }
  
  return mapSupabaseUser(user)
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// Sign in with email and password
export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return {
    user: data.user ? mapSupabaseUser(data.user) : null,
    session: data.session,
  }
}

// Sign up with email and password
export async function signUpWithPassword(email: string, password: string, options?: {
  redirectTo?: string
  data?: Record<string, unknown>
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: options?.redirectTo || `${window.location.origin}/auth/callback`,
      data: options?.data,
    }
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return {
    user: data.user ? mapSupabaseUser(data.user) : null,
    session: data.session,
  }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

// Reset password
export async function resetPassword(email: string, redirectTo?: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || `${window.location.origin}/auth/callback`
  })
  
  if (error) {
    throw new Error(error.message)
  }
}

// Update user profile
export async function updateUserProfile(updates: {
  full_name?: string
  avatar_url?: string
  [key: string]: unknown
}) {
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data.user ? mapSupabaseUser(data.user) : null
}

// Change password (requires current session)
export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  if (error) {
    throw new Error(error.message)
  }
}

// Invite user (admin only)
export async function inviteUser(email: string, options?: {
  data?: Record<string, unknown>
  redirectTo?: string
}) {
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: options?.data,
    redirectTo: options?.redirectTo || `${window.location.origin}/auth/callback`
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

// Get user by ID (requires service role key)
export async function getUserById(id: string): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.admin.getUserById(id)
  
  if (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
  
  return data.user ? mapSupabaseUser(data.user) : null
}

// List users (requires service role key)
export async function listUsers(page = 1, perPage = 1000) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page,
    perPage
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return {
    users: data.users.map(mapSupabaseUser),
    total: data.total,
    page,
    perPage
  }
}

// Refresh session
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return {
    user: data.user ? mapSupabaseUser(data.user) : null,
    session: data.session,
  }
}

// Session storage helpers
export const SESSION_STORAGE_KEY = 'supabase.auth.token'

export function getStoredSession() {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

// Auth state checking utilities
export function isEmailConfirmed(user: User): boolean {
  return !!user.email_confirmed_at
}

export function isUserActive(user: User): boolean {
  return isEmailConfirmed(user)
}

export function getUserInitials(user: AuthUser | User): string {
  const name = 'user_metadata' in user 
    ? (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0])
    : (user.name || user.email.split('@')[0])
    
  if (!name) return '??'
  
  const words = name.split(' ')
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function getUserDisplayName(user: AuthUser | User): string {
  if ('user_metadata' in user) {
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           'Usuário'
  }
  return user.name || user.email.split('@')[0] || 'Usuário'
}