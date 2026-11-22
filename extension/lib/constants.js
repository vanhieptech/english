// Parroto structure (checked 21/11/2026) and study vocabulary.

export const PARROTO = 'https://parroto.app';

export const SETS = [
  { slug: 'parroto-toeic-vol-1', name: 'Parroto Vol.1' },
  { slug: 'toeic-2026', name: 'TOEIC 2026' },
  { slug: 'toeic-2024', name: 'TOEIC 2024' },
  { slug: 'toeic-2023', name: 'TOEIC 2023' },
];

export function setName(slug) {
  return SETS.find((s) => s.slug === slug)?.name || slug;
}

export const LINKS = {
  exams: `${PARROTO}/exams/toeic`,
  analytics: `${PARROTO}/exams/toeic/analytics`,
  history: `${PARROTO}/exams/toeic/history`,
  result: (session) => `${PARROTO}/exams/toeic/session/${session}/result`,
  listeningTopic: `${PARROTO}/topics/toeic-listening`,
  vocabulary: `${PARROTO}/vocabulary`,
  myVocabulary: `${PARROTO}/my-vocabulary`,
  games: `${PARROTO}/games`,
  test: (set, n) => `${PARROTO}/exams/toeic/${set}-test-${n}`,
  dictation: (slug) => `${PARROTO}/lessons/dictation/${slug}`,
  shadowing: (slug) => `${PARROTO}/lessons/shadowing/${slug}`,
};

export const PARTS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];
export const LISTENING_PARTS = ['P1', 'P2', 'P3', 'P4'];
export const READING_PARTS = ['P5', 'P6', 'P7'];
export const PART_SIZE = { P1: 6, P2: 25, P3: 39, P4: 30, P5: 30, P6: 16, P7: 54 };
export const PART_NAME = {
  P1: 'Mô tả tranh',
  P2: 'Hỏi – đáp',
  P3: 'Hội thoại',
  P4: 'Bài nói',
  P5: 'Điền câu',
  P6: 'Điền đoạn',
  P7: 'Đọc hiểu',
};

// Error codes from the research report.
export const CODES = {
  V: { name: 'Từ vựng', action: 'Lưu từ vào Saved Vocabulary trên Parroto, ôn bằng SRS + Word Rain' },
  G: { name: 'Ngữ pháp', action: 'Học lại quy tắc, làm thêm 1 bộ P5 ở Practice Mode' },
  A: { name: 'Nghe sót âm', action: 'Dictation lại đúng đoạn đó; Spelling Bee cho từ hay nghe nhầm' },
  D: { name: 'Dính bẫy', action: 'Làm thêm 1 bộ P2 Practice Mode, soi đúng dạng bẫy' },
  P: { name: 'Không nhận ra paraphrase', action: 'Ghi cặp paraphrase (cụm trong bài ↔ cụm trong đáp án)' },
  I: { name: 'Suy luận sai', action: 'Đọc lại câu hỏi suy luận, tìm câu làm căn cứ' },
  T: { name: 'Hết giờ', action: 'Hôm sau bấm giờ chặt hơn 10%' },
  C: { name: 'Bất cẩn', action: 'Đọc lại câu sai trước buổi sau, không thêm bài' },
  Q: { name: 'Hiểu sai câu hỏi', action: 'Gạch từ hỏi + danh từ khóa trước khi chọn' },
};

// Redo schedule in days after logging, per stage.
export const REDO_STEPS = [2, 7];

// Parroto lesson URL slug from a title (confirmed when you open the lesson page).
export function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Question number ranges per part (same numbering in Parroto as in the real test).
export const PART_RANGES = { P1: [1, 6], P2: [7, 31], P3: [32, 70], P4: [71, 100], P5: [101, 130], P6: [131, 146], P7: [147, 200] };

export function partOfQuestion(q) {
  for (const [p, [a, b]] of Object.entries(PART_RANGES)) if (q >= a && q <= b) return p;
  return null;
}

// "TOEIC 2023 - Test 10" / "Parroto TOEIC Practice Vol. 1 - Test 1" -> { set, test }
export function parseTestName(name) {
  const m = String(name).match(/^(.*?)\s*-\s*Test\s+(\d+)\s*$/i);
  if (!m) return null;
  const base = m[1].trim();
  const known = { 'TOEIC 2026': 'toeic-2026', 'TOEIC 2024': 'toeic-2024', 'TOEIC 2023': 'toeic-2023', 'Parroto TOEIC Practice Vol. 1': 'parroto-toeic-vol-1' };
  return { set: known[base] || slugify(base), test: Number(m[2]) };
}

// "11/21/2026" (Parroto history, M/D/Y) -> "2026-11-21"
export function parseUSDate(s) {
  const m = String(s).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}
