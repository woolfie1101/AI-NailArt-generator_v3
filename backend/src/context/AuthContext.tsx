import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { loadEnvironmentVariables } from '../lib/envLoader';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: 'free' | 'premium' | 'pro';
  subscription_status: 'active' | 'cancelled' | 'expired';
  subscription_expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<any>(null);

  // 디버깅을 위한 상태 로깅
  useEffect(() => {
    console.log('🔍 Auth State:', {
      user: user?.email || 'null',
      hasSession: !!session,
      loading,
      hasProfile: !!profile,
      localStorage: typeof window !== 'undefined' ? localStorage.getItem('sb-vplstkgvdbdvladxuvzo-auth-token') : 'server-side'
    });
  }, [user, session, loading, profile]);

  // Supabase 클라이언트 초기화
  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        console.log('🔄 Supabase 클라이언트 초기화 중...');
        const envVars = await loadEnvironmentVariables();
        
        const supabaseClient = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true,
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
            debug: process.env.NODE_ENV === 'development'
          }
        });
        
        setSupabase(supabaseClient);
        console.log('✅ Supabase 클라이언트 초기화 완료');
      } catch (error) {
        console.error('❌ Supabase 클라이언트 초기화 실패:', error);
        setLoading(false);
      }
    };

    void initializeSupabase();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    
    let isMounted = true;

    const initializeSession = async () => {
      try {
        console.log('🔄 세션 초기화 시작...');
        
        // 먼저 기존 세션 확인
        const { data: existingSession, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ 기존 세션 조회 오류:', sessionError);
        } else if (existingSession.session) {
          console.log('✅ 기존 세션 발견:', existingSession.session.user?.email);
          setSession(existingSession.session);
          setUser(existingSession.session.user);
          
          if (existingSession.session.user) {
            try {
              await fetchProfile(existingSession.session.user);
              console.log('✅ 기존 세션 프로필 로딩 완료');
            } catch (error) {
              console.error('❌ 기존 세션 프로필 로딩 실패:', error);
            }
          }
          
          setLoading(false);
          return;
        }

        // OAuth 콜백 처리 - URL에 code가 있으면 Supabase가 자동으로 처리하도록 함
        if (typeof window !== 'undefined') {
          console.log('🔗 Current URL:', window.location.href);
          console.log('🔗 Hash:', window.location.hash);
          console.log('🔗 Search:', window.location.search);

          // URL에 code 파라미터가 있으면 OAuth 콜백으로 간주
          if (window.location.search.includes('code=')) {
            console.log('🔄 OAuth 콜백 감지 - Supabase가 자동으로 처리하도록 대기');
            // Supabase가 자동으로 OAuth 콜백을 처리하도록 함
            // onAuthStateChange에서 처리될 것임
          }
        }

        // 세션이 없는 경우
        console.log('ℹ️  활성 세션이 없습니다.');
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);

      } catch (error) {
        console.error('❌ 세션 초기화 실패:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    void initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth state changed:', event, session?.user?.email || 'No user');

      setSession(session);
      setUser(session?.user ?? null);

      // 즉시 로딩 상태 해제
      console.log('🔄 로딩 상태 해제 (즉시)');
      setLoading(false);

      if (session?.user) {
        // 프로필 로딩은 비동기로 처리
        setTimeout(async () => {
          try {
            if (supabase) {
              await fetchProfile(session.user);
              console.log('Auth state change: 프로필 로딩 완료');
            } else {
              console.log('Supabase 클라이언트가 없어서 기본 프로필 생성');
              const fallbackProfile: Profile = {
                id: session.user.id,
                email: session.user.email ?? '',
                full_name: (session.user.user_metadata?.full_name as string | undefined) ?? null,
                avatar_url: (session.user.user_metadata?.avatar_url as string | undefined) ?? null,
                subscription_tier: 'free',
                subscription_status: 'active',
                subscription_expires_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setProfile(fallbackProfile);
            }
          } catch (error) {
            console.error('Auth state change: 프로필 로딩 실패:', error);
            // 프로필 로딩 실패해도 기본 프로필 생성
            const fallbackProfile: Profile = {
              id: session.user.id,
              email: session.user.email ?? '',
              full_name: (session.user.user_metadata?.full_name as string | undefined) ?? null,
              avatar_url: (session.user.user_metadata?.avatar_url as string | undefined) ?? null,
              subscription_tier: 'free',
              subscription_status: 'active',
              subscription_expires_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setProfile(fallbackProfile);
          }
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase]);

  const fetchProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('프로필 조회 오류:', error);
        throw error;
      }

      if (data) {
        setProfile(data);
        return;
      }

      const fallbackProfile: Profile = {
        id: authUser.id,
        email: authUser.email ?? '',
        full_name: (authUser.user_metadata?.full_name as string | undefined) ?? null,
        avatar_url: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
        subscription_tier: 'free',
        subscription_status: 'active',
        subscription_expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert(fallbackProfile)
        .select()
        .single();

      if (insertError) {
        console.error('프로필 생성 오류:', insertError);
        throw insertError;
      }

      setProfile(inserted);
    } catch (error) {
      console.error('프로필 조회 오류:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다.');
      return;
    }

    try {
      // 현재 도메인을 기반으로 리다이렉트 URL 설정
      const redirectUrl = `${window.location.origin}/home`;
      console.log('🔗 OAuth 리다이렉트 URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google 로그인 오류:', error);
        throw error;
      }
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabase) {
      console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다.');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('로그아웃 오류:', error);
        throw error;
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('프로필 업데이트 오류:', error);
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
