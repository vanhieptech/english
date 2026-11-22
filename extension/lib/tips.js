// Exam-strategy tips per Part (written for this app), each tied to the error codes it fixes,
// with a short scenario question for the weekly tip quiz. tipsFor() picks the ones that match
// the mistakes you make most.

// [id, part, codes, Part 5 type or '', tip, quiz question, correct answer, wrong 1, wrong 2]
const RAW = [
  ['p1-verb', 'P1', ['A', 'D'], '', 'Nghe kỹ động từ: "is being + V3" là đang có người làm, "has been + V3" là đã xong. Tranh không có người thì loại câu có động từ chỉ người.', 'Tranh chỉ có bàn ghế, không có người. Câu nào gần như chắc chắn sai?', 'The chairs are being arranged.', 'The chairs have been arranged.', 'Some chairs are next to a table.'],
  ['p1-sound', 'P1', ['A', 'D'], '', 'Phương án nhắc đúng đồ vật trong tranh nhưng sai hành động thường là bẫy. Hãy nghe cả động từ, đừng bắt mỗi danh từ.', 'Nghe được từ "ladder" và trong tranh có cái thang. Nên làm gì?', 'Nghe hết câu để kiểm tra động từ trước khi chọn', 'Chọn ngay vì có từ khớp với tranh', 'Bỏ qua câu đó'],
  ['p1-scan', 'P1', ['C'], '', 'Trong lúc nghe hướng dẫn, nhìn tranh và tự đoán trước 2–3 động từ có thể xuất hiện.', 'Phần hướng dẫn Part 1 đang đọc. Nên dùng thời gian này thế nào?', 'Nhìn tranh, đoán trước động từ và vị trí đồ vật', 'Nghe hướng dẫn cho chắc', 'Đọc trước Part 2'],
  ['p2-first', 'P2', ['A', 'Q'], '', 'Ba từ đầu tiên quyết định câu: Who/When/Where/Why/How. Bắt được từ hỏi là loại được 1–2 phương án.', 'Câu hỏi bắt đầu bằng "Where…". Phương án nào loại ngay?', '"Next Tuesday."', '"In the storage room."', '"Ask the front desk."'],
  ['p2-repeat', 'P2', ['D'], '', 'Phương án lặp lại từ (hoặc từ gần âm) trong câu hỏi thường là bẫy.', 'Câu hỏi: "Did you copy the report?" Phương án nào nhiều khả năng là bẫy?', '"The coffee machine is broken."', '"I\'ll do it after lunch."', '"Yes, it\'s on your desk."'],
  ['p2-indirect', 'P2', ['D', 'I'], '', 'Câu trả lời gián tiếp ("Let me check", "Ask Ms. Lee", "It hasn\'t been decided") thường là đáp án đúng.', 'Câu hỏi: "When does the training start?" Phương án nào thường đúng dù không nói giờ?', '"The schedule hasn\'t been posted yet."', '"It was a great training."', '"At the train station."'],
  ['p2-yesno', 'P2', ['D'], '', 'Câu hỏi Wh- không trả lời bằng Yes/No. Câu Yes/No thì đáp án có thể bỏ Yes/No và nói thẳng ý.', 'Câu hỏi "Why was the meeting moved?" Phương án nào chắc chắn sai?', '"Yes, it was."', '"The room was booked."', '"Mr. Kato is away."'],
  ['p2-skip', 'P2', ['C', 'T'], '', 'Lỡ một câu thì chọn bừa ngay và tập trung câu sau; Part 2 không có thời gian quay lại.', 'Bạn không nghe rõ câu 15. Nên làm gì?', 'Chọn đại một đáp án và nghe câu 16', 'Ngồi nghĩ lại câu 15', 'Để trống câu 15'],
  ['p3-preread', 'P3', ['Q', 'A'], '', 'Đọc trước 3 câu hỏi trong lúc audio đọc hướng dẫn hoặc ngay sau khi chọn xong bộ trước.', 'Vừa chọn xong 3 câu của bộ trước. Việc tiếp theo là gì?', 'Đọc ngay 3 câu hỏi của bộ sau', 'Kiểm tra lại đáp án bộ trước', 'Nghỉ vài giây cho đỡ mệt'],
  ['p3-order', 'P3', ['A', 'T'], '', 'Đáp án đi theo thứ tự: câu 1 ở đầu, câu 2 giữa, câu 3 cuối. Nghe ra đáp án câu 3 tức là đã lỡ câu 2 → đoán câu 2 ngay.', 'Bạn vừa nghe đáp án của câu thứ 3 mà chưa có câu thứ 2. Nên làm gì?', 'Đoán câu 2 ngay rồi chọn câu 3', 'Chờ nghe lại câu 2', 'Bỏ trống câu 2'],
  ['p3-para', 'P3', ['P'], '', 'Đáp án đúng thường nói lại ý bằng từ khác; phương án lặp nguyên từ trong audio hay là bẫy.', 'Audio nói "my car broke down". Phương án đúng nhiều khả năng là:', '"She had a vehicle problem."', '"She bought a new car."', '"She broke a window."'],
  ['p3-next', 'P3', ['I'], '', 'Câu "việc sắp làm" nằm ở cuối: nghe "I\'ll…", "Let me…", "I\'m going to…".', 'Câu hỏi "What will the man do next?" Nên chú ý đoạn nào?', 'Mấy câu cuối của hội thoại', 'Câu mở đầu', 'Đoạn giữa'],
  ['p3-graphic', 'P3', ['I', 'Q'], '', 'Câu đồ họa: phương án là cột A, audio sẽ nói thông tin ở cột B; dò cột B trên hình để tìm đáp án.', 'Phương án là tên phòng, đồ họa có tên phòng và giờ. Audio nhiều khả năng nhắc gì?', 'Giờ, để bạn dò ra tên phòng', 'Đọc thẳng tên phòng', 'Không nhắc gì liên quan'],
  ['p3-intent', 'P3', ['I'], '', 'Câu "Why does the man say …?": hỏi chức năng của câu (từ chối, phàn nàn, đề nghị), không phải nghĩa đen.', '"I have a client call at two." trong ngữ cảnh mời họp lúc 2 giờ nghĩa là:', 'Anh ấy không dự họp được', 'Anh ấy có khách hàng mới', 'Anh ấy muốn họp sớm hơn'],
  ['p4-type', 'P4', ['Q', 'I'], '', 'Nhận ra loại bài nói (tin nhắn thoại, thông báo, quảng cáo, dự báo, hướng dẫn tham quan) từ câu đầu để đoán nội dung.', 'Câu đầu: "Hi, this is Dana from Brightline Dental." Đây là loại bài gì?', 'Tin nhắn thoại', 'Bản tin thời tiết', 'Hướng dẫn tham quan'],
  ['p4-request', 'P4', ['A'], '', 'Câu "listeners are asked to…" thường ở cuối: "Please…", "Be sure to…", "Don\'t forget to…".', 'Câu hỏi "What are listeners asked to do?" Đáp án hay nằm ở đâu?', 'Cuối bài, sau "Please…"', 'Câu chào đầu', 'Giữa bài khi giới thiệu'],
  ['p4-accent', 'P4', ['A'], '', 'Đề có giọng Mỹ, Anh, Canada, Úc. Khoảng 1/3 bài dictation nên chọn giọng Anh/Úc.', 'Bạn hay sai bài nói giọng Úc. Nên luyện thế nào?', 'Dictation thêm bài giọng Anh/Úc trên Parroto', 'Chỉ luyện giọng Mỹ cho quen', 'Bỏ qua vì ít gặp'],
  ['p5-position', 'P5', ['G'], 'wordform', 'Câu từ loại: nhìn vị trí chỗ trống, không cần dịch cả câu.', '"The manager responded ___ to the complaint." Nên chọn gì?', 'promptly', 'prompt', 'promptness'],
  ['p5-prepconj', 'P5', ['G'], 'prepconj', 'Sau chỗ trống là cụm danh từ → giới từ (despite, during); là mệnh đề S + V → liên từ (although, while).', '"___ the heavy rain, the event continued." Nên chọn gì?', 'Despite', 'Although', 'Because'],
  ['p5-voice', 'P5', ['G'], 'tense', 'Có tân ngữ theo sau chỗ trống → chủ động; không có tân ngữ → bị động.', '"The report ___ by the team yesterday." Nên chọn gì?', 'was completed', 'completed', 'completing'],
  ['p5-agree', 'P5', ['G'], 'agreement', 'Bỏ qua cụm giới từ chen giữa để tìm chủ ngữ thật rồi mới chia động từ.', '"The list of approved suppliers ___ updated monthly." Nên chọn gì?', 'is', 'are', 'were'],
  ['p5-vocab', 'P5', ['V'], 'vocab', 'Bốn phương án gần nghĩa: chọn theo collocation đi kèm (meet a deadline, comply with, eligible for).', '"Employees must ___ with the new safety rules." Nên chọn gì?', 'comply', 'obey', 'follow'],
  ['p5-time', 'P5', ['T'], '', 'P5 tối đa 20 giây/câu. Quá 30 giây thì đoán, đánh dấu, đi tiếp. Mốc: xong P5 ở phút 11.', 'Bạn kẹt ở một câu P5 đã 35 giây. Nên làm gì?', 'Đoán, đánh dấu rồi làm câu sau', 'Cố nghĩ thêm cho ra', 'Bỏ trống và quay lại cuối giờ'],
  ['p6-sentence', 'P6', ['I'], '', 'Câu chèn cả câu: đọc câu trước và sau chỗ trống; câu đúng phải nối được cả hai (đại từ, từ nối, chủ đề).', 'Chọn câu điền vào đoạn văn. Cách nhanh nhất là:', 'Đọc câu ngay trước và sau chỗ trống để kiểm tra mạch', 'Chọn câu có nhiều từ khó nhất', 'Dịch hết cả đoạn trước'],
  ['p6-tense', 'P6', ['G'], '', 'Ở P6, thì của động từ phụ thuộc cả đoạn (ngày gửi thư, sự kiện đã/ sắp diễn ra), không chỉ câu chứa chỗ trống.', 'Thư đề ngày 3/5 nói về hội thảo ngày 20/5. Động từ về hội thảo nên ở thì nào?', 'Tương lai', 'Quá khứ', 'Hiện tại hoàn thành'],
  ['p6-link', 'P6', ['G', 'I'], '', 'Chỗ trống đầu câu thường là từ nối (However, Therefore, In addition): xác định quan hệ giữa hai câu trước.', 'Câu trước nói giá tăng, câu sau nói vẫn bán chạy. Từ nối hợp lý là:', 'However', 'Therefore', 'In addition'],
  ['p7-questions', 'P7', ['T', 'Q'], '', 'Đọc câu hỏi trước, gạch từ khóa (tên, số, ngày), rồi quét bài tìm đúng chỗ; không đọc kỹ từ đầu.', 'Mở một đoạn P7 mới. Việc đầu tiên là:', 'Đọc câu hỏi và nhớ từ khóa', 'Đọc kỹ toàn bài', 'Đọc tiêu đề rồi đoán'],
  ['p7-not', 'P7', ['Q', 'C'], '', 'Câu NOT/EXCEPT: kiểm tra từng phương án trong bài, cái không tìm thấy là đáp án. Làm câu này sau cùng trong đoạn.', 'Câu "What is NOT mentioned…?" nên làm lúc nào?', 'Sau các câu khác của đoạn', 'Làm đầu tiên', 'Bỏ luôn'],
  ['p7-synonym', 'P7', ['V', 'P'], '', 'Câu "closest in meaning": thay từng phương án vào câu trong bài; nghĩa theo ngữ cảnh, không theo nghĩa phổ biến nhất.', '"The firm will honor the agreement." "honor" gần nghĩa nhất với:', 'fulfill', 'respect', 'award'],
  ['p7-multi', 'P7', ['T', 'I'], '', 'Đoạn kép/ba: ít nhất một câu cần nối thông tin 2 bài (ví dụ email nói mã hàng, bảng giá cho giá).', 'Câu hỏi về giá, email chỉ nhắc mã sản phẩm. Làm sao tìm?', 'Lấy mã ở email, dò giá ở bảng giá trong bài 2', 'Đoán vì email không có giá', 'Chỉ đọc lại email'],
  ['p7-budget', 'P7', ['T'], '', 'P7 cần khoảng 55 phút cho 54 câu. Vượt ngân sách của đoạn thì đoán câu khó và chuyển đoạn; câu cuối đề dễ không kém câu đầu.', 'Đoạn ba đã quá ngân sách 2 phút, còn 1 câu khó. Nên làm gì?', 'Đoán câu đó và sang đoạn sau', 'Đọc lại cả 3 bài', 'Bỏ trống, cuối giờ quay lại'],
  ['p7-infer', 'P7', ['I'], '', 'Câu suy luận ("most likely", "suggested"): đáp án phải có căn cứ trong bài; loại phương án nghe hợp lý nhưng bài không nói.', 'Câu "What is suggested about the company?" Phương án nào nên loại?', 'Một ý nghe hợp lý nhưng bài không nhắc', 'Ý được nói lại bằng từ khác', 'Ý suy ra từ hai câu trong bài'],
];

export const TIPS = RAW.map(([id, part, codes, cat, text, q, a, w1, w2]) => ({ id, part, codes, cat, text, quiz: { q, a, w: [w1, w2] } }));

// Pick n tips for a part, weighted by your recent mistakes on that part.
// data: { errors: [...], review: {session: {q: {cat}}} } ; seen: { tipId: timesShown } to rotate.
export function tipsFor(part, data, dateISO, n = 3, seen = {}) {
  const from = new Date(dateISO + 'T00:00:00');
  from.setDate(from.getDate() - 13);
  const fromISO = from.toLocaleDateString('sv-SE');
  const codeCount = {};
  const catCount = {};
  for (const e of data?.errors || []) {
    if (e.part !== part || !e.date || e.date < fromISO || e.date > dateISO) continue;
    if (e.code) codeCount[e.code] = (codeCount[e.code] || 0) + 1;
    if (part === 'P5' && e.srcKey) {
      const [s, q] = e.srcKey.split('|');
      const cat = data.review?.[s]?.[q]?.cat;
      if (cat) catCount[cat] = (catCount[cat] || 0) + 1;
    }
  }
  return TIPS.filter((t) => t.part === part)
    .map((t, i) => ({
      t,
      score: 1 + t.codes.reduce((s, c) => s + (codeCount[c] || 0), 0) + (t.cat ? (catCount[t.cat] || 0) * 2 : 0) - (seen[t.id] || 0) * 0.5 - i * 0.01,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => ({ ...x.t, why: x.score > 1 ? 'hợp với lỗi bạn hay mắc' : '' }));
}

export function partOfQ(q) {
  return q <= 6 ? 'P1' : q <= 31 ? 'P2' : q <= 70 ? 'P3' : q <= 100 ? 'P4' : q <= 130 ? 'P5' : q <= 146 ? 'P6' : 'P7';
}
