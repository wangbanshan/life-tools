# 早睡早起打卡功能

早睡早起打卡是生活工具集的核心功能，帮助用户记录和管理睡眠周期，养成健康的作息习惯。

## 功能概述

### 核心特性
- **睡眠周期记录**：记录入睡和起床时间
- **跨日睡眠支持**：支持晚上睡觉、第二天起床的自然睡眠模式
- **智能配对**：自动将睡眠开始和结束事件配对成完整周期
- **历史记录**：查看历史睡眠数据和统计信息
- **日历视图**：直观展示每日睡眠情况
- **实时状态**：显示当前睡眠状态（清醒/睡眠中）

### 用户界面
- **打卡表单**：一键记录睡觉/起床时间
- **日历组件**：月度睡眠记录可视化
- **历史记录**：详细的睡眠周期列表

## 使用指南

### 基本操作

1. **开始睡觉**
   - 点击"开始睡觉"按钮
   - 系统记录当前时间作为入睡时间
   - 状态变更为"睡眠中"

2. **结束睡觉（起床）**
   - 点击"结束睡觉"按钮
   - 系统记录当前时间作为起床时间
   - 自动计算睡眠时长
   - 状态变更为"清醒"

3. **查看记录**
   - 日历视图：点击日期查看当日睡眠情况
   - 历史记录：查看完整的睡眠周期列表
   - 统计信息：平均睡眠时长等数据

### 睡眠周期配对逻辑

系统采用智能配对算法，将睡眠开始和结束事件自动组合：

```typescript
// 配对规则
1. 一个 sleep_start 事件 + 一个 sleep_end 事件 = 一个完整睡眠周期
2. sleep_end 必须在 sleep_start 之后（支持跨日）
3. 未配对的事件显示为"进行中"或"未完成"状态
```

### 数据展示

#### 日历视图
- **绿色圆点**：有完整睡眠记录的日期
- **橙色圆点**：有未完成睡眠记录的日期
- **无标记**：无睡眠记录的日期

#### 历史记录
- **完整周期**：显示睡眠时长和时间段
- **进行中**：只有开始时间，正在睡眠
- **未完成**：只有结束时间，缺少开始记录

## 技术实现

### 数据模型

```typescript
interface CheckInRecord {
  id: string;
  user_id: string;
  timestamp: number;  // Unix 时间戳
  type: 'sleep_start' | 'sleep_end';
  created_at: string;
}

interface SleepCycle {
  id: string;
  startRecord: CheckInRecord;
  endRecord?: CheckInRecord;
  duration?: number;  // 睡眠时长（分钟）
  status: 'completed' | 'in_progress' | 'incomplete';
}
```

### 状态管理

使用 Zustand 管理睡眠状态：

```typescript
interface AuthStore {
  sleepStatus: 'awake' | 'sleeping';
  lastSleepStart: number | null;
  setSleepStatus: (status: 'awake' | 'sleeping') => void;
  setLastSleepStart: (timestamp: number | null) => void;
}
```

### 数据获取

使用 TanStack Query 管理数据：

```typescript
// 获取用户的打卡记录
const { data: records } = useCheckInRecords();

// 获取日期汇总记录
const { dailyRecords } = useDailyRecords();

// 添加打卡记录
const addRecordMutation = useAddCheckInRecord();
```

### 核心组件

1. **CheckInForm** - 打卡表单组件
2. **CheckInCalendar** - 日历视图组件
3. **CheckInHistory** - 历史记录组件

## 数据安全

### 行级安全策略（RLS）
- 用户只能访问自己的睡眠记录
- 所有数据库操作都经过身份验证
- 自动关联用户 ID，防止数据泄露

### 数据验证
- 时间戳格式验证
- 记录类型枚举验证
- 用户权限检查

## 性能优化

### 缓存策略
- 使用 React Query 缓存数据
- 智能失效和重新获取
- 乐观更新提升用户体验

### 数据库优化
- 用户 ID 和时间戳索引
- 分页查询大量历史数据
- 合理的查询范围限制

## 未来规划

### 功能扩展
- [ ] 睡眠质量评分
- [ ] 睡眠目标设定和提醒
- [ ] 睡眠数据导出
- [ ] 睡眠趋势分析图表
- [ ] 社交分享功能

### 技术改进
- [ ] 离线数据同步
- [ ] 推送通知提醒
- [ ] 数据备份和恢复
- [ ] 性能监控和优化 