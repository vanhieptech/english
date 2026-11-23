// 30-day plan (from research/parroto-playbook.md) and the daily task builder.

import { planDay, addDays } from './dates.js';
import { LINKS, SETS, setName, LISTENING_PARTS, READING_PARTS, PART_SIZE } from './constants.js';
import { adjustments, weakestPart, dueErrors, weekSummary } from './rules.js';
import { countToday, wrongToday, countSrcToday } from './drill.js';
import { vocabDay, newWordsOn, reviewsOn, savedFromErrors } from './vocab.js';
import { pendingPrompts } from './writing.js';
import { isCheckpoint } from './progress.js';

// L / R: parts to drill ('weak' = weakest part of that section), or a special string.
// special: full | halfL | halfR | taper | exam
// vocab: new | review | last-new | none
export const PLAN = {
  1: { special: 'full', fullNo: 1, vocab: 'new', note: 'Đề chẩn đoán. Chữa 1,5–2 giờ, chọn 2–3 Part yếu nhất.' },
  2: { L: ['P1', 'P2'], Lnote: 'Bẫy being/been, từ gần âm', R: ['P5'], Rnote: 'Từ loại theo vị trí', vocab: 'new' },
  3: { L: ['P2'], Lnote: 'Phân loại câu hỏi WH / Yes-No / lựa chọn / đề nghị; mã bẫy', R: ['P5'], Rnote: 'Thì, bị động, hòa hợp chủ–vị', vocab: 'new' },
  4: { L: ['P2', 'P1'], Lnote: 'Câu trả lời gián tiếp', R: ['P5'], Rnote: 'to-V / V-ing / V nguyên mẫu / V3', vocab: 'new' },
  5: { L: ['P3'], Lnote: 'Đọc 3 câu hỏi trong 8–10 giây', R: ['P5'], Rnote: 'Giới từ vs liên từ, từ nối', vocab: 'new' },
  6: { L: ['P4'], Lnote: 'Nhận diện thể loại bài nói', R: ['P5', 'P6'], Rnote: 'Đại từ, mệnh đề quan hệ; làm quen P6', vocab: 'new' },
  7: { L: ['P3'], Lnote: 'Thêm 1 bài YouTube giọng Anh/Úc', R: ['P5'], Rnote: 'So sánh, tương liên, phân từ + đọc bấm giờ', vocab: 'review', weekly: true },
  8: { special: 'full', fullNo: 2, vocab: 'review' },
  9: { L: ['P3'], Lnote: 'Hội thoại 3 người + câu đồ họa', R: ['P5', 'P7'], Rnote: 'P5 bấm 11 phút; P7 đoạn đơn', vocab: 'new' },
  10: { L: ['P4'], Lnote: 'Câu ngụ ý "Why does the speaker say…"', R: ['P7'], Rnote: 'Ghi cặp paraphrase', vocab: 'new' },
  11: { L: ['P2', 'P3'], Lnote: '', R: ['P6'], Rnote: 'Câu chèn: phép thử "sandwich"', vocab: 'new' },
  12: { L: ['P4'], Lnote: 'Ưu tiên giọng Anh/Úc', R: ['P5', 'P7'], Rnote: 'Collocation, cặp dễ nhầm; P7 câu NOT/EXCEPT', vocab: 'new' },
  13: { L: ['weak'], Lnote: '', R: ['P7'], Rnote: 'Đoạn kép', vocab: 'new' },
  14: { special: 'halfL', halfTest: 7, R: 'redo', vocab: 'review', weekly: true },
  15: { special: 'full', fullNo: 3, vocab: 'review', note: 'Làm đúng giờ ca thi thật.' },
  16: { L: ['P3', 'P4'], Lnote: 'Hồi phục sau câu mất (không đổ dây chuyền)', R: ['P7'], Rnote: 'Đoạn ba, liên kết chéo', vocab: 'new' },
  17: { L: ['P2', 'P1'], Lnote: '', R: ['P5', 'P6', 'P7'], Rnote: 'P5+P6 trong 20 phút, rồi P7 đa đoạn', vocab: 'new' },
  18: { L: 'redo', Lnote: 'Dictation lại các đoạn đã sai trong đề #3', special: 'halfR', halfTest: 8, vocab: 'new' },
  19: { L: ['weak'], Lnote: '', R: ['P7'], Rnote: 'Câu suy luận + câu chèn', vocab: 'new' },
  20: { special: 'halfL', halfTest: 9, R: ['P5'], Rnote: 'Tốc độ', vocab: 'new' },
  21: { L: 'redo', R: 'redo', vocab: 'review', weekly: true, note: 'Chốt 2 mã lỗi trọng tâm cho tuần cuối.' },
  22: { special: 'full', fullNo: 4, vocab: 'review' },
  23: { L: ['weak'], Lnote: '', R: ['P7'], Rnote: 'Tốc độ', vocab: 'new' },
  24: { L: ['weak'], Lnote: '', special: 'halfR', halfTest: 10, vocab: 'new' },
  25: { special: 'full', fullNo: 5, vocab: 'last-new', note: 'Ngày cuối học từ mới.' },
  26: { L: 'redo', R: 'redo', vocab: 'review' },
  27: { special: 'full', fullNo: 6, vocab: 'review', note: 'Làm đúng giờ ca thi thật.' },
  28: { L: ['P2'], Lnote: 'Khởi động, nghe nhẹ', R: ['P5'], Rnote: 'Một bộ nhanh', vocab: 'review', note: 'Đọc lại sổ lỗi.' },
  29: { special: 'taper', vocab: 'none' },
  30: { special: 'exam', vocab: 'none' },
};

export function phaseOf(day) {
  if (day <= 7) return 'Nền tảng';
  if (day <= 14) return 'Luyện điểm yếu';
  if (day <= 21) return 'Tốc độ và tích hợp';
  return 'Thi thử và giảm tải';
}

function setOrder(day) {
  if (day <= 14) return ['parroto-toeic-vol-1', 'toeic-2024', 'toeic-2023'];
  if (day <= 21) return ['toeic-2024', 'toeic-2023', 'parroto-toeic-vol-1'];
  return ['toeic-2023', 'toeic-2024', 'parroto-toeic-vol-1'];
}

function addMin(hhmm, min) {
  const [h, m] = hhmm.split(':').map(Number);
  const t = h * 60 + m + min;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

// Which set/test/part combos are already used or reserved on other days.
function usedCombos(db, dateISO) {
  const used = new Set();
  for (const r of db.results) {
    if (r.kind === 'part' && r.set && r.test && r.part) used.add(`${r.set}|${r.test}|${r.part}`);
    if (r.set && r.test && r.parts) for (const p of Object.keys(r.parts)) used.add(`${r.set}|${r.test}|${p}`);
  }
  for (const [d, tasks] of Object.entries(db.assign || {})) {
    if (d === dateISO) continue;
    for (const a of Object.values(tasks)) for (const p of a.parts || []) used.add(`${a.set}|${a.test}|${p}`);
  }
  return used;
}

function pickTest(parts, day, used) {
  for (const set of setOrder(day)) {
    for (let t = 1; t <= 10; t++) {
      if (parts.every((p) => !used.has(`${set}|${t}|${p}`))) return { set, test: t, parts };
    }
  }
  return { set: setOrder(day)[0], test: 1, parts };
}

function lessonList(db) {
  return Object.values(db.lessons || {}).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}

export function lessonsTouched(db, dateISO) {
  return lessonList(db).filter((l) => l.updated && (l.updated.dictation === dateISO || l.updated.shadowing === dateISO)).length;
}

export function nextLessons(db) {
  const list = lessonList(db);
  return {
    dictation: list.filter((l) => l.dictation == null),
    shadow: list.filter((l) => l.dictation != null && l.dictation >= 85 && l.shadowing == null),
    retry: list.filter((l) => l.dictation != null && l.dictation < 85),
    total: list.length,
  };
}

function resultsOn(db, dateISO) {
  return db.results.filter((r) => r.date === dateISO);
}

function partsLogged(db, dateISO, parts) {
  const today = resultsOn(db, dateISO);
  return parts.every((p) => today.some((r) => (r.kind === 'part' && r.part === p) || (r.parts && r.parts[p])));
}

function sec(db, dateISO, cat) {
  return (db.time[dateISO] || {})[cat] || 0;
}

// Build the task list for one date.
// Returns { day, phase, plan, tasks, adjustments, notices, newAssign }.
export function buildDay(db, dateISO) {
  const s = db.settings;
  const notices = [];
  if (!s.examDate) return { day: null, tasks: [], adjustments: [], notices: ['Chưa có ngày thi. Vào tab Cài đặt để nhập.'], newAssign: null };

  let day = planDay(dateISO, s.examDate);
  if (day > 30) return { day, tasks: [], adjustments: [], notices: ['Ngày thi đã qua. Cập nhật ngày thi mới trong Cài đặt nếu thi lại.'], newAssign: null };
  let preview = false;
  if (day < 1) {
    notices.push(`Còn ${1 - day} ngày nữa mới tới ngày 1 của lộ trình. Dưới đây là việc của ngày 1: làm đề chẩn đoán sớm càng tốt.`);
    day = 1;
    preview = true;
  }
  const plan = PLAN[day];
  const adj = day >= 9 && day <= 28 ? adjustments(db, dateISO) : [];
  const eff = Object.assign({}, ...adj.map((a) => a.effect));
  const assignToday = { ...(db.assign?.[dateISO] || {}) };
  const used = usedCombos(db, dateISO);
  let assignChanged = false;
  const done = db.daily[dateISO]?.done || {};
  const tasks = [];

  const assignFor = (id, parts) => {
    if (!assignToday[id]) {
      assignToday[id] = pickTest(parts, day, used);
      for (const p of parts) used.add(`${assignToday[id].set}|${assignToday[id].test}|${p}`);
      assignChanged = true;
    }
    return assignToday[id];
  };

  const add = (t) => {
    const manual = !!done[t.id];
    tasks.push({ ...t, done: manual || !!t.autoDone, manual });
  };

  const hasFull = db.results.some((r) => r.kind === 'full');
  if (day > 1 && !hasFull && !preview) {
    notices.push('Chưa có đề full nào. Nên làm đề chẩn đoán (TOEIC 2026 Test 1, Test Mode) sớm nhất có thể.');
  }

  const due = dueErrors(db.errors, dateISO);
  const st = s.studyStart;
  const ev = s.eveningStart;

  if (plan.special === 'exam') {
    add({ id: 'exam', time: st, title: 'Ngày thi', detail: 'Mang CCCD/hộ chiếu bản gốc + phiếu dự thi. Đi vệ sinh trước khi vào phòng. Chỉnh âm lượng tai nghe ở bước kiểm tra âm.', minutes: 120 });
    return { day, phase: phaseOf(day), plan, tasks, adjustments: [], notices, newAssign: null };
  }

  if (plan.special === 'taper') {
    add({ id: 'srs', time: st, title: 'Ôn thẻ từ đến hạn', detail: 'Không học từ mới.', minutes: 20, link: LINKS.vocabulary, autoDone: sec(db, dateISO, 'vocab') >= 600 || reviewsOn(db, dateISO) > 0 });
    add({ id: 'dict', time: addMin(st, 20), title: '1 bài dictation khởi động', minutes: 15, link: LINKS.listeningTopic, autoDone: lessonsTouched(db, dateISO) >= 1 });
    add({ id: 'p5', time: addMin(st, 35), title: '10 câu P5 nhẹ', minutes: 10, link: LINKS.exams });
    add({ id: 'prep', time: ev, title: 'Chuẩn bị giấy tờ, ngủ sớm', detail: 'CCCD/hộ chiếu bản gốc (không bản sao, không căn cước điện tử) + phiếu dự thi.', minutes: 10 });
    return { day, phase: phaseOf(day), plan, tasks, adjustments: [], notices, newAssign: null };
  }

  // Morning warm-up (every non-exam day)
  add({
    id: 'srs', time: st, title: 'Ôn tất cả thẻ từ đến hạn',
    detail: vocabDetail(db, dateISO),
    minutes: 20, link: LINKS.vocabulary, linkLabel: 'Mở Vocabulary',
    autoDone: srsDone(db, dateISO), input: 'srs', progress: vocabProgress(db, dateISO),
  });
  add({
    id: 'redo', time: addMin(st, 20), title: `Làm lại câu sai đến hạn (${due.length})`,
    detail: due.length ? 'Không xem giải thích trước. Xem danh sách ở tab Sổ lỗi.' : 'Không có câu nào đến hạn.',
    minutes: due.length ? 10 : 0, tab: 'errors', autoDone: due.length === 0,
  });

  if (plan.special === 'full') {
    const test = { set: 'toeic-2026', test: plan.fullNo, parts: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'] };
    if (!assignToday.full) { assignToday.full = test; assignChanged = true; }
    add({
      id: 'full', time: addMin(st, 30), title: `Đề full #${plan.fullNo}: TOEIC 2026 Test ${plan.fullNo}`,
      detail: 'Test Mode, chọn đủ 7 Part. Không pause, không giấy nháp, làm trên laptop. Xong thì ghi điểm ở tab Ghi kết quả.',
      minutes: 120, link: LINKS.test('toeic-2026', plan.fullNo), linkLabel: 'Mở đề',
      autoDone: resultsOn(db, dateISO).some((r) => r.kind === 'full'),
    });
    add({
      id: 'fullreview', time: addMin(st, 165), title: 'Chữa đề 1,5–2 giờ',
      detail: 'Practice Mode + giải thích. Ghi MỌI câu sai và câu đoán trúng vào sổ lỗi kèm mã.' + (plan.note ? ' ' + plan.note : ''),
      minutes: 105, tab: 'errors',
    });
    add({ id: 'srs-pm', time: ev, title: 'Ôn thẻ từ buổi tối (20 phút)', detail: 'Không học từ mới ngày làm đề.', minutes: 20, link: LINKS.vocabulary });
  } else {
    // Listening block
    if (plan.special === 'halfL') {
      const a = assignToday.halfL || (assignToday.halfL = { set: 'toeic-2026', test: plan.halfTest, parts: LISTENING_PARTS }, assignChanged = true, assignToday.halfL);
      add({
        id: 'halfL', time: addMin(st, 30), title: `Nửa đề Listening: TOEIC 2026 Test ${a.test}`,
        detail: 'Test Mode, chỉ chọn P1–P4 (45 phút). Chữa ngay sau đó, ghi lỗi.', minutes: 75,
        link: LINKS.test(a.set, a.test), linkLabel: 'Mở đề', autoDone: partsLogged(db, dateISO, LISTENING_PARTS),
      });
    } else if (plan.L === 'redo') {
      add({ id: 'Lredo', time: addMin(st, 30), title: 'Listening: làm lại các câu nghe sai', detail: plan.Lnote || 'Mở lại các câu Listening trong sổ lỗi, dictation lại đoạn chứa đáp án.', minutes: 40, tab: 'errors' });
    } else if (Array.isArray(plan.L)) {
      let parts = plan.L;
      let why = '';
      if (parts.includes('weak')) {
        const w = weakestPart(db, dateISO, 'L');
        parts = [w.part];
        why = ` (Part yếu nhất: ${w.reason})`;
      }
      const a = assignFor('L', parts);
      const q = parts.reduce((n, p) => n + PART_SIZE[p], 0);
      add({
        id: 'L', time: addMin(st, 30), title: `Listening ${parts.join(' + ')}: ${setName(a.set)} Test ${a.test}`,
        detail: `Practice Mode, Select Parts → ${parts.join(', ')} (${q} câu). ${plan.Lnote || ''}${why}`.trim(),
        minutes: 20, link: LINKS.test(a.set, a.test), linkLabel: 'Mở đề', autoDone: partsLogged(db, dateISO, parts),
      });
      add({ id: 'Lreview', time: addMin(st, 50), title: 'Chấm + gắn mã lỗi phần nghe', detail: 'Đọc giải thích, ghi câu sai và câu đoán trúng.', minutes: 10, tab: 'errors' });
    }

    // Dictation / shadowing
    const nDict = eff.dictation || s.dictationPerDay;
    const nl = nextLessons(db);
    const target = nDict + (nl.shadow.length ? 1 : 0);
    let link = LINKS.listeningTopic;
    let detail = `${nDict} bài dictation (đạt ≥ 85/100 mới shadowing).`;
    if (nl.total === 0) {
      detail += ' Mở trang TOEIC Listening một lần để extension đọc danh sách bài và điểm.';
    } else {
      const parts = [];
      if (nl.dictation[0]) parts.push(`Bài tiếp theo: "${nl.dictation[0].title}"`);
      if (nl.shadow[0]) parts.push(`Shadowing: "${nl.shadow[0].title}"`);
      if (parts.length) detail += ' ' + parts.join('. ') + '.';
      if (nl.dictation[0]) link = LINKS.dictation(nl.dictation[0].slug);
    }
    add({
      id: 'dict', time: addMin(st, 60), title: `Dictation ${nDict} bài${nl.shadow.length ? ' + shadowing 1 bài' : ''}`,
      detail, minutes: 20, link, linkLabel: 'Mở bài', autoDone: lessonsTouched(db, dateISO) >= target,
      progress: `${lessonsTouched(db, dateISO)}/${target}`,
    });

    // Reading block
    if (plan.special === 'halfR') {
      const a = assignToday.halfR || (assignToday.halfR = { set: 'toeic-2026', test: plan.halfTest, parts: READING_PARTS }, assignChanged = true, assignToday.halfR);
      add({
        id: 'halfR', time: addMin(st, 90), title: `Nửa đề Reading: TOEIC 2026 Test ${a.test}`,
        detail: 'Test Mode, chỉ chọn P5–P7 (75 phút). Mốc: hết P5 ở 0:11, hết P6 ở 0:20, câu 175 ở 0:45. Không giấy nháp.',
        minutes: 75, link: LINKS.test(a.set, a.test), linkLabel: 'Mở đề', autoDone: partsLogged(db, dateISO, READING_PARTS),
      });
    } else if (plan.R === 'redo') {
      add({ id: 'Rredo', time: addMin(st, 90), title: 'Reading: làm lại các câu đọc sai', detail: 'Mở lại các câu Reading trong sổ lỗi ở Practice Mode.', minutes: 40, tab: 'errors' });
    } else if (Array.isArray(plan.R)) {
      let parts = plan.R;
      let why = '';
      if (parts.includes('weak')) {
        const w = weakestPart(db, dateISO, 'R');
        parts = [w.part];
        why = ` (Part yếu nhất: ${w.reason})`;
      }
      const a = assignFor('R', parts);
      const q = parts.reduce((n, p) => n + PART_SIZE[p], 0);
      const p5min = eff.p5Minutes || 11;
      add({
        id: 'R', time: addMin(st, 90), title: `Reading ${parts.join(' + ')}: ${setName(a.set)} Test ${a.test}`,
        detail: `Practice Mode, Select Parts → ${parts.join(', ')} (${q} câu). Trên màn hình, không giấy nháp.${parts.includes('P5') ? ` P5 trong ${p5min} phút.` : ''} ${plan.Rnote || ''}${why}`.trim(),
        minutes: 50, link: LINKS.test(a.set, a.test), linkLabel: 'Mở đề', autoDone: partsLogged(db, dateISO, parts),
      });
    }

    add({
      id: 'review', time: addMin(st, 130), title: 'Chữa + ghi lỗi + cặp paraphrase',
      detail: 'Lưu từ mới vào Saved Vocabulary. Ghi 2 phút: hôm nay sai gì, vì sao.' + (plan.note ? ' ' + plan.note : ''),
      minutes: 35, tab: 'errors',
    });

    // Extra practice from adjustment rules
    const extra = [...new Set(adj.map((x) => x.effect.extraPart).filter(Boolean))];
    for (const p of extra) {
      const a = assignFor('X' + p, [p]);
      add({
        id: 'X' + p, time: addMin(st, 165), title: `Thêm: ${p} ${setName(a.set)} Test ${a.test}`,
        detail: 'Do quy tắc điều chỉnh (xem lý do bên dưới). Practice Mode.', minutes: 20,
        link: LINKS.test(a.set, a.test), linkLabel: 'Mở đề', autoDone: partsLogged(db, dateISO, [p]), extra: true,
      });
    }

    // Evening vocabulary
    const allowNew = (plan.vocab === 'new' || plan.vocab === 'last-new') && !eff.pauseNew;
    if (allowNew) {
      add({
        id: 'new', time: ev, title: `Học ${s.newWordsPerDay} từ mới`, detail: (plan.vocab === 'last-new' ? 'Ngày cuối học từ mới. ' : '') + 'Theo chủ đề, không xếp từ đồng nghĩa cùng lô. Extension tự đếm từ mới khi bạn mở lại trang Vocabulary trên Parroto sau khi học (tính cả học trên điện thoại).',
        minutes: 25, link: LINKS.vocabulary, linkLabel: 'Mở Vocabulary', autoDone: newWordsOn(db, dateISO) >= s.newWordsPerDay, input: 'new',
        progress: `${newWordsOn(db, dateISO)}/${s.newWordsPerDay} từ`,
      });
    } else {
      add({ id: 'new', time: ev, title: 'Ôn thẻ từ (không học từ mới)', detail: eff.pauseNew ? 'Tạm dừng từ mới vì quá nhiều thẻ quá hạn.' : 'Theo lộ trình hôm nay chỉ ôn.', minutes: 20, link: LINKS.vocabulary });
    }
    const p5n = countToday(db.drill?.log, 'p5', dateISO);
    const p2n = countToday(db.drill?.log, 'p2', dateISO);
    const p5target = eff.extraPart === 'P5' || adj.some((x) => x.id === 'code-G') ? 20 : 10;
    add({
      id: 'drill', time: addMin(ev, 30), title: `Luyện nhanh: ${p5target} câu P5 + 10 câu P2`,
      detail: 'Trong tab Luyện của extension. P5 ưu tiên dạng ngữ pháp bạn sai nhiều; P2 luyện nhận diện bẫy bằng giọng đọc Mỹ/Anh/Úc.',
      minutes: p5target === 20 ? 15 : 10, tab: 'drill', autoDone: p5n >= p5target && p2n >= 10, progress: `P5 ${p5n}/${p5target} · P2 ${p2n}/10`,
    });
    // Step 4 drills: simulator on Part 6/7 days, fast question reading on Part 3/4 days, paraphrase from day 9.
    const dlog = db.drill?.log || [];
    const todayN = (k) => dlog.filter((e) => e.kind === k && e.date === dateISO).length;
    const rParts = Array.isArray(plan.R) ? plan.R : [];
    const lParts = Array.isArray(plan.L) ? plan.L : [];
    if (rParts.some((p) => p === 'P6' || p === 'P7')) {
      add({
        id: 'sim', time: addMin(st, 140), title: 'Mô phỏng Reading thi máy (Mini Reading)',
        detail: 'Tab Luyện → Mô phỏng Reading. Làm trên màn hình, không giấy nháp; dùng highlight và Mark for review như phòng thi.',
        minutes: 20, tab: 'drill', autoDone: todayN('sim') >= 1,
      });
    }
    if (lParts.some((p) => p === 'P3' || p === 'P4') || plan.special === 'halfL') {
      add({
        id: 'flash', time: addMin(st, 55), title: 'Đọc nhanh câu hỏi P3/4 (5 bộ)',
        detail: 'Tab Luyện → Đọc nhanh câu hỏi. Tập nắm câu hỏi trong vài giây như thi máy.',
        minutes: 5, tab: 'drill', autoDone: todayN('p34') >= 15, progress: `${todayN('p34')}/15`,
      });
    }
    if (day >= 9) {
      add({
        id: 'para', time: addMin(ev, 40), title: 'Paraphrase: 10 cặp',
        detail: 'Tab Luyện → Paraphrase. Thêm cặp từ câu sai của bạn (mã P) để ôn lại.',
        minutes: 5, tab: 'drill', autoDone: todayN('para') >= 10, progress: `${todayN('para')}/10`,
      });
    }
    // v0.9 intensity: weakness sprint every study day, and a review of today's wrong drill items.
    const sprintN = countSrcToday(dlog, 'sprint', dateISO);
    add({
      id: 'sprint', time: addMin(st, 150), title: 'Weakness sprint (8 P5 + 6 P2)',
      detail: 'Tab Luyện → Cường độ cao. Tự chọn dạng Part 5 và loại câu Part 2 bạn yếu nhất 14 ngày qua.',
      minutes: 12, tab: 'drill', autoDone: sprintN >= 14, progress: `${Math.min(sprintN, 14)}/14`,
    });
    const wrongNow = wrongToday(dlog, 'p5', dateISO).length + wrongToday(dlog, 'p2', dateISO).length;
    const reviewedN = countSrcToday(dlog, 'today', dateISO);
    if (wrongNow > 0 || reviewedN > 0) {
      add({
        id: 'todayreview', time: addMin(ev, 45), title: `Ôn lỗi hôm nay${wrongNow ? ` (${wrongNow} câu còn sai)` : ''}`,
        detail: 'Tab Luyện → Ôn lỗi hôm nay. Hỏi lại mọi câu luyện bạn làm sai trong ngày, trước khi ngủ.',
        minutes: 5, tab: 'drill', autoDone: reviewedN > 0 && wrongNow === 0,
      });
    }
    const wPend = pendingPrompts(db, dateISO).length;
    const wDone = todayN('write');
    if (wPend + wDone > 0) {
      const target = Math.min(3, wPend + wDone);
      add({
        id: 'write', time: addMin(st, 160), title: `Viết câu tự chấm (${target} câu)`,
        detail: 'Tab Luyện → Viết câu tự chấm. Mỗi lỗi V/G và câu Part 5 làm sai: viết 1 câu mới, tự chấm theo 4 tiêu chí.',
        minutes: 5, tab: 'drill', autoDone: wDone >= target, progress: `${wDone}/${target}`,
      });
    }
    const errWords = savedFromErrors(db, dateISO);
    if (errWords.length) {
      add({
        id: 'errwords', time: addMin(ev, 20), title: `Ôn ${errWords.length} từ lưu từ câu sai (My vocabulary)`,
        detail: 'Trên Parroto → My vocabulary: chế độ FLASHCARD một lượt, rồi WRITE (tự gõ ra từ) một lượt. Từ lưu bằng cách bôi đen từ trong câu sai trên trang kết quả.',
        minutes: 8, link: LINKS.myVocabulary, linkLabel: 'Mở My vocabulary', autoDone: sec(db, dateISO, 'myvocab') >= 300,
        progress: `${Math.min(5, Math.floor(sec(db, dateISO, 'myvocab') / 60))}/5 phút`,
      });
    }
    const gameSec = sec(db, dateISO, 'games');
    add({
      id: 'game', time: addMin(ev, 25), title: eff.extraGame ? '2 ván Word Rain' : '1 ván Word Rain',
      detail: 'Đọc nghĩa → gõ từ, trên bộ đang học.', minutes: eff.extraGame ? 10 : 5, link: LINKS.games, linkLabel: 'Mở Games',
      autoDone: gameSec >= (eff.extraGame ? 480 : 240),
    });
  }

  // Checkpoint: the same 20-minute format (Part 2 + Part 5, Test Mode) every 3–4 days, to compare fairly.
  if ([4, 11, 19, 26].includes(day)) {
    add({
      id: 'checkpoint', time: addMin(st, 20), title: 'Bài mốc 20 phút: Part 2 + Part 5',
      detail: 'Trên Parroto chọn một đề chưa làm → Test Mode → chỉ tích Part 2 và Part 5. Cùng định dạng mỗi lần để so tiến bộ công bằng (tab Tiến độ → Bài mốc).',
      minutes: 20, link: LINKS.exams, linkLabel: 'Mở đề Parroto', autoDone: resultsOn(db, dateISO).some(isCheckpoint),
    });
  }
  if (plan.weekly) {
    const tipN = countToday(db.drill?.log || [], 'tip', dateISO);
    add({ id: 'tipquiz', time: addMin(ev, 30), title: 'Quiz mẹo thi (10 câu)', detail: 'Tab Luyện → Quiz mẹo thi. Câu sai quay lại theo lịch giãn cách.', minutes: 5, tab: 'drill', autoDone: tipN >= 10, progress: `${Math.min(tipN, 10)}/10` });
    add({ id: 'weekly', time: addMin(ev, 35), title: 'Tổng kết tuần (45 phút)', detail: 'Mở Exam History trên Parroto, xem tab Tiến độ: lỗi theo mã × Part, áp quy tắc điều chỉnh cho tuần sau.', minutes: 45, tab: 'stats', link: LINKS.exams, linkLabel: 'Mở Parroto' });
  }

  tasks.sort((a, b) => (a.time || '') < (b.time || '') ? -1 : (a.time || '') > (b.time || '') ? 1 : 0);
  return {
    day, phase: phaseOf(day), plan, preview, tasks, adjustments: adj, notices,
    newAssign: assignChanged ? assignToday : null,
    week: plan.weekly ? weekSummary(db, dateISO) : null,
  };
}

export function totalMinutes(tasks) {
  return tasks.reduce((n, t) => n + (t.minutes || 0), 0);
}

// Vocabulary helpers for the daily tasks (counts read automatically from Parroto, typed values as fallback).
function srsDone(db, dateISO) {
  const v = vocabDay(db, dateISO);
  if (db.daily[dateISO]?.srsReviewed > 0) return true;
  if (v.hasSnapshot && v.due === 0 && v.reviews > 0) return true;
  return false;
}

function vocabProgress(db, dateISO) {
  const v = vocabDay(db, dateISO);
  const r = reviewsOn(db, dateISO);
  if (!r && v.due == null) return '';
  return `ôn ${r}${v.due != null ? ` · còn ${v.due} đến hạn` : ''}`;
}

function vocabDetail(db, dateISO) {
  const v = vocabDay(db, dateISO);
  const base = 'Bộ ETS TOEIC Vocabulary + Saved Vocabulary. Xong khi số thẻ đến hạn (Due) về 0.';
  if (!v.hasSnapshot) return base + ' Mở trang Vocabulary trên Parroto để extension đọc số thẻ đến hạn.';
  return `${base} Parroto lúc ${v.updatedAt}: Due ${v.due}, tổng ${v.totals.totalCards} thẻ (Learning ${v.totals.learning ?? '–'} · Reviewing ${v.totals.reviewing ?? '–'} · Mastered ${v.totals.mastered ?? '–'}). Mở lại trang Vocabulary sau khi ôn để cập nhật.`;
}
