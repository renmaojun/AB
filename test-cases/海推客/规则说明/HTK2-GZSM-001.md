---
用例编号: HTK2-GZSM-001
模块: 规则说明
功能点: 提交-图片格式校验
用例标题: 上传非法格式图片应拦截提示
用例类型: 异常
设计技法: 错误推测
优先级: P2
version: 1
last-updated: 2026-10-21
---

## 前置条件
- admin-new 运营账号已登录（凭据见 _CREDENTIALS.md，key: admin-new）

## 测试数据
- 起始路径: /retail/rule-desc
- 图片: test.bmp（非法格式）

## 测试步骤
1. 进入海推客/规则说明页
2. 在图片上传区上传 test.bmp
3. 观察校验

## 预期结果
- 拦截并提示仅支持 JPG/PNG/GIF 格式

<!--
实跑记录（2026-10-21，admin-new）：
- 上传 test.bmp → 红色错误"图片类型不正确 / 请上传JPG，PNG或GIF类型的图片"（截图 screenshots/gzsm-001-bmp.png）
- 结论：通过。CSV 的格式清单【待确认】→ 确认仅 JPG/PNG/GIF
-->
