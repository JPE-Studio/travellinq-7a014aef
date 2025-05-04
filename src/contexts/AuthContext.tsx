
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as AppUser } from '@/types';
import { UserRole } from '@/types/roles';
import { getUserRoles } from '@/services/roleService';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  profile: AppUser | null;
  roles: UserRole[];
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshRoles: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [roles, setRoles] = useState<UserRole[]>(['user']); // Default role
  const [loading, setLoading] = useState(true);

  // Function to fetch user roles
  const fetchUserRoles = async (userId: string) => {
    try {
      const userRoles = await getUserRoles(userId);
      setRoles(userRoles.length > 0 ? userRoles : ['user']);
    } catch (err) {
      console.error("Error fetching user roles:", err);
      setRoles(['user']); // Default to user role on error
    }
  };

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProfile({
          id: data.id,
          pseudonym: data.pseudonym,
          avatar: data.avatar,
          bio: data.bio,
          location: data.location,
          preferredLanguage: data.preferred_language,
          autoTranslate: data.auto_translate || false,
          locationSharing: data.location_sharing !== false,
          joinedAt: new Date(data.joined_at)
        });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  // Refresh user profile data
  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  // Refresh user roles
  const refreshRoles = async () => {
    if (user?.id) {
      await fetchUserRoles(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch user profile when signed in
        if (currentSession?.user) {
          fetchUserProfile(currentSession.user.id);
          fetchUserRoles(currentSession.user.id);
        } else {
          setProfile(null);
          setRoles(['user']);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Fetch user profile if we have a session
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
        fetchUserRoles(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Simplified signUp function - we don't set username or upload avatar here
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) throw error;
      
      // We don't need to create a profile here as it will be created by a database trigger
      // The onboarding flow will prompt the user to complete their profile
    } catch (error: any) {
      console.error("Sign up failed:", error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Sign in failed:", error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Sign out failed:", error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile, 
      roles,
      loading, 
      signUp, 
      signIn, 
      signOut, 
      refreshProfile,
      refreshRoles
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
