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

  useEffect(() => {
    let active = true

    // Dokončí případné přihlášení přes redirect (fallback, když popup
    // není k dispozici). Chybu jen zalogujeme – onAuthStateChanged stejně
    // doručí výsledný stav.
    getRedirectResult(auth).catch((err) => {
      if (active) setError(err as Error)
    })

    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        if (!active) return
        setUser(u)
        setIsLoading(false)
        setIsSigningIn(false)
      },
      (err) => {
        if (!active) return
        setUser(null)
        setIsLoading(false)
        setIsSigningIn(false)
        setError(err as Error)
      },
    )

    return () => {
      active = false
      unsub()
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setIsSigningIn(true)
    setError(null)
    try {
      // Popup funguje spolehlivě i na moderním iOS Safari a na rozdíl od
      // redirectu netrpí problémem s vrácením výsledku (storage partitioning),
      // kvůli kterému aplikace padala zpět na přihlašovací obrazovku.
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = (err as { code?: string }).code

      // Uživatel popup zavřel/zrušil – nejde o chybu.
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setIsSigningIn(false)
        return
      }

      // Popup je zablokovaný nebo nepodporovaný (např. standalone PWA) –
      // zkusíme fallback na redirect.
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
