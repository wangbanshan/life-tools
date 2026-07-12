# Supabase 设置

当前登录注册使用 Supabase Auth，界面只展示用户名和密码。

## 需要配置

1. 在 Supabase 项目中关闭邮箱确认：Auth -> Providers -> Email -> Confirm email 关闭。
2. 按文件名顺序执行 `supabase/migrations` 下的迁移 SQL，包括订阅日历所需的 `20260710151737_create_subscriptions.sql`。
3. 本地或部署环境配置：

```bash
VITE_SUPABASE_URL=你的 Supabase Project URL
VITE_SUPABASE_ANON_KEY=你的 Supabase anon/publishable key
VITE_AUTH_EMAIL_DOMAIN=内部用户名映射域名
```

## 用户名规则

- 只允许小写字母、数字、下划线。
- 长度 3-24 位。
- 内部会映射为 `<username>@<auth-email-domain>` 交给 Supabase Auth 使用。
- 用户名暂不支持修改。

## 迁移文件

- `supabase/migrations/20260702114548_create_profiles.sql`
- `supabase/migrations/20260703134249_create_asset_accounts.sql`
- `supabase/migrations/20260703134358_harden_profiles_security.sql`
- `supabase/migrations/20260710151737_create_subscriptions.sql`
- `supabase/migrations/20260710160518_harden_subscriptions_privileges.sql`
