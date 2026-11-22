// Builds a Reading simulator test from the Part 6 / Part 7 banks.
// Sets you have not done (or did longest ago) come first.

import { P6, P7 } from '../data/reading.js';

export const MODES = {
  p6: { name: 'Part 6 – 4 đoạn', p6: 4, single: 0, multi: 0 },
  p7: { name: 'Part 7 – 4 đoạn đơn + 1 bộ nhiều đoạn', p6: 0, single: 4, multi: 1 },
  mix: { name: 'Mini Reading – 2 đoạn P6 + 3 đoạn đơn + 1 bộ nhiều đoạn', p6: 2, single: 3, multi: 1 },
};

// Time budget from the research report: Part 6 ≈ 10 minutes for 16 questions, Part 7 ≈ 1 minute per question.
export const SEC_P6_Q = 37.5;
export const SEC_P7_Q = 60;

function freshestFirst(list, drill, rng) {
  const items = drill?.items || {};
  return [...list]
    .map((s) => ({ s, last: items[s.id]?.last || '0000-00-00', r: rng() }))
    .sort((a, b) => (a.last < b.last ? -1 : a.last > b.last ? 1 : a.r - b.r))
    .map((x) => x.s);
}

export function buildTest(mode, drill, rng = Math.random) {
  const m = MODES[mode] || MODES.mix;
  const p6 = freshestFirst(P6, drill, rng).slice(0, m.p6);
  const singles = freshestFirst(P7.filter((s) => s.kind === 'single'), drill, rng).slice(0, m.single);
  const multis = freshestFirst(P7.filter((s) => s.kind !== 'single'), drill, rng).slice(0, m.multi);
  const sets = [
    ...p6.map((s) => ({ ...s, part: 'P6' })),
    ...[...singles, ...multis].map((s) => ({ ...s, part: 'P7' })),
  ];
  const questions = [];
  for (const s of sets) {
    if (s.part === 'P6') {
      for (const qq of s.qs) {
        questions.push({
          id: `${s.id}-q${qq.n}`, setId: s.id, part: 'P6', blank: qq.n, type: qq.type,
          text: qq.type === 'insert' ? `Chọn câu phù hợp nhất cho chỗ trống (${qq.n}).` : `Chọn từ/cụm từ phù hợp nhất cho chỗ trống (${qq.n}).`,
          o: qq.o, a: qq.a, why: qq.why,
        });
      }
    } else {
      s.qs.forEach((qq, i) => questions.push({ id: `${s.id}-q${i + 1}`, setId: s.id, part: 'P7', type: qq.type, text: qq.q, o: qq.o, a: qq.a, why: qq.why }));
    }
  }
  const seconds = Math.round(questions.reduce((t, q) => t + (q.part === 'P6' ? SEC_P6_Q : SEC_P7_Q), 0));
  return { mode, name: m.name, sets, questions, seconds };
}

// Score a finished test. answers: {questionId: shownIndex}, order: {questionId: [original indexes in shown order]}
export function score(test, answers, order) {
  const byType = {};
  let correct = 0;
  const rows = test.questions.map((q) => {
    const shown = answers[q.id];
    const orig = shown == null ? null : order[q.id][shown];
    const ok = orig === q.a;
    if (ok) correct++;
    byType[q.type] = byType[q.type] || { n: 0, ok: 0 };
    byType[q.type].n++;
    if (ok) byType[q.type].ok++;
    return { q, chosen: orig, ok };
  });
  return { correct, total: test.questions.length, byType, rows };
}
