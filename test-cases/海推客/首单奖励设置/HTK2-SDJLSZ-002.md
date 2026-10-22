---
用例编号: HTK2-SDJLSZ-002
模块: 首单奖励设置
功能点: 规则设置-空值校验
用例标题: 首单销售额或佣金金额留空应拦截提示
用例类型: 异常
设计技法: 错误推测
优先级: P2
version: 1
last-updated: 2026-10-21
---

## 前置条件
- admin-new 运营账号已登录（凭据见 _CREDENTIALS.md，key: admin-new）

## 测试数据
- 起始路径: /retail/first-order-reward-configs
- 两个金额字段均留空

## 测试步骤
1. 点击"设置首单激励"
2. 不填任何值直接点确认

## 预期结果
- 拦截保存并提示必填

<!--
实跑记录（2026-10-21，admin-new）：
- 空提交 → 两框下方红色提示"请输入首单销售额""请输入奖励金额"，弹窗不关（截图 screenshots/04c-empty-submit.png）
- 结论：通过
-->
