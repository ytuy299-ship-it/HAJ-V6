const client = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
const $ = id => document.getElementById(id);
let allRequests = [];
let soundReady = false;
let lastNewId = null;
let liveChannel = null;
let pollTimer = null;

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4200);
}

function beep() {
  if (!soundReady) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = 880;
  g.gain.value = 0.08;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  setTimeout(() => { o.stop(); ctx.close(); }, 360);
}

function enableSound() {
  soundReady = true;
  beep();
  toast('تم تفعيل صوت التنبيه 🔔');
}

async function login() {
  const { data, error } = await client
    .from('admins')
    .select('*')
    .eq('username', $('username').value)
    .eq('password', $('password').value)
    .maybeSingle();

  if (error || !data) return toast('بيانات الدخول غير صحيحة');

  localStorage.setItem('admin', '1');
  $('loginBox').style.display = 'none';
  $('dash').style.display = 'block';
  startAutoRefresh();
}

function statusClass(s) {
  return String(s || '').split(' ')[0];
}

function updateStats() {
  $('stAll').textContent = allRequests.length;
  $('stNew').textContent = allRequests.filter(r => r.status === 'جديد').length;
  $('stProgress').textContent = allRequests.filter(r => r.status === 'تحت الإجراء').length;
  $('stDone').textContent = allRequests.filter(r => r.status === 'تم التنفيذ').length;
}

async function loadRequests(silent = false) {
  const { data, error } = await client
    .from('requests2')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (!silent) toast('خطأ في جلب الطلبات: ' + error.message);
    return;
  }

  allRequests = data || [];
  updateStats();
  renderRequests();
}

function renderRequests() {
  const q = ($('search')?.value || '').trim();
  const f = $('filter')?.value || '';
  const rows = allRequests.filter(r =>
    (!f || r.status === f) &&
    (!q || (`${r.roomnum || ''} ${r.room_id || ''} ${r.service || ''} ${r.service_id || ''} ${r.details || ''}`).includes(q))
  );

  $('requests').innerHTML = rows.map(r => `
    <tr class="${r.id === lastNewId ? 'new-row' : ''}">
      <td>${new Date(r.created_at).toLocaleString('ar-SA')}</td>
      <td><b>${r.roomnum || r.room_id}</b></td>
      <td>${r.service || r.service_id}</td>
      <td>${r.details || '-'}</td>
      <td><span class="status ${statusClass(r.status)}">${r.status}</span></td>
      <td>
        <div class="actions">
          <button class="btn warn" onclick="setStatus(${r.id}, 'تحت الإجراء')">تحت الإجراء</button>
          <button class="btn ok" onclick="setStatus(${r.id}, 'تم التنفيذ')">تم التنفيذ</button>
          <button class="btn danger" onclick="setStatus(${r.id}, 'ملغي')">إلغاء</button>
        </div>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="6">لا توجد طلبات</td></tr>`;
}

async function setStatus(id, status) {
  const { error } = await client
    .from('requests2')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return toast(error.message);
  await loadRequests(true);
  toast('تم تحديث الحالة إلى: ' + status);
}

function listenRequestsRealtime() {
  if (liveChannel) return;

  liveChannel = client
    .channel('requests2-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'requests2' },
      payload => {
        if (payload.eventType === 'INSERT') {
          lastNewId = payload.new.id;
          beep();
          toast('🔔 طلب جديد من غرفة ' + (payload.new.roomnum || payload.new.room_id || '') + ' - ' + (payload.new.service || ''));
        }

        // يحدث الجدول والإحصائيات تلقائياً عند الإضافة أو تعديل الحالة أو الإلغاء
        loadRequests(true);
      }
    )
    .subscribe(status => {
      if (status === 'SUBSCRIBED') toast('تم تفعيل التحديث التلقائي');
    });
}

function startAutoRefresh() {
  loadRequests(true);
  listenRequestsRealtime();

  // احتياط: تحديث تلقائي كل 5 ثواني حتى لو Realtime غير مفعل في Supabase
  if (!pollTimer) {
    pollTimer = setInterval(() => loadRequests(true), 5000);
  }
}

if (localStorage.getItem('admin') === '1') {
  $('loginBox').style.display = 'none';
  $('dash').style.display = 'block';
  startAutoRefresh();
}
