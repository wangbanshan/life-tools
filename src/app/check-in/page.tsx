"use client";

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { format } from "date-fns";

// 导入类型
import { CheckInRecord, DailyRecord } from "./types";

// 导入拆分后的组件
import CheckInForm from "./components/CheckInForm";
import CheckInCalendar from "./components/CheckInCalendar";
import CheckInHistory from "./components/CheckInHistory";

export default function CheckInPage() {
  // 状态管理
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);

  // 初始化：从localStorage加载数据
  useEffect(() => {
    // 确保代码在客户端执行
    if (typeof window !== "undefined") {
      // 加载历史记录
      const savedRecords = localStorage.getItem("checkInRecords");
      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords) as CheckInRecord[];
        setRecords(parsedRecords);

        // 生成日期汇总记录
        generateDailyRecords(parsedRecords);
      }
    }
  }, []);

  // 生成日期汇总记录
  const generateDailyRecords = (records: CheckInRecord[]) => {
    const dailyMap = new Map<string, DailyRecord>();

    records.forEach(record => {
      const recordDate = new Date(record.timestamp);
      const dateKey = format(recordDate, "yyyy-MM-dd");

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { date: dateKey });
      }

      const dailyRecord = dailyMap.get(dateKey)!;

      if (record.type === 'morning') {
        dailyRecord.morning = {
          id: record.id,
          timestamp: record.timestamp,
          formattedTime: record.formattedTime
        };
      } else if (record.type === 'evening') {
        dailyRecord.evening = {
          id: record.id,
          timestamp: record.timestamp,
          formattedTime: record.formattedTime
        };
      }
    });

    setDailyRecords(Array.from(dailyMap.values()));
  };

  // 处理打卡
  const handleCheckIn = (newRecord: CheckInRecord) => {
    // 更新状态并保存到localStorage
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem("checkInRecords", JSON.stringify(updatedRecords));

    // 更新日期汇总记录
    generateDailyRecords(updatedRecords);
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center md:text-left">早睡早起打卡</h1>

      {/* 打卡表单组件 */}
      <CheckInForm
        records={records}
        onCheckIn={handleCheckIn}
      />

      {/* 日历组件 */}
      <CheckInCalendar
        dailyRecords={dailyRecords}
      />

      {/* 历史记录组件 */}
      <CheckInHistory
        records={records}
      />

      {/* 通知组件 */}
      <Toaster />
    </div>
  );
}
