# Task Management Workbench

一个轻量级的工作任务管理网站，适合个人和小团队快速搭建“待办 + 看板 + 周报 + Excel导入导出 + 邮件提醒”的任务协作环境。

## 网站用途

这个网站的核心用途是帮助你把分散的工作事项统一管理，减少遗漏，并可视化跟踪执行进度：

- **统一记录任务**：快速创建任务，补充分类、优先级、截止日期、备注信息。
- **看板化推进流程**：通过拖拽在「待办 / 进行中 / 已完成」之间切换，直观看到工作流状态。
- **预警临期与逾期**：自动计算到期提醒（24小时、3天内、已逾期），降低超期风险。
- **沉淀每周数据**：按最近7天生成任务汇总，便于周会复盘与工作汇报。
- **对接Excel流程**：支持任务导出为 Excel，也可批量导入已有 Excel 任务。
- **邮件提醒责任人**：可按任务发送邮件提醒（需配置 SMTP）。

## 功能清单

- 用户注册 / 登录 / 退出
- 任务创建 / 编辑 / 删除
- 任务状态拖拽更新（todo / doing / done）
- 任务搜索（标题、分类）
- 临期预警与逾期标记
- 周报统计接口
- Excel 导入导出
- SMTP 邮件提醒

## 快速开始

```bash
npm install
npm start
```

启动后访问：

- `http://localhost:3000`

默认管理员账号（首次初始化自动创建）：

- 用户名：`admin`
- 密码：`admin123`

## 测试

运行冒烟测试（会自动启动服务并验证主要 API 流程）：

```bash
npm test
```

## 可选：邮件提醒配置

发送提醒邮件前，需要配置以下环境变量：

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

示例（Linux/macOS）：

```bash
export SMTP_HOST=smtp.example.com
export SMTP_PORT=465
export SMTP_USER=bot@example.com
export SMTP_PASS=your_password
npm start
```
