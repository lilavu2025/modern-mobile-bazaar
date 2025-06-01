import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";

export interface Profile {
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
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
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
  }, []);

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

  // توجيه الأدمن دائمًا للوحة الإدارة بعد تسجيل الدخول
  const handleUserRedirection = useCallback((profile: Profile, event: string) => {
    if (event !== 'SIGNED_IN') return;
    if (profile.user_type === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    // باقي الأنواع
    if (profile.user_type === 'wholesale') {
      navigate('/', { replace: true });
      return;
    }
    navigate('/', { replace: true });
  }, [navigate]);

  // حفظ آخر صفحة زارها المستخدم (عدا صفحات auth)
  useEffect(() => {
    if (
      location.pathname !== '/auth' &&
      location.pathname !== '/email-confirmation'
    ) {
      localStorage.setItem('lastVisitedPath', location.pathname + location.search + location.hash);
    }
  }, [location.pathname, location.search, location.hash]);

  // عند تحميل الصفحة، لا تعيد توجيه المستخدم لأي صفحة، فقط أبقه على نفس الصفحة (لا تستخدم navigate إطلاقًا هنا)
  // تم حذف useEffect الخاص بإعادة التوجيه بناءً على lastVisitedPath

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
  }, [fetchProfile, handleUserRedirection]); // Update dependencies

  // SignIn function
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // بعد تسجيل الدخول، تحقق إذا كان الحساب معطل
    if (data.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('disabled')
        .eq('id', data.user.id)
        .single();
      if (profileData?.disabled) {
        await supabase.auth.signOut();
        throw new Error('تم تعطيل حسابك من قبل الإدارة. يرجى التواصل مع الدعم.');
      }
    }
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
  const signOut = useCallback(async () => {
    try {
      // Clear state immediately for better UX
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Clear localStorage
      localStorage.removeItem('lastLoginTime');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        // Don't throw error here to ensure logout completes
      }
      
      // Redirect to home page
      navigate('/');
      
      // Force page reload to ensure complete cleanup
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Error during signOut:', error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setSession(null);
      setProfile(null);
      localStorage.removeItem('lastLoginTime');
      navigate('/');
    }
  }, [navigate]);

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

  // مراقبة انتهاء صلاحية الجلسة تلقائيًا
  useEffect(() => {
    if (!loading && session === null && user !== null) {
      toast({
        title: "انتهت الجلسة",
        description: "يرجى تسجيل الدخول مجددًا. سيتم إعادة تحميل الصفحة تلقائيًا.",
      });
      setTimeout(() => {
        signOut();
        window.location.reload();
      }, 2000);
    }
  }, [session, loading, user, signOut]);

  // منع انتهاء السيشن تلقائيًا عبر تفعيل التحديث التلقائي للـ token
  useEffect(() => {
    const interval = setInterval(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) return;
        const expiresIn = session.expires_at ? session.expires_at * 1000 - Date.now() : 0;
        if (expiresIn < 1000 * 60 * 10) {
          supabase.auth.refreshSession().catch(() => {
            toast({
              title: "فشل تحديث الجلسة",
              description: "يرجى تسجيل الدخول مجددًا.",
            });
            setTimeout(() => {
              signOut();
              window.location.reload();
            }, 2000);
          });
        }
      });
    }, 1000 * 60 * 5);
    return () => clearInterval(interval);
  }, [signOut]);

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

export { AuthContext };
