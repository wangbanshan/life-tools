import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { 
  TransactionCategory, 
  CreateCategoryPayload, 
  UpdateCategoryPayload 
} from '@/app/accounting/types';
import { toast } from 'sonner';

/**
 * 获取用户可见的所有消费类型（包括系统预设和用户自定义）
 */
export function useTransactionCategories() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['transaction-categories', user?.id],
    queryFn: async (): Promise<TransactionCategory[]> => {
      try {
        const { data, error } = await supabase
          .from('transaction_categories')
          .select('*')
          .order('is_preset', { ascending: false }) // 系统预设排在前面
          .order('created_at', { ascending: true }); // 按创建时间排序
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('获取消费类型失败:', error);
        throw new Error('获取消费类型失败，请稍后重试');
      }
    },
    enabled: !!user,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

/**
 * 获取用户自定义的消费类型
 */
export function useUserCategories() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['user-categories', user?.id],
    queryFn: async (): Promise<TransactionCategory[]> => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('transaction_categories')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_preset', false)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('获取用户自定义类型失败:', error);
        throw new Error('获取用户自定义类型失败，请稍后重试');
      }
    },
    enabled: !!user,
    retry: 2,
  });
}

/**
 * 获取系统预设的消费类型
 */
export function usePresetCategories() {
  return useQuery({
    queryKey: ['preset-categories'],
    queryFn: async (): Promise<TransactionCategory[]> => {
      try {
        const { data, error } = await supabase
          .from('transaction_categories')
          .select('*')
          .eq('is_preset', true)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('获取系统预设类型失败:', error);
        throw new Error('获取系统预设类型失败，请稍后重试');
      }
    },
    retry: 2,
    staleTime: 30 * 60 * 1000, // 系统预设类型30分钟内不重新获取
  });
}

/**
 * 添加用户自定义消费类型
 */
export function useAddCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload): Promise<TransactionCategory> => {
      if (!user) {
        throw new Error('用户未登录');
      }
      
      try {
        const { data, error } = await supabase
          .from('transaction_categories')
          .insert({
            user_id: user.id,
            name: payload.name,
            icon: payload.icon || null,
            color: payload.color || null,
            is_preset: false
          })
          .select()
          .single();
        
        if (error) {
          if (error.code === '23505') { // 唯一约束冲突
            throw new Error('该类型名称已存在，请使用其他名称');
          }
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error('添加消费类型失败:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('添加消费类型失败，请稍后重试');
      }
    },
    onSuccess: () => {
      // 使相关查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['transaction-categories', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-categories', user?.id] });
      
      toast.success('消费类型添加成功');
    },
    onError: (error) => {
      toast.error(error.message || '添加消费类型失败');
    }
  });
}

/**
 * 更新用户自定义消费类型
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      payload 
    }: { 
      id: string; 
      payload: UpdateCategoryPayload 
    }): Promise<TransactionCategory> => {
      if (!user) {
        throw new Error('用户未登录');
      }
      
      try {
        const { data, error } = await supabase
          .from('transaction_categories')
          .update(payload)
          .eq('id', id)
          .eq('user_id', user.id)
          .eq('is_preset', false) // 只能更新用户自定义类型
          .select()
          .single();
        
        if (error) {
          if (error.code === '23505') { // 唯一约束冲突
            throw new Error('该类型名称已存在，请使用其他名称');
          }
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error('更新消费类型失败:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('更新消费类型失败，请稍后重试');
      }
    },
    onSuccess: () => {
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['transaction-categories', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-categories', user?.id] });
      
      toast.success('消费类型更新成功');
    },
    onError: (error) => {
      toast.error(error.message || '更新消费类型失败');
    }
  });
}

/**
 * 删除用户自定义消费类型
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user) {
        throw new Error('用户未登录');
      }
      
      try {
        // 首先检查是否有消费记录使用了这个类型
        const { data: transactions, error: checkError } = await supabase
          .from('transactions')
          .select('id')
          .eq('category_id', id)
          .limit(1);
          
        if (checkError) throw checkError;
        
        if (transactions && transactions.length > 0) {
          throw new Error('无法删除该类型，因为已有消费记录使用了此类型');
        }
        
        const { error } = await supabase
          .from('transaction_categories')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)
          .eq('is_preset', false); // 只能删除用户自定义类型
        
        if (error) throw error;
      } catch (error) {
        console.error('删除消费类型失败:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('删除消费类型失败，请稍后重试');
      }
    },
    onSuccess: () => {
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['transaction-categories', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-categories', user?.id] });
      
      toast.success('消费类型删除成功');
    },
    onError: (error) => {
      toast.error(error.message || '删除消费类型失败');
    }
  });
} 