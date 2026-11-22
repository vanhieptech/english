// "Luyện" tab: Part 5 grammar drill and Part 2 trap drill.

import * as store from '../lib/store.js';
import { today, addDays } from '../lib/dates.js';
import { P5, P5_CATS } from '../data/p5.js';
import { realP5Wrong } from '../lib/p5type.js';
import { P2, P2_TRAPS, P2_TYPES } from '../data/p2.js';
import { pick, record, groupAccuracy, countToday, shuffle, P5_SECONDS, wrongToday } from '../lib/drill.js';
import { initExtra, extraActive, renderExtra, renderExtraLauncher, extraClick, extraKey, stopExtra, resumeExtra } from './drill-extra.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (r) => (r == null ? '–' : Math.round(r * 100) + '%');
const LETTERS = ['A', 'B', 'C', 'D'];

let ctx = null; // { getDb, el }
let session = null;
let timer = null;
const prefs = { p5cat: '', p5n: 10, accent: 'mix', showText: false };

export function initDrill(c) {
  ctx = c;
  initExtra(c);
}

export function drillActive() {
  return !!session && !session.done;
}

// ---------- launcher ----------
function renderLauncher(db) {
  const d = today();
  const log = db.drill?.log || [];
  const acc5 = groupAccuracy(log, 'p5', addDays(d, -6), d);
  const accAll5 = groupAccuracy(log, 'p5', '0000-01-01', d);
  const trap = groupAccuracy(log, 'p2trap', '0000-01-01', d);
  const due5 = P5.filter((q) => db.drill?.items?.[q.id]?.due <= d).length;
  const due2 = P2.filter((q) => db.drill?.items?.[q.id]?.due <= d).length;
  const wt5 = wrongToday(log, 'p5', d).length;
  const wt2 = wrongToday(log, 'p2', d).length;
  return `
    <h2>Cường độ cao</h2>
    <div class="card">
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn primary" data-drillsprint="1">Weakness sprint (8 P5 + 6 P2)</button>
        <button class="btn" data-drilltoday="1" ${wt5 + wt2 ? '' : 'disabled'}>Ôn lỗi hôm nay (${wt5 + wt2})</button>
      </div>
      <div class="small muted" style="margin-top:6px">Sprint lấy đúng dạng Part 5 và loại câu hỏi Part 2 bạn yếu nhất 14 ngày qua. "Ôn lỗi hôm nay" hỏi lại mọi câu luyện bạn làm sai trong ngày — nên làm trước khi ngủ.</div>
    </div>
    <h2>Luyện Part 5 – ngữ pháp theo dạng</h2>
    <div class="card">
      <div class="small muted">Hôm nay: <b>${countToday(log, 'p5', d)}</b> câu · đến hạn ôn lại: <b>${due5}</b> · <b>${p5Seconds(db)} giây/câu</b> (thang tốc độ 20 → 15 → 12: đúng ≥ 80% một lượt 8+ câu thì lên mức)</div>
      <div class="row" style="display:flex;gap:6px;margin:8px 0">
        <select id="p5cat" style="flex:2"><option value="">Tự chọn dạng yếu</option>${Object.entries(P5_CATS).map(([k, v]) => `<option value="${k}" ${prefs.p5cat === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>
        <select id="p5n" style="flex:1">${[10, 20, 30].map((n) => `<option ${prefs.p5n === n ? 'selected' : ''}>${n}</option>`).join('')}</select>
      </div>
      <button class="btn primary" data-drillstart="p5">Bắt đầu Part 5</button>
    </div>
    <h2>Luyện Part 2 – nhận diện bẫy</h2>
    <div class="card">
      <div class="small muted">Hôm nay: <b>${countToday(log, 'p2', d)}</b> câu · đến hạn ôn lại: <b>${due2}</b>. Máy đọc câu hỏi và 3 đáp án; chọn đáp án đúng rồi gọi tên bẫy của 2 đáp án sai.</div>
      <div class="row" style="display:flex;gap:6px;margin:8px 0;align-items:center">
        <select id="accent" style="flex:1">${[['mix', 'Giọng trộn Mỹ/Anh/Úc'], ['en-US', 'Giọng Mỹ'], ['en-GB', 'Giọng Anh'], ['en-AU', 'Giọng Úc']].map(([v, n]) => `<option value="${v}" ${prefs.accent === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
        <label class="small" style="display:flex;gap:4px;align-items:center"><input type="checkbox" id="showText" ${prefs.showText ? 'checked' : ''}> Hiện chữ</label>
      </div>
      <button class="btn primary" data-drillstart="p2">Bắt đầu Part 2 (10 câu)</button>
      ${voiceNote()}
    </div>
    <h2>Dạng Part 5 của bạn</h2>
    <div class="card"><table><tr><th>Dạng</th><th class="num">7 ngày</th><th class="num">Từ đầu</th></tr>${Object.entries(P5_CATS)
      .map(([k, v]) => `<tr><td>${esc(v)}</td><td class="num ${acc5[k]?.n >= 5 && acc5[k].rate < 0.6 ? 'rate-bad' : ''}">${acc5[k] ? pct(acc5[k].rate) + ` <span class="muted small">(${acc5[k].n})</span>` : '–'}</td><td class="num">${accAll5[k] ? pct(accAll5[k].rate) : '–'}</td></tr>`)
      .join('')}</table><div class="muted small">"Tự chọn dạng yếu" ưu tiên dạng có tỷ lệ đúng thấp; dạng chưa làm cũng được thử.</div></div>
    <h2>Nhận diện bẫy Part 2</h2>
    <div class="card small">${Object.entries(P2_TRAPS).map(([k, v]) => `<div><b>${k}</b> ${esc(v.name)}: ${trap[k] ? pct(trap[k].rate) + ` (${trap[k].n})` : '–'} <span class="muted">— ${esc(v.hint)}</span></div>`).join('')}</div>
    ${renderExtraLauncher(db)}
    <div class="muted small" style="margin-top:8px">Câu hỏi trong tab này do TOEIC Coach tự soạn (không lấy từ đề thật). Thấy câu sai? Bấm "Báo câu sai" để ẩn câu đó.</div>`;
}

function voiceNote() {
  if (typeof speechSynthesis === 'undefined') return '<div class="small notice card" style="margin-top:6px">Trình duyệt không hỗ trợ đọc to; hãy bật "Hiện chữ".</div>';
  return '';
}

// ---------- session ----------
function bankFor(kind, db) {
  const hidden = new Set(db.drill?.hidden || []);
  if (kind === 'p5') return P5.filter((q) => !hidden.has(q.id)).map((q) => ({ ...q, group: q.cat }));
  return P2.filter((q) => !hidden.has(q.id)).map((q) => ({ ...q, group: q.type }));
}

// P5 speed ladder: 20 s → 15 s → 12 s per question as you keep scoring ≥ 80%.
export const P5_LADDER = [20, 15, 12];
function p5Seconds(db) {
  return P5_LADDER[Math.max(0, Math.min(P5_LADDER.length - 1, db.drill?.p5Level || 0))];
}

// Weakest group with at least 3 answers in 14 days (or null).
function weakestGroup(log, kind, d) {
  const acc = groupAccuracy(log, kind, addDays(d, -13), d);
  const list = Object.entries(acc).filter(([, v]) => v.n >= 3).sort((a, b) => a[1].rate - b[1].rate);
  return list.length ? list[0][0] : null;
}

// Extra weight for Part 5 types you got wrong in real Parroto tests in the last 21 days.
function realP5Boost(db, d) {
  const out = {};
  for (const [c, n] of Object.entries(realP5Wrong(db, d))) out[c] = Math.min(2, n * 0.3);
  return out;
}

// opts: { n, focus, ids (explicit items), chain: [steps], label }
function start(kind, opts = {}) {
  const db = ctx.getDb();
  const d = today();
  const log = db.drill?.log || [];
  if (!opts.fromChain && !opts.ids) {
    if (kind === 'p5') {
      prefs.p5cat = document.getElementById('p5cat')?.value || '';
      prefs.p5n = Number(document.getElementById('p5n')?.value || 10);
    } else {
      prefs.accent = document.getElementById('accent')?.value || prefs.accent || 'mix';
      prefs.showText = !!document.getElementById('showText')?.checked;
    }
  }
  const accuracy = groupAccuracy(log, kind, addDays(d, -13), d);
  const bank = bankFor(kind, db);
  let items;
  if (opts.ids) {
    const want = new Set(opts.ids);
    items = bank.filter((q) => want.has(q.id));
  } else {
    const n = opts.n || (kind === 'p5' ? prefs.p5n : 10);
    const focus = opts.focus !== undefined ? opts.focus || undefined : kind === 'p5' ? prefs.p5cat || undefined : undefined;
    items = pick(bank, db.drill, d, n, { focus, accuracy, boost: kind === 'p5' ? realP5Boost(db, d) : undefined });
  }
  if (!items.length) { ctx.toast('Không có câu nào cho phần này.'); return; }
  session = {
    kind,
    src: opts.src || '',
    label: opts.label || '',
    chain: opts.chain || [],
    secs: kind === 'p5' ? p5Seconds(db) : null,
    queue: items.map((q) => (kind === 'p5' ? { ...q, shown: shuffle(q.o.map((t, i) => ({ t, ok: i === q.a }))) } : { ...q, shown: shuffle(q.options) })),
    i: 0,
    results: [],
    phase: 'ask',
  };
  beginItem();
}

// Started from outside the drill tab (a button on Parroto's result page).
export function startExternal(kind, { focus = '', n = 5 } = {}) {
  const name = kind === 'p5' && focus ? P5_CATS[focus] : '';
  start(kind, { n, focus: focus || '', fromChain: true, src: 'parroto', label: name ? `Từ câu sai trên Parroto · ${name}` : 'Từ câu sai trên Parroto' });
}

// Weakness sprint: weakest Part 5 type + weakest Part 2 question type, back to back.
function startSprint() {
  const db = ctx.getDb();
  const d = today();
  const log = db.drill?.log || [];
  const p5cat = weakestGroup(log, 'p5', d);
  const p2type = weakestGroup(log, 'p2', d);
  start('p5', { n: 8, focus: p5cat, fromChain: true, src: 'sprint', label: `Sprint 1/2 · ${p5cat ? 'dạng yếu nhất: ' + P5_CATS[p5cat] : 'dạng ngẫu nhiên có trọng số'}`, chain: [{ kind: 'p2', n: 6, focus: p2type, src: 'sprint', label: `Sprint 2/2 · Part 2${p2type ? ' – ' + (P2_TYPES[p2type] || p2type) : ''}` }] });
}

// Today's mistakes: every Part 5 / Part 2 item answered wrong today, again.
function startTodayReview() {
  const db = ctx.getDb();
  const d = today();
  const log = db.drill?.log || [];
  const p5 = wrongToday(log, 'p5', d);
  const p2 = wrongToday(log, 'p2', d);
  if (!p5.length && !p2.length) { ctx.toast('Hôm nay chưa có câu luyện nào sai.'); return; }
  const chain = p2.length ? [{ kind: 'p2', ids: p2, src: 'today', label: 'Ôn lỗi hôm nay · Part 2' }] : [];
  if (p5.length) start('p5', { ids: p5, chain, src: 'today', label: 'Ôn lỗi hôm nay · Part 5' });
  else start('p2', { ids: p2, src: 'today', label: 'Ôn lỗi hôm nay · Part 2' });
}

function runNextInChain() {
  const [step, ...rest] = session.chain;
  start(step.kind, { ...step, fromChain: true, chain: rest });
}

function cur() {
  return session.queue[session.i];
}

function beginItem() {
  stopTimer();
  session.phase = 'ask';
  session.choice = null;
  session.trapAnswers = {};
  session.startedAt = Date.now();
  ctx.rerender();
  if (session.kind === 'p5') startTimer();
  else speakItem();
}

function startTimer() {
  timer = setInterval(() => {
    const limit = session.secs || P5_SECONDS;
    const left = limit - (Date.now() - session.startedAt) / 1000;
    const bar = document.getElementById('tbar');
    if (bar) bar.style.width = Math.max(0, (left / limit) * 100) + '%';
    const lbl = document.getElementById('tleft');
    if (lbl) lbl.textContent = Math.max(0, Math.ceil(left)) + 's';
    if (left <= 0) answer(-1);
  }, 200);
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

async function answer(idx) {
  if (!session || session.phase !== 'ask') return;
  stopTimer();
  const q = cur();
  const d = today();
  const secs = Math.round((Date.now() - session.startedAt) / 100) / 10;
  session.choice = idx;
  const correct = idx >= 0 && (session.kind === 'p5' ? q.shown[idx].ok : q.shown[idx].correct);
  session.results.push({ id: q.id, group: q.group, correct, secs, timeout: idx < 0 });
  session.phase = session.kind === 'p2' ? 'traps' : 'review';
  await store.update('drill', (dr) => record(dr, { kind: session.kind, id: q.id, cat: q.group, correct, secs, timeout: idx < 0, date: d, src: session.src || undefined }));
  ctx.rerender();
}

async function answerTrap(optIdx, code) {
  const q = cur();
  if (session.trapAnswers[optIdx]) return;
  const real = q.shown[optIdx].trap;
  session.trapAnswers[optIdx] = code;
  await store.update('drill', (dr) => ({ ...dr, log: [...(dr.log || []), { kind: 'p2trap', id: q.id + ':' + optIdx, cat: real, correct: code === real, date: today() }] }));
  const wrongIdx = q.shown.map((o, i) => (o.correct ? null : i)).filter((x) => x != null);
  if (wrongIdx.every((i) => session.trapAnswers[i])) session.phase = 'review';
  ctx.rerender();
}

function next() {
  if (session.i + 1 >= session.queue.length) {
    session.done = true;
    stopTimer();
    if (session.kind === 'p5' && session.results.length >= 8) updateLadder(session);
    ctx.rerender();
    return;
  }
  session.i++;
  beginItem();
}

// Move the Part 5 time limit up or down the ladder after a session of 8+ questions.
async function updateLadder(sess) {
  const ok = sess.results.filter((r) => r.correct).length / sess.results.length;
  let change = 0;
  if (ok >= 0.8) change = 1;
  else if (ok < 0.6) change = -1;
  if (!change) return;
  await store.update('drill', (dr) => {
    const level = Math.max(0, Math.min(P5_LADDER.length - 1, (dr.p5Level || 0) + change));
    sess.ladderMsg = level !== (dr.p5Level || 0) ? (change > 0 ? `Lên mức nhanh hơn: ${P5_LADDER[level]} giây/câu từ lần sau.` : `Lùi về ${P5_LADDER[level]} giây/câu để chắc hơn.`) : '';
    return { ...dr, p5Level: level };
  });
  ctx.rerender();
}

async function hideItem(id) {
  await store.update('drill', (dr) => ({ ...dr, hidden: [...new Set([...(dr.hidden || []), id])] }));
  ctx.toast('Đã ẩn câu này khỏi bài luyện.');
}

// ---------- speech ----------
// macOS ships novelty / robotic voices (Bubbles, Bells, Bad News…) that must never read a test item.
const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|kathy|fred|grandma|grandpa|rocko|eloquence/i;
const PREFERRED = {
  'en-US': ['Samantha', 'Allison', 'Ava', 'Susan', 'Tom', 'Alex', 'Nicky', 'Aaron', 'Evan', 'Zoe', 'Google US English'],
  'en-GB': ['Daniel', 'Kate', 'Serena', 'Oliver', 'Arthur', 'Martha', 'Google UK English Female', 'Google UK English Male'],
  'en-AU': ['Karen', 'Lee', 'Catherine', 'Gordon'],
};

export function goodVoices(voices, lang) {
  const all = voices.filter((v) => v.lang && v.lang.startsWith('en') && !NOVELTY.test(v.name));
  const exact = all.filter((v) => v.lang.replace('_', '-') === lang);
  const pool = exact.length ? exact : all.filter((v) => v.lang.replace('_', '-') === 'en-US');
  const rank = (v) => {
    const i = (PREFERRED[lang] || []).findIndex((n) => v.name.startsWith(n));
    return i < 0 ? 99 : i;
  };
  return [...pool].sort((a, b) => rank(a) - rank(b));
}

function voicesFor(lang) {
  return goodVoices(speechSynthesis.getVoices(), lang).slice(0, 3);
}

function pickVoice(index) {
  const langs = prefs.accent === 'mix' ? ['en-US', 'en-GB', 'en-AU'] : [prefs.accent];
  const lang = langs[index % langs.length];
  const vs = voicesFor(lang);
  return vs.length ? vs[index % vs.length] : null;
}

function speakItem() {
  if (typeof speechSynthesis === 'undefined' || !session || session.kind !== 'p2') return;
  speechSynthesis.cancel();
  const q = cur();
  const qVoice = pickVoice(session.i);
  const aVoice = pickVoice(session.i + 1);
  const parts = [{ t: q.q, v: qVoice }, ...q.shown.map((o, i) => ({ t: `${LETTERS[i]}. ${o.text}`, v: aVoice }))];
  for (const p of parts) {
    const u = new SpeechSynthesisUtterance(p.t);
    if (p.v) { u.voice = p.v; u.lang = p.v.lang; } else u.lang = 'en-US';
    u.rate = 0.95;
    speechSynthesis.speak(u);
  }
}

// ---------- views ----------
function renderP5(q) {
  const s = session;
  const answered = s.phase !== 'ask';
  const sentence = esc(q.s).replace('___', '<span style="display:inline-block;min-width:60px;border-bottom:2px solid var(--accent)">&nbsp;</span>');
  const res = s.results[s.results.length - 1];
  return `
    <div class="small muted">Câu ${s.i + 1}/${s.queue.length} · ${esc(P5_CATS[q.cat])}</div>
    ${!answered ? `<div class="progressbar"><div id="tbar" style="width:100%;background:var(--accent)"></div></div><div class="small muted" id="tleft">${s.secs || P5_SECONDS}s</div>` : ''}
    <div class="card" style="font-size:15px;margin-top:8px">${sentence}</div>
    ${q.shown.map((o, i) => {
      let cls = 'btn';
      if (answered && o.ok) cls += ' ok';
      else if (answered && i === s.choice) cls += ' bad';
      return `<button class="${cls}" data-drillans="${i}" style="display:block;width:100%;text-align:left;margin-bottom:6px;padding:8px 10px" ${answered ? 'disabled' : ''}>(${LETTERS[i]}) ${esc(o.t)}</button>`;
    }).join('')}
    ${answered ? `<div class="card ${res.correct ? '' : 'notice'}">
        <b>${res.timeout ? 'Hết giờ.' : res.correct ? 'Đúng' : 'Sai'}</b> ${res.correct ? `(${res.secs}s)` : `— đáp án: ${esc(q.o[q.a])}`}
        <div class="small" style="margin-top:4px">${esc(q.why)}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center"><button class="btn primary" data-drillnext="1">Câu tiếp (Enter)</button><button class="link" data-drillhide="${q.id}">Báo câu sai</button></div>` : '<div class="muted small">Phím 1–4 hoặc A–D để chọn.</div>'}`;
}

function renderP2(q) {
  const s = session;
  const answered = s.phase !== 'ask';
  const reveal = answered || prefs.showText;
  const res = s.results[s.results.length - 1];
  let html = `
    <div class="small muted">Câu ${s.i + 1}/${s.queue.length} · ${esc(P2_TYPES[q.type] || q.type)}</div>
    <div class="card" style="margin-top:8px">
      <div style="display:flex;gap:6px;align-items:center"><button class="btn" data-drillspeak="1">▶ Nghe lại</button><span class="muted small">${reveal ? '' : 'Đang ẩn chữ – nghe rồi chọn'}</span></div>
      ${reveal ? `<div style="margin-top:6px;font-weight:600">${esc(q.q)}</div>` : ''}
    </div>`;
  html += q.shown.map((o, i) => {
    let cls = 'btn';
    if (answered && o.correct) cls += ' ok';
    else if (answered && i === s.choice) cls += ' bad';
    const trapPart = answered && !o.correct ? renderTrapPicker(q, i) : '';
    return `<div style="margin-bottom:6px"><button class="${cls}" data-drillans="${i}" style="display:block;width:100%;text-align:left;padding:8px 10px" ${answered ? 'disabled' : ''}>(${LETTERS[i]}) ${reveal ? esc(o.text) : ''}</button>${trapPart}</div>`;
  }).join('');
  if (s.phase === 'traps') {
    html += `<div class="card small" style="padding:6px 10px">Gọi tên bẫy của từng đáp án sai ở trên:<br>${Object.entries(P2_TRAPS).map(([k, v]) => `<b>${k}</b> ${esc(v.name)}`).join(' · ')}</div>`;
  }
  if (s.phase === 'review') {
    html += `<div class="card ${res.correct ? '' : 'notice'}"><b>${res.correct ? 'Đúng' : 'Sai'}</b> — câu trả lời đúng: "${esc(q.shown.find((o) => o.correct).text)}"</div>
      <div style="display:flex;gap:8px;align-items:center"><button class="btn primary" data-drillnext="1">Câu tiếp (Enter)</button><button class="link" data-drillhide="${q.id}">Báo câu sai</button></div>`;
  }
  if (!answered) html += '<div class="muted small">Phím 1–3 hoặc A–C để chọn.</div>';
  return html;
}

function renderTrapPicker(q, i) {
  const picked = session.trapAnswers[i];
  const real = q.shown[i].trap;
  if (picked) {
    const ok = picked === real;
    return `<div class="small" style="margin:4px 0 0 4px">${ok ? '✓' : '✗'} Bẫy: <b>${real}</b> ${esc(P2_TRAPS[real].name)}${ok ? '' : ` (bạn chọn ${picked})`} — <span class="muted">${esc(P2_TRAPS[real].hint)}</span></div>`;
  }
  return `<div class="codes-row" style="grid-template-columns:repeat(6,1fr);margin-top:4px">${Object.entries(P2_TRAPS).map(([k, v]) => `<button type="button" data-trapopt="${i}" data-trapcode="${k}" title="${esc(v.name)}">${k}</button>`).join('')}</div>`;
}

function renderSummary() {
  const s = session;
  const ok = s.results.filter((r) => r.correct).length;
  const byGroup = {};
  for (const r of s.results) {
    byGroup[r.group] = byGroup[r.group] || { n: 0, ok: 0 };
    byGroup[r.group].n++;
    if (r.correct) byGroup[r.group].ok++;
  }
  const names = s.kind === 'p5' ? P5_CATS : P2_TYPES;
  const avg = s.kind === 'p5' ? Math.round(s.results.reduce((a, r) => a + r.secs, 0) / Math.max(1, s.results.length)) : null;
  return `<h2>Xong: ${ok}/${s.results.length} câu đúng</h2>
    <div class="card small">${avg != null ? `<div>Trung bình ${avg} giây/câu (mục tiêu 15–20 giây).</div>` : ''}
      ${Object.entries(byGroup).map(([g, v]) => `<div>${esc(names[g] || g)}: ${v.ok}/${v.n}</div>`).join('')}
      <div class="muted" style="margin-top:4px">Câu sai sẽ quay lại vào ngày mai; câu đúng quay lại sau 3, 7, 16 ngày.</div></div>
    ${s.ladderMsg ? `<div class="card small notice">${esc(s.ladderMsg)}</div>` : ''}
    <div style="display:flex;gap:6px">${s.chain && s.chain.length ? `<button class="btn primary" data-chainnext="1">Tiếp: ${esc(s.chain[0].label || s.chain[0].kind)}</button>` : `<button class="btn primary" data-drillstart="${s.kind}">Làm thêm</button>`}<button class="btn" data-drillquit="1">Về tab Luyện</button></div>`;
}

export function renderDrill(db) {
  const el = ctx.el();
  if (!session && extraActive()) {
    renderExtra(el);
    return;
  }
  if (!session) {
    el.innerHTML = renderLauncher(db);
    return;
  }
  if (session.done) {
    el.innerHTML = renderSummary();
    return;
  }
  const q = cur();
  el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b>${session.label ? esc(session.label) : session.kind === 'p5' ? 'Part 5' : 'Part 2'}</b><button class="link" data-drillquit="1">Dừng</button></div>` + (session.kind === 'p5' ? renderP5(q) : renderP2(q));
}

// ---------- events (called from panel.js) ----------
export function handleClick(t) {
  if (!session && extraClick(t)) return true;
  if (t.dataset.drillsprint) { startSprint(); return true; }
  if (t.dataset.drilltoday) { startTodayReview(); return true; }
  if (t.dataset.chainnext && session) { runNextInChain(); return true; }
  if (t.dataset.drillstart) { start(t.dataset.drillstart); return true; }
  if (t.dataset.drillans != null && session && session.phase === 'ask') { answer(Number(t.dataset.drillans)); return true; }
  if (t.dataset.trapopt != null) { answerTrap(Number(t.dataset.trapopt), t.dataset.trapcode); return true; }
  if (t.dataset.drillnext) { next(); return true; }
  if (t.dataset.drillspeak) { speakItem(); return true; }
  if (t.dataset.drillhide) { hideItem(t.dataset.drillhide); next(); return true; }
  if (t.dataset.drillquit) { stopTimer(); if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); session = null; ctx.rerender(); return true; }
  return false;
}

export function handleKey(e) {
  if (!session) return extraKey(e);
  if (session.done) return false;
  const k = e.key.toUpperCase();
  const max = session.kind === 'p5' ? 4 : 3;
  let idx = -1;
  if (/^[1-4]$/.test(k)) idx = Number(k) - 1;
  else if (LETTERS.slice(0, max).includes(k)) idx = LETTERS.indexOf(k);
  if (session.phase === 'ask' && idx >= 0 && idx < max) { answer(idx); return true; }
  if (k === 'ENTER' && session.phase === 'review') { next(); return true; }
  return false;
}

export function resumeDrill() {
  resumeExtra();
  if (session && !session.done && session.phase === 'ask' && session.kind === 'p5' && !timer) {
    session.startedAt = Date.now();
    startTimer();
  }
}

export function stopDrillMedia() {
  stopTimer();
  stopExtra();
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
}

if (typeof speechSynthesis !== 'undefined') speechSynthesis.onvoiceschanged = () => {};
