import * as store from '../lib/store.js';
import { today, addDays, formatVN, dateForDay, planDay, lastNDays } from '../lib/dates.js';
import { buildDay, PLAN, totalMinutes, nextLessons } from '../lib/plan.js';
import {
  SETS, setName, LINKS, PARTS, LISTENING_PARTS, READING_PARTS, PART_SIZE, PART_NAME, CODES,
} from '../lib/constants.js';
import {
  dueErrors, scheduleNew, applyRedo, partAccuracy, codeCounts, topCodes, mockTrend, redoSuccess, weekSummary,
} from '../lib/rules.js';
import { pendingErrors, missingFromHistory } from '../lib/autoresult.js';
import { suggestFor } from '../lib/autocode.js';
import { renderMetrics } from './metrics-ui.js';
import { lineChart, barChart, rateBars } from '../lib/charts.js';
import { weekCompare } from '../lib/rules.js';
import { newWordsOn, reviewsOn, vocabDay } from '../lib/vocab.js';
import { initDrill, renderDrill, handleClick as drillClick, handleKey as drillKey, stopDrillMedia, resumeDrill, startExternal } from './drill-ui.js';

// Saving can fail when this page was left open while the extension was reloaded.
function showSaveError(msg) {
  let b = document.getElementById('tc-save-error');
  if (!b) {
    b = document.createElement('div');
    b.id = 'tc-save-error';
    b.style.cssText = 'position:fixed;left:8px;right:8px;top:8px;z-index:99;background:#b91c1c;color:#fff;padding:10px 12px;border-radius:8px;font-size:13px';
    document.body.appendChild(b);
  }
  b.textContent = 'Không lưu được dữ liệu (' + msg + '). Hãy ĐÓNG trang/panel này và mở lại, rồi làm lại bước vừa rồi.';
}
window.addEventListener('tc-save-error', (e) => showSaveError(e.detail.message));
window.addEventListener('unhandledrejection', (e) => {
  const m = String(e.reason && e.reason.message || e.reason || '');
  if (/context invalidated|storage|quota/i.test(m)) showSaveError(m);
});


const hasChrome = typeof chrome !== 'undefined' && chrome.tabs;
let db = null;
let currentTab = 'today';
const ui = { errCode: '', errConf: 'low', resKind: 'part', errFilter: { part: '', code: '' } };

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (r) => (r == null ? '–' : Math.round(r * 100) + '%');

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast.h);
  toast.h = setTimeout(() => t.classList.add('hidden'), 2200);
}

async function openUrl(url) {
  if (hasChrome) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.startsWith('https://parroto.app')) await chrome.tabs.update(tab.id, { url });
    else await chrome.tabs.create({ url });
  } else {
    window.open(url, '_blank');
  }
}

function switchTab(name) {
  if (currentTab === 'drill' && name !== 'drill') stopDrillMedia();
  currentTab = name;
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab').forEach((s) => s.classList.toggle('active', s.id === 'tab-' + name));
  render();
  if (name === 'drill') resumeDrill();
}

// ---------- shared form pieces ----------
function setOptions(selected) {
  return SETS.map((s) => `<option value="${s.slug}" ${s.slug === selected ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
}
function testOptions(selected) {
  let o = '';
  for (let i = 1; i <= 10; i++) o += `<option value="${i}" ${i === Number(selected) ? 'selected' : ''}>Test ${i}</option>`;
  return o;
}
function partOptions(selected, pool = PARTS) {
  return pool.map((p) => `<option value="${p}" ${p === selected ? 'selected' : ''}>${p} – ${PART_NAME[p]}</option>`).join('');
}

// Suggest set/test/part for forms from today's assignment.
function todaysDefault() {
  const a = db.assign?.[today()] || {};
  const pick = a.L || a.R || a.full || a.halfL || a.halfR;
  return pick ? { set: pick.set, test: pick.test, part: pick.parts?.[0] } : { set: 'parroto-toeic-vol-1', test: 1, part: 'P5' };
}

// ---------- TODAY ----------
function renderToday() {
  const d = today();
  const r = buildDay(db, d);
  if (r.newAssign) {
    store.update('assign', (a) => ({ ...a, [d]: r.newAssign }));
    db.assign = { ...db.assign, [d]: r.newAssign };
  }
  const el = $('#tab-today');
  if (r.day == null) {
    el.innerHTML = `<div class="card notice">${r.notices.map(esc).join('<br>')}</div>
      <button class="btn primary" data-goto="settings">Nhập ngày thi</button>`;
    return;
  }
  const doneN = r.tasks.filter((t) => t.done).length;
  const mins = totalMinutes(r.tasks);
  const daily = db.daily[d] || {};
  const time = db.time[d] || {};
  const studied = Math.round(Object.values(time).reduce((a, b) => a + b, 0) / 60);

  let html = `<div class="card summary">
      <div><div class="big">${doneN}/${r.tasks.length}</div><div class="muted small">việc xong</div></div>
      <div><div class="big">${studied}'</div><div class="muted small">đã học trên Parroto / kế hoạch ${mins}'</div></div>
      <div style="flex-basis:100%" class="progressbar"><div style="width:${r.tasks.length ? (doneN / r.tasks.length) * 100 : 0}%"></div></div>
    </div>`;
  for (const n of r.notices) html += `<div class="card notice">${esc(n)}</div>`;
  const missing = missingFromHistory(db);
  if (missing.length) {
    html += `<div class="card notice"><b>${missing.length} lần làm bài trên Parroto chưa được đọc kết quả.</b> Mở từng trang kết quả để extension ghi lại:
      ${missing.slice(0, 5).map((h) => `<div class="small" style="margin-top:4px">${esc(h.testName)} · ${esc(h.label)} · ${esc(h.score)} <button class="btn" data-open="${esc(LINKS.result(h.session))}">Mở kết quả</button></div>`).join('')}</div>`;
  }
  const pend = pendingErrors(db);
  if (pend.length) html += `<div class="card notice"><b>${pend.length} câu sai tự ghi nhận chưa gắn mã lỗi.</b> <button class="btn" data-goto="errors">Gắn mã</button></div>`;
  const warn = Object.entries(db.meta.scraperWarnings || {}).filter(([, v]) => v && v.date >= addDays(d, -2));
  for (const [page, v] of warn) html += `<div class="card notice"><b>Không đọc được trang Parroto "${esc(page)}"</b>: ${esc(v.msg)}. Có thể Parroto đã đổi giao diện; hãy nhập tay và báo lại.</div>`;

  html += `<h2>Việc hôm nay</h2>`;
  for (const t of r.tasks) {
    html += `<div class="card task ${t.done ? 'done' : ''} ${t.extra ? 'extra' : ''}">
      <input type="checkbox" data-task="${t.id}" ${t.done ? 'checked' : ''} ${t.autoDone && !t.manual ? 'disabled title="Tự đánh dấu từ dữ liệu"' : ''}>
      <div>
        <div class="head"><span class="time">${esc(t.time || '')}</span><span class="title">${esc(t.title)}</span>
          ${t.minutes ? `<span class="muted small">${t.minutes}'</span>` : ''}
          ${t.progress ? `<span class="tag">${esc(t.progress)}</span>` : ''}
          ${t.autoDone ? '<span class="auto">✓ tự ghi nhận</span>' : ''}</div>
        ${t.detail ? `<div class="detail">${esc(t.detail)}</div>` : ''}
        <div class="actions">
          ${t.link ? `<button class="btn" data-open="${esc(t.link)}">${esc(t.linkLabel || 'Mở')}</button>` : ''}
          ${t.tab ? `<button class="btn" data-goto="${t.tab}">${{ errors: 'Sổ lỗi', stats: 'Tiến độ', drill: 'Mở tab Luyện' }[t.tab] || 'Mở'}</button>` : ''}
          ${['L', 'R', 'halfL', 'halfR', 'full'].includes(t.id) || t.id.startsWith('X') ? `<button class="btn" data-goto="results">Ghi kết quả</button>` : ''}
          ${t.input === 'srs' ? `<details class="small" style="width:100%"><summary class="muted">Nhập tay (chỉ khi số tự ghi bị sai)</summary><span class="inline-inputs">Đã ôn <input type="number" min="0" data-daily="srsReviewed" value="${daily.srsReviewed ?? ''}"> Quá hạn <input type="number" min="0" data-daily="overdue" value="${daily.overdue ?? ''}"></span></details>` : ''}
          ${t.input === 'new' ? `<details class="small" style="width:100%"><summary class="muted">Nhập tay (chỉ khi số tự ghi bị sai)</summary><span class="inline-inputs">Từ mới đã học <input type="number" min="0" data-daily="newWords" value="${daily.newWords ?? ''}"></span></details>` : ''}
        </div>
      </div></div>`;
  }

  if (r.adjustments.length) {
    html += `<h2>Điều chỉnh theo dữ liệu 7 ngày</h2>`;
    for (const a of r.adjustments) html += `<div class="card"><b>${esc(a.text)}</b><div class="muted small">Lý do: ${esc(a.reason)}</div></div>`;
  }
  if (r.week) html += renderWeekCard(r.week);

  const cats = { exam: 'Đề', listening: 'Danh sách bài nghe', dictation: 'Dictation', shadowing: 'Shadowing', vocab: 'Từ vựng', games: 'Games', other: 'Khác' };
  const rows = Object.entries(time).filter(([, v]) => v >= 60);
  html += `<h2>Thời gian trên Parroto hôm nay</h2><div class="card">${rows.length ? rows.map(([k, v]) => `<div>${esc(cats[k] || k)}: <b>${Math.round(v / 60)}'</b></div>`).join('') : '<span class="muted small">Chưa có. Extension chỉ đếm khi tab Parroto đang mở và bạn đang thao tác (rảnh quá 2 phút thì ngừng đếm).</span>'}</div>`;
  html += `<h3>Ghi chú hôm nay</h3><textarea data-daily="note" placeholder="Hôm nay sai gì, vì sao (2 phút)">${esc(daily.note || '')}</textarea>`;
  el.innerHTML = html;
}

function renderWeekCard(w) {
  const parts = PARTS.filter((p) => w.acc[p].total > 0);
  return `<h2>Tổng kết tuần ${formatVN(w.from)} – ${formatVN(w.to)}</h2><div class="card">
    <div>Thời gian học trên Parroto: <b>${w.minutes}'</b></div>
    <div>Top lỗi: ${w.top.length ? w.top.map(([c, n]) => `<b>${c}</b> ${esc(CODES[c].name)} (${n})`).join(', ') : '<span class="muted">chưa có</span>'}</div>
    ${w.top[0] ? `<div class="muted small">Việc cần làm: ${esc(CODES[w.top[0][0]].action)}</div>` : ''}
    ${parts.length ? `<table><tr><th>Part</th><th class="num">Đúng</th><th class="num">Tỷ lệ</th></tr>${parts.map((p) => `<tr><td>${p}</td><td class="num">${w.acc[p].correct}/${w.acc[p].total}</td><td class="num ${w.acc[p].rate < 0.6 ? 'rate-bad' : w.acc[p].rate >= 0.85 ? 'rate-ok' : ''}">${pct(w.acc[p].rate)}</td></tr>`).join('')}</table>` : ''}
    ${w.mocks.length ? `<div>Đề full trong tuần: ${w.mocks.map((m) => `${m.L + m.R} (L ${m.L} / R ${m.R})`).join(', ')}</div>` : ''}
  </div>`;
}

// ---------- RESULTS ----------
function renderResults() {
  const def = todaysDefault();
  const k = ui.resKind;
  const el = $('#tab-results');
  let partInputs = '';
  if (k === 'full' || k === 'halfL' || k === 'halfR') {
    const pool = k === 'full' ? PARTS : k === 'halfL' ? LISTENING_PARTS : READING_PARTS;
    partInputs = `<h3>Số câu đúng từng Part ${k === 'full' ? '(không bắt buộc, nhưng giúp phân tích Part yếu)' : ''}</h3><div class="row">${pool
      .map((p) => `<label>${p} /${PART_SIZE[p]}<input type="number" min="0" max="${PART_SIZE[p]}" name="pc_${p}"></label>`)
      .join('')}</div>`;
  }
  el.innerHTML = `
    <h2>Ghi kết quả luyện / thi thử</h2>
    <div class="seg" id="resKind">
      ${[['part', 'Một Part'], ['halfL', 'Nửa đề L'], ['halfR', 'Nửa đề R'], ['full', 'Đề full']].map(([v, n]) => `<button data-kind="${v}" class="${k === v ? 'sel' : ''}">${n}</button>`).join('')}
    </div>
    <form id="resForm" class="card" style="margin-top:8px">
      <div class="row">
        <label>Bộ đề<select name="set">${setOptions(k === 'part' ? def.set : 'toeic-2026')}</select></label>
        <label>Đề<select name="test">${testOptions(def.test)}</select></label>
      </div>
      ${k === 'part' ? `<div class="row">
        <label>Part<select name="part">${partOptions(def.part)}</select></label>
        <label>Đúng<input type="number" name="correct" min="0" required></label>
        <label>Tổng<input type="number" name="total" min="1" value="${PART_SIZE[def.part] || ''}" required></label>
      </div>` : ''}
      ${k === 'full' ? `<div class="row">
        <label>Điểm Listening (5–495)<input type="number" name="L" min="5" max="495" step="5" required></label>
        <label>Điểm Reading (5–495)<input type="number" name="R" min="5" max="495" step="5" required></label>
      </div>` : ''}
      ${partInputs}
      <div class="row">
        <label>Số phút<input type="number" name="minutes" min="0"></label>
        <label>Chế độ<select name="mode"><option value="practice" ${k === 'part' ? 'selected' : ''}>Practice Mode</option><option value="test" ${k !== 'part' ? 'selected' : ''}>Test Mode</option></select></label>
      </div>
      <button class="btn primary" type="submit">Lưu kết quả</button>
      <div class="muted small" style="margin-top:6px">Sau khi lưu, nhớ ghi từng câu sai và câu đoán trúng ở tab Sổ lỗi.</div>
    </form>
    <h2>Kết quả gần đây</h2>
    ${renderResultList()}`;
  const partSel = el.querySelector('select[name=part]');
  if (partSel) partSel.addEventListener('change', () => { el.querySelector('input[name=total]').value = PART_SIZE[partSel.value]; });
}

// Wrong / skipped questions read from Parroto result pages, waiting for an error code.
function renderPending() {
  const pend = pendingErrors(db);
  if (!pend.length) return '';
  const rows = pend.map((p) => ({ ...p, sug: suggestFor(db, p) }));
  ui.pendRows = rows;
  if (ui.pendFocus == null || ui.pendFocus >= rows.length) ui.pendFocus = 0;
  // Group by attempt + part.
  const groups = [];
  for (const r of rows) {
    const key = r.session + '|' + r.part;
    let g = groups.find((x) => x.key === key);
    if (!g) { g = { key, rows: [], set: r.set, test: r.test, part: r.part, session: r.session }; groups.push(g); }
    g.rows.push(r);
  }
  const sure = rows.filter((r) => r.sug.sure).length;
  const tally = (list) => Object.entries(list.reduce((m, r) => ((m[r.sug.code] = (m[r.sug.code] || 0) + 1), m), {})).map(([c, n]) => `${c}×${n}`).join(' ');
  let html = `<h2>Câu sai tự ghi nhận, chưa gắn mã (${rows.length})</h2>
    <div class="card small">
      Mỗi câu đã có <b>mã gợi ý</b> (ô viền xanh) kèm lý do. Bấm <b>Chấp nhận</b> cho cả nhóm, hoặc bấm mã khác cho từng câu.
      ${sure < rows.length ? `<div class="muted" style="margin-top:4px">${rows.length - sure} câu đang đoán theo Part vì bạn chưa mở phần <b>Review answers</b> của Part đó trên Parroto. Mở trang kết quả, bấm từng tab Part 1…7 rồi quay lại: gợi ý sẽ chính xác hơn.</div>` : ''}
      <div class="muted" style="margin-top:4px">Phím tắt: ↑ ↓ chọn câu · Enter chấp nhận gợi ý · bấm V G A D P I T C Q để gắn mã khác · X bỏ qua.</div>
      <div style="margin-top:6px"><button class="btn primary" data-acceptall="1">Chấp nhận tất cả gợi ý (${rows.length})</button></div>
      <div class="muted" style="margin-top:6px">${Object.entries(CODES).map(([c, v]) => `<b>${c}</b> ${esc(v.name)}`).join(' · ')}</div>
    </div>`;
  let idx = 0;
  for (const g of groups) {
    html += `<details class="card pend" ${g.rows.length <= 12 || ui.openGroups?.[g.key] ? 'open' : ''} data-group="${esc(g.key)}">
      <summary><b>${esc(setName(g.set))} T${g.test} · ${g.part}</b> <span class="muted small">${g.rows.length} câu · gợi ý ${tally(g.rows)}</span></summary>
      <div style="display:flex;gap:6px;margin:6px 0;flex-wrap:wrap">
        <button class="btn ok" data-acceptgroup="${esc(g.key)}">Chấp nhận gợi ý cả nhóm (${g.rows.length})</button>
        <button class="link" data-open="${esc(LINKS.result(g.session))}">mở trang kết quả</button>
      </div>`;
    for (const r of g.rows) {
      const focused = idx === ui.pendFocus;
      html += `<div class="pendrow ${focused ? 'focus' : ''}" data-pidx="${idx}">
        <div class="small"><b>Câu ${r.q}</b>${r.skipped ? ' <span class="tag">bỏ trống</span>' : ''} → <b>${r.sug.code}</b> <span class="muted">${esc(r.sug.reason)}${r.sug.sure ? '' : ' · đoán theo Part'}</span></div>
        <div class="codes-row">${Object.keys(CODES).map((c) => `<button type="button" class="${c === r.sug.code ? 'sug' : ''}" data-pendcode="${c}" data-key="${esc(r.key)}" title="${esc(CODES[c].name)}">${c}</button>`).join('')}<button type="button" class="skip" data-dismiss="${esc(r.key)}" title="Bỏ qua câu này">✕</button></div>
      </div>`;
      idx++;
    }
    html += `</details>`;
  }
  return html;
}

function codedError(p, code, d) {
  return {
    id: store.uid(), date: d, set: p.set, test: p.test, part: p.part, q: p.q, code,
    confidence: 'low', guessed: false, cause: p.skipped ? 'bỏ trống' : '', srcKey: p.key, redo: scheduleNew(d),
    suggested: p.sug ? (p.sug.baseCode || p.sug.code) : null, suggestReason: p.sug ? p.sug.baseReason : null,
  };
}

async function acceptRows(list) {
  if (!list.length) return;
  const d = today();
  await store.update('errors', (a) => [...a, ...list.map((r) => codedError(r, r.sug.code, d))]);
  toast(`Đã gắn mã ${list.length} câu.`);
}

function renderResultList() {
  const rows = [...db.results].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, 25);
  if (!rows.length) return '<div class="muted small">Chưa có kết quả nào.</div>';
  return `<table><tr><th>Ngày</th><th>Nguồn</th><th>Kết quả</th><th></th></tr>${rows
    .map((r) => {
      let res = '';
      if (r.kind === 'part') res = `${r.part}: ${r.correct}/${r.total} (${pct(r.correct / r.total)})`;
      else if (r.kind === 'full') res = `<b>${r.L + r.R}</b> (L ${r.L} / R ${r.R})`;
      else res = ({ halfL: 'Nửa đề L', halfR: 'Nửa đề R' }[r.kind] || 'Nhiều Part') + ': ' + Object.entries(r.parts || {}).map(([p, v]) => `${p} ${v.correct}/${v.total}`).join(', ');
      const src = `${esc(setName(r.set))} T${r.test}${r.auto ? ` <span class="tag">tự ghi · ${r.mode === 'test' ? 'Test' : 'Practice'}</span>` : ''}`;
      const del = r.auto ? `<button class="link" data-ignoresession="${esc(r.session)}">bỏ qua</button>` : `<button class="link" data-delres="${r.id}">xóa</button>`;
      return `<tr><td>${formatVN(r.date)}</td><td>${src}</td><td>${res}</td><td>${del}</td></tr>`;
    })
    .join('')}</table>`;
}

async function saveResult(form) {
  const f = new FormData(form);
  const k = ui.resKind;
  const r = { id: store.uid(), date: today(), kind: k, set: f.get('set'), test: Number(f.get('test')), minutes: Number(f.get('minutes')) || null, mode: f.get('mode') };
  if (k === 'part') {
    r.part = f.get('part');
    r.correct = Number(f.get('correct'));
    r.total = Number(f.get('total'));
    if (r.correct > r.total) return toast('Số câu đúng lớn hơn tổng.');
  } else {
    const pool = k === 'full' ? PARTS : k === 'halfL' ? LISTENING_PARTS : READING_PARTS;
    r.parts = {};
    for (const p of pool) {
      const v = f.get('pc_' + p);
      if (v !== '' && v != null) r.parts[p] = { correct: Number(v), total: PART_SIZE[p] };
    }
    if (k === 'full') { r.L = Number(f.get('L')); r.R = Number(f.get('R')); }
    if (k !== 'full' && !Object.keys(r.parts).length) return toast('Nhập số câu đúng ít nhất một Part.');
  }
  await store.update('results', (a) => [...a, r]);
  toast('Đã lưu kết quả.');
}

// ---------- ERRORS ----------
function renderErrors() {
  const d = today();
  const def = todaysDefault();
  const due = dueErrors(db.errors, d);
  const el = $('#tab-errors');
  const codeBtns = Object.entries(CODES).map(([c, v]) => `<button type="button" data-code="${c}" class="${ui.errCode === c ? 'sel' : ''}"><b>${c}</b>${esc(v.name)}</button>`).join('');
  const f = ui.errFilter;
  const list = db.errors.filter((e) => (!f.part || e.part === f.part) && (!f.code || e.code === f.code)).sort((a, b) => (a.date < b.date ? 1 : -1));

  el.innerHTML = `
    ${renderPending()}
    <h2>Đến hạn làm lại (${due.length})</h2>
    ${due.length ? due.map((e) => `<div class="card">
        <div><b>${esc(setName(e.set))} T${e.test} · ${e.part} câu ${e.q || '?'}</b> <span class="tag">${e.code}</span> <span class="muted small">lần ${e.redo.stage + 1}/2 · ghi ${formatVN(e.date)}</span></div>
        ${e.cause ? `<div class="muted small">${esc(e.cause)}</div>` : ''}
        <div class="muted small">${e.srcKey ? `Mở trang kết quả → tab ${e.part} → bấm "Làm lại câu sai" trên thanh TOEIC Coach. Kết quả tự ghi vào lịch.` : `Mở đề → Practice Mode → Select Parts: ${e.part} → tới câu ${e.q || '?'}. Làm lại, chưa xem giải thích.`}</div>
        <div class="actions" style="display:flex;gap:6px;margin-top:6px">
          ${e.srcKey ? `<button class="btn primary" data-open="${esc(LINKS.result(e.srcKey.split('|')[0]))}">Làm lại trên Parroto</button>` : `<button class="btn" data-open="${esc(LINKS.test(e.set, e.test))}">Mở đề</button>`}
          <button class="btn ok" data-redo="${e.id}" data-pass="1">Làm đúng</button>
          <button class="btn bad" data-redo="${e.id}" data-pass="0">Vẫn sai</button>
        </div></div>`).join('') : '<div class="muted small">Không có câu nào đến hạn hôm nay.</div>'}

    <h2>Ghi câu sai / câu đoán trúng</h2>
    <form id="errForm" class="card">
      <div class="row">
        <label>Bộ đề<select name="set">${setOptions(def.set)}</select></label>
        <label>Đề<select name="test">${testOptions(def.test)}</select></label>
      </div>
      <div class="row">
        <label>Part<select name="part">${partOptions(def.part)}</select></label>
        <label>Câu số<input type="number" name="q" min="1" max="200"></label>
      </div>
      <h3>Mã lỗi</h3>
      <div class="codes" id="codeBtns">${codeBtns}</div>
      ${ui.errCode ? `<div class="muted small" style="margin-top:4px">→ ${esc(CODES[ui.errCode].action)}</div>` : ''}
      <h3>Lúc chọn đáp án bạn tự tin thế nào?</h3>
      <div class="seg" id="confBtns">
        <button type="button" data-conf="high" class="${ui.errConf === 'high' ? 'sel' : ''}">Tự tin (nhưng sai)</button>
        <button type="button" data-conf="low" class="${ui.errConf === 'low' ? 'sel' : ''}">Phân vân</button>
      </div>
      <div class="row" style="margin-top:8px"><label style="flex-direction:row;align-items:center;gap:6px;color:var(--text)"><input type="checkbox" name="guessed"> Câu này đoán trúng (vẫn ghi để ôn)</label></div>
      <div class="row"><label>Nguyên nhân 1 dòng<input type="text" name="cause" placeholder="vd: nghe 'reschedule' thành 'schedule'"></label></div>
      <button class="btn primary" type="submit">Lưu lỗi</button>
      <span class="muted small">Câu số và Part giữ nguyên để ghi tiếp nhanh.</span>
    </form>

    <h2>Tất cả lỗi (${db.errors.length})</h2>
    <div class="row" style="display:flex;gap:6px;margin-bottom:6px">
      <select id="fPart"><option value="">Mọi Part</option>${partOptions(f.part)}</select>
      <select id="fCode"><option value="">Mọi mã</option>${Object.keys(CODES).map((c) => `<option value="${c}" ${f.code === c ? 'selected' : ''}>${c} – ${CODES[c].name}</option>`).join('')}</select>
    </div>
    ${list.length ? `<table><tr><th>Ngày</th><th>Câu</th><th>Mã</th><th>Làm lại</th><th></th></tr>${list.slice(0, 80).map((e) => `<tr>
        <td>${formatVN(e.date)}</td>
        <td>${esc(setName(e.set))} T${e.test} ${e.part}${e.q ? ' #' + e.q : ''}${attemptTag(e)}${e.guessed ? ' <span class="tag">đoán</span>' : ''}${e.diagApplied ? ' <span class="tag">tự chẩn đoán</span>' : ''}${e.cause ? `<div class="muted small">${esc(e.cause)}</div>` : ''}</td>
        <td>${e.code}${e.confidence === 'high' ? '!' : ''}</td>
        <td class="small">${e.redo.done ? '✓ xong' : 'hạn ' + formatVN(e.redo.due)}</td>
        <td><button class="link" data-delerr="${e.id}">xóa</button></td></tr>`).join('')}</table>` : '<div class="muted small">Chưa có lỗi nào.</div>'}
    <h3>Bảng mã lỗi</h3>
    <div class="card small">${Object.entries(CODES).map(([c, v]) => `<div><b>${c}</b> ${esc(v.name)} — <span class="muted">${esc(v.action)}</span></div>`).join('')}</div>`;
}

async function saveError(form) {
  if (!ui.errCode) return toast('Chọn mã lỗi trước.');
  const f = new FormData(form);
  const d = today();
  const e = {
    id: store.uid(), date: d, set: f.get('set'), test: Number(f.get('test')), part: f.get('part'),
    q: Number(f.get('q')) || null, code: ui.errCode, confidence: ui.errConf, guessed: !!f.get('guessed'),
    cause: (f.get('cause') || '').trim(), redo: scheduleNew(d),
  };
  // Keep set/test/part for the next entry; move to the next question and clear the rest
  // before saving, because saving re-renders the form with its current values.
  ui.errCode = '';
  form.cause.value = '';
  form.guessed.checked = false;
  if (e.q) form.q.value = e.q + 1;
  await store.update('errors', (a) => [...a, e]);
  toast(`Đã lưu lỗi ${e.part}${e.q ? ' câu ' + e.q : ''}. Hạn làm lại: ${formatVN(e.redo.due)}.`);
}

// ---------- STATS ----------
function renderStats() {
  const d = today();
  const el = $('#tab-stats');
  const trend = mockTrend(db.results);
  const acc7 = partAccuracy(db.results, addDays(d, -6), d);
  const accAll = partAccuracy(db.results, '0000-01-01', d);
  const week = codeCounts(db.errors, addDays(d, -6), d);
  const all = codeCounts(db.errors, '0000-01-01', d);
  const maxCode = Math.max(1, ...Object.values(all));
  const rs = redoSuccess(db.errors);
  const nl = nextLessons(db);
  const lessons = Object.values(db.lessons || {});
  const dictScores = lessons.map((l) => l.dictation).filter((x) => x != null);
  const avgDict = dictScores.length ? Math.round(dictScores.reduce((a, b) => a + b, 0) / dictScores.length) : null;
  const days = lastNDays(d, 7);

  let html = renderDashboardTop(d, trend, acc7);
  html += renderMetrics(db, d);
  html += `<h2>Điểm thi thử</h2>`;
  html += trend.length
    ? `<div class="card"><table><tr><th>Ngày</th><th>Đề</th><th class="num">L</th><th class="num">R</th><th class="num">Tổng</th><th class="num">±</th></tr>${trend
        .map((m) => `<tr><td>${formatVN(m.date)}</td><td>${esc(setName(m.set))} T${m.test}</td><td class="num">${m.L}</td><td class="num">${m.R}</td><td class="num"><b>${m.total}</b></td><td class="num">${m.delta == null ? '' : (m.delta > 0 ? '+' : '') + m.delta}${m.noise ? '<div class="muted small">nhiễu</div>' : ''}</td></tr>`)
        .join('')}</table><div class="muted small">Chênh dưới ~40 điểm giữa hai đề coi là nhiễu, chưa phải tiến bộ thật. Cú nhảy từ đề #1 sang #2 phần lớn do quen dạng đề.</div></div>`
    : `<div class="card muted small">Chưa có đề full. Làm đề #1 rồi ghi ở tab Ghi kết quả.</div>`;

  html += `<h2>Lỗi theo mã</h2><div class="card"><table><tr><th>Mã</th><th class="num">7 ngày</th><th>Từ đầu</th></tr>${Object.entries(CODES)
    .map(([c, v]) => `<tr><td><b>${c}</b> ${esc(v.name)}</td><td class="num">${week[c] || ''}</td><td><span class="bar" style="width:${(all[c] / maxCode) * 80}px"></span> ${all[c] || ''}</td></tr>`)
    .join('')}</table>
    <div class="small" style="margin-top:6px">Làm lại đúng ở mốc +7 ngày: <b>${pct(rs)}</b> <span class="muted">(đo xem lỗi đã sửa thật chưa)</span></div></div>`;

  html += `<h2>Bài TOEIC Listening</h2><div class="card small">
    ${nl.total ? `Đã dictation <b>${dictScores.length}</b>/${nl.total} bài · điểm trung bình <b>${avgDict ?? '–'}</b> · chờ shadowing (≥ 85): <b>${nl.shadow.length}</b> · nên làm lại (< 85): <b>${nl.retry.length}</b>` : 'Chưa có dữ liệu. Mở trang TOEIC Listening trên Parroto một lần.'}
    <div><button class="btn" data-open="${LINKS.listeningTopic}" style="margin-top:6px">Mở TOEIC Listening</button></div></div>`;

  html += `<h2>7 ngày qua</h2><div class="card"><table><tr><th>Ngày</th><th class="num">Phút Parroto</th><th class="num">Từ mới</th><th class="num">Lỗi ghi</th></tr>${days
    .map((x) => {
      const m = Math.round(Object.values(db.time[x] || {}).reduce((a, b) => a + b, 0) / 60);
      const ne = db.errors.filter((e) => e.date === x).length;
      return `<tr><td>${formatVN(x)}</td><td class="num">${m || ''}</td><td class="num">${newWordsOn(db, x) || ''}</td><td class="num">${ne || ''}</td></tr>`;
    })
    .join('')}</table></div>`;

  const an = db.parroto?.analytics;
  const tagCount = {};
  for (const r of db.results) if (r.auto) for (const tg of r.tags || []) tagCount[tg] = (tagCount[tg] || 0) + 1;
  html += `<h2>Dạng câu yếu (theo Parroto)</h2><div class="card small">
    ${an && an.weak?.length ? `<div class="muted">Exam Analytics ngày ${formatVN(an.date)}: ${an.examsTaken ?? '?'} lần làm, cao nhất ${an.best ?? '–'}, gần nhất ${an.latest ?? '–'}</div>
      <table><tr><th>Dạng</th><th class="num">Số câu sai</th></tr>${an.weak.slice(0, 10).map((w) => `<tr><td>${esc(w.tag)}</td><td class="num">${w.wrong}</td></tr>`).join('')}</table>` : 'Mở trang Exam Analytics trên Parroto một lần để extension đọc các dạng câu yếu.'}
    ${Object.keys(tagCount).length ? `<div style="margin-top:6px">"Areas to Improve" lặp lại nhiều nhất: ${Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${esc(k)} (${v})`).join(', ')}</div>` : ''}
  </div>`;
  html += renderWeekCard(weekSummary(db, d));
  html += `<div style="margin-top:8px"><button class="btn" data-open="${LINKS.analytics}">Mở Exam Analytics trên Parroto</button></div>`;
  el.innerHTML = html;
}

// Dashboard: headline tiles, score trend, minutes vs plan, part accuracy, week vs last week.
function renderDashboardTop(d, trend, acc7) {
  const s = db.settings;
  const accAllTop = partAccuracy(db.results, '0000-01-01', d);
  const dayNo = s.examDate ? planDay(d, s.examDate) : null;
  const latest = trend[trend.length - 1];
  const wordDays = new Set([...Object.keys(db.daily || {}), ...Object.keys(db.vocab?.snaps || {})]);
  const words = [...wordDays].reduce((n, x) => n + newWordsOn(db, x), 0);
  const wc = weekCompare(db, d);
  const delta = (a, b, fmt = (v) => v) => {
    if (a == null || b == null) return '';
    const diff = a - b;
    if (!diff) return '<span class="muted small">=</span>';
    return `<span class="${diff > 0 ? 'delta-up' : 'delta-down'}">${diff > 0 ? '▲' : '▼'} ${fmt(Math.abs(diff))}</span>`;
  };
  let html = `<div class="stat-row">
    <div class="stat"><div class="v">${latest ? latest.total : '–'}</div><div class="l">Đề full gần nhất${latest ? ` (L ${latest.L} / R ${latest.R})` : ''}</div></div>
    <div class="stat"><div class="v">${dayNo != null ? Math.max(0, 30 - dayNo) : '–'}</div><div class="l">ngày tới kỳ thi</div></div>
    <div class="stat"><div class="v">${wc.cur.minutes}'</div><div class="l">học trên Parroto 7 ngày ${delta(wc.cur.minutes, wc.prev.minutes, (v) => v + "'")}</div></div>
    <div class="stat"><div class="v">${words}</div><div class="l">từ mới (tự ghi từ Parroto)</div></div>
  </div>`;

  if (trend.length) {
    html += `<h2>Điểm L / R qua các đề full</h2><div class="card">${lineChart({
      labels: trend.map((m) => formatVN(m.date).slice(3)),
      series: [
        { name: 'Listening', color: 'var(--series-1)', values: trend.map((m) => m.L) },
        { name: 'Reading', color: 'var(--series-2)', values: trend.map((m) => m.R) },
      ],
      yMin: 0, yMax: 495,
    })}<div class="muted small">Tổng điểm ở bảng bên dưới. Hai đề chênh dưới ~40 điểm coi là nhiễu.</div></div>`;
  }

  // Minutes studied vs planned, last 14 days.
  const days14 = lastNDays(d, 14);
  const items = days14.map((x) => {
    const m = Math.round(Object.values(db.time[x] || {}).reduce((a, b) => a + b, 0) / 60);
    let plan = 0;
    try { plan = s.examDate ? totalMinutes(buildDay(db, x).tasks) : 0; } catch { plan = 0; }
    return { label: formatVN(x).slice(3, 8), value: m, ref: plan, tip: `${formatVN(x)}: học ${m}' / kế hoạch ${plan}'` };
  });
  if (items.some((i) => i.value > 0)) {
    html += `<h2>Phút học trên Parroto – 14 ngày</h2><div class="card">${barChart({ items, unit: "'" })}<div class="muted small">Cột = phút học extension đếm được; vạch đứt = phút theo kế hoạch ngày đó (gồm cả việc ngoài Parroto).</div></div>`;
  }

  html += `<h2>Tỷ lệ đúng theo Part – 7 ngày</h2><div class="card">${rateBars({
    items: PARTS.map((p) => ({ label: p, rate: acc7[p].rate, n: acc7[p].total, tip: `${p} ${PART_NAME[p]} – 7 ngày: ${acc7[p].total ? acc7[p].correct + '/' + acc7[p].total : 'chưa có'} · từ đầu: ${accAllTop[p].total ? Math.round(accAllTop[p].rate * 100) + '% (' + accAllTop[p].correct + '/' + accAllTop[p].total + ')' : 'chưa có'}` })),
  })}<div class="muted small">⚠ = dưới 60% với ≥ 20 câu → lộ trình tự thêm 20 phút cho Part đó.</div></div>`;

  const row = (label, a, b, fmt = (v) => v, better = 'up') => {
    const show = (v) => (v == null ? '–' : fmt(v));
    let dl = '';
    if (a != null && b != null && a !== b) {
      const good = better === 'up' ? a > b : a < b;
      dl = `<span class="${good ? 'delta-up' : 'delta-down'}">${a > b ? '▲' : '▼'}</span>`;
    }
    return `<tr><td>${label}</td><td class="num">${show(b)}</td><td class="num"><b>${show(a)}</b> ${dl}</td></tr>`;
  };
  const p = (v) => Math.round(v * 100) + '%';
  html += `<h2>Tuần này so với tuần trước</h2><div class="card"><table>
    <tr><th></th><th class="num">Tuần trước</th><th class="num">Tuần này</th></tr>
    ${row("Phút học trên Parroto", wc.cur.minutes, wc.prev.minutes, (v) => v + "'")}
    ${row('Tỷ lệ đúng khi luyện Part', wc.cur.partRate, wc.prev.partRate, p)}
    ${row('Số câu luyện Part', wc.cur.partN, wc.prev.partN)}
    ${row('Bài luyện trong extension', wc.cur.drillN, wc.prev.drillN)}
    ${row('Tỷ lệ đúng bài luyện', wc.cur.drillRate, wc.prev.drillRate, p)}
    ${row('Từ mới', wc.cur.newWords, wc.prev.newWords)}
    ${row('Lỗi đã ghi (ghi đủ là tốt)', wc.cur.errors, wc.prev.errors)}
    ${row('Điểm đề full cao nhất', wc.cur.best, wc.prev.best)}
  </table><div class="muted small">▲ xanh = tốt hơn, ▼ đỏ = kém hơn. Số lỗi ghi nhiều hơn không xấu nếu bạn làm nhiều bài hơn.</div></div>`;
  return html;
}

// ---------- SETTINGS ----------
function renderSettings() {
  const s = db.settings;
  const el = $('#tab-settings');
  let cal = '';
  if (s.examDate) {
    const t = today();
    for (let i = 1; i <= 30; i++) {
      const date = dateForDay(i, s.examDate);
      const p = PLAN[i];
      const label = p.special === 'full' ? `Đề full #${p.fullNo}` : p.special === 'halfL' ? 'Nửa đề L' : p.special === 'halfR' ? 'Nửa đề R' : p.special === 'taper' ? 'Giảm tải' : p.special === 'exam' ? 'THI' : [Array.isArray(p.L) ? p.L.join('+') : p.L === 'redo' ? 'Làm lại' : '', Array.isArray(p.R) ? p.R.join('+') : p.R === 'redo' ? 'Làm lại' : ''].filter(Boolean).join(' · ').replace(/weak/g, 'yếu');
      cal += `<div class="${date === t ? 'today' : ''} ${p.special ? 'special' : ''}"><b>${i} · ${formatVN(date)}</b>${esc(label)}${p.weekly ? ' · Tổng kết' : ''}</div>`;
    }
  }
  el.innerHTML = `
    <h2>Cài đặt</h2>
    <form id="setForm" class="card">
      <div class="row">
        <label>Ngày thi<input type="date" name="examDate" value="${esc(s.examDate)}" required></label>
      </div>
      <div class="row">
        <label>Giờ học chính<input type="time" name="studyStart" value="${esc(s.studyStart)}"></label>
        <label>Giờ học tối<input type="time" name="eveningStart" value="${esc(s.eveningStart)}"></label>
      </div>
      <div class="row">
        <label>Từ mới / ngày<input type="number" name="newWordsPerDay" min="5" max="50" value="${s.newWordsPerDay}"></label>
        <label>Dictation / ngày<input type="number" name="dictationPerDay" min="1" max="5" value="${s.dictationPerDay}"></label>
      </div>
      <div class="row"><label style="flex-direction:row;align-items:center;gap:6px;color:var(--text)"><input type="checkbox" name="remindersOn" ${s.remindersOn ? 'checked' : ''}> Nhắc giờ học (trước giờ học 5 phút)</label></div>
      <button class="btn primary" type="submit">Lưu cài đặt</button>
      <div class="muted small" style="margin-top:6px">Ca thi chiều: giữ giờ học chính 13:30 để quen nhịp giờ thi. Ngày 30 của lộ trình = ngày thi.</div>
    </form>
    ${cal ? `<h2>Lộ trình 30 ngày</h2><div class="calendar">${cal}</div>` : ''}
    <h2>Dữ liệu</h2>
    <div class="card">
      <div class="small">Dữ liệu chỉ nằm trên máy này. Extension tự sao lưu ra thư mục Downloads/toeic-coach mỗi tuần.</div>
      <div class="small muted">Lần sao lưu gần nhất: ${db.meta.lastBackup ? esc(db.meta.lastBackup) : 'chưa có'}</div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
        <button class="btn" id="btnBackup">Sao lưu ngay</button>
        <button class="btn" id="btnImport">Nhập từ file sao lưu</button>
        <input type="file" id="fileImport" accept="application/json" class="hidden">
      </div>
    </div>`;
}

async function exportData() {
  const data = await store.getRaw();
  if (hasChrome && chrome.runtime?.sendMessage) {
    await chrome.runtime.sendMessage({ type: 'backup' });
    toast('Đã sao lưu vào Downloads/toeic-coach.');
    return;
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `toeic-coach-${today()}.json`;
  a.click();
}

async function importData(file) {
  const text = await file.text();
  let data;
  try { data = JSON.parse(text); } catch { return toast('File không phải JSON hợp lệ.'); }
  if (!data.settings || !Array.isArray(data.results)) return toast('File không đúng định dạng sao lưu TOEIC Coach.');
  if (!confirm('Thay toàn bộ dữ liệu hiện tại bằng file này?')) return;
  await store.replaceAll(data);
  toast('Đã nhập dữ liệu.');
}

// ---------- events ----------
document.addEventListener('click', async (ev) => {
  const t = ev.target.closest('button, input[type=checkbox]');
  if (!t) return;
  if (t.closest('.tabs') && t.dataset.tab) return switchTab(t.dataset.tab);
  if (t.dataset.goto) return switchTab(t.dataset.goto);
  if (currentTab === 'drill' && drillClick(t)) return;
  if (t.dataset.open) return openUrl(t.dataset.open);
  if (t.dataset.task) {
    const id = t.dataset.task;
    const d = today();
    await store.update('daily', (all) => {
      const day = all[d] || {};
      const done = { ...(day.done || {}) };
      if (t.checked) done[id] = true; else delete done[id];
      return { ...all, [d]: { ...day, done } };
    });
    return;
  }
  if (t.dataset.kind) { ui.resKind = t.dataset.kind; return render(); }
  if (t.dataset.code) { ui.errCode = t.dataset.code; return renderKeepingForm('#errForm', renderErrors); }
  if (t.dataset.conf) { ui.errConf = t.dataset.conf; return renderKeepingForm('#errForm', renderErrors); }
  if (t.dataset.redo) {
    const pass = t.dataset.pass === '1';
    await store.update('errors', (a) => a.map((e) => (e.id === t.dataset.redo ? { ...e, redo: applyRedo(e.redo, today(), pass) } : e)));
    return toast(pass ? 'Tốt. Câu này hẹn lại ở mốc tiếp theo.' : 'Chưa đúng: hẹn làm lại sau 2 ngày.');
  }
  if (t.dataset.pendcode) {
    const p = (ui.pendRows || []).find((x) => x.key === t.dataset.key);
    if (!p) return;
    const d = today();
    const e = codedError(p, t.dataset.pendcode, d);
    await store.update('errors', (a) => [...a, e]);
    return toast(`${p.part} câu ${p.q} → ${e.code}${e.code === p.sug.code ? '' : ' (bạn sửa gợi ý ' + p.sug.code + ')'}.`);
  }
  if (t.dataset.acceptall) {
    const rows = ui.pendRows || [];
    if (!confirm(`Gắn mã gợi ý cho ${rows.length} câu? (Vẫn sửa được trong danh sách lỗi.)`)) return;
    return acceptRows(rows);
  }
  if (t.dataset.acceptgroup) {
    return acceptRows((ui.pendRows || []).filter((r) => r.session + '|' + r.part === t.dataset.acceptgroup));
  }
  if (t.dataset.dismiss) {
    return store.update('ignore', (ig) => ({ ...ig, errorKeys: [...new Set([...(ig.errorKeys || []), t.dataset.dismiss])] }));
  }
  if (t.dataset.ignoresession) {
    if (!confirm('Bỏ qua kết quả tự ghi này? (không tính vào thống kê)')) return;
    return store.update('ignore', (ig) => ({ ...ig, sessions: [...new Set([...(ig.sessions || []), t.dataset.ignoresession])] }));
  }
  if (t.dataset.delres) {
    if (!confirm('Xóa kết quả này?')) return;
    return store.update('results', (a) => a.filter((r) => r.id !== t.dataset.delres));
  }
  if (t.dataset.delerr) {
    if (!confirm('Xóa lỗi này?')) return;
    return store.update('errors', (a) => a.filter((e) => e.id !== t.dataset.delerr));
  }
  if (t.id === 'btnBackup') return exportData();
  if (t.id === 'btnImport') return $('#fileImport').click();
});

document.addEventListener('change', async (ev) => {
  const t = ev.target;
  if (t.id === 'fileImport' && t.files[0]) return importData(t.files[0]);
  if (t.id === 'fPart' || t.id === 'fCode') {
    ui.errFilter = { part: $('#fPart').value, code: $('#fCode').value };
    return renderKeepingForm('#errForm', renderErrors);
  }
  if (t.dataset.daily) {
    const key = t.dataset.daily;
    const val = key === 'note' ? t.value : t.value === '' ? null : Number(t.value);
    const d = today();
    await store.update('daily', (all) => ({ ...all, [d]: { ...(all[d] || {}), [key]: val } }));
  }
});

document.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const f = ev.target;
  if (f.id === 'resForm') return saveResult(f);
  if (f.id === 'errForm') return saveError(f);
  if (f.id === 'setForm') {
    const x = new FormData(f);
    await store.update('settings', (s) => ({
      ...s,
      examDate: x.get('examDate'),
      studyStart: x.get('studyStart') || '13:30',
      eveningStart: x.get('eveningStart') || '21:00',
      newWordsPerDay: Number(x.get('newWordsPerDay')) || 25,
      dictationPerDay: Number(x.get('dictationPerDay')) || 2,
      remindersOn: !!x.get('remindersOn'),
    }));
    if (hasChrome && chrome.runtime?.sendMessage) chrome.runtime.sendMessage({ type: 'reschedule' });
    toast('Đã lưu cài đặt.');
  }
});

// Re-render a tab but keep the values typed into one form.
function renderKeepingForm(sel, fn) {
  const form = $(sel);
  const vals = form ? Object.fromEntries([...form.elements].filter((e) => e.name).map((e) => [e.name, e.type === 'checkbox' ? e.checked : e.value])) : null;
  fn();
  const nf = $(sel);
  if (nf && vals) for (const e of nf.elements) if (e.name in vals) { if (e.type === 'checkbox') e.checked = vals[e.name]; else e.value = vals[e.name]; }
}

function render() {
  if (!db) return;
  const due = dueErrors(db.errors, today()).length;
  const pill = $('#dueCount');
  pill.textContent = due;
  pill.classList.toggle('hidden', !due);
  const s = db.settings;
  if (s.examDate) {
    const day = planDay(today(), s.examDate);
    $('#dayBadge').innerHTML = day >= 1 && day <= 30 ? `Ngày <b>${day}</b>/30 · thi ${formatVN(s.examDate)}` : day < 1 ? `Còn ${1 - day} ngày tới ngày 1` : 'Đã qua ngày thi';
  } else $('#dayBadge').textContent = 'Chưa có ngày thi';

  // Avoid wiping a form the user is typing in.
  const active = document.activeElement;
  const typing = active && active.closest && active.closest(`#tab-${currentTab}`) && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName);
  if (typing && currentTab !== 'today') return;
  if (currentTab === 'today') {
    if (typing) return;
    renderToday();
  }
  if (currentTab === 'results') renderKeepingForm('#resForm', renderResults);
  if (currentTab === 'errors') renderKeepingForm('#errForm', renderErrors);
  if (currentTab === 'stats') renderStats();
  if (currentTab === 'drill') renderDrill(db);
  if (currentTab === 'settings') renderSettings();
}

// Which attempt an auto-recorded error came from (two attempts of the same test look alike otherwise).
function attemptTag(e) {
  if (!e.srcKey) return '';
  const session = e.srcKey.split('|')[0];
  const r = db.results.find((x) => x.session === session);
  if (!r) return '';
  const what = r.kind === 'full' ? 'đề full' : r.kind === 'part' ? r.part : r.kind === 'halfL' ? 'nửa L' : r.kind === 'halfR' ? 'nửa R' : 'nhiều Part';
  return ` <span class="tag">${r.mode === 'test' ? 'Test' : 'Practice'} · ${what}</span>`;
}

// A listening diagnosis done after the question was already coded updates that error.
let applyingDiag = false;
async function applyDiagnoses() {
  if (applyingDiag) return;
  const todo = db.errors.filter((e) => {
    if (!e.srcKey) return false;
    const [session, q] = e.srcKey.split('|');
    const f = db.review?.[session]?.[q];
    return f && f.diag && e.diagApplied !== f.diag;
  });
  if (!todo.length) return;
  applyingDiag = true;
  try {
    await store.update('errors', (list) => list.map((e) => {
      if (!e.srcKey) return e;
      const [session, q] = e.srcKey.split('|');
      const f = db.review?.[session]?.[q];
      if (!f || !f.diag || e.diagApplied === f.diag) return e;
      return { ...e, code: f.diag, cause: f.diagReason || e.cause, diagApplied: f.diag, codeBeforeDiag: e.codeBeforeDiag || e.code };
    }));
    toast(`Đã cập nhật mã cho ${todo.length} câu theo chẩn đoán nghe của bạn.`);
  } finally {
    applyingDiag = false;
  }
}

async function load() {
  db = await store.getAll();
  applyDiagnoses();
  if (!db.settings.examDate) currentTab = 'settings';
  // Opened from a button on Parroto (e.g. "Luyện 5 câu dạng này"): go straight to that drill.
  const qp = new URLSearchParams(location.search);
  if (qp.get('drill') && !ui.externalStarted) {
    ui.externalStarted = true;
    switchTab('drill');
    startExternal(qp.get('drill'), { focus: qp.get('focus') || '', n: Number(qp.get('n') || 5) });
    return;
  }
  switchTab(currentTab);
}

initDrill({ getDb: () => db, el: () => $('#tab-drill'), rerender: () => render(), toast });

document.addEventListener('keydown', (e) => {
  if (currentTab === 'errors' && ui.pendRows && ui.pendRows.length && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    const rows = ui.pendRows;
    const k = e.key.toUpperCase();
    const move = (n) => {
      ui.pendFocus = Math.max(0, Math.min(rows.length - 1, (ui.pendFocus || 0) + n));
      document.querySelectorAll('.pendrow').forEach((el) => el.classList.toggle('focus', Number(el.dataset.pidx) === ui.pendFocus));
      document.querySelector('.pendrow.focus')?.closest('details')?.setAttribute('open', '');
      document.querySelector('.pendrow.focus')?.scrollIntoView({ block: 'nearest' });
    };
    if (e.key === 'ArrowDown') { move(1); e.preventDefault(); return; }
    if (e.key === 'ArrowUp') { move(-1); e.preventDefault(); return; }
    const r = rows[ui.pendFocus || 0];
    if (!r) return;
    if (e.key === 'Enter' || CODES[k]) {
      e.preventDefault();
      const code = e.key === 'Enter' ? r.sug.code : k;
      store.update('errors', (a) => [...a, codedError(r, code, today())]);
      return;
    }
    if (k === 'X') { e.preventDefault(); store.update('ignore', (ig) => ({ ...ig, errorKeys: [...new Set([...(ig.errorKeys || []), r.key])] })); return; }
  }
  if (currentTab !== 'drill') return;
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  if (drillKey(e)) e.preventDefault();
});

store.onChange(async (keys) => {
  db = await store.getAll();
  if (!keys || keys.includes('review')) applyDiagnoses();
  render();
});

// Refresh at midnight and every minute (time counters).
setInterval(async () => {
  db = await store.getAll();
  render();
}, 60000);

load();
