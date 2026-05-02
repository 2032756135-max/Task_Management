let token = localStorage.getItem('token') || '';
let allTasks = [];
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
const $ = (id) => document.getElementById(id);

function setMessage(msg, ok = false) { $('authMsg').style.color = ok ? '#15803d' : '#b91c1c'; $('authMsg').textContent = msg; }
function setLoggedIn(on) {
  ['taskCard', 'toolsCard', 'boardCard'].forEach((id) => $(id).classList.toggle('hidden', !on));
  $('loginCard').classList.toggle('hidden', on);
  $('authBar').innerHTML = on ? '<button class="primary" onclick="logout()">退出登录</button>' : '';
}

async function api(url, opts = {}) {
  const res = await fetch(url, opts);
  if (res.status === 401) { token = ''; localStorage.removeItem('token'); setLoggedIn(false); throw new Error('登录失效'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || '请求失败');
  return data;
}

async function register() {
  try { await api('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: $('username').value.trim(), password: $('password').value.trim() }) }); setMessage('注册成功，请登录', true); }
  catch (e) { setMessage(e.message); }
}
async function login() {
  try {
    const d = await api('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: $('username').value.trim(), password: $('password').value.trim() }) });
    token = d.token; localStorage.setItem('token', token); setLoggedIn(true); await loadTasks(); setMessage('');
  } catch (e) { setMessage(e.message); }
}
async function logout() { try { await api('/api/logout', { method: 'POST', headers: headers() }); } catch (_) {} token = ''; localStorage.removeItem('token'); setLoggedIn(false); }

$('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  try { await api('/api/tasks', { method: 'POST', headers: headers(), body: JSON.stringify(payload) }); e.target.reset(); await loadTasks(); }
  catch (err) { alert(err.message); }
});

function taskCard(t) {
  return `<div class='task' draggable='true' ondragstart="drag(event)" id='t-${t.id}'>
    <b>${t.title}</b>
    <div class='meta'>${t.category || '未分类'} ｜ 优先级：${t.priority}</div>
    <div class='meta'>截止：${t.dueDate || '未设置'} ${t.warning ? `<span class='warn'>｜⚠️${t.warning}</span>` : ''}</div>
    <div class='meta'>${t.notes || ''}</div>
    <div class='actions'>
      <button onclick="sendReminder('${t.id}')">提醒</button>
      <button onclick="delTask('${t.id}')">删除</button>
    </div>
  </div>`;
}

function render(tasks) {
  ['todo', 'doing', 'done'].forEach((s) => $(s).innerHTML = '');
  tasks.forEach((t) => $(t.status).innerHTML += taskCard(t));
}

async function loadTasks() {
  allTasks = await api('/api/tasks', { headers: headers() });
  applySearch();
}

function applySearch() {
  const q = $('keyword').value.trim().toLowerCase();
  const data = !q ? allTasks : allTasks.filter((t) => (t.title + ' ' + (t.notes || '')).toLowerCase().includes(q));
  render(data);
}

function drag(ev) { ev.dataTransfer.setData('id', ev.target.id.replace('t-', '')); }
document.querySelectorAll('.list').forEach((el) => {
  el.ondragover = (e) => e.preventDefault();
  el.ondrop = async (e) => {
    e.preventDefault();
    try { await api(`/api/tasks/${e.dataTransfer.getData('id')}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status: e.currentTarget.id }) }); await loadTasks(); }
    catch (err) { alert(err.message); }
  };
});

async function delTask(id) { if (!confirm('确定删除任务？')) return; await api(`/api/tasks/${id}`, { method: 'DELETE', headers: headers() }); await loadTasks(); }
async function sendReminder(id) { try { const d = await api(`/api/send-reminder/${id}`, { method: 'POST', headers: headers() }); alert(d.message); } catch (e) { alert(e.message); } }
async function loadReport() { const d = await api('/api/report/weekly', { headers: headers() }); $('report').textContent = JSON.stringify(d, null, 2); }
async function exportExcel() { const res = await fetch('/api/tasks/export', { headers: headers() }); if (!res.ok) return alert('导出失败'); const blob = await res.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'tasks.xlsx'; a.click(); URL.revokeObjectURL(a.href); }
async function importExcel() {
  const f = $('fileInput').files[0]; if (!f) return alert('请选择Excel文件');
  const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(f); });
  const d = await api('/api/tasks/import', { method: 'POST', headers: headers(), body: JSON.stringify({ base64 }) });
  alert(d.message); await loadTasks();
}
$('keyword').addEventListener('input', applySearch);

if (token) { setLoggedIn(true); loadTasks().catch(() => setLoggedIn(false)); } else setLoggedIn(false);
