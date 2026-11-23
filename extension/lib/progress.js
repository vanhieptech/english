// Proof of progress: skill indicators this week vs last week, fixed checkpoint tests,
// and when to add an extra half test. All computed from data already stored.

import { addDays } from './dates.js';
import { partAccuracy, dueErrors } from './rules.js';
import { pendingErrors } from './autoresult.js';

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const inRange = (d, w) => d && d >= w.from && d <= w.to;

// Checkpoint = a Parroto session with exactly Part 2 + Part 5 (20 minutes, same format every time).
export const CHECKPOINT_PARTS = ['P2', 'P5'];
export function isCheckpoint(r) {
  const keys = Object.keys(r.parts || {}).filter((p) => r.parts[p] && r.parts[p].total > 0);
  return keys.length === 2 && CHECKPOINT_PARTS.every((p) => keys.includes(p));
}
export function checkpoints(db) {
  return (db.results || []).filter(isCheckpoint).sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((r) => ({ date: r.date, P2: r.parts.P2.correct / r.parts.P2.total, P5: r.parts.P5.correct / r.parts.P5.total }));
}

function sectionRate(acc, parts) {
  let c = 0; let t = 0;
  for (const p of parts) { c += acc[p].correct; t += acc[p].total; }
  return t >= 10 ? c / t : null;
}

function stats(db, w) {
  const acc = partAccuracy(db.results || [], w.from, w.to);
  const log = (db.drill?.log || []).filter((e) => inRange(e.date, w));
  const p5secs = avg(log.filter((e) => e.kind === 'p5' && e.secs != null && !e.timeout).map((e) => e.secs));
  let redoN = 0; let redoOk = 0;
  for (const e of db.errors || []) for (const h of e.redo?.history || []) if (inRange(h.date, w)) { redoN++; if (h.passed) redoOk++; }
  const p7 = [];
  let sets = 0; let replays = 0;
  for (const p of Object.values(db.pace || {})) {
    if (!inRange(p.date, w)) continue;
    for (const [q, s] of Object.entries(p.qSecs || {})) if (Number(q) >= 147 && s > 0) p7.push(s);
    for (const s of Object.values(p.listen || {})) { sets++; if (s.plays > 1) replays++; }
  }
  const dict = Object.values(db.lessons || {}).filter((l) => inRange(l.updated?.dictation, w) && l.dictation != null).map((l) => l.dictation);
  const snapDays = Object.keys(db.vocab?.snaps || {}).filter((d) => d <= w.to).sort();
  const lastSnap = snapDays.length ? db.vocab.snaps[snapDays[snapDays.length - 1]].last : null;
  return {
    L: sectionRate(acc, ['P1', 'P2', 'P3', 'P4']),
    R: sectionRate(acc, ['P5', 'P6', 'P7']),
    p5secs: log.filter((e) => e.kind === 'p5').length >= 10 ? p5secs : null,
    redo: redoN >= 3 ? redoOk / redoN : null,
    p7secs: p7.length >= 10 ? avg(p7) : null,
    dict: dict.length ? avg(dict) : null,
    mastered: lastSnap && snapDays[snapDays.length - 1] >= w.from ? lastSnap.mastered ?? null : null,
    replay: sets >= 3 ? replays / sets : null,
  };
}

// Skill indicators for the 7 days ending endISO vs the 7 days before, with a one-line verdict.
export function skillWeek(db, endISO) {
  const cur = stats(db, { from: addDays(endISO, -6), to: endISO });
  const prev = stats(db, { from: addDays(endISO, -13), to: addDays(endISO, -7) });
  const pct = (v) => Math.round(v * 100) + '%';
  const defs = [
    ['L', 'Listening đúng (đề/Part Parroto)', 'up', pct, 0.02],
    ['R', 'Reading đúng (đề/Part Parroto)', 'up', pct, 0.02],
    ['redo', 'Làm lại câu sai đúng', 'up', pct, 0.05],
    ['p5secs', 'Giây/câu P5 khi luyện', 'down', (v) => v.toFixed(1) + 's', 0.5],
    ['p7secs', 'Giây/câu P7 trong đề', 'down', (v) => Math.round(v) + 's', 3],
    ['dict', 'Điểm dictation TB', 'up', (v) => Math.round(v), 2],
    ['mastered', 'Từ Mastered (Parroto)', 'up', (v) => v, 1],
    ['replay', 'Bộ P3/4 phải nghe lại', 'down', pct, 0.05],
  ];
  const rows = defs.map(([k, label, better, fmt, eps]) => {
    const a = cur[k]; const b = prev[k];
    let trend = null;
    if (a != null && b != null) trend = Math.abs(a - b) < eps ? 'same' : (better === 'up' ? a > b : a < b) ? 'better' : 'worse';
    return { key: k, label, cur: a, prev: b, trend, curText: a == null ? '–' : fmt(a), prevText: b == null ? '–' : fmt(b) };
  });
  const compared = rows.filter((r) => r.trend);
  const better = compared.filter((r) => r.trend === 'better');
  const worse = compared.filter((r) => r.trend === 'worse');
  let verdict;
  if (compared.length < 2) verdict = 'Chưa đủ dữ liệu 2 tuần để so. Cứ làm đúng lịch; sau 7 ngày thẻ này sẽ so được.';
  else if (better.length > worse.length) verdict = `Tuần này khá hơn ở ${better.length}/${compared.length} chỉ số (${better.map((r) => r.label.toLowerCase()).join(', ')}). Kỹ năng thường lên trước, điểm đề full lên sau 1–2 tuần.`;
  else if (worse.length > better.length) verdict = `Tuần này kém hơn ở ${worse.length}/${compared.length} chỉ số (${worse.map((r) => r.label.toLowerCase()).join(', ')}). Xem lại: có làm đủ phần làm lại câu sai và chữa đề không?`;
  else verdict = `Ngang tuần trước (${better.length} lên, ${worse.length} xuống). Giữ nhịp; nếu 2 tuần liền phẳng thì đổi cách luyện ở chỉ số đi xuống.`;
  return { rows, verdict, better: better.length, worse: worse.length, compared: compared.length };
}

// Suggest one extra half test only when you keep up with reviewing:
// at least 2 full tests done, the latest one fully coded, and fewer than 10 redo items due.
export function extraHalfSuggestion(db, dateISO) {
  const fulls = (db.results || []).filter((r) => r.kind === 'full' && r.date <= dateISO).sort((a, b) => (a.date < b.date ? -1 : 1));
  if (fulls.length < 2) return null;
  const last = fulls[fulls.length - 1];
  const uncoded = last.session ? pendingErrors(db).filter((p) => p.session === last.session).length : 0;
  const due = dueErrors(db.errors || [], dateISO).length;
  if (uncoded > 0 || due >= 10) return null;
  return { due, last: last.date, text: `Bạn đang theo kịp phần chữa (đề ${last.date.slice(8)}/${last.date.slice(5, 7)} đã gắn mã hết, ${due} câu làm lại đến hạn). Có thể thêm 1 nửa đề Reading (P5–P7, 75 phút, Test Mode) vào một ngày không có đề trong tuần này.` };
}
