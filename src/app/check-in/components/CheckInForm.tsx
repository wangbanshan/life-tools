"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";

import { CheckInRecord } from "../types";

interface CheckInFormProps {
  records: CheckInRecord[];
  onCheckIn: (newRecord: CheckInRecord) => void;
}

export default function CheckInForm({ records, onCheckIn }: CheckInFormProps) {
  // 状态管理
  const [morningCheckedToday, setMorningCheckedToday] = useState<boolean>(false);
  const [eveningCheckedToday, setEveningCheckedToday] = useState<boolean>(false);

  // 初始化：检查今天是否已打卡
  useEffect(() => {
    checkIfCheckedInToday(records);
  }, [records]);

  // 检查今天是否已打卡
  const checkIfCheckedInToday = (records: CheckInRecord[]) => {
    const today = new Date();
    const todayString = format(today, "yyyy-MM-dd");

    const morningChecked = records.some(record => {
      const recordDate = new Date(record.timestamp);
      return format(recordDate, "yyyy-MM-dd") === todayString && record.type === 'morning';
    });

    const eveningChecked = records.some(record => {
      const recordDate = new Date(record.timestamp);
      return format(recordDate, "yyyy-MM-dd") === todayString && record.type === 'evening';
    });

    setMorningCheckedToday(morningChecked);
    setEveningCheckedToday(eveningChecked);
  };

  // 打卡功能
  const handleCheckIn = (type: 'morning' | 'evening') => {
    if (type === 'morning' && morningCheckedToday) {
      toast.error("今天已经进行过起床打卡了！");
      return;
    }

    if (type === 'evening' && eveningCheckedToday) {
      toast.error("今天已经进行过睡觉打卡了！");
      return;
    }

    const now = new Date();
    const newRecord: CheckInRecord = {
      id: now.getTime().toString(),
      timestamp: now.getTime(),
      formattedDate: format(now, "yyyy年MM月dd日"),
      formattedTime: format(now, "HH:mm:ss"),
      type: type
    };

    // 调用父组件的回调函数
    onCheckIn(newRecord);

    // 更新本地状态
    if (type === 'morning') {
      setMorningCheckedToday(true);
      toast.success("早上好！起床打卡成功！");
    } else {
      setEveningCheckedToday(true);
      toast.success("晚安！睡觉打卡成功！");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          今日打卡
          <div className="flex gap-2">
            <Badge variant={morningCheckedToday ? "default" : "outline"} className={cn(
              morningCheckedToday ? "bg-green-500 hover:bg-green-500" : ""
            )}>
              <Sun className="size-3 mr-1" />
              {morningCheckedToday ? "已打卡" : "未打卡"}
            </Badge>
            <Badge variant={eveningCheckedToday ? "default" : "outline"} className={cn(
              eveningCheckedToday ? "bg-blue-500 hover:bg-blue-500" : ""
            )}>
              <Moon className="size-3 mr-1" />
              {eveningCheckedToday ? "已打卡" : "未打卡"}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          坚持早睡早起，养成健康生活习惯
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          打卡将记录当前时间，请确保在合适的时间进行打卡。
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => handleCheckIn('morning')}
            disabled={morningCheckedToday}
            className="flex-1"
            size="lg"
          >
            <Sun className="mr-2" />
            {morningCheckedToday ? "今日已起床打卡" : "起床打卡"}
          </Button>
          <Button
            onClick={() => handleCheckIn('evening')}
            disabled={eveningCheckedToday}
            className="flex-1"
            variant="secondary"
            size="lg"
          >
            <Moon className="mr-2" />
            {eveningCheckedToday ? "今日已睡觉打卡" : "睡觉打卡"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
