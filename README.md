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

## 可选：邮件提醒配置（SMTP）

如需使用邮件提醒功能，需要配置 SMTP 服务。

### 方式一：使用 .env 文件（推荐）

1. 复制环境变量配置模板：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的 SMTP 信息：

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

3. 启动服务：

```bash
npm start
```

### 常见邮箱服务商配置

| 服务商 | SMTP 地址 | 端口 | 安全方式 |
|--------|---------|------|--------|
| Gmail | smtp.gmail.com | 587 | TLS |
| QQ 邮箱 | smtp.qq.com | 465 | SSL |
| 163 邮箱 | smtp.163.com | 465 | SSL |
| 阿里邮箱 | smtp.aliyun.com | 465 | SSL |
| Outlook | smtp-mail.outlook.com | 587 | TLS |

### Gmail 配置步骤

1. 启用两步验证：https://myaccount.google.com/security/
2. 生成应用专用密码：https://myaccount.google.com/apppasswords
3. 将应用专用密码填入 `.env` 的 `SMTP_PASS` 字段

### 测试邮件提醒

1. 创建一个新任务，设置 `ownerEmail` 字段
2. 调用邮件提醒 API：`POST /api/send-reminder/:taskId`

如未配置 SMTP，调用提醒 API 会返回错误信息。

### 🔧 SMTP 配置故障排查

如遇到配置问题，参考 [SMTP_CONFIG.md](SMTP_CONFIG.md) 获得详细的故障排查指南。

运行测试脚本快速诊断 SMTP 配置：

```bash
node test-smtp.js
```

常见错误及解决方案：

| 错误 | 原因 | 解决方案 |
|------|------|--------|
| `535 Login fail` | 授权码不正确或SMTP未启用 | 重新生成授权码，确认SMTP已启用 |
| `535 Account is abnormal` | 账户异常或登录频率限制 | 等待5-10分钟后重试 |
| `ENOTFOUND smtp.xx.com` | 域名解析失败或网络问题 | 检查网络连接，确认SMTP地址正确 |
