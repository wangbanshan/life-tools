'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyTransactionSummary } from '../types';
import { useMemo } from 'react';

interface SpendingTrendChartProps {
  data: MonthlyTransactionSummary | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

export default function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  const barChartData = useMemo(() => {
    if (!data?.dailySummaries) return [];
    return data.dailySummaries
      .map(day => ({
        date: new Date(day.date).getDate().toString(), // 只显示日期数字
        totalAmount: day.totalAmount,
      }))
      .sort((a, b) => parseInt(a.date) - parseInt(b.date)); // 按日期升序
  }, [data]);

  if (!data || data.totalAmount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>消费趋势</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">暂无消费数据以生成图表</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>消费趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `¥${value}`} />
              <Tooltip
                cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }}
                formatter={(value: number) => [`¥${value.toFixed(2)}`, "消费金额"]}
                labelFormatter={(label) => `当月 ${label} 号`}
              />
              <Bar dataKey="totalAmount" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 