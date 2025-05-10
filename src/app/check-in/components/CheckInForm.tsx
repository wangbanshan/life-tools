"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";
import { useCheckInRecords, useAddCheckInRecord } from "@/lib/hooks/useCheckInRecords";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { CheckInRecord } from "../types";

export default function CheckInForm() {
  // 获取认证状态
  const { user } = useAuthStore();
  
  // 获取打卡记录
  const { data: records = [] } = useCheckInRecords();
  
  // 添加打卡记录
  const addCheckInMutation = useAddCheckInRecord();
  
  // 状态管理
  const [morningCheckedToday, setMorningCheckedToday] = useState<boolean>(false);
  const [eveningCheckedToday, setEveningCheckedToday] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>(format(new Date(), "HH:mm:ss"));
  const [currentDate, setCurrentDate] = useState<string>(format(new Date(), "yyyy年MM月dd日"));

  // 初始化：检查今天是否已打卡
  useEffect(() => {
    checkIfCheckedInToday(records);
  }, [records]);

  // 更新当前时间和日期
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(format(now, "HH:mm:ss"));
      setCurrentDate(format(now, "yyyy年MM月dd日"));
    };

    // 立即更新一次
    updateDateTime();

    // 每秒更新一次
    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

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
    if (!user) {
      toast.error("请先登录再进行打卡！");
      return;
    }
    
    if (type === 'morning' && morningCheckedToday) {
      toast.error("今天已经进行过起床打卡了！");
      return;
    }

    if (type === 'evening' && eveningCheckedToday) {
      toast.error("今天已经进行过睡觉打卡了！");
      return;
    }

    addCheckInMutation.mutate(type, {
      onSuccess: () => {
        if (type === 'morning') {
          toast.success("早上好！起床打卡成功！");
        } else {
          toast.success("晚安！睡觉打卡成功！");
        }
      },
      onError: (error) => {
        toast.error(`打卡失败: ${error.message}`);
      }
    });
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
        <div className="flex flex-col items-center mb-4">
          <div className="text-sm text-muted-foreground mb-1">{currentDate}</div>
          <div className="text-3xl font-mono font-semibold bg-muted px-5 py-2 rounded-md">
            {currentTime}
          </div>
        </div>
        
        {user ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => handleCheckIn('morning')}
              disabled={morningCheckedToday || addCheckInMutation.isPending}
              className="flex-1 py-3"
              size="lg"
            >
              <Sun className="mr-2" />
              {morningCheckedToday ? "今日已起床打卡" : "起床打卡"}
            </Button>
            <Button
              onClick={() => handleCheckIn('evening')}
              disabled={eveningCheckedToday || addCheckInMutation.isPending}
              className="flex-1 py-3"
              variant="secondary"
              size="lg"
            >
              <Moon className="mr-2" />
              {eveningCheckedToday ? "今日已睡觉打卡" : "睡觉打卡"}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">请登录后进行打卡</p>
            <AuthButtons className="justify-center" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
