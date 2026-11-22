// Vocabulary progress read from Parroto:
//  - rating clicks (Again / Hard / Good / Easy / Master) counted live while studying on the web,
//  - snapshots of the "Learning Statistics" box on parroto.app/vocabulary (account-wide, so they
//    also include study done in the Parroto phone app).
// db.vocab = { snaps: { 'YYYY-MM-DD': { first: {...}, last: {...} } }, rates: { 'YYYY-MM-DD': { Again, Hard, Good, Easy, Master, total } } }

export const RATINGS = ['Again', 'Hard', 'Good', 'Easy', 'Master'];

// Latest snapshot taken before the given date (the baseline for today's deltas).
function baseline(vocab, dateISO) {
  const days = Object.keys(vocab?.snaps || {}).filter((d) => d < dateISO).sort();
  return days.length ? vocab.snaps[days[days.length - 1]].last : null;
}

export function vocabDay(db, dateISO) {
  const v = db.vocab || {};
  const today = v.snaps?.[dateISO];
  const clicks = v.rates?.[dateISO]?.total || 0;
  const base = baseline(v, dateISO) || today?.first || null;
  const last = today?.last || null;
  let newWords = null;
  let statReviews = null;
  if (last && base) {
    newWords = Math.max(0, last.totalCards - base.totalCards);
    statReviews = Math.max(0, last.totalReviews - base.totalReviews);
  }
  return {
    reviews: Math.max(clicks, statReviews || 0),
    clicks,
    newWords,
    due: last ? last.due : null,
    updatedAt: last ? last.at : null,
    hasSnapshot: !!last,
    totals: last,
  };
}

// New words for a day: the larger of what you typed and what Parroto's statistics show.
export function newWordsOn(db, dateISO) {
  const manual = db.daily?.[dateISO]?.newWords || 0;
  const auto = vocabDay(db, dateISO).newWords || 0;
  return Math.max(manual, auto);
}

export function reviewsOn(db, dateISO) {
  const manual = db.daily?.[dateISO]?.srsReviewed || 0;
  return Math.max(manual, vocabDay(db, dateISO).reviews);
}

// Overdue cards: typed value first, else Parroto's "Due" count.
export function overdueOn(db, dateISO) {
  const manual = db.daily?.[dateISO]?.overdue;
  if (manual != null) return manual;
  return vocabDay(db, dateISO).due;
}

// Words saved with Parroto's Dictionary (they go to Parroto's My vocabulary).
// db.vocab.saved = [{ word, sense, date, session, q, part, code, n }]; session/q are set when saved from a wrong question.
export function addSaved(list, entry, dateISO) {
  const out = [...(list || [])];
  const i = out.findIndex((w) => w.word.toLowerCase() === entry.word.toLowerCase());
  if (i >= 0) {
    const prev = out[i];
    out[i] = { ...prev, sense: entry.sense || prev.sense, session: prev.session || entry.session, q: prev.q || entry.q, part: prev.part || entry.part, code: prev.code || entry.code, n: (prev.n || 1) + 1 };
  } else {
    out.push({ word: entry.word, sense: entry.sense || '', date: dateISO, session: entry.session || null, q: entry.q || null, part: entry.part || null, code: entry.code || null, n: 1 });
  }
  return out;
}

// Words from wrong questions saved in the last `days` days (what the review task focuses on).
export function savedFromErrors(db, dateISO, days = 14) {
  const from = new Date(dateISO + 'T00:00:00');
  from.setDate(from.getDate() - (days - 1));
  const fromISO = from.toLocaleDateString('sv-SE');
  return (db.vocab?.saved || []).filter((w) => w.session && w.date >= fromISO && w.date <= dateISO);
}
