# Đặc tả tính năng: TOEIC Coach (Chrome extension)

*Bản review ngày 21/11/2026. Gộp yêu cầu ban đầu của bạn, báo cáo [toeic-deep-research.md](toeic-deep-research.md), cẩm nang [parroto-playbook.md](parroto-playbook.md) và quyết định làm extension chạy độc lập, không cần AI.*

## 0. Kết luận review

Hướng đi đã rõ. Nhưng **chưa đủ rõ để bắt đầu viết code cho mọi phần.** Có 3 loại việc còn mở:

1. **Mâu thuẫn giữa các tài liệu cũ, giờ chốt lại:**
   - Báo cáo nghiên cứu viết "web app chạy localhost / PWA". **Đã đổi thành Chrome extension.**
   - Báo cáo có tính năng M2 "bộ thẻ FSRS từ lỗi". Cẩm nang lại bảo lưu từ vào Saved Vocabulary của Parroto. Hai cách trùng nhau. **Chốt: từ vựng ở lại Parroto.** FSRS trong extension chỉ dùng cho những thứ Parroto không có: quy tắc ngữ pháp, cặp paraphrase, dạng bẫy, câu sai cần làm lại.
   - "Làm lại câu sai" không thể chép nội dung đề Parroto sang extension (bản quyền). **Chốt: extension lưu vị trí câu (bộ, đề, Part, số câu) và mở lại Parroto ở Practice Mode.** Còn phải kiểm tra Parroto có link thẳng tới từng câu được không.
2. **Phải đợi dữ liệu thật:** trang kết quả đề, Exam History / Analytics và trang thống kê thẻ từ chưa có dữ liệu, vì tài khoản chưa làm đề nào. Phần đọc tự động cho các trang này **chỉ viết được sau đề #1.**
3. **Quyết định của bạn:** đã chốt ở mục 6. Chỉ còn thiếu ngày thi cụ thể.

Phát hiện thêm khi review: **khối lượng nội dung tự soạn lớn hơn khối lượng code.** Không có ngân hàng câu hỏi TOEIC nào có giấy phép mở, nên mọi câu drill (Part 2, Part 3/4, Part 5, paraphrase, đoạn Part 7 cho chế độ thi máy) phải viết mới. Xem mục 4.

---

## 1. Yêu cầu ban đầu của bạn → đã có chỗ chưa

| Bạn yêu cầu | Làm ở đâu | Trạng thái |
|---|---|---|
| Từ vựng nhanh, tập trung TOEIC | Parroto: bộ ETS TOEIC Vocabulary + Saved Vocabulary + game | ✅ Rõ. Extension chỉ theo dõi số thẻ ôn / từ mới |
| Nối từ | Parroto: game Word Match | ✅ Rõ |
| Trái nghĩa | Parroto không có. TOEIC kiểm tra đồng nghĩa / paraphrase nhiều hơn hẳn trái nghĩa | ✅ Làm sau phần chính |
| Viết câu | Parroto không có. Không dùng AI | ✅ Tự chấm theo checklist (D6) |
| Mindmap | Bằng chứng yếu. Dùng để xem từ theo chủ đề | ✅ Làm sau phần chính |
| Đọc hiểu | Parroto: Part 5–7 trong 40 đề. Extension: mô phỏng giao diện Reading thi máy + bấm giờ | ✅ Rõ, cần soạn đoạn văn (mục 4) |
| Nghe | Parroto: 267 bài TOEIC Listening (dictation + shadowing), Part 1–4 trong đề. Extension: drill bẫy Part 2, đọc nhanh câu hỏi Part 3/4 | ✅ Rõ, cần soạn câu (mục 4) |
| Mẹo thi từng phần | Báo cáo + thẻ mẹo trong extension | ✅ Rõ |
| Feedback, review, cải thiện điểm yếu | Sổ lỗi có mã + quy tắc điều chỉnh + tổng kết tuần | ✅ Rõ |
| Tracking chính xác, tự dẫn tới việc cần làm | Extension tự ghi trên Parroto + panel "Hôm nay làm gì" | ✅ Rõ một phần, phần đọc trang đề đợi đề #1 |
| Dùng độc lập, không cần AI mỗi lần chat | Mọi logic chạy trong extension, dữ liệu trên máy | ✅ Rõ |

---

## 2. Danh sách tính năng extension

### A. Thu thập dữ liệu tự động trên parroto.app

| # | Tính năng | Chi tiết | Trạng thái |
|---|---|---|---|
| A1 | Thời gian học thật | Đếm thời gian theo từng loại trang (đề, TOEIC Listening, Vocabulary, Games) khi tab đang mở **và** có thao tác. Rảnh quá 2 phút thì ngừng đếm (`chrome.idle`) | Rõ |
| A2 | Điểm bài TOEIC Listening | Đọc điểm Dictation (vd 64/100) và trạng thái Shadowing của từng bài trên trang topic | Rõ, đã thấy dữ liệu |
| A3 | Kết quả đề | Điểm L/R, điểm từng Part, danh sách câu sai, chế độ Test/Practice, thời gian làm | **Đợi đề #1** |
| A4 | Exam History / Analytics | Đọc khi bạn mở trang, lưu lại theo ngày | **Đợi đề #1** |
| A5 | Thẻ từ | Số thẻ ôn, số từ mới trong ngày, số thẻ quá hạn (nếu Parroto hiển thị) | **Cần xem trang khi đang ôn** |
| A6 | Ô nhập tay | Nếu không đọc được, panel hiện ô nhập nhanh cho đúng số liệu đó | Rõ |
| A7 | Báo lỗi đọc trang | Khi Parroto đổi giao diện và không đọc được nữa, hiện cảnh báo "cần sửa phần đọc trang X" thay vì im lặng ghi sai | Rõ |

### B. Panel "Hôm nay làm gì" (side panel của Chrome)

| # | Tính năng | Chi tiết |
|---|---|---|
| B1 | Danh sách việc trong ngày | Lấy từ lộ trình 30 ngày, đã áp quy tắc điều chỉnh. Mỗi việc có thời lượng và mục tiêu (vd "P5 Vol.1 T3, 30 câu, ≤ 11 phút") |
| B2 | Link thẳng tới đúng chỗ | Mở đúng đề + Part trên Parroto, bài TOEIC Listening chưa làm tiếp theo, bộ từ cần ôn, hoặc drill trong extension |
| B3 | Tự tick khi xong | Tick dựa vào dữ liệu thu thập (A1–A5). Không đọc được thì bạn tự tick |
| B4 | Phân bổ đề không trùng | Ghi lại Part nào của đề nào đã dùng. Đề full lấy từ TOEIC 2026 T1–6, luyện Part lấy từ Vol.1 → 2024 → 2023 |
| B5 | Nhắc giờ học | Thông báo lúc 13:25 và 20:55 (theo ca thi của bạn). Nhắc khi thẻ quá hạn hoặc câu làm lại đến hạn |
| B6 | Ngày đề full | Hiện quy trình ngày đề: Test Mode, không pause, không giấy, chữa 1,5–2h |

### C. Sổ lỗi và làm lại

| # | Tính năng | Chi tiết |
|---|---|---|
| C1 | Ghi lỗi nhanh | Câu sai từ A3 tự vào sổ. Bạn chọn mã V/G/A/D/P/I/T/C/Q, mức tự tin, 1 dòng nguyên nhân. Ghi được cả **câu đoán trúng** |
| C2 | Lịch làm lại | +0 / +2–3 / +7 ngày theo FSRS. Làm lại = mở đúng câu đó trên Parroto Practice Mode |
| C3 | Việc theo mã lỗi | Mỗi mã sinh việc cho ngày mai: V → lưu từ vào Saved Vocabulary; A → dictation lại đoạn; D → thêm bộ P2; G → học lại quy tắc + bộ P5; T → bấm giờ chặt hơn 10% |
| C4 | Thẻ quy tắc & paraphrase | Bạn tạo thẻ từ một lỗi: quy tắc ngữ pháp, cặp paraphrase (cụm trong bài ↔ cụm trong đáp án), dạng bẫy. Ôn bằng FSRS trong extension |

### D. Drill trong extension (phần Parroto không có)

| # | Tính năng | Nội dung cần soạn |
|---|---|---|
| D1 | **Bẫy Part 2**: nghe câu hỏi + 3 đáp án bằng giọng đọc máy (Mỹ / Anh / Úc), chọn đáp án, rồi gọi tên dạng bẫy | ~150 câu |
| D2 | **Đọc nhanh câu hỏi Part 3/4**: hiện 3 câu hỏi 8–10 giây rồi ẩn, chọn "cần nghe gì" | ~60 bộ |
| D3 | **Part 5 theo dạng**: 10 dạng (từ loại, thì/bị động, hòa hợp, V-form, giới từ/liên từ, đại từ, mệnh đề quan hệ, so sánh, tương liên, collocation), 20 giây/câu, ưu tiên dạng sai nhiều | ~300 câu |
| D4 | **Mô phỏng Reading thi máy**: Next / Back / Mark for review / bảng Review, highlight bằng chuột, đồng hồ, tự nộp, mốc 0:11 / 0:20 / 0:45 | ~12 đoạn Part 6 + ~20 bộ Part 7 |
| D5 | **Paraphrase**: nối và điền cặp, lấy từ thẻ của bạn (C4) + bộ khởi đầu | ~200 cặp khởi đầu |

### E. Theo dõi và điều chỉnh

| # | Tính năng | Chi tiết |
|---|---|---|
| E1 | Dashboard | Điểm L/R qua các đề, % đúng theo Part và theo dạng, top 3 mã lỗi tuần, % câu làm lại đúng ở mốc +7, phút thực học so với kế hoạch, điểm dictation trung bình, thời gian P5 |
| E2 | Quy tắc điều chỉnh | Part < 60% → +20 phút/ngày; mã A đứng đầu → 3 bài dictation/ngày; mã V đứng đầu → thêm Word Rain; mã T ở Reading → P5 bấm 9 phút; quá 100 thẻ quá hạn → dừng từ mới 2 ngày. Hiện lý do mỗi lần điều chỉnh |
| E3 | Tổng kết tuần | Ngày 7, 14, 21: báo cáo tự động + lộ trình tuần sau đã điều chỉnh |
| E4 | Cảnh báo nhiễu | Hai đề chênh dưới 30–50 điểm thì ghi "chưa phải tiến bộ thật" |

### F. Dữ liệu và an toàn

| # | Tính năng | Chi tiết |
|---|---|---|
| F1 | Lưu trên máy | IndexedDB trong extension. Không có máy chủ, không gửi đi đâu |
| F2 | Sao lưu | Tự xuất file JSON vào Downloads mỗi tuần + nút xuất/nhập |
| F3 | Không chép nội dung Parroto | Chỉ lưu số liệu của bạn và vị trí câu, không lưu đề, đáp án, transcript hay định nghĩa từ của Parroto |
| F4 | Phân tích sâu (tùy chọn) | Xuất JSON để đưa vào chat Claude khi muốn |

---

## 3. Không làm

- Flashcard từ vựng chung, dictation, shadowing, đề full, game ôn từ: Parroto đã có.
- App điện thoại / theo dõi khi học Parroto trên điện thoại.
- Dự đoán điểm bằng máy học: dữ liệu 30 ngày quá ít, dễ sai.
- Bảng xếp hạng, "tim", phạt lỗi sai.

---

## 4. Nội dung cần soạn (phần việc lớn nhất)

| Bộ | Số lượng | Cách làm | Kiểm tra chất lượng |
|---|---|---|---|
| Part 2 bẫy | ~150 câu | Mình viết mới theo 6 dạng bẫy đã nghiên cứu | Mỗi câu có đúng 1 đáp án đúng; có giải thích dạng bẫy |
| Part 3/4 câu hỏi | ~60 bộ | Mình viết mới | Câu hỏi đúng kiểu TOEIC (WH + danh từ khóa) |
| Part 5 | ~300 câu | Mình viết mới, 30 câu × 10 dạng | Kiểm tra từng câu: chỉ 1 đáp án đúng ngữ pháp, có quy tắc giải |
| Part 6/7 | ~12 đoạn + ~20 bộ | Mình viết mới: email, thông báo, chuỗi tin nhắn, đoạn kép/ba | Đáp án phải tìm được trong đoạn; có câu NOT, suy luận, câu chèn |
| Paraphrase | ~200 cặp | Mình viết mới theo chủ đề công sở | Hai vế đúng nghĩa trong ngữ cảnh TOEIC |
| Mẹo từng Part | ~40 thẻ | Lấy từ báo cáo | — |

Nội dung do AI viết có thể sai. Mình sẽ tự kiểm tra từng bộ trước khi đưa vào, và mỗi câu có nút **"Báo câu sai"** để bạn loại câu có vấn đề.

---

## 5. Kỹ thuật

- Chrome Manifest V3: content script trên `parroto.app`, side panel, service worker, `chrome.alarms`, `chrome.idle`, `chrome.notifications`, `chrome.downloads`.
- Lưu trữ IndexedDB. FSRS dùng thư viện ts-fsrs (MIT), đóng gói sẵn trong extension, chạy offline.
- Giọng đọc: Web Speech API, dùng giọng Mỹ / Anh / Úc có sẵn trên macOS, chạy offline.
- Phần đọc trang Parroto tách riêng từng trang (topic, đề, kết quả, vocabulary) để Parroto đổi giao diện thì chỉ sửa đúng file đó.
- Kiểm thử: lưu HTML trang Parroto thật làm mẫu, chạy test phần đọc trang trên mẫu. Logic quy tắc và lịch có unit test.
- Cài: `chrome://extensions` → Developer mode → Load unpacked → thư mục `extension/`.

---

## 6. Quyết định đã chốt (21/11/2026)

1. **Ca thi: chiều**, giữ khung học chính 13:30. **Ngày thi: bạn đã có nhưng chưa nhập.** Extension sẽ có ô nhập ngày thi ở lần mở đầu; lộ trình tự gắn ngày 30 = ngày thi.
2. **Trình duyệt: Google Chrome.**
3. **Viết câu: tự chấm theo checklist.** Sau mỗi lỗi V/G, bạn viết 1 câu dùng đúng từ / quy tắc đó, rồi tự tick: đúng từ loại, đúng collocation, đúng thì, so với câu mẫu. Không gọi AI. Thêm mục D6.
4. **Trái nghĩa và mindmap: làm sau phần chính** (bước 6 trong thứ tự làm).

### D6. Viết câu tự chấm

Sau mỗi lỗi mã V hoặc G: viết 1 câu mới dùng từ / quy tắc đó → hiện câu mẫu + checklist 4 ý → bạn tự đánh giá đạt / chưa đạt → chưa đạt thì câu quay lại sau 2 ngày.

## 7. Thứ tự làm đề xuất

1. Khung extension + panel "Hôm nay làm gì" + lộ trình + quy tắc điều chỉnh + sổ lỗi nhập tay + đọc điểm TOEIC Listening (A2) + đếm thời gian (A1) + sao lưu.
2. Bạn làm đề #1 trên Parroto (Test Mode) → mình viết phần đọc kết quả đề (A3, A4) và thẻ từ (A5).
3. Drill Part 5 + Part 2 (nội dung + giao diện).
4. Mô phỏng Reading thi máy + đọc nhanh câu hỏi Part 3/4 + paraphrase.
5. Dashboard đầy đủ + tổng kết tuần + viết câu tự chấm (D6).
6. Trái nghĩa (cặp lấy từ đề khi có) + mindmap từ theo chủ đề.
