'use client';

import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, PieChart, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyTransactionSummary } from '../types';
import { formatAmount } from '@/lib/hooks/useAccountingRecords';
import SpendingDistributionChart from './SpendingDistributionChart';

interface MonthlyOverviewProps {
  monthlyStats: MonthlyTransactionSummary | null;
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

// 定义卡片颜色
const CARD_COLORS = [
  {
    bg: 'bg-blue-100',
    amount: 'text-blue-600',
    category: 'text-gray-600'
  },
  {
    bg: 'bg-emerald-100', 
    amount: 'text-emerald-600',
    category: 'text-gray-600'
  },
  {
    bg: 'bg-amber-100',
    amount: 'text-amber-600', 
    category: 'text-gray-600'
  }
];

export default function MonthlyOverview({ 
  monthlyStats, 
  currentMonth, 
  onMonthChange 
}: MonthlyOverviewProps) {
  const [view, setView] = useState<'list' | 'chart'>('list');

  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  // 获取消费排行前三的分类
  const topThreeCategories = monthlyStats?.categoryBreakdown
    ?.sort((a, b) => b.amount - a.amount)
    .slice(0, 3) || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">本月消费概览</CardTitle>
          {/* 月份选择器 */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium min-w-[100px] text-center">
              {format(currentMonth, 'yyyy年MM月')}
            </span>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* 本月总支出 */}
        <div className="text-center mb-4">
          <p className="text-4xl font-bold text-red-500 mb-2">
            {monthlyStats ? formatAmount(monthlyStats.totalAmount) : '¥0.00'}
          </p>
          <p className="text-sm text-muted-foreground">本月总支出</p>
        </div>

        {/* 视图切换和内容区 */}
        {monthlyStats && monthlyStats.totalAmount > 0 ? (
          <div className="space-y-3">
            {/* 视图切换按钮 */}
            <div className="flex justify-end">
              <div className="flex gap-1 p-1 bg-muted rounded-md">
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('list')}
                  className="h-6 w-6 p-0"
                >
                  <List className="h-3 w-3" />
                </Button>
                <Button
                  variant={view === 'chart' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('chart')}
                  className="h-6 w-6 p-0"
                >
                  <PieChart className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* 内容区 */}
            {view === 'list' ? (
              /* 消费分类卡片列表 */
              <div className="grid grid-cols-3 gap-3 py-2">
                {topThreeCategories.map((category, index) => (
                  <div 
                    key={category.category.id}
                    className={`${CARD_COLORS[index].bg} rounded-lg p-3 text-center`}
                  >
                    {/* 消费金额 */}
                    <p className={`text-base font-normal mb-1 ${CARD_COLORS[index].amount}`}>
                      {formatAmount(category.amount)}
                    </p>
                    
                    {/* 分类名称 */}
                    <p className={`text-sm font-medium ${CARD_COLORS[index].category}`}>
                      {category.category.name}
                    </p>
                  </div>
                ))}
                
                {/* 如果不足三个分类，填充空白卡片 */}
                {Array.from({ length: Math.max(0, 3 - topThreeCategories.length) }).map((_, index) => (
                  <div 
                    key={`empty-${index}`}
                    className="bg-gray-100 rounded-lg p-3 text-center border-2 border-dashed border-gray-300"
                  >
                    <p className="text-sm text-gray-400">暂无数据</p>
                  </div>
                ))}
              </div>
            ) : (
              /* 图表视图：环形图 */
              <div className="flex justify-center">
                <SpendingDistributionChart data={monthlyStats} />
              </div>
            )}
          </div>
        ) : (
          /* 空状态 */
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">本月暂无消费记录</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 