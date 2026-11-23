---
title: Bằng chứng tiến bộ – thẻ tuần, bài mốc, đường điểm, gợi ý thêm nửa đề
date: 2026-11-22
priority: high
---
- Thẻ "Tuần này vs tuần trước" đầu tab Hôm nay: chỉ số dẫn (độ chính xác L/R từ đề Parroto, P5 luyện, giây/câu P5, làm lại đúng, giây/câu P7, dictation, từ Mastered, nghe lại P3/4) + mũi tên + một câu nhận xét.
- Bài mốc cố định 20 phút (P2 + P5, Test Mode) ngày 4, 11, 18, 26; biểu đồ độ chính xác P2/P5 qua các bài mốc.
- Đường điểm đề full (L+R Parroto) có dải ±35.
- Gợi ý thêm nửa đề Reading khi sau đề #2: đề full gần nhất đã gắn mã hết và làm lại đến hạn < 10.

## Đã làm (v0.18.0, 23/11/2026)
- lib/progress.js: skillWeek (8 chỉ số, ngưỡng "bằng nhau", câu nhận xét), checkpoints/isCheckpoint (phiên chỉ P2+P5), extraHalfSuggestion.
- Hôm nay: thẻ tiến bộ (mở sẵn khi so được ≥ 2 chỉ số) + gợi ý nửa đề; lịch có bài mốc ngày 4/11/19/26 (tự xong khi có phiên P2+P5).
- Tiến độ: đường tổng điểm có dải ±35 (lineChart thêm `bands`), biểu đồ bài mốc.
- Kiểm tra trong Ego (bản test, đã đặt ngày thi 20/12 cho bản đó).
