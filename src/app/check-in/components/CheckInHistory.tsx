"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { format } from "date-fns";
import { Moon, Clock, AlertCircle } from "lucide-react";

import { DailyRecord } from "../types";

interface CheckInHistoryProps {
  dailyRecords: DailyRecord[];
}

export default function CheckInHistory({ dailyRecords }: CheckInHistoryProps) {

  // 展平所有睡眠周期以便在表格中显示
  const allSleepCycles = dailyRecords.flatMap(daily => 
    daily.sleepCycles.map(cycle => ({
      ...cycle,
      date: daily.date
    }))
  );

  // 按开始时间降序排序
  const sortedCycles = allSleepCycles.sort((a, b) => b.startTime - a.startTime);



  // 计算统计信息
  const completedCycles = sortedCycles.filter(cycle => cycle.isCompleted);
  const incompleteCycles = sortedCycles.filter(cycle => !cycle.isCompleted);

  return (
    <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>睡眠历史</CardTitle>
              <CardDescription>
                查看你的睡眠记录和睡眠质量统计
              </CardDescription>
            </div>

          </div>
        </CardHeader>
        <CardContent>
          {sortedCycles.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">暂无睡眠记录，开始记录你的第一次睡眠吧！</p>
          ) : (
            <>
              {/* 统计信息 */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="text-lg font-bold text-primary">{sortedCycles.length}</div>
                  <div className="text-xs text-muted-foreground">总睡眠记录</div>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="text-lg font-bold text-green-600">{completedCycles.length}</div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">完整睡眠周期</div>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="text-lg font-bold text-amber-600">{incompleteCycles.length}</div>
                  <div className="text-xs text-muted-foreground">未完成记录</div>
                </div>
              </div>

              {/* 睡眠记录表格 */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead>入睡时间</TableHead>
                      <TableHead>起床时间</TableHead>
                      <TableHead>睡眠时长</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCycles.map((cycle) => (
                      <TableRow key={cycle.id_start}>
                        <TableCell className="font-medium">
                          {cycle.date}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Moon className="size-3 text-blue-500" />
                            {format(new Date(cycle.startTime), "HH:mm")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {cycle.isCompleted && cycle.endTime ? (
                            <div className="flex items-center gap-2">
                              <Clock className="size-3 text-green-500" />
                              {format(new Date(cycle.endTime), "HH:mm")}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {cycle.duration || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {cycle.isCompleted ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                              <Clock className="size-3 mr-1" />
                              已完成
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                              <AlertCircle className="size-3 mr-1" />
                              进行中
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableCaption className="mb-2">
                    共 {sortedCycles.length} 条睡眠记录，其中 {completedCycles.length} 条已完成
                  </TableCaption>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
  );
}
