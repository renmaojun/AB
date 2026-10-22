---
用例编号: HTK2-SDJLSZ-001
模块: 首单奖励设置
功能点: 列表展示
用例标题: 列表加载展示8列规定字段
用例类型: UI
设计技法: 检查表
优先级: P2
version: 1
last-updated: 2026-10-21
---

## 前置条件
- admin-new 运营账号已登录（凭据见 _CREDENTIALS.md，key: admin-new）

## 测试数据
- 起始路径: /retail/first-order-reward-configs

## 测试步骤
1. 进入海推客/首单奖励设置页
2. 查看列表表头

## 预期结果
- 表头依次展示：序号、首单销售额、佣金金额、操作人、操作时间、状态、审核状态、操作，共 8 列

<!--
实跑记录（2026-10-21，admin-new）：
- snapshot 读到 8 列表头，与 CSV 完全一致
- 缺陷关联：该页"状态""审核状态"两列在页面不渲染（dogfood ISSUE-001，见 results/dogfood-haitui/report.md），数据在 DOM 存在但页面看不到
-->
