// Detailed metrics in four groups: accuracy, speed & stamina, memory & error fixing, forecast & readiness.
// Everything is computed from data already stored; nothing is sent anywhere.

import { addDays, diffDays } from './dates.js';
import { PARTS, LISTENING_PARTS, READING_PARTS, PART_SIZE, PART_RANGES, CODES, REDO_STEPS } from './constants.js';
import { partAccuracy } from './rules.js';
import { groupAccuracy } from './drill.js';

const rate = (ok, n) => (n ? ok / n : null);

// ---------- 1. Accuracy detail ----------
export function accuracyDetail(db, dateISO) {
  const from14 = addDays(dateISO, -13);
  const log = db.drill?.log || [];
  const readingLog = log.filter((e) => e.kind === 'p6' || e.kind === 'p7').map((e) => ({ ...e, kind: 'r' }));
  // Error codes per week, last 4 weeks (oldest first).
  const weeks = [3, 2, 1, 0].map((w) => {
    const to = addDays(dateISO, -7 * w);
    const from = addDays(to, -6);
    const c = {};
    for (const k of Object.keys(CODES)) c[k] = 0;
    for (const e of db.errors) if (e.date >= from && e.date <= to && c[e.code] != null) c[e.code]++;
    return { from, to, c };
  });
  return {
    p5: groupAccuracy(log, 'p5', from14, dateISO),
    p2: groupAccuracy(log, 'p2', from14, dateISO),
    traps: groupAccuracy(log, 'p2trap', from14, dateISO),
    reading: groupAccuracy(readingLog, 'r', from14, dateISO),
    focus: groupAccuracy(log, 'p34', from14, dateISO),
    parrotoWeak: db.parroto?.analytics?.weak || [],
    weeks,
  };
}

// ---------- 2. Speed & stamina ----------
function avg(nums) {
  const v = nums.filter((x) => x != null && !Number.isNaN(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

// Accuracy in the first vs second half of a section of a full test (question-number ranges).
function halves(result, from, to) {
  const wrong = new Set([...(result.wrongQs || []), ...(result.skippedQs || [])]);
  const mid = Math.floor((from + to) / 2);
  let a = 0; let an = 0; let b = 0; let bn = 0;
  for (let q = from; q <= to; q++) {
    const ok = !wrong.has(q);
    if (q <= mid) { an++; if (ok) a++; } else { bn++; if (ok) b++; }
  }
  return { first: rate(a, an), second: rate(b, bn) };
}

export function speedStamina(db, dateISO) {
  const from14 = addDays(dateISO, -13);
  const log = (db.drill?.log || []).filter((e) => e.date >= from14 && e.date <= dateISO);
  const secs = (kind) => avg(log.filter((e) => e.kind === kind && e.secs != null && !e.timeout).map((e) => e.secs));
  const fulls = db.results.filter((r) => r.kind === 'full' && r.auto && (r.wrongQs || r.skippedQs)).sort((a, b) => (a.date < b.date ? -1 : 1));
  const last = fulls[fulls.length - 1];
  const stamina = last ? {
    date: last.date,
    L: halves(last, PART_RANGES.P1[0], PART_RANGES.P4[1]),
    R: halves(last, PART_RANGES.P5[0], PART_RANGES.P7[1]),
    p7: halves(last, PART_RANGES.P7[0], PART_RANGES.P7[1]),
    skipped: (last.skippedQs || []).length,
  } : null;
  const skippedTrend = fulls.slice(-4).map((r) => ({ date: r.date, n: (r.skippedQs || []).length }));
  const sims = log.filter((e) => e.kind === 'sim');
  return {
    p5Secs: secs('p5'),
    p5Timeouts: log.filter((e) => e.kind === 'p5' && e.timeout).length,
    p6Secs: secs('p6'),
    p7Secs: secs('p7'),
    simAvgSecs: avg(sims.map((e) => (e.total ? e.secs / e.total : null))),
    stamina,
    skippedTrend,
  };
}

// ---------- 3. Memory & error fixing ----------
export function memoryFixing(db, dateISO) {
  const finalStage = REDO_STEPS.length - 1;
  let s1 = 0; let s1ok = 0; let s2 = 0; let s2ok = 0;
  for (const e of db.errors) {
    for (const h of e.redo?.history || []) {
      if (h.stage === 0) { s1++; if (h.passed) s1ok++; }
      if (h.stage === finalStage) { s2++; if (h.passed) s2ok++; }
    }
  }
  // Recurring: codes with >= 3 errors in each of the last two weeks.
  const wk = (w) => {
    const to = addDays(dateISO, -7 * w);
    const from = addDays(to, -6);
    const c = {};
    for (const e of db.errors) if (e.date >= from && e.date <= to) c[e.code] = (c[e.code] || 0) + 1;
    return c;
  };
  const w0 = wk(0);
  const w1 = wk(1);
  const recurring = Object.keys(CODES).filter((k) => (w0[k] || 0) >= 3 && (w1[k] || 0) >= 3);
  const coded = db.errors.filter((e) => e.date >= addDays(dateISO, -13));
  const hiConf = coded.filter((e) => e.confidence === 'high').length;
  // Vocabulary from Parroto snapshots.
  const snapDays = Object.keys(db.vocab?.snaps || {}).sort();
  const firstSnap = snapDays.length ? db.vocab.snaps[snapDays[0]].first : null;
  const lastSnap = snapDays.length ? db.vocab.snaps[snapDays[snapDays.length - 1]].last : null;
  const dueTrend = snapDays.slice(-7).map((d) => ({ date: d, due: db.vocab.snaps[d].last.due }));
  const drillLog = db.drill?.log || [];
  return {
    redo2: rate(s1ok, s1), redo2n: s1,
    redo7: rate(s2ok, s2), redo7n: s2,
    recurring,
    hiConfRate: rate(hiConf, coded.length), hiConfN: hiConf,
    vocab: lastSnap ? {
      accuracy: lastSnap.accuracy, mastered: lastSnap.mastered, totalCards: lastSnap.totalCards, due: lastSnap.due,
      masteredGain: firstSnap && lastSnap.mastered != null && firstSnap.mastered != null ? lastSnap.mastered - firstSnap.mastered : null,
    } : null,
    dueTrend,
    drillRepeatOk: (() => {
      // Items seen at least twice: share answered correctly on the latest try.
      const byId = {};
      for (const e of drillLog) if (['p5', 'p2', 'para', 'anto'].includes(e.kind)) (byId[e.id] = byId[e.id] || []).push(e);
      const rep = Object.values(byId).filter((a) => a.length >= 2);
      return { rate: rate(rep.filter((a) => a[a.length - 1].correct).length, rep.length), n: rep.length };
    })(),
  };
}

// ---------- 4. Forecast & readiness ----------
// Unofficial approximation: scaled ≈ 5 × correct answers (clamped 5–495) per section, ± 35 noise.
// ETS does not publish a conversion table; this is only a rough planning aid.
export function scaled(raw) {
  return Math.max(5, Math.min(495, Math.round(raw) * 5));
}

export function forecast(db, dateISO, target = 800) {
  const acc = partAccuracy(db.results, addDays(dateISO, -20), dateISO);
  const section = (parts) => {
    let raw = 0;
    let known = 0;
    for (const p of parts) {
      if (acc[p].total >= 10) { raw += acc[p].rate * PART_SIZE[p]; known += PART_SIZE[p]; }
    }
    if (known < 50) return null; // not enough data
    const full = parts.reduce((n, p) => n + PART_SIZE[p], 0);
    const estRaw = (raw / known) * full;
    const s = scaled(estRaw);
    return { raw: Math.round(estRaw), est: s, low: Math.max(5, s - 35), high: Math.min(495, s + 35), coverage: known / full };
  };
  const L = section(LISTENING_PARTS);
  const R = section(READING_PARTS);
  const fulls = db.results.filter((r) => r.kind === 'full' && r.L != null).sort((a, b) => (a.date < b.date ? -1 : 1));
  const lastFull = fulls[fulls.length - 1] || null;
  const examDate = db.settings?.examDate;
  const daysLeft = examDate ? Math.max(0, diffDays(dateISO, examDate)) : null;
  const est = L && R ? L.est + R.est : lastFull ? lastFull.L + lastFull.R : null;
  const gap = est != null ? Math.max(0, target - est) : null;
  const weeksLeft = daysLeft != null ? Math.max(1, daysLeft / 7) : null;
  // Which part gives the most points per extra percent of accuracy, weighted by how far it is from 90%.
  const levers = PARTS.filter((p) => acc[p].total >= 10)
    .map((p) => ({ part: p, rate: acc[p].rate, potential: Math.round(Math.max(0, 0.9 - acc[p].rate) * PART_SIZE[p] * 5) }))
    .sort((a, b) => b.potential - a.potential)
    .slice(0, 3);
  return {
    L, R, est, target, gap, daysLeft,
    perWeek: gap != null && weeksLeft ? Math.round(gap / weeksLeft) : null,
    readiness: est != null ? Math.min(1, est / target) : null,
    lastFull, fullCount: fulls.length,
    levers,
  };
}
