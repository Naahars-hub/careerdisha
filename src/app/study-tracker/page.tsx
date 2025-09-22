'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './study-tracker.module.css';
import ProgressBar from '@/components/ProgressBar';
import StudySession from '@/components/StudySession';
import StudyAnalytics from '@/components/StudyAnalytics';
import GoalTimeTracker from '@/components/GoalTimeTracker';

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number; // in minutes
  startTime: Date;
  endTime?: Date;
  notes?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  goalId?: string; // Link to study goal
}

interface StudyGoal {
  id: string;
  title: string;
  targetHours: number;
  currentHours: number;
  deadline: Date;
  completed: boolean;
}

export default function StudyTrackerPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showGoalTimers, setShowGoalTimers] = useState(false);
  // const [goalTimeData, setGoalTimeData] = useState<{ [goalId: string]: number }>({});
  const supabase = createClient();

  useEffect(() => {
    loadStudyData();
  }, [loadStudyData]);

  const loadStudyData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Load study sessions
        const { data: sessionsData } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false });

        if (sessionsData) {
          setSessions(sessionsData.map(session => ({
            ...session,
            startTime: new Date(session.start_time),
            endTime: session.end_time ? new Date(session.end_time) : undefined
          })));
        }

        // Load study goals
        const { data: goalsData } = await supabase
          .from('study_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (goalsData) {
          setGoals(goalsData.map(goal => ({
            ...goal,
            deadline: new Date(goal.deadline)
          })));
        }
      }
    } catch (error) {
      console.error('Error loading study data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const startSession = async (subject: string, topic: string, difficulty: 'easy' | 'medium' | 'hard', goalId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newSession: StudySession = {
      id: Date.now().toString(),
      subject,
      topic,
      duration: 0,
      startTime: new Date(),
      difficulty,
      completed: false,
      goalId
    };

    setActiveSession(newSession);
    setSessions(prev => [newSession, ...prev]);
  };

  const endSession = async (notes?: string) => {
    if (!activeSession) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - activeSession.startTime.getTime()) / (1000 * 60));

    const updatedSession = {
      ...activeSession,
      endTime,
      duration,
      notes,
      completed: true
    };

    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          subject: updatedSession.subject,
          topic: updatedSession.topic,
          duration: updatedSession.duration,
          start_time: updatedSession.startTime.toISOString(),
          end_time: updatedSession.endTime.toISOString(),
          notes: updatedSession.notes,
          difficulty: updatedSession.difficulty,
          completed: updatedSession.completed,
          goal_id: updatedSession.goalId
        });

      // Update goal progress if session is linked to a goal
      if (updatedSession.goalId) {
        await updateGoalProgress(updatedSession.goalId, duration);
      }
    }

    setSessions(prev => 
      prev.map(session => 
        session.id === activeSession.id ? updatedSession : session
      )
    );
    setActiveSession(null);
  };

  const addGoal = async (title: string, targetHours: number, deadline: Date) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newGoal: StudyGoal = {
      id: Date.now().toString(),
      title,
      targetHours,
      currentHours: 0,
      deadline,
      completed: false
    };

    setGoals(prev => [newGoal, ...prev]);

    // Save to database
    await supabase
      .from('study_goals')
      .insert({
        user_id: user.id,
        title: newGoal.title,
        target_hours: newGoal.targetHours,
        current_hours: newGoal.currentHours,
        deadline: newGoal.deadline.toISOString(),
        completed: newGoal.completed
      });
  };

  const updateGoalProgress = async (goalId: string, additionalMinutes: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const additionalHours = additionalMinutes / 60;
    const newCurrentHours = Math.min(goal.currentHours + additionalHours, goal.targetHours);
    const isCompleted = newCurrentHours >= goal.targetHours;

    // Update local state
    setGoals(prev => 
      prev.map(g => 
        g.id === goalId 
          ? { ...g, currentHours: newCurrentHours, completed: isCompleted }
          : g
      )
    );

    // Update database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('study_goals')
        .update({
          current_hours: newCurrentHours,
          completed: isCompleted
        })
        .eq('id', goalId)
        .eq('user_id', user.id);
    }

    // Show completion celebration if goal is completed
    if (isCompleted && !goal.completed) {
      alert(`🎉 Congratulations! You've completed your goal: "${goal.title}"`);
    }
  };

  const manuallyUpdateGoalProgress = async (goalId: string, additionalHours: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newCurrentHours = Math.min(goal.currentHours + additionalHours, goal.targetHours);
    const isCompleted = newCurrentHours >= goal.targetHours;

    // Update local state
    setGoals(prev => 
      prev.map(g => 
        g.id === goalId 
          ? { ...g, currentHours: newCurrentHours, completed: isCompleted }
          : g
      )
    );

    // Update database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('study_goals')
        .update({
          current_hours: newCurrentHours,
          completed: isCompleted
        })
        .eq('id', goalId)
        .eq('user_id', user.id);
    }

    // Show completion celebration if goal is completed
    if (isCompleted && !goal.completed) {
      alert(`🎉 Congratulations! You've completed your goal: "${goal.title}"`);
    }
  };

  const deleteGoal = async (goalId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Remove from local state
    setGoals(prev => prev.filter(g => g.id !== goalId));

    // Remove from database
    await supabase
      .from('study_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id);
  };

  // Goal time tracking handlers
  const handleGoalTimeUpdate = (goalId: string, elapsedTime: number) => {
    setGoalTimeData(prev => ({
      ...prev,
      [goalId]: elapsedTime
    }));
  };

  const handleGoalComplete = (goalId: string) => {
    console.log(`Goal completed: ${goalId}`);
    // Update the goal in the database to mark as completed
    updateGoalProgress(goalId, 0); // This will trigger completion logic
  };

  const startGoalSession = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    // Start a study session linked to this goal
    startSession(
      `Goal: ${goal.title}`,
      'Working towards goal',
      'medium',
      goalId
    );
  };

  const parseTimeInput = (input: string): number => {
    if (!input || typeof input !== 'string') return 0;
    
    // Remove extra spaces and convert to lowercase
    const cleanInput = input.trim().toLowerCase();
    
    // Handle decimal hours (e.g., "1.5h", "2.5")
    if (cleanInput.includes('h') && !cleanInput.includes('m')) {
      const hours = parseFloat(cleanInput.replace('h', ''));
      return isNaN(hours) ? 0 : hours;
    }
    
    // Handle minutes only (e.g., "90m", "120m")
    if (cleanInput.includes('m') && !cleanInput.includes('h')) {
      const minutes = parseFloat(cleanInput.replace('m', ''));
      return isNaN(minutes) ? 0 : minutes / 60;
    }
    
    // Handle hours and minutes (e.g., "1h 30m", "2h 15m")
    if (cleanInput.includes('h') && cleanInput.includes('m')) {
      const parts = cleanInput.split(/\s+/);
      let totalHours = 0;
      
      for (const part of parts) {
        if (part.includes('h')) {
          const hours = parseFloat(part.replace('h', ''));
          if (!isNaN(hours)) totalHours += hours;
        } else if (part.includes('m')) {
          const minutes = parseFloat(part.replace('m', ''));
          if (!isNaN(minutes)) totalHours += minutes / 60;
        }
      }
      
      return totalHours;
    }
    
    // Handle just numbers (assume hours)
    const number = parseFloat(cleanInput);
    return isNaN(number) ? 0 : number;
  };

  const formatTimeDisplay = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${wholeHours}h`;
    } else {
      return `${wholeHours}h ${minutes}m`;
    }
  };

  const calculateTotalStudyTime = () => {
    return sessions
      .filter(session => session.completed)
      .reduce((total, session) => total + session.duration, 0);
  };

  const calculateWeeklyProgress = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklySessions = sessions.filter(session => 
      session.completed && session.startTime >= oneWeekAgo
    );
    
    return weeklySessions.reduce((total, session) => total + session.duration, 0);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your study progress...</p>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>📚 Study Tracker</h1>
          <p>Track your learning progress and achieve your academic goals</p>
        </header>

        {/* Quick Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>Total Study Time</div>
            <div className={styles.statValue}>
              {Math.round(calculateTotalStudyTime() / 60)}h {calculateTotalStudyTime() % 60}m
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>This Week</div>
            <div className={styles.statValue}>
              {Math.round(calculateWeeklyProgress() / 60)}h {calculateWeeklyProgress() % 60}m
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>Active Sessions</div>
            <div className={styles.statValue}>{activeSession ? '1' : '0'}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>Goals</div>
            <div className={styles.statValue}>{goals.length}</div>
          </div>
        </div>

        {/* Active Session */}
        {activeSession && (
          <div className={styles.activeSession}>
            <h2>🎯 Active Study Session</h2>
            <StudySession 
              session={activeSession}
              onEnd={endSession}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {!activeSession && (
            <button 
              className={styles.primaryButton}
              onClick={() => setShowAddSession(true)}
            >
              Start New Session
            </button>
          )}
          <button 
            className={styles.secondaryButton}
            onClick={() => setShowAddGoal(true)}
          >
            Add Study Goal
          </button>
          {goals.length > 0 && (
            <button 
              className={styles.goalTimerButton}
              onClick={() => setShowGoalTimers(!showGoalTimers)}
            >
              {showGoalTimers ? 'Hide Goal Timers' : 'Show Goal Timers'} ⏱️
            </button>
          )}
        </div>

        {/* Study Goals */}
        {goals.length > 0 && (
          <section className={styles.section}>
            <h2>🎯 Study Goals</h2>
            <div className={styles.goalsGrid}>
              {goals.map(goal => (
                <div key={goal.id} className={`${styles.goalCard} ${goal.completed ? styles.completedGoal : ''}`}>
                  <div className={styles.goalHeader}>
                    <h3>{goal.title}</h3>
                    <div className={styles.goalActions}>
                      <button 
                        className={styles.actionButton}
                        onClick={() => {
                          const timeInput = prompt(`Add time to "${goal.title}" (format: 1h 30m or 90m or 1.5h):`, '1h');
                          if (timeInput) {
                            const hours = parseTimeInput(timeInput);
                            if (hours > 0) {
                              manuallyUpdateGoalProgress(goal.id, hours);
                            } else {
                              alert('Please enter time in a valid format (e.g., "1h 30m", "90m", "1.5h")');
                            }
                          }
                        }}
                        title="Add time manually"
                      >
                        ➕
                      </button>
                      <button 
                        className={styles.actionButton}
                        onClick={() => deleteGoal(goal.id)}
                        title="Delete goal"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <ProgressBar 
                    progress={(goal.currentHours / goal.targetHours) * 100}
                    label={`${formatTimeDisplay(goal.currentHours)}/${formatTimeDisplay(goal.targetHours)}`}
                    color={goal.completed ? "success" : "primary"}
                  />
                  <div className={styles.goalDetails}>
                    <p>Deadline: {goal.deadline.toLocaleDateString()}</p>
                    <p className={`${styles.goalStatus} ${
                      goal.completed ? styles.goalStatusCompleted : 
                      goal.deadline < new Date() ? styles.goalStatusOverdue : ''
                    }`}>
                      {goal.completed ? '✅ Completed!' : 
                       goal.deadline < new Date() ? '⚠️ Overdue' : 
                       `Remaining: ${formatTimeDisplay(goal.targetHours - goal.currentHours)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Goal Timers Section */}
        {showGoalTimers && goals.length > 0 && (
          <section className={styles.section}>
            <h2>⏱️ Goal Timers</h2>
            <p className={styles.goalTimersDescription}>
              Track your progress on study goals with dedicated timers. Start working towards your goals and see real-time progress.
            </p>
            <div className={styles.goalTimersGrid}>
              {goals.map(goal => (
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
            <div className={styles.goalTimersActions}>
              <button 
                className={styles.startAllGoalsButton}
                onClick={() => {
                  // Start sessions for all incomplete goals
                  goals.filter(g => !g.completed).forEach(goal => {
                    startGoalSession(goal.id);
                  });
                }}
                disabled={activeSession !== null}
              >
                🚀 Start All Goals
              </button>
            </div>
          </section>
        )}

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <section className={styles.section}>
            <h2>📖 Recent Study Sessions</h2>
            <div className={styles.sessionsList}>
              {sessions.slice(0, 5).map(session => (
                <div key={session.id} className={styles.sessionCard}>
                  <div className={styles.sessionInfo}>
                    <h3>{session.subject} - {session.topic}</h3>
                    <p>{session.duration} minutes • {session.difficulty}</p>
                    {session.notes && <p className={styles.notes}>{session.notes}</p>}
                  </div>
                  <div className={styles.sessionTime}>
                    {session.startTime.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Analytics */}
        <StudyAnalytics sessions={sessions} goals={goals} />

        {/* Modals */}
        {showAddSession && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Start New Study Session</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const goalId = formData.get('goalId') as string;
                startSession(
                  formData.get('subject') as string,
                  formData.get('topic') as string,
                  formData.get('difficulty') as 'easy' | 'medium' | 'hard',
                  goalId || undefined
                );
                setShowAddSession(false);
              }}>
                <input 
                  name="subject" 
                  placeholder="Subject (e.g., Mathematics)" 
                  required 
                />
                <input 
                  name="topic" 
                  placeholder="Topic (e.g., Calculus)" 
                  required 
                />
                <select name="difficulty" required>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select name="goalId">
                  <option value="">No specific goal (optional)</option>
                  {goals.filter(goal => !goal.completed).map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title} ({goal.currentHours.toFixed(1)}/{goal.targetHours}h)
                    </option>
                  ))}
                </select>
                <div className={styles.modalButtons}>
                  <button type="submit">Start Session</button>
                  <button type="button" onClick={() => setShowAddSession(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddGoal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Add Study Goal</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addGoal(
                  formData.get('title') as string,
                  parseInt(formData.get('targetHours') as string),
                  new Date(formData.get('deadline') as string)
                );
                setShowAddGoal(false);
              }}>
                <input 
                  name="title" 
                  placeholder="Goal title" 
                  required 
                />
                <input 
                  name="targetHours" 
                  type="number" 
                  placeholder="Target hours" 
                  required 
                />
                <input 
                  name="deadline" 
                  type="date" 
                  required 
                />
                <div className={styles.modalButtons}>
                  <button type="submit">Add Goal</button>
                  <button type="button" onClick={() => setShowAddGoal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
