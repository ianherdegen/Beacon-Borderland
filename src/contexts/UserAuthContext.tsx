import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserAuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkUserExists: (email: string) => Promise<{ exists: boolean; error?: string }>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const checkUserExists = async (email: string, retryCount = 0): Promise<{ exists: boolean; error?: string }> => {
    const maxRetries = 2;
    
    try {
      // Use Supabase Edge Function for efficient user existence check
      const { data, error } = await supabase.functions.invoke('check-user-exists', {
        body: { email }
      });

      if (error) {
        console.error('Error checking user existence:', error);
        
        // Retry on network errors or temporary failures
        if (retryCount < maxRetries && (
          error.message?.includes('fetch') || 
          error.message?.includes('network') ||
          error.message?.includes('timeout')
        )) {
          console.log(`Retrying user existence check (attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return checkUserExists(email, retryCount + 1);
        }
        
        // If Edge Function fails completely, use fallback method
        console.log('Edge Function failed, using fallback validation method');
        return await fallbackCheckUserExists(email);
      }

      return { exists: data?.exists || false };
    } catch (error: any) {
      console.error('Unexpected error checking user existence:', error);
      
      // Retry on network errors
      if (retryCount < maxRetries && (
        error.message?.includes('fetch') || 
        error.message?.includes('network') ||
        error.message?.includes('timeout')
      )) {
        console.log(`Retrying user existence check (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return checkUserExists(email, retryCount + 1);
      }
      
      // If all retries fail, use fallback method
      console.log('All retries failed, using fallback validation method');
      return await fallbackCheckUserExists(email);
    }
  };

  // Fallback method using sign-up attempt (less reliable but works when Edge Function fails)
  const fallbackCheckUserExists = async (email: string): Promise<{ exists: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: 'dummy-password-for-validation-only'
      });

      // If we get a "User already registered" error, the user exists
      if (error && (
        error.message.includes('User already registered') ||
        error.message.includes('already registered') ||
        error.message.includes('already exists')
      )) {
        return { exists: true };
      }

      // If we get other errors (like invalid email format), user doesn't exist
      if (error && (
        error.message.includes('Invalid email') ||
        error.message.includes('Password should be at least')
      )) {
        return { exists: false };
      }

      // If no error, user doesn't exist (this shouldn't happen with dummy password)
      return { exists: false };
    } catch (error: any) {
      console.error('Fallback validation also failed:', error);
      return { exists: false, error: 'Unable to validate email' };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    checkUserExists,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}
