import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { format, endOfMonth, parseISO } from 'date-fns';
import { 
  Transaction, 
  CreateTransactionPayload, 
  UpdateTransactionPayload,
  DailyTransactionSummary,
  MonthlyTransactionSummary,
  CategoryBreakdown,
  TransactionCategory
} from '@/app/accounting/types';
import { toast } from 'sonner';

/**
 * 获取用户的所有消费记录（包含关联的类型信息）
 */
export function useTransactions() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async (): Promise<Transaction[]> => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            transaction_categories (
              id,
              name,
              icon,
              color,
              is_preset
            )
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('获取消费记录失败:', error);
        throw new Error('获取消费记录失败，请稍后重试');
      }
    },
    enabled: !!user,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

/**
 * 获取指定月份的消费记录（包含关联的类型信息）
 */
export function useMonthlyTransactions(year: number, month: number) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['monthly-transactions', user?.id, year, month],
    queryFn: async (): Promise<Transaction[]> => {
      if (!user) return [];
      
      try {
        const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            transaction_categories (
              id,
              name,
              icon,
              color,
              is_preset
            )
          `)
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('获取月度消费记录失败:', error);
        throw new Error('获取月度消费记录失败，请稍后重试');
      }
    },
    enabled: !!user,
    retry: 2,
  });
}

/**
 * 获取指定日期的消费记录（包含关联的类型信息）
 */
export function useDailyTransactions(date: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['daily-transactions', user?.id, date],
    queryFn: async (): Promise<Transaction[]> => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            transaction_categories (
              id,
              name,
              icon,
              color,
              is_preset
            )
          `)
          .eq('user_id', user.id)
          .eq('date', date)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('获取日消费记录失败:', error);
        throw new Error('获取日消费记录失败，请稍后重试');
      }
    },
    enabled: !!user && !!date,
    retry: 2,
  });
}

/**
 * 计算每日消费汇总
 */
export function useDailySummaries(year: number, month: number) {
  const { data: transactions, ...query } = useMonthlyTransactions(year, month);
  
  const dailySummaries: DailyTransactionSummary[] = transactions ? (() => {
    const summaryMap = new Map<string, DailyTransactionSummary>();
    
    transactions.forEach(transaction => {
      const date = transaction.date;
      
      if (!summaryMap.has(date)) {
        summaryMap.set(date, {
          date,
          totalAmount: 0,
          transactionCount: 0,
          transactions: []
        });
      }
      
      const summary = summaryMap.get(date)!;
      summary.totalAmount += transaction.amount;
      summary.transactionCount += 1;
      summary.transactions.push(transaction);
    });
    
    // 转换为数组并按日期降序排序
    return Array.from(summaryMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  })() : [];
  
  return {
    ...query,
    data: dailySummaries
  };
}

/**
 * 计算月度消费统计
 */
export function useMonthlyStatistics(year: number, month: number) {
  const { data: transactions, ...query } = useMonthlyTransactions(year, month);
  
  const statistics: MonthlyTransactionSummary | null = transactions ? (() => {
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = transactions.length;
    
    // 按类型分组统计
    const categoryMap = new Map<string, { 
      category: TransactionCategory; 
      amount: number; 
      count: number; 
    }>();
    
    transactions.forEach(transaction => {
      const categoryInfo = transaction.transaction_categories;
      if (!categoryInfo) return; // 跳过没有类型信息的记录
      
      const categoryId = categoryInfo.id;
      const current = categoryMap.get(categoryId) || { 
        category: categoryInfo, 
        amount: 0, 
        count: 0 
      };
      current.amount += transaction.amount;
      current.count += 1;
      categoryMap.set(categoryId, current);
    });
    
    const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.values())
      .map(({ category, amount, count }) => ({
        category,
        amount,
        count,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount); // 按金额降序排列
    
    // 计算每日汇总
    const dailyMap = new Map<string, DailyTransactionSummary>();
    
    transactions.forEach(transaction => {
      const date = transaction.date;
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          totalAmount: 0,
          transactionCount: 0,
          transactions: []
        });
      }
      
      const daily = dailyMap.get(date)!;
      daily.totalAmount += transaction.amount;
      daily.transactionCount += 1;
      daily.transactions.push(transaction);
    });
    
    const dailySummaries = Array.from(dailyMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return {
      year,
      month,
      totalAmount,
      transactionCount,
      dailySummaries,
      categoryBreakdown
    };
  })() : null;
  
  return {
    ...query,
    data: statistics
  };
}

/**
 * 添加消费记录
 */
export function useAddTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (payload: CreateTransactionPayload): Promise<Transaction> => {
      if (!user) {
        throw new Error('用户未登录');
      }
      
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            date: payload.date,
            amount: payload.amount,
            category_id: payload.category_id, // 使用category_id而不是category
            description: payload.description || null
          })
          .select(`
            *,
            transaction_categories (
              id,
              name,
              icon,
              color,
              is_preset
            )
          `)
          .single();
        
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('添加消费记录失败:', error);
        throw new Error('添加消费记录失败，请稍后重试');
      }
    },
    onSuccess: (data) => {
      // 使相关查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      
      const date = parseISO(data.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      queryClient.invalidateQueries({ 
        queryKey: ['monthly-transactions', user?.id, year, month] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['daily-transactions', user?.id, data.date] 
      });
      
      toast.success('消费记录添加成功');
    },
    onError: (error) => {
      toast.error(error.message || '添加消费记录失败');
    }
  });
}

/**
 * 更新消费记录
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      payload 
    }: { 
      id: string; 
      payload: UpdateTransactionPayload 
    }): Promise<Transaction> => {
      if (!user) {
        throw new Error('用户未登录');
      }
      
      try {
        const { data, error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', id)
          .eq('user_id', user.id)
          .select(`
            *,
            transaction_categories (
              id,
              name,
              icon,
              color,
              is_preset
            )
          `)
          .single();
        
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('更新消费记录失败:', error);
        throw new Error('更新消费记录失败，请稍后重试');
      }
    },
    onSuccess: (data) => {
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      
      const date = parseISO(data.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      queryClient.invalidateQueries({ 
        queryKey: ['monthly-transactions', user?.id, year, month] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['daily-transactions', user?.id, data.date] 
      });
      
      toast.success('消费记录更新成功');
    },
    onError: (error) => {
      toast.error(error.message || '更新消费记录失败');
    }
  });
}

/**
 * 删除消费记录
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user) {
        throw new Error('用户未登录');
      }
      
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } catch (error) {
        console.error('删除消费记录失败:', error);
        throw new Error('删除消费记录失败，请稍后重试');
      }
    },
    onSuccess: () => {
      // 使所有相关查询失效
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['monthly-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['daily-transactions'] });
      
      toast.success('消费记录删除成功');
    },
    onError: (error) => {
      toast.error(error.message || '删除消费记录失败');
    }
  });
}

/**
 * 格式化金额显示
 */
export function formatAmount(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

/**
 * 格式化百分比显示
 */
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
} 