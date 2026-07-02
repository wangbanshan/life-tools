# life-tools

一个个人自用的生活工具站首页原型。当前阶段只做前端：首页视觉、响应式适配、工具入口和占位交互。

## 技术栈

- React
- Vite
- TypeScript
- TanStack Router
- TanStack Query
- Mantine
- @tabler/icons-react

## 当前首页

- 顶部：`life-tools` logo + 头像入口，不包含登录按钮。
- 账户入口：右上角头像支持 Supabase 用户名密码登录 / 注册 / 退出。
- 主视觉：标题和副标题，顶部区域保持紧凑。
- 工具入口：资产管理、订阅管理、共享账本、更多工具。
- 桌面端：工具卡为横向长方形入口，宽屏 3 + 1 排布，第二行从左开始；中等宽度自动转 2 列。
- 移动端：工具卡 2 列布局，保持紧凑卡片比例，压缩 header、标题区和卡片间距。
- 占位交互：点击工具卡打开 Mantine Modal。
- 登录交互：点击头像打开 Mantine Modal，只填写用户名 + 密码；底层使用 Supabase Auth。

## Supabase 登录

- 前端只展示用户名和密码，不展示邮箱，不做确认密码。
- Supabase Auth 仍需要 email/password，因此内部使用 `<username>@life-tools.local` 映射。
- 用户资料表和触发器 SQL 在 `supabase/migrations/202607020001_create_profiles.sql`。
- 环境变量参考 `.env.example`，需要配置 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。
- Supabase 项目中需要关闭邮箱确认，否则注册后不会直接获得可用 session。

## 视觉实现说明

- 不增加右侧摘要/统计卡片；首页只负责进入功能。
- 图标使用 `@tabler/icons-react`。
- Logo 拆成 icon-only SVG + HTML 文本字标：`life-tools-logo.svg` 只包含房子图标，`life-tools` 由 CSS 控制字号、字重和间距，避免 SVG 字体/裁切问题。
- 图标背景不使用切图，使用 CSS 渐变、内阴影和轻边框实现；icon tile 已调成更方正的圆角矩形，桌面卡片为图标左、文字中、箭头右下的横向结构。
- 参考视觉稿保存在：`design-reference-home-v2.png`。

## 本地开发

```bash
npm install
npm run dev
```

默认本地地址：

```text
http://127.0.0.1:5173/
```

## 固定预览地址

当前已使用 systemd user service 常驻运行 Vite：

```text
life-tools-vite.service -> http://127.0.0.1:5173/
```

Nginx 已将固定域名反代到本地 Vite 端口：

```text
https://tools.12161216.xyz
```

Cloudflare DNS 中 `tools.12161216.xyz` 为 proxied A 记录，指向当前服务器。后续验收默认使用这个固定域名，不再使用 `trycloudflare.com` quick tunnel。

## 验收

按当前约定，不做截图/像素级验收。已执行的检查：

```bash
npm run build
```

同时使用 `curl` 检查本地地址、Nginx 本机 HTTPS 和固定域名是否可访问。
