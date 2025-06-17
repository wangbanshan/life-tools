'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import LoadingSpinner from '@/components/ui/loading-spinner';
import MonthlyOverview from './components/MonthlyOverview';
import AccountingForm from './components/AccountingForm';
import AccountingCalendar from './components/AccountingCalendar';
import AccountingList from './components/AccountingList';
import SpendingTrendChart from './components/SpendingTrendChart';
import CategoryManager from './components/CategoryManager';
import { useMonthlyStatistics } from '@/lib/hooks/useAccountingRecords';

export default function AccountingPage() {
  // 当前选中的日期，默认为今天
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  
  // 当前查看的月份，默认为当前月
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // 添加消费记录对话框状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  
  // 获取月度统计数据
  const { data: monthlyStats, isLoading, error } = useMonthlyStatistics(year, month);

  const handleAddSuccess = () => {
    // 成功添加记录后关闭弹窗
    setIsAddDialogOpen(false);
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            记账小助手
          </h1>
        </div>
        <LoadingSpinner 
          size="lg" 
          text="正在加载消费记录..." 
          className="min-h-[400px]"
        />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-600 text-lg font-medium mb-2">加载失败</h2>
          <p className="text-red-500 mb-4">获取消费记录时出错，请刷新页面重试</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 页面标题和添加按钮 */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          记账小助手
        </h1>
        {/* Web端添加消费记录按钮 - 纯蓝色背景 */}
        <div className="hidden md:block">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 px-4 py-2 rounded-lg font-medium shadow-sm"
              >
                <Plus className="h-4 w-4" />
                添加消费记录
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>添加消费记录</DialogTitle>
              </DialogHeader>
              <AccountingForm 
                defaultDate={selectedDate}
                onSuccess={handleAddSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 两段式布局 */}
      <div className="space-y-6">
        {/* 第一段：顶部概览区（集成了环形图的概览卡片） */}
        <MonthlyOverview 
          monthlyStats={monthlyStats}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />

        {/* 第二段：底部功能区（Tabs） */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">日历明细</TabsTrigger>
            <TabsTrigger value="trend">消费趋势</TabsTrigger>
            <TabsTrigger value="categories">分类管理</TabsTrigger>
          </TabsList>
          
          {/* 日历明细 Tab */}
          <TabsContent value="calendar" className="mt-6 space-y-6">
            {/* 日历组件 */}
            <AccountingCalendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              onMonthChange={setCurrentMonth}
              onDateSelect={setSelectedDate}
            />
            
            {/* 消费明细 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                消费明细 - {format(new Date(selectedDate), 'yyyy年MM月dd日')}
              </h3>
              <AccountingList selectedDate={selectedDate} />
            </div>
          </TabsContent>
          
          {/* 消费趋势 Tab */}
          <TabsContent value="trend" className="mt-6">
            <SpendingTrendChart data={monthlyStats} />
          </TabsContent>
          
          {/* 分类管理 Tab */}
          <TabsContent value="categories" className="mt-6">
            <CategoryManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* 移动端浮动操作按钮 (FAB) */}
      <div className="md:hidden">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-50 transition-all duration-200 hover:scale-105 p-0"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>添加消费记录</DialogTitle>
            </DialogHeader>
            <AccountingForm 
              defaultDate={selectedDate}
              onSuccess={handleAddSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 