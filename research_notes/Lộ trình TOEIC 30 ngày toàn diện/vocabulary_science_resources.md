# Học từ vựng TOEIC nhanh: bằng chứng khoa học, khối lượng ôn tập và nguồn tài liệu dùng hợp pháp (cập nhật 11/2026)

Ghi chú cho người viết báo cáo: các nhãn bằng chứng dùng trong tài liệu này là **[MẠNH]** (meta-analysis hoặc kết quả lặp lại nhiều lần), **[TRUNG BÌNH]** (vài thí nghiệm có kiểm soát, phần lớn trong lab), **[YẾU/TRÁI CHIỀU]** (kết quả mâu thuẫn hoặc dữ liệu ít), **[CHƯA KIỂM CHỨNG]** (kiến thức nền của người nghiên cứu, chưa mở lại nguồn gốc trong phiên này, nên cần kiểm tra trước khi trích dẫn số liệu). Các link được giữ nguyên từ nguồn.

## Câu 1: Mỗi phương pháp ghi nhớ hiệu quả đến đâu?

### Takeaway
Bằng chứng mạnh nhất thuộc về ôn giãn cách (spacing) và luyện truy hồi (retrieval practice/testing effect). Trong các thuật toán SRS, FSRS dự đoán việc quên chính xác hơn rõ rệt so với các thế hệ cũ. Hình thức truy hồi nên đổi theo mục tiêu: nhận diện (recognition) phù hợp cho liên kết dạng-nghĩa, gợi nhớ/gõ (recall) phù hợp cho chính tả và khả năng dùng chủ động. Nhóm từ đồng nghĩa hoặc cùng trường nghĩa trong một buổi dễ gây nhiễu. Keyword mnemonic giúp học nhanh nhưng bằng chứng về giữ lâu thì trái chiều. Mind map và "học theo phong cách" không có bằng chứng tốt cho từ vựng.

### Cited Findings

**Ôn giãn cách (spacing) [MẠNH]**
- Meta-analysis của Cepeda và cộng sự (2006) về thực hành phân tán với nhiệm vụ gợi nhớ từ ngữ tổng hợp 839 phép đo, từ 317 thí nghiệm trong 184 bài báo. Khoảng cách tối ưu giữa các lần học (ISI) tăng khi khoảng thời gian cần nhớ (retention interval) tăng — [PubMed 16719566](https://pubmed.ncbi.nlm.nih.gov/16719566/); [PDF](https://www.evullab.org/pdf/CepedaPashlerVulWixtedRohrer-PB-2006.pdf)
- Cepeda, Vul, Rohrer, Wixted & Pashler (2008, *Psychological Science*), "temporal ridgeline", thử 26 tổ hợp khoảng cách và độ trễ kiểm tra. Khi cần nhớ sau 1 năm, khoảng cách tối ưu xấp xỉ 20% độ trễ, nhưng tỷ lệ này không giữ tuyến tính: với độ trễ ngắn, tỷ lệ tối ưu lớn hơn — [kết quả tìm kiếm escholarship/Cepeda 2008](https://home.cs.colorado.edu/~mozer/Research/Selected%20Publications/reprints/Cepedaetal2009.pdf). (Chỉ đọc được qua snippet, cần kiểm tra con số trong bài gốc.)
- Với từ vựng L2, Nakata so sánh giãn cách đều và giãn cách tăng dần. Giãn cách tăng dần có lợi thế "hạn chế nhưng có ý nghĩa thống kê", còn việc có giãn cách hay không thì có hiệu ứng lớn hơn hẳn. Một bản tóm tắt luận văn lại báo cáo không có khác biệt giữa hai kiểu, tức kết quả về kiểu giãn cách là trái chiều — [Nakata, SSLA "Effects of expanding and equal spacing"](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/effects-of-expanding-and-equal-spacing-on-second-language-vocabulary-learning/D1D796306985C52F9BE7A1200AC50DB9)
- Ý nghĩa thực tế: giãn cách là bắt buộc; chọn lịch tăng dần hay đều là chuyện thứ yếu.

**Thuật toán SRS: SM-2 và FSRS [MẠNH, dựa trên dữ liệu ôn tập thật]**
- Benchmark srs-benchmark của dự án open-spaced-repetition chạy trên khoảng 10.000 bộ thẻ, gồm 349.923.850 lượt ôn khi bỏ lượt ôn trong cùng ngày và 519.296.315 lượt khi tính cả. Log loss (thấp hơn là tốt hơn): FSRS-7 0,3370; FSRS-6 0,3460; FSRS-5 0,3561; FSRS v3 0,4364; HLR 0,4694; Ebisu v2 0,4989; mức nền "AVG" 0,3945. AUC tương ứng: FSRS-6 0,7034, FSRS-7 0,7220 — [srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark)
- Trang benchmark hiện **không** có dòng SM-2 trong bảng kết quả, và tỷ lệ FSRS vượt SM-2 chỉ được vẽ thành biểu đồ, không ghi thành số — [srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark). Cần mở biểu đồ superiority hoặc trang expertium.github.io nếu muốn trích một con số so sánh.
- Theo nguyên tắc của chính benchmark, thuật toán không vượt được mức nền AVG thì không thể coi là tốt. Các phiên bản FSRS từ v4 trở lên đều vượt mức này — [srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark)
- Mô hình mạng nơ-ron RWKV đạt log loss 0,2773 nhưng có khoảng 2,76 triệu tham số, không thực tế cho một app cá nhân. FSRS-6 chỉ có 21 tham số — [srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark)

**Desired retention (tỷ lệ nhớ mục tiêu) [TRUNG BÌNH, mô phỏng]**
- Quan hệ giữa khối lượng ôn và tỷ lệ nhớ mục tiêu có hình chữ U. Đặt mục tiêu cao thì khoảng cách ôn ngắn lại và số lượt ôn tăng; đặt quá thấp thì quên nhiều và phải học lại. Tính năng CMRR (Compute Minimum Recommended Retention) có từ Anki 24.04, tối ưu tỷ số khối lượng ôn chia cho lượng kiến thức — [FSRS wiki: The Optimal Retention](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Optimal-Retention)
- Trang wiki trên không đưa ra khoảng khuyến nghị bằng số và không định lượng mức tăng khối lượng khi vượt 0,95 — [FSRS wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Optimal-Retention). [CHƯA KIỂM CHỨNG] Mặc định của Anki là 0,90, và tài liệu Anki khuyên giữ trong khoảng 0,80–0,95 — [Anki manual, deck options](https://docs.ankiweb.net/deck-options.html)

**Luyện truy hồi / testing effect [MẠNH]**
- [CHƯA KIỂM CHỨNG trong phiên này, nhưng là kết quả kinh điển] Karpicke & Roediger (2008, *Science*), học 40 cặp từ Swahili–Anh: tiếp tục kiểm tra lại các từ đã nhớ giúp nhớ sau 1 tuần khoảng 80%, còn bỏ không kiểm tra lại thì chỉ khoảng 30–35%. Học lại thêm mà không kiểm tra hầu như không giúp gì — [DOI 10.1126/science.1152408](https://doi.org/10.1126/science.1152408)
- [CHƯA KIỂM CHỨNG] Dunlosky và cộng sự (2013) xếp practice testing và distributed practice là hai kỹ thuật duy nhất có "high utility". Keyword mnemonic, imagery, highlight và đọc lại được xếp "low utility" — [DOI 10.1177/1529100612453266](https://doi.org/10.1177/1529100612453266)
- Truy hồi nhiều lần trong cùng một buổi: Nakata (2016/2017, SSLA) cho 98 người Nhật học 16 cặp từ với 1, 3, 5 hoặc 7 lần truy hồi — [SSLA "Does repeated practice make perfect?"](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/does-repeated-practice-make-perfect-the-effects-of-withinsession-repeated-retrieval-on-second-language-vocabulary-learning/F14BA8A576CD2563D14CEA46E35D842E). Phiên này không lấy được phần kết quả. [CHƯA KIỂM CHỨNG] Theo trí nhớ của người nghiên cứu, lợi ích giảm dần sau khoảng 3 lần, và giãn cách giữa các buổi quan trọng hơn lặp nhiều trong một buổi.

**Hình thức truy hồi: recognition, recall, gõ phím [TRUNG BÌNH]**
- Nghiên cứu với 64 sinh viên học cặp từ Swahili–Anh: dạng gợi nhớ (recall) hiệu quả hơn nhận diện (recognition) để học chính tả chủ động. Ngược lại, recognition phù hợp hơn để tạo liên kết dạng-nghĩa. Productive recall có thể làm điểm trong lúc học thấp hơn, kiểu "khó mà có ích" — [kết quả tìm kiếm Nakata/Webb; core.ac.uk](https://core.ac.uk/download/215386255.pdf); [ScholarSpace Hawaii](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/51bbecb0-1f4e-4814-b07a-b356d67a9497/content)
- Receptive recall (thấy từ tiếng Anh, nhớ nghĩa) cho nhiều từ học được trên mỗi phút hơn. Productive recall (thấy nghĩa, nhớ ra từ tiếng Anh) cho tổng mức tiến bộ cao nhất, nhất là khi kiểm tra theo hướng chủ động — [tóm tắt trong tài liệu Nakata/Webb](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/e4bfc233-663a-4bfa-a01e-481cc06f7e1d/content)
- Ý nghĩa cho TOEIC: bài thi Listening & Reading chủ yếu kiểm tra **nhận diện** (receptive). Nên ưu tiên Anh→Việt, audio→nghĩa và cloze trắc nghiệm. Bổ sung một ít gõ từ (Việt→Anh, cloze gõ) để củng cố chính tả và tốc độ nhận diện. Đây là suy luận, không phải kết quả đo trực tiếp trên TOEIC.
- Audio-to-word, cloze và matching: không tìm được meta-analysis riêng cho từng hình thức trong phiên này (xem phần Gaps).

**Nhóm từ theo nghĩa và nhiễu (interference) [TRUNG BÌNH; trái chiều gần đây]**
- Nakata & Suzuki (2019, SSLA 41(2), 287–311) cho biết các nghiên cứu trước phần lớn ủng hộ tác động **tiêu cực** của semantic clustering (học cùng lúc các từ cùng loại nghĩa, như từ đồng nghĩa hay cùng danh mục), nhưng kết quả gần đây trái chiều. Giải thích theo thuyết nhiễu: các nghĩa giống nhau cạnh tranh với nhau. Nghiên cứu cũng xem giãn cách có giảm nhiễu hay không — [Cambridge](https://www.cambridge.org/core/product/F58BA8D70385603B9C42E408BFCB8A10); [PDF](https://core-prod.cambridgecore.org/core/services/aop-cambridge-core/content/view/F58BA8D70385603B9C42E408BFCB8A10/S0272263118000219a.pdf/effects_of_massing_and_spacing_on_the_learning_of_semantically_related_and_unrelated_words.pdf)
- [CHƯA KIỂM CHỨNG] Tinkham (1993, 1997) và Waring (1997): semantic clustering cản trở việc học, còn thematic clustering (các từ thuộc cùng một chủ đề/tình huống như "sân bay": *boarding pass, delay, gate*) thì trung tính hoặc có lợi một chút.
- Hệ quả thiết kế: được phép xếp theo chủ đề TOEIC (văn phòng, du lịch, tài chính), nhưng **không** đưa *postpone, delay, defer* vào cùng một lô học mới. Từ đồng nghĩa nên được nối với nhau sau khi từng từ đã ổn định.

**Keyword mnemonic [YẾU/TRÁI CHIỀU khi xét giữ lâu]**
- Wang, Thomas & Ouellette (1992), 4 thí nghiệm với thiết kế giữa các nhóm: keyword giúp học nhanh và nhớ tức thì tốt hơn, nhưng **quên dài hạn nhiều hơn** học thuộc lòng — [UCF STARS](https://stars.library.ucf.edu/facultybib1990/601); [abstract](https://stars.library.ucf.edu/scopus1990/1045)
- Heliyon (2024), 110 sinh viên Trung Quốc: keyword kết hợp retrieval practice **không vượt** retrieval practice đơn thuần ở bài kiểm tra cuối — [PMC10839596](https://pmc.ncbi.nlm.nih.gov/articles/PMC10839596)
- Kết luận: chỉ nên dùng như "cứu hộ" cho những từ đã quên lặp lại nhiều lần (leech), không dùng làm phương pháp chính.

**Học từ trong ngữ cảnh / số lần gặp cần thiết [TRUNG BÌNH; con số dao động lớn]**
- Meta-analysis của Webb, Uchihara & Yanagisawa (2023; 24 nghiên cứu, 2.771 người): học ngẫu nhiên qua input có nghĩa (đọc, nghe, vừa đọc vừa nghe) chỉ giúp nhớ 9–18% từ mục tiêu ở bài kiểm tra ngay sau đó và 6–17% ở bài kiểm tra muộn. Ba kênh cho kết quả tương đương — [Cambridge (kết quả tìm kiếm)](https://cambridge.org/core/services/aop-cambridge-core/content/view/S0261444822000507)
- Số lần gặp cần thiết: tùy nghiên cứu, từ 1–4 lần đến ít nhất 6 lần (khi học qua đoạn văn). Không có một con số cố định — [SSLA 2015, UCL](https://discovery-pp.ucl.ac.uk/10043811/1/SSLA-Final%20Proofs-6th%20July%202015.pdf). Webb (2005): đọc 10 từ mục tiêu 3 lần trong câu ngắn cho mức tiến bộ trên 73% ở các bài kiểm tra — [lextutor Ch09](https://www.lextutor.ca/text_encounters/Ch09.doc)
- [CHƯA KIỂM CHỨNG] Webb (2007, *Applied Linguistics*) thường được dẫn với ý: khoảng 10 lần gặp trở lên mới có kiến thức tương đối đầy đủ về một từ (nghĩa, chính tả, cú pháp, collocation). Cần xem bài gốc trước khi trích.
- Ý nghĩa: học thẻ có chủ đích (intentional) **nhanh hơn nhiều** so với chỉ đọc/nghe. Đọc/nghe là để bổ sung số lần gặp và học collocation, không thay thế được SRS.

**Họ từ / hình thái học, collocation, paraphrase [TRUNG BÌNH đến suy luận]**
- Các danh sách NGSL/TSL/BSL được bổ đề hóa (lemmatized), tức gộp các biến thể của một từ, nên app có thể gom theo lemma — [NGSL](https://www.newgeneralservicelist.com/new-general-service-list)
- [CHƯA KIỂM CHỨNG] Nation (*Learning Vocabulary in Another Language*, 2013) khuyến nghị dạy các phụ tố thông dụng (-tion, -ment, -able, un-, re-) để mở rộng ra cả họ từ. Đây là đồng thuận chuyên gia, không phải meta-analysis. Ý này đặc biệt quan trọng với TOEIC Part 5, nơi có nhiều câu hỏi chọn từ loại.
- Collocation và paraphrase: không tìm được meta-analysis trong phiên này. Đề TOEIC Part 3/4/7 thường paraphrase thông tin, ví dụ đoạn hội thoại nói "postpone" còn đáp án viết "delay". Đây là quan sát chuyên môn, không có nguồn đo lường cụ thể.

**Viết câu / generation effect, dual coding, mind map, giấc ngủ**
- [CHƯA KIỂM CHỨNG] Involvement Load Hypothesis (Laufer & Hulstijn 2001): nhiệm vụ có mức "evaluation" cao, như viết câu với từ mới, giúp nhớ tốt hơn đọc có chú thích. Tuy nhiên nó tốn thời gian hơn rất nhiều trên mỗi từ. Phiên bản cải tiến là "ILH Plus" — [Cambridge SSLA PDF](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/5C5984B326F37FBF3A3DDA3C0EB2996C/S0272263121000577a.pdf/involvement-load-hypothesis-plus-creating-an-improved-predictive-model-of-incidental-vocabulary-learning.pdf). Đánh giá: [TRUNG BÌNH] về hiệu quả trên mỗi từ, [YẾU] về hiệu quả trên mỗi phút.
- Dual coding/hình ảnh: [CHƯA KIỂM CHỨNG] Dunlosky 2013 xếp "imagery for text" ở mức low utility. Hình ảnh có ích với từ cụ thể (*forklift, invoice*) nhưng ít ích với từ trừu tượng.
- Mind map: không tìm thấy bằng chứng có kiểm soát cho học từ vựng L2. Xếp [YẾU].
- Giấc ngủ: [CHƯA KIỂM CHỨNG] có bằng chứng lab rằng ngủ giúp củng cố từ mới (Dumay & Gaskell 2007), và học tối/ôn sáng có lợi. Phiên này chưa lấy được nguồn.

**Hiệu quả tổng thể của học từ vựng có hỗ trợ công nghệ**
- Meta-analysis về học từ vựng L2 có hỗ trợ công nghệ (ReCALL, 2022): d = 0,64 (mức trung bình). Các tổng hợp trước đó báo cáo d từ 0,25 đến 0,80 — [Cambridge ReCALL](https://cambridge.org/core/services/aop-cambridge-core/content/view/08A549A6CFD1078406E6A4F8AFE28184/S0958344021000239a.pdf/metaanalysis_examining_technologyassisted_l2_vocabulary_learning.pdf)

### Inferences
- Hệ thống hằng ngày đề xuất cho app:
  1. Ôn thẻ đến hạn theo FSRS trước, với desired retention khoảng 0,90.
  2. Sau đó học lô từ mới theo chủ đề, tránh xếp từ đồng nghĩa cạnh nhau. Mỗi từ đi qua chuỗi: nhận diện Anh→Việt và audio→nghĩa, rồi cloze trắc nghiệm, rồi gõ từ.
  3. Nghe/đọc một đoạn TOEIC chứa các từ đã học để tăng số lần gặp và học collocation.
  4. Cuối buổi làm bài kiểm tra paraphrase/từ đồng nghĩa với những từ đã ổn định.
  5. Keyword mnemonic chỉ dùng cho leech; viết câu chỉ áp dụng cho khoảng 10% từ khó hoặc hay dùng.
- Interleaving (đan xen): nên trộn thẻ ôn cũ với thẻ mới và trộn các hình thức bài tập. Bằng chứng trực tiếp về interleaving cho từ vựng chưa được tìm thấy ở đây. Phần lớn bằng chứng mạnh về interleaving đến từ toán và phân loại hình ảnh [CHƯA KIỂM CHỨNG].

### Gaps
- Phiên này không lấy được con số "FSRS tốt hơn SM-2 ở X% người dùng". Biểu đồ superiority trên GitHub và expertium.github.io có thể có con số này.
- Kết quả cụ thể của Nakata 2017 (số lần truy hồi tối ưu) và Webb 2007 (số lần gặp) chưa được kiểm chứng từ bài gốc.
- Không tìm được meta-analysis riêng cho audio-to-word, cloze, matching, collocation, paraphrase, mind map, giấc ngủ và từ vựng L2.
- Karpicke & Roediger 2008, Dunlosky 2013, Tinkham, Laufer & Hulstijn được ghi từ kiến thức nền với DOI. Cần mở bài để xác nhận số liệu.

## Câu 2: Mỗi ngày học bao nhiêu từ mới là bền vững, và 30 ngày đạt được bao nhiêu từ?

### Takeaway
Quy tắc thực nghiệm của Anki: học đều X thẻ mới/ngày sẽ dẫn tới khoảng 10X lượt ôn/ngày ở trạng thái ổn định. Với 30 ngày, mức thực tế là khoảng 20–40 từ mới/ngày, tức khoảng 600–1.200 từ được giới thiệu, và chỉ một phần trong đó đạt mức nhớ vững. Nên ưu tiên khoảng 1.250 từ TSL, chọn những từ người học chưa biết sau một bài test xếp lớp.

### Cited Findings
- Hướng dẫn chính thức của Anki: học đều 20 thẻ mới/ngày thì dự kiến khoảng 200 lượt ôn/ngày. Muốn giảm tải ôn thì giảm số thẻ mới — [Anki manual](https://docs.ankiweb.net/deck-options.html?highlight=fsrs)
- Tỷ lệ 10:1 chỉ là ước lượng thô. Có trường hợp FSRS Simulator cho kết quả khác (ví dụ 200 thẻ mới / 255 lượt ôn). Một người trên diễn đàn khuyên người mới bắt đầu khoảng 5 thẻ/ngày — [Anki forum](https://forums.ankiweb.net/t/which-guideline-should-i-follow-fsrs-simulation-results-or-the-new-card-review-limit-ratio-rule/70470)
- Lượt ôn tiếp tục tăng chừng nào còn thêm thẻ mới. Có ý kiến cho rằng mức tăng xấp xỉ logarit nếu số thẻ mới mỗi ngày không đổi. Simulator dự báo tải ôn tăng mạnh ở mức 20 thẻ/ngày — [forum 1](https://forums.ankiweb.net/t/how-many-new-cards-can-be-studied-every-day-while-the-workload-stays-the-same-long-term/69218); [forum 2](https://forums.ankiweb.net/t/many-more-reviews-than-expected-with-new-card-settings/62292)
- Độ chính xác của simulator đang bị tranh luận: có báo cáo nó đánh giá thấp số thẻ đã nhớ trong bộ thẻ lớn — [forum](https://forums.ankiweb.net/t/fsrs-simulator-underestimates-the-number-of-cards-memorized/67162.md)
- Kết quả ngoài lab trong meta-analysis 2023: chỉ đọc/nghe thì giữ được 6–17% từ mục tiêu ([Cambridge](https://cambridge.org/core/services/aop-cambridge-core/content/view/S0261444822000507)). Vì vậy để đạt hàng trăm từ trong 30 ngày thì bắt buộc phải học có chủ đích.

### Inferences (tính toán của người nghiên cứu, cần ghi rõ là ước lượng)
- Giả định 6–10 giây/lượt ôn với dạng nhận diện, 15–20 giây/lượt với dạng gõ, và học mới tốn khoảng 30–60 giây/từ (gồm 3–4 bước luyện).
  - 20 từ/ngày: ôn cao điểm khoảng 150–200 lượt/ngày (khoảng 20–30 phút) cộng 10–20 phút học mới, tổng khoảng 40–50 phút. Sau 30 ngày có 600 từ.
  - 30 từ/ngày: khoảng 250–300 lượt ôn (khoảng 35–45 phút) cộng 15–30 phút học mới, tổng khoảng 60–75 phút. Sau 30 ngày có 900 từ.
  - 40 từ/ngày: khoảng 300–400 lượt ôn, tổng khoảng 90 phút trở lên, dễ "vỡ" nếu bỏ một ngày.
- Trong 30 ngày, tải ôn chưa đạt trạng thái ổn định (vì khoảng cách ôn chưa dài), nên những tuần cuối nặng nhất. Nên **ngừng thêm từ mới khoảng 3–5 ngày trước ngày thi** để ôn dồn.
- Mục tiêu thực tế cho người có nền NGSL cơ bản (khoảng 2.000 từ): giới thiệu khoảng 600–900 từ TSL/BSL. Tỷ lệ nhớ khi thi (retention khoảng 85–90%) đồng nghĩa khoảng 500–800 từ dùng được. Người mới bắt đầu nên lấp NGSL trước, vì NGSL một mình đã phủ 94% đề TOEIC (xem Câu 3).
- App nên có giới hạn mềm: tự động giảm số từ mới khi lượng ôn đến hạn vượt ngưỡng (ví dụ trên 250 lượt/ngày).

### Gaps
- Không có mô phỏng FSRS cụ thể cho kịch bản 30 ngày với 20/30/40 thẻ. Có thể chạy simulator trong Anki hoặc thư viện fsrs-rs/py-fsrs để có con số thật.
- Thời gian trung bình cho mỗi lượt ôn là giả định, chưa có nguồn đo lường.

## Câu 3: Các danh sách từ TOEIC mở (TSL, NGSL, BSL) và độ phủ của chúng

### Takeaway
NGSL 1.2 (2.809 từ) cộng TSL 1.2 (1.250 từ) phủ 98,5% từ ngữ trong đề TOEIC gần đây; riêng NGSL đã phủ khoảng 94%. Cả hai, cùng với BSL (1.700 từ), đều theo giấy phép CC BY-SA 4.0. Vì vậy có thể đóng gói vào app cá nhân, miễn là ghi công tác giả và giữ cùng giấy phép cho phần dữ liệu phái sinh.

### Cited Findings
- **TSL 1.2:** 1.250 từ, xây từ corpus 1,5 triệu từ lấy từ nhiều tài liệu luyện TOEIC. Khi kết hợp với NGSL, phủ 98,5% các đề TOEIC gần đây. Giấy phép CC BY-SA 4.0. Định dạng: CSV (có thống kê tần suất; bản lemmatized cho giảng dạy và cho nghiên cứu), TXT (xếp theo bảng chữ cái), XLSX (định nghĩa bằng tiếng Anh dễ hiểu). Trích dẫn khuyến nghị: "Browne, C., Culligan, B. (2013). The TOEIC Service List." kèm www.newgeneralservicelist.com. Phần giới thiệu trên trang lại ghi năm 2016, tức có bất nhất về năm — [TSL](https://www.newgeneralservicelist.com/toeic-service-list)
- **NGSL 1.2** (phát hành 04/2023): 2.809 headword, kèm file bổ sung 52 từ. Phủ khoảng 92% văn bản tiếng Anh nói chung, **94% đề TOEIC**, 93% Harry Potter và 95% nhiều chương trình TV. Giấy phép CC BY-SA 4.0. Có CSV, TXT, XLSX (định nghĩa dễ hiểu, thống kê tần suất đến 31k), cùng NGSL Learning Dictionary và Profiler — [NGSL](https://www.newgeneralservicelist.com/new-general-service-list)
- **BSL 1.2:** 1.700 từ, corpus 64 triệu từ văn bản kinh doanh. Kết hợp với NGSL phủ đến 97% văn bản kinh doanh thông thường. Giấy phép CC BY-SA 4.0. Có TXT và CSV — [BSL](https://www.newgeneralservicelist.com/business-service-list)
- Các danh sách cùng họ: NAWL 1.2 (học thuật) và FEL 1.2 (fitness) — [NGSL](https://www.newgeneralservicelist.com/new-general-service-list)
- Muốn dùng ngoài phạm vi giấy phép (ví dụ không muốn share-alike), có thể xin phép tác giả qua charlie-browne.com — [TSL](https://www.newgeneralservicelist.com/toeic-service-list)

### Inferences
- Thứ tự ưu tiên đề xuất: (1) TSL 1.250 từ, phần đặc thù TOEIC mà người học hay thiếu; (2) các từ NGSL người học chưa biết, xác định qua bài test xếp lớp; (3) BSL nếu còn thời gian. TSL và BSL có thể trùng nhau một phần; cần lọc trùng theo lemma.
- Nghĩa vụ theo CC BY-SA 4.0: ghi tên tác giả (Browne & Culligan), tên danh sách, link nguồn và link giấy phép. Nếu chỉnh sửa (thêm nghĩa tiếng Việt, ví dụ) thì phần dữ liệu phái sinh phải dùng cùng giấy phép **nếu phân phối**. App dùng cá nhân, không phân phát, gần như không phát sinh rủi ro. Mã nguồn app không bắt buộc theo CC BY-SA, chỉ phần dữ liệu.
- Tỷ lệ 98,5% là độ phủ token trên corpus tài liệu luyện TOEIC của tác giả, không có nghĩa là biết 98,5% câu hỏi.

### Gaps
- Không có số liệu độ phủ của riêng TSL (không kèm NGSL), cũng như của NGSL+TSL+BSL.
- Năm phát hành ghi không thống nhất (2013/2015/2016) trên trang chủ.

## Câu 4: Tài liệu luyện tập, từ điển, câu ví dụ, TTS miễn phí và hợp pháp

### Takeaway
Có thể đóng gói: NGSL/TSL/BSL (CC BY-SA 4.0), Princeton WordNet 3.0 (giấy phép kiểu BSD, cho phép phân phối kèm thông báo bản quyền), Open English WordNet (được mô tả là CC BY 4.0), dữ liệu Wiktionary/kaikki (CC BY-SA 4.0 + GFDL), và câu Tatoeba (CC BY 2.0 FR, một phần CC0). Audio Tatoeba phải kiểm tra giấy phép từng file vì có file NC hoặc không có giấy phép mở. TTS dùng Web Speech API của trình duyệt (không cần đóng gói). Đề mẫu của ETS miễn phí để **luyện cá nhân** nhưng có bản quyền: chỉ link tới, không nhúng vào app.

### Cited Findings
- **Princeton WordNet 3.0:** cho phép "use, copy, modify and distribute… for any purpose and without fee", với điều kiện giữ thông báo bản quyền và disclaimer trên mọi bản sao, và không dùng tên Princeton để quảng cáo. Giấy phép được OSI phê duyệt — [SPDX WordNet License](https://spdx.org/licenses/WordNet.html); [wnlicens](https://www.mankier.com/7/wnlicens). WordNet có quan hệ đồng nghĩa (synset) và trái nghĩa (antonym), phù hợp cho bài tập synonym/antonym.
- **Open English WordNet:** bản fork mã nguồn mở của Princeton WordNet. Một mirror GitHub ghi giấy phép CC BY 4.0; đây là nguồn thứ cấp và cần xem file LICENSE chính thức — [github.com/ekaf/english-wordnet](https://www.github.com/ekaf/english-wordnet)
- **Wiktionary:** nội dung được cấp phép kép CC BY-SA 4.0 và GFDL. Người tái sử dụng phải tuân theo CC BY-SA/GFDL và ghi công kèm link về trang gốc — [Wiktionary:COPY](https://en.wiktionary.com/wiki/Wiktionary:COPY); [Wikimedia legal](https://download.wikipedia.com/legal.html). Wiktextract chuyển dump enwiktionary thành JSON, và kaikki.org lưu trữ kết quả đó. Dự án hạ nguồn FreeDictionary gắn CC BY-SA 4.0 cho từng mục. Chưa xác nhận được file LICENSE chính thức của kaikki.org — [wiktextract](https://www.github.com/tatuylonen/wiktextract); [FreeDictionary](https://freedictionary.codeberg.page/print.html)
- **Tatoeba:** câu văn mặc định theo CC BY 2.0 FR, một số câu có thêm CC0 1.0. Audio thì **mỗi bản ghi mang giấy phép do người đóng góp chọn** (CC BY, CC BY-SA, CC BY-NC, hoặc không có giấy phép công khai). Giấy phép của từng file nằm trong file "Sentences with audio" trên trang Downloads. Không có gói tải audio hàng loạt hiện hành; bản ZIP tiếng Anh tạo năm 2017. Cách ghi công khuyến nghị: nêu nguồn, link giấy phép, liệt kê người đóng góp audio — [Tatoeba downloads](https://tatoeba.org/ca/downloads); [Tatoeba wiki](https://en.wiki.tatoeba.org/history/show-version/3365); [Wikipedia: Tatoeba](https://en.wikipedia.org/wiki/Tatoeba); [manythings Tatoeba MP3](https://mail.manythings.org/tatoeba/)
- **ETS (đơn vị ra đề TOEIC):** trang chuẩn bị chính thức có PDF "TOEIC Listening and Reading Sample Tests" (khoảng 2,36 MB), Examinee Handbook có phần câu hỏi mẫu, và có trang sample questions/practice. Một PDF đề mẫu (mẫu ST-05, 2016) ghi rõ việc sao chép hoặc tái sử dụng trái phép là bất hợp pháp — [ETS prepare](https://www.ets.org/toeic/test-takers/prepare/); [ETS sample questions](https://www.ets.org/toeic/test-takers/sample-questions.html); [Sample test PDF](https://www.mx.ets.org/content/dam/ets-org/pdfs/toeic/toeic-listening-reading-sample-test.pdf); [Examinee handbook](https://www.fr.ets.org/content/dam/ets-org/pdfs/toeic/toeic-listening-reading-test-examinee-handbook.pdf)
- Không nhầm với TOEIC Bridge, một bài thi khác dễ hơn — [TOEIC Bridge sample](https://www.ets.org/pdfs/toeic/toeic-bridge-listening-and-reading-sample-tests.pdf)
- **TTS:** [CHƯA KIỂM CHỨNG trong phiên này] Web Speech API (`speechSynthesis`) có sẵn trong Chrome, Safari và Edge, không cần khóa API. Chất lượng và danh sách giọng phụ thuộc hệ điều hành; một số giọng "online" của Chrome gửi văn bản lên máy chủ Google. Các giọng có sẵn trên macOS/iOS (Samantha, Daniel...) chạy offline — [MDN SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)

### Inferences
- Pipeline dữ liệu đề xuất cho app local:
  - Danh sách từ: TSL/NGSL/BSL dạng CSV.
  - Định nghĩa và phiên âm IPA: kaikki.org JSON (lọc theo danh sách từ).
  - Đồng nghĩa/trái nghĩa: WordNet hoặc Open English WordNet.
  - Câu ví dụ: Tatoeba, lọc những câu chứa lemma và ưu tiên câu có bản dịch tiếng Việt nếu có.
  - Phát âm: Web Speech API, hoặc audio Tatoeba chỉ lấy file CC BY/CC BY-SA/CC0.
- Nên có trang "Credits/Licenses" trong app ghi đủ: Browne & Culligan (CC BY-SA 4.0), Princeton WordNet (giữ nguyên văn bản giấy phép), Wiktionary contributors (CC BY-SA 4.0), Tatoeba contributors (CC BY 2.0 FR) và danh sách người đóng góp audio.
- Nghĩa tiếng Việt: nên do người dùng hoặc LLM tự tạo, lưu như dữ liệu riêng. Không chép nguyên từ điển thương mại.

### Gaps
- Chưa kiểm chứng file LICENSE của Open English WordNet, wiktextract và kaikki.org.
- Không tìm được nguồn audio TOEIC mở với giọng Anh/Úc/Mỹ/Canada như trong đề thật. Phải dựa vào TTS đa giọng.
- Chưa kiểm tra cụ thể điều khoản sử dụng của ETS về việc nhúng nội dung đề mẫu vào ứng dụng cá nhân không phân phối.

## Câu 5: Những tài liệu có bản quyền KHÔNG được đóng gói

### Takeaway
Đề thi và sách luyện thương mại (ETS Official Guide/đề full, Barron's 600 Essential Words for the TOEIC, Hackers TOEIC, ETS 2020–2026, Economy...) đều được bảo hộ bản quyền. Không được trích xuất danh sách từ kèm định nghĩa/ví dụ, audio hay câu hỏi từ các sách này để nhúng vào app. Chỉ được link tới tài liệu chính thức miễn phí, hoặc để người dùng tự mở tài liệu mình đã mua.

### Cited Findings
- Đề mẫu của ETS có ghi chú cấm sao chép hoặc tái sử dụng trái phép, nên chỉ dành cho luyện tập cá nhân — [ETS sample test PDF](https://www.mx.ets.org/content/dam/ets-org/pdfs/toeic/toeic-listening-reading-sample-test.pdf)
- Ngược lại, NGSL/TSL/BSL được cấp phép mở rõ ràng, nên là nguồn danh sách từ thay thế hợp pháp — [TSL](https://www.newgeneralservicelist.com/toeic-service-list)

### Inferences
- Barron's, Hackers, các bộ "ETS TOEIC" bản Hàn/Việt, đề luyện của các trung tâm, và audio đề thật trên YouTube đều không có giấy phép mở. Mặc định là "all rights reserved", nên không đóng gói (suy luận từ luật bản quyền mặc định; phiên này chưa kiểm tra từng trang bản quyền của nhà xuất bản).
- Danh sách từ đơn thuần (chỉ các từ, không kèm định nghĩa hay ví dụ) thường khó được bảo hộ. Tuy nhiên việc tuyển chọn và sắp xếp có thể được bảo hộ như một tuyển tập, nên an toàn nhất là dùng TSL/BSL thay vì sao chép danh sách 600 từ của Barron's.
- App dùng cá nhân offline có rủi ro pháp lý thấp. Nhưng nếu chia sẻ hoặc đưa lên GitHub công khai thì chỉ được kèm dữ liệu có giấy phép mở.

### Gaps
- Phiên này không tra điều khoản bản quyền cụ thể của Barron's/Kaplan và Hackers. Đây là luật Việt Nam/Hàn/Mỹ, không phải tư vấn pháp lý.
