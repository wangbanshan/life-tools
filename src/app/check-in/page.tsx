"use client";

// 导入拆分后的组件
import CheckInForm from "./components/CheckInForm";
import CheckInCalendar from "./components/CheckInCalendar";
import CheckInHistory from "./components/CheckInHistory";
import { useDailyRecords, useCheckInRecords } from "@/lib/hooks/useCheckInRecords";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { AuthButtons } from "@/components/auth/AuthButtons";

export default function CheckInPage() {
  // 获取认证状态
  const { user } = useAuthStore();
  
  // 使用React Query获取打卡记录
  const { data: records = [] } = useCheckInRecords();
  
  // 获取日期汇总记录
  const { dailyRecords } = useDailyRecords();

  return (
    <div className="container mx-auto py-6 px-4 space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center md:text-left">早睡早起打卡</h1>

      {/* 打卡表单组件 */}
      <CheckInForm />

      {user ? (
        <>
          {/* 日历组件 */}
          <CheckInCalendar
            dailyRecords={dailyRecords}
          />

          {/* 历史记录组件 */}
          <CheckInHistory
            records={records}
          />
        </>
      ) : (
        <div className="text-center p-8 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">登录以查看您的打卡历史</h2>
          <p className="mb-6 text-muted-foreground">登录后，您的打卡记录将被保存，并可以在所有设备上查看。</p>
          <AuthButtons className="justify-center" />
        </div>
      )}
    </div>
  );
}
