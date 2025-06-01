# 生活工具集 - 早睡早起打卡应用

一个基于 Next.js App Router 构建的生活工具集应用，核心功能是睡眠周期记录工具。该应用使用 Supabase 进行数据存储和用户认证，支持 Google 和 GitHub OAuth 登录，并提供 PWA（渐进式Web应用）功能。

## 功能特点

- **OAuth 无密码登录**：通过 Google 和 GitHub 实现简便登录
- **用户资料**：展示用户头像和用户信息
- **早睡早起打卡**: 记录和管理睡眠周期，养成健康的作息习惯
- **记账小助手**：记录日常消费，智能分类统计
- **PWA支持**：可安装到桌面，离线使用，原生应用体验

## 技术栈

- **前端框架**：Next.js 15+ (App Router)
- **UI 组件库**：shadcn/ui + Tailwind CSS
- **状态管理**：Zustand
- **数据获取**：TanStack Query (React Query)
- **后端服务**：Supabase (PostgreSQL + Auth)
- **PWA支持**：@ducanh2912/next-pwa + Workbox
- **语言**：TypeScript
- **图标库**：Lucide React + React Icons
- **日期处理**：date-fns
- **通知系统**：Sonner

## 如何运行

### 前置条件

- Node.js 18.x 或更高版本
- Yarn 包管理器
- Supabase 账号和项目

### 安装步骤

1. 克隆仓库：

```bash
git clone <仓库地址>
cd life-tools
```

2. 安装依赖：

```bash
yarn install
```

3. 创建 `.env.local` 文件并添加环境变量：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=<你的Supabase项目URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<你的Supabase匿名密钥>
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
```

4. 设置数据库（见下方 Supabase 配置指南）

5. 启动开发服务器：

```bash
yarn dev
```

6. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## Supabase 配置指南

### 数据库设置

在 Supabase SQL 编辑器中执行 `database_migrations.sql` 文件中的 SQL 语句来创建必要的表和权限。

### OAuth 提供商配置

1. 在 Supabase 控制面板中，导航到 **认证 > 提供商**

2. **配置 Google OAuth**：
   - 在 [Google Cloud Console](https://console.cloud.google.com/) 创建 OAuth 客户端
   - 设置授权重定向 URI：`https://[你的项目ID].supabase.co/auth/v1/callback`
   - 复制客户端 ID 和密钥到 Supabase 设置中

3. **配置 GitHub OAuth**：
   - 在 [GitHub 开发者设置](https://github.com/settings/developers) 中创建新的 OAuth 应用
   - 设置授权回调 URL：`https://[你的项目ID].supabase.co/auth/v1/callback`
   - 复制客户端 ID 和密钥到 Supabase 设置中

### 行级安全策略（RLS）说明

应用使用 Supabase 的行级安全策略确保数据安全：
- 用户只能查看、创建、更新、删除自己的记录
- 所有数据库操作都经过身份验证和授权检查

## 部署到 Vercel

1. 在 [Vercel](https://vercel.com) 上导入项目
2. 添加环境变量（与 `.env.local` 中相同）
3. 部署应用
4. 更新 Supabase 项目的站点 URL 和重定向 URL 为生产环境域名

## 文档

详细的功能文档和技术说明请查看 [docs](./docs/) 文件夹：

- [早睡早起打卡功能](./docs/check-in.md) - 睡眠周期记录功能的详细说明
- [记账小助手功能](./docs/accounting.md) - 消费记录和财务管理功能说明
- [数据库设计](./docs/database.md) - 完整的数据库表结构和 SQL 语句
- [PWA 使用指南](./docs/pwa-guide.md) - 渐进式 Web 应用的安装和使用说明
- [部署指南](./docs/deployment.md) - 项目部署和环境配置指南

## 开发指南

### 项目结构

```
life-tools/
├── docs/                       # 功能文档
├── public/                     # 静态资源
├── src/
│   ├── app/                    # 应用路由和页面
│   │   ├── auth/               # 认证相关路由
│   │   ├── check-in/           # 睡眠记录功能页面
│   │   ├── accounting/         # 记账功能页面
│   │   ├── globals.css         # 全局样式
│   │   ├── layout.tsx          # 全局布局
│   │   ├── page.tsx            # 首页
│   │   └── providers.tsx       # 全局提供者
│   ├── components/             # 共享组件
│   │   ├── auth/               # 认证组件
│   │   └── ui/                 # UI 基础组件 (shadcn/ui)
│   └── lib/                    # 工具库
│       ├── hooks/              # 自定义 hooks
│       ├── stores/             # Zustand 状态管理
│       ├── supabase.ts         # Supabase 客户端
│       └── utils.ts            # 工具函数
├── database_migrations.sql     # 数据库迁移脚本
├── components.json             # shadcn/ui 配置
├── next.config.ts              # Next.js 配置
├── package.json                # 项目依赖
├── tailwind.config.ts          # Tailwind CSS 配置
└── tsconfig.json               # TypeScript 配置
```

### 开发命令

```bash
# 启动开发服务器
yarn dev

# 构建生产版本
yarn build

# 启动生产服务器
yarn start

# 代码检查
yarn lint
```

## 许可证

[MIT License](LICENSE)
