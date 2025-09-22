'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LocationCollector from '@/components/LocationCollector'
import { LocationData } from '@/lib/locationService'
import styles from './location-setup.module.css'

interface User {
  id: string;
  email?: string;
}

export default function LocationSetupPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [locationCollected, setLocationCollected] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)
      setIsLoading(false)
    }
    checkUser()
  }, [supabase, router])

  const handleLocationCollected = async (location: LocationData) => {
    if (!user) return

    try {
      // Save location to user profile
      const { error } = await supabase
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
      
      if (error) {
        console.error('Error saving location:', error)
      }
      
      setLocationCollected(true)
      
      // Redirect to intended destination after a short delay
      setTimeout(() => {
        router.push(next)
      }, 2000)
    } catch (error) {
      console.error('Error saving location:', error)
    }
  }

  const handleLocationError = (error: Error) => {
    console.error('Location collection error:', error)
    // Still redirect even if location collection fails
    setLocationCollected(true)
    setTimeout(() => {
      router.push(next)
    }, 2000)
  }

  const handleSkip = () => {
    setLocationCollected(true)
    setTimeout(() => {
      router.push(next)
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (locationCollected) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <div className={styles.successIcon}>✅</div>
          <h2>Location Saved!</h2>
          <p>Redirecting you to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📍 Complete Your Profile</h1>
        <p>Help us personalize your experience by sharing your location</p>
      </div>

      <div className={styles.content}>
        <LocationCollector
          onLocationCollected={handleLocationCollected}
          onError={handleLocationError}
        />
        
        <div className={styles.skipSection}>
          <button
            onClick={handleSkip}
            className={styles.skipButton}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
