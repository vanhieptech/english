// Suggest an error code for a wrong / skipped question.
// Input: features read from Parroto's "Review answers" (no question text stored), the part, skipped flag.
// Output: { code, reason, sure } — sure=false means a part-based guess (you have not opened that part's review).

export const PART_DEFAULT = {
  P1: ['A', 'P1: thường do nghe sót động từ / danh từ'],
  P2: ['D', 'P2: phần lớn lỗi là dính bẫy'],
  P3: ['A', 'P3: nghe sót đoạn chứa đáp án'],
  P4: ['A', 'P4: nghe sót đoạn chứa đáp án'],
  P5: ['G', 'P5: đa số câu là ngữ pháp / từ loại'],
  P6: ['G', 'P6: đa số câu là ngữ pháp / từ nối'],
  P7: ['P', 'P7: thường do không nhận ra paraphrase'],
};

export function suggest(part, skipped, f) {
  // Your own listening diagnosis (done on Parroto's result page) wins over every rule.
  if (f && f.diag) return { code: f.diag, reason: 'Bạn tự chẩn đoán: ' + (f.diagReason || ''), sure: true, self: true };
  if (skipped || f?.status === 'SKIPPED' || f?.status === 'UNANSWERED' || (f && f.chosenIdx < 0)) {
    return { code: 'T', reason: 'Câu bỏ trống → thường do hết giờ', sure: true };
  }
  if (!f) {
    const [code, reason] = PART_DEFAULT[part] || ['C', 'không rõ'];
    return { code, reason, sure: false };
  }
  const R = (code, reason) => ({ code, reason, sure: true });
  switch (part) {
    case 'P1':
      if (f.expSound) return R('D', 'Đáp án bạn chọn có từ nghe giống');
      return R('A', 'Mô tả tranh: nghe sót động từ / danh từ');
    case 'P2':
      if (f.expYesNo || (f.qWh && f.chosenYesNo)) return R('D', 'Trả lời Yes/No cho câu hỏi WH');
      if (f.chosenRepeat || f.expRepeat) return R('D', 'Đáp án bạn chọn lặp từ của câu hỏi');
      if (f.expSound) return R('D', 'Từ nghe giống từ trong câu hỏi');
      if (f.expMismatch) return R('D', 'Đáp án trả lời sai loại thông tin');
      return R('A', 'Không bắt được ý câu hỏi khi nghe');
    case 'P3':
    case 'P4':
      if (f.qGraphic) return R('Q', 'Câu đồ họa: đọc sai bảng / sơ đồ');
      if (f.qInfer) return R('I', 'Câu suy luận / ý định người nói');
      if (f.expParaphrase) return R('P', 'Đáp án đúng nói lại ý bằng từ khác');
      if (f.chosenRepeat) return R('D', 'Đáp án bạn chọn lặp từ nghe được nhưng sai ý');
      return R('A', 'Nghe sót đoạn chứa đáp án');
    case 'P5':
    case 'P6':
      if (part === 'P6' && f.sentenceOpts) return R('I', 'Câu chèn câu: phải dựa vào ngữ cảnh');
      if (f.sameRoot) return R('G', 'Các phương án cùng gốc từ → từ loại');
      if (f.funcWords) return R('G', 'Phương án là giới từ / liên từ / đại từ');
      if (f.verbForms || f.expTense) return R('G', 'Dạng động từ / thì / hòa hợp');
      return R('V', 'Các phương án là từ khác nhau → từ vựng / collocation');
    case 'P7':
      if (f.qVocab) return R('V', 'Câu hỏi nghĩa của từ trong ngữ cảnh');
      if (f.qInsert) return R('I', 'Câu chèn câu');
      if (f.qInfer) return R('I', 'Câu suy luận (most likely / suggested / implied)');
      if (f.qNot) return R('Q', 'Câu NOT: dễ hiểu ngược câu hỏi');
      if (f.expNotMentioned) return R('P', 'Bạn chọn ý không có trong bài');
      return R('P', 'Không nhận ra đáp án nói lại ý của bài');
    default:
      return R('C', 'không rõ');
  }
}

// Learn from your corrections: if you changed a given (part, reason) suggestion to another code
// at least 3 times and more than half the time, suggest your usual code instead.
export function adapt(db, part, s) {
  const hist = (db.errors || []).filter((e) => e.suggested && e.part === part && e.suggestReason === s.reason);
  if (hist.length < 3) return s;
  const changed = hist.filter((e) => e.code !== e.suggested);
  if (changed.length * 2 <= hist.length) return s;
  const counts = {};
  for (const e of changed) counts[e.code] = (counts[e.code] || 0) + 1;
  const [best] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return { ...s, code: best, reason: `${s.reason} — bạn thường đổi thành ${best}`, adapted: true, baseCode: s.code };
}

export function suggestFor(db, p) {
  const f = db.review?.[p.session]?.[p.q] || null;
  const s = suggest(p.part, p.skipped, f);
  return { ...adapt(db, p.part, s), baseReason: s.reason };
}
