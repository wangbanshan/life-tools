'use client';

// 导入拆分后的组件
import CheckInForm from './components/CheckInForm';
import CheckInCalendar from './components/CheckInCalendar';
import CheckInHistory from './components/CheckInHistory';
import SleepChart from './components/SleepChart';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDailyRecords } from '@/lib/hooks/useCheckInRecords';

export default function CheckInPage() {
  // 获取日期汇总记录（已包含睡眠周期配对逻辑）
  const { dailyRecords, isLoading, error } = useDailyRecords();

  // 加载状态
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center md:text-left mb-8">早睡早起打卡</h1>
        <LoadingSpinner 
          size="lg" 
          text="正在加载睡眠记录..." 
          className="min-h-[400px]"
        />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-600 text-lg font-medium mb-2">加载失败</h2>
          <p className="text-red-500 mb-4">获取睡眠记录时出错，请刷新页面重试</p>
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
    <div className="container mx-auto py-6 px-4 space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center md:text-left">早睡早起打卡</h1>

      {/* 核心交互区域 - 打卡表单组件 */}
      <CheckInForm />

      {/* 多视图切换区域 */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">日历视图</TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
          <TabsTrigger value="chart">睡眠统计</TabsTrigger>
          </TabsList>
        
        <TabsContent value="calendar" className="mt-6">
          <CheckInCalendar dailyRecords={dailyRecords} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <CheckInHistory dailyRecords={dailyRecords} />
        </TabsContent>
        
        <TabsContent value="chart" className="mt-6">
          <SleepChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
