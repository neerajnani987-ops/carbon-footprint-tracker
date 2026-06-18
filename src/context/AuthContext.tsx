import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = localStorage.getItem('ecotrace_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('ecotrace_user');
      }
    }
    setLoading(false);
  }, []);

  const clearError = () => setError(null);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network latency

    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return false;
    }

    // Check credentials against simulated database in localStorage
    const users = JSON.parse(localStorage.getItem('ecotrace_registered_users') || '[]');
    const matchedUser = users.find((u: any) => u.email === email && u.password === password);

    if (matchedUser) {
      const activeUser = { name: matchedUser.name, email: matchedUser.email };
      setUser(activeUser);
      localStorage.setItem('ecotrace_user', JSON.stringify(activeUser));
      setLoading(false);
      return true;
    } else {
      // Default fallback account for convenience
      if (email === 'eco@citizen.com' && password === 'sustainability') {
        const activeUser = { name: 'Eco Citizen', email };
        setUser(activeUser);
        localStorage.setItem('ecotrace_user', JSON.stringify(activeUser));
        setLoading(false);
        return true;
      }
      setError('Invalid email or password.');
      setLoading(false);
      return false;
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!name || !email || !password) {
      setError('All fields are required.');
      setLoading(false);
      return false;
    }

    const users = JSON.parse(localStorage.getItem('ecotrace_registered_users') || '[]');
    if (users.some((u: any) => u.email === email)) {
      setError('An account with this email already exists.');
      setLoading(false);
      return false;
    }

    // Register user
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('ecotrace_registered_users', JSON.stringify(users));

    // Sign in automatically
    const activeUser = { name, email };
    setUser(activeUser);
    localStorage.setItem('ecotrace_user', JSON.stringify(activeUser));
    setLoading(false);
    return true;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('ecotrace_user');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!email) {
      setError('Email address is required.');
      setLoading(false);
      return false;
    }

    const users = JSON.parse(localStorage.getItem('ecotrace_registered_users') || '[]');
    const userExists = users.some((u: any) => u.email === email) || email === 'eco@citizen.com';

    if (userExists) {
      setLoading(false);
      return true; // Password reset instruction sent
    } else {
      setError('No account found with this email.');
      setLoading(false);
      return false;
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
