// More drills for the "Luyện" tab: Part 3/4 fast question reading, paraphrase matching,
// and the launcher for the computer-based Reading simulator.

import * as store from '../lib/store.js';
import { today, addDays } from '../lib/dates.js';
import { P34, FOCUS, PARA } from '../data/listen-read.js';
import { pick, record, groupAccuracy, countToday, shuffle } from '../lib/drill.js';
import { MODES } from '../lib/sim.js';
import { pendingPrompts, hints, CHECKLIST } from '../lib/writing.js';
import { ANTO } from '../data/topics.js';
import { TIPS } from '../lib/tips.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (r) => (r == null ? '–' : Math.round(r * 100) + '%');
const hasChrome = typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime?.getURL;

let ctx = null;
let s = null; // extra session
let timer = null;
const prefs = { flashSec: 9 };

export function initExtra(c) { ctx = c; }
export function extraActive() { return !!s; }
export function stopExtra() { if (timer) clearInterval(timer); timer = null; }
export function resumeExtra() { if (s && !s.done && s.kind === 'p34' && s.phase === 'read' && !timer) beginRead(); }

export function renderExtraLauncher(db) {
  const d = today();
  const log = db.drill?.log || [];
  const focusAcc = groupAccuracy(log, 'p34', '0000-01-01', d);
  const simToday = log.filter((e) => e.kind === 'sim' && e.date === d);
  const lastSim = log.filter((e) => e.kind === 'sim').slice(-1)[0];
  const readAcc = groupAccuracy(log.filter((e) => e.kind === 'p6' || e.kind === 'p7').map((e) => ({ ...e, kind: 'r' })), 'r', addDays(d, -13), d);
  const mine = db.drill?.myPairs || [];
  return `
    <h2>Mô phỏng Reading thi máy</h2>
    <div class="card">
      <div class="small muted">Mở một tab riêng giống màn hình thi máy IIG: Next / Back / Mark for review / Review, highlight bằng chuột, đếm ngược, hết giờ tự nộp. Hôm nay: <b>${simToday.length}</b> bài${lastSim ? ` · lần gần nhất ${lastSim.correct}/${lastSim.total}` : ''}.</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${Object.entries(MODES).map(([k, v]) => `<button class="btn ${k === 'mix' ? 'primary' : ''}" data-sim="${k}" title="${esc(v.name)}">${k === 'p6' ? 'Part 6' : k === 'p7' ? 'Part 7' : 'Mini Reading'}</button>`).join('')}</div>
      ${Object.keys(readAcc).length ? `<div class="small" style="margin-top:6px">14 ngày: ${Object.entries(readAcc).map(([k, v]) => `${esc(typeName(k))} ${pct(v.rate)}`).join(' · ')}</div>` : ''}
    </div>
    <h2>Đọc nhanh câu hỏi Part 3/4</h2>
    <div class="card">
      <div class="small muted">Thi máy chỉ cho vài giây để đọc câu hỏi trước khi audio chạy. Bài này hiện 3 câu hỏi trong ${prefs.flashSec} giây rồi ẩn đi; bạn phải nhớ từng câu hỏi gì (thời gian, lý do, đề nghị…). Hôm nay: <b>${countToday(log, 'p34', d)}</b> câu.</div>
      <div style="display:flex;gap:6px;align-items:center;margin-top:8px">
        <select id="flashSec">${[6, 9, 12].map((n) => `<option value="${n}" ${prefs.flashSec === n ? 'selected' : ''}>${n} giây</option>`).join('')}</select>
        <button class="btn primary" data-xstart="p34">Bắt đầu (5 bộ)</button>
      </div>
      ${Object.keys(focusAcc).length ? `<div class="small" style="margin-top:6px">Nhớ đúng: ${Object.entries(focusAcc).sort((a, b) => a[1].rate - b[1].rate).slice(0, 4).map(([k, v]) => `${esc(FOCUS[k])} ${pct(v.rate)}`).join(' · ')}</div>` : ''}
    </div>
    ${writeCard(db)}
    <h2>Paraphrase</h2>
    <div class="card">
      <div class="small muted">Đáp án đúng trong TOEIC thường nói lại ý bằng từ khác. Nối cụm nghe/đọc được (trái) với cách nói lại trong đáp án (phải). ${PARA.length} cặp có sẵn + <b>${mine.length}</b> cặp của bạn. Hôm nay: <b>${countToday(log, 'para', d)}</b> cặp.</div>
      <button class="btn primary" data-xstart="para" style="margin-top:8px">Bắt đầu (2 vòng × 5 cặp)</button>
      <details style="margin-top:8px"><summary class="small">Thêm cặp của bạn (từ câu sai trong đề)</summary>
        <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
          <input id="myA" placeholder="Trong bài: vd postpone" style="flex:1;min-width:120px">
          <input id="myB" placeholder="Trong đáp án: vd delay" style="flex:1;min-width:120px">
          <button class="btn" data-xaddpair="1">Thêm</button>
        </div>
        ${mine.length ? `<div class="small" style="margin-top:6px">${mine.slice(-8).reverse().map((p) => `<div>${esc(p.a)} ↔ ${esc(p.b)} <button class="link" data-xdelpair="${p.id}">xóa</button></div>`).join('')}</div>` : ''}
      </details>
    </div>
    <h2>Quiz mẹo thi</h2>
    <div class="card">
      <div class="small muted">10 tình huống trong phòng thi, chọn cách xử lý đúng; sai thì câu quay lại vào ngày mai (lặp giãn cách). ${TIPS.length} mẹo cho 7 Part; trên trang làm đề Parroto, mỗi Part cũng hiện 3 mẹo hợp với lỗi bạn hay mắc. Hôm nay: <b>${countToday(log, 'tip', d)}</b> câu.</div>
      <button class="btn primary" data-xstart="tipq" style="margin-top:8px">Bắt đầu (10 câu)</button>
    </div>
    <h2>Trái nghĩa & mindmap <span class="muted small">(bổ trợ)</span></h2>
    <div class="card">
      <div class="small muted">Hai bài này có bằng chứng yếu hơn các bài trên, dùng khi muốn đổi không khí. Trái nghĩa giúp câu NOT / suy luận ("unlike", "rather than"); mindmap giúp xem từ theo chủ đề công sở. Trái nghĩa hôm nay: <b>${countToday(log, 'anto', d)}</b> cặp.</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
        <button class="btn" data-xstart="anto">Trái nghĩa (2 vòng × 5 cặp)</button>
        <button class="btn" data-mindmap="1">Mở mindmap chủ đề</button>
      </div>
    </div>`;
}

function writeCard(db) {
  const d = today();
  const pend = pendingPrompts(db, d);
  const sentences = db.drill?.sentences || [];
  return `<h2>Viết câu tự chấm</h2>
    <div class="card">
      <div class="small muted">Sau mỗi lỗi từ vựng (V) hoặc ngữ pháp (G) và mỗi câu Part 5 bạn làm sai: viết 1 câu mới dùng đúng từ / quy tắc đó, rồi tự chấm theo 4 tiêu chí. Không dùng AI. Đang chờ: <b>${pend.length}</b> câu · hôm nay đã viết: <b>${countToday(db.drill?.log, 'write', d)}</b>.</div>
      <button class="btn primary" data-xstart="write" style="margin-top:8px" ${pend.length ? '' : 'disabled'}>Viết ${Math.min(3, pend.length) || ''} câu</button>
      ${sentences.length ? `<details style="margin-top:8px"><summary class="small">Câu đã viết (${sentences.length})</summary>${sentences.slice(-10).reverse().map((x) => `<div class="small" style="margin-top:4px">${x.pass ? '✓' : '✗'} ${esc(x.text)} <span class="muted">— ${esc(x.target || '')}</span></div>`).join('')}</details>` : ''}
    </div>`;
}

function typeName(k) {
  return { grammar: 'Ngữ pháp', vocab: 'Từ vựng', connector: 'Từ nối', insert: 'Chèn câu', main: 'Ý chính', detail: 'Chi tiết', not: 'NOT', infer: 'Suy luận', wordctx: 'Nghĩa từ', intent: 'Ý định', cross: 'Nhiều văn bản' }[k] || k;
}

function openSim(mode) {
  const url = hasChrome ? chrome.runtime.getURL(`sim/reading.html?mode=${mode}`) : `../sim/reading.html?mode=${mode}`;
  if (hasChrome) chrome.tabs.create({ url });
  else window.open(url, '_blank');
}

// ---------- P3/4 fast reading ----------
function startFlash() {
  prefs.flashSec = Number(document.getElementById('flashSec')?.value || 9);
  const db = ctx.getDb();
  const d = today();
  const bank = P34.map((x) => ({ ...x, group: x.part }));
  const sets = pick(bank, db.drill, d, 5);
  s = { kind: 'p34', sets, i: 0, phase: 'read', j: 0, results: [], picks: {} };
  beginRead();
}

function beginRead() {
  stopExtra();
  s.phase = 'read';
  s.j = 0;
  s.picks = {};
  s.until = Date.now() + prefs.flashSec * 1000;
  // Build the 4 choices for each question now so they stay stable.
  const keys = Object.keys(FOCUS);
  s.choices = s.sets[s.i].qs.map((q) => shuffle([q.focus, ...shuffle(keys.filter((k) => k !== q.focus)).slice(0, 3)]));
  ctx.rerender();
  timer = setInterval(() => {
    const left = (s.until - Date.now()) / 1000;
    const bar = document.getElementById('fbar');
    if (bar) bar.style.width = Math.max(0, (left / prefs.flashSec) * 100) + '%';
    if (left <= 0) { stopExtra(); s.phase = 'quiz'; ctx.rerender(); }
  }, 100);
}

async function answerFlash(choice) {
  const set = s.sets[s.i];
  const q = set.qs[s.j];
  const ok = choice === q.focus;
  s.picks[s.j] = choice;
  s.results.push(ok);
  const d = today();
  await store.update('drill', (dr) => ({ ...dr, log: [...(dr.log || []), { kind: 'p34', id: `${set.id}-${s.j}`, cat: q.focus, correct: ok, date: d }] }));
  if (s.j < 2) s.j++;
  else {
    const allOk = [0, 1, 2].every((j) => s.picks[j] === set.qs[j].focus);
    await store.update('drill', (dr) => record(dr, { kind: 'p34set', id: set.id, cat: set.part, correct: allOk, date: d }));
    s.phase = 'review';
  }
  ctx.rerender();
}

function renderFlash() {
  const set = s.sets[s.i];
  let html = `<div class="small muted">Bộ ${s.i + 1}/${s.sets.length} · ${set.part === 'P3' ? 'Part 3 – hội thoại' : 'Part 4 – bài nói'}</div>`;
  if (s.phase === 'read') {
    html += `<div class="progressbar"><div id="fbar" style="width:100%;background:var(--accent)"></div></div>
      <div class="card" style="margin-top:8px">${set.qs.map((q, j) => `<div style="margin-bottom:6px"><b>${j + 1}.</b> ${esc(q.text)}</div>`).join('')}</div>
      <div class="muted small">Đọc nhanh: gạch trong đầu từ hỏi + danh từ khóa. Câu hỏi sẽ ẩn sau ${prefs.flashSec} giây.</div>`;
  } else if (s.phase === 'quiz') {
    html += `<div class="card" style="margin-top:8px"><b>Câu hỏi ${s.j + 1} hỏi về điều gì?</b></div>
      ${s.choices[s.j].map((k, n) => `<button class="btn" data-xflash="${k}" style="display:block;width:100%;text-align:left;margin-bottom:6px;padding:8px 10px">${n + 1}. ${esc(FOCUS[k])}</button>`).join('')}`;
  } else {
    html += `<div class="card" style="margin-top:8px">${set.qs.map((q, j) => {
      const ok = s.picks[j] === q.focus;
      return `<div style="margin-bottom:6px">${ok ? '✓' : '✗'} <b>${j + 1}.</b> ${esc(q.text)}<div class="small muted">→ ${esc(FOCUS[q.focus])}${ok ? '' : ` (bạn chọn: ${esc(FOCUS[s.picks[j]])})`}</div></div>`;
    }).join('')}</div>
    <button class="btn primary" data-xnext="1">${s.i + 1 < s.sets.length ? 'Bộ tiếp (Enter)' : 'Xem kết quả'}</button>`;
  }
  return html;
}

// ---------- paraphrase matching ----------
function startPara(kind = 'para') {
  const db = ctx.getDb();
  const d = today();
  let bank;
  if (kind === 'anto') {
    bank = ANTO.map((p) => ({ ...p, group: 'base' }));
  } else {
    const mine = (db.drill?.myPairs || []).map((p) => ({ ...p, group: 'mine' }));
    bank = [...mine, ...PARA.map((p) => ({ ...p, group: 'base' }))];
  }
  const chosen = pick(bank, db.drill, d, 10, { boost: { mine: 2 } });
  s = { kind, rounds: [chosen.slice(0, 5), chosen.slice(5, 10)].filter((r) => r.length), r: 0, results: [] };
  beginRound();
}

function beginRound() {
  const round = s.rounds[s.r];
  s.left = shuffle(round);
  s.right = shuffle(round);
  s.sel = null;
  s.matched = {};
  s.missed = {};
  s.flash = null;
  ctx.rerender();
}

async function pickRight(id) {
  if (!s.sel || s.matched[id]) return;
  const d = today();
  if (s.sel === id) {
    s.matched[id] = true;
    const ok = !s.missed[id];
    s.results.push(ok);
    await store.update('drill', (dr) => record(dr, { kind: s.kind, id, cat: s.kind, correct: ok, date: d }));
    s.sel = null;
    if (Object.keys(s.matched).length === s.left.length) s.roundDone = true;
  } else {
    s.missed[s.sel] = true;
    s.flash = id;
    setTimeout(() => { if (s) { s.flash = null; ctx.rerender(); } }, 500);
  }
  ctx.rerender();
}

function renderPara() {
  const btn = (p, side) => {
    const done = s.matched[p.id];
    const sel = side === 'L' && s.sel === p.id;
    const bad = side === 'R' && s.flash === p.id;
    const cls = done ? 'ok' : bad ? 'bad' : sel ? 'primary' : '';
    const hint = done && side === 'L' && p.vi ? `<span class="muted small"> · ${esc(p.vi)}</span>` : '';
    return `<button class="btn ${cls}" data-xp${side.toLowerCase()}="${p.id}" style="display:block;width:100%;text-align:left;margin-bottom:6px;padding:8px" ${done ? 'disabled' : ''}>${esc(side === 'L' ? p.a : p.b)}${hint}</button>`;
  };
  const done = Object.keys(s.matched).length === s.left.length;
  return `<div class="small muted">Vòng ${s.r + 1}/${s.rounds.length} · ${s.kind === 'anto' ? 'chọn từ bên trái rồi chọn từ trái nghĩa bên phải' : 'chọn cụm bên trái rồi chọn cách nói lại bên phải'}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
      <div>${s.left.map((p) => btn(p, 'L')).join('')}</div>
      <div>${s.right.map((p) => btn(p, 'R')).join('')}</div>
    </div>
    ${done ? `<button class="btn primary" data-xnext="1">${s.r + 1 < s.rounds.length ? 'Vòng tiếp (Enter)' : 'Xem kết quả'}</button>` : ''}`;
}

// ---------- self-checked writing ----------
function startWrite() {
  const db = ctx.getDb();
  const prompts = pendingPrompts(db, today()).slice(0, 3);
  if (!prompts.length) return;
  s = { kind: 'write', prompts, i: 0, phase: 'write', results: [] };
  ctx.rerender();
}

function renderWrite() {
  const p = s.prompts[s.i];
  let html = `<div class="small muted">Câu ${s.i + 1}/${s.prompts.length} · ${esc(p.src)}</div>
    <div class="card" style="margin-top:8px">
      ${p.needsTarget ? `<label class="small muted">Từ / quy tắc cần luyện (bạn chưa ghi nguyên nhân):<input id="wTarget" value="${esc(s.target || '')}" placeholder="vd: comply with"></label>` : `<div><b>Cần dùng:</b> ${esc(p.target)}</div>`}
      <div class="small muted" style="margin-top:4px">${esc(p.rule)}</div>
    </div>`;
  if (s.phase === 'write') {
    html += `<textarea id="wText" rows="3" placeholder="Viết một câu tiếng Anh mới (không chép câu mẫu)…">${esc(s.text || '')}</textarea>
      <button class="btn primary" data-xwcheck="1" style="margin-top:6px">Kiểm tra</button>`;
  } else {
    const hs = hints(s.text, p.model ? p.target : '');
    html += `<div class="card"><div><b>Câu của bạn:</b> ${esc(s.text)}</div>
        ${hs.length ? `<div class="small" style="color:var(--warn);margin-top:4px">${hs.map(esc).join('<br>')}</div>` : ''}
        ${p.model ? `<div class="small" style="margin-top:6px"><b>Câu mẫu:</b> ${esc(p.model)}</div>` : ''}
      </div>
      <div class="card small">${CHECKLIST.map((c, i) => `<label style="display:flex;gap:6px;align-items:flex-start;margin-bottom:4px"><input type="checkbox" data-wck="${i}" ${s.checks?.[i] ? 'checked' : ''}> ${esc(c)}</label>`).join('')}</div>
      <div style="display:flex;gap:6px"><button class="btn ok" data-xwgrade="1">Đạt (đủ 4 ý)</button><button class="btn bad" data-xwgrade="0">Chưa đạt – viết lại sau 1 ngày</button><button class="link" data-xwedit="1">Sửa câu</button></div>`;
  }
  return html;
}

async function gradeWrite(pass) {
  const p = s.prompts[s.i];
  const d = today();
  const entry = { id: p.id, target: p.needsTarget ? s.target : p.target, text: s.text, pass, date: d };
  s.results.push(pass);
  await store.update('drill', (dr) => {
    const withRec = record(dr, { kind: 'write', id: 'w:' + p.id, cat: p.id.startsWith('err-') ? 'err' : 'p5', correct: pass, date: d });
    return { ...withRec, sentences: [...(dr.sentences || []), entry] };
  });
  s.text = '';
  s.target = '';
  s.checks = {};
  if (s.i + 1 < s.prompts.length) { s.i++; s.phase = 'write'; } else s.done = true;
  ctx.rerender();
}

// ---------- Exam-tip quiz ----------
function startTipQuiz() {
  const db = ctx.getDb();
  const d = today();
  const bank = TIPS.map((t) => ({ ...t, group: t.part }));
  const items = pick(bank, db.drill, d, 10, { accuracy: groupAccuracy(db.drill?.log || [], 'tip', addDays(d, -13), d) });
  s = { kind: 'tipq', items, i: 0, results: [] };
  beginTip();
}

function beginTip() {
  const t = s.items[s.i];
  s.phase = 'ask';
  s.pickIdx = null;
  s.opts = shuffle([t.quiz.a, ...t.quiz.w]);
  ctx.rerender();
}

async function answerTip(idx) {
  if (s.phase !== 'ask') return;
  const t = s.items[s.i];
  const ok = s.opts[idx] === t.quiz.a;
  s.pickIdx = idx;
  s.phase = 'review';
  s.results.push(ok);
  await store.update('drill', (dr) => record(dr, { kind: 'tip', id: t.id, cat: t.part, correct: ok, date: today() }));
  ctx.rerender();
}

function renderTip() {
  const t = s.items[s.i];
  let html = `<div class="small muted">Câu ${s.i + 1}/${s.items.length} · ${t.part}</div><div class="card" style="margin-top:6px"><b>${esc(t.quiz.q)}</b></div>`;
  html += s.opts.map((o, n) => {
    const mark = s.phase === 'review' ? (o === t.quiz.a ? ' style="display:block;width:100%;text-align:left;margin-bottom:6px;padding:8px 10px;border-color:var(--ok, #16a34a)"' : n === s.pickIdx ? ' style="display:block;width:100%;text-align:left;margin-bottom:6px;padding:8px 10px;border-color:var(--bad, #dc2626)"' : ' style="display:block;width:100%;text-align:left;margin-bottom:6px;padding:8px 10px;opacity:.6"') : ' style="display:block;width:100%;text-align:left;margin-bottom:6px;padding:8px 10px"';
    return `<button class="btn" data-xtip="${n}"${mark} ${s.phase === 'review' ? 'disabled' : ''}>${n + 1}. ${esc(o)}</button>`;
  }).join('');
  if (s.phase === 'review') {
    const ok = s.opts[s.pickIdx] === t.quiz.a;
    html += `<div class="card small" style="margin-top:6px">${ok ? '✓ Đúng.' : '✗ Chưa đúng.'} <b>Mẹo:</b> ${esc(t.text)}</div>
      <button class="btn primary" data-xnext="1">${s.i + 1 < s.items.length ? 'Câu tiếp (Enter)' : 'Xem kết quả'}</button>`;
  }
  return html;
}

// ---------- shared ----------
function renderSummary() {
  const ok = s.results.filter(Boolean).length;
  const what = s.kind === 'tipq' ? 'tình huống xử lý đúng' : s.kind === 'p34' ? 'câu hỏi nhớ đúng' : s.kind === 'write' ? 'câu tự chấm đạt' : 'cặp nối đúng ngay lần đầu';
  return `<h2>Xong: ${ok}/${s.results.length} ${what}</h2>
    <div class="card small">${s.kind === 'tipq' ? 'Câu sai quay lại vào ngày mai; câu đúng quay lại sau 3, 7, 16 ngày. Trên trang làm đề Parroto, thẻ 💡 nhắc lại 3 mẹo hợp với lỗi bạn hay mắc khi bạn vào mỗi Part.' : s.kind === 'write' ? 'Câu chưa đạt sẽ quay lại vào ngày mai; câu đạt quay lại sau 3, 7, 16 ngày để bạn viết câu mới khác.' : s.kind === 'p34' ? 'Mẹo: khi nghe, chỉ cần canh đúng loại thông tin mỗi câu hỏi cần (thời gian, lý do, đề nghị…). Đáp án thường xuất hiện theo thứ tự câu hỏi.' : 'Cặp sai sẽ quay lại vào ngày mai; cặp đúng quay lại sau 3, 7, 16 ngày. Thêm cặp từ chính câu sai của bạn để nhớ lâu hơn.'}</div>
    <div style="display:flex;gap:6px"><button class="btn primary" data-xstart="${s.kind}">Làm thêm</button><button class="btn" data-xquit="1">Về tab Luyện</button></div>`;
}

export function renderExtra(el) {
  if (s.done) { el.innerHTML = renderSummary(); return; }
  el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b>${{ p34: 'Đọc nhanh câu hỏi P3/4', para: 'Paraphrase', write: 'Viết câu tự chấm', anto: 'Trái nghĩa', tipq: 'Quiz mẹo thi' }[s.kind]}</b><button class="link" data-xquit="1">Dừng</button></div>` + (s.kind === 'tipq' ? renderTip() : s.kind === 'p34' ? renderFlash() : s.kind === 'write' ? renderWrite() : renderPara());
}

function nextStep() {
  if (s.kind === 'tipq') {
    if (s.i + 1 < s.items.length) { s.i++; beginTip(); } else { s.done = true; ctx.rerender(); }
  } else if (s.kind === 'p34') {
    if (s.i + 1 < s.sets.length) { s.i++; beginRead(); } else { s.done = true; ctx.rerender(); }
  } else if (s.r + 1 < s.rounds.length) { s.r++; beginRound(); } else { s.done = true; ctx.rerender(); }
}

export function extraClick(t) {
  if (t.dataset.sim) { openSim(t.dataset.sim); return true; }
  if (t.dataset.mindmap) {
    const url = hasChrome ? chrome.runtime.getURL('mindmap/mindmap.html') : '../mindmap/mindmap.html';
    if (hasChrome) chrome.tabs.create({ url }); else window.open(url, '_blank');
    return true;
  }
  if (t.dataset.xstart === 'p34') { startFlash(); return true; }
  if (t.dataset.xstart === 'tipq') { startTipQuiz(); return true; }
  if (t.dataset.xtip != null && s?.kind === 'tipq') { answerTip(Number(t.dataset.xtip)); return true; }
  if (t.dataset.xstart === 'para') { startPara('para'); return true; }
  if (t.dataset.xstart === 'anto') { startPara('anto'); return true; }
  if (t.dataset.xstart === 'write') { startWrite(); return true; }
  if (t.dataset.xwcheck && s?.kind === 'write') {
    s.text = (document.getElementById('wText')?.value || '').trim();
    const tgt = document.getElementById('wTarget');
    if (tgt) s.target = tgt.value.trim();
    if (!s.text) { ctx.toast('Viết một câu trước đã.'); return true; }
    if (s.prompts[s.i].needsTarget && !s.target) { ctx.toast('Ghi từ / quy tắc cần luyện.'); return true; }
    s.phase = 'check';
    s.checks = {};
    ctx.rerender();
    return true;
  }
  if (t.dataset.wck != null && s?.kind === 'write') { s.checks = { ...(s.checks || {}), [t.dataset.wck]: t.checked }; return true; }
  if (t.dataset.xwedit && s?.kind === 'write') { s.phase = 'write'; ctx.rerender(); return true; }
  if (t.dataset.xwgrade && s?.kind === 'write') {
    const pass = t.dataset.xwgrade === '1';
    if (pass && CHECKLIST.some((_, i) => !s.checks?.[i])) { ctx.toast('Chỉ chấm "Đạt" khi đủ cả 4 ý.'); return true; }
    gradeWrite(pass);
    return true;
  }
  if (t.dataset.xflash && s?.kind === 'p34' && s.phase === 'quiz') { answerFlash(t.dataset.xflash); return true; }
  if (t.dataset.xpl && (s?.kind === 'para' || s?.kind === 'anto')) { s.sel = t.dataset.xpl; ctx.rerender(); return true; }
  if (t.dataset.xpr && (s?.kind === 'para' || s?.kind === 'anto')) { pickRight(t.dataset.xpr); return true; }
  if (t.dataset.xnext) { nextStep(); return true; }
  if (t.dataset.xquit) { stopExtra(); s = null; ctx.rerender(); return true; }
  if (t.dataset.xaddpair) {
    const a = document.getElementById('myA')?.value.trim();
    const b = document.getElementById('myB')?.value.trim();
    if (!a || !b) { ctx.toast('Nhập cả hai vế.'); return true; }
    store.update('drill', (dr) => ({ ...dr, myPairs: [...(dr.myPairs || []), { id: 'my-' + Date.now().toString(36), a, b }] }));
    ctx.toast('Đã thêm cặp paraphrase.');
    return true;
  }
  if (t.dataset.xdelpair) {
    store.update('drill', (dr) => ({ ...dr, myPairs: (dr.myPairs || []).filter((p) => p.id !== t.dataset.xdelpair) }));
    return true;
  }
  return false;
}

export function extraKey(e) {
  if (!s || s.done) return false;
  if (s.kind === 'tipq' && s.phase === 'ask' && /^[1-3]$/.test(e.key)) { answerTip(Number(e.key) - 1); return true; }
  if (e.key === 'Enter' && ((s.kind === 'tipq' && s.phase === 'review') || (s.kind === 'p34' && s.phase === 'review') || ((s.kind === 'para' || s.kind === 'anto') && Object.keys(s.matched).length === s.left.length))) { nextStep(); return true; }
  if (s.kind === 'p34' && s.phase === 'quiz' && /^[1-4]$/.test(e.key)) { answerFlash(s.choices[s.j][Number(e.key) - 1]); return true; }
  return false;
}
