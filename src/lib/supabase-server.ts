import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from './supabase';

/**
 * 创建服务器端Supabase客户端
 * 用于服务器组件和API路由中的数据获取
 */
export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({
    cookies,
  });
};

/**
 * 获取服务器端用户会话
 * @returns Supabase会话对象或null
 */
export async function getServerSession() {
  const supabase = createServerSupabaseClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('获取服务器会话失败:', error);
    return null;
  }
}