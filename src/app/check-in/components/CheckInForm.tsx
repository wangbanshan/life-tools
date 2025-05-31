"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Sun, Moon, Loader2 } from "lucide-react";
import { useAddCheckInRecord } from "@/lib/hooks/useCheckInRecords";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function CheckInForm() {
  // 获取睡眠状态和用户信息
  const { isSleeping, user } = useAuthStore();
  
  // 添加打卡记录
  const addCheckInMutation = useAddCheckInRecord();
  
  // 状态管理
  const [currentTime, setCurrentTime] = useState<string>(format(new Date(), "HH:mm:ss"));
  const [currentDate, setCurrentDate] = useState<string>(format(new Date(), "yyyy年MM月dd日"));

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

  // 获取睡眠状态开始时间（用于显示睡眠持续时长）
  const getSleepStartTime = (): string | null => {
    // 这里可以从 localStorage 或其他地方获取睡眠开始时间
    // 为了简化，暂时返回null，后续可以扩展
    return null;
  };

  // 打卡功能
  const handleCheckIn = () => {
    const timestamp = Date.now();
    const type = isSleeping ? 'sleep_end' : 'sleep_start';
    
    addCheckInMutation.mutate({ type, timestamp });
  };

  // 如果用户未登录
  if (!user) {
    return (
      <Card className="w-full bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-600">请先登录</CardTitle>
          <CardDescription className="text-yellow-500">
            您需要登录后才能使用打卡功能
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          睡眠打卡
          <Badge 
            variant={isSleeping ? "default" : "outline"} 
            className={cn(
              isSleeping ? "bg-blue-500 hover:bg-blue-500" : "bg-green-500 hover:bg-green-500"
            )}
          >
            {isSleeping ? (
              <>
                <Moon className="size-3 mr-1" />
                睡眠中
              </>
            ) : (
              <>
                <Sun className="size-3 mr-1" />
                清醒中
              </>
            )}
          </Badge>
        </CardTitle>
        <CardDescription>
          记录您的睡眠周期，养成健康的生活习惯
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-8 space-y-6">
          <div className="space-y-1">
            <div className="text-4xl font-bold tabular-nums">{currentTime}</div>
            <div className="text-sm text-muted-foreground">{currentDate}</div>
          </div>

          {/* 睡眠状态显示 */}
          <div className="text-center space-y-2">
            {isSleeping ? (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">当前状态</p>
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Moon className="h-4 w-4" />
                  <span className="font-medium">睡眠中</span>
                </div>
                {getSleepStartTime() && (
                  <p className="text-xs text-muted-foreground">
                    从 {getSleepStartTime()} 开始
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">当前状态</p>
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Sun className="h-4 w-4" />
                  <span className="font-medium">清醒中</span>
                </div>
              </div>
            )}
          </div>

          {/* 打卡按钮 */}
          <div className="w-full sm:w-auto">
            <Button 
              size="lg"
              className={cn(
                "w-full sm:w-auto px-8 py-6 text-lg",
                isSleeping 
                  ? "bg-orange-500 hover:bg-orange-600 text-white" 
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              )}
              onClick={handleCheckIn}
              disabled={addCheckInMutation.isPending}
            >
              {addCheckInMutation.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <>
                  {isSleeping ? (
                    <Sun className="h-5 w-5 mr-2" />
                  ) : (
                    <Moon className="h-5 w-5 mr-2" />
                  )}
                </>
              )}
              {isSleeping ? "我睡醒了" : "我准备睡了"}
            </Button>
          </div>

          {/* 提示文本 */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isSleeping 
                ? "点击按钮记录您的起床时间" 
                : "点击按钮开始记录睡眠"
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
