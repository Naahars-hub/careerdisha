'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import GoalTimeTracker from '@/components/GoalTimeTracker';
import { LocationStorage } from '@/lib/localStorage';
import styles from './career-map.module.css';

// --- TYPES ---
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
  streamSuggestion?: { stream: string; reason: string };
  careerOptions: CareerOption[];
  higherStudies?: { description: string; colleges: string[] };
  businessOpportunities?: { description: string; ideas: string[] };
}

interface ExamInfo {
  name: string;
  lastExamDate: string;
  expectedNextDate?: string;
  conductingBody?: string;
  level: 'National' | 'State' | 'University';
}

interface DifficultyData {
  acceptanceRate: string;
  applicants?: number;
  seats?: number;
}

interface SkillIndiaCourse {
  title: string;
  url: string;
  description: string;
  sector: string;
  duration: string;
  level: string;
}

interface SkillIndiaTool {
  name: string;
  url: string;
  description: string;
  features: string[];
}

interface SkillIndiaDigital {
  platform: string;
  courses: SkillIndiaCourse[];
  tools: SkillIndiaTool[];
  benefits: string[];
}

interface ResourceData {
  youtube: string[];
  links: string[];
  skillIndiaDigital?: SkillIndiaDigital;
  exams: ExamInfo[];
  applicationWindow: string;
  preparationStrategy: string;
  difficulty: DifficultyData;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetHours: number;
  category: 'study' | 'practice' | 'research' | 'skill-building';
  priority: 'high' | 'medium' | 'low';
}
// --- END TYPES ---

export default function CareerMapPage() {
  const supabase = createClient();
  const router = useRouter();
  const [careerMapData, setCareerMapData] = useState<CareerMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [educationLevel, setEducationLevel] = useState<string | null>(null);

  // --- RESOURCES STATE ---
  const [careerResources, setCareerResources] = useState<{ [key: string]: ResourceData }>({});
  const [expandedCareer, setExpandedCareer] = useState<string | null>(null);
  const [loadingResourcesFor, setLoadingResourcesFor] = useState<string | null>(null);
  const [resourceTimestamps, setResourceTimestamps] = useState<{ [key: string]: string }>({});
  // --- END STATE ---

  // --- GOAL TRACKING STATE ---
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalTimeData, setGoalTimeData] = useState<{ [goalId: string]: number }>({});
  const [showGoals, setShowGoals] = useState(false);
  // --- END GOAL STATE ---

  useEffect(() => {
    const fetchCareerMap = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          const current = window.location.pathname + window.location.search;
          router.push(`/?login=1&next=${encodeURIComponent(current)}`);
          return;
        }
        const storedData = sessionStorage.getItem('careerData');
        if (!storedData) throw new Error('No data found. Please start from the homepage.');

        // Get location data from localStorage
        const locationData = LocationStorage.getLocationData();
        
        // Parse the stored data and add location information
        const requestData = JSON.parse(storedData);
        if (locationData) {
          requestData.locationData = locationData;
        }
        
        // Store education level for conditional rendering
        const educationLevel = requestData.baseData?.educationLevel;
        setEducationLevel(educationLevel);

        const response = await fetch('/api/generateCareerMap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) throw new Error('Failed to generate career map.');

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        setCareerMapData(data);
        
        // Initialize default goals based on career options
        initializeDefaultGoals(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchCareerMap();
  }, [router, supabase.auth]);

  // Initialize default goals based on career map data
  const initializeDefaultGoals = (data: CareerMapData) => {
    const defaultGoals: Goal[] = [];
    
    if (data.careerOptions && data.careerOptions.length > 0) {
      data.careerOptions.slice(0, 3).forEach((career, index) => {
        defaultGoals.push({
          id: `career-${index + 1}`,
          title: `Research ${career.title}`,
          description: `Deep dive into ${career.title} career path, study requirements, and opportunities`,
          targetHours: 10,
          category: 'research',
          priority: 'high'
        });
        
        defaultGoals.push({
          id: `skill-${index + 1}`,
          title: `Build ${career.title} Skills`,
          description: `Develop core skills and knowledge required for ${career.title}`,
          targetHours: 20,
          category: 'skill-building',
          priority: 'high'
        });
      });
    }
    
    // Add general study goals
    defaultGoals.push({
      id: 'general-study',
      title: 'General Career Research',
      description: 'Research various career paths, industry trends, and educational requirements',
      targetHours: 15,
      category: 'study',
      priority: 'medium'
    });
    
    setGoals(defaultGoals);
  };

  // Goal tracking handlers
  const handleGoalTimeUpdate = (goalId: string, elapsedTime: number) => {
    setGoalTimeData(prev => ({
      ...prev,
      [goalId]: elapsedTime
    }));
  };

  const handleGoalComplete = (goalId: string) => {
    console.log(`Goal completed: ${goalId}`);
    // You can add additional logic here like showing a notification
  };

  // --- FETCH RESOURCES ---
  const handleShowResources = async (careerTitle: string) => {
    if (expandedCareer === careerTitle) {
      setExpandedCareer(null);
      return;
    }
    if (careerResources[careerTitle]) {
      setExpandedCareer(careerTitle);
      return;
    }
    try {
      setLoadingResourcesFor(careerTitle);
      console.log('Fetching resources for:', careerTitle);
      
      const response = await fetch('/api/getCareerResources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerTitle }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `Could not fetch resources. Status: ${response.status}`);
      }
      
      const data: ResourceData = await response.json();
      console.log('Resources data received:', data);

      setCareerResources(prev => ({ ...prev, [careerTitle]: data }));
      setResourceTimestamps(prev => ({ 
        ...prev, 
        [careerTitle]: new Date().toLocaleString() 
      }));
      setExpandedCareer(careerTitle);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching resources:', err);
      alert(`Error fetching resources: ${errorMessage}`);
    } finally {
      setLoadingResourcesFor(null);
    }
  };

  const handleDownloadPdf = async () => {
    const { default: html2pdf } = await import('html2pdf.js');
    const element = document.getElementById('report-content');
    if (!element) return;
    
    const opt = {
      margin: 0.5,
      filename: 'CareerDisha_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().from(element).set(opt).save();
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <h1>Crafting Your Future...</h1>
          <p>
            Our AI is analyzing your profile to build your personalized career map. This might take
            up to a minute. ⏳
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.error}>An Error Occurred</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div id="report-content">
          <div className={styles.header}>
            <h1>Your Personalized Career Map 🗺️</h1>
            <div className={styles.headerActions}>
              <button 
                onClick={() => setShowGoals(!showGoals)} 
                className={styles.goalsButton}
              >
                {showGoals ? 'Hide Goals' : 'Show Goals'} 🎯
              </button>
              <button onClick={handleDownloadPdf} className={styles.downloadButton}>
                Download PDF
              </button>
            </div>
          </div>

          {/* Only show stream suggestion for 10th grade students */}
          {careerMapData?.streamSuggestion && educationLevel === '10th' && (
            <div className={styles.section}>
              <h2>Recommended Stream</h2>
              <h3>{careerMapData.streamSuggestion.stream}</h3>
              <p>{careerMapData.streamSuggestion.reason}</p>
            </div>
          )}

          <div className={styles.section}>
            <h2>Top Career Options</h2>
            {careerMapData?.careerOptions.map((career, index) => (
              <div key={index} className={styles.card}>
                <h3>
                  {index + 1}. {career.title}
                </h3>
                <p>{career.description}</p>

                {/* Only show colleges for 10th and 12th grade students */}
                {educationLevel === '10th' || educationLevel === '12th' ? (
                  <>
                    <h4>Top Colleges</h4>
                    <ul className={styles.chips}>
                      {career.colleges && career.colleges.map((college, cIndex) => (
                        <li key={cIndex} className={styles.chip}>{college}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

                <h4>Job Opportunities</h4>
                {career.jobOpportunities && (
                  <div className={styles.jobsGrid}>
                    {career.jobOpportunities.map((job, jIndex) => (
                      <div key={jIndex} className={styles.jobCard}>
                        <div className={styles.jobTitleRow}>
                          <strong>{job.title}</strong>
                          <span className={`${styles.trend} ${styles[job.marketTrend]}`}>
                            {job.marketTrend === 'up'
                              ? '▲'
                              : job.marketTrend === 'down'
                              ? '▼'
                              : '⏺️'} {job.marketTrend}
                          </span>
                        </div>
                        <div className={styles.salary}>{job.avgSalary}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* --- RESOURCES SECTION --- */}
                <button
                  onClick={() => handleShowResources(career.title)}
                  className={styles.resourceButton}
                >
                  {expandedCareer === career.title ? 'Hide Resources' : 'Show Resources'}
                  {careerResources[career.title] && (
                    <span className={styles.cachedIndicator}>✓ Cached</span>
                  )}
                </button>

                {expandedCareer === career.title && (
                  <div className={styles.resourceSection}>
                    {loadingResourcesFor === career.title ? (
                      <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Loading personalized resources for {career.title}...</p>
                      </div>
                    ) : careerResources[career.title] ? (
                        <>
                          <div className={styles.resourceHeader}>
                            <h4>Personalized Resources</h4>
                            {resourceTimestamps[career.title] && (
                              <span className={styles.timestamp}>
                                Generated: {resourceTimestamps[career.title]}
                              </span>
                            )}
                          </div>
                          <h4>Key Exams</h4>
                          <ul>
                            {careerResources[career.title]?.exams?.map((exam, i) => (
                              <li key={i}>
                                <strong>{exam.name}</strong>
                                <br />
                                Last Exam: {exam.lastExamDate}
                                <br />
                                {exam.expectedNextDate && (
                                  <>
                                    Next Expected: {exam.expectedNextDate}
                                    <br />
                                  </>
                                )}
                                Conducted by: {exam.conductingBody || 'N/A'}
                                <br />
                                Level: {exam.level}
                              </li>
                            ))}
                          </ul>

                          <h4>Application Window</h4>
                          <p>{careerResources[career.title]?.applicationWindow}</p>

                          <h4>Preparation Strategy</h4>
                          <p>{careerResources[career.title]?.preparationStrategy}</p>

                          <h4>Difficulty (Selection Ratio)</h4>
                          <div className={styles.metricsGrid}>
                            <div className={styles.metricRow}>
                              {(() => {
                                const rate = careerResources[career.title]?.difficulty?.acceptanceRate;
                                const num = parseFloat((rate || '0').toString().replace(/[^0-9.]/g, ''));
                                const percent = isNaN(num) ? 0 : num;
                                return (
                                  <div className={styles.metricRow}>
                                    <div
                                      className={styles.ring}
                                      style={{ '--percent': percent } as React.CSSProperties & { '--percent'?: number | string }}
                                    >
                                      <div className={styles.ringInner}>{percent}%</div>
                                    </div>
                                    <div>
                                      <div><strong>Acceptance Rate</strong></div>
                                      <div>{rate}</div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className={styles.metricBox}>
                              <div><strong>Applicants</strong></div>
                              <div>{careerResources[career.title]?.difficulty?.applicants ? careerResources[career.title]?.difficulty?.applicants?.toLocaleString() : '—'}</div>
                            </div>
                            <div className={styles.metricBox}>
                              <div><strong>Seats</strong></div>
                              <div>{careerResources[career.title]?.difficulty?.seats ? careerResources[career.title]?.difficulty?.seats?.toLocaleString() : '—'}</div>
                            </div>
                          </div>

                          <h4>Helpful Links</h4>
                          <ul>
                            {careerResources[career.title]?.links?.map((link, i) => (
                              <li key={i}>
                                <a href={link} target="_blank" rel="noopener noreferrer">
                                  {link}
                                </a>
                              </li>
                            ))}
                          </ul>

                          <h4>Recommended YouTube Videos</h4>
                          <ul>
                            {careerResources[career.title]?.youtube?.map((link, i) => (
                              <li key={i}>
                                <a href={link} target="_blank" rel="noopener noreferrer">
                                  {link}
                                </a>
                              </li>
                            ))}
                          </ul>

                          {/* Skill India Digital Resources */}
                          {careerResources[career.title]?.skillIndiaDigital && (
                            <>
                              <h4>🎓 Skill India Digital Resources</h4>
                              <div className={styles.skillIndiaSection}>
                                <p className={styles.skillIndiaIntro}>
                                  <strong>Platform:</strong>{' '}
                                  <a 
                                    href={careerResources[career.title]?.skillIndiaDigital?.platform} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={styles.platformLink}
                                  >
                                    {careerResources[career.title]?.skillIndiaDigital?.platform}
                                  </a>
                                </p>
                                
                                <h5>Relevant Courses</h5>
                                <div className={styles.skillIndiaNotice}>
                                  <p><strong>📚 How to find these courses:</strong></p>
                                  <p>Click on any course below to visit the Skill India Digital platform, then use the search function to find the specific course by name or keywords.</p>
                                  <p><strong>🎯 Course Matching:</strong> These courses are dynamically selected based on your career choice and are ranked by relevance to your specific career path.</p>
                                </div>
                                <div className={styles.coursesGrid}>
                                  {careerResources[career.title]?.skillIndiaDigital?.courses?.map((course, i) => (
                                    <div key={i} className={styles.courseCard}>
                                      <div className={styles.courseHeader}>
                                        <h6>
                                          <a href={course.url} target="_blank" rel="noopener noreferrer" className={styles.courseLink}>
                                            {course.title}
                                          </a>
                                        </h6>
                                        <div className={styles.relevanceIndicator}>
                                          <span className={`${styles.relevanceBadge} ${i === 0 ? styles.mostRelevant : i < 3 ? styles.highlyRelevant : ''}`}>
                                            {i === 0 ? '🔥 Most Relevant' : i < 3 ? '⭐ Highly Relevant' : '✓ Relevant'}
                                          </span>
                                        </div>
                                      </div>
                                      <p className={styles.courseDescription}>{course.description}</p>
                                      <div className={styles.courseMeta}>
                                        <span className={styles.sector}>{course.sector}</span>
                                        <span className={styles.level}>{course.level}</span>
                                        <span className={styles.duration}>{course.duration}</span>
                                      </div>
                                      {(course as any).provider && (
                                        <div className={styles.courseProvider}>
                                          <span className={styles.provider}>Provider: {(course as any).provider}</span>
                                          <span className={styles.certification}>✓ {(course as any).certification}</span>
                                        </div>
                                      )}
                                      <div className={styles.courseInstructions}>
                                        <small>💡 Search for "{course.title}" on the Skill India platform</small>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {(() => {
                                  const tools = careerResources[career.title]?.skillIndiaDigital?.tools;
                                  return tools && tools.length > 0;
                                })() && (
                                  <>
                                    <h5>Available Tools</h5>
                                    <div className={styles.toolsGrid}>
                                      {careerResources[career.title]?.skillIndiaDigital?.tools?.map((tool, i) => (
                                        <div key={i} className={styles.toolCard}>
                                          <h6>
                                            <a href={tool.url} target="_blank" rel="noopener noreferrer">
                                              {tool.name}
                                            </a>
                                          </h6>
                                          <p>{tool.description}</p>
                                          <ul className={styles.featuresList}>
                                            {tool.features.map((feature, j) => (
                                              <li key={j}>{feature}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}

                                <h5>Benefits</h5>
                                <ul className={styles.benefitsList}>
                                  {careerResources[career.title]?.skillIndiaDigital?.benefits?.map((benefit, i) => (
                                    <li key={i}>✓ {benefit}</li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div>
                          <p>Failed to load resources. Please try again.</p>
                          <button 
                            onClick={() => handleShowResources(career.title)}
                            className={styles.resourceButton}
                          >
                            Retry
                          </button>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Goals Section */}
          {showGoals && (
            <div className={styles.section}>
              <h2>Your Career Goals 🎯</h2>
              <p className={styles.goalsDescription}>
                Track your progress on key career development goals. Set time targets and monitor your advancement.
              </p>
              <div className={styles.goalsGrid}>
                {goals.map((goal) => (
                  <GoalTimeTracker
                    key={goal.id}
                    goalId={goal.id}
                    goalTitle={goal.title}
                    targetHours={goal.targetHours}
                    onTimeUpdate={handleGoalTimeUpdate}
                    onGoalComplete={handleGoalComplete}
                  />
                ))}
              </div>
            </div>
          )}

          {careerMapData?.higherStudies && (
            <div className={styles.section}>
              <h2>Higher Studies Options</h2>
              <p>{careerMapData.higherStudies.description}</p>
              <ul className={styles.list}>
                {careerMapData.higherStudies.colleges.map((pg, pgIndex) => (
                  <li key={pgIndex}>{pg}</li>
                ))}
              </ul>
            </div>
          )}

          {careerMapData?.businessOpportunities && (
            <div className={styles.section}>
              <h2>Business Opportunities</h2>
              <p>{careerMapData.businessOpportunities.description}</p>
              <ul className={styles.list}>
                {careerMapData.businessOpportunities.ideas.map((idea, iIndex) => (
                  <li key={iIndex}>{idea}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
