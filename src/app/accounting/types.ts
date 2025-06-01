// 消费记录的基本类型
export interface Transaction {
  id: string;
  user_id: string;
  date: string; // 格式：yyyy-MM-dd
  amount: number;
  category: TransactionCategory;
  description?: string;
  created_at: string;
  updated_at?: string;
}

// 用于表单提交的消费记录类型
export interface CreateTransactionPayload {
  date: string;
  amount: number;
  category: TransactionCategory;
  description?: string;
}

// 用于更新的消费记录类型
export interface UpdateTransactionPayload {
  date?: string;
  amount?: number;
  category?: TransactionCategory;
  description?: string;
}

// 消费类型枚举
export type TransactionCategory = 
  | '餐饮'
  | '衣物'
  | '交通'
  | '日用'
  | '娱乐'
  | '居家'
  | '其他';

// 消费类型配置
export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  '餐饮',
  '衣物', 
  '交通',
  '日用',
  '娱乐',
  '居家',
  '其他'
];

// 每日消费汇总
export interface DailyTransactionSummary {
  date: string; // 格式：yyyy-MM-dd
  totalAmount: number;
  transactionCount: number;
  transactions: Transaction[];
}

// 月度消费汇总
export interface MonthlyTransactionSummary {
  year: number;
  month: number; // 1-12
  totalAmount: number;
  transactionCount: number;
  dailySummaries: DailyTransactionSummary[];
  categoryBreakdown: CategoryBreakdown[];
}

// 按类型分组的消费统计
export interface CategoryBreakdown {
  category: TransactionCategory;
  amount: number;
  count: number;
  percentage: number; // 占当月总消费的百分比
}

// 日历视图的日期数据
export interface CalendarDayData {
  date: string; // 格式：yyyy-MM-dd
  totalAmount: number;
  hasTransactions: boolean;
} 