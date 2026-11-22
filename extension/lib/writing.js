// Self-checked sentence writing: after a vocabulary (V) or grammar (G) mistake,
// write one new sentence that uses the word / rule, then check it against a checklist.

import { addDays } from './dates.js';
import { P5 } from '../data/p5.js';

export const CHECKLIST = [
  'Dùng đúng từ / cấu trúc cần luyện, đúng loại từ ở đúng vị trí',
  'Đi đúng giới từ / collocation (vd comply with, eligible for)',
  'Đúng thì và hòa hợp chủ ngữ – động từ',
  'Câu có nghĩa tự nhiên trong bối cảnh công việc (giống câu TOEIC)',
];

const P5_BY_ID = Object.fromEntries(P5.map((q) => [q.id, q]));

function filled(q) {
  return q.s.replace('___', q.o[q.a]);
}

// Prompts waiting to be written: due or never written.
export function pendingPrompts(db, dateISO, limit = 20) {
  const items = db.drill?.items || {};
  const isOpen = (id) => !items['w:' + id] || items['w:' + id].due <= dateISO;
  const out = [];
  for (const e of [...db.errors].sort((a, b) => (a.date < b.date ? 1 : -1))) {
    if (!['V', 'G'].includes(e.code) || e.date < addDays(dateISO, -21)) continue;
    const id = 'err-' + e.id;
    if (!isOpen(id)) continue;
    out.push({
      id, src: `Sổ lỗi · ${e.part}${e.q ? ' câu ' + e.q : ''} · mã ${e.code}`,
      target: e.cause || '', model: null,
      rule: e.code === 'V' ? 'Dùng lại từ đã sai trong một câu mới, kèm từ đi cùng (collocation).' : 'Áp dụng lại quy tắc ngữ pháp đã sai trong một câu mới.',
      needsTarget: !e.cause,
    });
  }
  const wrongP5 = Object.entries(items)
    .filter(([id, it]) => id.startsWith('p5-') && it.wrong > 0)
    .sort((a, b) => (a[1].last < b[1].last ? 1 : -1));
  for (const [qid] of wrongP5) {
    const q = P5_BY_ID[qid];
    if (!q) continue;
    const id = 'p5w-' + qid;
    if (!isOpen(id)) continue;
    out.push({ id, src: 'Câu Part 5 bạn từng sai', target: q.o[q.a], model: filled(q), rule: q.why, needsTarget: false });
  }
  return out.slice(0, limit);
}

// Light automatic hints (the real check is the learner's own checklist).
export function hints(text, target) {
  const out = [];
  const t = text.trim();
  if (t.split(/\s+/).length < 6) out.push('Câu hơi ngắn – thử viết ít nhất 6–8 từ.');
  if (!/[.?!]$/.test(t)) out.push('Thiếu dấu chấm cuối câu.');
  if (!/^[A-Z]/.test(t)) out.push('Nên viết hoa chữ đầu câu.');
  if (target) {
    const words = target.toLowerCase().replace(/[^a-z' -]/g, ' ').split(/\s+/).filter((w) => w.length > 2);
    const key = words[0];
    if (key && !t.toLowerCase().includes(key)) out.push(`Câu chưa có "${target}".`);
  }
  return out;
}
