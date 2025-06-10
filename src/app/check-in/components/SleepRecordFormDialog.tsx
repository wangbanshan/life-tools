"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SleepCycle } from "../types";

// Zod Schema 定义
const formSchema = z.object({
  startDate: z.date({
    required_error: "请选择入睡日期",
  }),
  startTime: z.string().min(1, "请选择入睡时间"),
  endDate: z.date({
    required_error: "请选择起床日期",
  }),
  endTime: z.string().min(1, "请选择起床时间"),
}).superRefine((data, ctx) => {
  // 跨字段验证：确保起床时间晚于入睡时间
  const startTimestamp = new Date(`${format(data.startDate, "yyyy-MM-dd")}T${data.startTime}`).getTime();
  const endTimestamp = new Date(`${format(data.endDate, "yyyy-MM-dd")}T${data.endTime}`).getTime();
  
  if (endTimestamp <= startTimestamp) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "起床时间必须晚于入睡时间",
      path: ["endTime"],
    });
  }
});

type FormData = z.infer<typeof formSchema>;

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
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: new Date(),
      startTime: "23:00",
      endDate: new Date(),
      endTime: "07:00",
    },
  });

  // 获取今天的日期，用于限制日期选择
  const today = new Date();

  // 当 record 或 isOpen 变化时，重置表单
  useEffect(() => {
    if (isOpen) {
      if (record) {
        // 编辑模式：用现有记录初始化表单
        const startDateTime = new Date(record.startTime);
        const endDateTime = record.endTime ? new Date(record.endTime) : new Date(record.startTime + 8 * 60 * 60 * 1000);
        
        form.reset({
          startDate: startDateTime,
          startTime: format(startDateTime, "HH:mm"),
          endDate: endDateTime,
          endTime: format(endDateTime, "HH:mm"),
        });
      } else {
        // 补录模式：设置默认值
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayMorning = new Date();
        todayMorning.setHours(7, 0, 0, 0);
        
        form.reset({
          startDate: yesterday,
          startTime: "23:00",
          endDate: todayMorning,
          endTime: "07:00",
        });
      }
    }
  }, [record, isOpen, form]);

  const handleFormSubmit = (values: FormData) => {
    // 合并日期和时间为时间戳
    const startTimestamp = new Date(`${format(values.startDate, "yyyy-MM-dd")}T${values.startTime}`).getTime();
    const endTimestamp = new Date(`${format(values.endDate, "yyyy-MM-dd")}T${values.endTime}`).getTime();

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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* 入睡日期和时间 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>入睡日期</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MM月dd日")
                            ) : (
                              <span>选择日期</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > today}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入睡时间</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 起床日期和时间 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>起床日期</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MM月dd日")
                            ) : (
                              <span>选择日期</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > today}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>起床时间</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        </Form>
      </DialogContent>
    </Dialog>
  );
} 