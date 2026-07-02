# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

后续完成可预览功能或验收时，默认使用固定域名 `https://<preview-domain>`；该域名通过 Nginx 反代到 systemd user 常驻的 `life-tools-vite.service`，不要再使用 `trycloudflare.com` quick tunnel 作为默认验收链接。

登录注册采用 Supabase Auth 的简化方案：界面只收用户名和密码，内部映射为 `<username>@life-tools.local`，用户资料写入 `public.profiles`；第一版不做邮箱、确认密码、找回密码、手机号或 OAuth。
