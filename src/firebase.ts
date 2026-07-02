import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDPKqjbkTBUa5bPps2mjUf3dkQaPbzVmbo",
  authDomain: "hodiny-f4ddd.firebaseapp.com",
  projectId: "hodiny-f4ddd",
  storageBucket: "hodiny-f4ddd.firebasestorage.app",
  messagingSenderId: "153413698425",
  appId: "1:153413698425:web:6961cb01d1f79e49b365a8",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
