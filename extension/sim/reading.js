// Computer-based Reading simulator: passage on the left, one question on the right,
// Back / Next / Mark for review / Review grid, mouse highlighting, countdown, auto-submit.

import * as store from '../lib/store.js';
import { today } from '../lib/dates.js';
import { record, shuffle } from '../lib/drill.js';
import { buildTest, score, MODES } from '../lib/sim.js';
import { Q_TYPES } from '../data/reading.js';

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


const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LETTERS = ['A', 'B', 'C', 'D'];

const mode = new URLSearchParams(location.search).get('mode') || 'mix';
let test = null;
let state = null; // { i, answers, marks, order, timeLeft, spent, started, done }
let tick = null;

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast.h);
  toast.h = setTimeout(() => t.classList.add('hidden'), 2200);
}

function fmt(sec) {
  const s = Math.max(0, Math.round(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ---------- start screen ----------
async function showStart() {
  const db = await store.getAll();
  test = buildTest(mode, db.drill);
  $('#simTitle').textContent = 'Mô phỏng Reading thi máy';
  $('#timer').textContent = fmt(test.seconds);
  $('#btnReview').classList.add('hidden');
  $('#btnSubmit').classList.add('hidden');
  $('#app').innerHTML = `<div class="start-card card">
    <h2>${esc(test.name)}</h2>
    <p>${test.questions.length} câu · ${Math.round(test.seconds / 60)} phút (Part 6 ≈ 37 giây/câu, Part 7 ≈ 1 phút/câu).</p>
    <ul class="small">
      <li>Giống phòng thi máy IIG: <b>Next / Back</b>, <b>Mark for review</b>, bảng <b>Review</b>, hết giờ tự nộp.</li>
      <li>Bôi đen chữ trong đoạn văn để <b>highlight</b> (bấm vào chỗ highlight để xóa).</li>
      <li><b>Không dùng giấy nháp</b>. Câu nào quá lâu: chọn tạm, đánh dấu, đi tiếp.</li>
      <li>Phím tắt: 1–4 hoặc A–D chọn đáp án · ← → chuyển câu · M đánh dấu.</li>
    </ul>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${Object.entries(MODES).map(([k, v]) => `<button class="btn ${k === mode ? 'primary' : ''}" data-mode="${k}">${esc(v.name)}</button>`).join('')}
    </div>
    <div style="margin-top:14px"><button class="btn primary" id="btnStart">Bắt đầu (${test.questions.length} câu)</button></div>
  </div>`;
}

function begin() {
  const order = {};
  for (const q of test.questions) order[q.id] = shuffle([0, 1, 2, 3].slice(0, q.o.length));
  state = { i: 0, answers: {}, marks: {}, order, timeLeft: test.seconds, spent: {}, lastSwitch: Date.now(), done: false };
  $('#btnReview').classList.remove('hidden');
  $('#btnSubmit').classList.remove('hidden');
  $('#simTitle').textContent = test.name;
  renderShell();
  show(0);
  tick = setInterval(() => {
    state.timeLeft -= 1;
    const t = $('#timer');
    t.textContent = fmt(state.timeLeft);
    t.classList.toggle('low', state.timeLeft <= 120);
    if (state.timeLeft === 300) toast('Còn 5 phút.');
    if (state.timeLeft <= 0) submit(true);
  }, 1000);
}

// ---------- test screen ----------
function renderDoc(set) {
  if (set.part === 'P6') {
    const html = esc(set.text).replace(/\{\{(\d)\}\}/g, (_, n) => `<span class="blank" data-blank="${set.id}-${n}">(${n})</span>`);
    return `<div class="doc"><h4>${esc(set.title)}</h4>${html}</div>`;
  }
  return set.docs.map((d) => `<div class="doc"><h4>${esc(d.title)}</h4>${esc(d.text)}</div>`).join('');
}

function renderShell() {
  $('#app').innerHTML = `<div class="split">
    <div class="pane left" id="passages">${test.sets.map((s) => `<div class="setdoc" data-set="${s.id}" style="display:none">${renderDoc(s)}</div>`).join('')}</div>
    <div class="pane" id="qpane"></div>
  </div>`;
}

function noteTime() {
  const q = test.questions[state.i];
  const now = Date.now();
  state.spent[q.id] = (state.spent[q.id] || 0) + (now - state.lastSwitch) / 1000;
  state.lastSwitch = now;
}

function show(i) {
  if (state.done) return;
  if (i < 0 || i >= test.questions.length) return;
  if (state.i !== i) noteTime();
  state.i = i;
  const q = test.questions[i];
  document.querySelectorAll('.setdoc').forEach((d) => { d.style.display = d.dataset.set === q.setId ? '' : 'none'; });
  document.querySelectorAll('.blank').forEach((b) => b.classList.toggle('cur', b.dataset.blank === `${q.setId}-${q.blank}`));
  const order = state.order[q.id];
  $('#qpane').innerHTML = `
    <div class="qhead"><span class="qnum">Question ${i + 1} / ${test.questions.length}</span><span class="tag">${q.part}</span></div>
    <div class="qtext">${esc(q.text)}</div>
    ${order.map((orig, shownIdx) => `<button class="opt ${state.answers[q.id] === shownIdx ? 'sel' : ''}" data-ans="${shownIdx}"><b>(${LETTERS[shownIdx]})</b><span>${esc(q.o[orig])}</span></button>`).join('')}
    <div class="navrow">
      <button class="btn" id="btnBack" ${i === 0 ? 'disabled' : ''}>← Back</button>
      <label class="markbox"><input type="checkbox" id="chkMark" ${state.marks[q.id] ? 'checked' : ''}> Mark for review</label>
      <button class="btn primary" id="btnNext">${i === test.questions.length - 1 ? 'Review' : 'Next →'}</button>
    </div>
    <div class="muted small" style="margin-top:10px">Đã trả lời ${Object.keys(state.answers).length}/${test.questions.length} · đánh dấu ${Object.values(state.marks).filter(Boolean).length}</div>`;
  if (q.part === 'P6') document.querySelector('.blank.cur')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function renderReview() {
  const ov = $('#reviewOverlay');
  const unanswered = test.questions.filter((q) => state.answers[q.id] == null).length;
  ov.innerHTML = `<div class="center">
    <h2>Review</h2>
    <div class="legend"><span>■ đã trả lời</span><span>□ chưa trả lời (${unanswered})</span><span>⚑ đã đánh dấu</span></div>
    <div class="grid">${test.questions.map((q, i) => `<button class="${state.answers[q.id] != null ? 'ans' : ''} ${state.marks[q.id] ? 'mark' : ''}" data-goto="${i}">${i + 1}</button>`).join('')}</div>
    <div style="margin-top:16px;display:flex;gap:8px"><button class="btn" id="btnCloseReview">Quay lại câu ${state.i + 1}</button><button class="btn primary" id="btnSubmit2">Submit</button></div>
  </div>`;
  ov.classList.remove('hidden');
}

// ---------- highlight ----------
document.addEventListener('mouseup', () => {
  if (!state || state.done) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  const doc = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
  if (!doc.closest || !doc.closest('#passages')) return;
  try {
    const mark = document.createElement('mark');
    mark.className = 'hl';
    range.surroundContents(mark);
  } catch {
    // Selection crosses element boundaries; highlight text nodes one by one is overkill here.
    toast('Chỉ highlight được trong một đoạn liền mạch.');
  }
  sel.removeAllRanges();
});

// ---------- submit / results ----------
async function submit(auto) {
  if (state.done) return;
  noteTime();
  state.done = true;
  clearInterval(tick);
  $('#reviewOverlay').classList.add('hidden');
  const res = score(test, state.answers, state.order);
  const used = test.seconds - Math.max(0, state.timeLeft);
  const d = today();
  await store.update('drill', (dr) => {
    let out = dr || { items: {}, log: [] };
    for (const r of res.rows) {
      out = { ...out, log: [...out.log, { kind: r.q.part === 'P6' ? 'p6' : 'p7', id: r.q.id, cat: r.q.type, correct: r.ok, secs: Math.round(state.spent[r.q.id] || 0), date: d }] };
    }
    for (const s of test.sets) {
      const rows = res.rows.filter((r) => r.q.setId === s.id);
      const ok = rows.filter((r) => r.ok).length / Math.max(1, rows.length) >= 0.75;
      out = record(out, { kind: 'simset', id: s.id, cat: s.part, correct: ok, date: d });
    }
    return { ...out, log: [...out.log, { kind: 'sim', id: 'sim-' + Date.now(), cat: mode, correct: res.correct, total: res.total, secs: used, auto: !!auto, date: d }] };
  });
  renderResults(res, used, auto);
}

function renderResults(res, used, auto) {
  $('#btnReview').classList.add('hidden');
  $('#btnSubmit').classList.add('hidden');
  $('#timer').textContent = fmt(used);
  const avg = Math.round(used / res.total);
  const target = test.questions.reduce((t, q) => t + (q.part === 'P6' ? 37.5 : 60), 0) / res.total;
  $('#app').innerHTML = `<div class="center">
    <h2>${auto ? 'Hết giờ – bài đã tự nộp. ' : ''}Kết quả: ${res.correct}/${res.total} câu đúng (${Math.round((res.correct / res.total) * 100)}%)</h2>
    <div class="card small">
      <div>Thời gian dùng: <b>${fmt(used)}</b> · trung bình <b>${avg} giây/câu</b> (mục tiêu ≤ ${Math.round(target)} giây)</div>
      <table style="margin-top:8px"><tr><th>Dạng câu</th><th class="num">Đúng</th></tr>${Object.entries(res.byType).map(([k, v]) => `<tr><td>${esc(Q_TYPES[k] || k)}</td><td class="num ${v.ok / v.n < 0.6 ? 'rate-bad' : ''}">${v.ok}/${v.n}</td></tr>`).join('')}</table>
      <div class="muted" style="margin-top:6px">Đã lưu vào tab Luyện / Tiến độ của extension. Bộ nào làm dưới 75% sẽ quay lại sớm hơn.</div>
    </div>
    <h2>Xem lại từng câu</h2>
    ${res.rows.map((r, i) => `<div class="card reviewq ${r.ok ? 'ok' : 'no'}">
      <div class="small muted">Câu ${i + 1} · ${r.q.part} · ${esc(Q_TYPES[r.q.type] || r.q.type)} · ${Math.round(state.spent[r.q.id] || 0)} giây</div>
      <div style="margin:4px 0"><b>${esc(r.q.text)}</b></div>
      <div class="small">Bạn chọn: ${r.chosen == null ? '<i>bỏ trống</i>' : esc(r.q.o[r.chosen])} ${r.ok ? '✓' : `✗ — đáp án: <b>${esc(r.q.o[r.q.a])}</b>`}</div>
      <div class="small muted" style="margin-top:4px">${esc(r.q.why)}</div>
    </div>`).join('')}
    <div style="display:flex;gap:8px"><button class="btn primary" id="btnAgain">Làm bài khác</button><button class="btn" id="btnClose">Đóng tab</button></div>
  </div>`;
}

// ---------- events ----------
document.addEventListener('click', (e) => {
  const t = e.target.closest('button, mark.hl, input');
  if (!t) return;
  if (t.matches('mark.hl')) {
    const parent = t.parentNode;
    while (t.firstChild) parent.insertBefore(t.firstChild, t);
    parent.removeChild(t);
    return;
  }
  if (t.dataset.mode) { location.search = '?mode=' + t.dataset.mode; return; }
  if (t.id === 'btnStart') return begin();
  if (t.id === 'btnAgain') { location.reload(); return; }
  if (t.id === 'btnClose') { window.close(); return; }
  if (!state || state.done) return;
  if (t.dataset.ans != null) {
    const q = test.questions[state.i];
    state.answers[q.id] = Number(t.dataset.ans);
    show(state.i);
    return;
  }
  if (t.id === 'btnBack') return show(state.i - 1);
  if (t.id === 'btnNext') return state.i === test.questions.length - 1 ? renderReview() : show(state.i + 1);
  if (t.id === 'chkMark') { state.marks[test.questions[state.i].id] = t.checked; return; }
  if (t.id === 'btnReview') return renderReview();
  if (t.dataset.goto != null) { $('#reviewOverlay').classList.add('hidden'); return show(Number(t.dataset.goto)); }
  if (t.id === 'btnCloseReview') { $('#reviewOverlay').classList.add('hidden'); return; }
  if (t.id === 'btnSubmit' || t.id === 'btnSubmit2') {
    const un = test.questions.filter((q) => state.answers[q.id] == null).length;
    if (un && !confirm(`Còn ${un} câu chưa trả lời. Nộp bài? (Phòng thi thật: không trừ điểm câu sai, nên đừng để trống.)`)) return;
    return submit(false);
  }
});

document.addEventListener('keydown', (e) => {
  if (!state || state.done || !$('#reviewOverlay').classList.contains('hidden')) return;
  const k = e.key.toUpperCase();
  const q = test.questions[state.i];
  let idx = -1;
  if (/^[1-4]$/.test(k)) idx = Number(k) - 1;
  else if (LETTERS.includes(k)) idx = LETTERS.indexOf(k);
  if (idx >= 0 && idx < q.o.length) { state.answers[q.id] = idx; show(state.i); e.preventDefault(); return; }
  if (e.key === 'ArrowRight') { show(state.i + 1); e.preventDefault(); }
  if (e.key === 'ArrowLeft') { show(state.i - 1); e.preventDefault(); }
  if (k === 'M') { state.marks[q.id] = !state.marks[q.id]; show(state.i); }
});

window.addEventListener('beforeunload', (e) => {
  if (state && !state.done) { e.preventDefault(); e.returnValue = ''; }
});

showStart();
