'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import styles from './CustomLoginForm.module.css'

interface CreativeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreativeLoginModal({ isOpen, onClose }: CreativeLoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [showSuccess, setShowSuccess] = useState(false)

  const supabase = createClient()

  // Get user's location on component mount
  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setEmail('')
      setPassword('')
      setErrors({ email: '', password: '' })
      setShowSuccess(false)
    }
  }, [isOpen])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Your creative email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }
        
  const validatePassword = (password: string) => {
    if (!password) return 'Your creative password is required'
    if (password.length < 6) return 'Password needs at least 6 characters to unlock creativity'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    setErrors({ email: emailError, password: passwordError })
    
    if (emailError || passwordError) {
      return
    }

    setIsLoading(true)
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (error) {
        setErrors({ email: '', password: 'Creative login failed. Try again with more inspiration!' })
        return
      }

        if (data.user) {
        setShowSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      setErrors({ email: '', password: 'Something went wrong. Please try again!' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error(`${provider} OAuth error:`, error)
        setErrors({ email: '', password: `${provider} authentication failed. Please try again.` })
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      setErrors({ email: '', password: 'Social authentication error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.neumorphCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.neumorphClose} onClick={onClose}>×</button>
        
        <div className={styles.neumorphHeader}>
          <h2>Career Disha</h2>
          <p className={styles.muted}>Enter your creative space</p>
        </div>

        {!showSuccess ? (
          <>
            <form className={styles.neumorphForm} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <div className={styles.icon}>📧</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
              required
                  autoComplete="email"
                />
                <label>Email Address</label>
              </div>
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}

              <div className={styles.field}>
                <div className={styles.icon}>🔒</div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  required 
                  autoComplete="current-password"
                />
                <label>Password</label>
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '16px'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}

              <button
                type="submit"
                className={`${styles.neumorphBtn} ${isLoading ? styles.loading : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Entering...' : 'Enter Creative Space'}
              </button>
            </form>

            <div className={styles.or}>or explore with</div>

            <div className={styles.socialButtons}>
            <button
              type="button"
                className={styles.socialBtn}
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
              >
                🔍 Google
              </button>
              <button 
                type="button" 
                className={styles.socialBtn}
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
              >
                🐙 GitHub
            </button>
          </div>

            <div className={styles.rowBetween}>
              <span className={styles.small}>New to creativity?</span>
              <a href="#" onClick={(e) => { e.preventDefault(); /* Handle signup */ }} className={styles.small}>Start your journey</a>
            </div>
          </>
        ) : (
          <div className={styles.successMessage}>
            <h3>Welcome, Creator!</h3>
            <p>Entering your creative dimension...</p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
