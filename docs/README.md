# 生活工具集 - 功能文档

本文件夹包含生活工具集应用的详细功能文档和技术说明。

## 文档目录

- [早睡早起打卡功能](./check-in.md) - 睡眠周期记录功能的详细说明
- [记账小助手功能](./accounting.md) - 消费记录和财务管理功能说明
- [数据库设计](./database.md) - 完整的数据库表结构和 SQL 语句
- [PWA 使用指南](./pwa-guide.md) - 渐进式 Web 应用的安装和使用说明
- [部署指南](./deployment.md) - 项目部署和环境配置指南
- [UI 改进](./ui-improvements.md) - Loading 状态和骨架屏实现说明

## 快速导航

### 功能特性
- **OAuth 无密码登录**：通过 Google 和 GitHub 实现简便登录
- **睡眠周期记录**：记录入睡和起床时间，支持跨日睡眠
- **智能消费记录**：预设分类的消费记录和统计分析
- **PWA 支持**：可安装到桌面，离线使用

### 技术栈
- **前端**：Next.js 15+ (App Router) + TypeScript
- **UI**：shadcn/ui + Tailwind CSS
- **状态管理**：Zustand + TanStack Query
- **后端**：Supabase (PostgreSQL + Auth)
- **PWA**：@ducanh2912/next-pwa + Workbox

### 开发环境要求
- Node.js 18.x 或更高版本
- Yarn 包管理器
- Supabase 账号和项目

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！请确保：

1. 遵循现有的代码风格和约定
2. 添加适当的类型定义和注释
3. 更新相关文档
4. 测试新功能的兼容性

## 许可证

[MIT License](../LICENSE) 