'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { useSleepAnalytics, DateRange } from '@/lib/hooks/useSleepAnalytics';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Clock, BarChart3, Calendar, TrendingUp } from 'lucide-react';

// 时间范围选项
const dateRangeOptions = [
  { value: '7days' as DateRange, label: '最近7天' },
  { value: '30days' as DateRange, label: '最近30天' },
  { value: 'thisMonth' as DateRange, label: '本月' },
  { value: 'lastMonth' as DateRange, label: '上月' },
];

// 图表配置
const chartConfig = {
  duration: {
    label: '睡眠时长',
    color: 'hsl(var(--chart-1))',
  },
  sleepTime: {
    label: '入睡时间',
    color: 'hsl(var(--chart-2))',
  },
  wakeTime: {
    label: '起床时间',
    color: 'hsl(var(--chart-3))',
  },
} as const;

// Y轴刻度格式化函数
const formatYAxisTime = (tickItem: number) => {
  if (tickItem >= 24) return `${Math.floor(tickItem - 24)}:00`;
  if (tickItem >= 12) return `${Math.floor(tickItem)}:00`;
  if (tickItem >= 0) return `${Math.floor(tickItem)}:00`;
  return '';
};

// 时间轴刻度生成
const timeAxisTicks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];

// 自定义工具提示组件
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      fullDate: string;
      duration: number;
      durationFormatted: string;
      sleepTimeFormatted: string | null;
      wakeTimeFormatted: string | null;
    };
    name?: string;
    value?: number;
    color?: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 space-y-2">
        <p className="font-medium text-sm">{`日期：${data.fullDate}`}</p>
        {data.duration > 0 ? (
          <>
            <p className="text-sm text-chart-1">
              <span className="font-medium">睡眠时长：</span>
              {data.durationFormatted}
            </p>
            {data.sleepTimeFormatted && (
              <p className="text-sm text-chart-2">
                <span className="font-medium">入睡时间：</span>
                {data.sleepTimeFormatted}
              </p>
            )}
            {data.wakeTimeFormatted && (
              <p className="text-sm text-chart-3">
                <span className="font-medium">起床时间：</span>
                {data.wakeTimeFormatted}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">该日无睡眠记录</p>
        )}
      </div>
    );
  }
  return null;
}

// 统计卡片组件
interface StatisticsData {
  averageDuration: number;
  totalSleepDays: number;
  averageSleepTime: number | null;
  averageWakeTime: number | null;
}

function StatisticsCards({ statistics }: { statistics: StatisticsData }) {
  const formatHours = (hours: number) => {
    if (hours === 0) return '0小时';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`;
  };

  const formatTime = (hourDecimal: number | null) => {
    if (hourDecimal === null) return '无数据';
    const hours = Math.floor(hourDecimal);
    const minutes = Math.round((hourDecimal - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-muted/50 rounded-lg p-3 text-center">
        <div className="flex items-center justify-center mb-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium">平均睡眠</div>
        <div className="text-lg font-bold text-chart-1">
          {formatHours(statistics.averageDuration)}
        </div>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-3 text-center">
        <div className="flex items-center justify-center mb-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium">睡眠天数</div>
        <div className="text-lg font-bold text-chart-2">
          {statistics.totalSleepDays}天
        </div>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-3 text-center">
        <div className="flex items-center justify-center mb-1">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium">平均入睡</div>
        <div className="text-lg font-bold text-chart-3">
          {formatTime(statistics.averageSleepTime)}
        </div>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-3 text-center">
        <div className="flex items-center justify-center mb-1">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium">平均起床</div>
        <div className="text-lg font-bold text-chart-1">
          {formatTime(statistics.averageWakeTime)}
        </div>
      </div>
    </div>
  );
}

export default function SleepChart() {
  const [selectedRange, setSelectedRange] = useState<DateRange>('7days');
  const { chartData, statistics, isLoading, error } = useSleepAnalytics(selectedRange);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            睡眠数据分析
          </CardTitle>
          <CardDescription>可视化展示您的睡眠模式和趋势</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSpinner 
            size="md" 
            text="正在加载图表数据..." 
            className="min-h-[300px]"
          />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            睡眠数据分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 text-sm">加载图表数据失败，请稍后重试</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              睡眠数据分析
            </CardTitle>
            <CardDescription>可视化展示您的睡眠模式和趋势</CardDescription>
          </div>
          
          {/* 时间范围选择按钮 */}
          <div className="flex flex-wrap gap-2">
            {dateRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedRange === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRange(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 统计卡片 */}
        <StatisticsCards statistics={statistics} />

        {/* 图表区域 */}
        <div className="h-[400px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                
                {/* X轴 - 日期 */}
                <XAxis 
                  dataKey="date" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                
                {/* Y轴（左） - 睡眠时长 */}
                <YAxis 
                  yAxisId="duration"
                  domain={[0, 12]}
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                  label={{ value: '睡眠时长 (小时)', angle: -90, position: 'insideLeft' }}
                />
                
                {/* Y轴（右） - 时间 */}
                <YAxis 
                  yAxisId="time"
                  orientation="right"
                  domain={[0, 28]}
                  ticks={timeAxisTicks}
                  tickFormatter={formatYAxisTime}
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                  label={{ value: '时间', angle: 90, position: 'insideRight' }}
                />
                
                {/* 工具提示 */}
                <ChartTooltip content={<CustomTooltip />} />
                
                {/* 图例 */}
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="line"
                />
                
                {/* 柱状图 - 睡眠时长 */}
                <Bar
                  yAxisId="duration"
                  dataKey="duration"
                  name="睡眠时长 (小时)"
                  fill="var(--color-duration)"
                  radius={[2, 2, 0, 0]}
                  opacity={0.8}
                />
                
                {/* 折线图 - 入睡时间 */}
                <Line
                  yAxisId="time"
                  type="monotone"
                  dataKey="sleepTime"
                  name="入睡时间"
                  stroke="var(--color-sleepTime)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls={false}
                />
                
                {/* 折线图 - 起床时间 */}
                <Line
                  yAxisId="time"
                  type="monotone"
                  dataKey="wakeTime"
                  name="起床时间"
                  stroke="var(--color-wakeTime)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* 数据说明 */}
        {chartData.length > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <p className="mb-1">📊 <strong>图表说明：</strong></p>
            <ul className="space-y-1 ml-4">
              <li>• 柱状图显示每天的睡眠总时长</li>
              <li>• 折线图显示入睡和起床时间的变化趋势</li>
              <li>• 鼠标悬停可查看详细数据</li>
              <li>• 跨天睡眠归属于起床日期</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 