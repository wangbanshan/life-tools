# 生活工具集 - 早睡早起打卡应用

一个基于 Next.js App Router 构建的生活工具集应用，核心功能是睡眠周期记录工具。该应用使用 Supabase 进行数据存储和用户认证，支持 Google 和 GitHub OAuth 登录，并提供 PWA（渐进式Web应用）功能。

## 功能特点

- **OAuth 无密码登录**：通过 Google 和 GitHub 实现简便登录
- **用户资料**：展示用户头像和用户信息
- **睡眠周期记录**：记录入睡和起床时间，支持跨日睡眠
- **智能配对**：自动将睡眠开始和结束事件配对成完整周期
- **历史记录**：查看历史睡眠数据和统计信息
- **日历视图**：直观展示每日睡眠情况
- **PWA支持**：可安装到桌面，离线使用，原生应用体验

## PWA 功能

🚀 **安装到桌面**：支持添加到手机/电脑桌面，像原生App一样使用  
📱 **离线使用**：无网络时可查看已缓存的睡眠记录  
⚡ **快速启动**：从桌面图标直接启动，全屏体验  
🔄 **自动更新**：应用更新后自动获取最新版本  
📶 **网络状态检测**：智能提示网络状态变化  

详细安装和使用指南请查看：[PWA 使用指南](./PWA_GUIDE.md)

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

在 Supabase SQL 编辑器中执行以下 SQL 语句来创建必要的表和权限：

1. **创建 Profiles 表**：

```sql
-- 创建用户配置文件表
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- 启用行级安全策略
alter table public.profiles enable row level security;

-- 用户只能访问自己的配置文件
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 为新用户自动创建一个profile记录
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- 创建触发器以在新用户注册时创建profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

2. **创建睡眠记录表**：

```sql
-- 创建睡眠记录表
create table public.check_in_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  timestamp bigint not null,
  type text not null check (type in ('sleep_start', 'sleep_end')),
  created_at timestamp with time zone default now()
);

-- 添加外键约束
alter table public.check_in_records 
add constraint fk_check_in_records_user_id 
foreign key (user_id) references auth.users(id) on delete cascade;

-- 创建索引以提高查询性能
create index idx_check_in_records_user_id on public.check_in_records(user_id);
create index idx_check_in_records_timestamp on public.check_in_records(timestamp);
create index idx_check_in_records_user_timestamp on public.check_in_records(user_id, timestamp desc);

-- 启用行级安全策略
alter table public.check_in_records enable row level security;

-- 创建RLS策略 - 用户只能访问自己的记录
create policy "Users can view own check-in records" on public.check_in_records
  for select using (auth.uid() = user_id);

create policy "Users can insert own check-in records" on public.check_in_records
  for insert with check (auth.uid() = user_id);

create policy "Users can update own check-in records" on public.check_in_records
  for update using (auth.uid() = user_id);

create policy "Users can delete own check-in records" on public.check_in_records
  for delete using (auth.uid() = user_id);
```

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

## 开发指南

### 项目结构

```
life-tools/
├── public/                     # 静态资源
├── src/
│   ├── app/                    # 应用路由和页面
│   │   ├── auth/               # 认证相关路由
│   │   │   └── callback/       # OAuth 回调处理
│   │   ├── check-in/           # 睡眠记录功能页面
│   │   │   ├── components/     # 页面专用组件
│   │   │   ├── types.ts        # 类型定义
│   │   │   └── page.tsx        # 主页面
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
│       ├── supabase-server.ts  # 服务端 Supabase 客户端
│       └── utils.ts            # 工具函数
├── .env.local                  # 环境变量（本地）
├── components.json             # shadcn/ui 配置
├── next.config.ts              # Next.js 配置
├── package.json                # 项目依赖
├── tailwind.config.ts          # Tailwind CSS 配置
└── tsconfig.json               # TypeScript 配置
```

### 主要文件说明

- **`src/app/check-in/types.ts`**: 定义睡眠记录相关的 TypeScript 类型
- **`src/lib/stores/useAuthStore.ts`**: 用户认证和睡眠状态管理
- **`src/lib/hooks/useCheckInRecords.ts`**: 睡眠记录数据获取和处理逻辑

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
