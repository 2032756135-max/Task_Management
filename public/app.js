let token = localStorage.getItem('token') || '';
let allTasks = [];

const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
const $ = (id) => document.getElementById(id);

function showToast(msg) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2200);
}

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) throw new Error(data?.message || `请求失败(${res.status})`);
  return data;
}

function setLoggedIn(on) {
  ['taskCard', 'boardCard', 'reportCard', 'excelCard'].forEach((id) => $(id).classList.toggle('hidden', !on));
  $('loginCard').classList.toggle('hidden', on);
  $('authBar').innerHTML = on ? '<button onclick="logout()">退出登录</button>' : '';
}

function validateAuth(username, password) {
  if (username.trim().length < 3) throw new Error('用户名至少 3 位');
  if (password.length < 6) throw new Error('密码至少 6 位');
}

async function register() {
  try {
    const username = $('username').value;
    const password = $('password').value;
    validateAuth(username, password);
    const d = await request('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    showToast(d.message || '注册成功');
  } catch (e) { showToast(e.message); }
}

async function login() {
  try {
    const username = $('username').value;
    const password = $('password').value;
    validateAuth(username, password);
    const d = await request('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    token = d.token;
    localStorage.setItem('token', token);
    setLoggedIn(true);
    await loadTasks();
    showToast(`欢迎回来，${d.user.username}`);
  } catch (e) { showToast(e.message); }
}

async function logout() {
  try { await request('/api/logout', { method: 'POST', headers: headers() }); } catch {}
  token = '';
  localStorage.removeItem('token');
  setLoggedIn(false);
}

$('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const p = Object.fromEntries(new FormData(e.target).entries());
    await request('/api/tasks', { method: 'POST', headers: headers(), body: JSON.stringify(p) });
    e.target.reset();
    await loadTasks();
    showToast('任务创建成功');
  } catch (err) { showToast(err.message); }
});

function taskCard(t) {
  return `<div class='task ${t.priority}' draggable='true' ondragstart="drag(event)" id='t-${t.id}'>
    <b>${t.title}</b>
    <div class='meta'>${t.category} | 优先级: ${t.priority}</div>
    <div class='meta'>截止: ${t.dueDate || '无'} ${t.warning ? `| ⚠️${t.warning}` : ''}</div>
    <div class='meta'>备注: ${t.notes || '无'}</div>
    <div class='actions'>
      <button onclick="sendReminder('${t.id}')">提醒</button>
      <button onclick="quickEdit('${t.id}')">编辑</button>
      <button onclick="delTask('${t.id}')">删除</button>
    </div>
  </div>`;
}

function renderTasks() {
  const q = $('searchInput').value.trim().toLowerCase();
  ['todo', 'doing', 'done'].forEach((s) => ($(s).innerHTML = ''));
  allTasks
    .filter((t) => !q || t.title.toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q))
    .forEach((t) => ($(t.status).innerHTML += taskCard(t)));
}

async function loadTasks() {
  try {
    allTasks = await request('/api/tasks', { headers: headers() });
    renderTasks();
  } catch (e) {
    if (e.message.includes('401')) setLoggedIn(false);
    showToast(e.message);
  }
}

function drag(ev) { ev.dataTransfer.setData('id', ev.target.id.replace('t-', '')); }

document.querySelectorAll('.list').forEach((el) => {
  el.ondragover = (e) => e.preventDefault();
  el.ondrop = async (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('id');
    try {
      await request(`/api/tasks/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status: e.currentTarget.id }) });
      await loadTasks();
    } catch (err) { showToast(err.message); }
  };
});

async function delTask(id) {
  if (!confirm('确定删除该任务吗？')) return;
  try { await request(`/api/tasks/${id}`, { method: 'DELETE', headers: headers() }); await loadTasks(); } catch (e) { showToast(e.message); }
}

async function quickEdit(id) {
  const t = allTasks.find((x) => x.id === id);
  const title = prompt('修改标题：', t?.title || '');
  if (!title) return;
  try { await request(`/api/tasks/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ title }) }); await loadTasks(); showToast('更新成功'); } catch (e) { showToast(e.message); }
}

async function sendReminder(id) {
  try { const d = await request(`/api/send-reminder/${id}`, { method: 'POST', headers: headers() }); showToast(d.message); } catch (e) { showToast(e.message); }
}

async function loadReport() {
  try { $('report').textContent = JSON.stringify(await request('/api/report/weekly', { headers: headers() }), null, 2); } catch (e) { showToast(e.message); }
}

async function exportExcel() {
  const r = await fetch('/api/tasks/export', { headers: headers() });
  if (!r.ok) return showToast('导出失败');
  const b = await r.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = 'tasks.xlsx';
  a.click();
}

async function importExcel() {
  const f = $('fileInput').files[0];
  if (!f) return showToast('请选择Excel文件');
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });
  try {
    const d = await request('/api/tasks/import', { method: 'POST', headers: headers(), body: JSON.stringify({ base64 }) });
    showToast(d.message);
    await loadTasks();
  } catch (e) { showToast(e.message); }
}

$('searchInput').addEventListener('input', renderTasks);
$('authForm').addEventListener('submit', (e) => { e.preventDefault(); login(); });

if (token) { setLoggedIn(true); loadTasks(); } else setLoggedIn(false);
