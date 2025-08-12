'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function TestHomePage() {
  const [authStatus, setAuthStatus] = useState('Checking authentication...')
  const [user, setUser] = useState<{ id: string; email?: string; last_sign_in_at?: string } | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setAuthStatus(`❌ Auth Error: ${error.message}`)
        } else if (session) {
          setAuthStatus(`✅ Successfully authenticated`)
          setUser(session.user)
        } else {
          setAuthStatus(`⚠️ Not authenticated - should redirect to login`)
        }
      } catch (err) {
        setAuthStatus(`💥 Auth Exception: ${err}`)
      }
    }
    
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Test Home Page (No Database)</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <p className="text-lg mb-4">{authStatus}</p>
          
          {user && (
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-bold text-green-800">✅ User Details:</h3>
              <p className="text-green-700">Email: {user.email}</p>
              <p className="text-green-700">ID: {user.id}</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="font-bold text-blue-800 mb-2">🎯 Testing Purpose</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Tests if authentication works without database calls</li>
            <li>• If this page loads quickly: Database is the issue</li>
            <li>• If this page hangs: Authentication context is the issue</li>
            <li>• Protected by middleware like the real home page</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">📋 Expected Kanban Features (Disabled)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-yellow-700">
            <div className="p-3 bg-white rounded border-2 border-dashed">
              <h4 className="font-semibold">Pre-Leitura</h4>
              <p className="text-sm">No database calls</p>
            </div>
            <div className="p-3 bg-white rounded border-2 border-dashed">
              <h4 className="font-semibold">Leitura</h4>
              <p className="text-sm">No database calls</p>
            </div>
            <div className="p-3 bg-white rounded border-2 border-dashed">
              <h4 className="font-semibold">Análise</h4>
              <p className="text-sm">No database calls</p>
            </div>
            <div className="p-3 bg-white rounded border-2 border-dashed">
              <h4 className="font-semibold">Aprovado</h4>
              <p className="text-sm">No database calls</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <a href="/auth-test" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            🔐 Test Auth Only
          </a>
          <a href="/login" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            🔓 Go to Login
          </a>
        </div>
      </div>
    </div>
  )
}