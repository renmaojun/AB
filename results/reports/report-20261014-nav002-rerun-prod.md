# UI 测试报告：TC-nav-002 重跑（prod）

| 字段 | 值 |
|------|----|
| 执行时间 | 2026-10-14 16:30 |
| 环境 | prod（基址 https://mall.hisense.com） |
| 目标站点 | https://mall.hisense.com/ |
| Session | ui-test |
| 执行范围 | 单条 TC-nav-002（用例修正后重跑） |
| agent-browser 版本 | 0.27.0 |

## 汇总

| 状态 | 数量 |
|------|------|
| 通过 | 1 |
| 失败 | 0 |
| 阻塞 | 0 |
| 总计 | 1 |

## 用例结果

### TC-nav-002: 点击导航栏“空调-大1匹”应进入大1匹空调筛选页且存在价格 1763 的空调商品

| 元数据 | 值 |
|--------|----|
| 用例编号 | TC-nav-002 |
| 模块 | 导航 |
| 功能点 | 顶部导航栏空调二级分类入口 |
| 用例类型 | 功能 |
| 设计技法 | 场景法 |
| 优先级 | P1 |
| 用例版本 | 2 |
| 状态 | 通过 |
| 开始 | 2026-10-14 16:30 |
| 结束 | 2026-10-14 16:33 |
| 耗时 | 约 3 分钟 |

**命令轨迹**

| # | 意图 | 命令 |
|---|------|------|
| 1 | 打开生产站首页 | `agent-browser --session ui-test open https://mall.hisense.com/` |
| 2 | 拍首页快照定位空调（空调=@e32） | `agent-browser --session ui-test snapshot -i` |
| 3 | 悬停空调展开二级菜单，re-snapshot（大1匹=@e73） | `agent-browser --session ui-test hover @e32` + `snapshot -i` |
| 4 | 点击“大1匹” | `agent-browser --session ui-test click @e73` |
| 5 | 取跳转后 URL 并读正文 | `agent-browser --session ui-test get url` + `get text body` |
| 6 | 截图留证 | `agent-browser --session ui-test screenshot results/screenshots/TC-nav-002-prod-rerun.png` |

**预期 vs 实际**

| # | 预期结果 | 实际证据 | 判定 |
|---|----------|----------|------|
| 1 | 点击后页面发生跳转（URL 相对首页变化） | URL 由 `/` 变为 `/search?fcid=64` | 通过 |
| 2 | 目标页面为大1匹空调筛选页（展示大1匹空调商品） | 页面筛选条件“空调类型=壁挂式空调”，商品均为大1匹空调（E370、科龙QS1） | 通过 |
| 3 | 目标页面商品列表中存在价格为 1763 的空调商品 | 商品 KFR-26GW/E370-X1 海信大1匹 E370，价格 ￥1763 | 通过 |
| 4 | 目标页面能正常拍到快照（非错误页/空白页） | 正常拍到页面内容与截图 | 通过 |

**证据**

- 截图：`results/screenshots/TC-nav-002-prod-rerun.png`
- 关键证据：结果页 URL=`https://mall.hisense.com/search?fcid=64`，商品 E370 ￥1763、科龙 QS1 ￥1764，共2条

**错误信息**

N/A

**实验信号（评估 agent-browser 是否满足需求）**

| 信号 | 值 |
|------|----|
| 重新 snapshot 次数 | 2（首页一次、悬停展开二级菜单后一次） |
| 因 ref 失效/找不到元素而重试次数 | 0 |
| 能力缺口 | 无。hover 展开二级菜单 + re-snapshot + 点击 + 读正文断言，链路完整顺畅。 |

---
