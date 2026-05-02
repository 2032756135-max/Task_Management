# 🚀 快速参考卡片 - SMTP配置

## 📋 当前状态

**网站:** Task Management Workbench  
**SMTP状态:** ✅ 已验证并正常工作  
**邮箱:** 2032756135@qq.com (QQ邮箱)  
**授权码:** `yevexnbgfjuceahd` (✅ 已验证)

---

## ⚡ 三步快速修复

### 1️⃣ 登录QQ邮箱
```
https://mail.qq.com
```

### 2️⃣ 生成新授权码
```
设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
→ 确保SMTP已启用 ✓
→ 生成新授权码
```

### 3️⃣ 更新.env文件
```bash
# 编辑 .env 文件最后一行
SMTP_PASS=新生成的授权码

# 然后测试
node test-smtp.js
```

---

## 🔍 诊断命令

```bash
# 测试SMTP连接
node test-smtp.js

# 启动服务
npm start

# 运行冒烟测试
npm test
```

---

## 📧 发送邮件流程

1. **创建用户账户**
   ```json
   POST /api/register
   { "username": "user1", "password": "pass123" }
   ```

2. **登录获取token**
   ```json
   POST /api/login
   { "username": "user1", "password": "pass123" }
   ```

3. **创建任务（指定邮箱）**
   ```json
   POST /api/tasks
   Authorization: Bearer {token}
   {
     "title": "重要任务",
     "ownerEmail": "recipient@qq.com",
     "dueDate": "2026-05-10"
   }
   ```

4. **发送提醒邮件**
   ```bash
   POST /api/send-reminder/{taskId}
   Authorization: Bearer {token}
   ```

---

## 🛠️ 常见问题速查

| 问题 | 解决方案 |
|------|--------|
| `535 Login fail` | 重新生成QQ授权码，等待5分钟后重试 |
| `ENOTFOUND smtp.qq.com` | 检查网络连接 |
| 邮件未收到 | 检查收件/垃圾箱，确保ownerEmail正确 |
| SMTP不可用 | 检查.env文件是否正确，确保4个参数都已填列 |

---

## 💾 配置文件检查清单

- [ ] `.env` 文件存在且填写了SMTP_PASS
- [ ] `.env` 已添加到 `.gitignore` (保护密钥)
- [ ] `package.json` 包含 `dotenv` 依赖
- [ ] `server.js` 第一行是 `require('dotenv').config()`
- [ ] `node_modules/` 已安装所有依赖

---

## 📚 详细文档

- **README.md** - 项目概览和基础配置
- **SMTP_CONFIG.md** - 详细故障排查指南  
- **SMTP_SETUP_SUMMARY.md** - 完整配置总结

---

**最后测试时间:** 2026-05-02 15:15 UTC  
**测试结果:** ✅ SMTP连接成功，邮件发送成功
