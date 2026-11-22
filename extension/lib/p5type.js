import { P5_CATS } from '../data/p5.js';

export { P5_CATS };

// Grammar type of a Part 5 question from its sentence and its four options,
// using the same type keys as the built-in drill bank (data/p5.js P5_CATS).

const PRONOUNS = new Set(['i', 'me', 'my', 'mine', 'myself', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'we', 'us', 'our', 'ours', 'ourselves', 'they', 'them', 'their', 'theirs', 'themselves', 'one', 'oneself', 'each other', 'one another', 'someone', 'anyone', 'everyone', 'no one', 'those', 'these', 'this', 'that', 'other', 'others', 'another', 'every', 'each', 'all', 'any', 'some', 'either', 'neither', 'none', 'both']);
const RELATIVES = new Set(['who', 'whom', 'whose', 'which', 'that', 'what', 'whoever', 'whichever', 'whatever', 'where', 'when', 'whereby']);
const LINKERS = new Set(['although', 'though', 'even though', 'because', 'because of', 'since', 'as', 'despite', 'in spite of', 'while', 'whereas', 'during', 'unless', 'if', 'once', 'until', 'till', 'before', 'after', 'however', 'therefore', 'moreover', 'furthermore', 'nevertheless', 'otherwise', 'so', 'so that', 'but', 'yet', 'or', 'and', 'nor', 'due to', 'owing to', 'thanks to', 'in order to', 'as soon as', 'provided that', 'in case', 'whether', 'instead of', 'rather than', 'prior to', 'according to', 'regarding', 'concerning', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'to', 'of', 'about', 'among', 'between', 'through', 'throughout', 'within', 'without', 'into', 'onto', 'upon', 'toward', 'towards', 'across', 'along', 'around', 'behind', 'beyond', 'except', 'besides', 'beside', 'above', 'below', 'under', 'over', 'near', 'against', 'past', 'like', 'unlike', 'than', 'then', 'also', 'still', 'already', 'even', 'only', 'thus', 'hence', 'meanwhile', 'consequently', 'whenever', 'wherever', 'now that', 'given', 'considering', 'following', 'pending', 'notwithstanding']);
const CORREL = new Set(['both', 'either', 'neither', 'not only', 'whether', 'but also', 'nor', 'as well as', 'such', 'too', 'enough', 'so', 'rather', 'than', 'no sooner', 'hardly']);
const COMPARE = new Set(['more', 'most', 'less', 'least', 'fewer', 'fewest', 'better', 'best', 'worse', 'worst', 'the best', 'much more', 'even more', 'many more', 'the more', 'by far', 'far', 'much', 'many', 'little', 'very', 'very more', 'so', 'well', 'good']);
const MORE_LINKERS = ['as long as', 'as far as', 'as long', 'as far', 'in case of', 'regardless of', 'if not', 'should', 'in addition to', 'as well', 'even if', 'as if', 'in spite of', 'apart from', 'along with', 'in the event that', 'so as to'];
const AUX = /^(is|are|was|were|be|been|being|has|have|had|will|would|shall|should|can|could|may|might|must|do|does|did)\b/;

for (const w of MORE_LINKERS) LINKERS.add(w);
const norm = (s) => String(s || '').toLowerCase().replace(/[.,;:!?]+$/g, '').replace(/\s+/g, ' ').trim();

function commonPrefix(words) {
  if (!words.length) return '';
  let p = words[0];
  for (const w of words) while (!w.startsWith(p)) p = p.slice(0, -1);
  return p;
}

// Strip auxiliaries/"to"/"more|most" so "has been required" and "requires" share a root.
const core = (o) => o.replace(/^(to|more|most|less|least)\s+/, '').split(' ').filter((w) => !AUX.test(w) && w !== 'not' && w !== 'to').pop() || o;

export function classifyP5(stem, options) {
  const opts = (options || []).map(norm).filter(Boolean);
  const s = norm(stem);
  if (opts.length < 2) return 'vocab';
  const share = (set) => opts.filter((o) => set.has(o)).length / opts.length;
  const count = (set) => opts.filter((o) => set.has(o)).length;
  if (/\b(either|neither|both|not only|whether|no sooner|hardly|such|so)\b/.test(s.split('_')[0] || '') && opts.some((o) => ['or', 'nor', 'and', 'but also', 'but', 'than', 'that', 'when'].includes(o))) return 'correlative';
  if (count(CORREL) >= 2 && count(COMPARE) < 3 && !opts.every((o) => LINKERS.has(o) && !CORREL.has(o))) return 'correlative';
  if (/\bas\s+_+\s+as\b/.test(s) || /\bthe\s+_+\s+\w+(er)?\b.*\bthe\s+\w+er\b/.test(s)) return 'compare';
  if (count(COMPARE) >= 2 && (/\bthan\b|\bthe\s+_+|\bof all\b|\bone of the\b/.test(s) || count(new Set(['more', 'most', 'less', 'least', 'fewer', 'better', 'best'])) >= 1)) return 'compare';
  if (share(RELATIVES) >= 0.5 && !opts.every((o) => PRONOUNS.has(o))) return 'relative';
  if (share(PRONOUNS) >= 0.75) return 'pronoun';
  if (share(LINKERS) >= 0.5) return 'prepconj';
  // Only forms of be/have → subject–verb agreement.
  if (opts.every((o) => o.split(' ').every((w) => /^(is|are|was|were|be|been|being|has|have|had)$/.test(w)))) return 'agreement';
  if (opts.some((o) => /^to\s\w+$/.test(o)) && opts.some((o) => /ing$/.test(o))) return 'verbform';
  if (opts.filter((o) => o.includes(' ') && AUX.test(o)).length >= 2) return 'tense';
  const cores = opts.map(core);
  const root = commonPrefix(cores);
  const derived = cores.filter((c) => /(ly|ful|tion|sion|ity|ive|able|ible|al|ness|ment|ous|ance|ence|ant|ent|ize|ise)$/.test(c)).length;
  const sameRoot = root.length >= 4 || (root.length >= 3 && (cores.every((c) => c.length <= 7) || derived >= 2));
  if (sameRoot) {
    if (opts.some((o) => /^(more|most|less|least)\s/.test(o) || /(er|est)$/.test(o) && !/(er)$/.test(root)) && (/\bthan\b|\bthe\s+_+|\bof all\b/.test(s) || opts.some((o) => /^(more|most)\s/.test(o)))) return 'compare';
    const multiWord = opts.filter((o) => o.includes(' ')).length;
    if (opts.some((o) => AUX.test(o)) || multiWord >= 2) return 'tense';
    if (opts.some((o) => /^to\s/.test(o))) return 'verbform';
    const suffixes = cores.map((c) => c.slice(root.length));
    const inflections = suffixes.every((x) => ['', 's', 'es', 'ed', 'd', 'ing', 'n', 'en'].includes(x));
    if (inflections) {
      // Only base vs -s forms → subject–verb agreement.
      if (suffixes.every((x) => ['', 's', 'es'].includes(x))) return 'agreement';
      return 'verbform';
    }
    return 'wordform';
  }
  return 'vocab';
}

// One-line strategy per type (what to check first, within the 15–20 s budget).
export const P5_TIPS = {
  wordform: 'Không cần dịch: nhìn chỗ trống đứng ở đâu. Trước danh từ là tính từ, sau mạo từ/sở hữu là danh từ, bổ nghĩa động từ hoặc mệnh đề đã đủ thì là trạng từ.',
  tense: 'Tìm mốc thời gian (since, by next, last, currently). Sau chỗ trống có tân ngữ thì chọn chủ động, không có thì chọn bị động.',
  agreement: 'Tìm chủ ngữ thật, bỏ qua cụm giới từ chen giữa. Danh từ số ít đi với V-s.',
  verbform: 'Xem động từ đứng trước: want/plan/agree + to V, enjoy/avoid/consider + V-ing; sau giới từ dùng V-ing.',
  prepconj: 'Sau chỗ trống là cụm danh từ thì chọn giới từ (despite, because of, during); là mệnh đề (có S + V) thì chọn liên từ (although, because, while).',
  pronoun: 'Chỗ trống trước danh từ cần tính từ sở hữu (his/their), làm tân ngữ dùng him/them, nhấn mạnh hoặc "by ___" thì dùng -self.',
  relative: 'Người thì who/whom, vật thì which/that; theo sau là danh từ sở hữu thì whose; sau dấu phẩy không dùng that.',
  compare: 'Có "than" thì dùng so sánh hơn; có "the … of/in" thì so sánh nhất. Để ý as … as.',
  correlative: 'Học theo cặp: either…or, neither…nor, both…and, not only…but also, whether…or.',
  vocab: 'Các phương án gần nghĩa: chọn theo collocation đi kèm (meet a deadline, comply with, eligible for). Ghi cụm vào My vocabulary.',
};

// Part 5 questions answered wrong (or skipped) in real Parroto tests within `days` days, counted by type.
// Types come from db.review[session][q].cat, set when the result page is opened.
export function realP5Wrong(db, dateISO, days = 21) {
  const from = new Date(dateISO + 'T00:00:00');
  from.setDate(from.getDate() - (days - 1));
  const fromISO = from.toLocaleDateString('sv-SE');
  const out = {};
  for (const r of db.results || []) {
    if (!r.session || r.date < fromISO || r.date > dateISO) continue;
    const wrong = new Set([...(r.wrongQs || []), ...(r.skippedQs || [])]);
    const rv = db.review?.[r.session] || {};
    for (const q of wrong) {
      const cat = rv[q]?.cat;
      if (q >= 101 && q <= 130 && cat) out[cat] = (out[cat] || 0) + 1;
    }
  }
  return out;
}
