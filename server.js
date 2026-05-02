const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'tasks.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function ensureDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [{ id: 'u1', username: 'admin', password: 'admin123', role: 'admin' }], tasks: [], sessions: {} }, null, 2), 'utf8');
  }
}
const readDb = () => (ensureDb(), JSON.parse(fs.readFileSync(DB_FILE, 'utf8')));
const writeDb = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: '未登录' });
  const db = readDb();
  const uid = db.sessions[token];
  const user = db.users.find((u) => u.id === uid);
  if (!user) return res.status(401).json({ message: '登录失效' });
  req.user = user;
  req.db = db;
  req.token = token;
  next();
}

function computeWarning(task) {
  if (!task.dueDate || task.status === 'done') return null;
  const due = new Date(`${task.dueDate}T23:59:59`);
  const ms = due - new Date();
  const hours = Math.floor(ms / 36e5);
  if (ms < 0) return '已逾期';
  if (hours <= 24) return '24小时内到期';
  if (hours <= 72) return '3天内到期';
  return null;
}

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT), secure: Number(SMTP_PORT) === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
}

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: '用户名密码必填' });
  const db = readDb();
  if (db.users.some((u) => u.username === username)) return res.status(400).json({ message: '用户已存在' });
  const user = { id: Date.now().toString(), username, password, role: 'user' };
  db.users.push(user);
  writeDb(db);
  res.status(201).json({ message: '注册成功' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  const user = db.users.find((u) => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: '用户名或密码错误' });
  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[token] = user.id;
  writeDb(db);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

app.post('/api/logout', auth, (req, res) => {
  delete req.db.sessions[req.token];
  writeDb(req.db);
  res.json({ message: '退出成功' });
});

app.get('/api/tasks', auth, (req, res) => {
  const tasks = req.db.tasks.filter((t) => t.userId === req.user.id || req.user.role === 'admin').map((t) => ({ ...t, warning: computeWarning(t) }));
  res.json(tasks);
});

app.post('/api/tasks', auth, (req, res) => {
  const { title, category, priority, dueDate, notes } = req.body;
  if (!title) return res.status(400).json({ message: '任务标题必填' });
  const task = { id: Date.now().toString(), userId: req.user.id, title, category: category || '未分类', priority: priority || 'medium', dueDate: dueDate || '', notes: notes || '', ownerEmail: req.body.ownerEmail || '', status: 'todo', lastReminderAt: '', createdAt: new Date().toISOString() };
  req.db.tasks.push(task); writeDb(req.db); res.status(201).json(task);
});

app.put('/api/tasks/:id', auth, (req, res) => {
  const idx = req.db.tasks.findIndex((t) => t.id === req.params.id && (t.userId === req.user.id || req.user.role === 'admin'));
  if (idx === -1) return res.status(404).json({ message: '任务不存在' });
  req.db.tasks[idx] = { ...req.db.tasks[idx], ...req.body };
  writeDb(req.db); res.json(req.db.tasks[idx]);
});

app.delete('/api/tasks/:id', auth, (req, res) => {
  const before = req.db.tasks.length;
  req.db.tasks = req.db.tasks.filter((t) => !(t.id === req.params.id && (t.userId === req.user.id || req.user.role === 'admin')));
  if (req.db.tasks.length === before) return res.status(404).json({ message: '任务不存在' });
  writeDb(req.db);
  res.status(204).send();
});

app.get('/api/report/weekly', auth, (req, res) => {
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const tasks = req.db.tasks.filter((t) => (t.userId === req.user.id || req.user.role === 'admin') && new Date(t.createdAt || now) >= weekAgo);
  const summary = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === 'done').length,
    doing: tasks.filter((t) => t.status === 'doing').length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    overdue: tasks.filter((t) => computeWarning(t) === '已逾期').length,
    byCategory: tasks.reduce((a, t) => ((a[t.category] = (a[t.category] || 0) + 1), a), {})
  };
  res.json(summary);
});

app.get('/api/tasks/export', auth, (req, res) => {
  const tasks = req.db.tasks.filter((t) => t.userId === req.user.id || req.user.role === 'admin');
  const ws = XLSX.utils.json_to_sheet(tasks);
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="tasks.xlsx"');
  res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(buffer);
});

app.post('/api/tasks/import', auth, (req, res) => {
  const { base64 } = req.body;
  if (!base64) return res.status(400).json({ message: '缺少文件内容' });
  const wb = XLSX.read(Buffer.from(base64, 'base64'), { type: 'buffer' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  rows.forEach((r, i) => req.db.tasks.push({ id: `${Date.now()}-${i}-${Math.random().toString(16).slice(2,8)}`, userId: req.user.id, title: r.title || r.标题 || '未命名任务', category: r.category || r.分类 || '未分类', priority: ['high','medium','low'].includes(r.priority) ? r.priority : 'medium', dueDate: r.dueDate || '', notes: r.notes || '', ownerEmail: r.ownerEmail || '', status: ['todo','doing','done'].includes(r.status) ? r.status : 'todo', createdAt: new Date().toISOString(), lastReminderAt: '' }));
  writeDb(req.db); res.json({ message: `成功导入 ${rows.length} 条任务` });
});

app.post('/api/send-reminder/:id', auth, async (req, res) => {
  const task = req.db.tasks.find((t) => t.id === req.params.id && (t.userId === req.user.id || req.user.role === 'admin'));
  if (!task) return res.status(404).json({ message: '任务不存在' });
  const transporter = getTransporter();
  if (!transporter) return res.status(400).json({ message: '未配置SMTP' });
  if (!task.ownerEmail) return res.status(400).json({ message: '该任务未设置提醒邮箱' });
  await transporter.sendMail({ from: process.env.SMTP_USER, to: task.ownerEmail, subject: `任务提醒：${task.title}`, text: `任务状态：${task.status}，截止：${task.dueDate || '未设置'}，备注：${task.notes || '无'}` });
  task.lastReminderAt = new Date().toISOString(); writeDb(req.db); res.json({ message: '邮件提醒已发送' });
});

app.listen(PORT, () => { ensureDb(); console.log(`http://localhost:${PORT}`); });
