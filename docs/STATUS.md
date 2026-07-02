# life-tools 当前状态

更新时间：2026-07-02

## 已完成
- 已搭好 React + Vite + TypeScript 前端项目。
- 已接入 TanStack Router、TanStack Query、Mantine、@tabler/icons-react。
- 首页已完成：顶部 logo / 头像入口、主标题 / 副标题、4 个工具入口、卡片点击功能预览弹窗。
- 账户入口已改为 Supabase 用户名密码登录 / 注册 / 退出；已可通过 Supabase 环境变量连接真实登录。
- 桌面端已适配：工具卡为横向长卡片，宽屏 3 + 1，中等宽度 2 列。
- 移动端已适配：顶部更紧凑，工具入口保持 2 列，点击区域适合手指操作。
- logo 当前为 icon-only SVG + 页面文字字标，SVG 文件在 `public/life-tools-logo.svg`。
- 图标背景目前用 CSS 渐变和圆角实现，没有额外切图素材。
- 新增 Supabase profiles 表迁移：`supabase/migrations/202607020001_create_profiles.sql`。
- Supabase 项目：`<your Supabase project ref>`，Project URL：`<your Supabase Project URL>`。
- `create_profiles` migration 已应用到 Supabase。

## 当前视觉方向
- 暖白 / 奶油色背景。
- 鼠尾草绿、浅杏色、暖棕色文字。
- 卡片使用轻边框、轻阴影、大圆角，整体偏温暖、轻量、私密。
- 已按反馈移除“轻量 / 私密 / 好维护”标签。

## 运行方式
```bash
npm install
npm run dev
```

本地访问：`http://127.0.0.1:5173/`
固定预览：`https://<preview-domain>`（Cloudflare Pages）

## 验证情况
- `npm run build` 已通过。
- Supabase 登录改造后已重新执行 `npm run build`，构建通过。
- 本轮不做截图验收。
- 部署目标已切换到 Cloudflare Pages 项目 `life-tools`。
- `<preview-domain>` 已改为 proxied CNAME 指向 `<cloudflare-pages-domain>`，后续验收使用固定域名。
- 本地 `.env.local` 已配置 Supabase URL 和 publishable key。
- 内部邮箱映射域名已从 `life-tools.local` 改为 `<auth-email-domain>`，避免 Supabase 拒绝 `.local` 邮箱。
- 当前 Supabase Auth 注册测试返回 `email rate limit exceeded`，需要在控制台关闭 Email confirmation 或等待限流窗口后复测。

- GitHub Actions workflow 已添加：`.github/workflows/deploy-cloudflare-pages.yml`；需要在 GitHub Secrets 中手动配置 Cloudflare token 后才能自动部署。

## 下次继续
- 继续打磨首页细节时，优先看 logo 尺寸、卡片比例、移动端间距。
- 下一阶段可以开始做具体工具页面。
- 后续再接后端和数据存储。

