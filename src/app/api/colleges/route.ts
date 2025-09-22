import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

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

// Mock college data - In a real application, this would come from a database
const MOCK_COLLEGES: College[] = [
  {
    id: '1',
    name: 'Indian Institute of Technology Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.5451,
    longitude: 77.1925,
    type: 'Engineering',
    website: 'https://home.iitd.ac.in/'
  },
  {
    id: '2',
    name: 'Delhi University',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.6881,
    longitude: 77.2120,
    type: 'General',
    website: 'https://www.du.ac.in/'
  },
  {
    id: '3',
    name: 'Jamia Millia Islamia',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.5626,
    longitude: 77.2770,
    type: 'General',
    website: 'https://www.jmi.ac.in/'
  },
  {
    id: '4',
    name: 'Indian Institute of Technology Bombay',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.1334,
    longitude: 72.9133,
    type: 'Engineering',
    website: 'https://www.iitb.ac.in/'
  },
  {
    id: '5',
    name: 'University of Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    type: 'General',
    website: 'https://mu.ac.in/'
  },
  {
    id: '6',
    name: 'Indian Institute of Technology Madras',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 12.9915,
    longitude: 80.2337,
    type: 'Engineering',
    website: 'https://www.iitm.ac.in/'
  },
  {
    id: '7',
    name: 'Anna University',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 12.9716,
    longitude: 80.2206,
    type: 'Engineering',
    website: 'https://www.annauniv.edu/'
  },
  {
    id: '8',
    name: 'Indian Institute of Technology Kanpur',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    country: 'India',
    latitude: 26.5123,
    longitude: 80.2329,
    type: 'Engineering',
    website: 'https://www.iitk.ac.in/'
  },
  {
    id: '9',
    name: 'Indian Institute of Technology Kharagpur',
    city: 'Kharagpur',
    state: 'West Bengal',
    country: 'India',
    latitude: 22.3149,
    longitude: 87.3105,
    type: 'Engineering',
    website: 'https://www.iitkgp.ac.in/'
  },
  {
    id: '10',
    name: 'Indian Institute of Science',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    latitude: 13.0219,
    longitude: 77.5673,
    type: 'Research',
    website: 'https://www.iisc.ac.in/'
  },
  {
    id: '11',
    name: 'Indian Institute of Technology Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9901,
    longitude: 77.5558,
    type: 'Engineering',
    website: 'https://www.iisc.ac.in/'
  },
  {
    id: '12',
    name: 'National Institute of Technology Trichy',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 10.7589,
    longitude: 78.8158,
    type: 'Engineering',
    website: 'https://www.nitt.edu/'
  },
  {
    id: '13',
    name: 'Indian Institute of Technology Roorkee',
    city: 'Roorkee',
    state: 'Uttarakhand',
    country: 'India',
    latitude: 29.8668,
    longitude: 77.8961,
    type: 'Engineering',
    website: 'https://www.iitr.ac.in/'
  },
  {
    id: '14',
    name: 'Indian Institute of Technology Guwahati',
    city: 'Guwahati',
    state: 'Assam',
    country: 'India',
    latitude: 26.1899,
    longitude: 91.6956,
    type: 'Engineering',
    website: 'https://www.iitg.ac.in/'
  },
  {
    id: '15',
    name: 'Indian Institute of Technology Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.5922,
    longitude: 78.1257,
    type: 'Engineering',
    website: 'https://www.iith.ac.in/'
  },
  {
    id: '16',
    name: 'Osmania University',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.4065,
    longitude: 78.4772,
    type: 'General',
    website: 'https://www.osmania.ac.in/'
  },
  {
    id: '17',
    name: 'Indian Institute of Technology Indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
    latitude: 22.5204,
    longitude: 75.9207,
    type: 'Engineering',
    website: 'https://www.iiti.ac.in/'
  },
  {
    id: '18',
    name: 'Indian Institute of Technology Bhubaneswar',
    city: 'Bhubaneswar',
    state: 'Odisha',
    country: 'India',
    latitude: 20.2961,
    longitude: 85.8245,
    type: 'Engineering',
    website: 'https://www.iitbbs.ac.in/'
  },
  {
    id: '19',
    name: 'Indian Institute of Technology Gandhinagar',
    city: 'Gandhinagar',
    state: 'Gujarat',
    country: 'India',
    latitude: 23.2156,
    longitude: 72.6369,
    type: 'Engineering',
    website: 'https://www.iitgn.ac.in/'
  },
  {
    id: '20',
    name: 'Indian Institute of Technology Ropar',
    city: 'Rupnagar',
    state: 'Punjab',
    country: 'India',
    latitude: 30.9658,
    longitude: 76.5264,
    type: 'Engineering',
    website: 'https://www.iitrpr.ac.in/'
  }
]

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c // Distance in kilometers
  return distance
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latitude = parseFloat(searchParams.get('latitude') || '0')
    const longitude = parseFloat(searchParams.get('longitude') || '0')
    const radius = parseFloat(searchParams.get('radius') || '100') // Default 100km radius
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // Optional filter by college type

    // Validate coordinates
    if (latitude === 0 && longitude === 0) {
      return NextResponse.json(
        { error: 'Valid latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Filter colleges by type if specified
    let filteredColleges = MOCK_COLLEGES
    if (type) {
      filteredColleges = MOCK_COLLEGES.filter(college => 
        college.type.toLowerCase() === type.toLowerCase()
      )
    }

    // Calculate distances and filter by radius
    const collegesWithDistance = filteredColleges
      .map(college => ({
        ...college,
        distance: calculateDistance(latitude, longitude, college.latitude, college.longitude)
      }))
      .filter(college => college.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)

    return NextResponse.json({
      colleges: collegesWithDistance,
      total: collegesWithDistance.length,
      userLocation: { latitude, longitude },
      searchRadius: radius
    })

  } catch (error) {
    console.error('Error fetching colleges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch colleges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { latitude, longitude, radius = 100, limit = 20, type } = body

    // Validate coordinates
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Filter colleges by type if specified
    let filteredColleges = MOCK_COLLEGES
    if (type) {
      filteredColleges = MOCK_COLLEGES.filter(college => 
        college.type.toLowerCase() === type.toLowerCase()
      )
    }

    // Calculate distances and filter by radius
    const collegesWithDistance = filteredColleges
      .map(college => ({
        ...college,
        distance: calculateDistance(latitude, longitude, college.latitude, college.longitude)
      }))
      .filter(college => college.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)

    return NextResponse.json({
      colleges: collegesWithDistance,
      total: collegesWithDistance.length,
      userLocation: { latitude, longitude },
      searchRadius: radius
    })

  } catch (error) {
    console.error('Error fetching colleges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch colleges' },
      { status: 500 }
    )
  }
}
