# AGENTS.md

## 项目定位

- `life-tools` 是面向个人生活管理的工具型项目。
- 开发时优先完成真实可用的工具体验，不做无必要的营销页、装饰性页面或过度设计。
- 任何新功能都应围绕明确生活场景展开，避免堆叠无主线能力。

## 开发原则

- 先遵循项目已有结构、命名、代码风格和技术选型，不为个人偏好重构。
- 改动保持小而清晰，避免把无关重构、格式化、依赖升级混进同一次任务。
- 优先写可读、直白、可测试的代码；只有在确实降低复杂度时才新增抽象。
- 共享逻辑应沉淀为明确的模块、hook、service 或工具函数，避免在页面组件中复制业务逻辑。
- 不擅自删除、回滚或覆盖用户已有改动，除非用户明确要求。

## 组件与模块

- 页面负责组合和状态编排，复杂业务逻辑应拆分组件模块。
- 组件边界要清楚：展示组件少做副作用，业务组件负责连接数据和行为。
- 公共组件必须有稳定、清晰的 props；避免把单一页面的临时需求提前抽成通用组件。
- 表单、列表、弹窗、筛选、空状态、错误状态等常见交互应尽量复用已有模式。
- 新增模块时要明确数据来源、状态流转、错误处理和加载状态。

## 后端与数据库

- 数据模型应优先表达业务事实，避免为了前端临时展示需求污染核心表结构。
- 涉及迁移、删除、批量更新、权限策略的改动必须谨慎，优先提供可回滚方案。
- 数据库字段命名保持语义清晰，时间字段、状态字段、用户归属字段要统一。
- 后端接口应有明确输入校验、权限校验和错误返回，不把内部异常直接暴露给前端。
- Supabase、GitHub、Vercel 的生产操作优先使用官方 CLI。

## 代码风格

- 使用项目现有格式化、lint、类型检查规则。
- 命名以业务含义优先，避免无意义缩写。
- 函数保持单一职责，过长组件或函数应拆分。
- 注释只解释复杂原因、边界条件或业务约束，不解释显而易见的代码。
- 不引入未使用代码、死代码、调试日志或临时 TODO。

## Git 规范

- 提交前检查是否包含密钥、隐私数据、无关文件或大体积生成物。
- commit message 建议使用：
  - `feat: ...`
  - `fix: ...`
  - `refactor: ...`
  - `docs: ...`
  - `chore: ...`
- 不在未确认的情况下执行破坏性 Git 操作，例如 `git reset --hard`、强制推送、覆盖用户分支。

## UI 与交互

- 工具型界面应安静、直接、易扫描，避免过度装饰。
- 首屏优先呈现核心功能，不做无意义 landing page。
- 所有异步操作都应有 loading、success、error 状态。
- 表单应提供必要校验和可理解的错误提示。
- 移动端和桌面端都要保证主要流程可用，长文本、空数据、失败状态不能破坏布局。

## 数据隐私与密钥

- 严禁向 GitHub 或公网泄露密钥、token、cookie、数据库连接串、用户隐私数据。
- 日志、错误上报、截图、文档中不得包含真实密钥或敏感用户数据。
- 涉及生活记录、账单、日程、健康、家庭信息等内容时，默认按敏感数据处理。

## 测试与验证

- 修复 bug 时优先补充能覆盖该问题的测试。
- 涉及时间、时区、金额、提醒、权限、删除、同步的逻辑必须重点验证。
- 前端改动至少检查核心流程、空状态、错误状态和移动端显示。
- 完成改动后尽量运行项目已有的 lint、typecheck、test 或 build。
- 视觉验收默认由用户自行完成；除非用户明确要求，AI 不启动截图或截图验收流程。

## 文档

- 新增重要功能时，必要时同步更新环境变量、启动方式、部署步骤、数据结构或使用说明。
- 文档中只写变量名和示例值，不写真实密钥。
- 文档保持简洁，优先记录会影响后续开发和运维的关键信息。

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->

## AI 协作规则

- AI 助手改代码前应先阅读相关文件，理解现有实现后再动手。
- 涉及生产环境、密钥、数据库迁移、部署、删除数据时，必须先说明风险并确认。
- 最终回复应说明改了什么、如何验证、还有哪些未验证。
