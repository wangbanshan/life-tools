'use client';

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { MonthlyTransactionSummary } from '../types';
import { useMemo } from 'react';

interface SpendingDistributionChartProps {
  data: MonthlyTransactionSummary | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

export default function SpendingDistributionChart({ data }: SpendingDistributionChartProps) {
  const pieChartData = useMemo(() => {
    if (!data?.categoryBreakdown) return [];
    return data.categoryBreakdown.map(item => ({
      name: item.category.name,
      value: item.amount,
      categoryId: item.category.id,
    }));
  }, [data]);

  if (!data || data.totalAmount === 0 || pieChartData.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">暂无消费数据</p>
      </div>
    );
  }

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Tooltip
            formatter={(value: number, name: string) => [`¥${value.toFixed(2)}`, name]}
          />
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={50}
            innerRadius={25}
            paddingAngle={1}
            dataKey="value"
            nameKey="name"
            stroke=""
            strokeWidth={0}
            isAnimationActive={false}
          >
            {pieChartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke=""
                strokeWidth={0}
                style={{ outline: 'none' }}
              />
            ))}
          </Pie>
          <Legend 
            iconSize={5} 
            wrapperStyle={{fontSize: '9px'}}
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 