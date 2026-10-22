---
用例编号: HTK2-WDXY-001
模块: 微店海推客协议
功能点: 内容编辑-协议名称空值校验
用例标题: 协议名称留空保存应拦截提示
用例类型: 异常
设计技法: 错误推测
优先级: P2
version: 1
last-updated: 2026-10-21
---

## 前置条件
- admin-new 运营账号已登录（凭据见 _CREDENTIALS.md，key: admin-new）

## 测试数据
- 起始路径: /retail/protocol-ec

## 测试步骤
1. 进入海推客/微店海推客协议页
2. 清空协议名称
3. 点击保存

## 预期结果
- 拦截保存并提示协议名称必填

<!--
实跑记录（2026-10-21，admin-new）：
- 清空协议名称点保存 → 名称框红边框+红色提示"请输入协议名称"，拦截（截图 screenshots/wdxy-001-empty-name.png）
- 结论：通过。测后已将协议名恢复原值
- 定位经验：fill "" 清不掉输入框，需 focus + Control+a + Delete
-->
