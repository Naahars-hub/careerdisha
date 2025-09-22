'use client';

import { useState, useEffect } from 'react';
import styles from './StudySession.module.css';

interface StudySessionProps {
  session: {
    id: string;
    subject: string;
    topic: string;
    duration: number;
    startTime: Date;
    endTime?: Date;
    notes?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    completed: boolean;
  };
  onEnd: (notes?: string) => void;
}

export default function StudySession({ session, onEnd }: StudySessionProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notes, setNotes] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.startTime, isPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#48BB78';
      case 'medium': return '#ED8936';
      case 'hard': return '#F56565';
      default: return '#4A90E2';
    }
  };

  const handleEndSession = () => {
    onEnd(notes.trim() || undefined);
  };

  return (
    <div className={styles.sessionContainer}>
      <div className={styles.sessionHeader}>
        <div className={styles.sessionInfo}>
          <h3>{session.subject} - {session.topic}</h3>
          <div className={styles.difficulty}>
            <span 
              className={styles.difficultyBadge}
              style={{ backgroundColor: getDifficultyColor(session.difficulty) }}
            >
              {session.difficulty.toUpperCase()}
            </span>
          </div>
        </div>
        <div className={styles.timer}>
          <div className={styles.timerDisplay}>
            {formatTime(elapsedTime)}
          </div>
          <div className={styles.timerLabel}>Elapsed Time</div>
        </div>
      </div>

      <div className={styles.sessionControls}>
        <button 
          className={`${styles.controlButton} ${isPaused ? styles.resumeButton : styles.pauseButton}`}
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>
        
        <button 
          className={styles.endButton}
          onClick={handleEndSession}
        >
          🏁 End Session
        </button>
      </div>

      <div className={styles.notesSection}>
        <label htmlFor="session-notes" className={styles.notesLabel}>
          Session Notes (Optional)
        </label>
        <textarea
          id="session-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about what you studied, key concepts, or any insights..."
          className={styles.notesTextarea}
          rows={3}
        />
      </div>

      <div className={styles.sessionStats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Started:</span>
          <span className={styles.statValue}>
            {session.startTime.toLocaleTimeString()}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Status:</span>
          <span className={styles.statValue}>
            {isPaused ? 'Paused' : 'Active'}
          </span>
        </div>
      </div>
    </div>
  );
}
