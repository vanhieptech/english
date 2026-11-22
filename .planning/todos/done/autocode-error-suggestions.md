---
title: Gợi ý mã lỗi + xác nhận 1 chạm (v0.8)
date: 2026-11-22
priority: high
---
- Content script đọc Review answers từng Part (chọn/đúng/phương án/câu hỏi/giải thích) → gửi đặc trưng, không gửi nội dung.
- Quy tắc heuristic theo Part (P2 lặp từ/Yes-No → D; P5/6 cùng gốc từ / giới từ / đại từ / dạng V → G, khác từ → V; P6 cả câu → I; câu hỏi imply/most likely → I; closest in meaning → V; chi tiết → P/A; bỏ trống → T; chưa review → theo Part, độ tin thấp).
- UI: gom theo Part, mã gợi ý chọn sẵn kèm lý do; "Chấp nhận cả Part", "Chấp nhận tất cả"; phím ↑↓, chữ cái, Enter.
- Học từ sửa của người dùng: đổi gợi ý mặc định theo Part nếu bị sửa nhiều.
