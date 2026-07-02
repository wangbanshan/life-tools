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
- 内部会映射为 `<username>@life-tools.local` 交给 Supabase Auth 使用。
- 用户名暂不支持修改。
