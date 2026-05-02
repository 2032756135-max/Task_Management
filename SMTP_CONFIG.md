# SMTP 配置指南 - QQ 邮箱

## 📧 当前状态

**表现症状:** `535 Login fail. Account is abnormal, service is not open, password is incorrect, login frequency limited, or system is busy`

这说明SMTP认证失败。

## ✅ 解决步骤

### 步骤 1: 启用SMTP服务

1. 登录 QQ 邮箱: https://mail.qq.com
2. 点击右上角 **设置** → **账户**
3. 在 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务** 部分
4. 找到 **SMTP 服务**，确保状态为 **✓ 已启用**
5. 如果显示 **关闭**，点击按钮开启

### 步骤 2: 生成新的授权码

1. 在同一个设置页面，找到 **生成授权码** 选项
2. 点击 **生成** 按钮
3. 按照提示完成验证（可能需要短信验证）
4. 复制生成的新授权码

### 步骤 3: 更新配置

编辑 `.env` 文件，将新授权码填入：

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=2002756135@qq.com
SMTP_PASS=新授权码
PORT=3000
```

### 步骤 4: 测试配置

运行测试脚本验证配置是否正确：

```bash
npm test
```

或单独测试SMTP：

```bash
node test-smtp.js
```

## 🔧 其他邮箱配置参考

如果QQ邮箱有问题，也可以尝试其他邮箱服务商：

| 邮箱 | SMTP地址 | 端口 | 端口类型 |
|------|---------|------|--------|
| Gmail | smtp.gmail.com | 587 | TLS |
| 163 邮箱 | smtp.163.com | 465 | SSL |
| 阿里邮箱 | smtp.aliyun.com | 465 | SSL |
| Outlook | smtp-mail.outlook.com | 587 | TLS |

## 📝 常见问题

**Q: 为什么显示"登录失败"？**
A: 最常见的原因是：
- 授权码输入错误
- SMTP服务未启用
- 多次失败登录导致账户被临时限制

**Q: 重新生成授权码后还是失败？**
A: 
- 等待 5-10 分钟，QQ 邮箱更新权限可能需要时间
- 尝试从其他IP地址访问
- 联系QQ邮箱客服

**Q: 可以用邮箱密码代替授权码吗？**
A: 不建议。授权码是专门为SMTP生成的安全密钥，安全性更高。

## 🧪 测试已配置的SMTP

```bash
# 发送测试邮件
node test-smtp.js

# 或通过API发送
curl -X POST http://localhost:3000/api/send-reminder/{taskId} \
  -H "Authorization: Bearer {token}"
```

## 📞 获得帮助

如问题仍未解决，请：
1. 检查网络连接是否正常
2. 确认授权码完整无误（区分大小写）
3. 尝试用新的授权码重新配置
4. 查看 QQ 邮箱官方帮助: https://help.mail.qq.com/detail/108/1023
