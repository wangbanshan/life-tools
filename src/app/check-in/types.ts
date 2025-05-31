// 定义打卡记录的类型
export interface CheckInRecord {
  id: string;
  user_id: string; // 确保这个字段存在或从 Supabase 查询中获取
  timestamp: number;
  formattedDate: string;
  formattedTime: string;
  type: 'sleep_start' | 'sleep_end'; // 修改这里的类型
  created_at: string; // 确保这个字段存在或从 Supabase 查询中获取
}

// 定义睡眠周期类型
export interface SleepCycle {
  id_start: string; // sleep_start 记录的 id
  id_end?: string; // sleep_end 记录的 id (如果已结束)
  startTime: number;
  endTime?: number;
  duration?: string; // e.g., "8 小时 15 分钟"
  isCompleted: boolean;
}

// 定义日期打卡汇总记录
export interface DailyRecord {
  date: string; // 格式：yyyy-MM-dd
  sleepCycles: SleepCycle[];
  // 保留独立的未配对事件，以便调试或特殊展示
  unpairedSleepStarts: CheckInRecord[];
  unpairedSleepEnds: CheckInRecord[];
}
