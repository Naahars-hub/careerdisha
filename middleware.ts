import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // If the user is not signed in, redirect to home page with next param
  if (!session) {
    // Only redirect if not already on home page to avoid redirect loops
    if (req.nextUrl.pathname !== '/') {
      const url = new URL('/', req.url)
      // Preserve intended destination so we can return after login
      const nextPath = req.nextUrl.pathname + (req.nextUrl.search || '')
      url.searchParams.set('login', '1')
      url.searchParams.set('next', nextPath)
      return NextResponse.redirect(url)
    }
  }

  return res
}

// This config ensures the middleware is only run on the specified paths.
export const config = {
  matcher: [
    '/dashboard', // Let's protect the future dashboard page too
  ],
}