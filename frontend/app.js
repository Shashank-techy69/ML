/* ═══════════════════════════════════════════════════════════════════
   STUDENT RISK MONITOR — APP.JS
   Handles form generation, API calls, gauge animation, results
   ═══════════════════════════════════════════════════════════════════ */

const API = '';
const GROUP_LABELS = {
    academic: 'Academic Performance',
    grades: 'Semester Grades',
    financial: 'Financial Status',
    enrollment: 'Enrollment Details',
    other: 'Other'
};
const GROUP_ORDER = ['academic', 'grades', 'financial', 'enrollment', 'other'];

let featuresMeta = [];

// ─── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`${API}/api/features`);
        featuresMeta = await res.json();
        buildForm(featuresMeta);
        bindEvents();
    } catch (err) {
        console.error('Failed to load features:', err);
        document.getElementById('form-groups').innerHTML =
            '<p style="color:var(--risk-high)">Failed to connect to API. Make sure the server is running.</p>';
    }
});

// ─── Build Form ─────────────────────────────────────────────────────
function buildForm(features) {
    const container = document.getElementById('form-groups');
    const grouped = {};

    features.forEach(f => {
        const g = f.group || 'other';
        if (!grouped[g]) grouped[g] = [];
        grouped[g].push(f);
    });

    GROUP_ORDER.forEach(groupKey => {
        const items = grouped[groupKey];
        if (!items || items.length === 0) return;

        const groupEl = document.createElement('div');
        groupEl.className = 'form-group';
        groupEl.innerHTML = `<div class="form-group__title">${GROUP_LABELS[groupKey] || groupKey}</div>
            <div class="form-group__fields" id="group-${groupKey}"></div>`;
        container.appendChild(groupEl);

        const fieldsEl = groupEl.querySelector('.form-group__fields');
        items.forEach(f => fieldsEl.appendChild(createField(f)));
    });
}

function createField(f) {
    const wrap = document.createElement('div');
    wrap.className = 'field' + (f.type === 'range' ? ' field--range' : '');

    if (f.type === 'toggle') {
        wrap.innerHTML = `
            <label class="field__label">
                <span class="field__label-icon">${f.icon || ''}</span>
                ${f.label}
            </label>
            <label class="toggle">
                <input type="checkbox" class="toggle__input" data-feature="${f.name}" ${f.default === 1 ? 'checked' : ''}>
                <span class="toggle__track"><span class="toggle__thumb"></span></span>
                <span class="toggle__text" id="toggle-text-${f.name}">${f.default === 1 ? 'Yes' : 'No'}</span>
            </label>`;
        const cb = wrap.querySelector('.toggle__input');
        const txt = wrap.querySelector('.toggle__text');
        cb.addEventListener('change', () => { txt.textContent = cb.checked ? 'Yes' : 'No'; });
    } else if (f.type === 'range') {
        wrap.innerHTML = `
            <label class="field__label">
                <span class="field__label-icon">${f.icon || ''}</span>
                ${f.label}
            </label>
            <div class="field__range-row">
                <input type="range" class="field__range" data-feature="${f.name}"
                    min="${f.min}" max="${f.max}" step="${f.step}" value="${f.default}">
                <span class="field__range-value" id="rv-${f.name}">${f.default}</span>
            </div>`;
        const slider = wrap.querySelector('.field__range');
        const valEl = wrap.querySelector('.field__range-value');
        slider.addEventListener('input', () => {
            valEl.textContent = parseFloat(slider.value).toFixed(2);
        });
    } else {
        wrap.innerHTML = `
            <label class="field__label">
                <span class="field__label-icon">${f.icon || ''}</span>
                ${f.label}
            </label>
            <input type="number" class="field__input" data-feature="${f.name}"
                min="${f.min}" max="${f.max}" step="${f.step}" value="${f.default}"
                id="input-${f.name}">`;
    }
    return wrap;
}

// ─── Events ─────────────────────────────────────────────────────────
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
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Analyze Risk`;
    }
}

function collectValues() {
    const data = {};
    document.querySelectorAll('[data-feature]').forEach(el => {
        const name = el.dataset.feature;
        if (el.type === 'checkbox') {
            data[name] = el.checked ? 1 : 0;
        } else {
            data[name] = parseFloat(el.value) || 0;
        }
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
            if (txt) txt.textContent = f.default === 1 ? 'Yes' : 'No';
        } else if (f.type === 'range') {
            el.value = f.default;
            const rv = document.getElementById(`rv-${f.name}`);
            if (rv) rv.textContent = parseFloat(f.default).toFixed(2);
        } else {
            el.value = f.default;
        }
    });
}

// ─── Results ────────────────────────────────────────────────────────
function showResults(data) {
    document.getElementById('section-form').classList.add('hidden');
    const resultsSection = document.getElementById('section-results');
    resultsSection.classList.remove('hidden');
    // Re-trigger animation
    resultsSection.style.animation = 'none';
    resultsSection.offsetHeight;
    resultsSection.style.animation = '';

    animateGauge(data.percentage);
    renderRiskBadge(data.riskLevel, data.percentage);
    renderFactors(data.riskFactors);
    renderRecs(data.recommendations);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showForm() {
    document.getElementById('section-results').classList.add('hidden');
    const formSection = document.getElementById('section-form');
    formSection.classList.remove('hidden');
    formSection.style.animation = 'none';
    formSection.offsetHeight;
    formSection.style.animation = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Gauge Animation ────────────────────────────────────────────────
function animateGauge(pct) {
    const ARC_LENGTH = 251.3;
    const fill = document.getElementById('gauge-fill');
    const needle = document.getElementById('gauge-needle');
    const valEl = document.getElementById('gauge-value');
    const labelEl = document.getElementById('gauge-label');

    const fraction = Math.min(pct / 100, 1);
    const targetOffset = ARC_LENGTH * (1 - fraction);
    const targetAngle = -90 + (fraction * 180);

    // Color the percentage text
    let color;
    if (pct < 40) color = 'var(--risk-low)';
    else if (pct < 70) color = 'var(--risk-medium)';
    else color = 'var(--risk-high)';
    valEl.style.color = color;

    // Animate
    let current = 0;
    const duration = 1200;
    const start = performance.now();

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        current = eased * pct;
        valEl.textContent = current.toFixed(1) + '%';

        const currFraction = (eased * fraction);
        fill.setAttribute('stroke-dashoffset', ARC_LENGTH * (1 - currFraction));
        needle.setAttribute('transform', `rotate(${-90 + currFraction * 180}, 100, 100)`);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            valEl.textContent = pct.toFixed(1) + '%';
            labelEl.textContent = 'Dropout Probability';
        }
    }
    requestAnimationFrame(step);
}

// ─── Risk Badge ─────────────────────────────────────────────────────
function renderRiskBadge(level, pct) {
    const badge = document.getElementById('risk-badge');
    const icon = document.getElementById('risk-icon');
    const text = document.getElementById('risk-text');
    const summary = document.getElementById('risk-summary');

    badge.className = 'risk-badge risk-badge--' + level;

    const config = {
        low: { icon: '🟢', text: 'Low Risk', summary: 'This student shows a healthy academic profile with minimal dropout indicators.' },
        medium: { icon: '🟡', text: 'Medium Risk', summary: 'Some warning signs detected. Proactive monitoring and support recommended.' },
        high: { icon: '🔴', text: 'High Risk', summary: 'Critical risk level detected. Immediate intervention and support services recommended.' }
    };

    const c = config[level] || config.low;
    icon.textContent = c.icon;
    text.textContent = c.text;
    summary.textContent = c.summary;
}

// ─── Factors ────────────────────────────────────────────────────────
function renderFactors(factors) {
    const list = document.getElementById('factors-list');
    list.innerHTML = '';
    factors.forEach(f => {
        const el = document.createElement('div');
        el.className = 'factor-item';
        el.innerHTML = `
            <span class="factor-dot factor-dot--${f.severity}"></span>
            <div class="factor-content">
                <div class="factor-text">${f.text}</div>
                <div class="factor-detail">${f.detail}</div>
            </div>`;
        list.appendChild(el);
    });
}

// ─── Recommendations ────────────────────────────────────────────────
function renderRecs(recs) {
    const list = document.getElementById('recs-list');
    list.innerHTML = '';
    recs.forEach(r => {
        const el = document.createElement('div');
        el.className = 'rec-item';
        el.innerHTML = `
            <span class="rec-icon">${r.icon}</span>
            <span class="rec-text">${r.text}</span>
            <span class="rec-priority rec-priority--${r.priority}">${r.priority}</span>`;
        list.appendChild(el);
    });
}
