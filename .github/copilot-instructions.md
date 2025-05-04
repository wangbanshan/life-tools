<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# 生活工具集项目

这是一个基于Next.js、TypeScript和shadcn/ui的"生活工具集"项目，当前实现了"早睡早起"打卡功能。

## 技术栈

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui组件库
- date-fns日期处理库

## 项目结构

- `/src/app/page.tsx` - 主页面，展示所有可用工具
- `/src/app/check-in/page.tsx` - 早睡早起打卡功能页面
- `/src/app/providers.tsx` - 全局客户端提供者组件
- `/src/components/ui/` - shadcn/ui组件

## 代码风格指南

- 使用TypeScript类型定义
- 使用函数组件和React Hooks
- 使用Tailwind CSS进行响应式设计
- 使用shadcn/ui组件库构建界面
- 中文界面，适合国内用户使用
