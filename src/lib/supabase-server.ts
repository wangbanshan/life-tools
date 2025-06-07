import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './supabase';

/**
 * 创建服务器端Supabase客户端
 * 用于服务器组件和API路由中的数据获取
 */
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 在服务器组件中设置 cookie 会失败，这是正常的
          }
        },
      },
    }
  );
};

/**
 * 获取服务器端用户会话
 * @returns Supabase会话对象或null
 */
export async function getServerSession() {
  const supabase = await createServerSupabaseClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('获取服务器会话失败:', error);
    return null;
  }
}