# 生活工具集

一个实用的生活工具集合网站，旨在提供多种有用的日常功能，帮助用户养成良好的生活习惯。

## 功能特点

目前已实现功能：

- **早睡早起打卡**：帮助用户养成良好的睡眠习惯，提供打卡记录和历史查看

未来计划功能：

- 待办事项清单
- 习惯追踪
- 健康数据记录
- 更多实用工具...

## 技术栈

- **前端框架**: Next.js 14 (App Router) + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI组件**: shadcn/ui
- **数据处理**: date-fns (日期处理)
- **数据存储**: localStorage (客户端本地存储)

## 快速开始

克隆项目并安装依赖：

```bash
git clone [repository-url]
cd life-tools
npm install
```

启动开发服务器：

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 响应式设计

本项目采用完全响应式设计，在手机、平板和桌面设备上都有良好的用户体验：

- 使用Tailwind CSS的响应式修饰符 (sm:, md:, lg:) 适配不同屏幕尺寸
- 为移动设备优化的布局和交互
- shadcn/ui组件自适应各种屏幕尺寸

## 开发与贡献

欢迎贡献新功能或改进现有功能。请遵循以下步骤：

1. Fork本项目
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个Pull Request
