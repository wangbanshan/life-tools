'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AccountingForm from './components/AccountingForm';
import AccountingCalendar from './components/AccountingCalendar';
import AccountingList from './components/AccountingList';
import { useMonthlyStatistics } from '@/lib/hooks/useAccountingRecords';

export default function AccountingPage() {
  // 当前选中的日期，默认为今天
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  
  // 当前查看的月份，默认为当前月
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  
  // 获取月度统计数据
  const { data: monthlyStats } = useMonthlyStatistics(year, month);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          记账小助手
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          轻松记录您的日常消费，掌控财务状况
        </p>
      </div>

      {/* 月度概览卡片 */}
      {monthlyStats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{year}年{month}月消费概览</span>
              <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                ¥{monthlyStats.totalAmount.toFixed(2)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">记录笔数</p>
                <p className="text-xl font-semibold">{monthlyStats.transactionCount}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">平均每日</p>
                <p className="text-xl font-semibold">
                  ¥{monthlyStats.dailySummaries.length > 0 
                    ? (monthlyStats.totalAmount / monthlyStats.dailySummaries.length).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">主要消费</p>
                <p className="text-xl font-semibold">
                  {monthlyStats.categoryBreakdown.length > 0 
                    ? monthlyStats.categoryBreakdown[0].category
                    : '暂无数据'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：添加消费表单 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>添加消费记录</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountingForm defaultDate={selectedDate} />
            </CardContent>
          </Card>
        </div>

        {/* 右侧：日历和列表 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 日历视图 */}
          <Card>
            <CardHeader>
              <CardTitle>消费日历</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountingCalendar
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onMonthChange={setCurrentMonth}
                onDateSelect={setSelectedDate}
              />
            </CardContent>
          </Card>

          {/* 消费明细列表 */}
          <Card>
            <CardHeader>
              <CardTitle>
                消费明细 - {format(new Date(selectedDate), 'yyyy年MM月dd日')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AccountingList selectedDate={selectedDate} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 