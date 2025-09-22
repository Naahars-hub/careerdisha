'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import styles from './BaseQuestionsForm.module.css';
import { createClient } from '@/lib/supabase/client';

export default function BaseQuestionsForm() {
  const router = useRouter(); // Initialize the router
  const supabase = createClient();
  const [formData, setFormData] = useState({
    educationLevel: '',
    stream: '',
    fieldOfStudy: '',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: '',
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Define all questions in order
  const questions = [
    {
      id: 'educationLevel',
      label: 'What is your current educational level?',
      type: 'select',
      options: [
        { value: '', text: '-- Select --' },
        { value: '10th', text: '10th Grade' },
        { value: '12th', text: '12th Grade' },
        { value: 'college', text: 'In College' }
      ],
      required: true
    },
    {
      id: 'stream',
      label: 'What is your stream?',
      type: 'select',
      options: [
        { value: '', text: '-- Select Stream --' },
        { value: 'Science (PCM/PCB)', text: 'Science (PCM/PCB)' },
        { value: 'Commerce', text: 'Commerce' },
        { value: 'Arts/Humanities', text: 'Arts/Humanities' }
      ],
      required: true,
      showCondition: () => formData.educationLevel === '12th'
    },
    {
      id: 'fieldOfStudy',
      label: 'What is your current field of study? (e.g., B.Tech in CS)',
      type: 'text',
      required: true,
      showCondition: () => formData.educationLevel === 'college'
    },
    {
      id: 'q1',
      label: 'Which subject do you enjoy the most?',
      type: 'text',
      required: true
    },
    {
      id: 'q2',
      label: 'Which subject do you find most challenging?',
      type: 'text',
      required: true
    },
    {
      id: 'q3',
      label: 'What are your hobbies or interests outside of school?',
      type: 'text',
      required: true
    },
    {
      id: 'q4',
      label: 'Do you prefer working in a team or by yourself?',
      type: 'text',
      required: true
    },
    {
      id: 'q5',
      label: 'What kind of work environment do you imagine for yourself? (e.g., office, outdoors, lab)',
      type: 'text',
      required: true
    },
    {
      id: 'q6',
      label: 'Are you more interested in creating things, helping people, or understanding complex systems?',
      type: 'text',
      required: true
    },
    {
      id: 'q7',
      label: 'What\'s a long-term goal you have? (Professional or personal)',
      type: 'text',
      required: true
    }
  ];

  // Filter questions based on conditions
  const visibleQuestions = questions.filter(q => !q.showCondition || q.showCondition());
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Do not redirect on mount to avoid false negatives during session hydration
  // We will enforce auth on submit instead

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const params = new URLSearchParams(formData);
    if (!user) {
      router.push(`/?login=1&next=/mcq?${params.toString()}`);
      return;
    }
    router.push(`/mcq?${params.toString()}`);
  };

  // Calculate progress based on visible questions
  const totalQuestions = visibleQuestions.length;
  const answeredQuestions = visibleQuestions.filter(q => formData[q.id as keyof typeof formData]?.trim() !== '').length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <h1>Let&apos;s get to know you</h1>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className={styles.progressText}>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>

          <div className={styles.questionBlock}>
            <label htmlFor={currentQuestion.id} className={styles.questionLabel}>
              {currentQuestion.label}
            </label>
            {currentQuestion.type === 'select' ? (
              <select 
                id={currentQuestion.id} 
                name={currentQuestion.id} 
                value={formData[currentQuestion.id as keyof typeof formData] || ''} 
                onChange={handleChange} 
                required={currentQuestion.required}
                className={styles.questionInput}
              >
                {currentQuestion.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
            ) : (
              <input 
                type="text" 
                id={currentQuestion.id} 
                name={currentQuestion.id} 
                value={formData[currentQuestion.id as keyof typeof formData] || ''} 
                onChange={handleChange} 
                required={currentQuestion.required}
                className={styles.questionInput}
              />
            )}
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
                Generate MCQs →
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
      </div>
    </main>
  );
}