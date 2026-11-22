// Statistics and the plan-adjustment rules from the research report.
// The thresholds are heuristics (labelled [Ước lượng] in the report).

import { addDays, lastNDays } from './dates.js';
import { PARTS, LISTENING_PARTS, READING_PARTS, CODES, REDO_STEPS } from './constants.js';
import { overdueOn, newWordsOn } from './vocab.js';

// Per-part accuracy from part results and from per-part counts in full/half tests.
export function partAccuracy(results, fromISO, toISO) {
  const acc = {};
  for (const p of PARTS) acc[p] = { correct: 0, total: 0 };
  for (const r of results) {
    if (r.date < fromISO || r.date > toISO) continue;
    if (r.kind === 'part' && r.part && r.total > 0) {
      acc[r.part].correct += r.correct;
      acc[r.part].total += r.total;
    }
    if (r.parts) {
      for (const [p, v] of Object.entries(r.parts)) {
        if (v && v.total > 0 && acc[p]) {
          acc[p].correct += v.correct;
          acc[p].total += v.total;
        }
      }
    }
  }
  for (const p of PARTS) {
    const a = acc[p];
    a.rate = a.total ? a.correct / a.total : null;
  }
  return acc;
}

export function codeCounts(errors, fromISO, toISO, parts = null) {
  const c = {};
  for (const k of Object.keys(CODES)) c[k] = 0;
  for (const e of errors) {
    if (e.date < fromISO || e.date > toISO) continue;
    if (parts && !parts.includes(e.part)) continue;
    if (e.code && c[e.code] !== undefined) c[e.code]++;
  }
  return c;
}

export function topCodes(counts, n = 3) {
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

// Weakest part within a section, using the last 7 days.
// Needs at least 10 answered questions to count a part; falls back to error counts, then a default.
export function weakestPart(db, dateISO, section) {
  const pool = section === 'L' ? LISTENING_PARTS : READING_PARTS;
  const acc = partAccuracy(db.results, addDays(dateISO, -7), dateISO);
  const scored = pool.filter((p) => acc[p].total >= 10).sort((a, b) => acc[a].rate - acc[b].rate);
  if (scored.length) return { part: scored[0], reason: `tỷ lệ đúng 7 ngày thấp nhất (${Math.round(acc[scored[0]].rate * 100)}%)` };
  const counts = {};
  for (const p of pool) counts[p] = 0;
  for (const e of db.errors) if (e.date >= addDays(dateISO, -7) && counts[e.part] !== undefined) counts[e.part]++;
  const byErr = pool.filter((p) => counts[p] > 0).sort((a, b) => counts[b] - counts[a]);
  if (byErr.length) return { part: byErr[0], reason: `nhiều lỗi nhất 7 ngày qua (${counts[byErr[0]]} lỗi)` };
  return { part: section === 'L' ? 'P3' : 'P7', reason: 'chưa đủ dữ liệu, dùng mặc định' };
}

// Redo queue: errors due on or before the date.
export function dueErrors(errors, dateISO) {
  return errors.filter((e) => e.redo && !e.redo.done && e.redo.due <= dateISO);
}

export function scheduleNew(dateISO) {
  return { stage: 0, due: addDays(dateISO, REDO_STEPS[0]), done: false, history: [] };
}

export function applyRedo(redo, dateISO, passed) {
  const history = [...(redo.history || []), { date: dateISO, passed, stage: redo.stage }];
  if (!passed) return { stage: 0, due: addDays(dateISO, REDO_STEPS[0]), done: false, history };
  const stage = redo.stage + 1;
  if (stage >= REDO_STEPS.length) return { stage, due: redo.due, done: true, history };
  return { stage, due: addDays(dateISO, REDO_STEPS[stage]), done: false, history };
}

// Share of errors that were redone correctly at the final (+7) step.
export function redoSuccess(errors) {
  let tries = 0;
  let ok = 0;
  const finalStage = REDO_STEPS.length - 1;
  for (const e of errors) {
    for (const x of e.redo?.history || []) {
      if (x.stage !== finalStage) continue;
      tries++;
      if (x.passed) ok++;
    }
  }
  return tries ? ok / tries : null;
}

// Adjustment rules. Returns a list of {id, text, reason, effect}.
// effect keys are read by the plan builder.
export function adjustments(db, dateISO) {
  const from = addDays(dateISO, -7);
  const to = addDays(dateISO, -1);
  const out = [];

  const acc = partAccuracy(db.results, from, to);
  for (const p of PARTS) {
    const a = acc[p];
    if (a.total >= 20 && a.rate < 0.6) {
      out.push({
        id: 'weak-' + p,
        text: `Thêm 20 phút luyện ${p}`,
        reason: `${p} đúng ${Math.round(a.rate * 100)}% trong 7 ngày (dưới 60%)`,
        effect: { extraPart: p },
      });
    }
  }

  const counts = codeCounts(db.errors, from, to);
  const top = topCodes(counts, 1)[0];
  if (top && top[1] >= 3) {
    if (top[0] === 'A') out.push({ id: 'code-A', text: 'Dictation 3 bài thay vì 2', reason: `Lỗi nghe sót âm nhiều nhất tuần (${top[1]})`, effect: { dictation: 3 } });
    if (top[0] === 'V') out.push({ id: 'code-V', text: 'Thêm 1 ván Word Rain', reason: `Lỗi từ vựng nhiều nhất tuần (${top[1]})`, effect: { extraGame: true } });
    if (top[0] === 'D') out.push({ id: 'code-D', text: 'Thêm 1 bộ P2 Practice Mode', reason: `Lỗi dính bẫy nhiều nhất tuần (${top[1]})`, effect: { extraPart: 'P2' } });
    if (top[0] === 'G') out.push({ id: 'code-G', text: 'Thêm 1 bộ P5 Practice Mode', reason: `Lỗi ngữ pháp nhiều nhất tuần (${top[1]})`, effect: { extraPart: 'P5' } });
  }

  const readingT = codeCounts(db.errors, from, to, READING_PARTS).T;
  if (readingT >= 3) {
    out.push({ id: 'time-R', text: 'P5 bấm giờ 9 phút cho 30 câu', reason: `${readingT} lỗi hết giờ ở Reading trong 7 ngày`, effect: { p5Minutes: 9 } });
  }

  // Overdue cards: typed value, else Parroto's Due count, within 2 days.
  for (const d of [dateISO, addDays(dateISO, -1), addDays(dateISO, -2)]) {
    const od = overdueOn(db, d);
    if (od != null && od > 100) {
      out.push({ id: 'overdue', text: 'Tạm dừng từ mới hôm nay', reason: `${od} thẻ quá hạn (trên 100) ngày ${d}`, effect: { pauseNew: true } });
      break;
    }
  }
  return out;
}

export function weekSummary(db, endISO) {
  const days = lastNDays(endISO, 7);
  const from = days[0];
  const acc = partAccuracy(db.results, from, endISO);
  const counts = codeCounts(db.errors, from, endISO);
  let minutes = 0;
  for (const d of days) {
    const t = db.time[d] || {};
    for (const v of Object.values(t)) minutes += v / 60;
  }
  const mocks = db.results.filter((r) => r.kind === 'full' && r.date >= from && r.date <= endISO);
  return { from, to: endISO, acc, counts, top: topCodes(counts, 3), minutes: Math.round(minutes), mocks };
}

// Score noise rule from the report: under ~40 points apart is not a real change.
export function mockTrend(results) {
  const mocks = results.filter((r) => r.kind === 'full' && r.L != null && r.R != null).sort((a, b) => (a.date < b.date ? -1 : 1));
  return mocks.map((m, i) => {
    const total = m.L + m.R;
    const prev = i ? mocks[i - 1].L + mocks[i - 1].R : null;
    const delta = prev == null ? null : total - prev;
    const noise = delta != null && Math.abs(delta) < 40;
    return { ...m, total, delta, noise };
  });
}

// This week vs last week (7-day windows ending on endISO).
export function weekCompare(db, endISO) {
  const cur = { from: addDays(endISO, -6), to: endISO };
  const prev = { from: addDays(endISO, -13), to: addDays(endISO, -7) };
  const stat = ({ from, to }) => {
    let minutes = 0;
    for (const d of lastNDays(to, 7)) for (const v of Object.values(db.time[d] || {})) minutes += v / 60;
    const acc = partAccuracy(db.results, from, to);
    let c = 0;
    let t = 0;
    for (const p of PARTS) { c += acc[p].correct; t += acc[p].total; }
    const errors = db.errors.filter((e) => e.date >= from && e.date <= to).length;
    const drill = (db.drill?.log || []).filter((e) => e.date >= from && e.date <= to && ['p5', 'p2', 'p6', 'p7', 'p34', 'para'].includes(e.kind));
    const drillOk = drill.filter((e) => e.correct).length;
    const mocks = db.results.filter((r) => r.kind === 'full' && r.date >= from && r.date <= to && r.L != null);
    const best = mocks.length ? Math.max(...mocks.map((m) => m.L + m.R)) : null;
    const newWords = lastNDays(to, 7).reduce((n, d) => n + newWordsOn(db, d), 0);
    return { minutes: Math.round(minutes), partRate: t ? c / t : null, partN: t, errors, drillN: drill.length, drillRate: drill.length ? drillOk / drill.length : null, best, newWords };
  };
  return { cur: stat(cur), prev: stat(prev), range: cur };
}
