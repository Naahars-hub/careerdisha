'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import LoginModal from './LoginModal';
import styles from './Footer.module.css';

export default function Footer() {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN') {
          setIsModalOpen(false);
          router.push('/start');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  const handleGetStartedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setIsModalOpen(true);
    } else {
      router.push('/start');
    }
  };

  return (
    <>
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLinks}>
          <Link href="/" className={styles.footerLink}>Home</Link>
            <button onClick={handleGetStartedClick} className={styles.footerLink}>Get Started</button>
          <Link href="/dashboard" className={styles.footerLink}>Dashboard</Link>
          <a href="#" className={styles.footerLink}>Privacy Policy</a>
          <a href="#" className={styles.footerLink}>Terms of Service</a>
        </div>
        <p>© 2025 Career Disha. All Rights Reserved.</p>
      </div>
    </footer>
      
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode="signup"
      />
    </>
  );
}