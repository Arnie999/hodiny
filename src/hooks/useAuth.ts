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
      // Popup funguje spolehlivě i na iOS Safari, kde redirect kvůli ITP
      // ztrácí session a vrací uživatele zpět na login.
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = (err as { code?: string }).code

      // Uživatel zavřel/zrušil okno – žádná chyba, jen ukončíme.
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setIsSigningIn(false)
        return
      }

      // Popup zablokován nebo nepodporován → zkusíme redirect jako záložní.
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        try {
          await signInWithRedirect(auth, googleProvider)
          return
        } catch (redirectErr) {
          setError(redirectErr as Error)
        }
      } else {
        setError(err as Error)
      }
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
