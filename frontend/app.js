/* ═══════════════════════════════════════════════════════════════════
   STUDENT RISK MONITOR — APP.JS
   Teacher-friendly form, API calls, gauge animation, results
   ═══════════════════════════════════════════════════════════════════ */

const API = '';
const GROUP_ORDER = ['semester1', 'semester2', 'overall', 'personal'];

// SVG icon map — clean inline icons for each field type
const ICONS = {
    chart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    book: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    wallet: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    award: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
    user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    circle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
    info: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    // Recommendation icons
    clipboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    sparkle: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    calendar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    handshake: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    alert: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
};

// Group icons (for section headers)
const GROUP_ICONS = {
    semester1: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><text x="12" y="17" text-anchor="middle" font-size="6" fill="currentColor" font-weight="bold">1</text></svg>',
    semester2: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><text x="12" y="17" text-anchor="middle" font-size="6" fill="currentColor" font-weight="bold">2</text></svg>',
    overall: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    personal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
};

let featuresMeta = [];
let groupInfo = {};

// ─── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`${API}/api/features`);
        const data = await res.json();
        featuresMeta = data.features;
        groupInfo = data.groups;
        buildForm(featuresMeta);
        bindEvents();
    } catch (err) {
        console.error('Failed to load features:', err);
        document.getElementById('form-groups').innerHTML =
            '<div style="text-align:center;padding:40px;color:#DC2626;"><p><strong>Could not connect to the server.</strong></p><p style="color:#6B7280;margin-top:8px;">Please make sure the server is running with <code>python server.py</code></p></div>';
    }
});

// ─── Build Form ─────────────────────────────────────────────────
function buildForm(features) {
    const container = document.getElementById('form-groups');
    const grouped = {};

    features.forEach(f => {
        const g = f.group || 'other';
        if (!grouped[g]) grouped[g] = [];
        grouped[g].push(f);
    });

    GROUP_ORDER.forEach((groupKey, idx) => {
        const items = grouped[groupKey];
        if (!items || items.length === 0) return;

        const info = groupInfo[groupKey] || { title: groupKey, subtitle: '' };
        const groupEl = document.createElement('div');
        groupEl.className = 'form-group';
        groupEl.style.animationDelay = `${idx * 0.08}s`;

        groupEl.innerHTML = `
            <div class="form-group__header">
                <div class="form-group__icon form-group__icon--${groupKey}">
                    ${GROUP_ICONS[groupKey] || ''}
                </div>
                <div>
                    <div class="form-group__title">${info.title}</div>
                    <div class="form-group__subtitle">${info.subtitle}</div>
                </div>
            </div>
            <div class="form-group__fields" id="group-${groupKey}"></div>`;

        container.appendChild(groupEl);
        const fieldsEl = groupEl.querySelector('.form-group__fields');
        items.forEach(f => fieldsEl.appendChild(createField(f)));
    });
}

function createField(f) {
    const wrap = document.createElement('div');
    wrap.className = 'field' + (f.type === 'range' ? ' field--range' : '');

    const iconHtml = ICONS[f.icon] || ICONS.circle;
    const descHtml = f.description ? `<div class="field__desc">${f.description}</div>` : '';
    const helpHtml = f.help ? `<div class="field__help">${ICONS.info} ${f.help}</div>` : '';

    if (f.type === 'toggle') {
        wrap.innerHTML = `
            <label class="field__label">
                <span class="field__label-icon">${iconHtml}</span>
                ${f.label}
            </label>
            ${descHtml}
            <label class="toggle">
                <input type="checkbox" class="toggle__input" data-feature="${f.name}" ${f.default === 1 ? 'checked' : ''}>
                <span class="toggle__track"><span class="toggle__thumb"></span></span>
                <span class="toggle__text ${f.default === 1 ? 'toggle__text--yes' : 'toggle__text--no'}" id="toggle-text-${f.name}">${f.default === 1 ? 'Yes - fees are paid' : 'No - fees outstanding'}</span>
            </label>
            ${helpHtml}`;
        const cb = wrap.querySelector('.toggle__input');
        const txt = wrap.querySelector('.toggle__text');
        cb.addEventListener('change', () => {
            txt.textContent = cb.checked ? 'Yes - fees are paid' : 'No - fees outstanding';
            txt.className = 'toggle__text ' + (cb.checked ? 'toggle__text--yes' : 'toggle__text--no');
        });
    } else if (f.type === 'range') {
        const pct = (f.default * 100).toFixed(0);
        wrap.innerHTML = `
            <label class="field__label">
                <span class="field__label-icon">${iconHtml}</span>
                ${f.label}
            </label>
            ${descHtml}
            <div class="field__range-row">
                <input type="range" class="field__range" data-feature="${f.name}"
                    min="${f.min}" max="${f.max}" step="${f.step}" value="${f.default}">
                <span class="field__range-value" id="rv-${f.name}">${pct}%</span>
            </div>
            <div class="field__range-labels">
                <span>0% (failing all)</span>
                <span>100% (passing all)</span>
            </div>
            ${helpHtml}`;
        const slider = wrap.querySelector('.field__range');
        const valEl = wrap.querySelector('.field__range-value');
        slider.addEventListener('input', () => {
            const v = parseFloat(slider.value);
            valEl.textContent = (v * 100).toFixed(0) + '%';
        });
    } else {
        wrap.innerHTML = `
            <label class="field__label">
                <span class="field__label-icon">${iconHtml}</span>
                ${f.label}
            </label>
            ${descHtml}
            <input type="number" class="field__input" data-feature="${f.name}"
                min="${f.min}" max="${f.max}" step="${f.step}" value="${f.default}"
                id="input-${f.name}">
            ${helpHtml}`;
    }
    return wrap;
}

// ─── Events ─────────────────────────────────────────────────────
function bindEvents() {
    document.getElementById('predict-form').addEventListener('submit', handlePredict);
    document.getElementById('btn-reset').addEventListener('click', handleReset);
    document.getElementById('btn-back').addEventListener('click', showForm);
}

async function handlePredict(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-predict');
    btn.classList.add('loading');
    btn.innerHTML = '<span class="spinner"></span> Analyzing...';

    const payload = collectValues();

    try {
        const res = await fetch(`${API}/api/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        showResults(data);
    } catch (err) {
        alert('Prediction failed: ' + err.message);
    } finally {
        btn.classList.remove('loading');
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Analyze Student Risk';
    }
}

function collectValues() {
    const data = {};
    document.querySelectorAll('[data-feature]').forEach(el => {
        const name = el.dataset.feature;
        if (el.type === 'checkbox') data[name] = el.checked ? 1 : 0;
        else data[name] = parseFloat(el.value) || 0;
    });
    return data;
}

function handleReset() {
    featuresMeta.forEach(f => {
        const el = document.querySelector(`[data-feature="${f.name}"]`);
        if (!el) return;
        if (f.type === 'toggle') {
            el.checked = f.default === 1;
            const txt = document.getElementById(`toggle-text-${f.name}`);
            if (txt) {
                txt.textContent = f.default === 1 ? 'Yes - fees are paid' : 'No - fees outstanding';
                txt.className = 'toggle__text ' + (f.default === 1 ? 'toggle__text--yes' : 'toggle__text--no');
            }
        } else if (f.type === 'range') {
            el.value = f.default;
            const rv = document.getElementById(`rv-${f.name}`);
            if (rv) rv.textContent = (f.default * 100).toFixed(0) + '%';
        } else {
            el.value = f.default;
        }
    });
}

// ─── Results ────────────────────────────────────────────────────
function showResults(data) {
    document.getElementById('section-form').classList.add('hidden');
    document.getElementById('hero').style.display = 'none';
    const sec = document.getElementById('section-results');
    sec.classList.remove('hidden');
    sec.style.animation = 'none'; sec.offsetHeight; sec.style.animation = '';

    animateGauge(data.percentage);
    renderRiskBadge(data.riskLevel, data.percentage);
    renderFactors(data.riskFactors);
    renderRecs(data.recommendations);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showForm() {
    document.getElementById('section-results').classList.add('hidden');
    document.getElementById('hero').style.display = '';
    const sec = document.getElementById('section-form');
    sec.classList.remove('hidden');
    sec.style.animation = 'none'; sec.offsetHeight; sec.style.animation = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Gauge ──────────────────────────────────────────────────────
function animateGauge(pct) {
    const ARC = 251.3;
    const fill = document.getElementById('gauge-fill');
    const needle = document.getElementById('gauge-needle');
    const valEl = document.getElementById('gauge-value');
    const labelEl = document.getElementById('gauge-label');

    const frac = Math.min(pct / 100, 1);

    let color;
    if (pct < 40) color = '#059669';
    else if (pct < 70) color = '#D97706';
    else color = '#DC2626';
    valEl.style.color = color;

    let current = 0;
    const duration = 1400;
    const start = performance.now();

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        current = eased * pct;
        valEl.textContent = current.toFixed(1) + '%';

        const cf = eased * frac;
        fill.setAttribute('stroke-dashoffset', ARC * (1 - cf));
        needle.setAttribute('transform', `rotate(${-90 + cf * 180}, 100, 100)`);

        if (progress < 1) requestAnimationFrame(step);
        else {
            valEl.textContent = pct.toFixed(1) + '%';
            labelEl.textContent = 'Dropout Probability';
        }
    }
    requestAnimationFrame(step);
}

// ─── Risk Badge ─────────────────────────────────────────────────
function renderRiskBadge(level, pct) {
    const badge = document.getElementById('risk-badge');
    const icon = document.getElementById('risk-icon');
    const text = document.getElementById('risk-text');
    const summary = document.getElementById('risk-summary');

    badge.className = 'risk-badge risk-badge--' + level;

    const config = {
        low: {
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            text: 'Low Risk',
            summary: 'Great news! This student shows a healthy academic profile. Keep up the regular monitoring and encouragement.'
        },
        medium: {
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
            text: 'Medium Risk',
            summary: 'Some warning signs detected. This student could benefit from extra attention, check-ins, and targeted support.'
        },
        high: {
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            text: 'High Risk',
            summary: 'This student needs immediate support. Please review the factors below and take action as soon as possible.'
        }
    };

    const c = config[level] || config.low;
    icon.innerHTML = c.icon;
    text.textContent = c.text;
    summary.textContent = c.summary;
}

// ─── Factors ────────────────────────────────────────────────────
function renderFactors(factors) {
    const list = document.getElementById('factors-list');
    list.innerHTML = '';
    factors.forEach((f, i) => {
        const el = document.createElement('div');
        el.className = 'factor-item';
        el.style.animationDelay = `${0.1 + i * 0.08}s`;
        el.innerHTML = `
            <span class="factor-indicator factor-indicator--${f.severity}"></span>
            <div class="factor-content">
                <div class="factor-text">${f.text}</div>
                <div class="factor-detail">${f.detail}</div>
            </div>`;
        list.appendChild(el);
    });
}

// ─── Recommendations ────────────────────────────────────────────
function renderRecs(recs) {
    const list = document.getElementById('recs-list');
    list.innerHTML = '';
    recs.forEach((r, i) => {
        const el = document.createElement('div');
        el.className = 'rec-item';
        el.style.animationDelay = `${0.15 + i * 0.08}s`;
        el.innerHTML = `
            <div class="rec-icon-wrap rec-icon-wrap--${r.priority}">
                ${ICONS[r.icon] || ICONS.circle}
            </div>
            <span class="rec-text">${r.text}</span>
            <span class="rec-priority rec-priority--${r.priority}">${r.priority}</span>`;
        list.appendChild(el);
    });
}
