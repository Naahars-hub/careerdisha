'use client'

import { useState, useEffect } from 'react'
import { locationService, LocationData, LocationError } from '@/lib/locationService'
import styles from './LocationCollector.module.css'

interface LocationCollectorProps {
  onLocationCollected: (location: LocationData) => void;
  onError?: (error: LocationError) => void;
  className?: string;
}

export default function LocationCollector({ 
  onLocationCollected, 
  onError,
  className = '' 
}: LocationCollectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const [customCity, setCustomCity] = useState('')
  const [customState, setCustomState] = useState('')
  const [customCountry, setCustomCountry] = useState('India')
  const [error, setError] = useState('')
  const [locationCollected, setLocationCollected] = useState(false)
  const [citySearch, setCitySearch] = useState('')

  const popularCities = locationService.getPopularCities()
  
  // Filter cities based on search
  const filteredCities = popularCities.filter(city => 
    city.city.toLowerCase().includes(citySearch.toLowerCase()) ||
    city.state.toLowerCase().includes(citySearch.toLowerCase())
  )

  const handleGetCurrentLocation = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const location = await locationService.getCurrentLocation()
      onLocationCollected(location)
      setLocationCollected(true)
    } catch (error) {
      const locationError = error as LocationError
      setError(locationError.message)
      onError?.(locationError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualLocationSubmit = async () => {
    if (selectedCity || (customCity && customState)) {
      setIsLoading(true)
      setError('')
      
      try {
        let location: LocationData
        
        if (selectedCity) {
          const cityData = popularCities.find(city => 
            `${city.city}, ${city.state}` === selectedCity
          )
          if (cityData) {
            location = await locationService.getLocationFromAddress(
              cityData.city,
              cityData.state,
              cityData.country
            )
          } else {
            throw new Error('Selected city not found')
          }
        } else {
          location = await locationService.getLocationFromAddress(
            customCity,
            customState,
            customCountry
          )
        }
        
        onLocationCollected(location)
        setLocationCollected(true)
      } catch (error) {
        const locationError = error as LocationError
        setError(locationError.message)
        onError?.(locationError)
      } finally {
        setIsLoading(false)
      }
    } else {
      setError('Please select a city or enter custom location details')
    }
  }

  const handleSkipLocation = () => {
    // Provide default location (Delhi, India)
    const defaultLocation: LocationData = {
      latitude: 28.6139,
      longitude: 77.2090,
      country: 'India',
      state: 'Delhi',
      city: 'Delhi',
      timezone: 'Asia/Kolkata'
    }
    onLocationCollected(defaultLocation)
    setLocationCollected(true)
  }

  if (locationCollected) {
    return (
      <div className={`${styles.locationCollected} ${className}`}>
        <div className={styles.successIcon}>📍</div>
        <p>Location collected successfully!</p>
      </div>
    )
  }

  return (
    <div className={`${styles.locationCollector} ${className}`}>
      <div className={styles.header}>
        <h3>📍 Help us personalize your experience</h3>
        <p>We'll use your location to show nearby colleges and opportunities</p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {!showManualInput ? (
        <div className={styles.locationOptions}>
          <button
            type="button"
            className={styles.locationButton}
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                Getting your location...
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>🌍</span>
                Use my current location
              </>
            )}
          </button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <button
            type="button"
            className={styles.locationButton}
            onClick={() => setShowManualInput(true)}
            disabled={isLoading}
          >
            <span className={styles.buttonIcon}>✏️</span>
            Enter location manually
          </button>

          <button
            type="button"
            className={styles.skipButton}
            onClick={handleSkipLocation}
            disabled={isLoading}
          >
            Skip for now
          </button>
        </div>
      ) : (
        <div className={styles.manualInput}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>🏙️ Select a popular city:</label>
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Search cities... (e.g., Mumbai, Bangalore)"
              className={styles.input}
              style={{ marginBottom: '8px' }}
            />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value)
                setCustomCity('')
                setCustomState('')
                setCitySearch('')
              }}
              className={styles.select}
            >
              <option value="">Choose a city...</option>
              {filteredCities.map((city, index) => (
                <option key={index} value={`${city.city}, ${city.state}`}>
                  {city.city}, {city.state}
                </option>
              ))}
            </select>
            {selectedCity && (
              <div className={styles.selectedCity}>
                ✅ Selected: {selectedCity}
              </div>
            )}
            {citySearch && filteredCities.length === 0 && (
              <div className={styles.noResults}>
                🔍 No cities found matching "{citySearch}"
              </div>
            )}
          </div>

          <div className={styles.divider}>
            <span>or enter custom details</span>
          </div>

          <div className={styles.customInputs}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>🏘️ City:</label>
              <input
                type="text"
                value={customCity}
                onChange={(e) => {
                  setCustomCity(e.target.value)
                  setSelectedCity('')
                }}
                placeholder="e.g., Mumbai, Bangalore, Chennai"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>🏛️ State:</label>
              <input
                type="text"
                value={customState}
                onChange={(e) => {
                  setCustomState(e.target.value)
                  setSelectedCity('')
                }}
                placeholder="e.g., Maharashtra, Karnataka, Tamil Nadu"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>🌍 Country:</label>
              <input
                type="text"
                value={customCountry}
                onChange={(e) => setCustomCountry(e.target.value)}
                placeholder="e.g., India"
                className={styles.input}
              />
            </div>
          </div>

          {(customCity || customState) && (
            <div className={styles.customLocationPreview}>
              📍 Custom location: {customCity && `${customCity}, `}{customState && `${customState}, `}{customCountry}
            </div>
          )}

          <div className={styles.manualActions}>
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleManualLocationSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  Finding location...
                </>
              ) : (
                'Use this location'
              )}
            </button>

            <button
              type="button"
              className={styles.backButton}
              onClick={() => {
                setShowManualInput(false)
                setError('')
                setSelectedCity('')
                setCustomCity('')
                setCustomState('')
              }}
              disabled={isLoading}
            >
              ← Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
