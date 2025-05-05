"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon } from "lucide-react";

import { CheckInRecord } from "../types";

interface CheckInHistoryProps {
  records: CheckInRecord[];
}

export default function CheckInHistory({ records }: CheckInHistoryProps) {
  return (
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
                  <TableHead>类型</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.formattedDate}</TableCell>
                    <TableCell>{record.formattedTime}</TableCell>
                    <TableCell>
                      {record.type === 'morning' ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <Sun className="size-3 mr-1" />
                          起床
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          <Moon className="size-3 mr-1" />
                          睡觉
                        </Badge>
                      )}
                    </TableCell>
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
  );
}
