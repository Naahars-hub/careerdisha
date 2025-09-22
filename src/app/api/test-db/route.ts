import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Test basic connection
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      return NextResponse.json({
        error: 'Auth error',
        details: userError.message
      }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({
        error: 'No user found',
        message: 'Please sign in first'
      }, { status: 401 })
    }

    // Test user_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile: {
        data: profileData,
        error: profileError,
        hasProfile: !!profileData,
        hasLocation: !!(profileData?.latitude && profileData?.longitude)
      }
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
