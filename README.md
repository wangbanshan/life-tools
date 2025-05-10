# 生活工具集 - 早睡早起打卡应用

一个基于 Next.js App Router 构建的生活工具集应用，核心功能是早睡早起打卡工具。该应用使用 Supabase 进行数据存储和用户认证，支持 Google 和 GitHub OAuth 登录。

## 功能特点

- **OAuth 无密码登录**：通过 Google 和 GitHub 实现简便登录
- **用户资料**：展示用户头像和用户信息
- **早起打卡**：记录每日起床时间
- **睡觉打卡**：记录每日睡觉时间
- **历史记录**：查看历史打卡数据
- **日历视图**：直观展示打卡情况

## 技术栈

- **前端框架**：Next.js 14+ (App Router)
- **UI 组件库**：shadcn/ui + Tailwind CSS
- **状态管理**：Zustand
- **数据获取**：TanStack Query (React Query)
- **后端服务**：Supabase (PostgreSQL + Auth)
- **语言**：TypeScript

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

```
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=<你的Supabase项目URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<你的Supabase匿名密钥>
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
```

4. 启动开发服务器：

```bash
yarn dev
```

5. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## Supabase 配置指南

### 数据库设置

在 Supabase SQL 编辑器中执行以下 SQL 语句来创建必要的表和权限：

1. **创建 Profiles 表**：

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text,
  avatar_url text,
  updated_at timestamp with time zone
);

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

2. **创建打卡记录表**：

```sql
create table public.check_in_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles not null,
  timestamp bigint not null,
  type text check (type in ('morning', 'evening')) not null,
  created_at timestamp with time zone default now() not null
);

-- 创建索引以提高查询性能
create index check_in_records_user_id_idx on public.check_in_records (user_id);
create index check_in_records_timestamp_idx on public.check_in_records (timestamp);

-- 设置行级安全策略
alter table public.check_in_records enable row level security;

-- 用户只能访问自己的记录
create policy "Users can view their own check-in records"
  on public.check_in_records for select
  using (auth.uid() = user_id);

create policy "Users can insert their own check-in records"
  on public.check_in_records for insert
  with check (auth.uid() = user_id);
```

### OAuth 提供商配置

1. 在 Supabase 控制面板中，导航到 **认证 > 提供商**

2. **配置 Google OAuth**：
   - 在 Google Cloud Console 创建 OAuth 客户端
   - 设置授权重定向 URI：`https://[你的项目ID].supabase.co/auth/v1/callback`
   - 复制客户端 ID 和密钥到 Supabase 设置中

3. **配置 GitHub OAuth**：
   - 在 GitHub 开发者设置中创建新的 OAuth 应用
   - 设置授权回调 URL：`https://[你的项目ID].supabase.co/auth/v1/callback`
   - 复制客户端 ID 和密钥到 Supabase 设置中

## 部署到 Vercel

1. 在 Vercel 上导入项目
2. 添加环境变量（与 `.env.local` 中相同）
3. 部署应用
4. 更新 Supabase 项目的站点 URL 和重定向 URL 为生产环境域名

## 项目结构

```
life-tools/
├── public/             # 静态资源
├── src/
│   ├── app/            # 应用路由和页面
│   │   ├── auth/       # 认证相关路由
│   │   ├── check-in/   # 打卡功能页面
│   │   ├── layout.tsx  # 全局布局
│   │   └── providers.tsx # 全局提供者
│   ├── components/     # 共享组件
│   │   ├── auth/       # 认证组件
│   │   └── ui/         # UI 基础组件
│   └── lib/            # 工具库
│       ├── hooks/      # 自定义 hooks
│       ├── stores/     # Zustand 状态管理
│       ├── supabase.ts # Supabase 客户端
│       └── supabase-server.ts # 服务端 Supabase 客户端
├── .env.local          # 环境变量（本地）
└── package.json        # 项目依赖
```

## 许可证

[MIT License](LICENSE)
