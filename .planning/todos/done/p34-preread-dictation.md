---
title: P3/P4 – đồng hồ đọc trước câu hỏi + dẫn sang dictation Parroto
date: 2026-11-22
priority: medium
---
- Khi làm P3/P4 trên Parroto: nhắc đọc trước 3 câu hỏi của bộ tiếp theo, đánh dấu từ khóa.
- Câu sai P3/P4 → mở bài Dictation/Shadowing Parroto cùng chủ đề (267 bài TOEIC Listening); Whisper chỉ dùng khi không có bài tương ứng.

## Đã làm (v0.15.0, 22/11/2026)
- lib/listen.js: classifyFocus (13 loại), LISTEN_FOR, topicsOf (13 chủ đề), matchLessons; có test.
- Khung 🎧 trên trang làm đề P3/P4: bộ câu = các "Question N" sau mỗi thẻ audio; 3 trạng thái đọc trước / đang nghe / xong; đếm nghe lại và giây đọc trước → `pace[session].listen`.
- Trang kết quả: gợi ý 2 bài dictation Parroto cùng chủ đề cho câu sai P3/P4 (link /lessons/dictation/<slug> đã mở thử đúng).
- Sửa kèm: khi chưa bấm câu nào, câu hiện tại = câu đầu tiên đang hiện trên màn hình (dùng chung cho khung Reading).
- Test bằng Ego trên phiên P3 TOEIC 2023 Test 8 (tài khoản test, đang dở).
