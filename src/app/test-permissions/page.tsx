'use client'

import { useState, useEffect } from 'react'
import { checkDatabasePermissions } from '@/lib/supabase'

export default function TestPermissionsPage() {
  const [permissions, setPermissions] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function testPermissions() {
      try {
        const result = await checkDatabasePermissions()
        setPermissions(result)
      } catch (error) {
        console.error('Error testing permissions:', error)
      } finally {
        setLoading(false)
      }
    }
    
    testPermissions()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Testing Database Permissions...</h1>
        <div className="animate-pulse text-gray-600">Checking your access rights...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Database Permission Test</h1>
      
      {permissions && (
        <div className="space-y-4">
          <div className="bg-white border rounded p-4">
            <h2 className="font-bold mb-2">Permission Status:</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={permissions.canSelect ? "text-green-600" : "text-red-600"}>
                  {permissions.canSelect ? "✅" : "❌"}
                </span>
                <span>SELECT: {permissions.canSelect ? "Allowed" : "Denied"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={permissions.canInsert ? "text-green-600" : "text-red-600"}>
                  {permissions.canInsert ? "✅" : "❌"}
                </span>
                <span>INSERT: {permissions.canInsert ? "Allowed" : "Denied"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={permissions.canUpdate ? "text-green-600" : "text-red-600"}>
                  {permissions.canUpdate ? "✅" : "❌"}
                </span>
                <span>UPDATE: {permissions.canUpdate ? "Allowed" : "Denied"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={permissions.canDelete ? "text-green-600" : "text-red-600"}>
                  {permissions.canDelete ? "✅" : "❌"}
                </span>
                <span>DELETE: {permissions.canDelete ? "Allowed" : "Denied"}</span>
              </div>
            </div>
          </div>

          {permissions.errors && permissions.errors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <h3 className="font-bold mb-2">Errors Encountered:</h3>
              <ul className="list-disc list-inside">
                {permissions.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-300 p-4 rounded">
            <h3 className="font-bold mb-2">🔧 Next Steps:</h3>
            {!permissions.canInsert ? (
              <div className="text-orange-600">
                <p>📋 INSERT permission is denied. This is why you can't create new deals.</p>
                <p className="mt-2">Possible solutions:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Check Supabase RLS (Row Level Security) policies</li>
                  <li>Ensure you're authenticated if RLS requires it</li>
                  <li>Verify the table exists with correct schema</li>
                  <li>Check if anonymous access is enabled in Supabase</li>
                </ol>
              </div>
            ) : (
              <p className="text-green-600">✅ All permissions are working! Deal creation should work.</p>
            )}
          </div>

          <div className="bg-gray-50 border rounded p-4">
            <p className="text-sm text-gray-600">
              Check the browser console for detailed permission test results.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}