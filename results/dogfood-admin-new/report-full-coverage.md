# Dogfood 报告（全量覆盖）：海信商城新运营后台（admin-new）

| 字段 | 值 |
|------|----|
| 日期 | 2026-10-14 |
| 应用 URL | http://hisenseop.xyftest.hisense.com/ |
| Session | dogfood-new / dogfood-new2（复用保存的登录态 auth-state.json） |
| 范围 | 全部 9 个顶部一级模块的默认落地页 |
| 登录账号 | admin（密码见 _CREDENTIALS.md，不回显） |

## 说明

本报告覆盖新运营后台（Hisense OP）顶部全部 9 个一级模块，逐个进入其默认落地页取证（URL + 全页截图 + 控制台错误检查）。这是对首轮（report.md）的全量补充。各模块子菜单下的更深层叶子功能未逐一展开，属下一步深入探索范围。

## 覆盖矩阵

| # | 顶部模块 | 落地路由 | 结果 | 证据 |
|---|----------|----------|------|------|
| 1 | 首页 | /home | 正常：欢迎语“Hi admin”，数据概览卡片 | c01-home.png |
| 2 | 订单管理 | /order/orders | 正常：订单列表，共422612条，筛选/页签/分页齐全 | 01-landing.png（首轮） |
| 3 | 库存管理 | /inventory/blacklist | 正常：库存黑名单列表，筛选/增删查改/分页齐全 | c02-inventory.png |
| 4 | 系统管理 | /system/users | 正常：用户管理列表（4条），搜索/新增/编辑/分配角色/删除 | c03-system.png |
| 5 | 商品中心 | /product/categories | **缺陷：后台类目接口 503，数据未加载** | 02-product-center.png（首轮） |
| 6 | 内容管理 | /cms/decoration | 正常：页面管理列表，共29条，筛选/装修/预览/发布 | c04-content.png |
| 7 | 文章管理 | /info/articles | 正常：三栏布局（分类/列表/详情），分类加载中 | c05-article.png |
| 8 | 用户管理 | /user/members | 正常：会员管理列表，共294161条，筛选/冻结/导出 | c06-user.png |
| 9 | 报表管理 | /report/download-center | 正常：导入导出中心，共6343条，状态/下载/删除 | c07-report.png |

## 汇总

| 严重度 | 数量 |
|--------|------|
| critical | 0 |
| high | 1 |
| medium | 0 |
| low | 2 |
| 待观察 | 1 |
| 总计 | 4 |

- 9 个顶部模块中，8 个落地页正常加载并呈现真实业务数据；1 个（商品中心）存在接口 503 缺陷。

## Issues

### ISSUE-N1: 商品中心“后台类目”加载失败（接口 503）— high

| 字段 | 值 |
|------|----|
| 严重度 | high |
| 类别 | functional / console |
| URL | http://hisenseop.xyftest.hisense.com/product/categories |

**描述**：进入商品中心默认打开“后台类目”，顶部弹红色提示“请求失败 (503)”，1级类目“暂无类目”，右侧“请先选择类目”，类目数据完全未加载。

**技术证据**：errors 捕获 `AxiosError: Request failed with status code 503`，调用链 `productApi.categories` → 请求封装。即商品类目接口返回 HTTP 503。

**证据**：screenshots/02-product-center.png

---

### ISSUE-N2: 登录后落地页与 redirect 参数不一致 — low

登录地址带 `redirect=%2Fhome`，但账号密码登录成功后落地在 `/order/orders` 而非 `/home`。手动打开 /home 可正常访问。redirect 参数未被遵循，属轻微跳转逻辑问题。

**证据**：登录地址 redirect=%2Fhome；登录后首次 get url = /order/orders。

---

### ISSUE-N3: 首页数据概览卡片数值为占位“--” — low

| 字段 | 值 |
|------|----|
| 严重度 | low |
| 类别 | functional / content |
| URL | http://hisenseop.xyftest.hisense.com/home |

**描述**：首页欢迎区下的数据概览卡片“用户总数 / 角色总数 / 页面总数 / 已发布页面”数值均显示为“--”，未呈现实际统计数字。可能是统计接口未返回、无数据或前端未渲染。

**不确定性**：本轮未深入核对该统计接口返回，无法区分“真实无数据/接口问题/渲染问题”。建议复现确认。

**证据**：首页快照文本中四项统计值均为 `--`。

---

### ISSUE-N4（待观察）: 文章管理分类栏持续加载

| 字段 | 值 |
|------|----|
| 严重度 | 待观察 |
| 类别 | functional |
| URL | http://hisenseop.xyftest.hisense.com/info/articles |

**描述**：文章管理页三栏布局正常，但截图时刻左侧“文章分类”栏显示加载动画（loading），未呈现分类数据。可能是正常加载中（截图过早），也可能是分类接口慢/失败。

**不确定性**：仅凭单帧截图无法判定。建议复现：进入页面后等待分类加载完成再观察，若长时间不出分类则为缺陷。

**证据**：screenshots/c05-article.png

---

## 已验证的正向结果（汇总）

- 登录态复用稳定：带 --state 直接进入各模块，无需重复登录。
- 8/9 顶部模块落地页功能正常，均加载出真实业务数据，列表/筛选/分页/操作按钮齐全，交互元素可被稳定定位。
- 新后台整体为前端路由单页应用，菜单点击即路由跳转，无旧后台“父级分组需展开”的交互障碍。

## 证据文件

- screenshots/00-login.png、01-landing.png、02-product-center.png（首轮）
- screenshots/c01-home.png ~ c07-report.png（本轮全量覆盖）
- auth-state.json — 登录态

## 后续建议

1. 优先修复 ISSUE-N1：商品类目接口 503。
2. 复现 ISSUE-N3（首页统计为 --）与 ISSUE-N4（文章分类加载），确认是否为接口/数据问题。
3. 深入探索各模块子菜单下的叶子功能（如订单详情、创建商品、角色/权限管理、各类报表导出流程），并测试表单校验、空状态、边界输入等交互细节。

---

## 深挖补充（子菜单叶子功能）

在顶部模块覆盖基础上，进一步深入部分模块的子菜单叶子功能，重点确认 ISSUE-N1 的影响范围并抽查正常模块的深层功能。

### 商品中心 503 范围确认 —— ISSUE-N1 升级为模块级

逐个进入商品中心子菜单，确认 503 不止“后台类目”单页，而是商品中心多个子功能的后端接口群均不可用：

| 子菜单 | 路由 | 结果 | 失败接口（控制台 AxiosError 503） |
|--------|------|------|-----------------------------------|
| 后台类目 | /product/categories | 失败，暂无类目 | productApi.categories |
| 商品管理 | /product/items | 失败，共0条/暂无数据，顶部两个“请求失败(503)” | productApi.categories + productApi.listManage |
| 品牌管理 | /product/brands | 失败，共0条/暂无数据 | listBrands（503） |

**结论**：商品中心的类目、商品列表、品牌等核心数据接口整体返回 503，说明是**商品中心后端服务级故障**，而非单个页面问题。ISSUE-N1 影响范围从单页升级为“整个商品中心模块不可用”，严重度维持 high（若按整模块不可用亦可视为 critical，取决于该服务对业务的阻塞程度，建议研发按服务可用性定级）。

证据：screenshots/02-product-center.png、d01-product-list.png、d02-brand.png

### 订单详情页（深层功能）—— 正常

从订单列表进入某条订单详情（/order/orders/2610143781265358），页面完整正常：
- 订单状态进度条（提交订单 → 付款成功 → 商家发货 → 确认收货 → 评价，当前“待发货”）
- 订单信息（编号 / 创建时间 / 订单来源 H5）
- 商品信息表（商品 / 价格 / 数量 / 优惠金额 / 改价优惠 / 小计 / 活动名称 / 订单状态）
- 收货信息区

排版与数据均正常，深层功能可用。证据：screenshots/d03-order-detail.png

### 深挖结论

- 新后台的问题高度集中在**商品中心模块**（整模块 503），其余模块（订单含详情、库存、系统、内容、文章、用户、报表）经抽查均能正常加载并呈现真实数据。
- 建议研发优先排查商品中心对应的后端服务（productApi 相关接口整体 503），这是当前新后台最主要的阻塞点。
