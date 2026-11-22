---
title: Lưu từ trong câu sai vào Saved Vocabulary của Parroto
date: 2026-11-22
priority: high
---
- Spike trước: trang kết quả / Review answers có cho chạm-để-lưu từ không? Nếu không, Parroto lưu từ qua thao tác nào (dictionary search, bài nghe) có thể kích hoạt từ trang kết quả?
- Sau đó: nút lưu trên câu sai, ghi nguồn (đề, câu, mã lỗi) trong storage extension; ghi chú họ từ/collocation/cặp dễ nhầm; lịch ngày thêm Word Rain/Spelling Bee cho từ lưu từ lỗi.

## Kết quả spike (22/11/2026, Ego, tài khoản test)
- Trên Review answers, các phương án là nút bị khoá: chạm vào từ **không** lưu được.
- Parroto có hộp **Dictionary** (nút "Search dictionary" ở đầu mọi trang, `input[placeholder="Search dictionary"]`): tra từ → mỗi nghĩa có IPA UK/US, audio, định nghĩa, câu ví dụ và nút **Save**.
- Save đưa từ vào **My vocabulary** (`/my-vocabulary`) kèm nghĩa Việt ("thang"). Trang này có 3 chế độ ôn sẵn: **LIST / FLASHCARD / WRITE**.
- Giới hạn: tài khoản free lưu tối đa **100 từ** (Premium 5000). Cần biết tài khoản chính là free hay PRO để quyết định có lọc từ trước khi lưu không.
- Hướng làm: bôi đen từ trong câu sai trên trang kết quả → extension mở hộp Dictionary của Parroto, điền sẵn từ, rồi người học tự chọn nghĩa và bấm Save. Extension ghi nguồn (đề, câu, mã lỗi) vào storage của mình và xếp ôn FLASHCARD/WRITE của My vocabulary vào lịch ngày. Không tự bấm Save thay người học, để người học tự chọn nghĩa đúng.
- Từ "ladder" đã được lưu vào My vocabulary của tài khoản test.

## Đã làm (v0.13.0, 22/11/2026)
- Nút tra nhanh đáp án ngắn trong khung câu sai, cộng bôi đen từ → mở Dictionary Parroto điền sẵn; ghi nguồn khi người học bấm Save.
- Việc "Ôn N từ lưu từ câu sai" trong lịch (link My vocabulary, xong khi ở trang ≥ 5 phút); số liệu trong Tiến độ.
- Test bằng Ego trên tài khoản test: lưu "meetings" (P5 câu 101), có trong My vocabulary và `vocab.saved`. Đã lưu thêm "ladder" lúc spike.
- Chưa làm: ghi chú họ từ/collocation/cặp dễ nhầm (định nghĩa Parroto đã có nghĩa + ví dụ; cân nhắc sau).
