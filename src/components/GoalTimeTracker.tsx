'use client';

import { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import styles from './GoalTimeTracker.module.css';

interface GoalTimeTrackerProps {
  goalId: string;
  goalTitle: string;
  targetHours: number; // Target hours for this goal
  onTimeUpdate?: (goalId: string, elapsedTime: number) => void;
  onGoalComplete?: (goalId: string) => void;
}

export default function GoalTimeTracker({ 
  goalId, 
  goalTitle, 
  targetHours, 
  onTimeUpdate,
  onGoalComplete 
}: GoalTimeTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`goal_${goalId}`);
    if (savedData) {
      const { totalTime, isCompleted } = JSON.parse(savedData);
      setTotalTimeSpent(totalTime || 0);
    }
  }, [goalId]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        
        const currentTotal = totalTimeSpent + elapsed;
        onTimeUpdate?.(goalId, currentTotal);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, startTime, totalTimeSpent, goalId, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentProgress = () => {
    const totalTime = totalTimeSpent + elapsedTime;
    const targetSeconds = targetHours * 3600;
    return Math.min((totalTime / targetSeconds) * 100, 100);
  };

  const handleStart = () => {
    if (!isActive) {
      setStartTime(new Date());
      setIsActive(true);
      setIsPaused(false);
    } else if (isPaused) {
      setStartTime(new Date());
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (isActive && !isPaused) {
      setTotalTimeSpent(prev => prev + elapsedTime);
      setElapsedTime(0);
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    const newTotalTime = totalTimeSpent + elapsedTime;
    setTotalTimeSpent(newTotalTime);
    setElapsedTime(0);
    setIsActive(false);
    setIsPaused(false);
    setStartTime(null);

    // Save progress to localStorage
    const progressData = {
      totalTime: newTotalTime,
      isCompleted: newTotalTime >= targetHours * 3600,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`goal_${goalId}`, JSON.stringify(progressData));

    onTimeUpdate?.(goalId, newTotalTime);

    // Check if goal is completed
    if (newTotalTime >= targetHours * 3600) {
      onGoalComplete?.(goalId);
    }
  };

  const handleReset = () => {
    setElapsedTime(0);
    setTotalTimeSpent(0);
    setIsActive(false);
    setIsPaused(false);
    setStartTime(null);
    localStorage.removeItem(`goal_${goalId}`);
    onTimeUpdate?.(goalId, 0);
  };

  const progress = getCurrentProgress();
  const isCompleted = progress >= 100;
  const totalTime = totalTimeSpent + elapsedTime;

  return (
    <div className={`${styles.container} ${isCompleted ? styles.completed : ''}`}>
      <div className={styles.header}>
        <h4 className={styles.goalTitle}>{goalTitle}</h4>
        <div className={styles.status}>
          {isCompleted ? (
            <span className={styles.completedBadge}>✓ Completed</span>
          ) : (
            <span className={styles.progressBadge}>
              {Math.round(progress)}% Complete
            </span>
          )}
        </div>
      </div>

      <div className={styles.progressSection}>
        <ProgressBar
          progress={progress}
          label="Goal Progress"
          showPercentage={false}
          animated={true}
          color={isCompleted ? 'success' : 'primary'}
          size="medium"
        />
        <div className={styles.progressText}>
          <span className={styles.timeSpent}>
            {formatTime(totalTime)} / {targetHours}h
          </span>
          <span className={styles.percentage}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <div className={styles.timerSection}>
        <div className={styles.timerDisplay}>
          <div className={styles.currentSession}>
            {isActive && !isPaused && (
              <div className={styles.liveTimer}>
                <span className={styles.timerLabel}>Current Session:</span>
                <span className={styles.timerValue}>{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.controls}>
          {!isActive ? (
            <button 
              className={styles.startButton}
              onClick={handleStart}
              disabled={isCompleted}
            >
              ▶️ Start Goal
            </button>
          ) : (
            <>
              <button 
                className={styles.pauseButton}
                onClick={isPaused ? handleStart : handlePause}
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button 
                className={styles.stopButton}
                onClick={handleStop}
              >
                🏁 Stop & Save
              </button>
            </>
          )}
          
          <button 
            className={styles.resetButton}
            onClick={handleReset}
            disabled={isActive}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Target:</span>
          <span className={styles.statValue}>{targetHours}h</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Completed:</span>
          <span className={styles.statValue}>{formatTime(totalTimeSpent)}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Remaining:</span>
          <span className={styles.statValue}>
            {formatTime(Math.max(0, targetHours * 3600 - totalTime))}
          </span>
        </div>
      </div>
    </div>
  );
}
