'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Import useRouter
import { createClient } from '@/lib/supabase/client';
import styles from './mcq.module.css';

type Question = {
  question: string;
  options: string[];
};

function McqContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize router
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Follow-up questions removed

  // Require login on this page; if not, redirect with next= current URL
  useEffect(() => {
    const guard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const current = window.location.pathname + window.location.search;
        router.push(`/?login=1&next=${encodeURIComponent(current)}`);
        return;
      }
    };
    guard();
  }, [supabase, router]);

  useEffect(() => {
    // This useEffect is for fetching questions, it remains the same
    const formData: { [key: string]: string } = {};
    searchParams.forEach((value, key) => { formData[key] = value; });

    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/generateMcqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to fetch questions.');
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setQuestions(data.questions);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [searchParams]);
  
  const handleOptionChange = (questionIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Follow-up questions generation removed

  // Submit function - proceed directly to career map
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const baseData: { [key: string]: string } = {};
    searchParams.forEach((value, key) => {
      baseData[key] = value;
    });

    // Combine base data with MCQ answers only
    const finalPayload = {
      baseData: baseData,
      mcqAnswers: answers,
    };

    // Save the data to sessionStorage
    sessionStorage.setItem('careerData', JSON.stringify(finalPayload));

    // Navigate to the career map page
    router.push('/career-map');
  };

  if (loading) return <p>Generating your personalized questions... 🧠</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;

  // Follow-up prompt removed

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  
  // Use answers directly
  const currentAnswers = answers;

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <p className={styles.progressText}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      <h1>Answer Your Questions</h1>
      
      <div className={styles.questionBlock}>
        <p className={styles.questionText}>{currentQuestion.question}</p>
        <div className={styles.optionsContainer}>
          {currentQuestion.options.map((option, optionIndex) => (
            <label key={optionIndex} className={styles.optionLabel}>
              <input
                type="radio" 
                name={`question-${currentQuestionIndex}`} 
                value={option}
                onChange={() => handleOptionChange(currentQuestionIndex, option)}
                checked={currentAnswers[currentQuestionIndex] === option} 
                required
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.navigationButtons}>
        <button 
          type="button" 
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          className={`${styles.navButton} ${styles.previousButton}`}
        >
          ← Previous
        </button>
        
        {isLastQuestion ? (
          <button type="submit" className={`${styles.navButton} ${styles.submitButton}`}>
            Generate Career Map →
          </button>
        ) : (
          <button 
            type="button" 
            onClick={handleNext}
            className={`${styles.navButton} ${styles.nextButton}`}
          >
            Next →
          </button>
        )}
      </div>
    </form>
  );
}

export default function McqPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Suspense fallback={<div>Loading...</div>}>
          <McqContent />
        </Suspense>
      </div>
    </main>
  );
}