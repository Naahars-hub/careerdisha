import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}?error=auth_failed`)
    }

    // Check if user has location data
    if (data.user) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('latitude, longitude')
        .eq('user_id', data.user.id)
        .single()

      if (!profileData || !profileData.latitude || !profileData.longitude) {
        // User doesn't have location data, redirect to location collection
        return NextResponse.redirect(`${requestUrl.origin}/location-setup?next=${encodeURIComponent(next)}`)
      }
    }

    // Redirect to the intended destination after successful authentication
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  }

  // If no code, redirect to home page
  return NextResponse.redirect(requestUrl.origin)
}