"use client";

// 导入拆分后的组件
import CheckInForm from "./components/CheckInForm";
import CheckInCalendar from "./components/CheckInCalendar";
import CheckInHistory from "./components/CheckInHistory";
import { useDailyRecords } from "@/lib/hooks/useCheckInRecords";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function CheckInPage() {
  // 获取认证状态
  const { user } = useAuthStore();
  
  // 获取日期汇总记录
  const { dailyRecords } = useDailyRecords();

  // 如果未登录，返回null以防止页面闪烁
  if (!user) {
    return null;
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
