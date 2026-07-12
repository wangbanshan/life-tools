# life-tools 当前状态

更新时间：2026-07-11

## 已完成
- 已搭好 React + Vite + TypeScript 前端项目。
- 已接入 TanStack Router、TanStack Query、Mantine、@tabler/icons-react。
- 首页已完成：顶部 logo / 头像入口、主标题 / 副标题、4 个工具入口、卡片点击功能预览弹窗。
- 账户入口已改为 Supabase 用户名密码登录 / 注册 / 退出；已可通过 Supabase 环境变量连接真实登录。
- 桌面端已适配：工具卡为横向长卡片，宽屏 3 + 1，中等宽度 2 列。
- 移动端已适配：顶部更紧凑，工具入口保持 2 列，点击区域适合手指操作。
- logo 当前为 icon-only SVG + 页面文字字标，SVG 文件在 `public/life-tools-logo.svg`。
- 图标背景目前用 CSS 渐变和圆角实现，没有额外切图素材。
- 新增 Supabase profiles 表迁移：`supabase/migrations/20260702114548_create_profiles.sql`。
- 订阅日历第一版已完成：固定周期会员、月历事件、站内提醒、多币种分组估算、归档/恢复/删除。
- 新增 Supabase subscriptions 表迁移与用户级 RLS：`supabase/migrations/20260710151737_create_subscriptions.sql`。
- 订阅表迁移已应用到生产 Supabase，并追加最小权限补丁，匿名角色无表权限。
- 订阅日期与月历已切换为 Mantine 官方 DatePickerInput / Calendar，月历在空数据时也保持可见。
- 订阅概览已重构为四项统计、续费月历、即将续费和选中日期明细表格。
- 本年预计通过自建 60s API 汇率统一折算为人民币，并提供 7 天本地缓存和原币种降级。
- 移动端统计卡使用 2×2 布局，选中日期使用紧凑列表，并使用全屏底部表单 Drawer。
- 资产和订阅 Drawer 已统一动态视口、固定关闭栏和移动端 16px 输入字号。
- 常见会员使用 Tabler 品牌图标，不存在可靠品牌图标时回退到分类图标或文字标识。
- 已为月末、闰年、近期续费、多币种估算和人民币汇率换算补充 Vitest 自动化测试。

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

## 验证情况
- `npm run build` 已通过。
- `npm test` 已通过，共 14 项测试。
- 视觉验收由用户自行完成，本轮不做截图验收。
- 部署目标已切换到 Cloudflare Pages 项目 `life-tools`。

- GitHub Actions workflow 已添加：`.github/workflows/deploy-cloudflare-pages.yml`；需要在 GitHub Secrets 中手动配置 Cloudflare token 后才能自动部署。

## 下次继续
- 继续打磨首页细节时，优先看 logo 尺寸、卡片比例、移动端间距。
- 下一阶段可以开始做具体工具页面。
- 后续再接后端和数据存储。
