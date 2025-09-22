declare module 'html2pdf.js';

// Location data types
export interface LocationData {
  country: string
  state: string
  city: string
  latitude: number | null
  longitude: number | null
  timezone: string
}

export interface UserProfile {
  id: string
  user_id: string
  location_country: string | null
  location_state: string | null
  location_city: string | null
  latitude: number | null
  longitude: number | null
  timezone: string | null
  created_at: string
  updated_at: string
}