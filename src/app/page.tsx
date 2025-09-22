'use client';

// import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import LoginModal from '@/components/LoginModal';
import styles from './page.module.css';

export default function Home() {
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [userEmail] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'signin' | 'signup'>('signup')
  
  const supabase = createClient()
  const router = useRouter()


  // Check authentication state
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN') {
          setIsModalOpen(false); // Close modal on successful sign-in
          // Redirect to start page after successful login
          router.push('/start');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  // Check for email confirmation on page load
  useEffect(() => {
    const checkEmailConfirmation = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const type = urlParams.get('type')
      const token = urlParams.get('token')
      
      if (type === 'signup' && token) {
        // User clicked email confirmation link
        setShowEmailConfirmation(true)
        // Auto-refresh the page to trigger login
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    }

    checkEmailConfirmation()
  }, [])

  // Handle Get Started button click
  const handleGetStartedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setModalMode('signup');
      setIsModalOpen(true);
    } else {
      router.push('/start');
    }
  };

  // Handle Sign In button click
  const handleSignInClick = () => {
    setModalMode('signin');
    setIsModalOpen(true);
  };

  // Handle successful login - redirect to start page
  // const handleLoginSuccess = () => {
  //   setIsModalOpen(false);
  //   router.push('/start');
  // };

  return (
    <>
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Find Your Path with <span className={styles.appName}>Career Disha</span>
          </h1>
          <p className={styles.subtitle}>
            Your personalized, AI-powered career guidance platform for a successful future.
          </p>
          <div className={styles.heroButtons}>
            <button onClick={handleGetStartedClick} className={styles.ctaButton}>
              <span className={styles.buttonText}>Get Started for Free</span>
            </button>
            <button onClick={handleSignInClick} className={styles.signInButton}>
              <span className={styles.buttonText}>Sign In</span>
            </button>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Our Features</h2>
        <div className={styles.featureGrid}>
          {/* --- EXISTING FEATURES --- */}
          <div className={styles.featureCard}>
            <h3>🤖 AI-Powered Guidance</h3>
            <p>Get a deep analysis of your interests and skills using advanced AI to find the perfect career for you.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>🗺️ Personalized Roadmap</h3>
            <p>Receive a detailed career map, including stream suggestions, top colleges, and relevant job opportunities.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>💬 Interactive Chatbot</h3>
            <p>Have a personal career guide at your fingertips. Ask questions and get instant, helpful advice anytime.</p>
          </div>

          {/* --- NEW FEATURES --- */}
          <div className={styles.featureCard}>
            <h3>🎓 Top College & Job Data</h3>
            <p>Discover the best colleges for your chosen path and get insights into job roles, average salaries, and market trends.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>📄 Instant PDF Reports</h3>
            <p>No login required. Generate and download a complete, shareable PDF of your career map to review anytime.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>📚 On-Demand Resources</h3>
            <p>Click on any career in your map to instantly get AI-curated resources like YouTube guides, articles, and exam details.</p>
          </div>
        </div>
      </section>

      <section className={styles.howItWorks}>
        {/* This section remains the same */}
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <h4>Answer Base Questions</h4>
            <p>Tell us about your current studies and core interests.</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <h4>Take the AI Quiz</h4>
            <p>Answer AI-generated MCQs to refine your profile.</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <h4>Receive Your Career Map</h4>
            <p>Get your detailed, personalized roadmap instantly.</p>
          </div>
        </div>
      </section>
    </main>

      {/* Email Confirmation Modal */}
      {showEmailConfirmation && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalLogo}>
                <div className={styles.modalLogoIcon}>📧</div>
                <h2>Confirm Your Email</h2>
              </div>
              <p className={styles.modalSubtitle}>
                We&apos;ve sent a confirmation link to <strong>{userEmail}</strong>
              </p>
              <p>Please check your email and click the link to activate your account.</p>
              <p>You&apos;ll be automatically logged in after confirmation.</p>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode={modalMode}
      />
    </>
  );
}