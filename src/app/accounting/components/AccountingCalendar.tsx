'use client';

import { useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday,
  addMonths,
  subMonths,
  getDay
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDailySummaries } from '@/lib/hooks/useAccountingRecords';
import { cn } from '@/lib/utils';

interface AccountingCalendarProps {
  currentMonth: Date;
  selectedDate: string;
  onMonthChange: (month: Date) => void;
  onDateSelect: (date: string) => void;
}

export default function AccountingCalendar({
  currentMonth,
  selectedDate,
  onMonthChange,
  onDateSelect
}: AccountingCalendarProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  
  // 获取当月的消费汇总数据
  const { data: dailySummaries, isLoading } = useDailySummaries(year, month);
  
  // 生成日历数据
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // 计算月份开始前需要填充的空白天数
    const startDay = getDay(monthStart); // 0 = Sunday, 1 = Monday, etc.
    const paddingDays = startDay === 0 ? 6 : startDay - 1; // 调整为周一开始
    
    // 创建消费数据映射
    const expenseMap = new Map<string, number>();
    dailySummaries?.forEach(summary => {
      expenseMap.set(summary.date, summary.totalAmount);
    });
    
    return {
      paddingDays,
      daysInMonth,
      expenseMap
    };
  }, [currentMonth, dailySummaries]);
  
  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };
  
  const handleDateClick = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    onDateSelect(dateString);
  };
  
  const getDayExpense = (date: Date): number => {
    const dateString = format(date, 'yyyy-MM-dd');
    return calendarData.expenseMap.get(dateString) || 0;
  };
  
  const isDaySelected = (date: Date): boolean => {
    const dateString = format(date, 'yyyy-MM-dd');
    return dateString === selectedDate;
  };

  return (
    <div className="w-full">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrevMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-lg font-semibold">
          {format(currentMonth, 'yyyy年MM月')}
        </h3>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* 星期头部 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 填充空白天数 */}
        {Array.from({ length: calendarData.paddingDays }).map((_, index) => (
          <div key={`empty-${index}`} className="h-16 sm:h-20" />
        ))}
        
        {/* 日期方块 */}
        {calendarData.daysInMonth.map((date) => {
          const dayExpense = getDayExpense(date);
          const isSelected = isDaySelected(date);
          const isTodayDate = isToday(date);
          
          return (
            <button
              key={format(date, 'yyyy-MM-dd')}
              onClick={() => handleDateClick(date)}
              className={cn(
                "h-14 sm:h-16 p-1 border rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500",
                {
                  "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700": isSelected,
                  "bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-800": isTodayDate && !isSelected,
                  "border-gray-200 dark:border-gray-700": !isSelected && !isTodayDate
                }
              )}
            >
              <div className="h-full flex flex-col justify-between">
                {/* 日期数字 */}
                <div className={cn(
                  "text-sm font-medium",
                  {
                    "text-blue-600 dark:text-blue-400": isSelected,
                    "text-yellow-600 dark:text-yellow-400": isTodayDate && !isSelected,
                    "text-gray-900 dark:text-gray-100": !isSelected && !isTodayDate
                  }
                )}>
                  {format(date, 'd')}
                </div>
                
                {/* 消费金额 */}
                {dayExpense > 0 && (
                  <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                    ¥{dayExpense.toFixed(0)}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center py-4 text-gray-500">
          加载中...
        </div>
      )}
    </div>
  );
} 