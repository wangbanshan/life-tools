# 记账小助手功能说明

记账小助手是一个功能完善的个人财务管理工具，帮助用户轻松记录和分析日常消费。

## 核心功能

### 1. 消费记录管理

#### 添加消费记录
- **快速录入**：简洁的表单设计，支持日期、金额、类型、备注
- **智能验证**：实时验证输入数据，确保记录准确性
- **即时反馈**：添加成功后自动刷新相关数据

#### 消费记录列表
- **日期筛选**：按日期查看特定日期的消费记录
- **详细信息**：显示时间、类型、金额、备注等完整信息
- **安全删除**：使用现代化确认弹窗，避免误删操作

### 2. 自定义消费类型系统

#### 系统预设类型
- 餐饮 🍽️ (红色)
- 衣物 👕 (紫色)
- 交通 🚗 (青色)
- 日用 🛒 (绿色)
- 娱乐 🎮 (黄色)
- 居家 🏠 (蓝色)
- 其他 ⋯ (灰色)

#### 用户自定义类型
- **个性化创建**：用户可以创建专属的消费类型
- **图标选择**：从18种精美图标中选择，包括学习、健康、旅行等
- **颜色定制**：9种预设颜色，打造个性化视觉体验
- **灵活管理**：支持删除自定义类型（系统预设类型不可删除）

#### 类型管理界面
- **统一管理**：在一个弹窗中管理所有消费类型
- **直观展示**：图标 + 名称 + 标签的清晰展示
- **快速操作**：统一的添加/编辑对话框，操作简单高效
- **表单验证**：使用 react-hook-form + zod 进行实时验证和错误提示
- **技术栈统一**：与添加记录表单使用相同的技术栈和设计模式

### 3. 数据统计与分析

#### 月度概览
- **总消费金额**：当月累计消费统计
- **消费笔数**：记录频次统计
- **平均每日消费**：消费习惯分析
- **主要消费类型**：最大支出类别识别

#### 日历视图
- **可视化展示**：在日历上直观显示每日消费情况
- **快速导航**：点击日期快速查看当日详细记录
- **月份切换**：轻松浏览不同月份的消费数据

#### 类型分布统计
- **按类型汇总**：各消费类型的金额和笔数统计
- **百分比分析**：了解各类型在总消费中的占比
- **排序展示**：按消费金额降序排列，突出重点

## 技术特性

### 数据安全
- **行级安全策略（RLS）**：确保用户只能访问自己的数据
- **数据完整性**：外键约束保证数据关联的正确性
- **备份机制**：数据迁移时自动备份原有数据

### 用户体验
- **响应式设计**：完美适配桌面、平板、手机等设备
- **实时更新**：使用 TanStack Query 实现数据的实时同步
- **加载状态**：优雅的加载动画和状态提示
- **错误处理**：友好的错误提示和恢复机制

### 性能优化
- **智能缓存**：合理的缓存策略减少不必要的网络请求
- **按需加载**：组件和数据的懒加载优化
- **索引优化**：数据库索引提升查询性能

### 代码架构
- **组件复用**：统一的表单组件和对话框组件
- **常量管理**：集中的常量文件，便于维护和扩展
- **技术栈统一**：react-hook-form + zod 验证 + shadcn-ui 组件
- **代码分离**：清晰的关注点分离，提高可维护性

## 数据库设计

### 核心表结构

#### transaction_categories 表
```sql
- id: UUID (主键)
- user_id: UUID (外键，NULL表示系统预设)
- name: TEXT (类型名称)
- icon: TEXT (Lucide React图标名称)
- color: TEXT (十六进制颜色值)
- is_preset: BOOLEAN (是否为系统预设)
- created_at: TIMESTAMP (创建时间)
```

#### transactions 表
```sql
- id: UUID (主键)
- user_id: UUID (外键)
- date: DATE (消费日期)
- amount: DECIMAL (消费金额)
- category_id: UUID (外键关联消费类型)
- description: TEXT (备注说明)
- created_at: TIMESTAMP (创建时间)
```

### 权限控制
- 用户可读取所有预设类型和自己的自定义类型
- 用户只能创建、修改、删除自己的自定义类型
- 用户只能管理自己的消费记录

## 使用指南

### 基本操作流程

1. **添加消费记录**
   - 选择消费日期（默认今天）
   - 输入消费金额
   - 选择消费类型
   - 添加备注（可选）
   - 点击"添加消费记录"

2. **管理消费类型**
   - 在添加记录表单中点击"管理"按钮
   - 查看现有的系统预设和自定义类型
   - 点击"添加类型"创建新的自定义类型
   - 为自定义类型选择图标和颜色
   - 删除不需要的自定义类型

3. **查看统计数据**
   - 在月度概览卡片中查看整体统计
   - 使用日历视图浏览不同日期的消费
   - 在消费明细中查看具体记录

### 最佳实践

1. **合理分类**：根据个人消费习惯创建有意义的类型分类
2. **及时记录**：养成消费后立即记录的习惯
3. **定期回顾**：利用统计功能定期分析消费模式
4. **备注详细**：为重要消费添加详细备注便于后续查询

## 更新日志

### v2.0.0 (最新)
- ✨ 新增自定义消费类型功能
- 🎨 支持图标和颜色个性化定制
- 🔒 使用 AlertDialog 替代浏览器默认确认框
- 📊 优化数据统计和展示
- 🗃️ 重构数据库结构，提升性能和扩展性
- 🛡️ 增强数据安全和权限控制

### v1.0.0
- 📝 基础消费记录功能
- 📅 日历视图和日期筛选
- 📊 基础统计功能
- 🔐 用户认证和数据隔离 