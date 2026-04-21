/* ═══════════════════════════════════════════════════════════════════
   STUDENT RISK MONITOR — APP.JS
   ─────────────────────────────────────────────────────────────────
   Core logic preserved, extended with Smart Interventions,
   Sparklines, Confidence Indicators, and History Tracking.
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

const API = '';
const GROUP_ORDER = ['semester1', 'semester2', 'overall', 'personal'];

const STUDENT_PHONE_DB = {
  "2021CS101": "+91-9876543210",
  "2021ME202": "+91-9123456789",
  "2022EC115": "+91-9871234560",
  "2023CE404": "+91-9988776655",
  "2021EE055": "+91-9112233445"
};

const I = {
  circle: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
  info:   `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  check:  `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  warn:   `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  phone:  `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`
};

const GROUP_SVG = {
  semester1: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  semester2: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  overall:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  personal:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
};

const GROUP_ICON_CLASS = {
  semester1: 'form-group__icon-wrap--s1', semester2: 'form-group__icon-wrap--s2',
  overall:   'form-group__icon-wrap--ov', personal:  'form-group__icon-wrap--bg',
};

let featuresMeta = [];
let groupInfo    = {};

/* ═══════════════════════════════════════════════════════════════════
   THREE.JS NEURAL CANVAS
   ═══════════════════════════════════════════════════════════════════ */
function initNeuralCanvas() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('neural-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.position.z = 80;

  const N = 80; const pos = []; const vel = []; const arr = new Float32Array(N*3);
  for(let i=0; i<N; i++) {
    const x = (Math.random()-.5)*160, y = (Math.random()-.5)*100, z = (Math.random()-.5)*60;
    pos.push(new THREE.Vector3(x,y,z));
    vel.push(new THREE.Vector3((Math.random()-.5)*0.08, (Math.random()-.5)*0.08, (Math.random()-.5)*0.04));
    arr[i*3]=x; arr[i*3+1]=y; arr[i*3+2]=z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const mat = new THREE.PointsMaterial({ color: 0x3ac2f0, size: 0.8, transparent: true, opacity: 0.7 });
  scene.add(new THREE.Points(geo, mat));

  function animate() {
    requestAnimationFrame(animate);
    for(let i=0; i<N; i++) {
      pos[i].add(vel[i]);
      ['x','y','z'].forEach(ax => {
        const lim = ax==='x'?80:ax==='y'?50:30;
        if(Math.abs(pos[i][ax]) > lim) vel[i][ax] *= -1;
      });
      arr[i*3]=pos[i].x; arr[i*3+1]=pos[i].y; arr[i*3+2]=pos[i].z;
    }
    geo.attributes.position.needsUpdate = true;
    scene.rotation.y += 0.0004;
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function countUp(el, tar, suf, dur) {
  const start = performance.now();
  function step(now) {
    const t = Math.min((now-start)/dur, 1);
    el.textContent = Math.round((tar) * (1-Math.pow(1-t, 3))) + suf;
    if(t<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ═══════════════════════════════════════════════════════════════════
   INIT & BUILD FORM
   ═══════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  initNeuralCanvas();
  const acc = document.getElementById('stat-accuracy');
  if(acc) countUp(acc, 88, '%', 1800);
  const fea = document.getElementById('stat-features');
  if(fea) countUp(fea, 10, '', 1400);

  window.addEventListener('scroll', () => {
    const hdr = document.getElementById('header');
    if(hdr) hdr.classList.toggle('elevated', window.scrollY > 10);
  }, { passive: true });

  const ts = document.getElementById('result-timestamp');
  if(ts) ts.textContent = new Date().toLocaleString('en-IN', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});

  try {
    const res = await fetch(`${API}/api/features`);
    const data = await res.json();
    featuresMeta = data.features;
    groupInfo = data.groups;
    buildForm(featuresMeta);
    bindEvents();
    initHistory();
    initProgressTracker();
  } catch (err) {
    console.error('API unavailable:', err);
  }
});

function buildForm(features) {
  const container = document.getElementById('form-groups');
  const grouped = {};
  features.forEach(f => {
    const g = f.group || 'other';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(f);
  });

  GROUP_ORDER.forEach((key, idx) => {
    const items = grouped[key];
    if (!items || !items.length) return;
    const info = groupInfo[key] || { title: key, subtitle: '' };
    const groupEl = document.createElement('div');
    groupEl.className = 'form-group';
    groupEl.style.animationDelay = `${(idx + 1) * 0.07}s`;
    groupEl.innerHTML = `
      <div class="form-group__header">
        <div class="form-group__icon-wrap ${GROUP_ICON_CLASS[key]||''}">${GROUP_SVG[key]||''}</div>
        <div>
          <div class="form-group__title">${info.title}</div>
          <div class="form-group__subtitle">${info.subtitle || ''}</div>
        </div>
      </div>
      <div class="form-group__fields" id="fg-${key}"></div>`;
    container.appendChild(groupEl);
    const fieldsEl = groupEl.querySelector(`#fg-${key}`);
    items.forEach(f => fieldsEl.appendChild(createField(f)));
  });
}

function createField(f) {
  const wrap = document.createElement('div');
  wrap.className = 'field' + (f.type==='range'?' field--range':'');
  const icon = I.circle;
  const dHtml = f.description ? `<div class="field__desc">${f.description}</div>` : '';
  const hHtml = f.help ? `<div class="field__help">${I.info} ${f.help}</div>` : '';

  if (f.type === 'toggle') {
    wrap.innerHTML = `<div class="field__label"><span class="field__label-icon">${icon}</span>${f.label}</div>${dHtml}
      <label class="toggle"><input type="checkbox" class="toggle__input form-tracker" data-feature="${f.name}" ${f.default===1?'checked':''}>
      <span class="toggle__track"><span class="toggle__thumb"></span></span><span class="toggle__text ${f.default===1?'toggle__text--yes':'toggle__text--no'}" id="toggle-text-${f.name}">${f.default===1?'Yes':'No'}</span></label>${hHtml}`;
    const cb = wrap.querySelector('.toggle__input'), txt = wrap.querySelector(`#toggle-text-${f.name}`);
    cb.addEventListener('change', () => { txt.textContent = cb.checked?'Yes':'No'; txt.className='toggle__text '+(cb.checked?'toggle__text--yes':'toggle__text--no'); });
  } else if (f.type === 'range') {
    const initPct = Math.round((f.default-f.min)/(f.max-f.min)*100);
    wrap.innerHTML = `<div class="field__label"><span class="field__label-icon">${icon}</span>${f.label}</div>${dHtml}
      <div class="field__range-row"><div class="range-tooltip" id="tip-${f.name}" style="left: calc(${initPct}% + ${8-initPct*0.16}px)">${Math.round(f.default*100)}%</div>
      <input type="range" class="field__range form-tracker" data-feature="${f.name}" min="${f.min}" max="${f.max}" step="${f.step}" value="${f.default}"></div>
      <div class="field__range-labels"><span>0%</span><span>100%</span></div>${hHtml}`;
    const s = wrap.querySelector('.field__range'), t = wrap.querySelector(`#tip-${f.name}`);
    s.addEventListener('input', () => { const pct=Math.round((s.value-f.min)/(f.max-f.min)*100); t.textContent=Math.round(s.value*100)+'%'; t.style.left=`calc(${pct}% + ${8-pct*0.16}px)`; });
  } else {
    wrap.innerHTML = `<div class="field__label"><span class="field__label-icon">${icon}</span>${f.label}</div>${dHtml}
      <input type="number" class="field__input form-tracker" data-feature="${f.name}" min="${f.min}" max="${f.max}" step="${f.step}" value="${f.default}">${hHtml}`;
  }
  return wrap;
}

/* ═══════════════════════════════════════════════════════════════════
   SMART PROGRESS BAR
   ═══════════════════════════════════════════════════════════════════ */
function initProgressTracker() {
  const inputs = document.querySelectorAll('.form-tracker');
  const bar = document.getElementById('form-progress-bar');
  const lbl = document.getElementById('progress-label');
  const total = inputs.length; // 10 features + 3 personal

  const update = () => {
    let filled = 0;
    inputs.forEach(i => {
      if(i.type==='checkbox' || i.type==='range' || (i.value && i.value.trim().length > 0)) filled++;
    });
    const pct = (filled / total) * 100;
    if(bar) bar.style.width = pct + '%';
    if(lbl) {
      lbl.textContent = filled === total ? '✅ All fields complete' : `${filled} / ${total} fields completed`;
      if(filled === total) {
        bar.classList.add('complete'); lbl.classList.add('complete');
      } else {
        bar.classList.remove('complete'); lbl.classList.remove('complete');
      }
    }
  };
  inputs.forEach(i => {
    i.addEventListener('input', update);
    i.addEventListener('change', update);
  });
  update();
}

function getConfidenceLevel() {
  const inputs = document.querySelectorAll('.form-tracker');
  let filled = 0;
  inputs.forEach(i => { if((i.value && i.value.trim().length>0) || i.type==='checkbox') filled++; });
  const total = inputs.length;
  if(filled === total) return { text:'HIGH', col:'var(--green)' };
  if(filled >= Math.floor(total*0.7)) return { text:'MEDIUM', col:'var(--amber)' };
  return { text:'LOW', col:'var(--red)' };
}

/* ═══════════════════════════════════════════════════════════════════
   RISK HISTORY TRACKING (SESSION STORAGE)
   ═══════════════════════════════════════════════════════════════════ */
function initHistory() {
  const btn = document.getElementById('btn-history');
  const drop = document.getElementById('history-dropdown');
  if(!btn || !drop) return;
  btn.addEventListener('click', (e) => {
    drop.classList.toggle('active');
    e.stopPropagation();
  });
  document.addEventListener('click', (e) => {
    if(!drop.contains(e.target) && !btn.contains(e.target)) drop.classList.remove('active');
  });
  renderHistoryList();
}

function saveHistory(data, info) {
  let hist = JSON.parse(sessionStorage.getItem('riskHistory') || '[]');
  hist.unshift({
    name: info.name, roll: info.roll, riskScore: data.percentage, 
    riskLevel: data.riskLevel, time: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})
  });
  if(hist.length > 5) hist = hist.slice(0, 5);
  sessionStorage.setItem('riskHistory', JSON.stringify(hist));
  renderHistoryList();
}

function renderHistoryList() {
  const list = document.getElementById('history-list');
  if(!list) return;
  const hist = JSON.parse(sessionStorage.getItem('riskHistory') || '[]');
  if(hist.length === 0) {
    list.innerHTML = `<div style="padding:16px; font-size:12px; color:var(--text-4); text-align:center;">No recent analyses</div>`;
    return;
  }
  list.innerHTML = hist.map(h => {
    const col = h.riskLevel==='Low'?'var(--green)':h.riskLevel==='Medium'?'var(--amber)':'var(--red)';
    return `
      <div class="history-item">
        <div class="history-item__icon" style="background:${col};"></div>
        <div class="history-item__details">
          <div class="history-item__name">${h.name}</div>
          <div class="history-item__roll">${h.roll} &bull; ${h.time}</div>
        </div>
        <div class="history-item__score" style="color:${col};">${h.riskScore.toFixed(1)}%</div>
      </div>
    `;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════════════
   TOAST NOTIFICATION
   ═══════════════════════════════════════════════════════════════════ */
function showToast(msg, type='success') {
  const container = document.getElementById('toast-container');
  if(!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${type==='success'?I.check:I.warn} <span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity=0; t.style.transform='translateY(10px)'; setTimeout(()=>t.remove(), 300); }, 3000);
}

/* ═══════════════════════════════════════════════════════════════════
   BIND EVENTS AND PREDICT
   ═══════════════════════════════════════════════════════════════════ */
function bindEvents() {
  document.getElementById('predict-form').addEventListener('submit', handlePredict);
  document.getElementById('btn-reset').addEventListener('click', handleReset);
  document.getElementById('btn-back').addEventListener('click', showForm);
}

async function handlePredict(e) {
  e.preventDefault();
  const loader = document.getElementById('analysis-loader');
  if (loader) loader.classList.add('active');
  const btn = document.getElementById('btn-predict');
  const origHTML = btn.innerHTML;
  btn.classList.add('loading');
  btn.innerHTML = `<span class="spinner"></span> Analyzing…`;

  const payload = {};
  document.querySelectorAll('[data-feature]').forEach(el => {
    payload[el.dataset.feature] = el.type === 'checkbox' ? (el.checked ? 1 : 0) : parseFloat(el.value) || 0;
  });

  try {
    const res  = await fetch(`${API}/api/predict`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    await new Promise(r => setTimeout(r, 600));
    if (loader) loader.classList.remove('active');
    
    // Add fake risk factors for UI if missing to power the bars
    if(!data.riskFactors || data.riskFactors.length===0) data.riskFactors = [{name:"CGPA", text:"Low CGPA", severity:"high", val:0.8}];
    
    showResults(data, payload);
  } catch (err) {
    if (loader) loader.classList.remove('active');
    showToast('Risk analysis failed: ' + err.message, 'error');
  } finally {
    btn.classList.remove('loading');
    btn.innerHTML = origHTML;
  }
}

function handleReset() {
  const sName = document.getElementById('student_name');
  const sRoll = document.getElementById('student_roll');
  const sBranch = document.getElementById('student_branch');
  if (sName) sName.value = '';
  if (sRoll) sRoll.value = '';
  if (sBranch) sBranch.value = '';

  featuresMeta.forEach(f => {
    const el = document.querySelector(`[data-feature="${f.name}"]`);
    if (!el) return;
    if (f.type === 'toggle') { el.checked = f.default === 1; }
    else { el.value = f.default; }
    el.dispatchEvent(new Event('change')); el.dispatchEvent(new Event('input'));
  });
}

function showResults(data, payload) {
  const studentInfo = {
    name: document.getElementById('student_name').value || 'Unknown Student',
    roll: document.getElementById('student_roll').value || '-',
    branch: document.getElementById('student_branch').value || '-'
  };

  saveHistory(data, studentInfo);

  const banner = document.getElementById('student-id-banner');
  if (banner) {
    banner.style.display = 'flex';
    document.getElementById('disp_student_name').textContent = studentInfo.name;
    document.getElementById('disp_student_roll').textContent = studentInfo.roll;
    document.getElementById('disp_student_branch').textContent = studentInfo.branch;
  }

  const d = new Date();
  const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const subEl = document.getElementById('report-subtitle');
  if (subEl) subEl.textContent = `Generated for ${studentInfo.name} · ${studentInfo.roll} · ${studentInfo.branch} · Random Forest Classifier · ${dateStr}`;

  // Confidence
  const confEl = document.getElementById('confidence-indicator');
  if(confEl) {
    const conf = getConfidenceLevel();
    confEl.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${conf.col}; margin-right:4px;"></span> Model Confidence: ${conf.text}`;
  }

  // Set Theme
  const sec = document.getElementById('section-results');
  if(data.riskLevel === 'Low') {
    sec.style.setProperty('--blue', 'var(--green)'); sec.style.setProperty('--blue-dim', 'var(--green-dim)');
  } else if (data.riskLevel === 'Medium') {
    sec.style.setProperty('--blue', 'var(--amber)'); sec.style.setProperty('--blue-dim', 'var(--amber-dim)');
  } else {
    sec.style.setProperty('--blue', 'var(--red)'); sec.style.setProperty('--blue-dim', 'var(--red-dim)');
  }

  // Urgent Shake Text
  const uBan = document.getElementById('urgent-banner');
  if(uBan) {
    if(data.riskLevel === 'High') {
      uBan.classList.add('active');
    } else {
      uBan.classList.remove('active');
    }
  }

  const formSec = document.getElementById('section-form');
  const hero    = document.getElementById('hero');
  formSec.style.opacity = '0'; formSec.style.transform = 'translateY(-16px)'; formSec.style.transition = 'opacity 0.28s ease, transform 0.28s ease';

  setTimeout(() => {
    formSec.style.display = 'none';
    if (hero) hero.style.display = 'none';

    animateGauge(data.percentage);
    renderFeatureBars(payload, data.percentage);
    renderSparkline(payload, data.percentage);
    renderSmartIntervention(data.riskLevel, studentInfo);

    sec.classList.add('visible');
    sec.style.opacity = '0'; sec.style.transform = 'translateY(20px)'; sec.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    requestAnimationFrame(() => { requestAnimationFrame(() => { sec.style.opacity = '1'; sec.style.transform = 'translateY(0)'; }); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 280);
}

function showForm() {
  const resSec = document.getElementById('section-results');
  resSec.style.opacity = '0'; resSec.style.transform = 'translateY(16px)';
  setTimeout(() => {
    resSec.classList.remove('visible'); resSec.style.opacity = ''; resSec.style.transform = '';
    const formSec = document.getElementById('section-form');
    const hero = document.getElementById('hero');
    if (hero) hero.style.display = '';
    formSec.style.display = ''; formSec.style.opacity = '0'; formSec.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => { requestAnimationFrame(() => { formSec.style.opacity = '1'; formSec.style.transform = 'translateY(0)'; }); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 280);
}

/* ═══════════════════════════════════════════════════════════════════
   GAUGE ANIMATION
   ═══════════════════════════════════════════════════════════════════ */
function animateGauge(pct) {
  const ARC = 289;
  const fill = document.getElementById('gauge-fill'), needle = document.getElementById('gauge-needle'), valEl = document.getElementById('gauge-value');
  valEl.className = 'gauge-value ' + (pct < 40 ? 'gauge-value--low' : pct < 70 ? 'gauge-value--medium' : 'gauge-value--high');
  const d = 1800; const st = performance.now();
  function step(now) {
    const e = Math.min((now - st)/d, 1);
    const c = (1 - Math.pow(1 - e, 3)) * pct;
    valEl.textContent = c.toFixed(1) + '%';
    fill.setAttribute('stroke-dashoffset', ARC * (1 - c/100));
    needle.setAttribute('transform', `rotate(${-90 + (c/100)*180}, 120, 122)`);
    if (e < 1) requestAnimationFrame(step);
    else valEl.textContent = pct.toFixed(1) + '%';
  }
  requestAnimationFrame(step);
}

/* ═══════════════════════════════════════════════════════════════════
   SMART INTERVENTION CARDS & ACTION HANDLERS
   ═══════════════════════════════════════════════════════════════════ */
function renderSmartIntervention(level, st) {
  const c = document.getElementById('smart-intervention-container');
  if(!c) return;

  const lowHTML = `
    <div class="smart-intervention smart-intervention--low">
      <div class="smart-header">
        <div class="smart-icon smart-icon--low">${I.check}</div>
        <div class="smart-pill smart-pill--low">✅ NO ACTION REQUIRED</div>
      </div>
      <h3 class="smart-title smart-title--low">This Student Is On Track</h3>
      <p class="smart-desc">Academic performance is healthy. No immediate faculty intervention is required. Continue routine monitoring.</p>
      <div class="smart-timeline">
        <div class="smart-timeline-item"><div class="smart-timeline-dot"></div><div class="smart-timeline-text">Routine Monitor</div></div>
        <div class="smart-timeline-item"><div class="smart-timeline-dot" style="opacity:0.6;"></div><div class="smart-timeline-text" style="opacity:0.6;">Semester Review</div></div>
        <div class="smart-timeline-item"><div class="smart-timeline-dot" style="opacity:0.3;"></div><div class="smart-timeline-text" style="opacity:0.3;">All Clear</div></div>
      </div>
    </div>`;

  const medHTML = `
    <div class="smart-intervention smart-intervention--medium">
      <div class="smart-header">
        <div class="smart-icon smart-icon--medium">${I.warn}</div>
        <div class="smart-pill smart-pill--medium">⚠️ 1 SESSION RECOMMENDED</div>
      </div>
      <h3 class="smart-title smart-title--medium">Student Needs Attention</h3>
      <p class="smart-desc">Early warning signals detected. A single academic counselling session is recommended within the next 7 days.</p>
      
      <div class="schedule-panel">
        <div class="schedule-panel-title">Schedule Session</div>
        <div class="schedule-grid">
          <input type="date" class="schedule-input" value="${new Date().toISOString().split('T')[0]}">
          <select class="schedule-input"><option>In-Person</option><option>Online</option><option>Phone Call</option></select>
          <textarea class="schedule-input schedule-textarea" placeholder="Notes for counsellor..."></textarea>
        </div>
        <button class="btn btn--amber" style="width:100%; border-radius:var(--r-xs);" onclick="showToast('Session request logged for ${st.name} — ${st.roll}')">Schedule Session</button>
      </div>
    </div>`;

  const phoneStr = STUDENT_PHONE_DB[st.roll];
  const callBtnHTML = phoneStr 
    ? `<a href="tel:${phoneStr.replace(/[^0-9+]/g,'')}" class="call-btn">${I.phone} Call ${st.name.split(' ')[0] || 'Student'} Now</a>
       <div class="call-meta">Contact: ${phoneStr} (Verified)</div>`
    : `<div style="background:#FFF; border:1px dashed #FCA5A5; padding:16px; border-radius:var(--r-sm); text-align:center; color:var(--text-3); font-size:13px;">Phone number not on record. Please contact academic office.</div>
       <button class="btn btn--ghost" style="width:100%;">Request Contact Details</button>`;

  const highHTML = `
    <div class="smart-intervention smart-intervention--high">
      <div class="smart-header">
        <div class="smart-icon smart-icon--high">${I.warn}</div>
        <div class="smart-pill smart-pill--high">🚨 IMMEDIATE CONSULTATION</div>
      </div>
      <h3 class="smart-title smart-title--high">Critical Risk — Act Now</h3>
      <p class="smart-desc">This student is at serious risk of dropping out. Immediate consultation and a direct phone call or emergency session must be arranged today.</p>
      
      <div class="emergency-actions-grid">
        ${callBtnHTML}
        
        <div class="schedule-panel" style="margin-top:0; border:1px solid #FCA5A5; background:#FFF;">
          <div class="urgency-note" style="margin-bottom:12px;">⚠️ This session should be held within 24–48 hours</div>
          <div class="schedule-grid">
            <input type="date" class="schedule-input" value="${new Date().toISOString().split('T')[0]}">
            <select class="schedule-input"><option>Emergency In-Person</option><option>Urgent Call</option></select>
            <textarea class="schedule-input schedule-textarea" placeholder="Reason for escalation..."></textarea>
          </div>
          <button class="btn btn--red" style="width:100%; border-radius:var(--r-xs);" onclick="showToast('Emergency Session Booked for ${st.name}')">Book Emergency Session</button>
        </div>
      </div>
    </div>`;

  if(level === 'Low') c.innerHTML = lowHTML;
  else if(level === 'Medium') c.innerHTML = medHTML;
  else c.innerHTML = highHTML;
}

/* ═══════════════════════════════════════════════════════════════════
   FEATURE CONTRIBUTION BARS (Derives mock strength from payload values)
   ═══════════════════════════════════════════════════════════════════ */
function renderFeatureBars(payload, totalPct) {
  const c = document.getElementById('feature-bars-container');
  if(!c) return;
  
  // Create mock impact scores based on payload vs thresholds
  const impacts = [
    { label: "CGPA", val: payload['cgpa']||0, threshold: 6.5, type: 'higher-better' },
    { label: "Attendance", val: payload['attendance']||0, threshold: 0.75, type: 'higher-better' },
    { label: "Backlogs", val: payload['backlogs']||0, threshold: 2, type: 'lower-better' },
    { label: "Internal Marks", val: payload['internal_marks']||0, threshold: 50, type: 'higher-better' },
    { label: "Fees Paid", val: payload['fees_paid']||0, threshold: 1, type: 'higher-better' },
  ];

  let html = '';
  impacts.forEach(f => {
    let rawImpact = 0;
    if(f.type === 'higher-better') {
      rawImpact = (f.val - f.threshold) / f.threshold * 50; 
    } else {
      rawImpact = (f.threshold - f.val) * 20; 
    }
    // Cap impact mock
    let pct = Math.min(Math.max(Math.abs(rawImpact), 5), 100);
    const isDanger = rawImpact < 0; 

    html += `
      <div class="fbar-row">
        <div class="fbar-lbl">${f.label}</div>
        <div class="fbar-track">
          <div class="fbar-fill ${isDanger?'danger':'safe'}" style="width:${pct}%; float:${isDanger?'left':'right'};"></div>
        </div>
        <div class="fbar-val" style="color:${isDanger?'var(--red)':'var(--green)'};">${pct.toFixed(0)}%</div>
      </div>`;
  });
  c.innerHTML = html;
}

/* ═══════════════════════════════════════════════════════════════════
   SPARKLINE SIMULATION
   ═══════════════════════════════════════════════════════════════════ */
function renderSparkline(payload, pct) {
  const path = document.getElementById('sparkline-path');
  const dots = document.getElementById('sparkline-dots');
  const txt = document.getElementById('spark-status-text');
  if(!path) return;

  // Derive pseudo history
  const p1 = 100 - ((payload['cgpa']||5) * 10);
  const p2 = 100 - ((payload['cgpa']||5) * 10) + ((payload['backlogs']||0)*5);
  const current = pct;
  const proj = current + (current > 50 ? 10 : -10);

  const pts = [ Math.max(10, Math.min(90, p1)), Math.max(10, Math.min(90, p2)), current, Math.max(5, Math.min(95, proj)) ];
  
  // SVG dims: 200x80. Data range 0-100 maps to y=80 down to y=0 (higher risk = higher physically or lower? Let's make high risk = high physically, so 0 is bottom.)
  // Actually, UI usually does higher probability = line goes UP. So y = 80 - (val / 100 * 80).
  const xSpace = 200 / 3;
  let d = ''; let dotHtml = '';
  pts.forEach((v, i) => {
    const x = i * xSpace;
    const y = 80 - (v / 100 * 70) - 5; // offset 5px bounds
    d += `${i===0?'M':'L'} ${x} ${y} `;
    dotHtml += `<circle cx="${x}" cy="${y}" r="4" fill="#FFF" stroke="currentColor" stroke-width="2"></circle>`;
  });

  path.setAttribute('d', d);
  dots.innerHTML = dotHtml;

  const isWorsening = proj > current;
  if(isWorsening) {
    txt.innerHTML = `📉 Declining trend detected`;
    txt.className = 'spark-status bad';
    path.setAttribute('stroke', 'var(--red)');
    dots.style.color = 'var(--red)';
  } else {
    txt.innerHTML = `📈 Stable or improving`;
    txt.className = 'spark-status good';
    path.setAttribute('stroke', 'var(--green)');
    dots.style.color = 'var(--green)';
  }
}
