import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少必要的 Supabase 环境变量');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      check_in_records: {
        Row: {
          id: string;
          user_id: string;
          timestamp: number;
          type: 'sleep_start' | 'sleep_end';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timestamp: number;
          type: 'sleep_start' | 'sleep_end';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timestamp?: number;
          type?: 'sleep_start' | 'sleep_end';
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          amount: number;
          category: string;
          description?: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          amount: number;
          category: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          amount?: number;
          category?: string;
          description?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
};
