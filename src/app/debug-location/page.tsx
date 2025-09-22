'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LocationCollector from '@/components/LocationCollector'
import { LocationData } from '@/lib/locationService'

interface User {
  id: string;
  email?: string;
}

interface ProfileData {
  data: unknown;
  error: unknown;
}

interface TestResult {
  error?: string;
  [key: string]: unknown;
}

export default function DebugLocationPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        setProfileData({ data, error })
      }
      
      setLoading(false)
    }
    checkUser()
  }, [supabase])

  const testDatabase = async () => {
    try {
      const response = await fetch('/api/test-db')
      const result = await response.json()
      setTestResult(result)
    } catch {
      setTestResult({ error: 'Failed to test database' })
    }
  }

  const handleLocationCollected = async (location: LocationData) => {
    console.log('Location collected:', location)
    
    if (user) {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          location_country: location.country,
          location_state: location.state,
          location_city: location.city,
          latitude: location.latitude,
          longitude: location.longitude,
          timezone: location.timezone
        })
      
      console.log('Location save result:', { data, error })
      
      if (!error) {
        alert('Location saved successfully!')
        // Refresh profile data
        const { data: newProfileData, error: newError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        setProfileData({ data: newProfileData, error: newError })
      } else {
        alert('Error saving location: ' + error.message)
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔍 Location Collection Debug Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>User Info</h2>
        {user ? (
          <div>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        ) : (
          <p>No user logged in</p>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Profile Data</h2>
        <pre>{JSON.stringify(profileData, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Database Test</h2>
        <button onClick={testDatabase} style={{ padding: '10px 20px', marginBottom: '10px' }}>
          Test Database Connection
        </button>
        {testResult && (
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Location Collector Test</h2>
        <LocationCollector
          onLocationCollected={handleLocationCollected}
          onError={(error) => console.error('Location error:', error)}
        />
      </div>
    </div>
  )
}
