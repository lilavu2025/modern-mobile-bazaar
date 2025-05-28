
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email?: string;
  user_type: 'admin' | 'wholesale' | 'retail';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch profile by userId, return the profile or null
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const newProfile = await createProfile(userId);
          return newProfile;
        }
        console.error('Error fetching profile:', error);
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Create profile for new user and return it
  const createProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const profileData = {
        id: userId,
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || null,
        user_type: 'retail' as const,
        email: user.email || ''
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  // Redirect user based on user_type - only for specific events
  const handleUserRedirection = (profile: Profile, event: string) => {
    // Only redirect on successful login, not on token refresh or other events
    if (event !== 'SIGNED_IN') return;
    
    // Don't redirect if already on auth page or email confirmation
    if (location.pathname === '/auth' || location.pathname === '/email-confirmation') {
      if (profile.user_type === 'admin') {
        navigate('/admin');
      } else if (profile.user_type === 'wholesale') {
        navigate('/wholesale');
      } else {
        navigate('/');
      }
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, 'session:', !!session);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const fetchedProfile = await fetchProfile(session.user.id);
          
          // Only redirect on sign in event
          if (event === 'SIGNED_IN' && fetchedProfile) {
            handleUserRedirection(fetchedProfile, event);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // Remove navigate and location from dependencies

  // SignIn function
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    localStorage.setItem('lastLoginTime', Date.now().toString());
  };

  // SignUp function with comprehensive email existence check
  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    // Check if user already exists by attempting to sign up
    // Supabase will return an error if the email is already registered
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || '',
        },
      },
    });

    if (error) {
      console.error('Supabase signup error:', error);
      
      // Handle specific Supabase error messages
      if (error.message.includes('duplicate') || 
          error.message.includes('already registered') || 
          error.message.includes('User already registered') ||
          error.message.includes('email address is already confirmed')) {
        throw new Error('هذا البريد الإلكتروني مسجل مسبقاً. الرجاء تسجيل الدخول أو استخدام بريد إلكتروني آخر.');
      }
      
      // Handle rate limiting
      if (error.message.includes('Email rate limit exceeded')) {
        throw new Error('تم إرسال عدد كبير من رسائل التأكيد. الرجاء المحاولة مرة أخرى بعد قليل.');
      }
      
      // Handle weak password
      if (error.message.includes('Password should be at least')) {
        throw new Error('كلمة المرور ضعيفة جداً. يجب أن تحتوي على 6 أحرف على الأقل.');
      }
      
      throw error;
    }

    // Check if this is a repeated signup attempt (user exists but email not confirmed)
    if (data.user && !data.user.email_confirmed_at && data.user.identities && data.user.identities.length === 0) {
      throw new Error('هذا البريد الإلكتروني مسجل مسبقاً. الرجاء تسجيل الدخول أو استخدام بريد إلكتروني آخر.');
    }

    // Additional check: verify user was actually created
    if (data.user && !data.user.email_confirmed_at) {
      console.log('User created successfully, email confirmation pending');
    }
  };

  // SignOut function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    localStorage.removeItem('lastLoginTime');
    
    // Clear state immediately
    setUser(null);
    setSession(null);
    setProfile(null);
    
    // Redirect to home page
    navigate('/');
  };

  // Update profile function
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) throw new Error('No user found');

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);

    if (error) throw error;

    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
