let token = localStorage.getItem('token') || '';
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

function setLoggedIn(on){['taskCard','boardCard','reportCard','excelCard'].forEach(id=>document.getElementById(id).classList.toggle('hidden',!on));document.getElementById('loginCard').classList.toggle('hidden',on);document.getElementById('authBar').innerHTML=on?'<button onclick="logout()">退出</button>':'';}

async function register(){const username=document.getElementById('username').value;const password=document.getElementById('password').value;const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});alert((await r.json()).message)}
async function login(){const username=document.getElementById('username').value;const password=document.getElementById('password').value;const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});const d=await r.json();if(d.token){token=d.token;localStorage.setItem('token',token);setLoggedIn(true);loadTasks()}else alert(d.message)}
async function logout(){await fetch('/api/logout',{method:'POST',headers:headers()});token='';localStorage.removeItem('token');setLoggedIn(false)}

document.getElementById('taskForm').addEventListener('submit',async e=>{e.preventDefault();const p=Object.fromEntries(new FormData(e.target).entries());await fetch('/api/tasks',{method:'POST',headers:headers(),body:JSON.stringify(p)});e.target.reset();loadTasks();});

function card(t){return `<div class='task' draggable='true' ondragstart="drag(event)" id='t-${t.id}'><b>${t.title}</b><div>${t.category} | ${t.priority}</div><div>截止:${t.dueDate||'无'} ${t.warning?`| ⚠️${t.warning}`:''}</div><div><button onclick="sendReminder('${t.id}')">提醒</button><button onclick="delTask('${t.id}')">删</button></div></div>`}
async function loadTasks(){const r=await fetch('/api/tasks',{headers:headers()});if(r.status===401){setLoggedIn(false);return;}const tasks=await r.json();['todo','doing','done'].forEach(s=>document.getElementById(s).innerHTML='');tasks.forEach(t=>document.getElementById(t.status).innerHTML+=card(t));}
function drag(ev){ev.dataTransfer.setData('id',ev.target.id.replace('t-',''));}
document.querySelectorAll('.list').forEach(el=>{el.ondragover=e=>e.preventDefault();el.ondrop=async e=>{e.preventDefault();const id=e.dataTransfer.getData('id');const status=e.currentTarget.id;await fetch(`/api/tasks/${id}`,{method:'PUT',headers:headers(),body:JSON.stringify({status})});loadTasks();};});
async function delTask(id){await fetch(`/api/tasks/${id}`,{method:'DELETE',headers:headers()});loadTasks();}
async function sendReminder(id){const r=await fetch(`/api/send-reminder/${id}`,{method:'POST',headers:headers()});alert((await r.json()).message)}
async function loadReport(){const r=await fetch('/api/report/weekly',{headers:headers()});document.getElementById('report').textContent=JSON.stringify(await r.json(),null,2);}
async function exportExcel(){const r=await fetch('/api/tasks/export',{headers:headers()});const b=await r.blob();const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='tasks.xlsx';a.click();}
async function importExcel(){const f=document.getElementById('fileInput').files[0];if(!f)return alert('请选择Excel文件');const buf=await f.arrayBuffer();let bin='';new Uint8Array(buf).forEach(v=>bin+=String.fromCharCode(v));const base64=btoa(bin);const r=await fetch('/api/tasks/import',{method:'POST',headers:headers(),body:JSON.stringify({base64})});alert((await r.json()).message);loadTasks();}

if(token){setLoggedIn(true);loadTasks();}else setLoggedIn(false);
