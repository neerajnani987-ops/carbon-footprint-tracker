import React, { createContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import {
  auth,
  isFirebaseConfigured,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  googleProvider,
  signInWithPopup
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const activeUser = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || ''
          };
          setUser(activeUser);
          localStorage.setItem('ecotrace_user', JSON.stringify(activeUser));
        } else {
          setUser(null);
          localStorage.removeItem('ecotrace_user');
        }
        setLoading(false);
      });
    } else {
      // LocalStorage session management
      const savedUser = localStorage.getItem('ecotrace_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('ecotrace_user');
        }
      }
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const clearError = () => setError(null);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return false;
    }

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const activeUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || ''
        };
        setUser(activeUser);
        localStorage.setItem('ecotrace_user', JSON.stringify(activeUser));
        setLoading(false);
        return true;
      } catch (err: any) {
        let msg = 'Invalid email or password.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          msg = 'Invalid email or password.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'The email address is badly formatted.';
        }
        setError(msg);
        setLoading(false);
        return false;
      }
    } else {
      // Simulated authentication check
      await new Promise((resolve) => setTimeout(resolve, 600));
      const users = JSON.parse(localStorage.getItem('ecotrace_registered_users') || '[]');
      const matchedUser = users.find((u: any) => u.email === email && u.password === password);

      if (matchedUser) {
        const activeUser = { uid: matchedUser.email, name: matchedUser.name, email: matchedUser.email };
        setUser(activeUser);
        localStorage.setItem('ecotrace_user', JSON.stringify(activeUser));
        setLoading(false);
        return true;
      } else {
        if (email === 'eco@citizen.com' && password === 'sustainability') {
          const activeUser = { uid: 'demo-user-id', name: 'Eco Citizen', email };
          setUser(activeUser);
          localStorage.setItem('ecotrace_user', JSON.stringify(activeUser));
          setLoading(false);
          return true;
        }
        setError('Invalid email or password.');
        setLoading(false);
        return false;
      }
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (!name || !email || !password) {
      setError('All fields are required.');
      setLoading(false);
      return false;
    }

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const activeUser = {
          uid: fbUser.uid,
          name,
          email
        };
        setUser(activeUser);
        localStorage.setItem('ecotrace_user', JSON.stringify(activeUser));
        setLoading(false);
        return true;
      } catch (err: any) {
        let msg = 'Registration failed. Please try again.';
        if (err.code === 'auth/email-already-in-use') {
          msg = 'An account with this email already exists.';
        } else if (err.code === 'auth/weak-password') {
          msg = 'The password must be at least 6 characters long.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'The email address is badly formatted.';
        }
        setError(msg);
        setLoading(false);
        return false;
      }
    } else {
      // Simulated sign up
      await new Promise((resolve) => setTimeout(resolve, 600));
      const users = JSON.parse(localStorage.getItem('ecotrace_registered_users') || '[]');
      if (users.some((u: any) => u.email === email)) {
        setError('An account with this email already exists.');
        setLoading(false);
        return false;
      }

      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem('ecotrace_registered_users', JSON.stringify(users));

      const activeUser = { uid: email, name, email };
      setUser(activeUser);
      localStorage.setItem('ecotrace_user', JSON.stringify(activeUser));
      setLoading(false);
      return true;
    }
  };

  const signOut = () => {
    if (isFirebaseConfigured && auth) {
      firebaseSignOut(auth);
    }
    setUser(null);
    localStorage.removeItem('ecotrace_user');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (!email) {
      setError('Email address is required.');
      setLoading(false);
      return false;
    }

    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        setLoading(false);
        return true;
      } catch (err: any) {
        let msg = 'Failed to send password reset email.';
        if (err.code === 'auth/user-not-found') {
          msg = 'No account found with this email.';
        }
        setError(msg);
        setLoading(false);
        return false;
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const users = JSON.parse(localStorage.getItem('ecotrace_registered_users') || '[]');
      const userExists = users.some((u: any) => u.email === email) || email === 'eco@citizen.com';

      if (userExists) {
        setLoading(false);
        return true;
      } else {
        setError('No account found with this email.');
        setLoading(false);
        return false;
      }
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const activeUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || ''
        };
        setUser(activeUser);
        localStorage.setItem('ecotrace_user', JSON.stringify(activeUser));
        setLoading(false);
        return true;
      } catch (err: any) {
        setError('Google sign-in was cancelled or failed.');
        setLoading(false);
        return false;
      }
    } else {
      // Mock Google sign-in
      await new Promise((resolve) => setTimeout(resolve, 800));
      const activeUser = { uid: 'google-mock-uid', name: 'Google Eco Citizen', email: 'google-eco@citizen.com' };
      setUser(activeUser);
      localStorage.setItem('ecotrace_user', JSON.stringify(activeUser));
      setLoading(false);
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        clearError,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
