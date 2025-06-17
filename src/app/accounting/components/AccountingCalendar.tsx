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
          size="icon" 
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-lg font-medium">
          {format(currentMonth, 'yyyy年MM月')}
        </h3>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* 星期头部 */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        <div className="text-sm font-medium">日</div>
        <div className="text-sm font-medium">一</div>
        <div className="text-sm font-medium">二</div>
        <div className="text-sm font-medium">三</div>
        <div className="text-sm font-medium">四</div>
        <div className="text-sm font-medium">五</div>
        <div className="text-sm font-medium">六</div>
      </div>
      
      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 填充空白天数 */}
        {Array.from({ length: calendarData.paddingDays }).map((_, index) => (
          <div key={`empty-${index}`} className="h-12" />
        ))}
        
        {/* 日期方块 */}
        {calendarData.daysInMonth.map((date) => {
          const dayExpense = getDayExpense(date);
          const isSelected = isDaySelected(date);
          const isTodayDate = isToday(date);
          const hasExpense = dayExpense > 0;
          
          return (
            <button
              key={format(date, 'yyyy-MM-dd')}
              onClick={() => handleDateClick(date)}
              className={cn(
                "h-12 rounded-md flex flex-col items-center justify-center relative transition-colors border border-border",
                isSelected
                  ? "border-2 border-blue-600"
                  : isTodayDate
                  ? "border-slate-400"
                  : "border-border hover:bg-muted"
              )}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-sm">{format(date, 'd')}</span>
                {hasExpense && (
                  <span className="text-xs text-red-600 font-medium mt-0.5">
                    ¥{dayExpense.toFixed(0)}
                  </span>
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