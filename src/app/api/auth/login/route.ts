import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.json()
  const email = formData.email
  const password = formData.password
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })


  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('❌ API: Login error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  if (data.session) {
  }

  return NextResponse.json({
    user: data.user,
    session: data.session,
  })
}