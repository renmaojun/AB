# UI 测试报告：海信商城搜索冒烟（prod）

| 字段 | 值 |
|------|----|
| 执行时间 | 2026-10-14 15:10 |
| 环境 | prod（基址 https://mall.hisense.com） |
| 目标站点 | https://mall.hisense.com/ |
| Session | ui-test |
| 执行范围 | 单条 TC-search-001 |
| agent-browser 版本 | 0.27.0 |

## 汇总

| 状态 | 数量 |
|------|------|
| 通过 | 1 |
| 失败 | 0 |
| 阻塞 | 0 |
| 总计 | 1 |

## 用例结果

### TC-search-001: 首页搜索框输入关键词后应跳转到搜索结果页并展示相关商品

| 元数据 | 值 |
|--------|----|
| 用例编号 | TC-search-001 |
| 模块 | 搜索 |
| 功能点 | 首页关键词搜索 |
| 用例类型 | 冒烟 |
| 设计技法 | 场景法 |
| 优先级 | P0 |
| 用例版本 | 2 |
| 状态 | 通过 |
| 开始 | 2026-10-14 15:10 |
| 结束 | 2026-10-14 15:14 |
| 耗时 | 约 4 分钟（含通道重试） |

**命令轨迹**

| # | 意图 | 命令 |
|---|------|------|
| 1 | 打开生产站首页（基址 https://mall.hisense.com + 起始路径 /） | `agent-browser --session ui-test open https://mall.hisense.com/` |
| 2 | 等待 DOM 加载 | `agent-browser --session ui-test wait --load domcontentloaded` |
| 3 | 确认首页标题 | `agent-browser --session ui-test get title` |
| 4 | 拍交互快照定位搜索框（得到搜索框 @e38） | `agent-browser --session ui-test snapshot -i` |
| 5 | 在搜索框填入关键词 | `agent-browser --session ui-test fill @e38 "电视"` |
| 6 | 回车提交搜索 | `agent-browser --session ui-test press Enter` |
| 7 | 取跳转后 URL | `agent-browser --session ui-test get url` |
| 8 | 取结果页标题 | `agent-browser --session ui-test get title` |
| 9 | 拍结果页快照确认商品内容 | `agent-browser --session ui-test snapshot` |
| 10 | 截图留证 | `agent-browser --session ui-test screenshot results/screenshots/TC-search-001-prod-result.png` |
| 11 | 关闭会话 | `agent-browser --session ui-test close` |

**预期 vs 实际**

| # | 预期结果 | 实际证据 | 判定 |
|---|----------|----------|------|
| 1 | 提交搜索后 URL 进入搜索结果页（路径含 search，查询串含关键词） | URL=`https://mall.hisense.com/search?q=%E7%94%B5%E8%A7%86`（%E7%94%B5%E8%A7%86=电视） | 通过 |
| 2 | 结果页标题应包含“搜索” | 标题=`海信商城-商品搜索` | 通过 |
| 3 | 结果页应展示与关键词相关的商品 | 结果页列出大量电视商品（海信75U65Q ￥9799、85U65Q ￥12599、Vidda发现X、100A7N 等），分页显示“共231条”，搜索框回显“电视” | 通过 |

**证据**

- 截图：`results/screenshots/TC-search-001-prod-result.png`
- 关键证据：首页标题=`海信官方商城 - 海信集团直营...`；结果页 URL=`https://mall.hisense.com/search?q=%E7%94%B5%E8%A7%86`，标题=`海信商城-商品搜索`，结果 231 条

**错误信息**

N/A

**实验信号（评估 agent-browser 是否满足需求）**

| 信号 | 值 |
|------|----|
| 重新 snapshot 次数 | 1（提交后结果页重新 snapshot） |
| 因 ref 失效/找不到元素而重试次数 | 0 |
| 能力缺口 | 无。生产环境首页加载正常，搜索框为唯一 textbox，核心循环顺畅走通，断言证据充分。 |

---
