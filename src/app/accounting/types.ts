// 消费记录的基本类型
export interface Transaction {
  id: string;
  user_id: string;
  date: string; // 格式：yyyy-MM-dd
  amount: number;
  category_id: string; // 改为引用transaction_categories表的id
  description?: string;
  created_at: string;
  updated_at?: string;
  // 关联的类型信息
  transaction_categories?: TransactionCategory;
}

// 用于表单提交的消费记录类型
export interface CreateTransactionPayload {
  date: string;
  amount: number;
  category_id: string; // 改为引用category_id
  description?: string;
}

// 用于更新的消费记录类型
export interface UpdateTransactionPayload {
  date?: string;
  amount?: number;
  category_id?: string; // 改为引用category_id
  description?: string;
}

// 消费类型数据结构
export interface TransactionCategory {
  id: string;
  user_id: string | null; // NULL表示系统预设类型
  name: string;
  icon?: string; // lucide-react图标名称
  color?: string; // 颜色信息
  is_preset: boolean; // 是否为系统预设
  created_at: string;
}

// 用于创建新消费类型的payload
export interface CreateCategoryPayload {
  name: string;
  icon?: string;
  color?: string;
}

// 用于更新消费类型的payload
export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
  color?: string;
}

// 消费类型枚举（保留向后兼容，但已弃用）
export type LegacyTransactionCategory = 
  | '餐饮'
  | '衣物'
  | '交通'
  | '日用'
  | '娱乐'
  | '居家'
  | '其他';

// 预设消费类型（保留向后兼容，但已弃用）
export const TRANSACTION_CATEGORIES: LegacyTransactionCategory[] = [
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
  category: TransactionCategory; // 改为完整的类型对象
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