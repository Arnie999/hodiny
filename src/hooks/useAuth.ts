import { useState, useEffect, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getRedirectResult,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let active = true
    getRedirectResult(auth)
      .then((result) => {
        if (active && result?.user) setUser(result.user)
      })
      .catch((err) => {
        if (active) setError(err)
      })
      .finally(() => {
        if (active) setInitialized(true)
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        setUser(u)
        if (initialized) setIsLoading(false)
        setIsSigningIn(false)
      },
      (err) => {
        setUser(null)
        setIsLoading(false)
        setIsSigningIn(false)
        setError(err as Error)
      },
    )
    return () => unsub()
  }, [initialized])

  useEffect(() => {
    if (initialized) {
      const t = setTimeout(() => setIsLoading(false), 100)
      return () => clearTimeout(t)
    }
  }, [initialized])

  const signInWithGoogle = useCallback(async () => {
    setIsSigningIn(true)
    setError(null)
    try {
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider)
      } else {
        await signInWithPopup(auth, googleProvider)
      }
    } catch (err) {
      setError(err as Error)
      setIsSigningIn(false)
    }
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setIsSigningIn(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsSigningIn(false)
    }
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setIsSigningIn(true)
    setError(null)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsSigningIn(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth)
    } catch (err) {
      setError(err as Error)
    }
  }, [])

  return {
    user,
    isLoading,
    isSigningIn,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }
}
