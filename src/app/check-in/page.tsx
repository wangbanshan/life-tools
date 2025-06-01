'use client';

// 导入拆分后的组件
import CheckInForm from './components/CheckInForm';
import CheckInCalendar from './components/CheckInCalendar';
import CheckInHistory from './components/CheckInHistory';
import LoadingSpinner from '@/components/ui/loading-spinner';
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

      {/* 打卡表单组件 */}
      <CheckInForm />

      {/* 日历组件 */}
      <CheckInCalendar dailyRecords={dailyRecords} />

      {/* 历史记录组件 */}
      <CheckInHistory dailyRecords={dailyRecords} />
    </div>
  );
}
