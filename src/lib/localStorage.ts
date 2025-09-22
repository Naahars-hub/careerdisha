import { LocationData } from '../../types'

const LOCATION_STORAGE_KEY = 'user_location_data'

export class LocationStorage {
  /**
   * Save location data to localStorage
   */
  static saveLocationData(locationData: LocationData): boolean {
    try {
      if (typeof window === 'undefined') {
        console.warn('localStorage is not available in server environment')
        return false
      }

      const dataToSave = {
        ...locationData,
        savedAt: new Date().toISOString()
      }

      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(dataToSave))
      console.log('Location data saved to localStorage:', dataToSave)
      return true
    } catch (error) {
      console.error('Failed to save location data to localStorage:', error)
      return false
    }
  }

  /**
   * Get location data from localStorage
   */
  static getLocationData(): LocationData | null {
    try {
      if (typeof window === 'undefined') {
        console.warn('localStorage is not available in server environment')
        return null
      }

      const storedData = localStorage.getItem(LOCATION_STORAGE_KEY)
      if (!storedData) {
        return null
      }

      const parsedData = JSON.parse(storedData)
      
      // Remove the savedAt field and return only LocationData
      const { savedAt, ...locationData } = parsedData
      
      return locationData as LocationData
    } catch (error) {
      console.error('Failed to get location data from localStorage:', error)
      return null
    }
  }

  /**
   * Check if location data exists in localStorage
   */
  static hasLocationData(): boolean {
    try {
      if (typeof window === 'undefined') {
        return false
      }

      const storedData = localStorage.getItem(LOCATION_STORAGE_KEY)
      return storedData !== null
    } catch (error) {
      console.error('Failed to check location data in localStorage:', error)
      return false
    }
  }

  /**
   * Clear location data from localStorage
   */
  static clearLocationData(): boolean {
    try {
      if (typeof window === 'undefined') {
        console.warn('localStorage is not available in server environment')
        return false
      }

      localStorage.removeItem(LOCATION_STORAGE_KEY)
      console.log('Location data cleared from localStorage')
      return true
    } catch (error) {
      console.error('Failed to clear location data from localStorage:', error)
      return false
    }
  }

  /**
   * Get the timestamp when location data was last saved
   */
  static getLocationDataTimestamp(): string | null {
    try {
      if (typeof window === 'undefined') {
        return null
      }

      const storedData = localStorage.getItem(LOCATION_STORAGE_KEY)
      if (!storedData) {
        return null
      }

      const parsedData = JSON.parse(storedData)
      return parsedData.savedAt || null
    } catch (error) {
      console.error('Failed to get location data timestamp from localStorage:', error)
      return null
    }
  }

  /**
   * Check if location data is recent (within specified hours)
   */
  static isLocationDataRecent(hours: number = 24): boolean {
    try {
      const timestamp = this.getLocationDataTimestamp()
      if (!timestamp) {
        return false
      }

      const savedTime = new Date(timestamp)
      const currentTime = new Date()
      const diffInHours = (currentTime.getTime() - savedTime.getTime()) / (1000 * 60 * 60)

      return diffInHours <= hours
    } catch (error) {
      console.error('Failed to check if location data is recent:', error)
      return false
    }
  }
}
