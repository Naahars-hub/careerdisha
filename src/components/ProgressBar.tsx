'use client';

import { useEffect, useState } from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
}

export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  animated = true,
  color = 'primary',
  size = 'medium'
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated]);

  return (
    <div className={`${styles.container} ${styles[size]}`}>
      {label && (
        <div className={styles.labelContainer}>
          <span className={styles.label}>{label}</span>
          {showPercentage && (
            <span className={styles.percentage}>{Math.round(displayProgress)}%</span>
          )}
        </div>
      )}
      <div className={`${styles.track} ${styles[size]}`}>
        <div 
          className={`${styles.bar} ${styles[color]} ${animated ? styles.animated : ''}`}
          style={{ width: `${displayProgress}%` }}
        >
          <div className={styles.shimmer}></div>
        </div>
      </div>
    </div>
  );
}
