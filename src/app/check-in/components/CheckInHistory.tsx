"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon } from "lucide-react";

import { DailyRecord } from "../types";

interface CheckInHistoryProps {
  dailyRecords: DailyRecord[];
}

export default function CheckInHistory({ dailyRecords }: CheckInHistoryProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>打卡历史</CardTitle>
      </CardHeader>
      <CardContent>
        {dailyRecords.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">暂无打卡记录，开始你的第一次打卡吧！</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>起床时间</TableHead>
                  <TableHead>睡觉时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyRecords.map((record) => (
                  <TableRow key={record.date}>
                    <TableCell className="font-medium">{record.date.replace(/-/g, '/')}</TableCell>
                    <TableCell>
                      {record.morning ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <Sun className="size-3 mr-1" />
                          {record.morning.formattedTime}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">未记录</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.evening ? (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          <Moon className="size-3 mr-1" />
                          {record.evening.formattedTime}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">未记录</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption className="pb-2">
                共 {dailyRecords.length} 天打卡记录
              </TableCaption>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
