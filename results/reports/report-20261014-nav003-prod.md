# UI 测试报告：TC-nav-003（prod）

| 字段 | 值 |
|------|----|
| 执行时间 | 2026-10-14 16:55 |
| 环境 | prod（基址 https://mall.hisense.com） |
| 目标站点 | https://mall.hisense.com/ |
| Session | ui-test |
| 执行范围 | 单条 TC-nav-003 |
| agent-browser 版本 | 0.27.0 |

## 汇总

| 状态 | 数量 |
|------|------|
| 通过 | 1 |
| 失败 | 0 |
| 阻塞 | 0 |
| 总计 | 1 |

## 用例结果

### TC-nav-003: 点击首页顶部企业 logo 应跳转进入海信企业官网

| 元数据 | 值 |
|--------|----|
| 用例编号 | TC-nav-003 |
| 模块 | 导航 |
| 功能点 | 首页顶部企业 logo 外链 |
| 用例类型 | 功能 |
| 设计技法 | 场景法 |
| 优先级 | P2 |
| 用例版本 | 1 |
| 状态 | 通过 |
| 开始 | 2026-10-14 16:55 |
| 结束 | 2026-10-14 16:58 |
| 耗时 | 约 3 分钟 |

**命令轨迹**

| # | 意图 | 命令 |
|---|------|------|
| 1 | 打开生产站首页 | `agent-browser --session ui-test open https://mall.hisense.com/` |
| 2 | 拍快照（带 href）定位企业官网入口（海信官网=@e7，href=http://www.hisense.cn/） | `agent-browser --session ui-test snapshot -i -u` |
| 3 | 点击海信官网入口 | `agent-browser --session ui-test click @e7` |
| 4 | 检查是否新开标签（结果为当前标签内跳转） | `agent-browser --session ui-test tab` |
| 5 | 取目标页标题并读正文 | `agent-browser --session ui-test get title` + `get text body` |
| 6 | 截图留证 | `agent-browser --session ui-test screenshot results/screenshots/TC-nav-003-prod.png` |

**预期 vs 实际**

| # | 预期结果 | 实际证据 | 判定 |
|---|----------|----------|------|
| 1 | 点击后进入海信企业官网（域名为官网域名，不再是商城域名） | 由 `mall.hisense.com` 跳转至 `https://www.hisense.com/`（入口 href 为 http://www.hisense.cn/，重定向到 www.hisense.com），已离开商城域名 | 通过 |
| 2 | 目标页面内容体现“海信”企业官网（非商城搜索/商品页） | 标题=`海信官网_Hisense海信集团官方网站-全品类智能家电`；正文含“关于海信/集团介绍/集团新闻”“六大核心产业”“上市公司 海信视像/海信家电”等企业官网内容 | 通过 |
| 3 | 目标页面能正常拍到快照（非错误页/空白页） | 正常读到完整正文并截图 | 通过 |

**证据**

- 截图：`results/screenshots/TC-nav-003-prod.png`
- 关键证据：入口 @e7 href=`http://www.hisense.cn/`；目标 URL=`https://www.hisense.com/`；标题=`海信官网_Hisense海信集团官方网站-全品类智能家电`

**错误信息**

N/A

**实验信号（评估 agent-browser 是否满足需求）**

| 信号 | 值 |
|------|----|
| 重新 snapshot 次数 | 1 |
| 因 ref 失效/找不到元素而重试次数 | 0 |
| 能力缺口 | 无。`snapshot -i -u` 带出链接 href 便于确认外链目标，`tab` 命令可确认是否新开标签，跨域跳转后仍能正常读取官网内容。agent-browser 对跨域外链场景支持良好。 |

---

## 备注

- 首页顶部存在两类入口：商城自身 logo（指向 mall.hisense.com）与“海信官网”外链（@e7，href=http://www.hisense.cn/）。本用例“企业 logo（海信官网入口）”对应后者。
- 实际为当前标签内跳转（非新开标签页），用例第4步“若新开标签则切换”为条件分支，本次未触发。
