# life-tools

一个面向个人日常管理的轻量生活工具台，集中放置资产、订阅、共享账本和后续常用工具入口。

## 技术栈

- React
- Vite
- TypeScript
- TanStack Router
- TanStack Query
- Mantine
- @tabler/icons-react

## 项目结构

- `src/app`：应用入口、路由和 Mantine 主题。
- `src/features/auth`：登录、注册、账户菜单和认证上下文。
- `src/features/home`：首页、工具卡片、工具数据和功能预览。
- `src/features/subscriptions`：会员订阅、续费月历、站内提醒和支出估算。
- `src/lib/supabase`：Supabase client 和内部用户名映射。

## 产品入口

- 顶部：`life-tools` logo + 头像入口，不包含登录按钮。
- 账户入口：右上角头像支持 Supabase 用户名密码登录 / 注册 / 退出。
- 主视觉：用简洁标题说明产品定位，顶部区域保持紧凑。
- 工具入口：资产台账、订阅日历、共享账本、工具库。
- 桌面端：工具卡为横向长方形入口，宽屏 3 + 1 排布，第二行从左开始；中等宽度自动转 2 列。
- 移动端：工具卡 2 列布局，保持紧凑卡片比例，压缩 header、标题区和卡片间距。
- 工具交互：点击工具卡打开功能预览，后续接入真实数据和操作流程。
- 账户交互：点击头像打开账号菜单或登录弹窗，只填写用户名 + 密码；底层使用 Supabase Auth。

## Supabase 登录

- 前端只展示用户名和密码，不展示邮箱，不做确认密码。
- Supabase Auth 仍需要 email/password，因此内部使用 `<username>@<auth-email-domain>` 映射。
- 用户资料表和触发器 SQL 在 `supabase/migrations/20260702114548_create_profiles.sql`。
- 环境变量参考 `.env.example`，需要配置 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY` 和 `VITE_AUTH_EMAIL_DOMAIN`。
- Supabase 项目中需要关闭邮箱确认，否则注册后不会直接获得可用 session。

## 资产管理数据

- 前端已接入 `public.asset_accounts`。登录且 Supabase 配置存在时，资产账户会按当前用户 `user_id` 从数据库读取和保存。
- 资产管理需要登录；未登录进入 `/assets` 会先打开登录弹窗，不再展示本地 mock 数据。
- 资产账户表和 RLS SQL 在 `supabase/migrations/20260703134249_create_asset_accounts.sql`。
- profiles 安全补丁在 `supabase/migrations/20260703134358_harden_profiles_security.sql`。

## 订阅日历数据

- `/subscriptions` 提供固定周期会员订阅的月历、站内续费提醒、按币种支出估算和归档管理。
- 日期输入和月历使用 `@mantine/dates` 官方组件，移动端日期选择会切换为 Modal。
- 概览使用四项统计卡，移动端统计卡为 2×2；选中日期在桌面显示明细表格，在移动端显示紧凑列表。
- 常见会员优先使用 Tabler 品牌图标，没有可靠品牌图标时回退到分类图标或文字标识。
- 金额使用当前价格估算，不保存真实付款流水；本年预计使用自建 60s API 的最新汇率折算为人民币，失败时回退到原币种显示。
- 资产和订阅表单在移动端使用 16px 输入字号和动态视口 Drawer，避免 iOS 聚焦缩放后无法关闭。
- 订阅表、约束和按用户隔离的 RLS 在 `supabase/migrations/20260710151737_create_subscriptions.sql`。
- 订阅表的最小权限补丁在 `supabase/migrations/20260710160518_harden_subscriptions_privileges.sql`。

## 视觉实现说明

- 不增加右侧摘要/统计卡片；首页只负责进入功能。
- 图标使用 `@tabler/icons-react`。
- Logo 拆成 icon-only SVG + HTML 文本字标。
- 图标背景不使用切图，使用 CSS 渐变、内阴影和轻边框实现；icon tile 已调成更方正的圆角矩形，桌面卡片为图标左、文字中、箭头右下的横向结构。
- 阶段记录放在 `docs/STATUS.md`，设计验收记录放在 `docs/design-qa.md`。

## 本地开发

```bash
npm install
npm run dev
```

默认本地地址：

```text
http://127.0.0.1:5173/
```

## 自动部署

仓库包含 GitHub Actions workflow：`.github/workflows/deploy-cloudflare-pages.yml`。

推送 `main` 后会执行：

```bash
npm ci
npm run build
npx wrangler@4 pages deploy dist --project-name life-tools --branch main --commit-dirty=true
```

需要在 GitHub 仓库配置这些 Actions secrets：

```text
CLOUDFLARE_ACCOUNT_ID=<your Cloudflare Account ID>
CLOUDFLARE_API_TOKEN=<Cloudflare Pages deploy token>
VITE_SUPABASE_URL=<your Supabase Project URL>
VITE_SUPABASE_KEY=<Supabase publishable key>
VITE_AUTH_EMAIL_DOMAIN=<internal auth email domain>
```

## 验收

常用检查：

```bash
npm test
npm run build
```
