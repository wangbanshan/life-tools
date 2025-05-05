// 定义打卡记录的类型
export interface CheckInRecord {
  id: string;
  timestamp: number;
  formattedDate: string;
  formattedTime: string;
  type: 'morning' | 'evening'; // 早上起床打卡或晚上睡觉打卡
}

// 定义日期打卡汇总记录
export interface DailyRecord {
  date: string; // 格式：yyyy-MM-dd
  morning?: {
    id: string;
    timestamp: number;
    formattedTime: string;
  };
  evening?: {
    id: string;
    timestamp: number;
    formattedTime: string;
  };
}
