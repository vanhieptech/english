// Turn a Parroto result page (as read by the content script) into a result record,
// and derive the wrong questions that still need an error code.

import { parseTestName, partOfQuestion, LISTENING_PARTS, READING_PARTS, PARTS } from './constants.js';

export function toResult(raw, dateISO) {
  const t = parseTestName(raw.testName) || { set: 'unknown', test: 0 };
  const parts = raw.parts || {};
  const names = Object.keys(parts).sort();
  const same = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
  const r = {
    id: 's:' + raw.session,
    session: raw.session,
    auto: true,
    date: dateISO,
    set: t.set,
    test: t.test,
    mode: raw.mode,
    minutes: raw.minutes ?? null,
    tags: raw.tags || [],
    wrongQs: raw.qmap?.wrong || [],
    skippedQs: raw.qmap?.skipped || [],
  };
  if (raw.mode === 'test' && same(names, PARTS) && raw.L != null && raw.R != null) {
    r.kind = 'full';
    r.L = raw.L;
    r.R = raw.R;
    r.parts = parts;
  } else if (names.length === 1) {
    r.kind = 'part';
    r.part = names[0];
    r.correct = parts[names[0]].correct;
    r.total = parts[names[0]].total;
  } else if (same(names, LISTENING_PARTS)) {
    r.kind = 'halfL';
    r.parts = parts;
  } else if (same(names, READING_PARTS)) {
    r.kind = 'halfR';
    r.parts = parts;
  } else {
    r.kind = 'multi';
    r.parts = parts;
  }
  return r;
}

export function errorKey(session, q) {
  return `${session}|${q}`;
}

// Wrong / skipped questions from auto results not yet coded or dismissed.
export function pendingErrors(db) {
  const coded = new Set(db.errors.map((e) => e.srcKey).filter(Boolean));
  const dismissed = new Set(db.ignore?.errorKeys || []);
  const out = [];
  for (const r of db.results) {
    if (!r.auto) continue;
    const add = (q, skipped) => {
      const key = errorKey(r.session, q);
      if (coded.has(key) || dismissed.has(key)) return;
      out.push({ key, session: r.session, set: r.set, test: r.test, part: partOfQuestion(q), q, skipped, date: r.date });
    };
    for (const q of r.wrongQs || []) add(q, false);
    for (const q of r.skippedQs || []) add(q, true);
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.q - b.q));
}

// History entries whose result page has not been read yet.
export function missingFromHistory(db) {
  const have = new Set(db.results.filter((r) => r.session).map((r) => r.session));
  const ignored = new Set(db.ignore?.sessions || []);
  return (db.parroto?.history || []).filter((h) => !have.has(h.session) && !ignored.has(h.session));
}
