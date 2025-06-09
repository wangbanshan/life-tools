"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Moon, Clock, AlertCircle, Trash2 } from "lucide-react";

import { DailyRecord } from "../types";
import { useDeleteCheckInRecord } from "@/lib/hooks/useCheckInRecords";

interface CheckInCalendarProps {
  dailyRecords: DailyRecord[];
}

export default function CheckInCalendar({ dailyRecords }: CheckInCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  // Hook for deleting records
  const deleteRecordMutation = useDeleteCheckInRecord();

  // 日历相关函数
  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(nextMonth => addMonths(nextMonth, 1));
  };

  // 获取当前月份的日期数组
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  // 获取日期对应的打卡记录
  const getRecordForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return dailyRecords.find(record => record.date === dateStr);
  };

  // 选择日期
  const handleSelectDate = (date: Date) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
  };

  // 获取选中日期的记录
  const getSelectedDateRecord = () => {
    return dailyRecords.find(record => record.date === selectedDate);
  };

  // 判断某天是否有睡眠记录
  const hasSleepRecord = (record: DailyRecord | undefined) => {
    if (!record) return false;
    return record.sleepCycles.length > 0 || record.unpairedSleepStarts.length > 0 || record.unpairedSleepEnds.length > 0;
  };

  // 判断某天是否有完整的睡眠周期
  const hasCompleteSleepCycle = (record: DailyRecord | undefined) => {
    if (!record) return false;
    return record.sleepCycles.some(cycle => cycle.isCompleted);
  };

  // 判断某天是否有未完成的睡眠周期
  const hasIncompleteSleepCycle = (record: DailyRecord | undefined) => {
    if (!record) return false;
    return record.sleepCycles.some(cycle => !cycle.isCompleted) || 
           record.unpairedSleepStarts.length > 0 || 
           record.unpairedSleepEnds.length > 0;
  };

  const selectedRecord = getSelectedDateRecord();
  const days = getDaysInMonth();
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          睡眠日历
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-lg font-medium">
              {format(currentMonth, "yyyy年MM月")}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          查看每日睡眠记录
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          <div className="text-sm font-medium">日</div>
          <div className="text-sm font-medium">一</div>
          <div className="text-sm font-medium">二</div>
          <div className="text-sm font-medium">三</div>
          <div className="text-sm font-medium">四</div>
          <div className="text-sm font-medium">五</div>
          <div className="text-sm font-medium">六</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const record = getRecordForDate(day);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const hasRecord = hasSleepRecord(record);
            const hasComplete = hasCompleteSleepCycle(record);
            const hasIncomplete = hasIncompleteSleepCycle(record);

            return (
              <button
                key={dateStr}
                className={cn(
                  "h-12 rounded-md flex flex-col items-center justify-center relative",
                  isToday ? "border-2 border-primary" : "border border-border",
                  isSelected ? "bg-muted" : "",
                  !isSameMonth(day, currentMonth) ? "opacity-40" : ""
                )}
                onClick={() => handleSelectDate(day)}
              >
                <span className="text-sm">{format(day, "d")}</span>
                {hasRecord && (
                  <div className="flex gap-1 mt-1">
                    {hasComplete && (
                      <span className="size-2 bg-green-500 rounded-full" title="有完整睡眠周期" />
                    )}
                    {hasIncomplete && (
                      <span className="size-2 bg-amber-500 rounded-full" title="有未完成的睡眠记录" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="size-2 bg-green-500 rounded-full" />
            <span>完整睡眠周期</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 bg-amber-500 rounded-full" />
            <span>未完成记录</span>
          </div>
        </div>

        {/* 选中日期详情 */}
        {selectedRecord && (
          <div className="mt-6 p-4 border rounded-md">
            <h3 className="font-medium mb-3">{format(parseISO(selectedRecord.date), "yyyy年MM月dd日")} 睡眠记录</h3>
            
            {/* 完整的睡眠周期 */}
            {selectedRecord.sleepCycles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">睡眠周期</h4>
                {selectedRecord.sleepCycles.map((cycle) => (
                  <div key={cycle.id_start} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Moon className="size-4 text-blue-500" />
                        <span className="text-sm">
                          睡眠时间: {format(new Date(cycle.startTime), "HH:mm")}
                        </span>
                      </div>
                      {cycle.isCompleted && cycle.endTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-green-500" />
                          <span className="text-sm">
                            起床时间: {format(new Date(cycle.endTime), "HH:mm")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {cycle.isCompleted ? (
                        <Badge variant="default" className="bg-green-500">
                          {cycle.duration}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          进行中
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 未配对的记录 */}
            {(selectedRecord.unpairedSleepStarts.length > 0 || selectedRecord.unpairedSleepEnds.length > 0) && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-500" />
                  异常记录
                </h4>
                
                {selectedRecord.unpairedSleepStarts.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Moon className="size-4 text-amber-600" />
                      <span className="text-sm">孤立的睡眠开始: {record.formattedTime}</span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-red-50"
                          disabled={deleteRecordMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">删除记录</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除记录？</AlertDialogTitle>
                          <AlertDialogDescription>
                            您确定要删除这条打卡记录吗？此操作无法撤销。
                            <br />
                            <br />
                            <strong>类型：</strong> 睡眠开始
                            <br />
                            <strong>时间：</strong> {record.formattedTime}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteRecordMutation.mutate(record.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteRecordMutation.isPending}
                          >
                            {deleteRecordMutation.isPending ? "删除中..." : "确认删除"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
                
                {selectedRecord.unpairedSleepEnds.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-amber-600" />
                      <span className="text-sm">孤立的睡眠结束: {record.formattedTime}</span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-red-50"
                          disabled={deleteRecordMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">删除记录</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除记录？</AlertDialogTitle>
                          <AlertDialogDescription>
                            您确定要删除这条打卡记录吗？此操作无法撤销。
                            <br />
                            <br />
                            <strong>类型：</strong> 睡眠结束
                            <br />
                            <strong>时间：</strong> {record.formattedTime}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteRecordMutation.mutate(record.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteRecordMutation.isPending}
                          >
                            {deleteRecordMutation.isPending ? "删除中..." : "确认删除"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}

            {/* 无记录状态 */}
            {selectedRecord.sleepCycles.length === 0 && 
             selectedRecord.unpairedSleepStarts.length === 0 && 
             selectedRecord.unpairedSleepEnds.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Moon className="size-8 mx-auto mb-2 opacity-50" />
                <p>该日期暂无睡眠记录</p>
              </div>
            )}
          </div>
        )}

        {/* 如果选中的日期没有记录 */}
        {!selectedRecord && (
          <div className="mt-6 p-4 border rounded-md">
            <h3 className="font-medium mb-2">{format(parseISO(selectedDate), "yyyy年MM月dd日")}</h3>
            <div className="text-center py-4 text-muted-foreground">
              <Moon className="size-8 mx-auto mb-2 opacity-50" />
              <p>该日期暂无睡眠记录</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
