# Dogfood 报告：新运营后台 - 订单管理模块专项

| 字段 | 值 |
|------|----|
| 日期 | 2026-10-14 |
| 应用 URL | http://hisenseop.xyftest.hisense.com/ |
| Session | dogorder |
| 范围 | 订单管理模块及其子功能 |
| 登录账号 | admin（密码见 _CREDENTIALS.md，不回显） |

## 说明

本轮专项验证订单管理模块（左侧共 13 个子菜单：订单列表/快递管理/退换货款中心/退款问题跟踪/回收订单管理/O2O订单管理/O2O退货款中心/O2O退款问题跟踪/评价管理/敏感词管理/评价标签管理/类目标签管理/服务订单管理）。抽查了订单列表、退换货款中心、评价管理三个核心子功能，并通过网络请求抓到网关层硬证据。

## 关键变化（与首轮对比）

首轮（report.md，数十分钟前）订单列表正常加载 42 万条数据；本轮订单列表**加载失败**。即订单服务从“可用”变为“不可用”，印证测试环境后端服务不稳定。

## 汇总

| 严重度 | 数量 |
|--------|------|
| critical | 0 |
| high | 1 |
| medium | 1 |
| 总计 | 2 |

## Issues

### ISSUE-O1: 订单管理模块后端上游服务整体 503，核心子功能不可用 — high

| 字段 | 值 |
|------|----|
| 严重度 | high |
| 类别 | functional |
| URL | /order/orders、/order/refunds、/order/reviews 等 |

**现象**：订单管理多个核心子功能加载失败，页面无数据：

| 子功能 | 路由 | 表现 |
|--------|------|------|
| 订单列表 | /order/orders | “订单列表加载失败，请重试”，点“重试”仍失败，共0条 |
| 退换货款中心 | /order/refunds | 顶部“请求失败 (503)”，无可展示信息，共0条 |
| 评价管理 | /order/reviews | 顶部“请求失败 (503)”，暂无数据 |

**网关层硬证据**（network requests 抓取）：

- 订单接口 `GET http://hisense-mall-ops-gateway.xyftest.hisense.com/ops/order/orders?pageNo=1&pageSize=20` 返回 **HTTP 503**。
- 响应头 `Server: APISIX/3.11.0`、`X-APISIX-Upstream-Status: 503`。
- 两次请求（初次 + 点击重试）均为 503，非单次偶发。

**根因判断**：请求经 APISIX 网关转发，`X-APISIX-Upstream-Status: 503` 表明是**网关背后的订单上游微服务不可用**，而非网关或前端问题。这与商品中心模块的 503（见 report-full-coverage.md 的 ISSUE-N1）属同一类上游服务故障。

**与前端表现的差异**：本模块前端 errors 为空（未抛 JS 异常），错误被前端捕获并以“加载失败/请求失败”提示呈现——相比商品中心页抛出 AxiosError，订单模块的前端错误处理更友好（有重试入口与提示文案）。

**证据**：screenshots/o01-order-list.png、o01b-order-retry.png、o02-refund-center.png、o03-review.png

---

### ISSUE-O2: 用户信息接口 401 但页面仍可进入 — medium

| 字段 | 值 |
|------|----|
| 严重度 | medium |
| 类别 | functional / security |
| URL | /ops/user/info |

**现象**：network 抓取显示 `GET /ops/user/info` 返回 **HTTP 401**（Authorization 携带的是一个较早的 Bearer token），但随后其他请求换用了新的 token 且页面正常进入。疑似登录后 token 刷新/时序存在不一致：旧 token 已失效（401），新 token 才生效。

**不确定性**：本轮未深入核对 token 刷新机制，无法断定是否影响安全或仅为无害的时序现象。建议研发核对登录态 token 的签发与刷新逻辑。

**证据**：network 请求记录中 /ops/user/info 状态 401，其余接口使用不同 token。

---

## 已验证的正向结果

- 登录功能正常：旧登录态已过期（被重定向回登录页），重新用账号密码登录成功，redirect 参数生效跳转 /order/orders。
- 订单模块前端健壮性尚可：接口失败时以“加载失败/请求失败”提示 + 重试入口呈现，未白屏或崩溃。

## 证据文件

- screenshots/o01-order-list.png — 订单列表加载失败
- screenshots/o01b-order-retry.png — 点击重试后仍失败
- screenshots/o02-refund-center.png — 退换货款中心 503
- screenshots/o03-review.png — 评价管理 503

## 探索方法说明

- 本轮暴露并利用了 agent-browser 的 `network requests --status 400-599` 能力，直接抓到网关返回码与 `X-APISIX-Upstream-Status`，这是截图/快照层面看不到的根因证据。相比纯 UI 观察，网络层取证能把“页面加载失败”精确定位到“哪个接口、什么状态码、哪一层出的问题”。
- 服务订单管理（第13个子菜单）因菜单多次切换后 ref 失效未成功进入，属 ref 生命周期现象（非功能问题）；其余 O2O 系列、快递、敏感词等子功能未逐一展开。鉴于订单上游服务整体 503，预计依赖同一服务的子功能表现一致，建议待服务恢复后复测。

## 后续建议

1. 优先排查订单上游微服务 503（APISIX 网关 upstream 不可用），这与商品中心 503 可能同源，建议一并核查测试环境后端服务健康度。
2. 复测 ISSUE-O2 的 token 401 时序问题。
3. 服务恢复后，复跑订单管理全部 13 个子功能确认数据加载正常。
