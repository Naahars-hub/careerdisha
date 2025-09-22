'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LocationCollector from './LocationCollector'
import { LocationData } from '@/lib/locationService'
import styles from './LoginModal.module.css'

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup';
}

export default function LoginModal({ isOpen, onClose, mode = 'signup' }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '', general: '' })
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSignUp, setIsSignUp] = useState(mode === 'signup') // Start with the specified mode
  const [isHovered, setIsHovered] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [showLocationCollection, setShowLocationCollection] = useState(false)
  const [, setUserLocation] = useState<LocationData | null>(null)
  
  const supabase = createClient()
  const router = useRouter()
  // const { theme } = useTheme()

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setEmail('')
      setPassword('')
      setErrors({ email: '', password: '', general: '' })
      setShowSuccess(false)
      setIsSignUp(mode === 'signup') // Start with the specified mode
      setShowForgotPassword(false)
      setForgotPasswordEmail('')
      setForgotPasswordSent(false)
      setShowEmailConfirmation(false)
      setUserEmail('')
      setShowLocationCollection(false)
      setUserLocation(null)
    }
  }, [isOpen, mode])

  // Listen for auth state changes to handle automatic login
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setShowSuccess(true)
        setTimeout(() => {
          onClose()
          router.push('/dashboard')
        }, 1500)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, onClose, router])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required'
    if (password.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    setErrors({ email: emailError, password: passwordError, general: '' })
    
    if (emailError || passwordError) {
      return
    }

    setIsLoading(true)
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          setErrors({ email: '', password: '', general: error.message })
          return
        }

        if (data.user) {
          setUserEmail(email)
          // For new signups, always collect location first
          console.log('New user signup, showing location collection')
          setShowLocationCollection(true)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setErrors({ email: '', password: '', general: 'Invalid email or password' })
          return
        }

        if (data.user) {
          // For now, let's always show location collection for testing
          // TODO: Add proper database check once Supabase is configured
          console.log('User signed in, showing location collection for testing')
          setShowLocationCollection(true)
        }
      }
    } catch {
      setErrors({ email: '', password: '', general: 'Something went wrong. Please try again!' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailError = validateEmail(forgotPasswordEmail)
    if (emailError) {
      setErrors({ email: emailError, password: '', general: '' })
      return
    }

    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
      })

      if (error) {
        setErrors({ email: '', password: '', general: error.message })
        return
      }

      setForgotPasswordSent(true)
    } catch {
      setErrors({ email: '', password: '', general: 'Something went wrong. Please try again!' })
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
        setErrors({ email: '', password: '', general: `${provider} authentication failed. Please try again.` })
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      setErrors({ email: '', password: '', general: `${provider} authentication error. Please try again.` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationCollected = async (location: LocationData) => {
    setUserLocation(location)
    
    // Save location to user profile
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            location_country: location.country,
            location_state: location.state,
            location_city: location.city,
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: location.timezone
          })
        
        if (error) {
          console.error('Error saving location:', error)
        }
      }
    } catch (error) {
      console.error('Error saving location:', error)
    }
    
    // Handle different flows after location is collected
    setShowLocationCollection(false)
    
    if (isSignUp) {
      // For signup, show email confirmation
      setShowEmailConfirmation(true)
    } else {
      // For signin, proceed to dashboard
      setShowSuccess(true)
      setTimeout(() => {
        onClose()
        router.push('/dashboard')
      }, 1500)
    }
  }

  const handleLocationError = (error: Error) => {
    console.error('Location collection error:', error)
    // Continue with the flow even if location collection fails
    setShowLocationCollection(false)
    
    if (isSignUp) {
      setShowEmailConfirmation(true)
    } else {
      setShowSuccess(true)
      setTimeout(() => {
        onClose()
        router.push('/dashboard')
      }, 1500)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className={`${styles.overlay} ${isHovered ? styles.hovered : ''}`}
      onClick={handleOverlayClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🚀</div>
            <h2>Career Disha</h2>
          </div>
          <p className={styles.subtitle}>
            {isSignUp ? 'Start your career journey' : 'Welcome back to your career journey'}
          </p>
        </div>

        {!showSuccess ? (
          <>
            {showLocationCollection ? (
              <div className={styles.locationCollectionContainer}>
                <LocationCollector
                  onLocationCollected={handleLocationCollected}
                  onError={handleLocationError}
                />
              </div>
            ) : showEmailConfirmation ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>📧</div>
                <h3>Confirm Your Email</h3>
                <p>We&apos;ve sent a confirmation link to <strong>{userEmail}</strong></p>
                <p>Please check your email and click the link to activate your account.</p>
                <p>You&apos;ll be automatically logged in after confirmation.</p>
                <button 
                  type="button"
                  className={styles.backButton}
                  onClick={() => {
                    setShowEmailConfirmation(false)
                    setUserEmail('')
                  }}
                >
                  ← Back to {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            ) : !showForgotPassword ? (
              <>
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.inputGroup}>
                    <div className={styles.inputWrapper}>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=" "
                        required 
                        autoComplete="email"
                        className={styles.input}
                      />
                      <label className={styles.label}>Email Address</label>
                      <div className={styles.inputIcon}>📧</div>
                    </div>
                    {errors.email && (
                      <span className={styles.errorMessage}>{errors.email}</span>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.inputWrapper}>
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=" "
                        required 
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                        className={styles.input}
                      />
                      <label className={styles.label}>Password</label>
                      <div className={styles.inputIcon}>🔒</div>
                      <button 
                        type="button" 
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    {errors.password && (
                      <span className={styles.errorMessage}>{errors.password}</span>
                    )}
                  </div>

                  {!isSignUp && (
                    <div className={styles.forgotPassword}>
                      <button 
                        type="button"
                        className={styles.forgotPasswordButton}
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  {errors.general && (
                    <div className={styles.generalError}>
                      <span className={styles.errorMessage}>{errors.general}</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className={styles.spinner}></div>
                        {isSignUp ? 'Creating Account...' : 'Signing In...'}
                      </>
                    ) : (
                      isSignUp ? 'Create Account' : 'Sign In'
                    )}
                  </button>
                </form>

                <div className={styles.divider}>
                  <span>or continue with</span>
                </div>

                <div className={styles.socialButtons}>
                  <button 
                    type="button" 
                    className={styles.socialButton}
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                  >
                    <svg className={styles.socialIcon} viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button 
                    type="button" 
                    className={styles.socialButton}
                    onClick={() => handleSocialLogin('github')}
                    disabled={isLoading}
                  >
                    <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </button>
                </div>

                <div className={styles.switchMode}>
                  <span>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </span>
                  <button 
                    type="button"
                    className={styles.switchButton}
                    onClick={() => {
                      setIsSignUp(!isSignUp)
                      setErrors({ email: '', password: '', general: '' })
                    }}
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.forgotPasswordForm}>
                {!forgotPasswordSent ? (
                  <>
                    <h3>Reset Password</h3>
                    <p>Enter your email address and we&apos;ll send you a link to reset your password.</p>
                    <form onSubmit={handleForgotPassword}>
                      <div className={styles.inputGroup}>
                        <div className={styles.inputWrapper}>
                          <input 
                            type="email" 
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            placeholder=" "
                            required 
                            autoComplete="email"
                            className={styles.input}
                          />
                          <label className={styles.label}>Email Address</label>
                          <div className={styles.inputIcon}>📧</div>
                        </div>
                        {errors.email && (
                          <span className={styles.errorMessage}>{errors.email}</span>
                        )}
                      </div>

                      {errors.general && (
                        <div className={styles.generalError}>
                          <span className={styles.errorMessage}>{errors.general}</span>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className={styles.spinner}></div>
                            Sending...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                    </form>
                    <button 
                      type="button"
                      className={styles.backButton}
                      onClick={() => setShowForgotPassword(false)}
                    >
                      ← Back to {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                  </>
                ) : (
                  <div className={styles.successMessage}>
                    <div className={styles.successIcon}>📧</div>
                    <h3>Check Your Email</h3>
                    <p>We&apos;ve sent a password reset link to <strong>{forgotPasswordEmail}</strong></p>
                    <p>Please check your email and click the link to reset your password.</p>
                    <button 
                      type="button"
                      className={styles.backButton}
                      onClick={() => {
                        setShowForgotPassword(false)
                        setForgotPasswordSent(false)
                        setForgotPasswordEmail('')
                      }}
                    >
                      ← Back to {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✅</div>
            <h3>Welcome{isSignUp ? ' to Career Disha' : ' back'}!</h3>
            <p>{isSignUp ? 'Your account has been created successfully.' : 'You have been signed in successfully.'}</p>
            <p>Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  )
}