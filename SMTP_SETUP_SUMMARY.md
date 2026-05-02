# 任务管理系统 - SMTP配置总结

## ✅ 已完成的工作

### 1. **系统SMTP代码集成**
   - ✓ 在 `server.js` 中已有邮件发送功能
   - ✓ 依赖项 `nodemailer` v8.0.7 已安装
   - ✓ API 端点 `POST /api/send-reminder/:id` 已实现

### 2. **环境变量管理**
   - ✓ 安装了 `dotenv` 包 v16.4.1
   - ✓ `server.js` 已加载 `require('dotenv').config()`
   - ✓ 创建了 `.env` 配置文件
   - ✓ 创建了 `.env.example` 模板
   - ✓ 更新了 `.gitignore` 保护敏感信息

### 3. **提供了QQ邮箱配置**
   - ✓ 配置了 SMTP_HOST: smtp.qq.com
   - ✓ 配置了 SMTP_PORT: 465 (SSL)
   - ✓ 配置了 SMTP_USER: 2002756135@qq.com
   - ✓ 填入了授权码 SMTP_PASS

### 4. **测试工具**
   - ✓ 创建了 `test-smtp.js` - 诊断工具
   - ✓ 创建了 `send-test-email.js` - 测试发送工具
   - ✓ 都支持详细的错误诊断和提示

### 5. **文档**
   - ✓ 更新了 README.md 的SMTP配置说明
   - ✓ 创建了 SMTP_CONFIG.md 故障排查指南

---

## ⚠️ 当前问题

### QQ邮箱认证失败
**错误代码:** `535 Login fail. Account is abnormal, service is not open, password is incorrect, login frequency limited, or system is busy`

**可能原因:**
1. 授权码不正确或已过期
2. QQ邮箱SMTP服务未启用
3. 多次失败登录导致账户被限制
4. 账户存在安全问题

---

## 🔧 下一步操作

### 必要步骤（用户需完成）

1. **访问QQ邮箱设置**
   ```
   https://mail.qq.com → 设置 → 账户
   ```

2. **启用SMTP服务**
   - 找到 "POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
   - 确保 SMTP 服务状态为 ✓ 已启用

3. **重新生成授权码**
   - 点击 "生成新密码" 或 "生成授权码"
   - 完成身份验证（可能需要短信验证）
   - 复制新生成的授权码

4. **更新配置**
   - 编辑本项目的 `.env` 文件
   - 将新授权码替换 `SMTP_PASS=` 后的值
   
   ```env
   SMTP_HOST=smtp.qq.com
   SMTP_PORT=465
   SMTP_USER=2002756135@qq.com
   SMTP_PASS=新授权码
   ```

5. **测试配置**
   ```bash
   node test-smtp.js
   ```

---

## 📋 SMTP功能使用指南

### 启动服务
```bash
npm install
npm start
```

### 发送邮件提醒API

**创建任务时指定收件人:**
```bash
POST /api/tasks
Authorization: Bearer {token}

{
  "title": "重要任务",
  "dueDate": "2026-05-10",
  "ownerEmail": "2002756135@qq.com"
}
```

**发送邮件提醒:**
```bash
POST /api/send-reminder/{taskId}
Authorization: Bearer {token}
```

**响应:**
```json
{
  "message": "邮件提醒已发送"
}
```

---

## 💡 替代方案

如果QQ邮箱一直无法使用，可以尝试其他邮箱服务商：

### Gmail (推荐)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password
```

配置步骤见 README.md

### 163邮箱
```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=your-email@163.com
SMTP_PASS=authorization-code
```

### 其他选项
- 阿里邮箱 (smtp.aliyun.com:465)
- Outlook (smtp-mail.outlook.com:587)
- 企业邮箱等

---

## 🧪 诊断命令

### 检查SMTP配置
```bash
node test-smtp.js
```

### 查看.env配置
```bash
cat .env
```

### 查看日志（需要服务运行）
```bash
npm start
# 观察输出信息
```

---

## ✨ 系统功能状态

| 功能 | 状态 | 说明 |
|------|------|------|
| 用户注册/登录 | ✅ 正常 | 支持用户管理 |
| 任务管理 | ✅ 正常 | CRUD操作完整 |
| 任务分类/优先级 | ✅ 正常 | 支持自定义标签 |
| 看板视图 | ✅ 正常 | Todo/Doing/Done |
| Excel导入导出 | ✅ 正常 | 支持批量操作 |
| 周报统计 | ✅ 正常 | 7天数据汇总 |
| **邮件提醒** | ⏳ **待配置** | 需要有效的SMTP凭证 |

---

## 📞 需要帮助？

1. 检查 SMTP_CONFIG.md 获得详细故障排查
2. 查看 README.md 的配置示例
3. 运行 `node test-smtp.js` 诊断问题
4. 尝试其他邮箱服务商的配置

---

**最后更新:** 2026-05-02
**配置版本:** v1.0
