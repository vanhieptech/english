// "Why" lines: a one-line self-explanation for important wrong questions.
// Important = wrong while confident, or the error code is one of your top recurring codes
// (the two most frequent codes of the last 14 days, each with at least 3 errors).

export function recurringCodes(errors, dateISO, days = 14, min = 3) {
  const from = new Date(dateISO + 'T00:00:00');
  from.setDate(from.getDate() - (days - 1));
  const fromISO = from.toLocaleDateString('sv-SE');
  const c = {};
  for (const e of errors || []) if (e.code && e.date && e.date >= fromISO && e.date <= dateISO) c[e.code] = (c[e.code] || 0) + 1;
  return Object.entries(c).filter(([, n]) => n >= min).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
}

// null when the question is not important; otherwise a short reason.
export function importantReason(error, errors, dateISO) {
  if (!error || !error.code) return null;
  if (error.confidence === 'high') return 'sai khi tự tin';
  if (error.code === 'T') return null; // ran out of time: the fix is pacing, not an explanation
  if (recurringCodes(errors, dateISO).includes(error.code)) return `lỗi ${error.code} đang lặp lại nhiều nhất`;
  return null;
}

// Important errors still missing their why line (newest first).
export function missingWhy(errors, dateISO) {
  return (errors || []).filter((e) => !e.why && importantReason(e, errors, dateISO)).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const WHY_HINT = 'Vì sao đáp án đúng là đúng, và vì sao mình chọn sai. Vd: "Chọn B vì nghe deadline; C nói lại bằng due date → bẫy lặp từ"';
