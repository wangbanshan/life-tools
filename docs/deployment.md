# 部署指南

本指南详细说明如何将生活工具集应用部署到生产环境，包括 Vercel 部署、Supabase 配置和环境变量设置。

## 部署概览

### 技术架构
- **前端**：Next.js 应用部署到 Vercel
- **后端**：Supabase 提供数据库和认证服务
- **CDN**：Vercel Edge Network 全球加速
- **域名**：支持自定义域名和 HTTPS

### 部署流程
1. Supabase 项目配置
2. 环境变量设置
3. Vercel 部署配置
4. 域名和 SSL 配置
5. 生产环境测试

## Supabase 配置

### 1. 创建 Supabase 项目

1. **注册 Supabase 账号**
   - 访问 [supabase.com](https://supabase.com)
   - 使用 GitHub 账号登录

2. **创建新项目**
   ```
   1. 点击 "New Project"
   2. 选择组织（个人或团队）
   3. 输入项目名称：life-tools
   4. 设置数据库密码（请妥善保存）
   5. 选择地区（推荐选择离用户最近的地区）
   6. 点击 "Create new project"
   ```

3. **等待项目初始化**
   - 项目创建需要 2-3 分钟
   - 初始化完成后进入项目控制台

### 2. 数据库设置

1. **执行 SQL 脚本**
   ```
   1. 进入 Supabase 控制台
   2. 点击左侧 "SQL Editor"
   3. 点击 "New query"
   4. 复制 docs/database.md 中的完整 SQL 脚本
   5. 粘贴到编辑器中
   6. 点击 "Run" 执行脚本
   ```

2. **验证表结构**
   ```
   1. 点击左侧 "Table Editor"
   2. 确认以下表已创建：
      - profiles
      - check_in_records  
      - transactions
   3. 检查 RLS 策略是否启用
   ```

### 3. 认证配置

1. **配置 OAuth 提供商**
   ```
   1. 点击左侧 "Authentication" > "Providers"
   2. 启用 Google 和 GitHub 提供商
   3. 配置各自的客户端 ID 和密钥
   ```

2. **Google OAuth 设置**
   ```
   1. 访问 Google Cloud Console
   2. 创建新项目或选择现有项目
   3. 启用 Google+ API
   4. 创建 OAuth 2.0 客户端 ID
   5. 设置授权重定向 URI：
      https://[项目ID].supabase.co/auth/v1/callback
   6. 复制客户端 ID 和密钥到 Supabase
   ```

3. **GitHub OAuth 设置**
   ```
   1. 访问 GitHub Settings > Developer settings
   2. 点击 "New OAuth App"
   3. 填写应用信息：
      - Application name: 生活工具集
      - Homepage URL: https://your-domain.com
      - Authorization callback URL: 
        https://[项目ID].supabase.co/auth/v1/callback
   4. 复制 Client ID 和 Client Secret 到 Supabase
   ```

### 4. 获取项目配置

在 Supabase 控制台获取以下信息：

```
1. 点击左侧 "Settings" > "API"
2. 记录以下信息：
   - Project URL
   - anon public key
   - service_role key（仅服务端使用）
```

## Vercel 部署

### 1. 准备代码仓库

1. **推送代码到 GitHub**
   ```bash
   # 初始化 Git 仓库（如果还没有）
   git init
   git add .
   git commit -m "Initial commit"
   
   # 添加远程仓库
   git remote add origin https://github.com/username/life-tools.git
   git push -u origin main
   ```

2. **确保项目结构正确**
   ```
   life-tools/
   ├── src/
   ├── public/
   ├── package.json
   ├── next.config.ts
   ├── tsconfig.json
   └── README.md
   ```

### 2. Vercel 部署配置

1. **连接 GitHub 仓库**
   ```
   1. 访问 vercel.com 并登录
   2. 点击 "New Project"
   3. 选择 GitHub 仓库
   4. 点击 "Import"
   ```

2. **配置项目设置**
   ```
   Project Name: life-tools
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: yarn build
   Output Directory: .next
   Install Command: yarn install
   ```

3. **设置环境变量**
   ```
   在 Vercel 项目设置中添加：
   
   NEXT_PUBLIC_SUPABASE_URL=https://[项目ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
   NEXT_PUBLIC_AUTH_REDIRECT_URL=https://[vercel-domain]/auth/callback
   ```

4. **部署项目**
   ```
   1. 点击 "Deploy"
   2. 等待构建完成（通常 2-3 分钟）
   3. 部署成功后获得临时域名
   ```

### 3. 自定义域名（可选）

1. **添加自定义域名**
   ```
   1. 在 Vercel 项目设置中点击 "Domains"
   2. 输入自定义域名
   3. 按照提示配置 DNS 记录
   ```

2. **DNS 配置示例**
   ```
   类型: CNAME
   名称: www
   值: cname.vercel-dns.com
   
   类型: A
   名称: @
   值: 76.76.19.61
   ```

3. **SSL 证书**
   - Vercel 自动提供免费 SSL 证书
   - 支持自动续期
   - 强制 HTTPS 重定向

## 环境变量配置

### 开发环境 (.env.local)

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://[项目ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback

# 可选：分析和监控
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=[analytics_id]
```

### 生产环境 (Vercel)

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://[项目ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
NEXT_PUBLIC_AUTH_REDIRECT_URL=https://[your-domain]/auth/callback

# 生产环境优化
NODE_ENV=production
```

### 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | https://abc123.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | eyJ0eXAiOiJKV1QiLCJhbGc... |
| `NEXT_PUBLIC_AUTH_REDIRECT_URL` | OAuth 回调 URL | https://app.com/auth/callback |

## 生产环境优化

### 1. 性能优化

1. **Next.js 配置优化**
   ```typescript
   // next.config.ts
   const nextConfig = {
     // 启用实验性功能
     experimental: {
       optimizeCss: true,
       optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
     },
     
     // 图片优化
     images: {
       domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
       formats: ['image/webp', 'image/avif']
     },
     
     // 压缩配置
     compress: true,
     
     // PWA 配置
     ...withPWA({
       dest: 'public',
       register: true,
       skipWaiting: true,
       runtimeCaching: [
         {
           urlPattern: /^https:\/\/[^\/]+\.supabase\.co\/.*/i,
           handler: 'NetworkFirst',
           options: {
             cacheName: 'supabase-cache',
             expiration: {
               maxEntries: 32,
               maxAgeSeconds: 24 * 60 * 60 // 24 hours
             }
           }
         }
       ]
     })
   };
   ```

2. **Bundle 分析**
   ```bash
   # 安装分析工具
   yarn add -D @next/bundle-analyzer
   
   # 分析 bundle 大小
   ANALYZE=true yarn build
   ```

### 2. 监控和分析

1. **Vercel Analytics**
   ```typescript
   // 在 app/layout.tsx 中添加
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

2. **错误监控**
   ```typescript
   // 可选：集成 Sentry
   import * as Sentry from '@sentry/nextjs';
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

### 3. SEO 优化

1. **Meta 标签优化**
   ```typescript
   // app/layout.tsx
   export const metadata = {
     title: '生活工具集 - 早睡早起打卡应用',
     description: '记录你的作息时间，养成健康的生活习惯',
     keywords: '睡眠记录,作息管理,健康生活,PWA应用',
     authors: [{ name: '生活工具集团队' }],
     openGraph: {
       title: '生活工具集',
       description: '记录你的作息时间，养成健康的生活习惯',
       url: 'https://your-domain.com',
       siteName: '生活工具集',
       images: [
         {
           url: 'https://your-domain.com/og-image.png',
           width: 1200,
           height: 630,
         }
       ],
       locale: 'zh_CN',
       type: 'website',
     },
     twitter: {
       card: 'summary_large_image',
       title: '生活工具集',
       description: '记录你的作息时间，养成健康的生活习惯',
       images: ['https://your-domain.com/twitter-image.png'],
     },
   };
   ```

2. **Sitemap 生成**
   ```typescript
   // app/sitemap.ts
   export default function sitemap() {
     return [
       {
         url: 'https://your-domain.com',
         lastModified: new Date(),
         changeFrequency: 'yearly',
         priority: 1,
       },
       {
         url: 'https://your-domain.com/check-in',
         lastModified: new Date(),
         changeFrequency: 'daily',
         priority: 0.8,
       },
       {
         url: 'https://your-domain.com/accounting',
         lastModified: new Date(),
         changeFrequency: 'daily',
         priority: 0.8,
       },
     ];
   }
   ```

## 部署后配置

### 1. 更新 Supabase 设置

1. **更新站点 URL**
   ```
   1. 在 Supabase 控制台进入 "Settings" > "General"
   2. 更新 "Site URL" 为生产域名
   3. 保存设置
   ```

2. **更新重定向 URL**
   ```
   1. 进入 "Authentication" > "URL Configuration"
   2. 更新 "Redirect URLs" 添加生产域名
   3. 格式：https://your-domain.com/auth/callback
   ```

### 2. OAuth 提供商更新

1. **Google OAuth**
   ```
   1. 在 Google Cloud Console 中
   2. 更新授权重定向 URI
   3. 添加生产域名的回调 URL
   ```

2. **GitHub OAuth**
   ```
   1. 在 GitHub OAuth App 设置中
   2. 更新 Homepage URL 和 Authorization callback URL
   3. 使用生产域名
   ```

### 3. 生产环境测试

1. **功能测试清单**
   ```
   □ 用户注册和登录
   □ Google OAuth 登录
   □ GitHub OAuth 登录
   □ 睡眠记录功能
   □ 消费记录功能
   □ PWA 安装功能
   □ 离线功能测试
   □ 响应式设计测试
   □ 性能测试
   ```

2. **性能检查**
   ```bash
   # 使用 Lighthouse 检查性能
   npx lighthouse https://your-domain.com --output html
   
   # 检查 PWA 评分
   npx lighthouse https://your-domain.com --preset=pwa
   ```

## 持续部署

### 1. 自动部署配置

Vercel 默认支持 Git 集成的自动部署：

```
1. 推送到 main 分支 → 自动部署到生产环境
2. 推送到其他分支 → 创建预览部署
3. Pull Request → 自动创建预览链接
```

### 2. 部署钩子

```typescript
// vercel.json
{
  "buildCommand": "yarn build",
  "outputDirectory": ".next",
  "installCommand": "yarn install",
  "functions": {
    "app/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/app/$1"
    }
  ]
}
```

### 3. 环境分离

```
开发环境: localhost:3000
预览环境: [branch-name]-[project].vercel.app  
生产环境: your-domain.com
```

## 故障排除

### 常见问题

1. **构建失败**
   ```
   问题：依赖安装失败
   解决：检查 package.json 和 yarn.lock 文件
   
   问题：TypeScript 错误
   解决：修复类型错误，确保 tsconfig.json 配置正确
   ```

2. **认证问题**
   ```
   问题：OAuth 回调失败
   解决：检查回调 URL 配置是否正确
   
   问题：Supabase 连接失败
   解决：验证环境变量和 RLS 策略
   ```

3. **PWA 问题**
   ```
   问题：无法安装 PWA
   解决：检查 manifest.json 和 Service Worker 配置
   
   问题：离线功能异常
   解决：检查缓存策略和网络配置
   ```

### 日志和调试

1. **Vercel 部署日志**
   ```
   1. 在 Vercel 控制台查看构建日志
   2. 检查运行时错误
   3. 查看函数执行日志
   ```

2. **浏览器调试**
   ```
   1. 打开开发者工具
   2. 检查 Console 错误
   3. 查看 Network 请求
   4. 检查 Application > Service Workers
   ```

## 维护和更新

### 定期维护任务

1. **依赖更新**
   ```bash
   # 检查过时的依赖
   yarn outdated
   
   # 更新依赖
   yarn upgrade-interactive
   ```

2. **安全更新**
   ```bash
   # 检查安全漏洞
   yarn audit
   
   # 修复安全问题
   yarn audit fix
   ```

3. **性能监控**
   - 定期检查 Lighthouse 评分
   - 监控 Core Web Vitals
   - 检查错误率和响应时间

### 备份策略

1. **代码备份**
   - GitHub 仓库自动备份
   - 定期创建 Release 标签

2. **数据备份**
   - Supabase 自动每日备份
   - 可手动创建备份快照

3. **配置备份**
   - 环境变量文档化
   - 部署配置版本控制 