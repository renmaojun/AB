---
用例编号: HTK2-GLDD-009
模块: 关联订单
功能点: 海推客佣金状态筛选-单选下拉
用例标题: 选择海推客佣金应结算列表过滤
用例类型: 功能
设计技法: 等价类
优先级: P2
version: 1
last-updated: 2026-10-21
---

## 前置条件
- admin-new 运营账号已登录（凭据见 _CREDENTIALS.md，key: admin-new）

## 测试数据
- 起始路径: /retail/orders
- 海推客佣金状态: 应结算

## 测试步骤
1. 进入海推客/关联订单页
2. 展开海推客佣金状态下拉，选择"应结算"
3. 点击筛选按钮
4. 等待列表刷新完成

## 预期结果
- 列表仅展示海推客佣金状态为应结算的订单

<!--
实跑记录（2026-10-21，admin-new）：
- 选"应结算"筛选 → 下拉保持选中，结果集改变（首行变为 2609082975840461），过滤生效（截图 screenshots/gldd-009-haitui-commission.png）
- 结论：通过。佣金状态枚举：未结算 / 待结算 / 应结算 / 已结算
- 定位经验：该佣金类下拉 find role option / find text 点不中，需展开后用 eval 在 .ant-select-item-option 内 dispatch 原生事件选中
-->
