'use client'

import { useState, useEffect } from 'react'
import { LocationData } from '@/lib/locationService'
import styles from './NearbyColleges.module.css'

interface College {
  id: string
  name: string
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
  type: string
  website?: string
  distance?: number
}

interface NearbyCollegesProps {
  userLocation: LocationData
  className?: string
}

export default function NearbyColleges({ userLocation, className = '' }: NearbyCollegesProps) {
  const [colleges, setColleges] = useState<College[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [radius, setRadius] = useState(50) // Default 50km radius
  const [selectedType, setSelectedType] = useState('')

  const collegeTypes = [
    { value: '', label: 'All Types' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'General', label: 'General' },
    { value: 'Research', label: 'Research' }
  ]

  const radiusOptions = [
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' },
    { value: 100, label: '100 km' },
    { value: 200, label: '200 km' }
  ]

  useEffect(() => {
    fetchNearbyColleges()
  }, [userLocation, radius, selectedType])

  const fetchNearbyColleges = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        latitude: userLocation.latitude.toString(),
        longitude: userLocation.longitude.toString(),
        radius: radius.toString(),
        limit: '20'
      })
      
      if (selectedType) {
        params.append('type', selectedType)
      }

      const response = await fetch(`/api/colleges?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch colleges')
      }
      
      const data = await response.json()
      setColleges(data.colleges || [])
    } catch (error) {
      console.error('Error fetching colleges:', error)
      setError('Failed to load nearby colleges. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'engineering':
        return '🔧'
      case 'research':
        return '🔬'
      case 'general':
        return '🎓'
      default:
        return '🏛️'
    }
  }

  if (isLoading) {
    return (
      <div className={`${styles.nearbyColleges} ${className}`}>
        <div className={styles.header}>
          <h3>🏛️ Nearby Colleges</h3>
          <p>Finding colleges near {userLocation.city}, {userLocation.state}</p>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading nearby colleges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.nearbyColleges} ${className}`}>
      <div className={styles.header}>
        <h3>🏛️ Nearby Colleges</h3>
        <p>Colleges near {userLocation.city}, {userLocation.state}</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Search Radius:</label>
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className={styles.filterSelect}
          >
            {radiusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>College Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={styles.filterSelect}
          >
            {collegeTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span>⚠️ {error}</span>
          <button 
            onClick={fetchNearbyColleges}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      )}

      {colleges.length === 0 && !error ? (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>🔍</div>
          <h4>No colleges found</h4>
          <p>Try increasing the search radius or changing the college type filter.</p>
        </div>
      ) : (
        <div className={styles.collegesList}>
          {colleges.map((college) => (
            <div key={college.id} className={styles.collegeCard}>
              <div className={styles.collegeHeader}>
                <div className={styles.collegeIcon}>
                  {getTypeIcon(college.type)}
                </div>
                <div className={styles.collegeInfo}>
                  <h4 className={styles.collegeName}>{college.name}</h4>
                  <p className={styles.collegeLocation}>
                    {college.city}, {college.state}
                  </p>
                </div>
                <div className={styles.collegeDistance}>
                  {college.distance && formatDistance(college.distance)}
                </div>
              </div>
              
              <div className={styles.collegeDetails}>
                <span className={styles.collegeType}>{college.type}</span>
                {college.website && (
                  <a
                    href={college.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.collegeWebsite}
                  >
                    Visit Website →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {colleges.length > 0 && (
        <div className={styles.resultsInfo}>
          <p>Showing {colleges.length} colleges within {radius}km of your location</p>
        </div>
      )}
    </div>
  )
}
