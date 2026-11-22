// Date helpers. All dates are local-time strings "YYYY-MM-DD".

export function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function today(now = new Date()) {
  return toISO(now);
}

export function parseISO(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso, n) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

// Whole days from a to b (b - a).
export function diffDays(a, b) {
  const ms = parseISO(b) - parseISO(a);
  return Math.round(ms / 86400000);
}

// Plan day number: day 30 is the exam day.
export function planDay(dateISO, examISO) {
  return 30 - diffDays(dateISO, examISO);
}

export function dateForDay(day, examISO) {
  return addDays(examISO, day - 30);
}

export function formatVN(iso) {
  const d = parseISO(iso);
  const names = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return `${names[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function lastNDays(endISO, n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(endISO, -i));
  return out;
}
