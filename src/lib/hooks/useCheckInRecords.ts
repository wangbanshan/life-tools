import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { CheckInRecord, DailyRecord } from '@/app/check-in/types';

// 获取打卡记录
export function useCheckInRecords() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['check-in-records', user?.id],
    queryFn: async (): Promise<CheckInRecord[]> => {
      if (!user) return [];
      
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
    },
    enabled: !!user, // 只有在用户登录时才执行查询
  });
}

// 生成日期汇总记录
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
  
  return {
    dailyRecords,
    isLoading,
    error
  };
}

// 添加打卡记录
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
    },
    onSuccess: () => {
      // 成功后刷新数据
      queryClient.invalidateQueries({
        queryKey: ['check-in-records', user?.id]
      });
    }
  });
} 