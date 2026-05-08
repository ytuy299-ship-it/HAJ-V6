const client = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
const $ = id => document.getElementById(id);
let selectedService = null;
let servicesCache = [];

// ─── بيانات المنيو ───────────────────────────────────────────────────────────
const menuData = {
  فطور: [
    { group: 'الفطور الحجازي', items: [
      { label: 'فول',            subs: ['عادي','قلابه'] },
      { label: 'بيض',            subs: ['مقلي','شكشوكة','عيون','اومليت'] },
      { label: 'مطبق',           subs: ['مالح','جبنة'] },
      { label: 'حلويات حجازية', subs: ['لدو','لبنية','مفروكة','هريسة'] },
      'كبدة حجازية','مقلقل لحم','معصوب','عريكة'
    ]},
    { group: 'الفطور الإنجليزي', items: [
      { label: 'بيض', subs: ['اومليت','مقلي','مسلوق'] },
      { label: 'سجق', subs: ['دجاج','لحم','ديك رومي'] },
      'فاصوليا مطبوخة بالصلصة','شرائح لحم مدخن',
      'فطر مقلي','طماطم مشويه','بطاطس مبشورة مقلية','فواكه طازجة'
    ]},
    { group: 'الفطور التركي', items: [
      'بيض بالطماطم والفلفل الأسود (مينمن)',
      'طبق اجبان تركية','زيتون مشكل','عسل مع قشطة',
      'مربى فواكه','خيار وطماطم طازجة',
      'سجق تركي','بيض مسلوق','بطاطس مقلية',
      'كويماك (جبنة مع دقيق وزبدة)'
    ]},
    { group: 'فطور كونتيننتال', items: [
      { label: 'بيض',     subs: ['مقلي','مسلوق'] },
      { label: 'كرواسون', subs: ['جبنة','سادة'] },
      { label: 'مربى',    subs: ['فراولة','مشمش','توت'] },
      'كون فليكس مع حليب','جبنة كريمية','فواكه طازجة','زبادي يوناني'
    ]}
  ],
  مخبوزات: [
    { label: 'كرواسون', subs: ['سادة','جبن','شوكولا','لوز'] },
    { label: 'خبز',     subs: ['أبيض','أسمر'] },
    { label: 'بوريك',   subs: ['جبن','سادة'] },
    { label: 'توست',    subs: ['أبيض','أسمر'] },
    { label: 'مناقيش',  subs: ['جبنة','لبنة','زعتر','لبنة بالزعتر','لحمة بجبن وصوص'] },
    'ساوردو','تميس','مشلتت','سيميت تركي','بريوش'
  ],
  مقبلات: [
    { label: 'سمبوسة', subs: ['لحم','خضار','بطاطس','جبن'] },
    'تشكيلة مقبلات باردة وساخنة','حمص','فتوش','بابا غنوج','تبولة',
    'ورق عنب (5 قطع)','تارتار سلمون مدخن','فطائر بالسبانخ',
    'سبرنغ رول','كبة','بطاطا بوريه','خضار سوتيه'
  ],
  سلطات: [
    'سلطة روكا (جرجير وصنوبر/بارميزان)',
    'سلطة سيزر مع الدجاج',
    'سلطة يونانية (جبنة فيتا وخضار)',
    'سلطة مكسيكية بالدجاج'
  ],
  ساندوتشات: [
    { label: 'برجر',    subs: ['دجاج','لحم'] },
    { label: 'كاساديا', subs: ['دجاج','لحم'] },
    { label: 'فاهيتا',  subs: ['دجاج','لحم'] },
    'كلوب ساندوتش','ساندوتش جمبري','توست تونة وذرة'
  ],
  مكرونة: [
    { label: 'فوتوتشيني ألفريدو', subs: ['دجاج','جمبري'] },
    { label: 'رافيولي',           subs: ['جبن','سبانخ'] },
    { label: 'بيتزا',             subs: ['مارغريتا','دجاج','خضار'] },
    'سباغيتي بصلصة طماطم','بيني أرابياتا'
  ],
  ارز: [
    { label: 'كبسة اليوم', subs: ['دجاج','لحم'] },
    'أرز صيادية للأسماك','أرز أبيض بسمتي','رز صيني بالخضار والبيض'
  ],
  رئيسية: [
    { label: 'اطباق هندية', subs: ['تكا حار','كاري دجاج','كاري لحم'] },
    { label: 'مشكل مشاوي',  subs: ['ريش','كباب دجاج','كباب لحم'] },
    'صدور دجاج مشوية بصوص الماسترد والعسل',
    'بيكاتا دجاج بصوص الكريمة والفطر',
    'ستيك انجوس مشوي مع صوص الهولنديز',
    'سلمون مشوي بصوص الليمون والزبدة',
    'فيليه هامور مطهو بالبخار',
    'روبيان ديناميت','صيادية سمك',
    'مكس بحري مشوي','طاجن دجاج مغربي','ايدام خضار مشكلة'
  ],
  نباتية: [
    'صينية خضار مشوية مع صوص البيستو',
    'باستا نباتية بالصلصة الحمراء'
  ],
  حلويات: [
    'تارت تفاح','تارت ليمون','تشيزكيك ليمون ولافندر',
    'أم علي','وافل','بان كيك','مهلبية'
  ],
  مشروبات: [
    { group: 'المشروبات الغازية', items: [
      { label: 'دايت', subs: ['بيبسي دايت','سفن أب دايت'] },
      'بيبسي','سفن أب','ميرندا'
    ]},
    { group: 'العصائر الطازجة', items: [
      'عصير برتقال طازج','عصير ليمون بالنعناع','عصير مانجو',
      'عصير بطيخ','عصير كيوي','عصير جوافة','عصير أناناس',
      'عصير رمان','عصير أفوكادو','كوكتيل فواكه مشكلة'
    ]},
    { group: 'المشروبات الساخنة', items: [
      { label: 'شاي',    subs: ['أحمر','أخضر'] },
      { label: 'حليب',   subs: ['كامل','قليل الدسم'] },
      { label: 'كركديه', subs: ['بارد','حار'] },
      'قهوة سعودية مع التمر','قهوة أمريكية','قهوة بالحليب',
      'موكا لاتيه','كابتشينو','سموذي تمر'
    ]},
    { group: 'المياه', items: [
      { label: 'نوفا',              subs: ['صغير','كبير'] },
      { label: 'إيفيان / سانيتاس', subs: ['صغير','كبير'] },
      'بيرييه مياه غازية'
    ]}
  ]
};

// ستاربكس
const starbucksData = [
  { group: 'المشروبات الساخنة', items: [
    { label: 'أمريكانو',        subs: ['Tall وسط','Grande كبير'] },
    { label: 'لاتيه',           subs: ['Tall وسط','Grande كبير'] },
    { label: 'كابتشينو',        subs: ['Tall وسط','Grande كبير'] },
    { label: 'ماكياتو',         subs: ['Tall وسط','Grande كبير'] },
    { label: 'موكا',            subs: ['Tall وسط','Grande كبير'] },
    { label: 'كراميل ماكياتو', subs: ['Tall وسط','Grande كبير'] },
    { label: 'فانيلا لاتيه',   subs: ['Tall وسط','Grande كبير'] },
    { label: 'شاي أخضر ماتشا', subs: ['Tall وسط','Grande كبير'] },
    { label: 'شاي بالحليب',    subs: ['Tall وسط','Grande كبير'] }
  ]},
  { group: 'المشروبات الباردة', items: [
    { label: 'فرابوتشينو كراميل', subs: ['Tall وسط','Grande كبير'] },
    { label: 'فرابوتشينو شوكولا', subs: ['Tall وسط','Grande كبير'] },
    { label: 'فرابوتشينو موكا',   subs: ['Tall وسط','Grande كبير'] },
    { label: 'فرابوتشينو فانيلا', subs: ['Tall وسط','Grande كبير'] },
    { label: 'ليمونادة ستاربكس',  subs: ['Tall وسط','Grande كبير'] }
  ]},
  { group: 'مشروبات أخرى', items: [
    'عصير برتقال','مياه معدنية'
  ]}
];

// ─── حالة UI ─────────────────────────────────────────────────────────────────
let menuMode = null;
let selectedFoodCat = null;
let selectedItems = {};

// ─── templates ───────────────────────────────────────────────────────────────
const templates = {
  food: {
    match: ['الأكل','Food'],
    hint: 'اختر مصدر الطلب ثم حدد أصنافك',
    buildA: () => buildFoodUI(),
    b: '' // ✅ حذف وقت التوصيل
  },
  laundry: {
    match: ['غسيل','Laundry'],
    hint: 'حددي نوع خدمة الملابس',
    a: `<label>نوع الخدمة</label><select id="option1"><option>غسيل فقط</option><option>كوي فقط</option><option>غسيل + كوي</option></select>`,
    b: `<div class="row"><div><label>عدد القطع</label><input id="qty" type="number" min="1" value="1"></div></div>`
  },
  cleaning: {
    match: ['نظافة','Cleaning'],
    hint: 'اختاري نوع النظافة المطلوبة — لا يمكن الحجز إلا بعد 10 دقائق',
    a: `<label>نوع النظافة</label><select id="option1"><option>نظافة الغرفة</option><option>نظافة الحمام</option><option>نظافة الغرفة والحمام</option><option>أخرى</option></select>`,
    b: `<label>وقت النظافة المفضل</label><input id="time" type="time">`,
    hasTimeLimit: true
  },
  golf: {
    match: ['قولف','Golf'],
    hint: 'حددي الوقت وعدد الأشخاص — لا يمكن الحجز إلا بعد 10 دقائق',
    a: `<div class="row"><div><label>وقت الحجز</label><input id="time" type="time"></div></div>`,
    b: `<div class="row"><div><label>عدد الأشخاص</label><input id="people" type="number" min="1" value="1"></div><div><label>الوجهة</label><select id="destination"><option value="">— اختر الوجهة —</option><option value="المقر الرئيسي مبنى A">المقر الرئيسي مبنى A</option><option value="المقر الرئيسي مبنى B">المقر الرئيسي مبنى B</option><option value="مقر الندوة">مقر الندوة</option><option value="نقطة تجمع منى">نقطة تجمع منى</option></select></div></div>`,
    hasTimeLimit: true
  },
  maintenance: {
    match: ['صيانة','Maintenance'],
    hint: 'الصيانة ترسل مباشرة، ويمكن كتابة المشكلة في الملاحظات',
    a: `<label>نوع المشكلة</label><select id="option1"><option>كهرباء</option><option>تكييف</option><option>سباكة</option><option>أخرى</option></select>`,
    b: ''
  }
};

function getTemplate(s) {
  const text = `${s.name_ar || ''} ${s.name_en || ''}`;
  return Object.values(templates).find(t => t.match.some(m => text.includes(m))) || templates.maintenance;
}

// ─── إعداد حقل الوقت (10 دقائق من الآن) ──────────────────────────────────────
function applyTimeLimit() {
  const timeInput = $('time');
  if (!timeInput) return;
  const now = new Date();
  now.setMinutes(now.getMinutes() + 10);
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const minVal = `${hh}:${mm}`;
  timeInput.min   = minVal;
  timeInput.value = minVal;
  timeInput.onchange = function() {
    if (this.value < this.min) this.value = this.min;
  };
}

// ─── واجهة الطعام ────────────────────────────────────────────────────────────
function buildFoodUI() {
  menuMode = null;
  selectedFoodCat = null;
  selectedItems = {};
  return `
    <div class="menu-source-btns">
      <button class="menu-src-btn" id="btnRestaurant" onclick="selectMenuSource('restaurant')">المطعم</button>
      <button class="menu-src-btn" id="btnStarbucks"  onclick="selectMenuSource('starbucks')">ستاربكس</button>
    </div>
    <div id="menuContainer" style="margin-top:14px"></div>
  `;
}

function selectMenuSource(source) {
  menuMode = source;
  selectedFoodCat = null;
  selectedItems = {};
  document.querySelectorAll('.menu-src-btn').forEach(b => b.classList.remove('active'));
  $('btn' + (source === 'restaurant' ? 'Restaurant' : 'Starbucks')).classList.add('active');
  $('menuContainer').innerHTML = source === 'starbucks'
    ? renderStarbucksMenu()
    : renderRestaurantCategories();
}

// ─── تصنيفات المطعم ───────────────────────────────────────────────────────────
const restaurantCategories = [
  { key:'فطور',      label:'الإفطار',           img:'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&q=80', color:'#f59e42', labelBg:'linear-gradient(135deg,#f59e42,#e07a10)' },
  { key:'مخبوزات',  label:'المخبوزات',          img:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', color:'#d4a96a', labelBg:'linear-gradient(135deg,#d4a96a,#b07830)' },
  { key:'مقبلات',   label:'المقبلات',           img:'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&q=80', color:'#6bb86f', labelBg:'linear-gradient(135deg,#6bb86f,#3a8a3e)' },
  { key:'سلطات',    label:'السلطات',            img:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', color:'#82c96e', labelBg:'linear-gradient(135deg,#82c96e,#4a9a38)' },
  { key:'ساندوتشات',label:'الساندوتشات',        img:'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&q=80', color:'#e8935a', labelBg:'linear-gradient(135deg,#e8935a,#c05a20)' },
  { key:'مكرونة',   label:'المكرونة والبيتزا',  img:'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', color:'#e05c5c', labelBg:'linear-gradient(135deg,#e05c5c,#a82020)' },
  { key:'ارز',      label:'الأرز',              img:'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&q=80', color:'#c8a96e', labelBg:'linear-gradient(135deg,#c8a96e,#946830)' },
  { key:'رئيسية',   label:'الأطباق الرئيسية',   img:'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', color:'#b05a2a', labelBg:'linear-gradient(135deg,#b05a2a,#7a2e00)' },
  { key:'نباتية',   label:'الأطباق النباتية',   img:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80', color:'#4caf6f', labelBg:'linear-gradient(135deg,#4caf6f,#1a7a3a)' },
  { key:'حلويات',   label:'الحلويات',           img:'https://images.unsplash.com/photo-1464195244916-405fa0a82545?w=400&q=80', color:'#e878aa', labelBg:'linear-gradient(135deg,#e878aa,#b03070)' },
  { key:'مشروبات',  label:'المشروبات',          img:'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', color:'#7b68c8', labelBg:'linear-gradient(135deg,#7b68c8,#4a2a98)' }
];

function renderRestaurantCategories() {
  return `
    <div class="cat-card-grid" id="catGrid">
      ${restaurantCategories.map((c,i) => `
        <button class="cat-card" id="catbtn_${i}" onclick="selectFoodCat(${i})" style="--cat-color:${c.color}">
          <div class="cat-card-img" style="background-image:url('${c.img}')"></div>
          <div class="cat-card-overlay"></div>
          <div class="cat-card-content">
            <span class="cat-card-label" style="background:${c.labelBg}">${c.label}</span>
          </div>
        </button>
      `).join('')}
    </div>
    <div class="cat-panel-backdrop" id="catPanelBackdrop" onclick="closeCatPanel()" style="display:none"></div>
    <div class="cat-panel" id="catPanel" style="display:none">
      <div class="cat-panel-header" id="catPanelHeader">
        <button class="cat-panel-close" onclick="closeCatPanel()">✕</button>
        <span class="cat-panel-title" id="catPanelTitle"></span>
      </div>
      <div class="cat-panel-body" id="catPanelBody"></div>
    </div>
    <div id="selectedSummary" class="selected-summary" style="display:none"></div>`;
}

function selectFoodCat(idx) {
  const cat = restaurantCategories[idx];
  const panel = $('catPanel');
  const backdrop = $('catPanelBackdrop');
  const currentIdx = panel.dataset.openIdx;

  if (currentIdx == idx && panel.style.display !== 'none') {
    closeCatPanel();
    return;
  }

  document.querySelectorAll('[id^="catbtn_"]').forEach(b => b.classList.remove('active'));
  $(`catbtn_${idx}`).classList.add('active');

  $('catPanelTitle').textContent = cat.label;
  $('catPanelHeader').style.background = cat.labelBg;

  const key = cat.key;
  const items = menuData[key] || [];
  const hasGroups = items.length > 0 && items[0] && items[0].group;
  $('catPanelBody').innerHTML = hasGroups
    ? renderSubCatLevelV2(items, 'cat' + idx)
    : renderFlatItems(items, 'cat' + idx);

  panel.dataset.openIdx = idx;
  backdrop.style.display = 'block';
  panel.style.display = 'flex';
  requestAnimationFrame(() => {
    panel.classList.add('open');
    backdrop.classList.add('open');
  });
}

function closeCatPanel() {
  const panel = $('catPanel');
  const backdrop = $('catPanelBackdrop');
  panel.classList.remove('open');
  backdrop.classList.remove('open');
  document.querySelectorAll('[id^="catbtn_"]').forEach(b => b.classList.remove('active'));
  setTimeout(() => {
    panel.style.display = 'none';
    backdrop.style.display = 'none';
    panel.dataset.openIdx = '';
  }, 300);
}

function renderSubCatLevelV2(groups, nsPrefix) {
  window['_groups_' + nsPrefix] = groups;
  return `<div class="sub-cat-grid">
    ${groups.map((g, i) => `
      <button class="sub-cat-btn" id="${nsPrefix}_sbtn_${i}" onclick="selectSubCat('${nsPrefix}',${i})">
        <span>${g.group}</span>
        <span class="cat-arrow">▾</span>
      </button>
      <div class="sub-cat-items-wrapper" id="${nsPrefix}_sbox_${i}" style="display:none"></div>
    `).join('')}
  </div>`;
}

function selectSubCat(nsPrefix, idx) {
  const box = $(`${nsPrefix}_sbox_${idx}`);
  const btn = $(`${nsPrefix}_sbtn_${idx}`);
  if (!box || !btn) return;
  const isOpen = box.style.display !== 'none';

  document.querySelectorAll(`[id^="${nsPrefix}_sbox_"]`).forEach(w => w.style.display = 'none');
  document.querySelectorAll(`[id^="${nsPrefix}_sbtn_"]`).forEach(b => b.classList.remove('active'));

  if (isOpen) return;

  btn.classList.add('active');
  box.style.display = 'block';

  const groups = window['_groups_' + nsPrefix] || [];
  const items = (groups[idx] || {}).items || [];
  box.innerHTML = renderFlatItems(items, nsPrefix + '_' + idx);
}

function renderFlatItems(items, nsPrefix) {
  const withSubs = items.filter(i => typeof i !== 'string' && !i.group && i.subs);
  const simple   = items.filter(i => typeof i === 'string');
  const ordered  = [...withSubs, ...simple];
  return `<div class="food-options">${ordered.map((item, i) => makeFoodItem(item, nsPrefix + '_' + i)).join('')}</div>`;
}

function makeFoodItem(item, uid) {
  if (typeof item === 'string') {
    return makeSingleItem(item, item, uid, false);
  }
  if (item.group) {
    return renderFlatItems(item.items || [], uid);
  }
  const { label, subs } = item;
  return `<div class="food-group">
    <button type="button" class="food-group-trigger" id="ftrig_${uid}" onclick="toggleGroup('${uid}')">
      <span>${label}</span>
      <span class="group-arrow" id="garrow_${uid}">▾</span>
    </button>
    <div class="food-group-subs" id="fsubs_${uid}" style="display:none">
      ${subs.map((s, si) => {
        const v = label + ' - ' + s;
        return makeSingleItem(v, s, uid + '_s' + si, true);
      }).join('')}
    </div>
  </div>`;
}

function makeSingleItem(value, displayText, uid, isSub) {
  const safeV   = value.replace(/'/g,"&#39;").replace(/"/g,'&quot;');
  const checked = selectedItems[value] ? 'checked' : '';
  const qty     = selectedItems[value] || 1;
  return `<label class="food-choice${isSub?' sub-choice':''}${checked?' selected':''}">
    <input type="checkbox" value="${safeV}" ${checked} onchange="toggleItem(this)">
    <span>${displayText}</span>
    <div class="inline-qty"${checked?'':' style="display:none"'}>
      <button type="button" onclick="changeQty(this,-1,event)">−</button>
      <input class="qty-in" type="number" min="1" value="${qty}">
      <button type="button" onclick="changeQty(this,1,event)">+</button>
    </div>
  </label>`;
}

function toggleGroup(uid) {
  const subs   = $('fsubs_' + uid);
  const trig   = $('ftrig_'  + uid);
  const arrow  = $('garrow_' + uid);
  if (!subs) return;
  const isOpen = subs.style.display !== 'none';
  subs.style.display = isOpen ? 'none' : 'block';
  if (trig)  trig.classList.toggle('open', !isOpen);
  if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
}

function toggleItem(cb) {
  const value   = cb.value;
  const checked = cb.checked;
  if (checked) {
    selectedItems[value] = selectedItems[value] || 1;
  } else {
    delete selectedItems[value];
  }
  const lbl   = cb.closest('.food-choice');
  const inQty = lbl && lbl.querySelector('.inline-qty');
  if (lbl)   lbl.classList.toggle('selected', checked);
  if (inQty) inQty.style.display = checked ? 'flex' : 'none';
  updateSelectedSummary();
}

function changeQty(btn, step, event) {
  event.preventDefault();
  event.stopPropagation();
  const lbl   = btn.closest('.food-choice');
  const input = lbl && lbl.querySelector('.qty-in');
  const cb    = lbl && lbl.querySelector('input[type="checkbox"]');
  if (!input || !cb) return;
  const newVal = Math.max(1, Number(input.value || 1) + step);
  input.value = newVal;
  selectedItems[cb.value] = newVal;
}

function updateSelectedSummary() {
  const summary = $('selectedSummary');
  if (!summary) return;
  const items = Object.keys(selectedItems);
  if (!items.length) { summary.style.display = 'none'; return; }
  summary.style.display = 'block';
  summary.innerHTML = `<div class="summary-title">طلبك (${items.length} صنف)</div>
    <div class="summary-list">${items.map(k =>
      `<span class="summary-chip">${k} × ${selectedItems[k]||1}</span>`
    ).join('')}</div>`;
}

// ─── ستاربكس ─────────────────────────────────────────────────────────────────
function renderStarbucksMenu() {
  window['_groups_sbx'] = starbucksData;
  return `<div class="sub-cat-grid">
    ${starbucksData.map((g, i) => `
      <button class="sub-cat-btn" id="sbx_sbtn_${i}" onclick="selectSubCat('sbx',${i})">
        <span>${g.group}</span>
        <span class="cat-arrow">▾</span>
      </button>
      <div class="sub-cat-items-wrapper" id="sbx_sbox_${i}" style="display:none"></div>
    `).join('')}
  </div>
  <div id="selectedSummary" class="selected-summary" style="display:none"></div>`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3300);
}

// ─── init ─────────────────────────────────────────────────────────────────────
async function init() {
  if (!window.SUPABASE_URL || window.SUPABASE_URL.includes('YOUR_PROJECT'))
    return toast('حطي بيانات Supabase في config.js ثم ارفعي الموقع مرة ثانية');

  const [{ data: services, error: se }, { data: rooms, error: re }] = await Promise.all([
    client.from('services').select('*').eq('is_active', true).order('id'),
    client.from('rooms').select('*').order('id')
  ]);
  if (se || re) { toast('تأكدي من Supabase أو صلاحيات الجداول'); return; }
  servicesCache = services || [];
  $('services').innerHTML = servicesCache.map(s =>
    `<div class="card service" onclick='openService(${s.id})'><h3>${s.name_ar}</h3><p>${s.name_en||''}</p></div>`
  ).join('');
  window._roomsData = rooms || [];
  applyRoomFromQR();
}

function applyRoomFromQR() {
  const params    = new URLSearchParams(window.location.search);
  const roomParam = params.get('room');
  const rooms     = window._roomsData || [];
  const room      = rooms.find(r => r.room_num === roomParam || String(r.id) === roomParam);
  if (room) {
    $('room').value       = room.id;
    $('room').dataset.num = room.room_num;
    // ✅ رقم الغرفة يظهر تحت البانل البنفسجي
    const badge = $('pageRoomBadge');
    const numEl = $('pageRoomNum');
    if (badge && numEl) { numEl.textContent = room.room_num; badge.style.display = 'flex'; }
    toast('تم تحديد غرفة ' + room.room_num + ' ✅');
  }
}

function openService(id) {
  selectedService = servicesCache.find(s => s.id === id);
  const t = getTemplate(selectedService);
  $('mIcon').textContent = '';
  $('mTitle').textContent = selectedService.name_ar;
  $('mHint').textContent  = t.hint;
  selectedItems = {};
  menuMode = null;
  selectedFoodCat = null;
  $('dynamicA').innerHTML = t.buildA ? t.buildA() : (t.a || '');
  $('dynamicB').innerHTML = t.b || '';
  $('notes').value = '';
  $('modal').classList.add('show');

  if (t.hasTimeLimit) {
    setTimeout(applyTimeLimit, 50);
  }
}

function closeModal() {
  selectedService = null;
  $('modal').classList.remove('show');
}

function val(id) { return $(id) ? $(id).value : ''; }

function buildDetails() {
  const lines = [];
  const foodItems = Object.entries(selectedItems).map(([k,v]) => `${k} × ${v}`);
  if (foodItems.length) lines.push('الأصناف: ' + foodItems.join(' + '));
  if (menuMode === 'starbucks')  lines.push('المصدر: ستاربكس');
  else if (menuMode === 'restaurant') lines.push('المصدر: المطعم');
  if (val('option1'))    lines.push('الخيار: '           + val('option1'));
  if (val('qty'))        lines.push('الكمية: '           + val('qty'));
  if (val('time'))       lines.push('الوقت: '            + val('time'));
  if (val('people'))     lines.push('عدد الأشخاص: '      + val('people'));
  if (val('destination'))lines.push('الوجهة: '           + val('destination'));
  if (val('notes'))      lines.push('ملاحظات: '          + val('notes'));
  return lines.join(' | ');
}

async function sendRequest() {
  if (!selectedService) return toast('اختاري خدمة أولاً');
  if (!$('room').value)  return toast('الرجاء المسح من رمز QR الخاص بالغرفة');

  const t = getTemplate(selectedService);
  if (t.buildA && Object.keys(selectedItems).length === 0)
    return toast('الرجاء اختيار صنف واحد على الأقل');

  if (t.hasTimeLimit) {
    const timeInput = $('time');
    if (timeInput && timeInput.value < timeInput.min) {
      return toast('لا يمكن الحجز قبل 10 دقائق من الآن');
    }
  }

  const roomNum = $('room').dataset.num || '';
  const payload = {
    room_id:    +$('room').value,
    admin_id:   1,
    service_id: selectedService.id,
    roomnum:    roomNum,
    service:    selectedService.name_ar,
    details:    buildDetails(),
    status:     'جديد',
    updated_at: new Date().toISOString()
  };
  const { error } = await client.from('requests2').insert(payload);
  if (error) { toast('تعذر إرسال الطلب: ' + error.message); return; }
  closeModal();
  toast('تم إرسال الطلب بنجاح ✅');
}

init();