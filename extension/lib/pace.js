// Reading pacing plan for TOEIC (75 minutes for questions 101–200).
// Milestones: Part 5 done at 11:00, Part 6 done at 20:00, Part 7 gets the remaining 55 minutes,
// split by passage: single passages get less time per question than double / triple passages.
// Plain functions so the content script and tests share the same numbers.

export const READING_MIN = 75;
export const P5_END = 11;
export const P6_END = 20;
const PER_Q = { 1: 0.9, 2: 1.1, 3: 1.2 }; // relative minutes per question by number of texts in the passage

// Usual ETS layout, used when the page does not show the groups.
export const STANDARD_P7 = [
  [147, 148, 1], [149, 150, 1], [151, 152, 1], [153, 154, 1], [155, 157, 1], [158, 160, 1], [161, 163, 1],
  [164, 167, 1], [168, 171, 1], [172, 175, 1], [176, 180, 2], [181, 185, 2], [186, 190, 3], [191, 195, 3], [196, 200, 3],
].map(([a, b, texts]) => ({ qs: Array.from({ length: b - a + 1 }, (_, i) => a + i), texts }));

// Minute (from the start of Reading) by which each question 101–200 should be finished.
// scale < 1 when less than 75 minutes were left at the start of Reading.
export function targets(groups = STANDARD_P7, scale = 1) {
  const t = {};
  for (let q = 101; q <= 130; q++) t[q] = ((q - 100) * P5_END) / 30;
  for (let q = 131; q <= 146; q++) t[q] = P5_END + ((q - 130) * (P6_END - P5_END)) / 16;
  const p7 = (groups && groups.length ? groups : STANDARD_P7).filter((g) => g.qs.length);
  const weight = (g) => g.qs.length * (PER_Q[Math.min(3, Math.max(1, g.texts || 1))]);
  const total = p7.reduce((s, g) => s + weight(g), 0) || 1;
  let at = P6_END;
  for (const g of p7) {
    const per = ((READING_MIN - P6_END) * (weight(g) / total)) / g.qs.length;
    for (const q of g.qs) { at += per; t[q] = at; }
  }
  for (const k of Object.keys(t)) t[k] *= scale;
  return t;
}

// Where you stand while working on question q after `elapsedMin` minutes of Reading.
// ahead > 0: ahead of plan by that many minutes; < 0: behind.
export function status(t, q, elapsedMin) {
  const prevDone = q <= 101 ? 0 : t[q - 1] ?? 0;
  let expectedQ = 101;
  for (let k = 101; k <= 200; k++) if (t[k] != null && t[k] <= elapsedMin) expectedQ = k + 1;
  return { ahead: prevDone - elapsedMin, expectedQ: Math.min(200, expectedQ) };
}

// Budget for the passage that contains q, and how much of it was used (seconds per question map).
export function passageBudget(t, group, qSecs = {}) {
  const first = group.qs[0];
  const last = group.qs[group.qs.length - 1];
  const start = first <= 101 ? 0 : t[first - 1];
  const budgetSec = Math.round((t[last] - start) * 60);
  const usedSec = group.qs.reduce((s, q) => s + (qSecs[q] || 0), 0);
  return { first, last, texts: group.texts || 1, budgetSec, usedSec, over: usedSec > budgetSec };
}

// Seconds per question for each Reading part, and passages that ran over budget.
export function summarize(qSecs = {}, groups = STANDARD_P7, scale = 1) {
  const t = targets(groups, scale);
  const part = (a, b) => {
    const xs = [];
    for (let q = a; q <= b; q++) if (qSecs[q]) xs.push(qSecs[q]);
    return xs.length ? { n: xs.length, avg: xs.reduce((s, x) => s + x, 0) / xs.length } : null;
  };
  const over = (groups && groups.length ? groups : STANDARD_P7)
    .map((g) => passageBudget(t, g, qSecs))
    .filter((p) => p.usedSec > 0 && p.over);
  return { P5: part(101, 130), P6: part(131, 146), P7: part(147, 200), over };
}

export function mmss(sec) {
  const s = Math.max(0, Math.round(Math.abs(sec)));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
