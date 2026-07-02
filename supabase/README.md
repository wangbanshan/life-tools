# Supabase 设置

当前登录注册使用 Supabase Auth，界面只展示用户名和密码。

## 需要配置

1. 在 Supabase 项目中关闭邮箱确认：Auth -> Providers -> Email -> Confirm email 关闭。
2. 执行迁移 SQL：`supabase/migrations/202607020001_create_profiles.sql`。
3. 本地或部署环境配置：

```bash
VITE_SUPABASE_URL=你的 Supabase Project URL
VITE_SUPABASE_ANON_KEY=你的 Supabase anon/publishable key
```

## 用户名规则

- 只允许小写字母、数字、下划线。
- 长度 3-24 位。
- 内部会映射为 `<username>@<auth-email-domain>` 交给 Supabase Auth 使用。
- 用户名暂不支持修改。

## 当前项目

- Project ref：`<your Supabase project ref>`
- Project URL：`<your Supabase Project URL>`
- `create_profiles` migration 已应用。

## 当前验证状态

- `.env.local` 已配置 Supabase URL 和 publishable key。
- `npm run build` 已通过。
- Auth 注册测试当前返回 `email rate limit exceeded`，需要关闭 Email confirmation 或等待限流窗口后复测。
