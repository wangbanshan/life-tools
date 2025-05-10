"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Sun, Moon, Loader2 } from "lucide-react";
import { useCheckInRecords, useAddCheckInRecord } from "@/lib/hooks/useCheckInRecords";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { CheckInRecord } from "../types";

export default function CheckInForm() {
  // 获取认证状态
  const { user } = useAuthStore();
  
  // 获取打卡记录
  const { data: records = [], isLoading: isLoadingRecords, error: recordsError } = useCheckInRecords();
  
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
          setMorningCheckedToday(true);
        } else {
          toast.success("晚安！睡觉打卡成功！");
          setEveningCheckedToday(true);
        }
      },
      onError: (error) => {
        toast.error(`打卡失败: ${error.message}`);
      }
    });
  };

  // 处理错误状态
  if (recordsError) {
    return (
      <Card className="w-full bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">数据加载失败</CardTitle>
          <CardDescription className="text-red-500">
            获取打卡记录时出错，请刷新页面重试
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()} variant="destructive">
            重新加载
          </Button>
        </CardContent>
      </Card>
    );
  }

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
        <div className="flex flex-col items-center justify-center text-center py-8 space-y-6">
          <div className="space-y-1">
            <div className="text-4xl font-bold tabular-nums">{currentTime}</div>
            <div className="text-sm text-muted-foreground">{currentDate}</div>
          </div>

          {isLoadingRecords ? (
            <div className="flex items-center justify-center w-full py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : user ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg"
                className={cn(
                  "flex items-center gap-2 w-full sm:w-auto",
                  morningCheckedToday ? "border-green-500 text-green-500" : ""
                )}
                onClick={() => handleCheckIn('morning')}
                disabled={morningCheckedToday || addCheckInMutation.isPending}
              >
                {addCheckInMutation.isPending && addCheckInMutation.variables === 'morning' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sun className="h-4 w-4 mr-2" />
                )}
                起床打卡
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className={cn(
                  "flex items-center gap-2 w-full sm:w-auto",
                  eveningCheckedToday ? "border-blue-500 text-blue-500" : ""
                )}
                onClick={() => handleCheckIn('evening')}
                disabled={eveningCheckedToday || addCheckInMutation.isPending}
              >
                {addCheckInMutation.isPending && addCheckInMutation.variables === 'evening' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Moon className="h-4 w-4 mr-2" />
                )}
                睡觉打卡
              </Button>
            </div>
          ) : (
            <div className="space-y-4 w-full max-w-sm">
              <p className="text-muted-foreground">登录后开始记录您的作息时间</p>
              <AuthButtons className="justify-center" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
