'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './StudyAnalytics.module.css';
import ProgressBar from './ProgressBar';

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  startTime: Date;
  endTime?: Date;
  notes?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  goalId?: string;
}

interface StudyGoal {
  id: string;
  title: string;
  targetHours: number;
  currentHours: number;
  deadline: Date;
  completed: boolean;
}

interface StudyAnalyticsProps {
  sessions: StudySession[];
  goals: StudyGoal[];
}

export default function StudyAnalytics({ sessions, goals }: StudyAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [analytics, setAnalytics] = useState({
    totalTime: 0,
    averageSessionLength: 0,
    mostStudiedSubject: '',
    studyStreak: 0,
    weeklyGoal: 0,
    weeklyProgress: 0
  });

  useEffect(() => {
    calculateAnalytics();
  }, [sessions, goals, selectedPeriod, calculateAnalytics]);

  const calculateAnalytics = useCallback(() => {
    const now = new Date();
    let filteredSessions = sessions.filter(session => session.completed);

    // Filter by period
    if (selectedPeriod === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredSessions = filteredSessions.filter(session => session.startTime >= oneWeekAgo);
    } else if (selectedPeriod === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredSessions = filteredSessions.filter(session => session.startTime >= oneMonthAgo);
    }

    const totalTime = filteredSessions.reduce((total, session) => total + session.duration, 0);
    const averageSessionLength = filteredSessions.length > 0 ? totalTime / filteredSessions.length : 0;
    
    // Find most studied subject
    const subjectCounts = filteredSessions.reduce((acc, session) => {
      acc[session.subject] = (acc[session.subject] || 0) + session.duration;
      return acc;
    }, {} as Record<string, number>);
    
    const mostStudiedSubject = Object.keys(subjectCounts).reduce((a, b) => 
      subjectCounts[a] > subjectCounts[b] ? a : b, 'None'
    );

    // Calculate study streak
    const studyStreak = calculateStudyStreak(filteredSessions);

    // Weekly goal progress
    const weeklyGoal = goals.find(goal => !goal.completed)?.targetHours || 0;
    const weeklyProgress = Math.min((totalTime / 60) / weeklyGoal * 100, 100);

    setAnalytics({
      totalTime,
      averageSessionLength,
      mostStudiedSubject,
      studyStreak,
      weeklyGoal,
      weeklyProgress
    });
  }, [sessions, goals, selectedPeriod]);

  const calculateStudyStreak = (sessions: StudySession[]) => {
    if (sessions.length === 0) return 0;

    const studyDays = new Set(
      sessions.map(session => 
        session.startTime.toDateString()
      )
    );

    const sortedDays = Array.from(studyDays).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDays.length; i++) {
      const studyDate = new Date(sortedDays[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (studyDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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

  const getDifficultyStats = () => {
    const difficultyCounts = sessions
      .filter(session => session.completed)
      .reduce((acc, session) => {
        acc[session.difficulty] = (acc[session.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return difficultyCounts;
  };

  const getSubjectStats = () => {
    const subjectStats = sessions
      .filter(session => session.completed)
      .reduce((acc, session) => {
        if (!acc[session.subject]) {
          acc[session.subject] = { count: 0, totalTime: 0 };
        }
        acc[session.subject].count++;
        acc[session.subject].totalTime += session.duration;
        return acc;
      }, {} as Record<string, { count: number; totalTime: number }>);

    return Object.entries(subjectStats)
      .sort((a, b) => b[1].totalTime - a[1].totalTime)
      .slice(0, 5);
  };

  return (
    <section className={styles.analyticsSection}>
      <div className={styles.analyticsHeader}>
        <h2>📊 Study Analytics</h2>
        <div className={styles.periodSelector}>
          <button 
            className={`${styles.periodButton} ${selectedPeriod === 'week' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button 
            className={`${styles.periodButton} ${selectedPeriod === 'month' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
          <button 
            className={`${styles.periodButton} ${selectedPeriod === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('all')}
          >
            All Time
          </button>
        </div>
      </div>

      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsCard}>
          <h3>Total Study Time</h3>
          <div className={styles.bigNumber}>
            {formatTime(analytics.totalTime)}
          </div>
          <p className={styles.cardDescription}>
            {selectedPeriod === 'week' ? 'This week' : 
             selectedPeriod === 'month' ? 'This month' : 'All time'}
          </p>
        </div>

        <div className={styles.analyticsCard}>
          <h3>Average Session</h3>
          <div className={styles.bigNumber}>
            {formatTime(analytics.averageSessionLength)}
          </div>
          <p className={styles.cardDescription}>
            Per study session
          </p>
        </div>

        <div className={styles.analyticsCard}>
          <h3>Study Streak</h3>
          <div className={styles.bigNumber}>
            {analytics.studyStreak} days
          </div>
          <p className={styles.cardDescription}>
            Consecutive study days
          </p>
        </div>

        <div className={styles.analyticsCard}>
          <h3>Top Subject</h3>
          <div className={styles.bigNumber}>
            {analytics.mostStudiedSubject || 'None'}
          </div>
          <p className={styles.cardDescription}>
            Most studied subject
          </p>
        </div>
      </div>

      {analytics.weeklyGoal > 0 && (
        <div className={styles.goalProgress}>
          <h3>Weekly Goal Progress</h3>
          <ProgressBar 
            progress={analytics.weeklyProgress}
            label={`${Math.round(analytics.totalTime / 60)}h / ${analytics.weeklyGoal}h`}
            color="primary"
            size="large"
          />
        </div>
      )}

      {/* Goal Progress Overview */}
      {goals.length > 0 && (
        <div className={styles.goalProgress}>
          <h3>🎯 Goal Progress Overview</h3>
          <div className={styles.goalsOverview}>
            {goals.map(goal => {
              const progress = (goal.currentHours / goal.targetHours) * 100;
              const isOverdue = goal.deadline < new Date() && !goal.completed;
              return (
                <div key={goal.id} className={styles.goalOverviewItem}>
                  <div className={styles.goalOverviewHeader}>
                    <span className={styles.goalTitle}>{goal.title}</span>
                    <span className={styles.goalProgressText}>
                      {formatTimeDisplay(goal.currentHours)} / {formatTimeDisplay(goal.targetHours)}
                    </span>
                  </div>
                  <ProgressBar 
                    progress={progress}
                    color={goal.completed ? "success" : isOverdue ? "error" : "primary"}
                    size="small"
                  />
                  <div className={styles.goalOverviewDetails}>
                    <span className={styles.goalDeadline}>
                      Deadline: {goal.deadline.toLocaleDateString()}
                    </span>
                    <span className={`${styles.goalStatus} ${goal.completed ? styles.completed : isOverdue ? styles.overdue : ''}`}>
                      {goal.completed ? '✅ Completed' : isOverdue ? '⚠️ Overdue' : 'In Progress'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.detailedStats}>
        <div className={styles.statSection}>
          <h4>📚 Subject Breakdown</h4>
          <div className={styles.subjectList}>
            {getSubjectStats().map(([subject, stats]) => (
              <div key={subject} className={styles.subjectItem}>
                <span className={styles.subjectName}>{subject}</span>
                <div className={styles.subjectStats}>
                  <span>{stats.count} sessions</span>
                  <span>{formatTime(stats.totalTime)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.statSection}>
          <h4>🎯 Difficulty Distribution</h4>
          <div className={styles.difficultyList}>
            {Object.entries(getDifficultyStats()).map(([difficulty, count]) => (
              <div key={difficulty} className={styles.difficultyItem}>
                <span className={styles.difficultyName}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
                <span className={styles.difficultyCount}>{count} sessions</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
