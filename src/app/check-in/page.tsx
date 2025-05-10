"use client";

// 导入拆分后的组件
import CheckInForm from "./components/CheckInForm";
import CheckInCalendar from "./components/CheckInCalendar";
import CheckInHistory from "./components/CheckInHistory";
import { useDailyRecords, useCheckInRecords } from "@/lib/hooks/useCheckInRecords";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckInPage() {
  // 获取认证状态
  const { user } = useAuthStore();
  const router = useRouter();
  
  // 使用React Query获取打卡记录
  const { data: records = [] } = useCheckInRecords();
  
  // 获取日期汇总记录
  const { dailyRecords } = useDailyRecords();

  // 如果用户未登录，重定向到首页
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

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
        records={records}
      />
    </div>
  );
}
