# 记账小助手功能

记账小助手是生活工具集的财务管理功能，帮助用户轻松记录日常消费，进行智能分类统计，掌控个人财务状况。

## 功能概述

### 核心特性
- **简洁记账**：快速记录日常消费，支持金额、分类、备注
- **智能分类**：预设 7 种消费类型，覆盖日常生活场景
- **日历视图**：直观查看每日消费情况和金额
- **数据统计**：月度消费汇总、分类统计、趋势分析
- **明细管理**：查看、删除消费记录，支持按日期筛选
- **实时更新**：数据实时同步，多端一致

### 消费分类系统

应用预设了 7 种消费类型，覆盖日常生活的主要开支：

| 分类 | 说明 | 示例 |
|------|------|------|
| 餐饮 | 食物、饮料等 | 早餐、午餐、晚餐、咖啡、零食 |
| 衣物 | 服装、鞋帽等 | 衣服、鞋子、包包、配饰 |
| 交通 | 出行相关费用 | 地铁、公交、打车、加油、停车 |
| 日用 | 生活用品 | 洗护用品、清洁用品、文具 |
| 娱乐 | 休闲娱乐消费 | 电影、游戏、旅行、健身 |
| 居家 | 家庭相关开支 | 房租、水电费、家具、装修 |
| 其他 | 未分类消费 | 医疗、教育、礼品等 |

## 用户界面

### 主要组件

1. **添加消费表单**
   - 金额输入（支持小数）
   - 消费类型选择
   - 日期选择（默认今天）
   - 备注信息（可选）

2. **消费日历**
   - 月度视图展示
   - 每日消费总额显示
   - 点击日期查看明细
   - 月份切换导航

3. **消费明细列表**
   - 按日期显示消费记录
   - 显示时间、类型、金额、备注
   - 支持删除操作
   - 当日消费汇总

4. **月度概览卡片**
   - 当月总消费金额
   - 消费记录笔数
   - 平均每日消费
   - 主要消费类型

## 使用指南

### 基本操作

1. **添加消费记录**
   ```
   1. 在左侧表单中输入消费金额
   2. 选择消费类型（必选）
   3. 选择消费日期（默认今天）
   4. 添加备注信息（可选）
   5. 点击"添加记录"按钮
   ```

2. **查看消费记录**
   ```
   1. 在日历中点击任意日期
   2. 右侧明细列表显示当日所有消费
   3. 查看消费时间、类型、金额、备注
   4. 底部显示当日消费汇总
   ```

3. **删除消费记录**
   ```
   1. 在消费明细列表中找到要删除的记录
   2. 点击红色垃圾桶图标
   3. 确认删除操作
   4. 记录被永久删除，统计数据自动更新
   ```

4. **查看月度统计**
   ```
   1. 页面顶部显示当月概览卡片
   2. 包含总金额、笔数、平均消费
   3. 显示主要消费类型
   4. 使用日历导航查看其他月份
   ```

### 数据展示规则

#### 日历视图
- **红色数字**：显示当日消费总额
- **无数字**：当日无消费记录
- **蓝色背景**：当前选中的日期
- **黄色背景**：今天的日期

#### 金额格式
- 统一使用人民币符号（¥）
- 保留两位小数显示
- 大额数字自动格式化

## 技术实现

### 数据模型

```typescript
interface Transaction {
  id: string;
  user_id: string;
  date: string;          // YYYY-MM-DD 格式
  amount: number;        // 消费金额，精确到分
  category: TransactionCategory;
  description?: string;  // 可选备注
  created_at: string;
  updated_at?: string;
}

type TransactionCategory = 
  | '餐饮' | '衣物' | '交通' | '日用' 
  | '娱乐' | '居家' | '其他';

interface DailyTransactionSummary {
  date: string;
  totalAmount: number;
  transactionCount: number;
  transactions: Transaction[];
}

interface MonthlyTransactionSummary {
  year: number;
  month: number;
  totalAmount: number;
  transactionCount: number;
  dailySummaries: DailyTransactionSummary[];
  categoryBreakdown: CategoryBreakdown[];
}
```

### 数据管理

使用 TanStack Query 进行数据状态管理：

```typescript
// 获取月度消费记录
const { data: transactions } = useMonthlyTransactions(year, month);

// 获取日度消费记录
const { data: dailyTransactions } = useDailyTransactions(date);

// 获取月度统计数据
const { data: monthlyStats } = useMonthlyStatistics(year, month);

// 添加消费记录
const addTransactionMutation = useAddTransaction();

// 删除消费记录
const deleteTransactionMutation = useDeleteTransaction();
```

### 核心组件

1. **AccountingForm** - 消费记录表单
   - 表单验证和提交
   - 默认值设置
   - 成功提示

2. **AccountingCalendar** - 消费日历视图
   - 月度数据展示
   - 日期选择交互
   - 消费金额显示

3. **AccountingList** - 消费明细列表
   - 数据表格展示
   - 删除确认对话框
   - 汇总信息显示

### 数据验证

#### 前端验证
```typescript
// 金额验证
const amountValidation = {
  required: '请输入消费金额',
  min: { value: 0.01, message: '金额必须大于 0' },
  max: { value: 999999.99, message: '金额不能超过 999,999.99' }
};

// 分类验证
const categoryValidation = {
  required: '请选择消费类型'
};
```

#### 后端验证
- 数据库约束确保数据完整性
- RLS 策略保证用户数据隔离
- 金额精度控制（DECIMAL(10,2)）

## 数据安全

### 行级安全策略（RLS）
```sql
-- 用户只能访问自己的消费记录
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

### 数据完整性
- 外键约束关联用户表
- 金额非负检查约束
- 分类枚举值验证
- 自动时间戳更新

## 性能优化

### 查询优化
```sql
-- 关键索引
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
```

### 缓存策略
- 月度数据缓存，减少重复查询
- 智能缓存失效，数据变更时自动更新
- 乐观更新，提升用户体验

### 分页加载
- 历史数据按月分页
- 避免一次性加载大量数据
- 按需加载，提升性能

## 统计分析

### 月度统计
- **总消费金额**：当月所有消费的总和
- **消费笔数**：当月消费记录的数量
- **平均每日消费**：总金额除以有消费的天数
- **主要消费类型**：消费金额最高的分类

### 分类统计
```typescript
interface CategoryBreakdown {
  category: TransactionCategory;
  amount: number;        // 该分类总金额
  count: number;         // 该分类记录数
  percentage: number;    // 占总消费的百分比
}
```

### 趋势分析（规划中）
- 月度消费趋势图表
- 分类消费占比饼图
- 每日消费波动曲线
- 同比环比分析

## 未来规划

### 功能扩展
- [ ] 预算设定和超支提醒
- [ ] 消费目标和计划
- [ ] 数据导出（Excel/CSV）
- [ ] 消费标签系统
- [ ] 定期消费模板
- [ ] 多账户支持

### 统计增强
- [ ] 可视化图表展示
- [ ] 消费趋势分析
- [ ] 智能消费建议
- [ ] 年度消费报告
- [ ] 分类消费对比

### 用户体验
- [ ] 快速记账模式
- [ ] 语音输入支持
- [ ] 拍照记录小票
- [ ] 消费提醒通知
- [ ] 深色模式优化

### 技术改进
- [ ] 离线数据同步
- [ ] 数据备份恢复
- [ ] 批量操作支持
- [ ] 性能监控优化
- [ ] 国际化支持 