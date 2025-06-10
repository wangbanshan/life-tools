'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { useSleepAnalytics, DateRange } from '@/lib/hooks/useSleepAnalytics';
import LoadingSpinner from '@/components/ui/loading-spinner';
// lucide-react icons 已经不再使用

// 时间范围选项
const dateRangeOptions = [
  { value: '7days' as DateRange, label: '最近7天' },
  { value: '30days' as DateRange, label: '最近30天' },
  { value: 'thisMonth' as DateRange, label: '本月' },
  { value: 'lastMonth' as DateRange, label: '上月' },
];

// 图表配置 - 参考睡眠周期的颜色设计
const chartConfig = {
  duration: {
    label: '睡眠时长',
    color: 'hsl(217, 91%, 60%)', // shadcn官网的蓝色用于柱状图
  },
  sleepTime: {
    label: '入睡时间',
    color: 'hsl(217, 91%, 60%)', // 蓝色用于入睡时间
  },
  wakeTime: {
    label: '起床时间',
    color: 'hsl(142, 76%, 36%)', // 绿色用于起床时间
  },
} as const;



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
      sleepCycles?: Array<{
        startTime: string;
        endTime: string;
        duration: string;
      }>;
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
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 space-y-2 max-w-xs">
        <p className="font-medium text-sm">{`日期：${data.fullDate}`}</p>
        {data.duration > 0 ? (
          <>
            <p className="text-sm" style={{ color: chartConfig.duration.color }}>
              <span className="font-medium">睡眠时长：</span>
              {data.durationFormatted}
            </p>
            {data.sleepTimeFormatted && (
              <p className="text-sm" style={{ color: chartConfig.sleepTime.color }}>
                <span className="font-medium">入睡时间：</span>
                {data.sleepTimeFormatted}
              </p>
            )}
            {data.wakeTimeFormatted && (
              <p className="text-sm" style={{ color: chartConfig.wakeTime.color }}>
                <span className="font-medium">起床时间：</span>
                {data.wakeTimeFormatted}
              </p>
            )}
            
            {/* 显示多段睡眠详情 */}
            {data.sleepCycles && data.sleepCycles.length > 1 && (
              <div className="mt-2 pt-2 border-t border-muted">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  睡眠详情（{data.sleepCycles.length}段）：
                </p>
                {data.sleepCycles.map((cycle, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    第{index + 1}段：{cycle.startTime} - {cycle.endTime} ({cycle.duration})
                  </div>
                ))}
              </div>
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
    if (hourDecimal === null) return '--';
    const hours = Math.floor(hourDecimal);
    const minutes = Math.round((hourDecimal - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-2 bg-muted rounded-lg text-center">
          <div className="text-base font-bold" style={{ color: chartConfig.duration.color }}>
            {formatHours(statistics.averageDuration)}
          </div>
          <div className="text-xs text-muted-foreground">平均睡眠</div>
        </div>
              
        <div className="p-2 bg-muted rounded-lg text-center">
          <div className="text-base font-bold" style={{ color: chartConfig.duration.color }}>
            {statistics.totalSleepDays}天
          </div>
          <div className="text-xs text-muted-foreground">睡眠天数</div>
        </div>
        
        <div className="p-2 bg-muted rounded-lg text-center">
          <div className="text-base font-bold" style={{ color: chartConfig.duration.color }}>
            {formatTime(statistics.averageSleepTime)}
          </div>
          <div className="text-xs text-muted-foreground">平均入睡</div>
        </div>
        
        <div className="p-2 bg-muted rounded-lg text-center">
          <div className="text-base font-bold" style={{ color: chartConfig.duration.color }}>
            {formatTime(statistics.averageWakeTime)}
          </div>
          <div className="text-xs text-muted-foreground">平均起床</div>
        </div>
    </div>
  );
}

export default function SleepChart() {
  const [selectedRange, setSelectedRange] = useState<DateRange>('7days');
  const [isMobile, setIsMobile] = useState(false);
  const { chartData, statistics, isLoading, error } = useSleepAnalytics(selectedRange);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>睡眠数据分析</CardTitle>
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
          <CardTitle>睡眠数据分析</CardTitle>
          <CardDescription>可视化展示您的睡眠模式和趋势</CardDescription>
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
      <CardHeader className="pb-4">
        <div className="space-y-4">
          <div>
            <CardTitle>睡眠数据分析</CardTitle>
            <CardDescription className="mt-2">可视化展示您的睡眠模式和趋势</CardDescription>
          </div>
          
          {/* 时间范围选择按钮 - 移动端优化 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {dateRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedRange === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRange(option.value)}
                className="text-xs h-8"
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

        {/* 图表区域 - 移动端优化 */}
        <div className="h-[300px] md:h-[400px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ 
                  top: 20, 
                  right: isMobile ? 15 : 30, 
                  left: isMobile ? 10 : 20, 
                  bottom: isMobile ? 20 : 5 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                
                {/* X轴 - 日期 */}
                <XAxis 
                  dataKey="date" 
                  className="fill-muted-foreground"
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                
                {/* Y轴（左） - 睡眠时长 */}
                <YAxis 
                  yAxisId="duration"
                  domain={[0, 12]}
                  className="fill-muted-foreground"
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 35 : 45}
                />
                
                {/* Y轴（右） - 时间 */}
                <YAxis 
                  yAxisId="time"
                  orientation="right"
                  domain={[0, 24]}
                  ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]}
                  tickFormatter={(value) => `${value}:00`}
                  className="fill-muted-foreground"
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 35 : 45}
                />
                
                {/* 工具提示 */}
                <ChartTooltip content={<CustomTooltip />} />
                
                {/* 图例 - 移动端隐藏或简化 */}
                {!isMobile && (
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="line"
                  />
                )}
                
                {/* 渐变定义 */}
                <defs>
                  <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartConfig.duration.color} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={chartConfig.duration.color} stopOpacity={0.3} />
                  </linearGradient>
                </defs>

                {/* 柱状图 - 睡眠时长 */}
                <Bar
                  yAxisId="duration"
                  dataKey="duration"
                  name="睡眠时长 (小时)"
                  fill="url(#durationGradient)"
                  radius={[4, 4, 0, 0]}
                />
                
                {/* 折线图 - 入睡时间 */}
                <Line
                  yAxisId="time"
                  type="monotone"
                  dataKey="sleepTime"
                  name="入睡时间"
                  stroke="var(--color-sleepTime)"
                  strokeWidth={isMobile ? 1.5 : 2}
                  dot={{ r: isMobile ? 2 : 3 }}
                  connectNulls={false}
                />
                
                {/* 折线图 - 起床时间 */}
                <Line
                  yAxisId="time"
                  type="monotone"
                  dataKey="wakeTime"
                  name="起床时间"
                  stroke="var(--color-wakeTime)"
                  strokeWidth={isMobile ? 1.5 : 2}
                  dot={{ r: isMobile ? 2 : 3 }}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        
      </CardContent>
    </Card>
  );
} 