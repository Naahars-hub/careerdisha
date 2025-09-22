'use client'

import Link from 'next/link';
import styles from './Header.module.css';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import LoginModal from './LoginModal'; // 1. Import the new modal component
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 2. Add state for the modal
  const router = useRouter();
  const supabase = createClient();
  // Note: we avoid unused search params/pathname to satisfy lint rules

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
          setIsModalOpen(false); // Close modal on successful sign-in
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Auto-open login modal if query param login=1 is present (from guarded routes)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === '1') {
      setIsModalOpen(true);
      // Clean the URL to remove the query param without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('login');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // After successful sign-in, redirect to ?next if present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { searchParams } = new URL(window.location.href);
    const next = searchParams.get('next');
    if (user && next) {
      // remove next from URL first to avoid re-triggering
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('next');
      window.history.replaceState({}, '', cleanUrl.toString());
      // then navigate
      router.push(next);
      setIsModalOpen(false);
    }
  }, [user, router]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            Career Disha 🚀
          </Link>
          <nav className={styles.nav}>
            <ThemeToggle />
            {user ? (
              <>
                <span className={styles.userEmail}>{user.email}</span>
                <Link href="/dashboard" className={styles.navButton}>
                  Dashboard
                </Link>
                <Link href="/study-tracker" className={styles.navButton}>
                  Study Tracker
                </Link>
                <button onClick={handleLogout} className={styles.navButton}>
                  Logout
                </button>
              </>
            ) : (
              // 3. Change Link to a button that opens the modal
              <button onClick={() => setIsModalOpen(true)} className={styles.navButton}>
                Login
              </button>
            )}
          </nav>
        </div>
      </header>
      {/* 4. Render the modal component */}
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}