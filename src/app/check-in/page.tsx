"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// 定义打卡记录的类型
interface CheckInRecord {
  id: string;
  timestamp: number;
  formattedDate: string;
  formattedTime: string;
}

export default function CheckInPage() {
  // 状态管理
  const [checkedInToday, setCheckedInToday] = useState<boolean>(false);
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  
  // 初始化：从localStorage加载数据
  useEffect(() => {
    // 确保代码在客户端执行
    if (typeof window !== "undefined") {
      // 加载历史记录
      const savedRecords = localStorage.getItem("checkInRecords");
      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords) as CheckInRecord[];
        setRecords(parsedRecords);
        
        // 检查今天是否已打卡
        checkIfCheckedInToday(parsedRecords);
      }
    }
  }, []);
  
  // 检查今天是否已打卡
  const checkIfCheckedInToday = (records: CheckInRecord[]) => {
    const today = new Date();
    const todayString = format(today, "yyyy-MM-dd");
    
    const checkedIn = records.some(record => {
      const recordDate = new Date(record.timestamp);
      return format(recordDate, "yyyy-MM-dd") === todayString;
    });
    
    setCheckedInToday(checkedIn);
  };
  
  // 打卡功能
  const handleCheckIn = () => {
    if (checkedInToday) {
      toast.error("今天已经打卡了！");
      return;
    }
    
    const now = new Date();
    const newRecord: CheckInRecord = {
      id: now.getTime().toString(),
      timestamp: now.getTime(),
      formattedDate: format(now, "yyyy年MM月dd日"),
      formattedTime: format(now, "HH:mm:ss")
    };
    
    // 更新状态并保存到localStorage
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    setCheckedInToday(true);
    localStorage.setItem("checkInRecords", JSON.stringify(updatedRecords));
    
    toast.success("打卡成功！继续保持早睡早起的好习惯！");
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center md:text-left">早睡早起打卡</h1>
      
      {/* 打卡卡片 */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            今日打卡
            <Badge variant={checkedInToday ? "default" : "outline"} className={cn(
              "ml-2",
              checkedInToday ? "bg-green-500 hover:bg-green-500" : ""
            )}>
              {checkedInToday ? "已打卡" : "未打卡"}
            </Badge>
          </CardTitle>
          <CardDescription>
            坚持早睡早起，养成健康生活习惯
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            打卡将记录当前时间，请确保在合适的时间进行打卡。
          </p>
          <Button 
            onClick={handleCheckIn} 
            disabled={checkedInToday}
            className="w-full md:w-auto"
            size="lg"
          >
            {checkedInToday ? "今日已打卡" : "立即打卡"}
          </Button>
        </CardContent>
      </Card>
      
      {/* 历史记录 */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>打卡历史</CardTitle>
          <CardDescription>
            查看你的打卡记录和坚持情况
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">暂无打卡记录，开始你的第一次打卡吧！</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日期</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.formattedDate}</TableCell>
                      <TableCell>{record.formattedTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableCaption>
                  共 {records.length} 条打卡记录
                </TableCaption>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            数据使用浏览器本地存储，清除浏览器数据会导致记录丢失
          </p>
        </CardFooter>
      </Card>
      
      {/* 通知组件 */}
      <Toaster />
    </div>
  );
}
