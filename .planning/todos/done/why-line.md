---
title: Dòng "vì sao" cho câu sai quan trọng
date: 2026-11-22
priority: medium
---
- Bắt buộc với câu sai khi tự tin và câu lặp mã lỗi đứng đầu 2 tuần; câu khác chỉ bấm mã.
- Nhập ngay trong khung TOEIC Coach trên trang kết quả Parroto (một dòng).
- Hiện lại khi câu đến hạn làm lại (trên Parroto và trong Sổ lỗi).

## Đã làm (v0.19.0, 23/11/2026)
- lib/why.js: recurringCodes (2 mã nhiều nhất 14 ngày, ≥ 3), importantReason (tự tin / mã lặp; bỏ T), missingWhy.
- Trang kết quả: nút "Tôi đã chắc chắn khi chọn" (confidence high), ô vì sao mở sẵn cho câu quan trọng, Enter để lưu; chế độ làm lại hiện "Lần trước bạn ghi" sau khi chọn.
- SW: whyNote, errorConf. Sổ lỗi: 📝 trong danh sách đến hạn, nhắc câu quan trọng thiếu dòng vì sao.
- Test Ego: Test 10 câu 1 (gặp popup khuyến mãi Parroto che trang, bấm "Maybe later").
