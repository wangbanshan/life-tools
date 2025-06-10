"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SleepCycle } from "../types";

interface SleepRecordFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  record?: SleepCycle;
  onSubmit: (data: { startTime: number; endTime: number }) => void;
  isSubmitting: boolean;
}

export default function SleepRecordFormDialog({
  isOpen,
  onOpenChange,
  record,
  onSubmit,
  isSubmitting
}: SleepRecordFormDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // 获取今天的日期字符串，用于限制日期选择
  const today = format(new Date(), "yyyy-MM-dd");

  // 当record prop变化时，初始化表单
  useEffect(() => {
    if (record) {
      // 编辑模式：用现有记录初始化表单
      const startDateTime = new Date(record.startTime);
      setStartDate(format(startDateTime, "yyyy-MM-dd"));
      setStartTime(format(startDateTime, "HH:mm"));

      if (record.endTime) {
        const endDateTime = new Date(record.endTime);
        setEndDate(format(endDateTime, "yyyy-MM-dd"));
        setEndTime(format(endDateTime, "HH:mm"));
      } else {
        // 如果没有结束时间，默认设置为第二天早上
        const defaultEndTime = new Date(record.startTime + 8 * 60 * 60 * 1000); // 默认睡8小时
        setEndDate(format(defaultEndTime, "yyyy-MM-dd"));
        setEndTime(format(defaultEndTime, "HH:mm"));
      }
    } else {
      // 补录模式：设置默认值
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // 默认昨晚11点睡觉
      yesterday.setHours(23, 0, 0, 0);
      setStartDate(format(yesterday, "yyyy-MM-dd"));
      setStartTime("23:00");

      // 默认今天早上7点起床
      const today = new Date();
      today.setHours(7, 0, 0, 0);
      setEndDate(format(today, "yyyy-MM-dd"));
      setEndTime("07:00");
    }
  }, [record, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 合并日期和时间字符串为时间戳
    const startTimestamp = new Date(`${startDate}T${startTime}`).getTime();
    const endTimestamp = new Date(`${endDate}T${endTime}`).getTime();

    // 验证时间合理性
    if (endTimestamp <= startTimestamp) {
      alert("起床时间必须晚于入睡时间");
      return;
    }

    onSubmit({
      startTime: startTimestamp,
      endTime: endTimestamp
    });
  };

  const isEditing = !!record;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "编辑睡眠记录" : "补录睡眠记录"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "修改已有睡眠记录的时间" 
              : "为遗漏的日期补录睡眠记录"
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">入睡日期</Label>
              <Input
                id="start-date"
                type="date"
                max={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time">入睡时间</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="end-date">起床日期</Label>
              <Input
                id="end-date"
                type="date"
                max={today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">起床时间</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? "保存中..." 
                : (isEditing ? "保存更改" : "创建记录")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 