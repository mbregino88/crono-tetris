import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Deal } from '@/lib/types'

export async function POST(request: Request) {
  try {
    // Parse the request body
    const dealData = await request.json()
    console.log('🚀 API: Received deal creation request:', JSON.stringify(dealData, null, 2))

    // Create Supabase client with server-side auth - await cookies in Next.js 15
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ API: Authentication error:', authError?.message || 'No user found')
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          message: 'You must be logged in to create deals',
          details: authError?.message 
        },
        { status: 401 }
      )
    }

    console.log('✅ API: User authenticated:', { userId: user.id, email: user.email })

    // Insert the deal into the database
    const { data, error } = await supabase
      .from('deals')
      .insert([dealData])
      .select()
      .single()

    if (error) {
      console.error('❌ API: Supabase error creating deal:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })

      // Return detailed error information
      return NextResponse.json(
        { 
          error: 'Database error',
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        { status: 400 }
      )
    }

    console.log('✅ API: Deal created successfully:', data)
    
    // Return the created deal
    return NextResponse.json({ 
      success: true,
      data: data as Deal 
    })

  } catch (error) {
    console.error('💥 API: Unexpected error in deal creation:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// GET endpoint to test the API and check database connection
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Test database connection by counting deals
    const { count, error: countError } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      status: 'API is working',
      authenticated: !!user,
      user: user ? { id: user.id, email: user.email } : null,
      authError: authError?.message,
      databaseConnected: !countError,
      dealCount: count,
      databaseError: countError?.message
    })
  } catch (error) {
    return NextResponse.json({
      status: 'API error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}