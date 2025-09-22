'use client'

import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import NearbyColleges from '@/components/NearbyColleges';
import LocationPrompt from '@/components/LocationPrompt';
import { LocationData } from '@/lib/locationService';
// NOTE: We are re-using the same TypeScript types from the career-map page
// In a larger app, these would be moved to a shared types file.
interface JobOpportunity {
  title: string;
  avgSalary: string;
  marketTrend: 'up' | 'down' | 'stable';
}
interface CareerOption {
  title: string;
  description: string;
  colleges?: string[]; // Optional for in-college students
  jobOpportunities: JobOpportunity[];
}
interface CareerMapData {
  streamSuggestion?: { stream: string; reason: string; };
  careerOptions: CareerOption[];
  // ... other optional fields
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedMap, setSavedMap] = useState<CareerMapData | null>(null);
  const [educationLevel, setEducationLevel] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchSavedResult = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('results')
          .select('map_data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(); // .single() gets one record or null

        if (error && error.code !== 'PGRST116') { // Ignore 'range not found' error
          setError(error.message);
        } else if (data) {
          setSavedMap(data.map_data as CareerMapData);
          
          // Try to get education level from sessionStorage
          const storedData = sessionStorage.getItem('careerData');
          if (storedData) {
            try {
              const requestData = JSON.parse(storedData);
              const educationLevel = requestData.baseData?.educationLevel;
              setEducationLevel(educationLevel);
            } catch {
              console.log('Could not parse stored career data for education level');
            }
          }
        }

        // Fetch user location from profile
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('location_country, location_state, location_city, latitude, longitude, timezone')
            .eq('user_id', user.id)
            .single();

          if (profileData && !profileError) {
            if (profileData.latitude && profileData.longitude) {
              setUserLocation({
                country: profileData.location_country || 'Unknown',
                state: profileData.location_state || 'Unknown',
                city: profileData.location_city || 'Unknown',
                latitude: profileData.latitude,
                longitude: profileData.longitude,
                timezone: profileData.timezone || 'UTC'
              });
            } else {
              // User doesn't have location data, show prompt
              setShowLocationPrompt(true);
            }
          } else {
            // No profile data, show prompt
            setShowLocationPrompt(true);
          }
        }
      } else {
        setError("You must be logged in to view your dashboard.");
      }
      setLoading(false);
    };

    fetchSavedResult();
  }, [supabase]);

  if (loading) {
    return <div className={styles.centered}>Loading your dashboard...</div>;
  }

  if (error) {
    return <div className={`${styles.centered} ${styles.error}`}>{error}</div>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {savedMap ? (
          <>
            <div className={styles.header}>
              <h1>✨ Your Saved Career Map</h1>
              <Link href="/start" className={styles.retakeButton}>Take Quiz Again</Link>
            </div>
            {/* We reuse the same display logic from the career map page */}
            {/* Only show stream suggestion for 10th grade students */}
            {savedMap.streamSuggestion && educationLevel === '10th' && (
              <div className={styles.section}>
                <h2>🎓 Recommended Stream</h2>
                <div className={styles.card}>
                  <h3>{savedMap.streamSuggestion.stream}</h3>
                  <p>{savedMap.streamSuggestion.reason}</p>
                </div>
              </div>
            )}
            {/* quick summary stats */}
            <div className={styles.statsGrid}>
              {/* Only show stream stat for 10th grade students */}
              {educationLevel === '10th' && (
                <div className={styles.statCard}>
                  <div className={styles.statTitle}>Recommended Stream</div>
                  <div className={styles.statValue}>{savedMap.streamSuggestion?.stream || '—'}</div>
                </div>
              )}
              <div className={styles.statCard}>
                <div className={styles.statTitle}>Career Options</div>
                <div className={styles.statValue}>{savedMap.careerOptions.length}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>Total Job Roles</div>
                <div className={styles.statValue}>{savedMap.careerOptions.reduce((acc, c) => acc + (c.jobOpportunities?.length || 0), 0)}</div>
              </div>
            </div>

            {/* journey stepper */}
            <div className={styles.stepper}>
              <Link href="/start" className={styles.step}>1. Take Quiz</Link>
              <Link href="/career-map" className={styles.step}>2. Review Map</Link>
              <Link href="/career-map" className={styles.step}>3. Explore Resources</Link>
              <Link href="/dashboard" className={styles.step}>4. Track Progress</Link>
            </div>

            {/* Show location prompt if user doesn't have location data */}
            {showLocationPrompt && (
              <LocationPrompt 
                onLocationCollected={() => {
                  setShowLocationPrompt(false);
                  // Refresh the page to fetch updated location data
                  window.location.reload();
                }}
              />
            )}

            {/* Show nearby colleges if user location is available */}
            {userLocation && userLocation.latitude !== 0 && userLocation.longitude !== 0 && (
              <NearbyColleges userLocation={userLocation} />
            )}

            <div className={styles.section}>
              <h2>💼 Top Career Options</h2>
              {savedMap.careerOptions.map((career, index) => (
                <div key={index} className={styles.card}>
                  <h3>{index + 1}. {career.title}</h3>
                  <p>{career.description}</p>
                  {/* Only show colleges for 10th and 12th grade students */}
                  {(educationLevel === '10th' || educationLevel === '12th') && career.colleges && career.colleges.length > 0 ? (
                    <>
                      <h4>🏛️ Top Colleges</h4>
                      <ul className={styles.chips}>
                        {career.colleges.map((college, cIndex) => <li key={cIndex} className={styles.chip}>{college}</li>)}
                      </ul>
                    </>
                  ) : null}
                  <h4>📈 Job Opportunities</h4>
                  <div className={styles.jobsGrid}>
                    {career.jobOpportunities.map((job, jIndex) => (
                      <div key={jIndex} className={styles.jobCard}>
                        <div className={styles.jobTitleRow}>
                          <strong>{job.title}</strong>
                          <span className={`${styles.trend} ${styles[job.marketTrend]}`}>{job.marketTrend === 'up' ? '▲' : job.marketTrend === 'down' ? '▼' : '⏺️'} {job.marketTrend}</span>
                        </div>
                        <div className={styles.salary}>{job.avgSalary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.noResult}>
            <h2>Welcome to Your Dashboard!</h2>
            <p>You haven&apos;t generated a career map yet.</p>
            <Link href="/start" className={styles.ctaButton}>
              Get Your Personalized Career Map
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}