// Drill engine: picks questions (weak types first, due repeats first) and records answers.
// Spaced repeats use simple boxes: wrong -> tomorrow, then 3 days, 7 days, 16 days.

import { addDays } from './dates.js';

export const BOX_DAYS = [1, 3, 7, 16];
export const P5_SECONDS = 20;

export function emptyDrill() {
  return { items: {}, log: [] };
}

// Record one answer. Returns a new drill object.
export function record(drill, entry) {
  const d = drill || emptyDrill();
  const items = { ...(d.items || {}) };
  const prev = items[entry.id] || { box: 0, n: 0, wrong: 0 };
  const box = entry.correct ? Math.min(prev.box + 1, BOX_DAYS.length - 1) : 0;
  items[entry.id] = {
    box,
    n: prev.n + 1,
    wrong: prev.wrong + (entry.correct ? 0 : 1),
    last: entry.date,
    due: addDays(entry.date, entry.correct ? BOX_DAYS[box] : BOX_DAYS[0]),
  };
  // Keep every other saved field (hidden items, own pairs, sentences, word status, own words…).
  return { ...d, items, log: [...(d.log || []), entry] };
}

// Accuracy per group (category for P5, trap code for P2 recognition) over a date range.
export function groupAccuracy(log, kind, fromISO, toISO, keyFn = (e) => e.cat) {
  const out = {};
  for (const e of log || []) {
    if (e.kind !== kind || e.date < fromISO || e.date > toISO) continue;
    const k = keyFn(e);
    if (!k) continue;
    out[k] = out[k] || { n: 0, ok: 0 };
    out[k].n++;
    if (e.correct) out[k].ok++;
  }
  for (const v of Object.values(out)) v.rate = v.n ? v.ok / v.n : null;
  return out;
}

export function countToday(log, kind, dateISO) {
  return (log || []).filter((e) => e.kind === kind && e.date === dateISO).length;
}

// Weight for a group: weaker = higher. Unseen groups get a middle weight so they get tried.
function weightFor(acc, extra = 0) {
  if (!acc || acc.n < 3) return 1.5 + extra;
  return 0.4 + (1 - acc.rate) * 3 + extra;
}

function weightedPick(entries, rng) {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return k;
  }
  return entries[entries.length - 1][0];
}

// Pick n items.
// bank: [{id, group}], groups: list of group keys.
// opts.focus: only this group. opts.boost: {group: extraWeight} (e.g. from error-log codes).
export function pick(bank, drill, dateISO, n, opts = {}) {
  const rng = opts.rng || Math.random;
  const items = drill?.items || {};
  const seenToday = new Set((drill?.log || []).filter((e) => e.date === dateISO).map((e) => e.id));
  let pool = bank.filter((b) => !opts.focus || b.group === opts.focus);
  const chosen = [];
  const take = (b) => { chosen.push(b); pool = pool.filter((x) => x.id !== b.id); };

  // 1) Due repeats (answered before, due today or earlier), oldest due first, at most half the session.
  const due = pool.filter((b) => items[b.id] && items[b.id].due <= dateISO && !seenToday.has(b.id))
    .sort((a, b) => (items[a.id].due < items[b.id].due ? -1 : 1));
  for (const b of due.slice(0, Math.ceil(n / 2))) take(b);

  // 2) New items, choosing the group by weakness.
  const acc = opts.accuracy || {};
  while (chosen.length < n) {
    const fresh = pool.filter((b) => !items[b.id] && !seenToday.has(b.id));
    const source = fresh.length ? fresh : pool.filter((b) => !seenToday.has(b.id));
    const usable = source.length ? source : pool;
    if (!usable.length) break;
    const groups = [...new Set(usable.map((b) => b.group))];
    const g = groups.length === 1 ? groups[0] : weightedPick(groups.map((k) => [k, weightFor(acc[k], opts.boost?.[k] || 0)]), rng);
    const inGroup = usable.filter((b) => b.group === g);
    take(inGroup[Math.floor(rng() * inGroup.length)]);
  }
  return chosen;
}

export function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Ids whose latest answer today was wrong, for a kind.
export function wrongToday(log, kind, d) {
  const last = {};
  for (const e of log || []) if (e.kind === kind && e.date === d) last[e.id] = e.correct;
  return Object.entries(last).filter(([, ok]) => !ok).map(([id]) => id);
}

export function countSrcToday(log, src, d) {
  return (log || []).filter((e) => e.src === src && e.date === d && (e.kind === 'p5' || e.kind === 'p2')).length;
}
