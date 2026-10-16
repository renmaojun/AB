# agent-browser 用例驱动 UI 测试

> 用结构化 Markdown 描述测试用例，由 LLM（Kiro）读取 skill 后按 agent-browser 核心循环直接执行，并产出带命令轨迹与证据的测试报告。

本项目完全遵循 [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) 的设计哲学：交付物是一个 **skill**（给 LLM 的执行指令），而非自研测试框架；执行是 LLM 实时驱动的 `open → snapshot -i → @eN 操作 → 页面变化后 re-snapshot` 循环；`@eN` ref 现算现用、绝不固化成脚本。

## 工作方式

```
你写 test-cases/*.md（结构化用例，唯一人工资产）
        ↓  你对我说“执行用例 TC-search-001”
我读 skills/ui-test/SKILL.md，按核心循环直接调用 agent-browser CLI
        ↓  逐步 open / snapshot -i / 选 ref / 动作 / wait / 取证据
我把命令轨迹、预期vs实际、证据写入 results/reports/ 下的报告
```

除了“用例驱动”的精确回归，项目也支持 agent-browser 官方的 **dogfood 自由探索**式测试（对一个页面边逛边找 bug，产出带证据的 issue 清单），两者互补：用例驱动守已知预期，dogfood 发现未知问题。

## 目录结构

```
agent-browser/
├── skills/ui-test/                  核心交付物：UI 测试 skill（仿官方 dogfood 结构）
│   ├── SKILL.md                     执行指令：核心循环 / 环境选择 / 故事转用例 / 选范围 / 工作流 / 断言
│   ├── references/
│   │   ├── case-format.md           11 字段用例规范 + “测试步骤 → agent-browser 命令”映射
│   │   ├── story-to-case.md         用户故事 → 结构化用例 的转换规则
│   │   └── complex-widgets.md       难搞组件（搜索联想框、树形下拉）用 eval 下探真实 DOM 的经验
│   └── templates/
│       └── report-template.md       报告模板（用例元数据 + 命令轨迹 + 预期vs实际 + 实验信号）
├── test-cases/                      你的用例（唯一人工资产）
│   ├── _ENVIRONMENTS.md             环境清单（4 环境基址 + 需登录环境的登录页/凭据指向）
│   ├── _CREDENTIALS.md              登录凭据（含账号密码，已被 .gitignore 忽略，禁止入库）
│   ├── _TEMPLATE.md                 空白用例模板
│   ├── TC-search-001.md             搜索：海信商城关键词搜索
│   ├── TC-nav-001 ~ 003.md          导航：电视分类 / 空调二级类目 / 企业 logo 外链
│   ├── TC-order-001.md              订单管理：敏感词管理列表
│   ├── TC-product-001.md            商品中心：O2O 商品管理查询
│   └── 服务商品列表管理/            按用户故事派生的一批用例
│       ├── TC-svcprod-001 ~ 011.md  服务商品列表加载/筛选/展示/编辑/导出/空状态/鉴权等
│       └── _COVERAGE.md             该批用例对用户故事验收标准的覆盖率报告
├── results/
│   ├── reports/                     用例执行报告（report-*.md）
│   ├── screenshots/                 执行截图证据
│   ├── dogfood-admin/               旧运营后台 dogfood 探索产物（报告 + 截图 + 登录态）
│   └── dogfood-admin-new/           新运营后台 dogfood 探索产物（报告 + 截图 + 登录态）
├── docs/
│   ├── ab-技术调研报告.md           agent-browser 技术调研（原理 / 能力边界 / 适用应用形态）
│   ├── skills/                      官方 agent-browser skill 参考（core.md / dogfood.md）
│   └── story/                       用户故事（如 01-服务商品列表管理.md）
├── agent-browser.json               agent-browser 配置
├── package.json
└── .gitignore
```

## 用例字段

每条用例含 11 个字段：用例编号、模块、功能点、用例标题、用例类型、设计技法、优先级、前置条件、测试数据、测试步骤、预期结果（另有 version / last-updated 用于版本追溯）。完整规范见 `skills/ui-test/references/case-format.md`。

测试步骤只描述“做什么”的意图，不写死 `@eN` / CSS 选择器，执行时由 agent 现场定位。

## 如何执行

在对话中直接告诉我执行范围，我会读 skill 后用 agent-browser 执行并出报告：

- 单条：`执行用例 TC-search-001`
- 编号范围：`执行用例 TC-nav-001..TC-nav-003`
- 按模块：`执行搜索模块的用例`
- 按优先级：`执行所有 P0 用例`
- 按类型：`执行回归用例`
- 全量：`执行某目录下全部用例`
- 指定环境：`用 prod 跑 TC-search-001`、`在 admin-new 执行 TC-order-001`

### 从用户故事生成用例

也可以把一句自然语言的用户故事转成标准化用例，或从一份 story 文档批量派生：

- `帮我写个用例：测试点击导航栏电视能进入电视页面`
- `依照 docs/story/01-xxx.md 生成多个测试用例`

我会按 `skills/ui-test/references/story-to-case.md` 的规则，把故事拆成“动作 + 预期”，推导出 11 个字段，生成符合模板的 `.md` 用例；按 story 批量生成时还会产出一份覆盖率报告（验收标准 → 用例映射）。

### dogfood 自由探索

也可以让我对某个页面做探索式测试（不依赖预写用例，边逛边找 bug）：

- `用 dogfood 探索 admin-new 这个网站`
- `dogfood 验证新运营后台订单管理和子功能`

探索产物（报告 + 复现截图）输出到 `results/dogfood-*/`。

## 环境配置（多环境切换）

用例与环境解耦：用例的测试数据只写相对路径（`起始路径`，如 `/`、`/search?q=电视`），不写死域名。各环境基址集中在 `test-cases/_ENVIRONMENTS.md`：

| 环境名 | 基址 | 说明 |
|--------|------|------|
| test | https://test.shop.hisense.com | 海信商城测试站（默认） |
| prod | https://mall.hisense.com | 海信商城生产站 |
| admin | https://admin-test.shop.hisense.com | 旧运营后台（测试），需登录 |
| admin-new | http://hisenseop.xyftest.hisense.com | 新运营后台（测试），需登录 |

执行时按 `完整URL = 基址 + 起始路径` 拼接。不指定环境则用默认 `test`。新增环境只需在 `_ENVIRONMENTS.md` 加一行，用例无需改动。

**需登录的环境**（admin / admin-new）：登录页路径记在 `_ENVIRONMENTS.md`，账号密码单独放 `_CREDENTIALS.md`（已被 `.gitignore` 忽略，不入库）。执行需登录的用例时先登录再进目标页，报告中不回显密码明文。

## 前置准备

首次使用需安装 agent-browser 的 Chrome（Chrome for Testing）：

```bash
agent-browser install    # 或 npm run install:browser
agent-browser doctor     # 诊断环境，或 npm run doctor
```

## 设计说明

- 不存在任何 agent-browser 的 JS 封装或 Browser 类：agent-browser CLI 本身就是面向 agent 的接口，再封装一层会偏离官方哲学，也会让“验证 agent-browser 是否满足需求”这个实验目的失真。
- 不生成写死 `@eN` 的“固定脚本”：ref 是运行时产物、页面一变即失效。可复现产物是报告里的命令轨迹 + 证据，而非固定脚本。
- 证据优先、诚实判定：每条预期都要有可核对证据（URL/标题/文本/截图）；必要时用 `network requests` 取接口状态码，区分“真实空状态”与“接口失败兜底空态”；无法取证时标注阻塞，不伪造通过。
- 能力边界如实记录：纯 canvas/WebGL 页面、下载文件逐字段解析、原生 app 等超出 agent-browser 能力的场景，在用例/报告中明确标注，不硬凑结论。详见 `docs/ab-技术调研报告.md`。
- 版本管理 / 回归管理 / 用例变更维护目前以最小机制支持：用例是唯一人工资产并带 version 字段；回归集靠 用例类型/优先级 筛选；报告记录重试与能力缺口等实验信号。更完整的机制作为后续实验假设，尚未实现。
