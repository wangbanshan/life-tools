# 数据库设计

生活工具集应用使用 Supabase (PostgreSQL) 作为后端数据库，采用行级安全策略（RLS）确保数据安全。

## 数据库架构

### 表结构概览

| 表名 | 用途 | 主要字段 |
|------|------|----------|
| `profiles` | 用户配置文件 | id, username, avatar_url |
| `check_in_records` | 睡眠打卡记录 | user_id, timestamp, type |
| `transactions` | 消费记录 | user_id, date, amount, category |

## 表结构详细设计

### 1. profiles 表 - 用户配置文件

存储用户的基本信息和配置。

```sql
-- 创建用户配置文件表
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 启用行级安全策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的配置文件
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 为新用户自动创建一个profile记录
CREATE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器以在新用户注册时创建profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

**字段说明：**
- `id`: 用户唯一标识，关联 auth.users 表
- `username`: 用户名（可选）
- `avatar_url`: 头像 URL（可选）
- `updated_at`: 最后更新时间

### 2. check_in_records 表 - 睡眠打卡记录

存储用户的睡眠打卡记录，支持睡眠开始和结束事件。

```sql
-- 创建睡眠记录表
CREATE TABLE public.check_in_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  timestamp BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sleep_start', 'sleep_end')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 添加外键约束
ALTER TABLE public.check_in_records 
ADD CONSTRAINT fk_check_in_records_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 创建索引以提高查询性能
CREATE INDEX idx_check_in_records_user_id ON public.check_in_records(user_id);
CREATE INDEX idx_check_in_records_timestamp ON public.check_in_records(timestamp);
CREATE INDEX idx_check_in_records_user_timestamp ON public.check_in_records(user_id, timestamp DESC);

-- 启用行级安全策略
ALTER TABLE public.check_in_records ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略 - 用户只能访问自己的记录
CREATE POLICY "Users can view own check-in records" ON public.check_in_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-in records" ON public.check_in_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-in records" ON public.check_in_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-in records" ON public.check_in_records
  FOR DELETE USING (auth.uid() = user_id);
```

**字段说明：**
- `id`: 记录唯一标识
- `user_id`: 用户 ID，关联 auth.users 表
- `timestamp`: Unix 时间戳，记录打卡时间
- `type`: 记录类型，'sleep_start' 或 'sleep_end'
- `created_at`: 记录创建时间

### 3. transactions 表 - 消费记录

存储用户的消费记录，支持分类统计和查询。

```sql
-- 创建消费记录表
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL CHECK (category IN ('餐饮', '衣物', '交通', '日用', '娱乐', '居家', '其他')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 添加外键约束
ALTER TABLE public.transactions 
ADD CONSTRAINT fk_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 创建索引以提高查询性能
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON public.transactions(category);
CREATE INDEX idx_transactions_user_category ON public.transactions(user_id, category);

-- 创建复合索引用于月度查询
CREATE INDEX idx_transactions_user_month ON public.transactions(user_id, date) 
WHERE date >= CURRENT_DATE - INTERVAL '1 year';

-- 启用行级安全策略
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略 - 用户只能访问自己的消费记录
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- 创建自动更新 updated_at 字段的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON public.transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**字段说明：**
- `id`: 消费记录唯一标识
- `user_id`: 用户 ID，关联 auth.users 表
- `date`: 消费日期（YYYY-MM-DD 格式）
- `amount`: 消费金额，精确到分，非负数
- `category`: 消费类型，限定为预设的 7 种分类
- `description`: 消费备注（可选）
- `created_at`: 记录创建时间
- `updated_at`: 记录更新时间（自动维护）

## 数据安全策略

### 行级安全策略（RLS）

所有表都启用了 RLS，确保：
1. 用户只能访问自己的数据
2. 所有操作都经过身份验证
3. 防止数据泄露和越权访问

### 数据完整性约束

1. **外键约束**：确保数据关联的完整性
2. **检查约束**：验证数据格式和范围
3. **非空约束**：确保关键字段不为空
4. **唯一约束**：防止重复数据

### 索引优化

针对常用查询模式创建了优化索引：
- 用户 ID 索引：快速筛选用户数据
- 时间索引：支持按日期范围查询
- 复合索引：优化多条件查询
- 分类索引：支持分类统计查询

## 常用查询示例

### 1. 获取用户的睡眠记录

```sql
-- 获取最近 30 天的睡眠记录
SELECT * FROM check_in_records 
WHERE user_id = auth.uid() 
  AND timestamp >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days'))
ORDER BY timestamp DESC;
```

### 2. 获取月度消费统计

```sql
-- 获取当月消费统计
SELECT 
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  category,
  COUNT(*) as category_count
FROM transactions 
WHERE user_id = auth.uid() 
  AND date >= DATE_TRUNC('month', CURRENT_DATE)
  AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY category
ORDER BY SUM(amount) DESC;
```

### 3. 获取每日消费汇总

```sql
-- 获取当月每日消费汇总
SELECT 
  date,
  COUNT(*) as transaction_count,
  SUM(amount) as daily_total
FROM transactions 
WHERE user_id = auth.uid() 
  AND date >= DATE_TRUNC('month', CURRENT_DATE)
  AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY date
ORDER BY date DESC;
```

## 数据迁移和维护

### 备份策略

Supabase 提供自动备份功能：
- 每日自动备份
- 支持手动备份
- 可恢复到任意时间点

### 数据清理

定期清理策略（可选）：
```sql
-- 清理超过 2 年的睡眠记录（示例）
DELETE FROM check_in_records 
WHERE created_at < NOW() - INTERVAL '2 years';

-- 清理超过 5 年的消费记录（示例）
DELETE FROM transactions 
WHERE created_at < NOW() - INTERVAL '5 years';
```

### 性能监控

监控关键指标：
- 查询执行时间
- 索引使用情况
- 表大小增长
- 连接数和并发量

## 扩展规划

### 未来表结构扩展

1. **budgets 表** - 预算管理
```sql
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  period TEXT NOT NULL, -- 'monthly', 'yearly'
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

2. **sleep_goals 表** - 睡眠目标
```sql
CREATE TABLE public.sleep_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_sleep_hours INTEGER NOT NULL,
  target_bedtime TIME,
  target_wakeup_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 数据分析视图

创建分析视图简化复杂查询：
```sql
-- 月度消费分析视图
CREATE VIEW monthly_expense_analysis AS
SELECT 
  user_id,
  DATE_TRUNC('month', date) as month,
  category,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  AVG(amount) as avg_amount
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', date), category;
``` 