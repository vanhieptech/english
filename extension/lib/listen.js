// Part 3/4 helpers: what a question asks for, what to listen for, and which Parroto
// TOEIC Listening lessons (dictation + shadowing) share the topic of a conversation.

// Order matters: the first rule that matches wins.
const RULES = [
  ['graphic', /\b(look at the graphic|graphic)\b/i],
  ['intent', /\bwhy does the (man|woman|speaker)\b.*\bsay\b|\bwhat does the (man|woman|speaker) (mean|imply)\b.*["“]/i],
  ['who', /^\s*who\b|\bwho (most likely )?(is|are)\b|\bwhat (is|are) the (man|woman|speakers?)'?s? (job|occupation|profession)\b|\bwhere (does|do) the (man|woman|speakers?|listeners?) (most likely )?work\b/i],
  ['place', /\bwhere\b/i],
  ['topic', /\b(mainly (about|discussing)|purpose of|main topic|why is the (man|woman|speaker) calling|what is the (talk|announcement|message|broadcast|conversation) (mainly )?about)\b/i],
  ['problem', /\b(problem|concern|issue|complain|wrong|difficult)/i],
  ['reason', /^\s*why\b|\breason\b|\bcaused?\b/i],
  ['time', /^\s*when\b|\bwhat time\b|\bhow long\b|\bwhat day\b|\bdeadline\b/i],
  ['number', /\bhow (much|many)\b|\bcost\b|\bprice\b|\bpercent\b|\bnumber\b/i],
  ['next', /\b(do next|will (probably|most likely)? ?(do|happen)|going to do|plan(s)? to do|what will (the )?(man|woman|speakers?|listeners?) (probably |most likely )?do)\b/i],
  ['request', /\b(ask(ed|s)? to|suggest|recommend|offer|request|advise|encourage|remind)/i],
  ['how', /^\s*how\b/i],
];

export function classifyFocus(stem) {
  for (const [k, re] of RULES) if (re.test(stem || '')) return k;
  return 'detail';
}

// What to listen for, short enough to read before the audio starts.
export const LISTEN_FOR = {
  topic: 'mục đích/chủ đề → 1–2 câu đầu',
  who: 'nghề/nơi làm → từ chỉ công việc, đồ vật, khách hàng',
  place: 'địa điểm → tên phòng, đồ vật, dịch vụ (ít khi nói thẳng)',
  problem: 'vấn đề → sau "but", "unfortunately", "I\'m afraid"',
  reason: 'lý do → sau "because", "since", "due to"',
  time: 'thời gian → ngày/giờ, coi chừng giờ bị đổi',
  number: 'con số → nghe hết, số thứ hai thường là đáp án',
  next: 'việc sắp làm → câu cuối: "I\'ll…", "Let me…"',
  request: 'đề nghị/yêu cầu → "Could you…", "Why don\'t you…", "Please…"',
  how: 'cách thức → "by…", tên phương tiện/công cụ',
  intent: 'ý câu trích → nghe ngữ cảnh trước & sau câu đó, không lấy nghĩa đen',
  graphic: 'đồ họa → nghe thông tin KHÔNG có trong phương án để dò trên hình',
  detail: 'chi tiết → đáp án thường là paraphrase, không lặp nguyên từ',
};

// Topic lexicon: keywords seen in TOEIC questions/options and in Parroto lesson titles.
const TOPICS = {
  travel: ['hotel', 'flight', 'airport', 'reservation', 'booking', 'travel', 'trip', 'tour', 'shuttle', 'check-in', 'luggage', 'cruise', 'vacation', 'ticket', 'limousine', 'upgrade'],
  office: ['office', 'meeting', 'copier', 'printer', 'conference', 'colleague', 'manager', 'remodel', 'desk', 'schedule', 'report', 'document', 'presentation', 'deadline', 'workshop'],
  hiring: ['job', 'interview', 'hire', 'hiring', 'candidate', 'position', 'internship', 'career', 'resume', 'applicant', 'recruit', 'talent', 'staff', 'employee'],
  shopping: ['store', 'sale', 'discount', 'order', 'return', 'refund', 'purchase', 'customer', 'price', 'deal', 'shop', 'jewelry', 'mattress', 'coupon'],
  delivery: ['delivery', 'shipping', 'package', 'shipment', 'supplier', 'warehouse', 'courier', 'delayed', 'deliver'],
  traffic: ['traffic', 'bridge', 'road', 'commute', 'rush hour', 'gridlock', 'parking', 'bus', 'train', 'construction', 'detour'],
  weather: ['weather', 'rain', 'snow', 'storm', 'temperature', 'forecast', 'sunny'],
  health: ['doctor', 'clinic', 'dental', 'dentist', 'patient', 'appointment', 'medical', 'pharmacy', 'insurance', 'headache'],
  food: ['restaurant', 'menu', 'coffee', 'catering', 'chef', 'dinner', 'lunch', 'brunch', 'cafe', 'kitchen'],
  events: ['festival', 'concert', 'theatre', 'theater', 'museum', 'exhibit', 'ceremony', 'fundraiser', 'donate', 'charity', 'show', 'performance', 'gallery'],
  finance: ['bank', 'account', 'loan', 'invest', 'budget', 'expense', 'payment', 'invoice', 'deposit', 'merger', 'sales'],
  property: ['apartment', 'rent', 'real estate', 'building', 'lease', 'roommate', 'architect', 'interior', 'furniture', 'renovation'],
  tech: ['computer', 'software', 'website', 'online', 'streaming', 'it ', 'system', 'app', 'device', 'repair', 'glitch'],
};

export function topicsOf(text) {
  const t = ' ' + String(text || '').toLowerCase() + ' ';
  const score = {};
  for (const [k, words] of Object.entries(TOPICS)) {
    for (const w of words) if (t.includes(w)) score[k] = (score[k] || 0) + 1;
  }
  return Object.entries(score).sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

const STOP = new Set(['the', 'and', 'for', 'with', 'what', 'does', 'will', 'most', 'likely', 'about', 'from', 'that', 'this', 'they', 'their', 'speakers', 'speaker', 'woman', 'man', 'mans', 'womans', 'listeners', 'probably', 'mention', 'mentioned', 'according', 'which', 'where', 'when', 'have', 'has', 'are', 'is', 'to', 'of', 'in', 'on', 'at', 'a', 'an', 'be', 'do', 'say', 'said', 'some']);
const tokens = (s) => String(s || '').toLowerCase().match(/[a-z][a-z-]{2,}/g)?.filter((w) => !STOP.has(w)) || [];

// Rank Parroto lessons for a conversation text. lessons: [{ title, level, dictation, shadowing, pro }].
// Lessons not yet passed (dictation < 85) come first; shared topic counts more than shared words.
export function matchLessons(text, lessons, n = 2) {
  const want = topicsOf(text);
  const words = new Set(tokens(text));
  const scored = (lessons || []).map((l) => {
    const lt = topicsOf(l.title);
    const topicScore = want.reduce((s, k, i) => s + (lt.includes(k) ? (i === 0 ? 3 : 1.5) : 0), 0);
    const wordScore = tokens(l.title).filter((w) => words.has(w)).length;
    const done = l.dictation != null && l.dictation >= 85;
    return { l, score: topicScore + wordScore - (done ? 2 : 0) };
  }).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score || (a.l.order ?? 999) - (b.l.order ?? 999));
  return scored.slice(0, n).map((x) => x.l);
}
