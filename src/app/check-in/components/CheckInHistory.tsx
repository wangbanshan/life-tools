"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sun, Moon, Download } from "lucide-react";

import { CheckInRecord } from "../types";

interface CheckInHistoryProps {
  records: CheckInRecord[];
}

export default function CheckInHistory({ records }: CheckInHistoryProps) {
  // 导出打卡历史数据为JSON
  const handleExportData = () => {
    try {
      // 创建一个Blob对象
      const dataStr = JSON.stringify(records, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });

      // 创建一个下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `打卡记录_${new Date().toISOString().split("T")[0]}.json`;

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("打卡记录导出成功！");
    } catch (error) {
      console.error("导出数据失败:", error);
      toast.error("导出数据失败，请重试！");
    }
  };
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
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <p className="text-sm text-muted-foreground">
          数据使用浏览器本地存储，清除浏览器数据会导致记录丢失
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={handleExportData}
          disabled={records.length === 0}
        >
          <Download className="size-4 mr-2" />
          导出数据
        </Button>
      </CardFooter>
    </Card>
  );
}
