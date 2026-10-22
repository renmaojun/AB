---
用例编号: HTK2-SDJLMX-016
模块: 首单奖励明细
功能点: 退货款明细关联跳转
用例标题: 退货款明细点击关联订单跳转订单详情
用例类型: 功能
设计技法: 场景法
优先级: P2
version: 1
last-updated: 2026-10-21
---

## 前置条件
- admin-new 运营账号已登录；退货款明细含关联订单

## 测试数据
- 起始路径: /retail/first-order-rewards

## 测试步骤
1. 进入海推客/首单奖励明细页，切到"退货款明细"tab
2. 在明细行点击"查看订单明细"链接
3. 观察跳转目标

## 预期结果
- 跳转至对应订单详情页

<!--
实跑记录（2026-10-21，admin-new）：
- 点"查看订单明细"（链接为 a onclick，用 ref 直点有效；find text/find role link 点不中）→ 新 tab 开 /retail/orders?tab=refunds&buyerName=17800000036
- 结论：通过。CSV 跳转目标【待确认】→ 实为关联订单页 tab=refunds + buyerName 参数
-->
