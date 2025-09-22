export interface LocationData {
  latitude: number;
  longitude: number;
  country: string;
  state: string;
  city: string;
  timezone: string;
}

export interface LocationError {
  code: number;
  message: string;
}

export class LocationService {
  private static instance: LocationService;
  
  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Get user's current location using browser geolocation API
   */
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser.'
        });
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const locationData = await this.reverseGeocode(latitude, longitude);
            resolve(locationData);
          } catch {
            reject({
              code: 1,
              message: 'Failed to get location details from coordinates.'
            });
          }
        },
        (error) => {
          let errorMessage = 'Unknown error occurred';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          reject({
            code: error.code,
            message: errorMessage
          });
        },
        options
      );
    });
  }

  /**
   * Convert coordinates to location details using reverse geocoding
   */
  private async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      
      return {
        latitude,
        longitude,
        country: data.countryName || 'Unknown',
        state: data.principalSubdivision || 'Unknown',
        city: data.city || data.locality || 'Unknown',
        timezone: data.localityInfo?.administrative?.[0]?.timezone || 'UTC'
      };
    } catch {
      // Fallback to basic location data if reverse geocoding fails
      return {
        latitude,
        longitude,
        country: 'Unknown',
        state: 'Unknown',
        city: 'Unknown',
        timezone: 'UTC'
      };
    }
  }

  /**
   * Get location from manual input (city, state, country)
   */
  async getLocationFromAddress(city: string, state: string, country: string): Promise<LocationData> {
    try {
      const query = `${city}, ${state}, ${country}`;
      const response = await fetch(
        `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(query)}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        throw new Error('Location not found');
      }
      
      const result = data.results[0];
      
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        country: result.countryName || country,
        state: result.principalSubdivision || state,
        city: result.city || result.locality || city,
        timezone: result.localityInfo?.administrative?.[0]?.timezone || 'UTC'
      };
    } catch {
      throw {
        code: 2,
        message: 'Failed to find location. Please check your input and try again.'
      };
    }
  }

  /**
   * Get popular cities for manual selection
   */
  getPopularCities(): Array<{city: string, state: string, country: string}> {
    return [
      { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      { city: 'Delhi', state: 'Delhi', country: 'India' },
      { city: 'Bangalore', state: 'Karnataka', country: 'India' },
      { city: 'Hyderabad', state: 'Telangana', country: 'India' },
      { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      { city: 'Kolkata', state: 'West Bengal', country: 'India' },
      { city: 'Pune', state: 'Maharashtra', country: 'India' },
      { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
      { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      { city: 'Surat', state: 'Gujarat', country: 'India' },
      { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
      { city: 'Kanpur', state: 'Uttar Pradesh', country: 'India' },
      { city: 'Nagpur', state: 'Maharashtra', country: 'India' },
      { city: 'Indore', state: 'Madhya Pradesh', country: 'India' },
      { city: 'Thane', state: 'Maharashtra', country: 'India' },
      { city: 'Bhopal', state: 'Madhya Pradesh', country: 'India' },
      { city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India' },
      { city: 'Pimpri-Chinchwad', state: 'Maharashtra', country: 'India' },
      { city: 'Patna', state: 'Bihar', country: 'India' },
      { city: 'Vadodara', state: 'Gujarat', country: 'India' },
      { city: 'Gurgaon', state: 'Haryana', country: 'India' },
      { city: 'Noida', state: 'Uttar Pradesh', country: 'India' },
      { city: 'Faridabad', state: 'Haryana', country: 'India' },
      { city: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India' },
      { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India' },
      { city: 'Kochi', state: 'Kerala', country: 'India' },
      { city: 'Chandigarh', state: 'Chandigarh', country: 'India' },
      { city: 'Bhubaneswar', state: 'Odisha', country: 'India' },
      { city: 'Mysore', state: 'Karnataka', country: 'India' },
      { city: 'Mangalore', state: 'Karnataka', country: 'India' },
      { city: 'Vijayawada', state: 'Andhra Pradesh', country: 'India' },
      { city: 'Madurai', state: 'Tamil Nadu', country: 'India' },
      { city: 'Nashik', state: 'Maharashtra', country: 'India' },
      { city: 'Aurangabad', state: 'Maharashtra', country: 'India' },
      { city: 'Rajkot', state: 'Gujarat', country: 'India' },
      { city: 'Varanasi', state: 'Uttar Pradesh', country: 'India' },
      { city: 'Srinagar', state: 'Jammu and Kashmir', country: 'India' },
      { city: 'Amritsar', state: 'Punjab', country: 'India' },
      { city: 'Ludhiana', state: 'Punjab', country: 'India' }
    ];
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const locationService = LocationService.getInstance();
