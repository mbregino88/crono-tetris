'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function AuthTestPage() {
  const [status, setStatus] = useState('Loading...')
  const [user, setUser] = useState<{ id: string; email?: string; last_sign_in_at?: string } | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createSupabaseBrowserClient()
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus(`❌ Auth Error: ${error.message}`)
        } else if (session) {
          setStatus(`✅ Authenticated`)
          setUser(session.user)
        } else {
          setStatus(`⚠️ Not authenticated`)
        }
      } catch (err) {
        setStatus(`💥 Exception: ${err}`)
      }
    }
    
    checkAuth()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      {user && (
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-bold">User Info:</h3>
          <p>Email: {user.email}</p>
          <p>ID: {user.id}</p>
          <p>Last Sign In: {user.last_sign_in_at}</p>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">
        <p>This page tests authentication without any database queries.</p>
        <p>If this loads quickly, the issue is database-related.</p>
        <p>If this hangs, the issue is authentication-related.</p>
      </div>
    </div>
  )
}