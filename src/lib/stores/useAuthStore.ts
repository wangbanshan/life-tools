import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  
  // 睡眠状态管理
  isSleeping: boolean;
  
  // 方法
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  getProfile: () => Promise<void>;
  
  // 睡眠状态相关方法
  setIsSleeping: (status: boolean) => void;
  initializeSleepingState: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,
  initialized: false,
  
  // 默认睡眠状态为 false
  isSleeping: false,
  
  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      // 检查当前会话
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user });
        await get().getProfile();
        // 初始化用户登录后，根据最后一次打卡记录恢复睡眠状态
        await get().initializeSleepingState();
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false, initialized: true });
    }
  },
  
  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || window.location.origin + '/auth/callback'
        }
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  signInWithGithub: async () => {
    set({ isLoading: true, error: null });
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || window.location.origin + '/auth/callback'
        }
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await supabase.auth.signOut();
      set({ user: null, profile: null, isSleeping: false });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  getProfile: async () => {
    const { user } = get();
    if (!user) return;
    
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, updated_at')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  // 设置睡眠状态
  setIsSleeping: (status: boolean) => {
    set({ isSleeping: status });
  },

  // 根据最后一次打卡记录初始化睡眠状态
  initializeSleepingState: async () => {
    const { user } = get();
    if (!user) return;

    try {
      // 获取最新的打卡记录
      const { data, error } = await supabase
        .from('check_in_records')
        .select('type')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // 如果没有记录或查询失败，默认为清醒状态
        set({ isSleeping: false });
        return;
      }

      // 如果最后一条记录是 sleep_start，则用户应该处于睡眠状态
      // 如果最后一条记录是 sleep_end，则用户应该处于清醒状态
      set({ isSleeping: data.type === 'sleep_start' });
    } catch (error) {
      console.error('初始化睡眠状态失败:', error);
      // 出错时默认为清醒状态
      set({ isSleeping: false });
    }
  }
})); 