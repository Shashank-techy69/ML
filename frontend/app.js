/* ═══════════════════════════════════════════════════════════════════
   STUDENT RISK MONITOR — APP.JS
   ─────────────────────────────────────────────────────────────────
   CORE ML LOGIC: 100% PRESERVED (API calls, payload, gauge, etc.)
   NEW:  Three.js particle network, count-up animations, transitions
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

const API         = '';
const GROUP_ORDER = ['semester1', 'semester2', 'overall', 'personal'];

/* ── Inline SVG icon library ────────────────────────────────────── */
const I = {
  chart:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  book:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  star:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  check:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  wallet:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  award:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  user:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  circle:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
  info:      `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  clipboard: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`,
  sparkle:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  calendar:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  eye:       `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  users:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  alert:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  shield:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
};

const GROUP_SVG = {
  semester1: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  semester2: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  overall:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  personal:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
};

const GROUP_ICON_CLASS = {
  semester1: 'form-group__icon-wrap--s1',
  semester2: 'form-group__icon-wrap--s2',
  overall:   'form-group__icon-wrap--ov',
  personal:  'form-group__icon-wrap--bg',
};

let featuresMeta = [];
let groupInfo    = {};

/* ═══════════════════════════════════════════════════════════════════
   THREE.JS NEURAL NETWORK PARTICLE MESH
   Gracefully degrades if Three.js unavailable
   ═══════════════════════════════════════════════════════════════════ */
function initNeuralCanvas() {
  if (typeof THREE === 'undefined') return;

  const canvas   = document.getElementById('neural-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.position.z = 80;

  /* Particles */
  const NODE_COUNT = 120;
  const positions  = [];
  const velocities = [];
  const nodeGeo    = new THREE.BufferGeometry();
  const posArr     = new Float32Array(NODE_COUNT * 3);

  for (let i = 0; i < NODE_COUNT; i++) {
    const x = (Math.random() - 0.5) * 160;
    const y = (Math.random() - 0.5) * 80;
    const z = (Math.random() - 0.5) * 60;
    positions.push(new THREE.Vector3(x, y, z));
    velocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 0.06,
      (Math.random() - 0.5) * 0.06,
      (Math.random() - 0.5) * 0.03
    ));
    posArr[i * 3]     = x;
    posArr[i * 3 + 1] = y;
    posArr[i * 3 + 2] = z;
  }

  nodeGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

  const nodeMat = new THREE.PointsMaterial({
    color: 0x3B82F6, size: 0.7, transparent: true, opacity: 0.7, sizeAttenuation: true,
  });

  const points = new THREE.Points(nodeGeo, nodeMat);
  scene.add(points);

  /* Edges */
  const MAX_DIST = 28;
  const edgeGeo  = new THREE.BufferGeometry();
  const edgePts  = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      if (positions[i].distanceTo(positions[j]) < MAX_DIST) {
        edgePts.push(positions[i].x, positions[i].y, positions[i].z);
        edgePts.push(positions[j].x, positions[j].y, positions[j].z);
      }
    }
  }

  edgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edgePts), 3));

  const edgeMat = new THREE.LineBasicMaterial({ color: 0x3B82F6, transparent: true, opacity: 0.12 });
  const edges   = new THREE.LineSegments(edgeGeo, edgeMat);
  scene.add(edges);

  /* Animate */
  function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < NODE_COUNT; i++) {
      positions[i].add(velocities[i]);

      // Bounce off invisible walls
      ['x','y','z'].forEach(ax => {
        const lim = ax === 'x' ? 80 : ax === 'y' ? 40 : 30;
        if (Math.abs(positions[i][ax]) > lim) velocities[i][ax] *= -1;
      });

      posArr[i * 3]     = positions[i].x;
      posArr[i * 3 + 1] = positions[i].y;
      posArr[i * 3 + 2] = positions[i].z;
    }

    nodeGeo.attributes.position.needsUpdate = true;

    // Rebuild edges each frame (efficient for small counts)
    const ep = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (positions[i].distanceTo(positions[j]) < MAX_DIST) {
          ep.push(positions[i].x, positions[i].y, positions[i].z);
          ep.push(positions[j].x, positions[j].y, positions[j].z);
        }
      }
    }
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ep), 3));

    scene.rotation.y += 0.0005;
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   COUNT-UP ANIMATION FOR HERO STATS
   ═══════════════════════════════════════════════════════════════════ */
function countUp(el, target, suffix, duration) {
  const start    = performance.now();
  const startVal = 0;

  function step(now) {
    const t   = Math.min((now - start) / duration, 1);
    const val = Math.round(startVal + (target - startVal) * easeOutCubic(t));
    el.textContent = val + suffix;
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function initHeroStats() {
  const acc = document.getElementById('stat-accuracy');
  const fea = document.getElementById('stat-features');
  if (acc) countUp(acc, 88, '%', 1800);
  if (fea) countUp(fea, 10, '',  1400);
}

/* ═══════════════════════════════════════════════════════════════════
   SCROLL HEADER ELEVATION
   ═══════════════════════════════════════════════════════════════════ */
function initScrollHeader() {
  const hdr = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (hdr) hdr.classList.toggle('elevated', window.scrollY > 10);
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════════
   INITIALISE ON DOM READY
   ═══════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  initNeuralCanvas();
  initHeroStats();
  initScrollHeader();

  // Result timestamp
  const ts = document.getElementById('result-timestamp');
  if (ts) {
    const now = new Date();
    ts.textContent = now.toLocaleString('en-IN', {
      day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
    });
  }

  try {
    const res  = await fetch(`${API}/api/features`);
    const data = await res.json();
    featuresMeta = data.features;
    groupInfo    = data.groups;
    buildForm(featuresMeta);
    bindEvents();

    const fc = document.getElementById('field-count');
    if (fc) fc.textContent = `${featuresMeta.length} input fields`;
  } catch (err) {
    console.error('API unavailable:', err);
    const c = document.getElementById('form-groups');
    if (c) c.innerHTML = `
      <div style="padding:40px;text-align:center;color:#EF4444;">
        <strong>Server Unavailable</strong><br>
        <span style="color:rgba(200,215,255,0.4);font-size:0.85rem;margin-top:8px;display:block;">
          Run: <code style="color:#60A5FA;">python server.py</code>
        </span>
      </div>`;
  }
});

/* ═══════════════════════════════════════════════════════════════════
   BUILD FORM (unchanged logic — same as original)
   ═══════════════════════════════════════════════════════════════════ */
function buildForm(features) {
  const container = document.getElementById('form-groups');
  const grouped   = {};
  features.forEach(f => {
    const g = f.group || 'other';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(f);
  });

  GROUP_ORDER.forEach((key, idx) => {
    const items = grouped[key];
    if (!items || !items.length) return;

    const info    = groupInfo[key] || { title: key, subtitle: '' };
    const groupEl = document.createElement('div');
    groupEl.className = 'form-group';
    groupEl.style.animationDelay = `${(idx + 1) * 0.07}s`;

    const iconClass = GROUP_ICON_CLASS[key] || '';

    groupEl.innerHTML = `
      <div class="form-group__header">
        <div class="form-group__icon-wrap ${iconClass}">
          ${GROUP_SVG[key] || ''}
        </div>
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

/* ═══════════════════════════════════════════════════════════════════
   CREATE INDIVIDUAL FIELD (unchanged logic)
   ═══════════════════════════════════════════════════════════════════ */
function createField(f) {
  const wrap = document.createElement('div');
  wrap.className = 'field' + (f.type === 'range' ? ' field--range' : '');

  const iconHtml = I[f.icon] || I.circle;
  const descHtml = f.description ? `<div class="field__desc">${f.description}</div>` : '';
  const helpHtml = f.help        ? `<div class="field__help">${I.info} ${f.help}</div>` : '';

  if (f.type === 'toggle') {
    wrap.innerHTML = `
      <div class="field__label">
        <span class="field__label-icon">${iconHtml}</span>
        ${f.label}
      </div>
      ${descHtml}
      <label class="toggle">
        <input type="checkbox" class="toggle__input" data-feature="${f.name}" ${f.default === 1 ? 'checked' : ''}>
        <span class="toggle__track"><span class="toggle__thumb"></span></span>
        <span class="toggle__text ${f.default === 1 ? 'toggle__text--yes' : 'toggle__text--no'}"
              id="toggle-text-${f.name}">
          ${f.default === 1 ? 'Yes — fees are paid' : 'No — fees outstanding'}
        </span>
      </label>
      ${helpHtml}`;

    const cb  = wrap.querySelector('.toggle__input');
    const txt = wrap.querySelector(`#toggle-text-${f.name}`);
    cb.addEventListener('change', () => {
      txt.textContent = cb.checked ? 'Yes — fees are paid' : 'No — fees outstanding';
      txt.className   = 'toggle__text ' + (cb.checked ? 'toggle__text--yes' : 'toggle__text--no');
    });

  } else if (f.type === 'range') {
    const initPct = Math.round((f.default - f.min) / (f.max - f.min) * 100);
    wrap.innerHTML = `
      <div class="field__label">
        <span class="field__label-icon">${iconHtml}</span>
        ${f.label}
      </div>
      ${descHtml}
      <div class="field__range-row">
        <div class="range-tooltip" id="tip-${f.name}"
             style="left: calc(${initPct}% + ${8 - initPct * 0.16}px)">
          ${Math.round(f.default * 100)}%
        </div>
        <input type="range" class="field__range"
               data-feature="${f.name}"
               min="${f.min}" max="${f.max}" step="${f.step}" value="${f.default}">
      </div>
      <div class="field__range-labels">
        <span>0% — Failing all</span>
        <span>100% — Passing all</span>
      </div>
      ${helpHtml}`;

    const slider  = wrap.querySelector('.field__range');
    const tooltip = wrap.querySelector(`#tip-${f.name}`);
    slider.addEventListener('input', () => {
      const v   = parseFloat(slider.value);
      const pct = Math.round((v - f.min) / (f.max - f.min) * 100);
      tooltip.textContent = Math.round(v * 100) + '%';
      tooltip.style.left  = `calc(${pct}% + ${8 - pct * 0.16}px)`;
    });

  } else {
    wrap.innerHTML = `
      <div class="field__label">
        <span class="field__label-icon">${iconHtml}</span>
        ${f.label}
      </div>
      ${descHtml}
      <input type="number" class="field__input"
             data-feature="${f.name}"
             min="${f.min}" max="${f.max}" step="${f.step}" value="${f.default}">
      ${helpHtml}`;
  }

  return wrap;
}

/* ═══════════════════════════════════════════════════════════════════
   EVENT BINDINGS (unchanged)
   ═══════════════════════════════════════════════════════════════════ */
function bindEvents() {
  document.getElementById('predict-form').addEventListener('submit', handlePredict);
  document.getElementById('btn-reset').addEventListener('click', handleReset);
  document.getElementById('btn-back').addEventListener('click', showForm);
}

/* ═══════════════════════════════════════════════════════════════════
   CORE ML PREDICTION — logic unchanged, UI updates enhanced
   ═══════════════════════════════════════════════════════════════════ */
async function handlePredict(e) {
  e.preventDefault();

  // Show loading overlay
  const loader = document.getElementById('analysis-loader');
  if (loader) loader.classList.add('active');

  // Update button state
  const btn = document.getElementById('btn-predict');
  const origHTML = btn.innerHTML;
  btn.classList.add('loading');
  btn.innerHTML = `<span class="spinner"></span> Analyzing…`;

  // ── Collect payload (UNCHANGED LOGIC) ──
  const payload = {};
  document.querySelectorAll('[data-feature]').forEach(el => {
    const name = el.dataset.feature;
    payload[name] = el.type === 'checkbox' ? (el.checked ? 1 : 0) : parseFloat(el.value) || 0;
  });

  try {
    // ── API call (UNCHANGED) ──
    const res  = await fetch(`${API}/api/predict`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Slight delay so loader is visible
    await new Promise(r => setTimeout(r, 600));

    if (loader) loader.classList.remove('active');
    showResults(data);
  } catch (err) {
    if (loader) loader.classList.remove('active');
    alert('Risk analysis failed:\n' + err.message + '\n\nEnsure: python server.py is running.');
  } finally {
    btn.classList.remove('loading');
    btn.innerHTML = origHTML;
  }
}

/* ── Reset to defaults (UNCHANGED) ─────────────────────────────── */
function handleReset() {
  featuresMeta.forEach(f => {
    const el = document.querySelector(`[data-feature="${f.name}"]`);
    if (!el) return;
    if (f.type === 'toggle') {
      el.checked = f.default === 1;
      const txt = document.getElementById(`toggle-text-${f.name}`);
      if (txt) {
        txt.textContent = f.default === 1 ? 'Yes — fees are paid' : 'No — fees outstanding';
        txt.className   = 'toggle__text ' + (f.default === 1 ? 'toggle__text--yes' : 'toggle__text--no');
      }
    } else if (f.type === 'range') {
      el.value = f.default;
      const tip = document.getElementById(`tip-${f.name}`);
      if (tip) tip.textContent = Math.round(f.default * 100) + '%';
    } else {
      el.value = f.default;
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE TRANSITIONS
   ═══════════════════════════════════════════════════════════════════ */
function showResults(data) {
  // Fade out form
  const formSec = document.getElementById('section-form');
  const hero    = document.getElementById('hero');

  formSec.style.opacity    = '0';
  formSec.style.transform  = 'translateY(-16px)';
  formSec.style.transition = 'opacity 0.28s ease, transform 0.28s ease';

  setTimeout(() => {
    formSec.style.display = 'none';
    if (hero) hero.style.display = 'none';

    // Render results
    animateGauge(data.percentage);
    renderRiskBadge(data.riskLevel, data.percentage);
    renderFactors(data.riskFactors);
    renderRecs(data.recommendations);

    // Show results
    const resSec = document.getElementById('section-results');
    resSec.classList.add('visible');
    resSec.style.opacity    = '0';
    resSec.style.transform  = 'translateY(20px)';
    resSec.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resSec.style.opacity   = '1';
        resSec.style.transform = 'translateY(0)';
      });
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 280);
}

function showForm() {
  const resSec = document.getElementById('section-results');
  resSec.style.opacity    = '0';
  resSec.style.transform  = 'translateY(16px)';
  resSec.style.transition = 'opacity 0.28s ease, transform 0.28s ease';

  setTimeout(() => {
    resSec.classList.remove('visible');
    resSec.style.opacity   = '';
    resSec.style.transform = '';
    resSec.style.transition = '';

    const formSec = document.getElementById('section-form');
    const hero    = document.getElementById('hero');
    if (hero) hero.style.display = '';
    formSec.style.display    = '';
    formSec.style.opacity    = '0';
    formSec.style.transform  = 'translateY(20px)';
    formSec.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        formSec.style.opacity   = '1';
        formSec.style.transform = 'translateY(0)';
      });
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 280);
}

/* ═══════════════════════════════════════════════════════════════════
   GAUGE ANIMATION (UNCHANGED core logic — 289 arc length for new SVG)
   ═══════════════════════════════════════════════════════════════════ */
function animateGauge(pct) {
  const ARC    = 289;   // Full arc circumference for our new SVG path
  const fill   = document.getElementById('gauge-fill');
  const needle = document.getElementById('gauge-needle');
  const valEl  = document.getElementById('gauge-value');
  const lblEl  = document.getElementById('gauge-label');

  // Color the counter
  valEl.className = 'gauge-value ' +
    (pct < 40 ? 'gauge-value--low' : pct < 70 ? 'gauge-value--medium' : 'gauge-value--high');

  const DURATION = 1800;
  const startTime = performance.now();

  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / DURATION, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);  // ease-out cubic
    const current  = eased * pct;

    valEl.textContent = current.toFixed(1) + '%';
    fill.setAttribute('stroke-dashoffset', ARC * (1 - current / 100));
    // Needle: rotate from -90 (left) to +90 (right) = 180 degrees total
    needle.setAttribute('transform', `rotate(${-90 + (current / 100) * 180}, 120, 122)`);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      valEl.textContent = pct.toFixed(1) + '%';
      if (lblEl) lblEl.textContent = 'Dropout Probability';
    }
  }

  requestAnimationFrame(step);
}

/* ═══════════════════════════════════════════════════════════════════
   RISK BADGE (UNCHANGED logic)
   ═══════════════════════════════════════════════════════════════════ */
function renderRiskBadge(level, pct) {
  const badge   = document.getElementById('risk-badge');
  const iconEl  = document.getElementById('risk-icon');
  const textEl  = document.getElementById('risk-text');
  const summary = document.getElementById('risk-summary');
  const barEl   = document.getElementById('prob-bar');
  const pctLbl  = document.getElementById('prob-pct-label');
  const metaS   = document.getElementById('meta-score');

  // Update badge class (preserved: risk-tag--${level})
  badge.className = `risk-tag risk-tag--${level}`;

  if (pctLbl)  pctLbl.textContent  = pct.toFixed(1) + '%';
  if (metaS)   metaS.textContent   = pct.toFixed(1) + '%';

  // Animate probability bar
  if (barEl) {
    barEl.className = `prob-bar-fill prob-bar-fill--${level}`;
    setTimeout(() => { barEl.style.width = pct + '%'; }, 120);
  }

  const CONF = {
    low: {
      icon:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      text:    'Low Risk',
      summary: 'This student demonstrates a healthy academic profile. Maintain regular monitoring and continue providing positive reinforcement. No immediate intervention is required.',
    },
    medium: {
      icon:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      text:    'Medium Risk',
      summary: 'Moderate risk indicators have been detected. Consider scheduling an advisory meeting and reviewing the student\'s support plan in the near term.',
    },
    high: {
      icon:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      text:    'High Risk',
      summary: 'Critical risk level detected. Immediate intervention is strongly recommended. Review all findings below and initiate appropriate support protocols without delay.',
    },
  };

  const c = CONF[level] || CONF.low;
  iconEl.innerHTML   = c.icon;
  textEl.textContent = c.text;
  if (summary) summary.textContent = c.summary;
}

/* ═══════════════════════════════════════════════════════════════════
   RISK FACTORS (UNCHANGED logic — same .factor-item HTML structure)
   ═══════════════════════════════════════════════════════════════════ */
function renderFactors(factors) {
  const list = document.getElementById('factors-list');
  list.innerHTML = '';

  if (!factors || !factors.length) {
    list.innerHTML = `
      <div class="factor-item">
        <span class="factor-indicator factor-indicator--none"></span>
        <div class="factor-content">
          <div class="factor-text">No significant risk factors detected</div>
          <div class="factor-detail">This student's profile looks healthy overall.</div>
        </div>
        <span class="factor-severity factor-severity--none">None</span>
      </div>`;
    return;
  }

  factors.forEach((f, i) => {
    const el = document.createElement('div');
    el.className = 'factor-item';
    el.style.animationDelay = `${0.05 + i * 0.07}s`;
    el.innerHTML = `
      <span class="factor-indicator factor-indicator--${f.severity}"></span>
      <div class="factor-content">
        <div class="factor-text">${f.text}</div>
        <div class="factor-detail">${f.detail}</div>
      </div>
      <span class="factor-severity factor-severity--${f.severity}">${f.severity}</span>`;
    list.appendChild(el);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   RECOMMENDATIONS (UNCHANGED logic — same .rec-item HTML structure)
   ═══════════════════════════════════════════════════════════════════ */
function renderRecs(recs) {
  const list = document.getElementById('recs-list');
  list.innerHTML = '';

  if (!recs || !recs.length) {
    list.innerHTML = `
      <div class="rec-item rec-item--routine">
        <div class="rec-icon-wrap rec-icon-wrap--routine">${I.sparkle}</div>
        <span class="rec-text">Continue current academic support strategies</span>
        <span class="rec-priority rec-priority--routine">Routine</span>
      </div>`;
    return;
  }

  recs.forEach((r, i) => {
    const el = document.createElement('div');
    el.className = `rec-item rec-item--${r.priority}`;
    el.style.animationDelay = `${0.05 + i * 0.07}s`;
    el.innerHTML = `
      <div class="rec-icon-wrap rec-icon-wrap--${r.priority}">
        ${I[r.icon] || I.circle}
      </div>
      <span class="rec-text">${r.text}</span>
      <span class="rec-priority rec-priority--${r.priority}">${r.priority}</span>`;
    list.appendChild(el);
  });
}
