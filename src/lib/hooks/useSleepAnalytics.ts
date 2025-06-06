import { useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useDailyRecords } from './useCheckInRecords';
import { DailyRecord } from '@/app/check-in/types';

// 时间范围类型定义
export type DateRange = '7days' | '30days' | 'thisMonth' | 'lastMonth';

// 图表数据点接口
export interface SleepChartData {
  date: string; // 格式：MM-dd
  fullDate: string; // 完整日期：yyyy-MM-dd  
  duration: number; // 睡眠时长（小时）
  sleepTime: number | null; // 入睡时间（小数形式，如 2.75 表示 02:45）
  wakeTime: number | null; // 起床时间（小数形式）
  sleepTimeFormatted: string | null; // 格式化的入睡时间
  wakeTimeFormatted: string | null; // 格式化的起床时间
  durationFormatted: string; // 格式化的睡眠时长
}

// 将时间戳转换为小数小时格式（用于图表Y轴）
function timestampToHourDecimal(timestamp: number): number {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours + minutes / 60;
}

// 将小数小时转换为格式化时间字符串
function hourDecimalToTime(hourDecimal: number): string {
  const hours = Math.floor(hourDecimal);
  const minutes = Math.round((hourDecimal - hours) * 60);
  return format(new Date(0, 0, 0, hours, minutes), 'HH:mm');
}

// 计算睡眠时长（小时）
function calculateSleepDurationHours(startTime: number, endTime: number): number {
  const durationMs = endTime - startTime;
  return durationMs / (1000 * 60 * 60); // 转换为小时
}

// 格式化睡眠时长
function formatSleepDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours > 0) {
    return `${wholeHours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
}

// 根据日期范围过滤数据
function filterByDateRange(dailyRecords: DailyRecord[], range: DateRange): DailyRecord[] {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (range) {
    case '7days':
      startDate = subDays(now, 6); // 包含今天，共7天
      break;
    case '30days':
      startDate = subDays(now, 29); // 包含今天，共30天
      break;
    case 'thisMonth':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'lastMonth':
      const lastMonth = subMonths(now, 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
      break;
    default:
      startDate = subDays(now, 6);
  }

  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  return dailyRecords.filter(record => 
    record.date >= startDateStr && record.date <= endDateStr
  );
}

// 生成连续的日期列表（填补缺失的日期）
function generateDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(format(current, 'yyyy-MM-dd'));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// 处理 dailyRecord 中的睡眠周期，提取主要的睡眠数据
function processDailyRecord(record: DailyRecord): {
  duration: number;
  sleepTime: number | null;
  wakeTime: number | null;
  sleepTimeFormatted: string | null;
  wakeTimeFormatted: string | null;
  durationFormatted: string;
} {
  // 获取完整的睡眠周期
  const completedCycles = record.sleepCycles.filter(cycle => cycle.isCompleted && cycle.endTime);
  
  if (completedCycles.length === 0) {
    return {
      duration: 0,
      sleepTime: null,
      wakeTime: null,
      sleepTimeFormatted: null,
      wakeTimeFormatted: null,
      durationFormatted: '无数据'
    };
  }

  // 如果有多个睡眠周期，选择最长的作为主要睡眠
  const mainCycle = completedCycles.reduce((longest, current) => {
    const currentDuration = calculateSleepDurationHours(current.startTime, current.endTime!);
    const longestDuration = calculateSleepDurationHours(longest.startTime, longest.endTime!);
    return currentDuration > longestDuration ? current : longest;
  });

  const duration = calculateSleepDurationHours(mainCycle.startTime, mainCycle.endTime!);
  const sleepTime = timestampToHourDecimal(mainCycle.startTime);
  const wakeTime = timestampToHourDecimal(mainCycle.endTime!);

  return {
    duration,
    sleepTime,
    wakeTime,
    sleepTimeFormatted: hourDecimalToTime(sleepTime),
    wakeTimeFormatted: hourDecimalToTime(wakeTime),
    durationFormatted: formatSleepDuration(duration)
  };
}

/**
 * 睡眠数据分析 hook
 * 提供按时间范围筛选和格式化的睡眠图表数据
 */
export function useSleepAnalytics(dateRange: DateRange = '7days') {
  const { dailyRecords, isLoading, error } = useDailyRecords();

  const chartData = useMemo((): SleepChartData[] => {
    if (!dailyRecords || dailyRecords.length === 0) return [];

    // 根据时间范围过滤数据
    const filteredRecords = filterByDateRange(dailyRecords, dateRange);
    
    // 确定日期范围
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (dateRange) {
      case '7days':
        startDate = subDays(now, 6);
        break;
      case '30days':
        startDate = subDays(now, 29);
        break;
      case 'thisMonth':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      default:
        startDate = subDays(now, 6);
    }

    // 生成连续的日期列表
    const allDates = generateDateRange(startDate, endDate);
    
    // 创建数据映射
    const recordMap = new Map(filteredRecords.map(record => [record.date, record]));
    
    // 生成图表数据
    return allDates.map(date => {
      const record = recordMap.get(date);
      const processed = record ? processDailyRecord(record) : {
        duration: 0,
        sleepTime: null,
        wakeTime: null,
        sleepTimeFormatted: null,
        wakeTimeFormatted: null,
        durationFormatted: '无数据'
      };

      return {
        date: format(new Date(date), 'MM-dd'),
        fullDate: date,
        ...processed
      };
    });
  }, [dailyRecords, dateRange]);

  // 计算统计数据
  const statistics = useMemo(() => {
    const validData = chartData.filter(d => d.duration > 0);
    
    if (validData.length === 0) {
      return {
        averageDuration: 0,
        totalSleepDays: 0,
        averageSleepTime: null,
        averageWakeTime: null
      };
    }

    const avgDuration = validData.reduce((sum, d) => sum + d.duration, 0) / validData.length;
    
    const sleepTimes = validData.filter(d => d.sleepTime !== null).map(d => d.sleepTime!);
    const wakeTimes = validData.filter(d => d.wakeTime !== null).map(d => d.wakeTime!);
    
    const avgSleepTime = sleepTimes.length > 0 ? 
      sleepTimes.reduce((sum, t) => sum + t, 0) / sleepTimes.length : null;
    const avgWakeTime = wakeTimes.length > 0 ? 
      wakeTimes.reduce((sum, t) => sum + t, 0) / wakeTimes.length : null;

    return {
      averageDuration: avgDuration,
      totalSleepDays: validData.length,
      averageSleepTime: avgSleepTime,
      averageWakeTime: avgWakeTime
    };
  }, [chartData]);

  return {
    chartData,
    statistics,
    isLoading,
    error
  };
} 