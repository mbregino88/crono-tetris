import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/', // Main kanban page - requires authentication
  '/dashboard',
  '/deals',
  '/settings',
  '/profile'
]

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/auth/callback',
  '/auth/error',
  '/reset-password'
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Update the request cookies
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Update the response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // Set cookie in response
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remove from request
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // Update response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // Remove from response
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get the current user (more secure than getSession)
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Simple user check
  // const isAuthenticated = !!user
  

  // Handle auth callback routes - always allow
  if (pathname.startsWith('/auth/')) {
    return response
  }

  // Handle public routes
  if (publicRoutes.includes(pathname)) {
    // If user is already authenticated and tries to access login, redirect to home
    if (pathname === '/login' && user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return response
  }

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    route === '/' ? pathname === route : pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // For authenticated users on protected routes, continue
  if (isProtectedRoute && user) {
    return response
  }

  // Default: allow the request to continue
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}