# agent-browser 技术调研报告

> 本报告基于对 vercel-labs/agent-browser 的源码分析 + 在海信商城（test/prod）与新旧运营后台（admin/admin-new）上的真实探索性测试，总结其技术原理、能力边界与适用场景。所有结论均附实测例子。
>
> 调研日期：2026-10-14 ｜ 版本：agent-browser 0.27.0 ｜ 官方仓库：https://github.com/vercel-labs/agent-browser

---

## 一、结论速览

agent-browser 是 Vercel Labs 出品、用 Rust 编写、通过 CDP 直接驱动 Chrome 的浏览器自动化 CLI，专为 AI agent 设计。其核心价值不在"能驱动浏览器"，而在**把网页压缩成 AI 能低成本、精确理解的语义形式（无障碍树 + @eN ref）**。

一句话判断：**对普通 DOM 网页（含复杂后台 SPA），它是目前 AI 驱动 UI 测试性价比很高的选型；对纯 canvas/WebGL 页面则基本失效。**

---

## 二、技术原理（源码级）

官方源码核心在 `cli/src/native/`（Rust）。关键机制四点：

### 1. 直连 CDP，无 Playwright/Node 依赖

- 用 Rust 自实现 CDP（Chrome DevTools Protocol）客户端（`cli/src/native/cdp/`），直接对 Chrome 发 CDP 命令，不依赖 Playwright/Puppeteer/Node 运行时。
- 浏览器用 Chrome for Testing（`agent-browser install` 下载）。
- 收益：启动快、二进制小、无 Node 依赖。

### 2. 守护进程 + Socket：多条命令共享一个会话

- 首次执行命令启动后台 daemon（`daemon.rs`），持有与 Chrome 的 CDP 长连接；CLI 每条命令是瘦客户端，通过 Unix socket（按 session 名区分）与 daemon 通信。
- `--session <name>` = 独立 daemon = 独立浏览器（独立 cookies/标签/ref），可并行。
- **实测例子**：我们对 admin-new 后台 `dogfood-new2` 会话一口气探了 9 个顶部模块、`dig` 会话深挖子菜单，跨几十条命令浏览器始终在线、状态保持，就是靠这个机制。

### 3. 核心杀手锏：无障碍树快照 + @eN ref

- 通过 CDP 的 `Accessibility.getFullAXTree`（`snapshot.rs`）拿到页面无障碍树——浏览器为屏幕阅读器维护的语义化结构（每个元素的 role + name + 状态），天然去掉样式/布局噪音。
- 给可交互元素分配紧凑引用 `@e1 @e2 ...`，内部用 RefMap 映射到真实 DOM 节点。一个页面约 200-400 token 即可让 AI 理解。
- **ref 是每次 snapshot 重建的**，页面一变即失效——这是设计约束，不是 bug。
- **实测例子**：
  - 海信商城首页 snapshot 一次就拿到几十个 `@eN`，搜索框是 `@e67`/`@e38`，直接 `fill` + `press Enter` 完成搜索。
  - 旧后台多次切页后 `@e32` 报 `Unknown ref: e32`，正是 ref 失效的典型；按"页面变化后 re-snapshot"重新取 ref 即恢复。

### 4. 两条 agent 通道 + skill 机制

- CLI 通道（直接敲命令）与 MCP 通道（`agent-browser mcp` 暴露为 MCP 工具服务器），官方做了 CLI/MCP 行为对齐。
- skill 机制：`agent-browser skills get <name>` 把使用指南（SKILL.md）喂给 AI，理念是"薄 skill + 按需加载"。官方 evals 测的就是"AI 读 skill 后能否产出正确命令"。
- **实测例子**：我们本项目的 `skills/ui-test/` 正是仿照官方 `dogfood` skill 结构（SKILL.md + references + templates）自建的用例驱动测试 skill。

---

## 三、实测能力清单（哪些命令真正用上了、解决了什么）

| 能力 | 命令 | 实测用途与例子 |
|------|------|---------------|
| 核心循环 | `open` / `snapshot -i` / `click @eN` / `fill` / `press` | 海信商城搜索"电视"→跳转 /search?q=电视，端到端跑通 |
| 语义定位（ref 后备） | `find text "X" click` | 旧后台悬浮菜单、新后台叶子项定位，比写死 CSS 稳 |
| 悬停展开 | `hover @eN` + re-snapshot | 海信商城导航"空调"悬停展开二级菜单，点"大1匹" |
| 信息获取 | `get url` / `get title` / `get text body` | 断言跳转结果；读 body 发现 test 站 "Internal Server Error" |
| 截图取证 | `screenshot --full` / `--annotate` | 每个被测页面留证；`--annotate` 把 ref 标号画到图上 |
| 会话状态持久化 | `state save` / `--state` | 保存 admin-new 登录态，后续多轮 dogfood 免重复登录 |
| 控制台/错误 | `errors` / `console` | 抓到商品中心 `AxiosError: 503`，调用链指向 productApi |
| **网络层取证** | `network requests --filter/--status` | **决定性能力**：抓到接口真实状态码（见下文例子） |
| 标签页 | `tab` | 判断企业 logo 点击是否新开标签 |

---

## 四、标志性实测案例（体现 agent-browser 的真实价值）

### 案例 1：核心循环端到端跑通搜索（能力验证）

海信商城生产站 TC-search-001：`open` 首页 → `snapshot -i` 定位搜索框 `@e38` → `fill "电视"` → `press Enter` → `get url` 得到 `/search?q=%E7%94%B5%E8%A7%86` → `get title` 得"海信商城-商品搜索" → 结果页 231 条电视商品。全流程无需写死任何选择器，证明核心循环对真实电商站成立。

### 案例 2：网络层取证区分"真空"与"假空"（最具代表性）

新后台 TC-order-001「敏感词管理展示列表」：
- 页面显示"**当前没有敏感词**"——**仅看截图极易误判为"通过（空状态）"**。
- 用 `network requests --filter sensitive` 抓到接口 `GET /ops/order/sensitive-words` 返回 **HTTP 503**（响应头 `X-APISIX-Upstream-Status: 503`）。
- 真相：那句"当前没有敏感词"是前端对接口失败的兜底文案，并非真实空数据。用例据此正确判为**失败**。

**价值**：这是纯截图/视觉模型无法区分的。agent-browser 基于 CDP Network domain 的取证能力，把"看起来是空列表"精确定位为"接口 503 失败"，直接提升了测试结论的可信度。

### 案例 3：探索式测试快速定位后端故障根因

新后台 dogfood 探索：
- 商品中心（后台类目/商品管理/品牌管理）全部 503，`errors` 抓到 `AxiosError 503`，调用链 `productApi.categories` / `listManage` / `listBrands`。
- 订单管理（订单列表/退换货/评价）全部 503，`network requests` 抓到网关 `APISIX/3.11.0` 的 `X-APISIX-Upstream-Status: 503`。
- **结论直达根因**：不是前端、不是网关本身，而是 APISIX 网关背后的上游微服务群不可用。这种"哪个接口、什么状态码、哪一层"的证据可直接甩给后端排查。

### 案例 4：复杂多级菜单的适应与自我纠偏

旧后台（200+ 子菜单）：初次把"点父级菜单无内容"疑似判为缺陷，经澄清为"父级仅展开、需点叶子项"的菜单模型。agent-browser 的 `hover`+re-snapshot 能正确展开并捕获二级菜单；配合人工澄清，错误判断被及时纠正。体现"AI 探索需人定边界"。

### 案例 5：会话持久化支撑多轮测试

`state save` 保存 admin-new 登录态后，`--state` 复用使后续多轮 dogfood/用例执行免重复登录。实测中也观察到登录态会过期（被重定向回登录页），重新登录并 `state save` 即可——真实反映了 token 时效。

---

## 五、能力边界与风险

### 1. 根本局限：绑定无障碍树 → 纯 canvas 页面失效

- agent-browser 的能力绑定在无障碍树，而无障碍树绑定在**语义 DOM**。
- 纯 canvas/WebGL 页面（Figma、在线白板、WebGL 游戏、部分可视化大屏）把内容画成像素、无语义 DOM，`snapshot -i` 会近乎为空，核心循环断裂。
- 退路（坐标点击+截图、`eval` 调 JS、依赖应用自带隐藏无障碍层）都偏离其优势，又慢又不稳。
- **选型提示**：被测对象若含大量 canvas 渲染页面，agent-browser 不是合适选型，应考虑视觉模型驱动方案。

### 2. ref 生命周期心智负担

页面一变 ref 即失效，必须 re-snapshot。实测多次遇到 `Unknown ref`。对自动化脚本意味着不能固化 ref，必须"每步重新取"。

### 3. 深度封装组件：@eN 命中包装层，需 eval 下探（实证）

对封装较深的自定义组件（搜索联想选择框、树形下拉等），`@eN` 常命中外层包装而非内部真实可交互节点，导致"点了没反应 / 输入进不去 / 选了没生效"。

- **实证**：新建商品的"品牌/型号"是搜索联想框（输入字符触发搜索，再从下拉选）。直接对快照里的 combobox `@eN` 做 `fill` / `keyboard type` 全部无效——真正能接收输入的是内部隐藏的 `input.ant-select-input`。
- **可行解**：① `eval` 列出 `input.ant-select-input` 定位内部真实 input；② `focus` 该 input + `keyboard type` 触发搜索；③ **只在"当前打开的下拉浮层"内**按文本点选选项（全局 `.ant-select-item-option[0]` 会误选其他字段，实测曾污染已填的品牌值）。按此三步，品牌（输"H"选 Hisense）、型号（选 ASDFGG）均成功驱动。
- **结论**：这类组件 agent-browser **能驱动**，但要点在于 `eval` 下探真实 DOM + 限定当前浮层选项，不能只靠 `@eN`。该经验已沉淀为 skill 的一项：`skills/ui-test/references/complex-widgets.md`。
- **启示**：agent-browser 对标准元素（input、普通下拉、树形选叶子）开箱即用；对深度封装/异步组件则需要 `eval` 辅助——这是一条清晰的能力分界，也体现了 `eval` 作为"兜底逃生舱"的价值。

### 4. 需要人定边界（写操作/误判）

- 探索式测试易把"未理解的设计"误判为缺陷（案例 4）。
- 写操作/破坏性操作（如配权限、删数据）超出 dogfood 只读探索范畴，需人工授权——本次我们即拒绝了直接"赋予增删改查权限"的真实写操作。

### 5. 环境依赖

被测后端不稳会直接反映为测试失败（本次大量 503）。这其实是测试该暴露的，但也要求报告诚实区分"产品缺陷"与"环境故障"。

---

## 六、适用的应用形态（不止 web）

agent-browser 的适用边界可一句话概括：**凡是"基于 Chromium / 能暴露 CDP 端口"的实例，都能用同一套 snapshot-interact 工作流自动化。** 因此它从普通网页自然延伸到以下形态（均有官方专门 skill 支持）：

| 形态 | 技术手段 | 典型对象 | 官方 skill |
|------|---------|---------|-----------|
| 普通网页（主场） | CDP 直驱 Chrome | 本次测的海信商城、新旧运营后台 | core / dogfood |
| **Electron 桌面应用** | `connect` 到 app 暴露的 CDP 端口 | VS Code / Slack / Discord / Figma / Notion / Spotify | electron |
| 专精 web 应用 | 深度适配 skill | Slack 工作区 | slack |
| 云端 / 远程浏览器 | 浏览器跑在云端基础设施 | Vercel Sandbox microVM、AWS Bedrock AgentCore | vercel-sandbox / agentcore |
| 连接已有浏览器 | `--auto-connect` / `--cdp <port>` | 复用本机正在运行的 Chrome | core |

### Electron 桌面应用（web 之外最有价值的扩展）

Electron 应用本质是 Chromium 套壳，天生支持 `--remote-debugging-port` 暴露 CDP 端口。agent-browser 用 `connect <端口>` 连上后，**snapshot / click / fill 全套与网页完全一致**。官方源码给出的用法：

```bash
open -a "Slack" --args --remote-debugging-port=9222   # 带调试端口启动 Electron 应用
agent-browser connect 9222                            # 连接到该应用
agent-browser snapshot -i                             # 之后与网页同一套流程
agent-browser click @e5
```

官方明确列出可自动化的 Electron 应用：VS Code、Slack、Discord、Figma、Notion、Spotify。**意义**：可用它测试/自动化桌面客户端，而不仅是浏览器里的网站。

### 云端 / 远程浏览器（部署位置的扩展）

这不是"另一种应用"，而是让 agent-browser + Chrome 跑在不同基础设施上：
- **Vercel Sandbox microVM**：在 Vercel 微虚拟机里跑 Chrome，供 Vercel 部署的应用（Next.js/Remix/Astro 等）做自动化，突破二进制大小限制、提供隔离的临时环境。
- **AWS Bedrock AgentCore**：跑在 AWS 托管云浏览器上，用 AWS 凭据，适合云端 agent。
- 另有独立项目 `remote-agent-browser` 提供云端可编程浏览器。

### 不适用的形态（边界）

关键限制始终是"绑定 Chromium + 无障碍树"：
- **非 Chromium 的原生桌面应用**（纯 Win32 / Qt / Cocoa / Swift 原生 app）：无 CDP、无 DOM，连不上也读不懂，完全不适用——属 Appium / WinAppDriver 的领域。
- **纯 canvas / WebGL 页面**（即使在 Chromium 内）：无障碍树为空，核心模式失效（见第五节）。
- **移动原生 app**（iOS / Android native）：非 Chromium，不适用（移动端 WebView 另当别论）。

一句话：**适用边界 = 任何能暴露 CDP 的 Chromium 实例**；碰到非 Chromium 原生应用或纯 canvas 渲染即超出能力。

---

## 七、适用场景与测试阶段

| 场景/阶段 | 适用度 | 依据（实测） |
|-----------|--------|-------------|
| 冒烟 / 可用性快速体检 | 高 | 新后台 9 模块几分钟定位商品中心 503 |
| 新功能首轮探索（dogfood） | 高 | 无需预写用例，边逛边挖，发现用户名缺失、503 等 |
| 用例驱动的功能/回归测试 | 高 | TC-search / TC-nav / TC-order 系列，结构化用例 + 证据判定 |
| 接口级问题定位 | 高 | network/errors 取证直达 503 根因 |
| 纯 canvas/WebGL 页面 | 低 | 无障碍树为空，核心模式失效 |
| 需真实写操作/破坏性验证 | 低 | 超出安全边界，需人工把控 |

**两种模式互补**：dogfood（自由探索，发现未知问题）作"侦察兵"用于早期/冒烟；用例驱动（验证已知预期）作"守门员"用于回归/验收。典型配合：新功能先 dogfood 探一轮 → 稳定路径沉淀为用例 → 以后回归跑用例。

---

## 八、本次调研采用的工程形态（供复用）

本项目基于 agent-browser 自建了一套"用例驱动 UI 测试" skill（完全遵循官方哲学，无 JS 封装）：

- `skills/ui-test/`：SKILL.md（执行指令）+ references（用例规范、用户故事转用例）+ templates（证据化报告模板）。
- `test-cases/*.md`：11 字段结构化用例（唯一人工资产），支持单条/编号范围/模块/优先级/类型/全量执行。
- `_ENVIRONMENTS.md` + `_CREDENTIALS.md`：多环境基址与登录凭据分离（凭据不入库）。
- 执行形态：LLM 读 skill 后直接调 agent-browser CLI，按核心循环执行并产出带命令轨迹 + 证据 + 预期vs实际的报告。

该形态已在 test/prod/admin/admin-new 四个环境实跑验证，证明"结构化用例 → LLM 理解 → 调 agent-browser → 执行 → 证据化报告"链路可行。

---

## 九、总体评价

agent-browser 用"Rust CDP 客户端（快、无 Node）+ 守护进程（会话保持）+ 无障碍树压缩成 @eN（低 token 精确理解）"三件套，把"AI 操作浏览器"从"喂 HTML/截图的昂贵猜测"变成"读语义快照、点编号 ref 的廉价精确操作"。配合 network/errors/console 的取证能力，它不仅能"点页面"，还能把问题定位到接口与状态码层面——这是本次调研中它最超出预期的价值点（案例 2、3）。

其天花板清晰：绑定无障碍树，纯 canvas 页面失效；ref 需现算现用；写操作与误判需人把边界。在"普通 DOM 网页 + AI 驱动 UI 测试"这个主场里，它是成熟、好用、证据能力强的选型。
