# 测试环境清单

本文件集中定义各测试环境的基址（base URL）。用例本身只写相对路径，执行时由
“环境基址 + 用例相对路径” 拼出完整 URL，从而让同一批用例可在不同环境间切换。

以 `_` 开头，不是用例，执行时不作为用例处理。

## 环境

| 环境名 | 基址 (base URL) | 说明 |
|--------|-----------------|------|
| test | https://test.shop.hisense.com | 海信商城测试站（默认环境） |
| prod | https://mall.hisense.com | 海信商城生产站 |
| admin | https://admin-test.shop.hisense.com | 运营后台（测试，旧），需登录 |
| admin-new | http://hisenseop.xyftest.hisense.com | 新运营后台（测试），需登录 |

## 默认环境

- 默认环境：`test`
- 用户未指定环境时，一律使用默认环境 `test` 的基址。

## 需登录的环境

| 环境名 | 登录页路径 | 凭据 |
|--------|-----------|------|
| admin | /login_20211109 | 见 `_CREDENTIALS.md`（账号 key: admin-test） |
| admin-new | /login?redirect=%2Fhome | 见 `_CREDENTIALS.md`（账号 key: admin-new） |

- admin 环境在访问受保护页面前需先登录。登录页完整地址 = `admin 基址 + 登录页路径`
  = `https://admin-test.shop.hisense.com/login_20211109`。
- 账号密码不写入本文件，统一放在 `_CREDENTIALS.md`（已被 .gitignore 忽略，禁止入库）。
- 执行需登录的用例时：先打开登录页，用 `_CREDENTIALS.md` 中对应条目的账号密码登录，
  再进入目标页面。报告中不回显密码明文。

## 使用约定

- 用例的“测试数据”中用 `起始路径` 写相对路径（以 `/` 开头），不写完整域名。
  例如 `起始路径: /`、`起始路径: /search?q=电视`。
- 执行时拼接规则：`完整URL = 基址 + 起始路径`。
  例：环境 test + 起始路径 `/` → `https://test.shop.hisense.com/`。
- 基址末尾不带 `/`，起始路径以 `/` 开头，拼接时直接相连，避免出现双斜杠。
- 用户可在执行时指定环境，例如“用 prod 跑 TC-search-001”“在 test 环境执行搜索模块”。
- 若某条用例必须固定在某个绝对地址（跨域、第三方），可在该用例测试数据里直接写
  `起始地址`（完整 URL）覆盖本机制；此时忽略环境基址。
