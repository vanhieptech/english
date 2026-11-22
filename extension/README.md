# TOEIC Coach (Chrome extension)

Lộ trình TOEIC 30 ngày quanh Parroto: hôm nay làm gì, sổ lỗi, tự ghi nhận tiến độ. Chạy độc lập, không cần AI, dữ liệu chỉ nằm trên máy.

Đặc tả đầy đủ: [../research/feature-spec.md](../research/feature-spec.md). Bản này gồm **đủ 6 bước** (v0.6.0).

## Cài đặt (một lần)

1. Mở Chrome, vào `chrome://extensions`.
2. Bật **Developer mode** (góc trên bên phải).
3. Bấm **Load unpacked** → chọn thư mục `/Users/macbook/work/english/extension`.
4. Ghim extension: bấm biểu tượng mảnh ghép trên thanh công cụ → ghim **TOEIC Coach**.
5. Bấm biểu tượng TOEIC Coach → panel mở bên phải → tab **Cài đặt** → nhập **ngày thi** → Lưu.
6. Đăng nhập Parroto trên Chrome (nếu chưa), rồi mở trang **TOEIC Listening** một lần để extension đọc danh sách 267 bài và điểm.

Khi sửa code: vào `chrome://extensions` → bấm nút tải lại ↻ ở thẻ TOEIC Coach, rồi tải lại tab Parroto.

## Dùng hằng ngày

- **Hôm nay**: danh sách việc theo giờ. Nút "Mở đề" / "Mở bài" mở đúng chỗ trên Parroto (thay tab Parroto đang mở, hoặc mở tab mới).
- Việc có nhãn **✓ tự ghi nhận** được tick tự động từ dữ liệu; việc khác bạn tự tick.
- Sau mỗi lần luyện Part hoặc thi thử trên Parroto: ở lại trang kết quả vài giây, extension tự ghi điểm. Tab **Ghi kết quả** chỉ dùng khi cần nhập tay.
- Rồi tab **Sổ lỗi** → gắn mã cho các câu sai tự ghi nhận (1 cú bấm/câu), và tự ghi thêm **câu đoán trúng**.
- Câu sai tự hẹn làm lại sau **2 ngày**, đúng thì hẹn tiếp **7 ngày**, sai thì quay lại 2 ngày.
- Ngày 7, 14, 21: tổng kết tuần hiện ở tab Hôm nay và Tiến độ.

## Extension tự ghi nhận gì

| Dữ liệu | Cách lấy |
|---|---|
| Thời gian học theo loại trang (đề, dictation, shadowing, từ vựng, games) | Đếm khi tab Parroto đang hiện **và** bạn đang thao tác hoặc audio đang chạy; rảnh quá 2 phút thì ngừng đếm |
| Điểm Dictation / Shadowing từng bài TOEIC Listening | Đọc trang danh sách TOEIC Listening và màn hình "LESSON COMPLETE" |
| **Kết quả đề / Part** (bước 2) | Đọc trang kết quả `/exams/toeic/session/<id>/result`: điểm tổng, L/R (Test Mode đủ 7 Part), số câu đúng từng Part, "Areas to Improve", và từng câu đúng / sai / bỏ trống |
| **Câu sai** (bước 2) | Tự vào mục "Câu sai tự ghi nhận" ở tab Sổ lỗi; bạn chỉ bấm 1 chữ cái mã lỗi (hoặc ✕ bỏ qua). Có nút gắn T cho mọi câu bỏ trống |
| **Exam History** (bước 2) | Mở `/exams/toeic/history` để extension biết lần làm bài nào chưa đọc kết quả; panel nhắc mở từng trang kết quả |
| **Exam Analytics** (bước 2) | Mở `/exams/toeic/analytics`: các dạng câu yếu kèm số câu sai, hiện ở tab Tiến độ |
| **Từ vựng** (v0.7) | Đếm lượt bấm Again / Hard / Good / Easy / Master khi học thẻ trên web; chụp bảng **Learning Statistics** ở `parroto.app/vocabulary` (Total Cards, Due, Total Reviews, Learning/Reviewing/Mastered). Từ mới = Total Cards tăng so với lần chụp hôm trước; lượt ôn = Total Reviews tăng (tính cả học trên app điện thoại); thẻ đến hạn = Due |
| **Gợi ý mã lỗi** (v0.8) | Khi bạn mở phần **Review answers** từng Part trên trang kết quả, extension đọc đáp án bạn chọn / đáp án đúng / dạng câu hỏi / lời giải thích (chỉ lưu đặc điểm, không lưu nội dung đề) và gợi ý mã lỗi kèm lý do |
| Bài tiếp theo nên làm | Bài chưa dictation đầu tiên; bài ≥ 85 điểm chưa shadowing |

**Cần làm gì để kết quả được ghi:** làm xong bài trên Parroto thì **ở lại trang kết quả vài giây** (hoặc mở lại từ Exam History). Không cần nhập điểm tay nữa.

**Từ vựng không cần nhập tay nữa:** học xong, mở lại trang Vocabulary trên Parroto một lần là extension cập nhật từ mới, lượt ôn và số thẻ đến hạn. Ô nhập tay vẫn còn (thu gọn) để sửa nếu cần. **Vẫn nhập tay:** câu **đoán trúng** (Parroto chỉ biết đúng/sai, không biết bạn đoán).

Kết quả tự ghi có nhãn "tự ghi" ở tab Ghi kết quả; bấm "bỏ qua" nếu không muốn tính một lần làm bài (vd làm thử cho vui).

Đã kiểm tra trên trang thật (tài khoản thử, 21/11/2026): trang kết quả Test Mode đủ 7 Part và Practice Mode 1 Part, Exam History, Exam Analytics.

**Lưu ý về Test Mode của Parroto:** mỗi câu nghe có thanh phát riêng nên nghe lại được, còn phòng thi máy thật thì audio tự chạy một lần. Khi làm đề, **đừng bấm phát lại**.

Extension chỉ đọc số liệu của bạn, không bấm gì trên Parroto và không sao chép đề, đáp án, transcript hay định nghĩa từ.

Phần học trên **app Parroto điện thoại** không được ghi nhận.

## Gắn mã lỗi nhanh (v0.8)

Tab Sổ lỗi → "Câu sai tự ghi nhận": mỗi câu có **mã gợi ý** (ô viền xanh) và lý do, gom theo đề + Part.
- **Chấp nhận tất cả gợi ý** hoặc **Chấp nhận gợi ý cả nhóm**; hoặc bấm mã khác cho từng câu.
- Phím tắt: ↑ ↓ chọn câu · Enter chấp nhận · V G A D P I T C Q gắn mã khác · X bỏ qua.
- Gợi ý chính xác hơn khi bạn mở trang kết quả trên Parroto và bấm qua từng tab Part 1…7 của phần Review answers; Part chưa mở thì đoán theo Part (ghi "đoán theo Part").
- Ví dụ quy tắc: câu bỏ trống → T; P2 trả lời Yes/No cho câu WH hoặc lặp từ câu hỏi → D; P5/P6 phương án cùng gốc từ, giới từ/liên từ/đại từ, dạng động từ → G, khác từ → V; P6 phương án là cả câu → I; câu hỏi "most likely / implied / suggest" → I; "closest in meaning" → V; P7 chi tiết → P; P3/P4 → A.
- Extension học từ lần bạn sửa: nếu bạn đổi một loại gợi ý sang mã khác ≥ 3 lần và quá nửa số lần, lần sau gợi ý mã bạn hay chọn.

## Cường độ cao và chỉ số chuyên sâu (v0.9)

- **Weakness sprint** (tab Luyện → Cường độ cao): 8 câu Part 5 đúng dạng bạn yếu nhất + 6 câu Part 2 đúng loại câu hỏi bạn yếu nhất (14 ngày). Có trong việc hằng ngày, tự tick khi xong 14 câu.
- **Ôn lỗi hôm nay**: hỏi lại mọi câu Part 5 / Part 2 bạn làm sai trong ngày. Việc buổi tối xuất hiện khi có câu sai, tự tick khi đã ôn và không còn câu sai.
- **Thang tốc độ Part 5**: 20 → 15 → 12 giây/câu. Lượt từ 8 câu đúng ≥ 80% thì lên mức, dưới 60% thì lùi mức.
- **Chỉ số chuyên sâu** (tab Tiến độ), 4 nhóm:
  - *Dự báo & sẵn sàng*: khoảng điểm L/R ước lượng từ tỷ lệ đúng 3 tuần (≈ 5 × số câu đúng, ± 35 — không chính thức), điểm còn thiếu tới 800, mức tăng cần mỗi tuần, Part kéo điểm nhiều nhất.
  - *Độ chính xác chi tiết*: dạng yếu nhất ở Part 5 / bẫy Part 2 / dạng câu Part 6–7 / nhớ câu hỏi Part 3–4, "Weak areas" của Parroto, mã lỗi theo 4 tuần.
  - *Tốc độ & sức bền*: giây/câu Part 5–7, nửa đầu vs nửa sau đề full (Listening, Reading, Part 7), số câu bỏ trống.
  - *Trí nhớ & sửa lỗi*: làm lại đúng ở +2 / +7 ngày, câu luyện gặp lại, sai khi tự tin, lỗi lặp lại 2 tuần liền, từ vựng Parroto (độ chính xác, Mastered tăng, Due).

## Chẩn đoán câu nghe (v0.10)

Trên trang kết quả Parroto, dưới mỗi câu Part 1–4 làm sai / bỏ trống có ô **"Chẩn đoán nghe"** (lời giải thích của câu đó bị làm mờ):
1. **▶ Nghe lại** đoạn audio, chưa đọc giải thích → "Nghe ra" hay "Vẫn không nghe ra".
2. Nếu không nghe ra: hiện **câu chứa đáp án** (Part 1: câu mô tả đúng; Part 2–4: câu trích trong lời giải thích) → "Hiểu – chỉ là nghe không ra" = **A**, "Không hiểu" = **V**.
3. Nếu nghe ra mà vẫn sai: chọn lý do → **D** (từ giống / lặp), **P** (đáp án nói bằng từ khác), **Q** (hiểu sai câu hỏi), **I** (suy luận sai), **C** (lỡ nhịp).

Kết quả tự chẩn đoán được dùng làm mã gợi ý ở tab Sổ lỗi (ghi "Bạn tự chẩn đoán"). Câu trích chỉ hiện trên trang, không lưu lại.

## Lời thoại đầy đủ bằng Whisper (v0.11)

Trong ô "Chẩn đoán nghe", nút **📝 Lời thoại đầy đủ (Whisper)** mở một tab của extension: tải audio của câu/đoạn đó từ Parroto, cắt theo khoảng lặng giữa các lượt nói rồi chuyển thành chữ bằng **Whisper chạy ngay trong Chrome** (transformers.js 3.7.6 + ONNX Runtime đóng gói sẵn trong `vendor/transformers`, Apache-2.0). Không gửi audio đi đâu; lời thoại không được lưu.
- Lần đầu tải mô hình (tiny ~40 MB hoặc base ~75 MB) từ Hugging Face, sau đó dùng lại từ bộ nhớ trình duyệt.
- Mỗi dòng có mốc thời gian, bấm để nghe từ chỗ đó; "Che chữ" để nghe trước rồi mở từng dòng.
- Máy nghe có thể sai vài từ (vd tên riêng) — dùng để đối chiếu.
- Đoạn hội thoại Part 3 66 giây: ~20 giây trên máy thử (bản tiny).

## Làm lại câu sai và gắn mã ngay trên Parroto (v0.12)

Trên trang kết quả, phía trên các tab Part có thanh **TOEIC Coach**:
- **Làm lại câu sai của Part này (n)**: các câu sai / bỏ trống bị che màu đáp án, icon đúng/sai và làm mờ lời giải thích; bạn chọn lại A–D ngay dưới câu (dùng chính đề và đáp án của Parroto). Chọn xong hiện đúng/sai, mở lại lời giải thích, và tính là một lần làm lại trong lịch +2 / +7 ngày (nếu câu đã có mã lỗi).
- Dưới mỗi câu sai: hàng nút **V G A D P I T C Q**, mã gợi ý viền xanh kèm lý do, mã hiện tại tô xanh. Bấm là lưu, không cần mở panel.
- (v0.12.1) Nếu bạn làm lại một câu chưa có mã rồi mới bấm mã, lần làm đó vẫn được ghi vào lịch. Dòng dưới đáp án nói rõ "Đã ghi" hay "Chưa lưu".
- Thanh hiện số câu đã gắn mã và số câu của đề này đến hạn làm lại hôm nay.
- Tab Sổ lỗi → "Đến hạn làm lại": nút **Làm lại trên Parroto** mở thẳng trang kết quả của lần làm đó.
- Bài luyện tự soạn (300 câu P5, 150 câu P2…) vẫn dùng để luyện nhanh theo dạng yếu; phần làm lại lỗi dùng đề thật của Parroto.

## Lưu từ trong câu sai vào My vocabulary của Parroto (v0.13)

Không có sổ từ riêng: từ được lưu vào **My vocabulary** của chính Parroto, nơi đã có sẵn 3 kiểu ôn LIST / FLASHCARD / WRITE.
- Trên trang kết quả, khung TOEIC Coach của mỗi câu sai có hàng **📖 Tra & lưu vào Parroto** với các đáp án ngắn (P5/P6). Cần hàng này vì các đáp án trên trang Review là nút bị khoá, không bôi đen được.
- Hoặc **bôi đen** 1–4 từ trong câu hỏi, lời thoại hay lời giải thích → bấm nút nổi "Tra & lưu".
- Extension mở hộp **Dictionary** của Parroto và điền sẵn từ. Bạn tự chọn đúng nghĩa rồi bấm **Save**: extension không bấm Save thay bạn.
- Mỗi lần Save, extension ghi lại từ, nghĩa, và từ câu nào, Part nào, mã lỗi gì (lưu trong `vocab.saved`).
- Hôm nào có từ lưu từ câu sai trong 14 ngày qua, lịch có việc **Ôn N từ lưu từ câu sai**: mở My vocabulary, làm FLASHCARD rồi WRITE. Việc tự đánh dấu xong khi bạn ở trang My vocabulary đủ 5 phút.
- Tab Tiến độ → Trí nhớ & sửa lỗi: số từ đã lưu, chia theo mã lỗi, và các từ gần nhất.

## Mốc giờ Reading và tốc độ P7 (v0.14)

Khi làm Reading trên Parroto (đề full hoặc chỉ P5–P7, Test/Practice Mode), góc trái dưới có khung **⏱ TOEIC Coach**:
- Dùng chính đồng hồ đếm ngược của Parroto. Reading bắt đầu tính khi bạn mở câu ≥ 101; tạm dừng đề thì đồng hồ của khung cũng dừng.
- Mốc: **P5 xong ở 11:00, P6 ở 20:00, P7 dùng 55 phút còn lại**. Nếu lúc vào Reading còn ít hơn 75 phút, các mốc tự co lại theo tỷ lệ.
- Dòng thứ hai báo bạn đang **nhanh/chậm bao nhiêu** so với kế hoạch, và lẽ ra đang ở câu nào. Màu xanh là ổn, vàng là chậm tới 3 phút, đỏ là chậm hơn 3 phút.
- Ở P7, mỗi đoạn có **ngân sách riêng** tính theo số câu và loại đoạn (đơn/kép/ba; extension đọc số ảnh của đoạn trên trang). Vượt ngân sách thì khung chuyển đỏ và nhắc "đoán câu khó, sang đoạn sau".
- Quá mốc P5 hoặc P6 mà vẫn đang ở Part đó thì khung nhắc chuyển Part.
- Bấm vào khung để thu gọn thành một số "⏱ +1:20".
- Số giây từng câu được gửi về extension (`pace`). Tab Tiến độ → Tốc độ & sức bền hiện giây/câu P5/P6/P7 của 4 đề gần nhất (mục tiêu P5 ≤ 22, P6 ≤ 34, P7 ≤ 61) và các đoạn P7 bị vượt ngân sách.

## Huấn luyện Part 3/4 ngay trên Parroto (v0.15)

**Khi làm P3/P4** (mỗi bộ 3 câu có audio riêng), góc trái dưới có khung **🎧 TOEIC Coach**:
- **Trước khi bấm phát:** khung nhắc đọc trước 3 câu hỏi, đếm số giây đọc (thi thật có khoảng 20–30 giây), và nói từng câu cần nghe gì. Ví dụ "việc sắp làm → câu cuối: I'll…, Let me…" hoặc "vấn đề → sau but, unfortunately". Extension tự nhận ra loại câu hỏi.
- **Đang nghe:** đáp án đi theo thứ tự, khung cho biết bạn đang ở khoảng của câu nào. Nhắc: nghe được đáp án câu sau thì đoán ngay câu trước.
- **Nghe xong:** nhắc chọn ngay (thi thật khoảng 8 giây/câu) rồi đọc trước bộ sau. Nếu bạn nghe lại một bộ trong lúc làm đề, khung nhắc rằng thi thật chỉ nghe một lần.
- Số lần nghe lại và số giây đọc trước của từng bộ được lưu. Tab Tiến độ có dòng "Nghe P3/P4 trên Parroto".

**Trên trang kết quả**, mỗi câu sai P3/P4 có dòng **🎧 Luyện kiểu hội thoại này trên Parroto**: 2 bài trong 267 bài TOEIC Listening (dictation + shadowing) cùng chủ đề (khách sạn, giao hàng, tuyển dụng…). Bài bạn chưa đạt 85 điểm được ưu tiên. Extension cần biết danh sách bài: mở trang TOEIC Listening của Parroto một lần là đủ.

## Dạng ngữ pháp cho câu sai Part 5 (v0.16)

- Trên trang kết quả (tab Part 5), mỗi câu sai có dòng **📐 Dạng** gồm tên dạng ngữ pháp và mẹo xử lý trong 15–20 giây. Các dạng: từ loại, thì & bị động, hòa hợp chủ–vị, to-V/V-ing, giới từ vs liên từ, đại từ, mệnh đề quan hệ, so sánh, cặp liên từ, từ vựng. Extension nhận dạng từ câu hỏi và 4 phương án; đo trên kho 300 câu tự soạn đúng 88%.
- Nút **Luyện 5 câu dạng này** mở panel ở tab mới, vào thẳng 5 câu cùng dạng trong kho luyện P5 của extension (Parroto không có luyện theo dạng ngữ pháp).
- Dạng của các câu sai trong đề thật được lưu lại. Bài luyện P5 thường (và sprint) tự ưu tiên các dạng bạn sai nhiều trong 21 ngày qua.
- Tab Tiến độ → Độ chính xác chi tiết: dòng "Part 5 đề thật – dạng sai nhiều nhất".

## Thẻ mẹo thi và quiz mẹo (v0.17)

- Kho **33 mẹo** cho 7 Part (tự viết, dựa trên tài liệu nghiên cứu). Mỗi mẹo gắn với mã lỗi nó giúp sửa, và với dạng ngữ pháp nếu là mẹo P5.
- **Trên trang làm đề Parroto**, lần đầu bạn vào mỗi Part, góc phải trên hiện thẻ **💡 Mẹo Px** gồm 3 mẹo. Extension chọn theo các lỗi bạn mắc ở Part đó trong 14 ngày qua (mã lỗi, dạng P5), mẹo đã xem nhiều thì nhường chỗ cho mẹo khác. Bấm "Đã hiểu" để thu gọn thành nút 💡, bấm lại để mở.
- **Tab Luyện → Quiz mẹo thi**: 10 tình huống trong phòng thi, chọn cách xử lý đúng (phím 1–3), xem mẹo sau mỗi câu. Câu sai quay lại theo lịch giãn cách.
- Ngày tổng kết tuần có thêm việc **Quiz mẹo thi (10 câu)**, tự đánh dấu xong khi làm đủ 10 câu.

## Quy tắc tự điều chỉnh (từ ngày 9)

| Điều kiện (7 ngày qua) | Điều chỉnh |
|---|---|
| Part đúng < 60% với ≥ 20 câu | Thêm 20 phút luyện Part đó |
| Mã lỗi đứng đầu là A (≥ 3 lỗi) | Dictation 3 bài thay vì 2 |
| Mã lỗi đứng đầu là V | Thêm 1 ván Word Rain |
| Mã lỗi đứng đầu là D | Thêm 1 bộ P2 |
| Mã lỗi đứng đầu là G | Thêm 1 bộ P5 |
| ≥ 3 lỗi hết giờ (T) ở Reading | P5 bấm 9 phút thay vì 11 |
| Thẻ quá hạn > 100 (bạn nhập) | Tạm dừng từ mới |

Các ngưỡng là heuristic, chưa được nghiên cứu kiểm chứng.

## Tab Luyện (bước 3)

- **Part 5**: 300 câu tự soạn, 10 dạng × 30 câu (từ loại, thì & bị động, hòa hợp chủ–vị, to-V/V-ing/V3, giới từ vs liên từ, đại từ, mệnh đề quan hệ, so sánh, cặp liên từ, từ vựng & collocation). 20 giây/câu, phím 1–4 hoặc A–D, Enter để qua câu. Mỗi câu có quy tắc giải ngắn.
- **Part 2**: 150 câu tự soạn. Máy đọc câu hỏi và 3 đáp án (giọng Mỹ / Anh / Úc có sẵn trên máy, chạy offline). Chọn đáp án, rồi gọi tên bẫy của 2 đáp án sai: **S** âm gần giống · **R** lặp từ · **Y** Yes/No cho câu WH · **W** sai loại thông tin · **A** liên tưởng chủ đề · **T** sai thì/người. Bật "Hiện chữ" nếu chưa nghe kịp.
- "Tự chọn dạng yếu" ưu tiên dạng có tỷ lệ đúng thấp trong 14 ngày; câu sai quay lại ngày mai, câu đúng quay lại sau 3, 7, 16 ngày.
- Việc "Luyện nhanh: 10 câu P5 + 10 câu P2" xuất hiện mỗi tối trong tab Hôm nay và tự tick khi làm đủ (20 câu P5 nếu tuần đó lỗi ngữ pháp nhiều).
- Câu do AI soạn có thể có lỗi: bấm **Báo câu sai** để ẩn câu đó.

## Bước 4: mô phỏng thi máy, đọc nhanh câu hỏi, paraphrase

- **Mô phỏng Reading thi máy** (tab Luyện → Part 6 / Part 7 / Mini Reading): mở tab riêng, đoạn văn bên trái, một câu hỏi bên phải; **Next / Back / Mark for review / Review**, bôi đen để **highlight** (bấm vào để xóa), đếm ngược (P6 ≈ 37 giây/câu, P7 ≈ 1 phút/câu), hết giờ tự nộp. Kết quả theo dạng câu (chi tiết, NOT, suy luận, chèn câu, ý định tin nhắn, nhiều văn bản…) và thời gian từng câu. Kho: 8 đoạn Part 6 (32 câu) và 13 bộ Part 7 (10 đơn, 2 kép, 1 ba – 45 câu), tự soạn; bộ làm dưới 75% quay lại sớm hơn.
- **Đọc nhanh câu hỏi Part 3/4**: hiện 3 câu hỏi trong 6/9/12 giây rồi ẩn; chọn mỗi câu hỏi về gì (thời gian, lý do, đề nghị, cách thức…). 40 bộ.
- **Paraphrase**: nối cụm trong bài với cách nói lại trong đáp án, 2 vòng × 5 cặp. 192 cặp có sẵn + cặp bạn tự thêm từ câu sai (ưu tiên ôn cặp của bạn).
- Tab Hôm nay tự thêm: mô phỏng (ngày có P6/P7), đọc nhanh câu hỏi (ngày có P3/P4), paraphrase (từ ngày 9). Việc trong ngày giờ xếp theo giờ.

## Bước 5: dashboard và viết câu tự chấm

- **Tab Tiến độ**: ô số liệu (đề full gần nhất, số ngày tới kỳ thi, phút học 7 ngày, từ mới), biểu đồ điểm **L / R** qua các đề full, biểu đồ **phút học 14 ngày** so với kế hoạch, thanh **tỷ lệ đúng theo Part** (⚠ dưới 60%), bảng **tuần này so với tuần trước**. Rê chuột lên điểm/cột để xem số.
- **Viết câu tự chấm** (tab Luyện): lấy từ lỗi mã V/G trong sổ lỗi (21 ngày) và câu Part 5 bạn từng sai. Viết 1 câu mới → extension nhắc lỗi hình thức (quá ngắn, thiếu chấm, thiếu từ cần dùng) và hiện câu mẫu → bạn tick 4 tiêu chí → Đạt / Chưa đạt. Câu chưa đạt quay lại ngày mai. Không dùng AI.
- Tab Hôm nay thêm việc "Viết câu tự chấm" khi có câu đang chờ.

## Bước 6: trái nghĩa và mindmap (bổ trợ)

- **Trái nghĩa** (tab Luyện): nối từ với từ trái nghĩa, 2 vòng × 5 cặp, 76 cặp thường gặp trong bối cảnh công sở (approve/reject, temporary/permanent, mandatory/optional…). Nối xong hiện nghĩa tiếng Việt. Hữu ích cho câu NOT và câu suy luận.
- **Mindmap chủ đề** (tab Luyện → Mở mindmap): 12 chủ đề TOEIC × 3 nhánh × 4 từ (144 từ) kèm nghĩa và cụm đi kèm. Bấm từ để xem, nghe phát âm, đánh dấu "Đang học" / "Đã nhớ"; bật "Ẩn nghĩa" để tự kiểm tra; thêm từ của bạn vào nhánh. Mỗi chủ đề hiện số từ đã nhớ.
- Hai bài này có bằng chứng yếu hơn, nên không được thêm vào việc hằng ngày; dùng khi muốn đổi không khí.

## Tự kiểm tra

Mở bất kỳ trang Parroto nào với `#tc-debug` ở cuối địa chỉ (vd `https://parroto.app/exams/toeic#tc-debug`). Góc phải dưới hiện tóm tắt: phiên bản, ngày thi, kết quả tự ghi, lịch sử, dạng câu yếu, số bài nghe, thời gian hôm nay, cảnh báo đọc trang. Chỉ hiện số liệu tóm tắt và chỉ hiện khi có `#tc-debug`.

Đã kiểm tra trong Chrome thật (profile riêng, tài khoản test, 21/11/2026, v0.2.1): đọc đúng 2 kết quả đề, Exam History, Exam Analytics và 267 bài TOEIC Listening.

## Dữ liệu

- Lưu trong `chrome.storage.local` của extension.
- Tự sao lưu mỗi tuần vào `Downloads/toeic-coach/backup-YYYY-MM-DD.json`. Nút "Sao lưu ngay" / "Nhập từ file" ở tab Cài đặt.
- **Gỡ extension sẽ xóa dữ liệu**: hãy sao lưu trước.

## Phát triển

```bash
node --test tests/lib.test.mjs
```

Cấu trúc:
- `lib/plan.js`: lộ trình 30 ngày + dựng việc trong ngày, phân đề không trùng
- `lib/rules.js`: thống kê, quy tắc điều chỉnh, lịch làm lại câu sai
- `content/parroto.js`: đọc trang Parroto (sửa file này nếu Parroto đổi giao diện)
- `sw.js`: nhận dữ liệu, nhắc giờ, sao lưu
- `panel/`: giao diện

Panel xem thử được như trang web thường (dữ liệu vào localStorage) bằng cách chạy một server tĩnh ở thư mục này rồi mở `/panel/panel.html`.
