# UI 测试报告：TC-order-001（admin-new）

| 字段 | 值 |
|------|----|
| 执行时间 | 2026-10-14 18:30 |
| 环境 | admin-new（基址 http://hisenseop.xyftest.hisense.com） |
| 目标站点 | http://hisenseop.xyftest.hisense.com/ |
| Session | tcorder |
| 执行范围 | 单条 TC-order-001 |
| agent-browser 版本 | 0.27.0 |

## 汇总

| 状态 | 数量 |
|------|------|
| 通过 | 0 |
| 失败 | 1 |
| 阻塞 | 0 |
| 总计 | 1 |

## 用例结果

### TC-order-001: 新运营后台订单管理-敏感词管理应正常展示敏感词列表

| 元数据 | 值 |
|--------|----|
| 用例编号 | TC-order-001 |
| 模块 | 订单管理 |
| 功能点 | 敏感词管理 |
| 用例类型 | 功能 |
| 设计技法 | 场景法 |
| 优先级 | P1 |
| 用例版本 | 1 |
| 状态 | 失败 |
| 开始 | 2026-10-14 18:30 |
| 结束 | 2026-10-14 18:33 |
| 耗时 | 约 3 分钟 |

**命令轨迹**

| # | 意图 | 命令 |
|---|------|------|
| 1 | 复用登录态打开订单管理（登录态有效，未被踢回登录页） | `agent-browser --session tcorder --state auth-state.json open .../order/orders` |
| 2 | 确认已登录 | `agent-browser --session tcorder get url` → /order/orders |
| 3 | 拍快照定位敏感词管理（=@e25） | `agent-browser --session tcorder snapshot -i` |
| 4 | 点击敏感词管理 | `agent-browser --session tcorder click @e25` |
| 5 | 取跳转 URL 并截图 | `get url` → /order/sensitive-words；`screenshot --full` |
| 6 | 抓敏感词接口网络状态（关键取证） | `agent-browser --session tcorder network requests --filter sensitive` |

**预期 vs 实际**

| # | 预期结果 | 实际证据 | 判定 |
|---|----------|----------|------|
| 1 | 页面成功进入敏感词管理 | URL=/order/sensitive-words，标签页“敏感词管理”，页面骨架（关键字筛选/添加敏感词/列表表头 ID/敏感词/创建时间/操作）正常渲染 | 通过 |
| 2 | 敏感词列表正常展示 | 列表区显示“当前没有敏感词”，但该空态是**接口失败的兜底**，非真实空数据 | 失败 |
| 3 | 页面无接口错误提示，非空白页 | 顶部弹出红色“请求失败 (503)” | 失败 |
| 4 | 若确无数据应展示空状态而非报错 | 实为接口 503 报错，非正常空状态 | 失败 |

**关键证据（网络层取证，决定性）**

- 敏感词接口 `GET http://hisense-mall-ops-gateway.xyftest.hisense.com/ops/order/sensitive-words?page=1&pageSize=20` 返回 **HTTP 503**。
- 响应头 `Server: APISIX/3.11.0`、`X-APISIX-Upstream-Status: 503`。
- 结论：页面上的“当前没有敏感词”是前端对接口失败的兜底文案，并非真实空数据；顶部“请求失败 (503)”才反映真实状态。若仅凭截图的“当前没有敏感词”极易误判为“通过（空状态）”，网络层取证纠正了这一点。

**整体判定**：失败。用例核心预期“敏感词列表正常展示”未达成，根因是敏感词接口 503（上游服务不可用）。

**证据**

- 截图：results/dogfood-admin-new/screenshots/tc-sensitive.png
- 关键证据：URL=/order/sensitive-words；接口 /ops/order/sensitive-words 返回 503（X-APISIX-Upstream-Status: 503）

**错误信息**

敏感词列表接口经 APISIX 网关返回 503，`X-APISIX-Upstream-Status: 503` 表明网关背后的上游服务不可用。此与本会话中订单管理模块其他子功能（订单列表/退换货/评价）及商品中心模块的 503 属同一类上游服务故障，为被测测试环境后端服务问题，非用例设计问题。待该服务恢复后应复测。

**实验信号（评估 agent-browser 是否满足需求）**

| 信号 | 值 |
|------|----|
| 重新 snapshot 次数 | 1 |
| 因 ref 失效/找不到元素而重试次数 | 0 |
| 能力缺口 | 无。关键在于用 `network requests --filter` 抓到接口真实状态码（503），据此区分“真实空状态”与“接口失败兜底空态”——这是纯 UI 截图无法区分的，agent-browser 的网络层取证能力对本用例的正确判定起到决定性作用。 |
