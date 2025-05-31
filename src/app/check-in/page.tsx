"use client";

// 导入拆分后的组件
import CheckInForm from "./components/CheckInForm";
import CheckInCalendar from "./components/CheckInCalendar";
import CheckInHistory from "./components/CheckInHistory";
import { useDailyRecords } from "@/lib/hooks/useCheckInRecords";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckInPage() {
  // 获取认证状态
  const { user, initialized } = useAuthStore();
  const router = useRouter();
  
  // 获取日期汇总记录（已包含睡眠周期配对逻辑）
  const { dailyRecords, error } = useDailyRecords();

  // 只有在认证状态初始化完成后才执行重定向逻辑
  useEffect(() => {
    if (initialized && !user) {
      router.push('/');
    }
  }, [user, initialized, router]);

  // 如果认证状态还未初始化，显示加载状态
  if (!initialized) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">正在验证登录状态...</p>
          </div>
        </div>
      </div>
    );
  }

  // 如果已初始化但用户未登录，返回null以防止页面闪烁
  if (initialized && !user) {
    return null;
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
      <CheckInCalendar
        dailyRecords={dailyRecords}
      />

      {/* 历史记录组件 */}
      <CheckInHistory
        dailyRecords={dailyRecords}
      />
    </div>
  );
}
