'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LocationCollector from './LocationCollector'
import { LocationData } from '@/lib/locationService'
import styles from './LocationPrompt.module.css'

interface LocationPromptProps {
  onLocationCollected?: () => void;
  className?: string;
}

export default function LocationPrompt({ onLocationCollected, className = '' }: LocationPromptProps) {
  const [showCollector, setShowCollector] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleLocationCollected = async (location: LocationData) => {
    setIsLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
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
        } else {
          setShowCollector(false)
          onLocationCollected?.()
        }
      }
    } catch (error) {
      console.error('Error saving location:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationError = (error: Error) => {
    console.error('Location collection error:', error)
    setShowCollector(false)
  }

  if (showCollector) {
    return (
      <div className={`${styles.locationPrompt} ${className}`}>
        <LocationCollector
          onLocationCollected={handleLocationCollected}
          onError={handleLocationError}
        />
      </div>
    )
  }

  return (
    <div className={`${styles.locationPrompt} ${className}`}>
      <div className={styles.promptCard}>
        <div className={styles.promptIcon}>📍</div>
        <div className={styles.promptContent}>
          <h3>Help us personalize your experience</h3>
          <p>Share your location to see nearby colleges and get personalized recommendations</p>
        </div>
        <div className={styles.promptActions}>
          <button
            onClick={() => setShowCollector(true)}
            className={styles.primaryButton}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Share Location'}
          </button>
          <button
            onClick={() => setShowCollector(false)}
            className={styles.secondaryButton}
            disabled={isLoading}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
