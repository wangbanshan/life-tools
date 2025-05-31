import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { CheckInRecord, DailyRecord, SleepCycle } from '@/app/check-in/types';
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
          user_id: record.user_id,
          timestamp: record.timestamp,
          formattedDate: format(new Date(record.timestamp), 'yyyy-MM-dd'),
          formattedTime: format(new Date(record.timestamp), 'HH:mm'),
          type: record.type,
          created_at: record.created_at
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
 * 计算睡眠时长
 */
function calculateDuration(startTime: number, endTime: number): string {
  const durationMs = endTime - startTime;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} 小时 ${minutes} 分钟`;
  } else {
    return `${minutes} 分钟`;
  }
}

/**
 * 配对睡眠记录，生成睡眠周期
 */
function pairSleepRecords(records: CheckInRecord[]): {
  sleepCycles: SleepCycle[];
  unpairedSleepStarts: CheckInRecord[];
  unpairedSleepEnds: CheckInRecord[];
} {
  // 按时间升序排序，方便配对
  const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);
  
  const sleepCycles: SleepCycle[] = [];
  const unpairedSleepStarts: CheckInRecord[] = [];
  const unpairedSleepEnds: CheckInRecord[] = [];
  
  let currentSleepStart: CheckInRecord | null = null;
  
  for (const record of sortedRecords) {
    if (record.type === 'sleep_start') {
      // 如果有未配对的 sleep_start，将其标记为未配对
      if (currentSleepStart) {
        unpairedSleepStarts.push(currentSleepStart);
      }
      currentSleepStart = record;
    } else if (record.type === 'sleep_end') {
      if (currentSleepStart) {
        // 找到配对，创建睡眠周期
        const duration = calculateDuration(currentSleepStart.timestamp, record.timestamp);
        sleepCycles.push({
          id_start: currentSleepStart.id,
          id_end: record.id,
          startTime: currentSleepStart.timestamp,
          endTime: record.timestamp,
          duration,
          isCompleted: true
        });
        currentSleepStart = null;
      } else {
        // 没有对应的 sleep_start，标记为未配对
        unpairedSleepEnds.push(record);
      }
    }
  }
  
  // 处理最后一个未配对的 sleep_start
  if (currentSleepStart) {
    // 创建未完成的睡眠周期
    sleepCycles.push({
      id_start: currentSleepStart.id,
      startTime: currentSleepStart.timestamp,
      isCompleted: false
    });
  }
  
  return {
    sleepCycles,
    unpairedSleepStarts,
    unpairedSleepEnds
  };
}

/**
 * 生成日期汇总记录
 * 将打卡记录按日期分组，方便日历和历史记录展示
 */
export function useDailyRecords() {
  const { data: records, isLoading, error } = useCheckInRecords();
  
  const dailyRecords = records ? (() => {
    const { sleepCycles, unpairedSleepStarts, unpairedSleepEnds } = pairSleepRecords(records);
    
    // 按日期分组
    const dailyMap = new Map<string, DailyRecord>();
    
    // 处理完整的睡眠周期（使用 endTime 的日期作为归属日期）
    sleepCycles.forEach(cycle => {
      if (cycle.endTime) {
        const endDate = format(new Date(cycle.endTime), 'yyyy-MM-dd');
        if (!dailyMap.has(endDate)) {
          dailyMap.set(endDate, {
            date: endDate,
            sleepCycles: [],
            unpairedSleepStarts: [],
            unpairedSleepEnds: []
          });
        }
        dailyMap.get(endDate)!.sleepCycles.push(cycle);
      } else {
        // 未完成的睡眠周期使用 startTime 的日期
        const startDate = format(new Date(cycle.startTime), 'yyyy-MM-dd');
        if (!dailyMap.has(startDate)) {
          dailyMap.set(startDate, {
            date: startDate,
            sleepCycles: [],
            unpairedSleepStarts: [],
            unpairedSleepEnds: []
          });
        }
        dailyMap.get(startDate)!.sleepCycles.push(cycle);
      }
    });
    
    // 处理未配对的记录
    unpairedSleepStarts.forEach(record => {
      const date = format(new Date(record.timestamp), 'yyyy-MM-dd');
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          sleepCycles: [],
          unpairedSleepStarts: [],
          unpairedSleepEnds: []
        });
      }
      dailyMap.get(date)!.unpairedSleepStarts.push(record);
    });
    
    unpairedSleepEnds.forEach(record => {
      const date = format(new Date(record.timestamp), 'yyyy-MM-dd');
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          sleepCycles: [],
          unpairedSleepStarts: [],
          unpairedSleepEnds: []
        });
      }
      dailyMap.get(date)!.unpairedSleepEnds.push(record);
    });
    
    // 转换为数组并按日期降序排序
    return Array.from(dailyMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  })() : [];
  
  return {
    dailyRecords,
    isLoading,
    error
  };
}

/**
 * 添加打卡记录的参数接口
 */
interface AddCheckInPayload {
  type: 'sleep_start' | 'sleep_end';
  timestamp: number;
}

/**
 * 添加打卡记录
 * 支持睡眠开始和睡眠结束打卡
 */
export function useAddCheckInRecord() {
  const queryClient = useQueryClient();
  const { user, setIsSleeping } = useAuthStore();
  
  return useMutation({
    mutationFn: async (payload: AddCheckInPayload): Promise<CheckInRecord> => {
      if (!user) throw new Error('用户未登录');
      
      const newRecordData = {
        id: uuidv4(),
        user_id: user.id,
        timestamp: payload.timestamp,
        type: payload.type,
      };
      
      try {
        const { error } = await supabase
          .from('check_in_records')
          .insert(newRecordData);
        
        if (error) throw error;
        
        // 构造返回的记录
        const newRecord: CheckInRecord = {
          ...newRecordData,
          formattedDate: format(new Date(payload.timestamp), 'yyyy-MM-dd'),
          formattedTime: format(new Date(payload.timestamp), 'HH:mm'),
          created_at: new Date().toISOString()
        };
        
        return newRecord;
      } catch (error) {
        console.error('添加打卡记录失败:', error);
        throw new Error('添加打卡记录失败，请稍后重试');
      }
    },
    onSuccess: (data) => {
      // 成功后刷新数据
      queryClient.invalidateQueries({
        queryKey: ['check-in-records', user?.id]
      });
      
      // 更新睡眠状态
      if (data.type === 'sleep_start') {
        setIsSleeping(true);
        toast.success('开始睡眠记录！晚安 😴');
      } else {
        setIsSleeping(false);
        toast.success('睡眠结束！早安 ☀️');
      }
    },
    onError: (error) => {
      // 显示错误通知
      toast.error(`打卡失败: ${error.message}`);
    }
  });
} 