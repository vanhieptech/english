import test from 'node:test';
import assert from 'node:assert/strict';
import { planDay, dateForDay, addDays, diffDays } from '../lib/dates.js';
import { buildDay, PLAN } from '../lib/plan.js';
import { adjustments, applyRedo, scheduleNew, dueErrors, partAccuracy, mockTrend, weakestPart, redoSuccess } from '../lib/rules.js';
import { DEFAULTS } from '../lib/store.js';

const EXAM = '2026-12-21';
function db(over = {}) {
  const base = JSON.parse(JSON.stringify(DEFAULTS));
  base.settings.examDate = EXAM;
  return { ...base, ...over, settings: { ...base.settings, ...(over.settings || {}) } };
}

test('day numbering: exam day is 30', () => {
  assert.equal(planDay(EXAM, EXAM), 30);
  assert.equal(planDay(dateForDay(1, EXAM), EXAM), 1);
  assert.equal(dateForDay(1, EXAM), '2026-11-22');
  assert.equal(diffDays('2026-11-30', '2026-12-01'), 1);
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});

test('plan covers all 30 days', () => {
  for (let d = 1; d <= 30; d++) assert.ok(PLAN[d], 'missing day ' + d);
});

test('every day builds without throwing and has tasks', () => {
  for (let d = 1; d <= 30; d++) {
    const r = buildDay(db(), dateForDay(d, EXAM));
    assert.equal(r.day, d);
    assert.ok(r.tasks.length > 0, 'no tasks day ' + d);
  }
});

test('no exam date gives a notice', () => {
  const r = buildDay(db({ settings: { examDate: '' } }), '2026-11-22');
  assert.equal(r.tasks.length, 0);
  assert.match(r.notices[0], /ngày thi/);
});

test('before day 1 shows day-1 preview', () => {
  const r = buildDay(db(), '2026-11-20');
  assert.equal(r.day, 1);
  assert.ok(r.preview);
  assert.ok(r.tasks.some((t) => t.id === 'full'));
});

test('day 1 is the diagnostic full test on TOEIC 2026 Test 1', () => {
  const r = buildDay(db(), dateForDay(1, EXAM));
  const full = r.tasks.find((t) => t.id === 'full');
  assert.match(full.link, /toeic-2026-test-1$/);
});

test('part drills avoid tests already used', () => {
  const d2 = dateForDay(2, EXAM);
  const first = buildDay(db(), d2);
  const L = first.tasks.find((t) => t.id === 'L');
  assert.match(L.link, /parroto-toeic-vol-1-test-1$/);
  // Reading P5 must not collide with listening assignment parts, but can share the test.
  const withUsed = db({
    results: [{ id: 'x', date: '2026-11-20', kind: 'part', set: 'parroto-toeic-vol-1', test: 1, part: 'P1', correct: 5, total: 6 }],
  });
  const second = buildDay(withUsed, d2);
  assert.match(second.tasks.find((t) => t.id === 'L').link, /vol-1-test-2$/);
});

test('saved assignment is reused', () => {
  const d2 = dateForDay(2, EXAM);
  const r1 = buildDay(db(), d2);
  const saved = db({ assign: { [d2]: r1.newAssign } });
  const r2 = buildDay(saved, d2);
  assert.equal(r2.newAssign, null);
  assert.equal(r2.tasks.find((t) => t.id === 'L').link, r1.tasks.find((t) => t.id === 'L').link);
});

test('logging a part result auto-completes the task', () => {
  const d2 = dateForDay(2, EXAM);
  const data = db({
    results: [
      { id: 'a', date: d2, kind: 'part', set: 'parroto-toeic-vol-1', test: 1, part: 'P1', correct: 5, total: 6 },
      { id: 'b', date: d2, kind: 'part', set: 'parroto-toeic-vol-1', test: 1, part: 'P2', correct: 15, total: 25 },
    ],
  });
  const r = buildDay(data, d2);
  assert.ok(r.tasks.find((t) => t.id === 'L').done);
  assert.ok(!r.tasks.find((t) => t.id === 'R').done);
});

test('redo schedule: +2, then +7, fail resets', () => {
  const r0 = scheduleNew('2026-12-01');
  assert.equal(r0.due, '2026-12-03');
  const r1 = applyRedo(r0, '2026-12-03', true);
  assert.equal(r1.due, '2026-12-10');
  const r2 = applyRedo(r1, '2026-12-10', true);
  assert.ok(r2.done);
  const rf = applyRedo(r1, '2026-12-10', false);
  assert.equal(rf.stage, 0);
  assert.equal(rf.due, '2026-12-12');
  assert.equal(redoSuccess([{ redo: r2 }, { redo: rf }]), 0.5);
  assert.equal(dueErrors([{ redo: r0 }], '2026-12-02').length, 0);
  assert.equal(dueErrors([{ redo: r0 }], '2026-12-03').length, 1);
});

test('rule: part under 60% with 20+ questions adds extra practice', () => {
  const d = dateForDay(10, EXAM);
  const data = db({
    results: [{ id: 'a', date: addDays(d, -2), kind: 'part', set: 'parroto-toeic-vol-1', test: 3, part: 'P3', correct: 15, total: 39 }],
  });
  const adj = adjustments(data, d);
  assert.ok(adj.some((a) => a.id === 'weak-P3'));
  const r = buildDay(data, d);
  assert.ok(r.tasks.some((t) => t.id === 'XP3'));
});

test('rule: top error code A gives 3 dictations', () => {
  const d = dateForDay(10, EXAM);
  const errors = [1, 2, 3].map((i) => ({ id: 'e' + i, date: addDays(d, -1), part: 'P3', code: 'A' }));
  const r = buildDay(db({ errors }), d);
  assert.match(r.tasks.find((t) => t.id === 'dict').title, /3 bài/);
});

test('rule: overdue > 100 pauses new words', () => {
  const d = dateForDay(10, EXAM);
  const r = buildDay(db({ daily: { [d]: { overdue: 150 } } }), d);
  assert.match(r.tasks.find((t) => t.id === 'new').title, /không học từ mới/);
});

test('no new words after day 25', () => {
  for (const d of [26, 27, 28]) {
    const r = buildDay(db(), dateForDay(d, EXAM));
    const t = r.tasks.find((x) => x.id === 'new');
    if (t) assert.doesNotMatch(t.title, /Học \d+ từ mới/);
  }
});

test('weakest part uses accuracy, then errors, then default', () => {
  const d = dateForDay(13, EXAM);
  assert.equal(weakestPart(db(), d, 'L').part, 'P3');
  const byErr = db({ errors: [{ date: d, part: 'P2', code: 'D' }] });
  assert.equal(weakestPart(byErr, d, 'L').part, 'P2');
  const byAcc = db({
    results: [
      { date: d, kind: 'part', part: 'P1', correct: 3, total: 12 },
      { date: d, kind: 'part', part: 'P4', correct: 20, total: 30 },
    ],
  });
  assert.equal(weakestPart(byAcc, d, 'L').part, 'P1');
});

test('full test per-part counts feed accuracy; mock trend flags noise', () => {
  const results = [
    { date: '2026-11-22', kind: 'full', L: 300, R: 250, parts: { P5: { correct: 20, total: 30 } } },
    { date: '2026-11-29', kind: 'full', L: 320, R: 255 },
  ];
  assert.equal(partAccuracy(results, '2026-11-01', '2026-12-31').P5.total, 30);
  const tr = mockTrend(results);
  assert.equal(tr[1].delta, 25);
  assert.ok(tr[1].noise);
});

import { slugify } from '../lib/constants.js';
test('slugify matches the Parroto lesson URL seen live', () => {
  assert.equal(slugify('First-Class Upgrade Perks'), 'first-class-upgrade-perks');
  assert.equal(slugify("Sarah's Sales Success: MVP Debate"), 'sarahs-sales-success-mvp-debate');
});

import { toResult, pendingErrors, missingFromHistory } from '../lib/autoresult.js';
import { parseTestName, parseUSDate, partOfQuestion } from '../lib/constants.js';
import { merge } from '../lib/store.js';

// Shapes copied from the live Parroto pages read on 21/11/2026 (second test account).
const RAW_FULL = {
  session: '6b01720ed42eeaffd1e29075', testName: 'TOEIC 2023 - Test 10', mode: 'test', total: 54, L: 49, R: 5, minutes: 0,
  parts: { P1: { correct: 2, total: 6 }, P2: { correct: 6, total: 25 }, P3: { correct: 0, total: 39 }, P4: { correct: 0, total: 30 }, P5: { correct: 0, total: 30 }, P6: { correct: 0, total: 16 }, P7: { correct: 0, total: 54 } },
  tags: ['Single person', 'Indoor scene', 'WH-question'],
  qmap: { correct: [4, 6], wrong: [1, 2, 3, 5, 7, 8], skipped: [40, 150] },
};
const RAW_P1 = { session: '6b0171acd42eeaffd1e258f2', testName: 'TOEIC 2023 - Test 10', mode: 'practice', minutes: 1, parts: { P1: { correct: 0, total: 6 } }, tags: [], qmap: { correct: [], wrong: [1, 2, 3, 4, 5, 6], skipped: [] } };

test('test name, dates and question ranges', () => {
  assert.deepEqual(parseTestName('TOEIC 2023 - Test 10'), { set: 'toeic-2023', test: 10 });
  assert.deepEqual(parseTestName('Parroto TOEIC Practice Vol. 1 - Test 1'), { set: 'parroto-toeic-vol-1', test: 1 });
  assert.equal(parseUSDate('11/21/2026'), '2026-11-21');
  assert.equal(partOfQuestion(31), 'P2');
  assert.equal(partOfQuestion(147), 'P7');
});

test('auto result kinds: full test and single part', () => {
  const f = toResult(RAW_FULL, '2026-11-21');
  assert.equal(f.kind, 'full');
  assert.equal(f.L + f.R, 54);
  assert.equal(f.set, 'toeic-2023');
  const p = toResult(RAW_P1, '2026-11-21');
  assert.equal(p.kind, 'part');
  assert.equal(p.part, 'P1');
  assert.equal(p.total, 6);
});

test('merged results feed plan auto-done and pending error list', () => {
  const raw = JSON.parse(JSON.stringify(DEFAULTS));
  raw.settings.examDate = EXAM;
  raw.autoResults = [toResult(RAW_FULL, dateForDay(1, EXAM))];
  const merged = merge(raw);
  const r = buildDay(merged, dateForDay(1, EXAM));
  assert.ok(r.tasks.find((t) => t.id === 'full').done);
  const pend = pendingErrors(merged);
  assert.equal(pend.length, 8);
  assert.equal(pend.find((x) => x.q === 150).part, 'P7');
  // Coding one and dismissing one removes them.
  merged.errors = [{ srcKey: pend[0].key }];
  merged.ignore = { sessions: [], errorKeys: [pend[1].key] };
  assert.equal(pendingErrors(merged).length, 6);
  // Ignoring the session removes the result.
  raw.ignore = { sessions: [RAW_FULL.session], errorKeys: [] };
  assert.equal(merge(raw).results.length, 0);
});

test('history entries without a read result are listed', () => {
  const raw = JSON.parse(JSON.stringify(DEFAULTS));
  raw.parroto = { history: [{ session: 'a' }, { session: RAW_P1.session }] };
  raw.autoResults = [toResult(RAW_P1, '2026-11-21')];
  assert.deepEqual(missingFromHistory(merge(raw)).map((h) => h.session), ['a']);
});

import { P5, P5_CATS } from '../data/p5.js';
import { P2, P2_TRAPS, P2_TYPES } from '../data/p2.js';
import { pick, record, groupAccuracy, countToday, emptyDrill } from '../lib/drill.js';

test('Part 5 bank: 300 items, 30 per type, well-formed', () => {
  assert.equal(P5.length, 300);
  for (const c of Object.keys(P5_CATS)) assert.equal(P5.filter((q) => q.cat === c).length, 30, c);
  const ids = new Set();
  for (const q of P5) {
    assert.equal(q.s.split('___').length, 2, 'one blank: ' + q.id);
    assert.equal(q.o.length, 4, q.id);
    assert.equal(new Set(q.o).size, 4, 'unique options: ' + q.id);
    assert.ok(q.a >= 0 && q.a < 4, q.id);
    assert.ok(q.why && q.why.length > 5, q.id);
    assert.ok(!ids.has(q.id)); ids.add(q.id);
  }
  assert.equal(new Set(P5.map((q) => q.s)).size, 300, 'no duplicate sentences');
});

test('Part 2 bank: 150 items, one correct, valid traps and types', () => {
  assert.equal(P2.length, 150);
  for (const q of P2) {
    assert.equal(q.options.length, 3, q.id);
    assert.equal(q.options.filter((o) => o.correct).length, 1, q.id);
    assert.equal(new Set(q.options.map((o) => o.text)).size, 3, 'unique: ' + q.id);
    for (const o of q.options) if (!o.correct) assert.ok(P2_TRAPS[o.trap], 'trap ' + q.id);
    assert.ok(P2_TYPES[q.type], 'type ' + q.id);
  }
  assert.equal(new Set(P2.map((q) => q.q)).size, 150, 'no duplicate questions');
});

test('drill engine: spaced boxes, due first, weak types weighted', () => {
  let d = emptyDrill();
  d = record(d, { kind: 'p5', id: 'x', cat: 'tense', correct: false, date: '2026-12-01' });
  assert.equal(d.items.x.due, '2026-12-02');
  d = record(d, { kind: 'p5', id: 'x', cat: 'tense', correct: true, date: '2026-12-02' });
  assert.equal(d.items.x.due, '2026-12-05');
  assert.equal(countToday(d.log, 'p5', '2026-12-02'), 1);
  const bank = P5.map((q) => ({ ...q, group: q.cat }));
  // a due item comes first
  const dd = record(emptyDrill(), { kind: 'p5', id: bank[5].id, cat: bank[5].cat, correct: false, date: '2026-12-01' });
  const chosen = pick(bank, dd, '2026-12-03', 10);
  assert.equal(chosen[0].id, bank[5].id);
  assert.equal(new Set(chosen.map((c) => c.id)).size, 10);
  // weak type (0%) is picked far more often than a strong one (100%)
  const accuracy = { tense: { n: 20, ok: 0, rate: 0 }, wordform: { n: 20, ok: 20, rate: 1 } };
  let seed = 1; const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const many = pick(bank, emptyDrill(), '2026-12-03', 120, { accuracy, rng });
  const t = many.filter((q) => q.cat === 'tense').length;
  const w = many.filter((q) => q.cat === 'wordform').length;
  assert.ok(t > w * 2, `tense ${t} vs wordform ${w}`);
  // focus mode
  assert.ok(pick(bank, emptyDrill(), '2026-12-03', 10, { focus: 'pronoun' }).every((q) => q.cat === 'pronoun'));
  const acc = groupAccuracy(d.log, 'p5', '2026-12-01', '2026-12-02');
  assert.equal(acc.tense.n, 2);
});

test('daily plan includes the drill task and ticks it from the drill log', () => {
  const d = dateForDay(10, EXAM);
  const log = [];
  for (let i = 0; i < 10; i++) log.push({ kind: 'p5', id: 'a' + i, date: d, correct: true }, { kind: 'p2', id: 'b' + i, date: d, correct: true });
  const r = buildDay(db({ drill: { items: {}, log } }), d);
  assert.ok(r.tasks.find((t) => t.id === 'drill').done);
  const r2 = buildDay(db(), d);
  assert.ok(!r2.tasks.find((t) => t.id === 'drill').done);
});

import { P6, P7, Q_TYPES } from '../data/reading.js';
import { P34, FOCUS, PARA } from '../data/listen-read.js';
import { buildTest, score } from '../lib/sim.js';

test('Part 6/7 bank well-formed', () => {
  for (const p of P6) {
    assert.equal(p.qs.length, 4, p.id);
    assert.equal(p.qs.filter((x) => x.type === 'insert').length, 1, 'one insertion: ' + p.id);
    for (const x of p.qs) {
      assert.ok(p.text.includes(`{{${x.n}}}`), `blank ${x.n} in ${p.id}`);
      assert.equal(new Set(x.o).size, 4, p.id);
      assert.ok(Q_TYPES[x.type]);
    }
  }
  for (const p of P7) {
    assert.ok(p.docs.length === { single: 1, double: 2, triple: 3 }[p.kind], p.id);
    for (const x of p.qs) {
      assert.equal(x.o.length, 4, p.id);
      assert.equal(new Set(x.o).size, 4, p.id + ' ' + x.q);
      assert.ok(x.a >= 0 && x.a < 4);
      assert.ok(Q_TYPES[x.type], x.type);
    }
  }
  assert.ok(P7.some((p) => p.kind === 'double') && P7.some((p) => p.kind === 'triple'));
});

test('P3/4 sets and paraphrase pairs well-formed', () => {
  assert.equal(P34.length, 40);
  for (const s of P34) { assert.equal(s.qs.length, 3); for (const q of s.qs) assert.ok(FOCUS[q.focus], q.text); }
  assert.ok(PARA.length >= 190);
  assert.equal(new Set(PARA.map((p) => p.a)).size, PARA.length);
  assert.ok(PARA.every((p) => !/\[|\]/.test(p.a + p.b)), 'no placeholders');
});

test('simulator builds timed tests and scores shuffled answers', () => {
  let seed = 7; const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const t6 = buildTest('p6', null, rng);
  assert.equal(t6.questions.length, 16);
  assert.equal(t6.seconds, 600);
  const mix = buildTest('mix', null, rng);
  assert.equal(mix.sets.filter((x) => x.part === 'P6').length, 2);
  assert.ok(mix.sets.some((x) => x.kind && x.kind !== 'single'));
  // identity order, answer everything correctly except the first question
  const order = {}; const answers = {};
  mix.questions.forEach((q, i) => { order[q.id] = [0, 1, 2, 3]; answers[q.id] = i === 0 ? (q.a + 1) % 4 : q.a; });
  const r = score(mix, answers, order);
  assert.equal(r.correct, mix.questions.length - 1);
  // sets done recently go last
  const drill = { items: { [t6.sets[0].id]: { last: '2026-12-01' } }, log: [] };
  const again = buildTest('p6', drill, rng);
  assert.ok(!again.sets.slice(0, 4).some((x) => x.id === t6.sets[0].id) || P6.length <= 4);
});

test('daily plan adds simulator, fast-reading and paraphrase tasks on the right days', () => {
  const d10 = buildDay(db(), dateForDay(10, EXAM)); // L P4, R P7
  assert.ok(d10.tasks.some((t) => t.id === 'sim'));
  assert.ok(d10.tasks.some((t) => t.id === 'flash'));
  assert.ok(d10.tasks.some((t) => t.id === 'para'));
  const d3 = buildDay(db(), dateForDay(3, EXAM)); // L P2, R P5
  assert.ok(!d3.tasks.some((t) => t.id === 'sim'));
  assert.ok(!d3.tasks.some((t) => t.id === 'para'));
  const done = buildDay(db({ drill: { items: {}, log: [{ kind: 'sim', date: dateForDay(10, EXAM) }] } }), dateForDay(10, EXAM));
  assert.ok(done.tasks.find((t) => t.id === 'sim').done);
});

import { pendingPrompts, hints } from '../lib/writing.js';
import { weekCompare } from '../lib/rules.js';
import { lineChart, barChart, rateBars } from '../lib/charts.js';

test('writing prompts come from V/G errors and wrong Part 5 items, and close after writing', () => {
  const d = dateForDay(10, EXAM);
  const base = db({
    errors: [
      { id: 'e1', date: d, code: 'V', part: 'P5', q: 120, cause: 'comply with' },
      { id: 'e2', date: d, code: 'A', part: 'P3', q: 40, cause: 'nghe sót' },
    ],
    drill: { items: { 'p5-vocab-1': { box: 0, n: 1, wrong: 1, last: d, due: d } }, log: [] },
  });
  const pend = pendingPrompts(base, d);
  assert.deepEqual(pend.map((p) => p.id), ['err-e1', 'p5w-p5-vocab-1']);
  assert.equal(pend[1].target, 'comply');
  assert.match(pend[1].model, /comply with/);
  const after = { ...base, drill: { ...base.drill, items: { ...base.drill.items, 'w:err-e1': { box: 1, due: addDays(d, 3) } } } };
  assert.deepEqual(pendingPrompts(after, d).map((p) => p.id), ['p5w-p5-vocab-1']);
  const r = buildDay(base, d);
  assert.match(r.tasks.find((t) => t.id === 'write').title, /2 câu/);
  assert.ok(hints('we comply', 'comply').length >= 2);
  assert.equal(hints('All staff must comply with the new rules.', 'comply').length, 0);
});

test('week comparison and charts render', () => {
  const d = '2026-12-10';
  const w = weekCompare(db({ time: { [d]: { exam: 1200 }, '2026-12-01': { vocab: 600 } }, results: [{ date: d, kind: 'part', part: 'P5', correct: 20, total: 30 }] }), d);
  assert.equal(w.cur.minutes, 20);
  assert.equal(w.prev.minutes, 10);
  assert.equal(w.cur.partN, 30);
  const svg = lineChart({ labels: ['a', 'b'], series: [{ name: 'L', color: 'red', values: [100, 200] }], yMax: 495 });
  assert.match(svg, /<polyline/);
  assert.match(barChart({ items: [{ label: 'x', value: 5, ref: 10 }] }), /class="ref"/);
  assert.match(rateBars({ items: [{ label: 'P1', rate: 0.5, n: 30 }] }), /⚠/);
});

import { TOPICS, ANTO, allTopicWords } from '../data/topics.js';

test('topic maps and antonym pairs well-formed', () => {
  assert.equal(TOPICS.length, 12);
  for (const t of TOPICS) {
    assert.equal(t.branches.length, 3, t.id);
    for (const b of t.branches) for (const w of b.words) { assert.equal(w.length, 3, w[0]); assert.ok(w[0] && w[1] && w[2]); }
  }
  assert.equal(allTopicWords().length, 144);
  const words = ANTO.flatMap((p) => [p.a, p.b]);
  assert.equal(new Set(words).size, words.length, 'no word appears twice in antonym pairs');
  assert.ok(ANTO.length >= 70);
});

test('recording a drill answer keeps every other saved drill field', () => {
  const before = {
    items: {}, log: [],
    hidden: ['p5-vocab-1'], myPairs: [{ id: 'my-1', a: 'x', b: 'y' }], sentences: [{ id: 's' }],
    wordStatus: { budget: 'known' }, myWords: [{ topic: 'finance', w: 'ledger' }],
  };
  const after = record(before, { kind: 'anto', id: 'anto-1', cat: 'anto', correct: true, date: '2026-11-21' });
  for (const k of ['hidden', 'myPairs', 'sentences', 'wordStatus', 'myWords']) assert.deepEqual(after[k], before[k], k);
  assert.equal(after.log.length, 1);
});

import { vocabDay, newWordsOn, overdueOn } from '../lib/vocab.js';

test('vocabulary counts come from Parroto statistics and rating clicks', () => {
  const d = dateForDay(10, EXAM);
  const prev = addDays(d, -1);
  const snap = (totalCards, totalReviews, due) => ({ totalCards, totalReviews, due, learning: 1, reviewing: 1, mastered: 1, at: '21:30' });
  const data = db({
    vocab: {
      snaps: { [prev]: { first: snap(100, 400, 30), last: snap(120, 480, 0) }, [d]: { first: snap(120, 500, 40), last: snap(145, 590, 0) } },
      rates: { [d]: { Good: 60, Again: 10, total: 70 } },
    },
  });
  const v = vocabDay(data, d);
  assert.equal(v.newWords, 25); // 145 - 120 (yesterday's last snapshot)
  assert.equal(v.reviews, 110); // stats delta 590 - 480 beats 70 clicks (phone study included)
  assert.equal(v.due, 0);
  assert.equal(newWordsOn(data, d), 25);
  const r = buildDay(data, d);
  assert.ok(r.tasks.find((t) => t.id === 'srs').done, 'due reached 0 after reviewing');
  assert.ok(r.tasks.find((t) => t.id === 'new').done, '25 new words reached the daily target');
  // Without snapshots, only clicks count and new words are unknown.
  const clicksOnly = db({ vocab: { snaps: {}, rates: { [d]: { total: 12 } } } });
  assert.equal(vocabDay(clicksOnly, d).reviews, 12);
  assert.equal(vocabDay(clicksOnly, d).newWords, null);
  // Parroto's Due count feeds the "too many overdue cards" rule when nothing was typed.
  const overdue = db({ vocab: { snaps: { [d]: { first: snap(10, 10, 150), last: snap(10, 10, 150) } }, rates: {} } });
  assert.equal(overdueOn(overdue, d), 150);
  assert.match(buildDay(overdue, d).tasks.find((t) => t.id === 'new').title, /không học từ mới/);
});

import { suggest, suggestFor, PART_DEFAULT } from '../lib/autocode.js';

test('error-code suggestions from review features', () => {
  assert.equal(suggest('P7', true, null).code, 'T');
  assert.equal(suggest('P3', false, null).sure, false);
  assert.equal(suggest('P3', false, null).code, PART_DEFAULT.P3[0]);
  const base = { status: 'INCORRECT', chosenIdx: 0, correctIdx: 1 };
  assert.equal(suggest('P2', false, { ...base, qWh: true, chosenYesNo: true }).code, 'D');
  assert.equal(suggest('P2', false, { ...base, chosenRepeat: true }).code, 'D');
  assert.equal(suggest('P2', false, { ...base }).code, 'A');
  assert.equal(suggest('P5', false, { ...base, sameRoot: true }).code, 'G');
  assert.equal(suggest('P5', false, { ...base, funcWords: true }).code, 'G');
  assert.equal(suggest('P5', false, { ...base }).code, 'V');
  assert.equal(suggest('P6', false, { ...base, sentenceOpts: true }).code, 'I');
  assert.equal(suggest('P7', false, { ...base, qVocab: true }).code, 'V');
  assert.equal(suggest('P7', false, { ...base, qInfer: true }).code, 'I');
  assert.equal(suggest('P7', false, { ...base, qNot: true }).code, 'Q');
  assert.equal(suggest('P4', false, { ...base, qInfer: true }).code, 'I');
  assert.equal(suggest('P3', false, { ...base, chosenIdx: -1 }).code, 'T');
});

test('suggestions adapt to your corrections', () => {
  const reason = suggest('P3', false, { status: 'INCORRECT', chosenIdx: 0 }).reason;
  const errors = [1, 2, 3].map((i) => ({ part: 'P3', suggested: 'A', suggestReason: reason, code: 'P' }));
  const p = { session: 's', q: 40, part: 'P3', skipped: false };
  const d = db({ errors, review: { s: { 40: { status: 'INCORRECT', chosenIdx: 0 } } } });
  const sg = suggestFor(d, p);
  assert.equal(sg.code, 'P');
  assert.equal(sg.baseCode, 'A');
});

import { accuracyDetail, speedStamina, memoryFixing, forecast, scaled } from '../lib/metrics.js';
import { wrongToday, countSrcToday } from '../lib/drill.js';

test('four metric groups compute from stored data', () => {
  const d = dateForDay(15, EXAM);
  const full = toResult({ session: 'F', testName: 'TOEIC 2026 - Test 2', mode: 'test', L: 350, R: 300,
    parts: { P1: { correct: 5, total: 6 }, P2: { correct: 18, total: 25 }, P3: { correct: 28, total: 39 }, P4: { correct: 20, total: 30 }, P5: { correct: 22, total: 30 }, P6: { correct: 11, total: 16 }, P7: { correct: 30, total: 54 } },
    qmap: { correct: [], wrong: [3, 10, 50, 120], skipped: [190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200] } }, d);
  const data = merge({ ...JSON.parse(JSON.stringify(DEFAULTS)), settings: { ...DEFAULTS.settings, examDate: EXAM }, autoResults: [full],
    errors: [{ date: d, code: 'A', confidence: 'high', redo: { history: [{ stage: 0, passed: true }, { stage: 1, passed: false }] } }],
    drill: { items: {}, log: [{ kind: 'p5', id: 'a', cat: 'tense', correct: false, secs: 18, date: d }, { kind: 'p5', id: 'b', cat: 'tense', correct: false, secs: 22, date: d }, { kind: 'p5', id: 'c', cat: 'tense', correct: true, secs: 14, date: d }] },
    vocab: { snaps: { [d]: { first: { totalCards: 10, mastered: 2, due: 5, accuracy: 80 }, last: { totalCards: 30, mastered: 6, due: 0, accuracy: 85 } } }, rates: {} } });
  const A = accuracyDetail(data, d);
  assert.equal(A.p5.tense.n, 3);
  assert.equal(A.weeks.length, 4);
  const S = speedStamina(data, d);
  assert.equal(Math.round(S.p5Secs), 18);
  assert.equal(S.stamina.skipped, 11);
  assert.ok(S.stamina.R.second < S.stamina.R.first, 'reading second half worse because of skipped items');
  const M = memoryFixing(data, d);
  assert.equal(M.redo2, 1);
  assert.equal(M.redo7, 0);
  assert.equal(M.vocab.masteredGain, 4);
  const F = forecast(data, d, 800);
  assert.ok(F.L && F.R);
  assert.equal(F.est, F.L.est + F.R.est);
  assert.ok(F.gap > 0 && F.perWeek > 0);
  assert.ok(F.levers.length > 0);
  assert.equal(scaled(100), 495);
  assert.equal(scaled(0), 5);
});

test('sprint and today-review tasks follow the drill log', () => {
  const d = dateForDay(10, EXAM);
  const log = [{ kind: 'p5', id: 'x', correct: false, date: d }, { kind: 'p2', id: 'y', correct: false, date: d }];
  assert.deepEqual(wrongToday(log, 'p5', d), ['x']);
  let r = buildDay(db({ drill: { items: {}, log } }), d);
  assert.ok(r.tasks.some((t) => t.id === 'sprint'));
  assert.match(r.tasks.find((t) => t.id === 'todayreview').title, /2 câu/);
  const fixed = [...log, { kind: 'p5', id: 'x', correct: true, date: d, src: 'today' }, { kind: 'p2', id: 'y', correct: true, date: d, src: 'today' }];
  r = buildDay(db({ drill: { items: {}, log: fixed } }), d);
  assert.ok(r.tasks.find((t) => t.id === 'todayreview').done);
  const sprint = Array.from({ length: 14 }, (_, i) => ({ kind: i < 8 ? 'p5' : 'p2', id: 's' + i, correct: true, date: d, src: 'sprint' }));
  assert.equal(countSrcToday(sprint, 'sprint', d), 14);
  assert.ok(buildDay(db({ drill: { items: {}, log: sprint } }), d).tasks.find((t) => t.id === 'sprint').done);
});

test('your own listening diagnosis overrides the automatic suggestion', () => {
  const d = db({ review: { s: { 40: { status: 'INCORRECT', chosenIdx: 0, qInfer: true, diag: 'A', diagReason: 'đọc thì hiểu nhưng nghe không ra → nghe sót âm' } } } });
  const sg = suggestFor(d, { session: 's', q: 40, part: 'P3', skipped: false });
  assert.equal(sg.code, 'A');
  assert.match(sg.reason, /tự chẩn đoán/);
});

test('saved words: upsert by word, keep first source, count saves', async () => {
  const { addSaved, savedFromErrors } = await import('../lib/vocab.js');
  let list = addSaved([], { word: 'waive', sense: 'not require', session: 's1', q: 112, part: 'P5', code: 'V' }, '2026-11-22');
  list = addSaved(list, { word: 'Waive', sense: 'to give up a right' }, '2026-11-23');
  list = addSaved(list, { word: 'ladder', sense: 'equipment' }, '2026-11-23');
  assert.equal(list.length, 2);
  assert.equal(list[0].n, 2);
  assert.equal(list[0].session, 's1');
  assert.equal(list[0].sense, 'to give up a right');
  const d = db({ vocab: { snaps: {}, rates: {}, saved: list } });
  assert.deepEqual(savedFromErrors(d, '2026-11-24').map((w) => w.word), ['waive']);
  assert.equal(savedFromErrors(d, '2026-12-10').length, 0);
});

test('daily plan adds My vocabulary review only when words came from errors', () => {
  const day = dateForDay(3, EXAM);
  const none = buildDay(db(), day);
  assert.ok(!none.tasks.some((t) => t.id === 'errwords'));
  const withWords = buildDay(db({ vocab: { snaps: {}, rates: {}, saved: [{ word: 'waive', date: day, session: 's1', q: 112 }] }, time: { [day]: { myvocab: 320 } } }), day);
  const t = withWords.tasks.find((x) => x.id === 'errwords');
  assert.ok(t, 'errwords task missing');
  assert.ok(t.link.endsWith('/my-vocabulary'));
  assert.equal(t.done, true);
});

test('reading pace: milestones and passage budgets', async () => {
  const { targets, status, passageBudget, summarize, STANDARD_P7 } = await import('../lib/pace.js');
  const t = targets();
  assert.ok(Math.abs(t[130] - 11) < 1e-9);
  assert.ok(Math.abs(t[146] - 20) < 1e-9);
  assert.ok(Math.abs(t[200] - 75) < 1e-9);
  // A triple-passage question gets more time than a single-passage one.
  assert.ok(t[187] - t[186] > t[149] - t[148]);
  // At minute 15 working on 140: plan says 139 done by ~16.2 → ahead.
  assert.ok(status(t, 140, 15).ahead > 0);
  assert.ok(status(t, 120, 15).ahead < 0);
  const triple = STANDARD_P7.find((g) => g.qs[0] === 186);
  const b = passageBudget(t, triple, { 186: 100, 187: 100, 188: 100, 189: 100, 190: 100 });
  assert.ok(b.budgetSec > 300 && b.budgetSec < 420);
  assert.equal(b.over, true);
  const half = targets(STANDARD_P7, 0.5);
  assert.ok(Math.abs(half[200] - 37.5) < 1e-9);
  const s = summarize({ 101: 20, 102: 40, 186: 100, 187: 100, 188: 100, 189: 100, 190: 100 });
  assert.equal(s.P5.avg, 30);
  assert.equal(s.over.length, 1);
});

test('P3/P4: question focus, topics, lesson matching', async () => {
  const { classifyFocus, topicsOf, matchLessons, LISTEN_FOR } = await import('../lib/listen.js');
  const cases = {
    'Who most likely is the woman?': 'who',
    'Where is the conversation most likely taking place?': 'place',
    'What will the woman most likely do next?': 'next',
    'What problem does the woman mention?': 'problem',
    'Why is the man calling?': 'topic',
    'What does the woman offer to do?': 'request',
    'How much will the man pay?': 'number',
    'When will the order be delivered?': 'time',
    'What is the purpose of the announcement?': 'topic',
    'According to the speaker, what has caused a delay?': 'reason',
    'What are listeners asked to do?': 'request',
    'Look at the graphic. Which floor will the man go to?': 'graphic',
    'Which feature is most important to the man?': 'detail',
  };
  for (const [q, f] of Object.entries(cases)) assert.equal(classifyFocus(q), f, q);
  for (const f of Object.values(cases)) assert.ok(LISTEN_FOR[f], f);
  assert.equal(topicsOf('Where is the conversation taking place? At a hotel. The flight was delayed.')[0], 'travel');
  const lessons = [
    { title: 'Hotel Booking & Airport Shuttle', dictation: null, order: 7 },
    { title: 'Fixing a Hotel Reservation', dictation: 90, order: 48 },
    { title: 'Rush Hour Gridlock', dictation: null, order: 33 },
    { title: 'Delayed Delivery Dilemma', dictation: null, order: 53 },
  ];
  const m = matchLessons('I need to change my hotel reservation before my flight.', lessons);
  assert.equal(m[0].title, 'Hotel Booking & Airport Shuttle');
  assert.ok(!m.some((l) => l.title === 'Rush Hour Gridlock'));
  assert.equal(matchLessons('The package delivery was delayed again.', lessons)[0].title, 'Delayed Delivery Dilemma');
});
