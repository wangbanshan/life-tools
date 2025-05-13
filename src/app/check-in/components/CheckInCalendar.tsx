"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Sun, Moon, Clock } from "lucide-react";

import { DailyRecord } from "../types";

interface CheckInCalendarProps {
  dailyRecords: DailyRecord[];
}

export default function CheckInCalendar({ dailyRecords }: CheckInCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

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

  // 计算睡眠时间
  const calculateSleepDuration = (currentRecord: DailyRecord, previousDayRecord?: DailyRecord) => {
    if (!currentRecord.morning || !previousDayRecord?.evening) {
      return null;
    }

    // 获取当天早上起床时间和前一天晚上睡觉时间的时间戳
    const wakeupTimestamp = currentRecord.morning.timestamp;
    const sleepTimestamp = previousDayRecord.evening.timestamp;

    // 将时间戳转换为日期对象，用于提取小时和分钟
    const wakeupDate = new Date(wakeupTimestamp);
    const sleepDate = new Date(sleepTimestamp);
    console.log(wakeupDate, sleepDate, '1111');

    // 提取时间部分（小时和分钟）
    const wakeupHours = wakeupDate.getHours();
    const wakeupMinutes = wakeupDate.getMinutes();
    const sleepHours = sleepDate.getHours();
    const sleepMinutes = sleepDate.getMinutes();

    // 计算睡眠时间（分钟）
    let sleepMinutesTotal = 0;

    // 如果睡觉时间小于起床时间（例如：睡觉02:02，起床10:08），直接计算差值
    if (sleepHours < wakeupHours || (sleepHours === wakeupHours && sleepMinutes < wakeupMinutes)) {
      sleepMinutesTotal = (wakeupHours - sleepHours) * 60 + (wakeupMinutes - sleepMinutes);
    }
    // 如果睡觉时间大于起床时间（例如：睡觉23:52，起床08:28），计算到午夜的时间加上从午夜到起床的时间
    else {
      sleepMinutesTotal = (24 - sleepHours) * 60 - sleepMinutes + wakeupHours * 60 + wakeupMinutes;
    }

    // 计算小时和剩余分钟
    const hoursSlept = Math.floor(sleepMinutesTotal / 60);
    const minutesSlept = sleepMinutesTotal % 60;

    return {
      hours: hoursSlept,
      minutes: minutesSlept,
      total: sleepMinutesTotal
    };
  };

  // 获取前一天的记录
  const getPreviousDayRecord = (date: string) => {
    const currentDate = parseISO(date);
    const previousDate = format(new Date(currentDate.setDate(currentDate.getDate() - 1)), "yyyy-MM-dd");
    return dailyRecords.find(record => record.date === previousDate);
  };

  const selectedRecord = getSelectedDateRecord();
  const previousDayRecord = selectedRecord ? getPreviousDayRecord(selectedRecord.date) : undefined;
  const sleepDuration = selectedRecord && previousDayRecord ? calculateSleepDuration(selectedRecord, previousDayRecord) : null;

  const days = getDaysInMonth();
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          打卡日历
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
                {record && (
                  <div className="flex gap-1 mt-1">
                    {record.morning && (
                      <span className="size-2 bg-green-500 rounded-full" />
                    )}
                    {record.evening && (
                      <span className="size-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 选中日期详情 */}
        {selectedRecord && (
          <div className="mt-6 p-4 border rounded-md">
            <h3 className="font-medium mb-2">{format(parseISO(selectedRecord.date), "yyyy年MM月dd日")} 打卡记录</h3>
            <div className="space-y-2">
              {selectedRecord.morning ? (
                <div className="flex items-center gap-2">
                  <Sun className="size-4 text-green-500" />
                  <span>起床时间: </span>
                  <span className="font-medium text-green-500">{selectedRecord.morning.formattedTime}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Sun className="size-4" />
                  <span>未记录起床时间</span>
                </div>
              )}

              {selectedRecord.evening ? (
                <div className="flex items-center gap-2">
                  <Moon className="size-4 text-blue-500" />
                  <span>睡觉时间: </span>
                  <span className="font-medium text-blue-500">{selectedRecord.evening.formattedTime}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Moon className="size-4" />
                  <span>未记录睡觉时间</span>
                </div>
              )}

              {sleepDuration && (
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-purple-500" />
                  <span>睡眠时间: </span>
                  <span className="font-medium text-purple-500">
                    {sleepDuration.hours}小时{sleepDuration.minutes > 0 ? ` ${sleepDuration.minutes}分钟` : ''}
                    {sleepDuration.total < 420 && <span className="ml-2 text-xs text-red-500">(睡眠不足)</span>}
                    {sleepDuration.total > 540 && <span className="ml-2 text-xs text-green-500">(睡眠充足)</span>}
                  </span>
                </div>
              )}

              {selectedRecord.morning && !sleepDuration && previousDayRecord && !previousDayRecord.evening && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t text-muted-foreground">
                  <Clock className="size-4" />
                  <span>无法计算睡眠时间（前一天未记录睡觉时间）</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
