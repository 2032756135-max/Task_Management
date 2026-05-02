const { spawn } = require('child_process');
const assert = require('assert');
const XLSX = require('xlsx');

const baseUrl = 'http://127.0.0.1:3000';

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function api(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, options);
  const ct = res.headers.get('content-type') || '';
  const body = ct.includes('application/json') ? await res.json() : await res.arrayBuffer();
  if (!res.ok) throw new Error(`${path} ${res.status}: ${typeof body === 'object' && body.message ? body.message : '请求失败'}`);
  return { res, body };
}

async function run() {
  const server = spawn('node', ['server.js'], { stdio: 'inherit' });
  try {
    for (let i = 0; i < 20; i++) {
      try {
        await fetch(`${baseUrl}/`);
        break;
      } catch {
        await delay(250);
      }
    }
    const username = `u${Date.now()}`;
    const password = '123456';

    const register = await api('/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
    });
    assert.equal(register.body.message, '注册成功');

    const login = await api('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
    });
    assert.ok(login.body.token);
    const authHeader = { 'Content-Type': 'application/json', Authorization: `Bearer ${login.body.token}` };

    const created = await api('/api/tasks', {
      method: 'POST', headers: authHeader,
      body: JSON.stringify({ title: '冒烟任务', category: '测试', priority: 'high', dueDate: '2099-12-31' })
    });
    assert.equal(created.body.title, '冒烟任务');

    const taskId = created.body.id;
    await api(`/api/tasks/${taskId}`, {
      method: 'PUT', headers: authHeader, body: JSON.stringify({ status: 'doing', notes: '更新备注' })
    });

    const list = await api('/api/tasks', { headers: authHeader });
    assert.ok(Array.isArray(list.body) && list.body.length >= 1);

    const report = await api('/api/report/weekly', { headers: authHeader });
    assert.ok(typeof report.body.total === 'number');

    const exported = await api('/api/tasks/export', { headers: authHeader });
    const wb = XLSX.read(Buffer.from(exported.body), { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    assert.ok(rows.length >= 1);

    const importSheet = XLSX.utils.json_to_sheet([{ title: '导入任务', category: '导入', priority: 'low' }]);
    const importBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(importBook, importSheet, 'Tasks');
    const importBuffer = XLSX.write(importBook, { type: 'buffer', bookType: 'xlsx' });
    const imported = await api('/api/tasks/import', {
      method: 'POST', headers: authHeader,
      body: JSON.stringify({ base64: Buffer.from(importBuffer).toString('base64') })
    });
    assert.ok(String(imported.body.message).includes('成功导入'));

    await api(`/api/tasks/${taskId}`, { method: 'DELETE', headers: authHeader });

    console.log('✅ Smoke test passed');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('❌ Smoke test failed:', err.message);
  process.exit(1);
});
