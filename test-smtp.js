const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
  try {
    console.log('=== SMTP 连接测试 ===\n');
    console.log('配置信息:');
    console.log('  Host:', process.env.SMTP_HOST);
    console.log('  Port:', process.env.SMTP_PORT);
    console.log('  User:', process.env.SMTP_USER);
    console.log('  Secure (SSL):', process.env.SMTP_PORT === '465');
    console.log('');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    console.log('正在验证SMTP连接...');
    const verified = await transporter.verify();
    
    if (verified) {
      console.log('✅ SMTP连接成功！\n');
      
      console.log('正在发送测试邮件...');
      const info = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: '2032756135@qq.com',
        subject: '✅ 任务管理系统 - SMTP测试邮件',
        html: `
          <h2>SMTP配置成功！</h2>
          <p>这是来自任务管理系统的测试邮件。</p>
          <p><strong>时间:</strong> ${new Date().toLocaleString('zh-CN')}</p>
          <p>系统已成功配置SMTP邮件功能，可以发送任务提醒邮件。</p>
          <hr />
          <p style="color: #666; font-size: 12px;">来自: Task Management Workbench</p>
        `
      });

      console.log('✅ 邮件发送成功！');
      console.log('  Message ID:', info.messageId);
      console.log('  Response:', info.response);
      console.log('\n📧 邮件已发送到: 2002756135@qq.com');
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ 错误:', err.message);
    console.error('\n详细信息:');
    console.error('  Code:', err.code);
    console.error('  Response:', err.response);
    
    if (err.code === 'EAUTH') {
      console.error('\n🔍 认证失败 - 可能的原因:');
      console.error('  1. 授权码不正确');
      console.error('  2. QQ邮箱SMTP服务未启用');
      console.error('  3. 登录频率限制');
      console.error('  4. 账户异常或服务受限');
      console.error('\n💡 解决方案:');
      console.error('  访问: https://mail.qq.com');
      console.error('  路径: 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务');
      console.error('  确保SMTP已启用，重新生成授权码');
    }
    
    process.exit(1);
  }
}

testSMTP();
