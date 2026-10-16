# UI 测试报告：导航模块（prod）

| 字段 | 值 |
|------|----|
| 执行时间 | 2026-10-14 16:05 |
| 环境 | prod（基址 https://mall.hisense.com） |
| 目标站点 | https://mall.hisense.com/ |
| Session | ui-test |
| 执行范围 | 范围 TC-nav-001..TC-nav-002 |
| agent-browser 版本 | 0.27.0 |

## 汇总

| 状态 | 数量 |
|------|------|
| 通过 | 1 |
| 失败 | 1 |
| 阻塞 | 0 |
| 总计 | 2 |

## 用例结果

### TC-nav-001: 点击首页导航栏“电视”分类应进入电视相关页面

| 元数据 | 值 |
|--------|----|
| 用例编号 | TC-nav-001 |
| 模块 | 导航 |
| 功能点 | 顶部导航栏分类入口 |
| 用例类型 | 功能 |
| 设计技法 | 场景法 |
| 优先级 | P1 |
| 用例版本 | 1 |
| 状态 | 通过 |
| 开始 | 2026-10-14 16:05 |
| 结束 | 2026-10-14 16:07 |
| 耗时 | 约 2 分钟 |

**命令轨迹**

| # | 意图 | 命令 |
|---|------|------|
| 1 | 打开生产站首页 | `agent-browser --session ui-test open https://mall.hisense.com/` |
| 2 | 确认首页并拍快照定位电视（电视=@e31） | `agent-browser --session ui-test get title` + `snapshot -i` |
| 3 | 点击电视导航项 | `agent-browser --session ui-test click @e31` |
| 4 | 取跳转后 URL 与标题 | `agent-browser --session ui-test get url` + `get title` |
| 5 | 读页面正文确认电视相关内容 | `agent-browser --session ui-test get text body` |
| 6 | 截图留证 | `agent-browser --session ui-test screenshot results/screenshots/TC-nav-001-prod.png` |

**预期 vs 实际**

| # | 预期结果 | 实际证据 | 判定 |
|---|----------|----------|------|
| 1 | 点击后页面发生跳转（URL 相对首页变化） | URL 由 `/` 变为 `/search?fcid=657` | 通过 |
| 2 | 目标页面内容与“电视”相关 | 页面列出大量电视商品（E3Q、Vidda发现X、E8S 等，共70条），尺寸筛选为40~100英寸 | 通过 |
| 3 | 目标页面能正常拍到快照（非错误页/空白页） | 正常拍到页面内容与截图 | 通过 |

**证据**

- 截图：`results/screenshots/TC-nav-001-prod.png`
- 关键证据：结果页 URL=`https://mall.hisense.com/search?fcid=657`，标题=`海信商城-商品搜索`，电视商品共 70 条

**错误信息**

N/A

**实验信号（评估 agent-browser 是否满足需求）**

| 信号 | 值 |
|------|----|
| 重新 snapshot 次数 | 1 |
| 因 ref 失效/找不到元素而重试次数 | 0 |
| 能力缺口 | 无 |

---

### TC-nav-002: 点击导航栏“空调-大一匹”应进入新风空调页面且存在价格 3058 的空调商品

| 元数据 | 值 |
|--------|----|
| 用例编号 | TC-nav-002 |
| 模块 | 导航 |
| 功能点 | 顶部导航栏空调二级分类入口 |
| 用例类型 | 功能 |
| 设计技法 | 场景法 |
| 优先级 | P1 |
| 用例版本 | 1 |
| 状态 | 失败 |
| 开始 | 2026-10-14 16:07 |
| 结束 | 2026-10-14 16:12 |
| 耗时 | 约 5 分钟 |

**命令轨迹**

| # | 意图 | 命令 |
|---|------|------|
| 1 | 回到首页 | `agent-browser --session ui-test open https://mall.hisense.com/` |
| 2 | 拍首页快照定位空调（空调=@e32） | `agent-browser --session ui-test snapshot -i` |
| 3 | 悬停空调展开二级菜单，re-snapshot | `agent-browser --session ui-test hover @e32` + `snapshot -i` |
| 4 | 二级菜单中点击“大1匹”（实际文案为“大1匹”，=@e73） | `agent-browser --session ui-test click @e73` |
| 5 | 取跳转后 URL/标题并读正文 | `agent-browser --session ui-test get url` + `get title` + `get text body` |
| 6 | 截图留证 | `agent-browser --session ui-test screenshot results/screenshots/TC-nav-002-prod.png` |

**预期 vs 实际**

| # | 预期结果 | 实际证据 | 判定 |
|---|----------|----------|------|
| 1 | 点击后页面发生跳转（URL 相对首页变化） | URL 由 `/` 变为 `/search?fcid=64` | 通过 |
| 2 | 目标页面为新风空调页面（标题或内容体现“新风空调”） | 页面为“大1匹”筛选结果（壁挂式空调），标题=`海信商城-商品搜索`，未体现“新风空调” | 失败 |
| 3 | 目标页面商品列表中存在价格为 3058 的空调商品 | 页面仅2条商品：大1匹 E370 ￥1763、科龙 QS1 ￥1764，无 3058 | 失败 |
| 4 | 目标页面能正常拍到快照（非错误页/空白页） | 正常拍到页面内容 | 通过 |

**证据**

- 截图：`results/screenshots/TC-nav-002-prod.png`
- 关键证据：结果页 URL=`https://mall.hisense.com/search?fcid=64`，共2条商品（￥1763、￥1764），页面标题=`海信商城-商品搜索`

**错误信息**

两条核心预期不成立：
1. “大1匹”进入的是“壁挂式·大1匹”空调筛选页，不是“新风空调”页面。导航栏“空调”悬停菜单中“新风空调”是另一个并列入口（@e81），与“大1匹”（@e73）不是同一项。用例把“大1匹”与“新风空调”关联，与站点实际信息架构不符。
2. 该页面商品价格为 ￥1763 和 ￥1764，不存在 3058。用例设定的期望价格 3058 在“大1匹”页面不成立。

备注：用例文案写“大一匹”（汉字一），站点实际文案为“大1匹”（数字1），执行时按实际文案定位，不影响判定。

**实验信号（评估 agent-browser 是否满足需求）**

| 信号 | 值 |
|------|----|
| 重新 snapshot 次数 | 2（首页一次、悬停展开二级菜单后一次） |
| 因 ref 失效/找不到元素而重试次数 | 1（open 回首页后旧 ref @e32 失效，re-snapshot 后恢复） |
| 能力缺口 | 无。agent-browser 的 hover + re-snapshot 能正确展开并捕获二级菜单，定位与断言链路完整；本用例失败是用例预期与站点实际不符，非工具能力问题。 |

---
