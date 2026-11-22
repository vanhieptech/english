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
