'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Create the authentication context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: authListener } = auth.onAuthStateChange((user) => {
      setUser(user);
    });

    // Clean up listener on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      await auth.signUp({ email, password });
      toast.success('Check your email for the confirmation link');
      return true;
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Failed to sign up');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      await auth.signIn({ email, password });
      toast.success('Signed in successfully');
      router.push('/');
      return true;
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Failed to sign in');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await auth.signOut();
      toast.success('Signed out successfully');
      router.push('/auth/signin');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error(error.message || 'Failed to sign out');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
