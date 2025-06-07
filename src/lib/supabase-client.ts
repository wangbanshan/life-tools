import { createBrowserClient } from '@supabase/ssr';
import { Database } from './supabase';

/**
 * 创建客户端 Supabase 客户端
 * 用于客户端组件中的数据获取和认证
 */
export const createClientSupabaseClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}; 