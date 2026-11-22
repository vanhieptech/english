---
title: Mốc giờ Reading và tốc độ P7 phủ lên đề Parroto
date: 2026-11-22
priority: high
---
- Khi làm Reading (Test Mode) trên Parroto: mốc P5 xong 0:11, P6 0:20, ngân sách từng đoạn P7 theo số câu; cảnh báo khi vượt.
- Ghi giây/câu theo Part và số câu bỏ trống mỗi đề vào chỉ số Tốc độ & sức bền.

## Đã làm (v0.14.0, 22/11/2026)
- lib/pace.js: mốc 11/20/75, ngân sách đoạn P7 theo trọng số đơn 0.9 · kép 1.1 · ba 1.2 phút/câu, co theo thời gian còn lại; có test.
- Khung ⏱ trên trang làm đề: đọc đồng hồ Parroto (cạnh nút SUBMIT), câu hiện tại = nút số có `ring-primary`, nhóm đoạn P7 = khối chứa ảnh (số ảnh = đơn/kép/ba).
- SW lưu `pace[session]`; Tiến độ hiện giây/câu và đoạn vượt ngân sách.
- Test bằng Ego, phiên Reading TOEIC 2023 Test 9 trên tài khoản test (đang dở, chưa nộp).
