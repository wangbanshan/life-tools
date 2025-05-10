import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { CheckInRecord, DailyRecord } from '@/app/check-in/types';
import { toast } from 'sonner';

/**
 * 获取打卡记录
 * 返回用户的所有打卡记录，按时间降序排列
 */
export function useCheckInRecords() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['check-in-records', user?.id],
    queryFn: async (): Promise<CheckInRecord[]> => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('check_in_records')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        // 格式化记录
        return data.map(record => ({
          id: record.id,
          timestamp: record.timestamp,
          formattedDate: format(new Date(record.timestamp), 'yyyy-MM-dd'),
          formattedTime: format(new Date(record.timestamp), 'HH:mm'),
          type: record.type
        }));
      } catch (error) {
        console.error('获取打卡记录失败:', error);
        throw new Error('获取打卡记录失败，请稍后重试');
      }
    },
    enabled: !!user, // 只有在用户登录时才执行查询
    retry: 2, // 失败重试次数
    refetchOnWindowFocus: true, // 窗口聚焦时重新获取
    refetchOnReconnect: true, // 网络重连时重新获取
  });
}

/**
 * 生成日期汇总记录
 * 将打卡记录按日期分组，方便日历和历史记录展示
 */
export function useDailyRecords() {
  const { data: records, isLoading, error } = useCheckInRecords();
  
  const dailyRecords = records?.reduce((acc: DailyRecord[], record: CheckInRecord) => {
    const recordDate = new Date(record.timestamp);
    const dateKey = format(recordDate, 'yyyy-MM-dd');
    
    let dailyRecord = acc.find(dr => dr.date === dateKey);
    
    if (!dailyRecord) {
      dailyRecord = { date: dateKey };
      acc.push(dailyRecord);
    }
    
    if (record.type === 'morning') {
      dailyRecord.morning = {
        id: record.id,
        timestamp: record.timestamp,
        formattedTime: record.formattedTime
      };
    } else if (record.type === 'evening') {
      dailyRecord.evening = {
        id: record.id,
        timestamp: record.timestamp,
        formattedTime: record.formattedTime
      };
    }
    
    return acc;
  }, []) || [];
  
  // 按日期降序排序
  const sortedDailyRecords = [...dailyRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return {
    dailyRecords: sortedDailyRecords,
    isLoading,
    error
  };
}

/**
 * 添加打卡记录
 * 支持早晨起床打卡和晚上睡觉打卡
 */
export function useAddCheckInRecord() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (type: 'morning' | 'evening'): Promise<CheckInRecord> => {
      if (!user) throw new Error('用户未登录');
      
      const now = new Date();
      const timestamp = now.getTime();
      
      const newRecord: CheckInRecord = {
        id: uuidv4(),
        timestamp,
        formattedDate: format(now, 'yyyy-MM-dd'),
        formattedTime: format(now, 'HH:mm'),
        type
      };
      
      try {
        const { error } = await supabase
          .from('check_in_records')
          .insert({
            id: newRecord.id,
            user_id: user.id,
            timestamp: newRecord.timestamp,
            type: newRecord.type
          });
        
        if (error) throw error;
        
        return newRecord;
      } catch (error) {
        console.error('添加打卡记录失败:', error);
        throw new Error('添加打卡记录失败，请稍后重试');
      }
    },
    onSuccess: (_, type) => {
      // 成功后刷新数据
      queryClient.invalidateQueries({
        queryKey: ['check-in-records', user?.id]
      });
      
      // 显示成功通知
      toast.success(type === 'morning' ? '早上好！起床打卡成功！' : '晚安！睡觉打卡成功！');
    },
    onError: (error) => {
      // 显示错误通知
      toast.error(`打卡失败: ${error.message}`);
    }
  });
} 