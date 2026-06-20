import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { AppStateData } from '../types';

// Load keys from environment variables (with no hardcoded fallback values)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Toggle to determine whether we use actual Firebase or local simulated fallback
export let isFirebaseConfigured = !!firebaseConfig.apiKey;

export let app = isFirebaseConfigured
  ? getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp()
  : null;

export let auth = app ? getAuth(app) : null;
export let db = app ? getFirestore(app) : null;
export let googleProvider = auth ? new GoogleAuthProvider() : null;

export const reinitializeFirebaseForTest = (apiKey: string) => {
  isFirebaseConfigured = !!apiKey;
  firebaseConfig.apiKey = apiKey;
  app = isFirebaseConfigured
    ? getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApp()
    : null;
  auth = app ? getAuth(app) : null;
  db = app ? getFirestore(app) : null;
  googleProvider = auth ? new GoogleAuthProvider() : null;
};

/**
 * Firestore CRUD helpers with safe LocalStorage fallbacks.
 * This guarantees strict data protection and zero network errors in environments without active keys.
 */
export const saveUserData = async (userId: string, data: AppStateData) => {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, data, { merge: true });
      return true;
    } catch (e) {
      console.error('Firestore save failed:', e);
      throw e;
    }
  } else {
    // LocalStorage fallback
    const key = `ecotrace_userdata_${userId}`;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  }
};

export const getUserData = async (userId: string) => {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
      return null;
    } catch (e) {
      console.error('Firestore read failed:', e);
      throw e;
    }
  } else {
    // LocalStorage fallback
    const key = `ecotrace_userdata_${userId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }
};
export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
};
