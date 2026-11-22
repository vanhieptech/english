// Part 6 and Part 7 practice sets for the computer-based Reading simulator.
// All texts and questions are original (written for this app), TOEIC-style.
// In Part 6 texts, {{n}} marks blank n. In Part 7 texts, [1]..[4] mark sentence-insertion positions.

export const Q_TYPES = {
  grammar: 'Ngữ pháp',
  vocab: 'Từ vựng',
  connector: 'Từ nối',
  insert: 'Chèn câu',
  main: 'Ý chính / mục đích',
  detail: 'Chi tiết',
  not: 'Câu NOT',
  infer: 'Suy luận',
  wordctx: 'Nghĩa từ trong ngữ cảnh',
  intent: 'Ý định câu trích (tin nhắn)',
  cross: 'Liên kết nhiều văn bản',
};

const q = (n, type, o, a, why) => ({ n, type, o, a, why });

export const P6 = [
  {
    id: 'p6-1', title: 'E-mail: Parking lot repairs',
    text: 'To: All Staff\nFrom: Facilities Department\nSubject: Parking lot repairs\n\nPlease be aware that the north parking lot will be closed from Monday, May 6, to Friday, May 10. During this time, workers {{1}} the surface and repaint the lines. Employees who normally park in the north lot may use the south lot {{2}}. {{3}} Additional spaces will also be available at the City Center garage across the street. Employees who park there should keep their receipts, as the company will {{4}} the cost. Thank you for your patience.',
    qs: [
      q(1, 'grammar', ['will repair', 'repaired', 'have repaired', 'were repairing'], 0, 'Khoảng thời gian trong tương lai (May 6–10) → will repair.'),
      q(2, 'connector', ['instead', 'otherwise', 'although', 'despite'], 0, '"instead" = thay vào đó (đỗ ở bãi nam thay cho bãi bắc).'),
      q(3, 'insert', ['However, spaces there are limited, so please arrive early.', 'The new lines will be painted in yellow.', 'The north lot was built ten years ago.', 'Please submit your expense reports by Friday.'], 0, 'Câu nối tiếp ý "south lot" và dẫn sang "Additional spaces" ở câu sau.'),
      q(4, 'vocab', ['reimburse', 'refund to', 'charge', 'borrow'], 0, 'reimburse the cost = hoàn lại chi phí (vì vậy cần giữ hóa đơn).'),
    ],
  },
  {
    id: 'p6-2', title: 'Advertisement: Greenleaf Catering',
    text: 'Planning a company event? Greenleaf Catering has been serving businesses in Riverside for over fifteen years. Our menus feature fresh, {{1}} ingredients from nearby farms. Whether you need breakfast for ten people or a formal dinner for two hundred, our experienced staff will make sure everything runs {{2}}. {{3}} Simply visit our Web site and complete the short request form. {{4}} you book before June 30, you will receive a 10 percent discount on your first order.',
    qs: [
      q(1, 'grammar', ['local', 'locally', 'locality', 'localize'], 0, 'Đứng trước danh từ "ingredients", song song với "fresh" → tính từ.'),
      q(2, 'grammar', ['smooth', 'smoothly', 'smoothness', 'smoother'], 1, 'Bổ nghĩa cho động từ "runs" → trạng từ.'),
      q(3, 'insert', ['Getting a price estimate is easy.', 'Our chefs trained in France.', 'Farms in the region produce many vegetables.', 'Dinner is served at seven o\'clock.'], 0, 'Câu sau "Simply visit our Web site..." giải thích cách lấy báo giá.'),
      q(4, 'connector', ['If', 'Unless', 'Although', 'Because of'], 0, 'Điều kiện để được giảm giá → If.'),
    ],
  },
  {
    id: 'p6-3', title: 'Memo: New expense system',
    text: 'To: All employees\nRe: New expense system\n\nStarting next month, all travel expenses must be submitted {{1}} the new online system, ExpensePro. The system will replace the paper forms that we currently use. Training sessions will be held in Conference Room B on March 3 and March 5. Each session {{2}} about one hour. {{3}} If you are unable to attend either session, a recorded version will be posted on the company intranet. Please direct any questions to Ms. Alvarez in the accounting department, who has been {{4}} the transition.',
    qs: [
      q(1, 'vocab', ['through', 'among', 'across from', 'between'], 0, 'submit through a system = nộp qua hệ thống.'),
      q(2, 'grammar', ['will last', 'lasted', 'has lasted', 'lasting'], 0, 'Buổi đào tạo trong tương lai → will last.'),
      q(3, 'insert', ['Please register for one of them by February 28.', 'The paper forms were introduced in 2010.', 'Conference Room B has a new projector.', 'Travel expenses have increased this year.'], 0, '"one of them" = một trong hai buổi; câu sau nói nếu không dự được "either session".'),
      q(4, 'grammar', ['overseeing', 'overlooked', 'oversight', 'oversee'], 0, 'has been + V-ing (hiện tại hoàn thành tiếp diễn) → overseeing = giám sát.'),
    ],
  },
  {
    id: 'p6-4', title: 'Letter: Out-of-stock item',
    text: 'Dear Mr. Nakamura,\n\nThank you for your recent order from Hartwell Office Supplies. Unfortunately, the ergonomic chair you selected is currently out of stock. We expect to receive a new shipment {{1}} two weeks. {{2}}, we would be happy to offer you a similar model, the ComfortPlus 200, at the same price. {{3}} Please let us know which option you prefer by replying to this e-mail. We apologize for the {{4}} and appreciate your understanding.\n\nSincerely,\nLaura Bennett, Customer Service',
    qs: [
      q(1, 'vocab', ['within', 'during', 'since', 'until'], 0, 'within two weeks = trong vòng hai tuần.'),
      q(2, 'connector', ['Alternatively', 'Therefore', 'Similarly', 'Consequently'], 0, 'Đưa ra lựa chọn khác → Alternatively.'),
      q(3, 'insert', ['It has received excellent reviews from our customers.', 'Our store opened in 1998.', 'The shipment was sent yesterday.', 'Your payment has been declined.'], 0, '"It" = mẫu ComfortPlus 200 vừa nhắc; câu khen mẫu thay thế.'),
      q(4, 'grammar', ['inconvenience', 'inconvenient', 'inconveniently', 'inconvenienced'], 0, 'Sau "the" → danh từ; apologize for the inconvenience.'),
    ],
  },
  {
    id: 'p6-5', title: 'Notice: Library reopening',
    text: 'The Westbrook Public Library is pleased to announce that its renovation is now complete. The library will reopen to the public on Saturday, September 14. Visitors will notice several {{1}}, including a larger children\'s area and a quiet study room on the second floor. {{2}} Library hours have also been extended; the building will now remain open until 9 P.M. on weekdays. To celebrate the reopening, a special event {{3}} in the main hall at 10 A.M. on September 14. Light refreshments will be served, and all members of the community are {{4}} to attend.',
    qs: [
      q(1, 'grammar', ['improvements', 'improve', 'improved', 'improving'], 0, 'Sau "several" → danh từ số nhiều.'),
      q(2, 'insert', ['In addition, twenty new computers have been installed.', 'The library was founded by a local businessman.', 'Many people enjoy reading at home.', 'The renovation was delayed by rain.'], 0, 'Tiếp tục liệt kê thay đổi ("In addition") trước khi nói "hours have also been extended".'),
      q(3, 'grammar', ['will be held', 'was held', 'holds', 'has held'], 0, 'Sự kiện tương lai, "được tổ chức" → will be held.'),
      q(4, 'vocab', ['welcome', 'welcoming', 'welcomed', 'welcomes'], 0, 'be welcome to + V = được mời / cứ tự nhiên tham dự.'),
    ],
  },
  {
    id: 'p6-6', title: 'Article: New distribution center',
    text: 'Brightway Foods announced yesterday that it will open a new distribution center in Dalton next year. The facility is expected to create approximately 300 jobs. According to company spokesperson Mark Reyes, Dalton was chosen because of its {{1}} to major highways. {{2}} Construction will begin in April, and the center should be fully {{3}} by the following January. Local officials have welcomed the news. "This investment shows that companies see Dalton as a great place to do business," said Mayor Ellen Price. Brightway currently operates four distribution centers, {{4}} of which are located in neighboring states.',
    qs: [
      q(1, 'grammar', ['proximity', 'approximate', 'proximate', 'approximately'], 0, 'Sau "its" → danh từ; proximity to = sự gần với.'),
      q(2, 'insert', ['The site also offers easy access to the regional airport.', 'Brightway was founded as a small bakery.', 'Highways are often crowded in the morning.', 'The mayor will retire next year.'], 0, 'Nêu thêm lý do chọn địa điểm ("also") sau lý do đường cao tốc.'),
      q(3, 'grammar', ['operational', 'operate', 'operation', 'operationally'], 0, 'be fully + tính từ → operational = đi vào hoạt động.'),
      q(4, 'grammar', ['all', 'each', 'every', 'whole'], 0, '"all of which are" (số nhiều); "each of which" phải đi với "is".'),
    ],
  },
  {
    id: 'p6-7', title: 'E-mail: Schedule update',
    text: 'Hi team,\n\nI wanted to update you on the Henley account. The client has asked us to move the product launch from October to September, so our schedule is now much {{1}}. To meet the new deadline, I am asking everyone to prioritize tasks related to this project. {{2}} I realize this may mean postponing some other work, and I appreciate your flexibility. We will meet every Monday morning {{3}} the launch to review our progress. If you have any concerns about your workload, please let me know {{4}} possible.\n\nThanks,\nPriya',
    qs: [
      q(1, 'grammar', ['tighter', 'tight', 'tightly', 'tightest'], 0, 'much + so sánh hơn → tighter.'),
      q(2, 'insert', ['In particular, the design files must be finished by August 15.', 'The client is based in London.', 'Our office will be closed in December.', 'Mondays are usually busy.'], 0, 'Cụ thể hóa "tasks related to this project" ("In particular").'),
      q(3, 'vocab', ['until', 'by', 'since', 'while'], 0, 'Họp hằng tuần cho đến khi ra mắt → until.'),
      q(4, 'connector', ['as soon as', 'as long as', 'so far as', 'even if'], 0, 'as soon as possible = sớm nhất có thể.'),
    ],
  },
  {
    id: 'p6-8', title: 'Notice: Water shut-off',
    text: 'Dear Residents,\n\nPlease note that the water supply to the building will be shut off on Thursday, from 9 A.M. to 1 P.M., while plumbers replace an old pipe in the basement. We recommend {{1}} some water in advance for drinking and cooking. {{2}} We understand that this may be inconvenient, and we will do our best to complete the work as {{3}} as possible. Should the work take longer than expected, we will notify residents {{4}} e-mail.\n\nBuilding Management',
    qs: [
      q(1, 'grammar', ['storing', 'to store', 'store', 'stored'], 0, 'recommend + V-ing.'),
      q(2, 'insert', ['Elevators will continue to operate normally during this time.', 'The building was painted last year.', 'Plumbers are paid by the hour.', 'Rent is due on the first of the month.'], 0, 'Thông tin thêm liên quan đến thời gian cắt nước, trước câu xin lỗi.'),
      q(3, 'grammar', ['quickly', 'quick', 'quickness', 'quicker'], 0, 'as + trạng từ + as possible, bổ nghĩa cho "complete".'),
      q(4, 'vocab', ['by', 'with', 'on', 'at'], 0, 'notify by e-mail = thông báo qua e-mail.'),
    ],
  },
];

export const P7 = [
  {
    id: 'p7-1', kind: 'single',
    docs: [{ title: 'Text-message chain', text: 'Jason Lee (10:12 A.M.)\nHi Mina, are you still at the printing shop?\n\nMina Ortiz (10:13 A.M.)\nYes, I\'m picking up the brochures for tomorrow\'s trade show.\n\nJason Lee (10:14 A.M.)\nGreat. Could you also ask them about the banners? They were supposed to be ready yesterday.\n\nMina Ortiz (10:16 A.M.)\nI just checked. They said the banners will be done by 3 P.M.\n\nJason Lee (10:17 A.M.)\nThat\'s cutting it close. We need to load the van by 4.\n\nMina Ortiz (10:18 A.M.)\nI can come back for them. My afternoon is free.\n\nJason Lee (10:19 A.M.)\nYou\'re a lifesaver.' }],
    qs: [
      { q: 'Why is Ms. Ortiz at the printing shop?', o: ['To collect brochures', 'To order business cards', 'To repair a printer', 'To apply for a job'], a: 0, type: 'detail', why: '"I\'m picking up the brochures" (10:13).' },
      { q: 'At 10:17 A.M., what does Mr. Lee most likely mean when he writes, "That\'s cutting it close"?', o: ['He is worried there may not be enough time.', 'He thinks the banners are too expensive.', 'He wants the banners to be shorter.', 'He plans to cancel the trade show.'], a: 0, type: 'intent', why: 'Băng rôn xong lúc 3 giờ mà 4 giờ phải chất lên xe → sát giờ.' },
      { q: 'What will Ms. Ortiz probably do this afternoon?', o: ['Return to the shop', 'Drive to the trade show', 'Design new banners', 'Call a customer'], a: 0, type: 'infer', why: '"I can come back for them" (10:18).' },
    ],
  },
  {
    id: 'p7-2', kind: 'single',
    docs: [{ title: 'Notice', text: 'Fairview Fitness Center — Holiday Schedule\n\nThe center will be open from 8 A.M. to 2 P.M. on December 24 and closed on December 25. Regular hours (6 A.M. to 10 P.M.) resume on December 26. Group classes will not be offered from December 24 to 26. The swimming pool will be closed for cleaning from December 27 to 29. Members with questions may contact the front desk at 555-0148.' }],
    qs: [
      { q: 'What is the notice mainly about?', o: ['Changes to opening hours', 'A new membership fee', 'A swimming competition', 'Staff job openings'], a: 0, type: 'main', why: 'Tiêu đề "Holiday Schedule" và nội dung về giờ mở cửa.' },
      { q: 'When will the center be closed all day?', o: ['December 25', 'December 24', 'December 26', 'December 29'], a: 0, type: 'detail', why: '"closed on December 25".' },
      { q: 'What is NOT mentioned in the notice?', o: ['Discounts for new members', 'A pool closure', 'Canceled group classes', 'A phone number'], a: 0, type: 'not', why: 'Có nhắc hồ bơi đóng, lớp nhóm nghỉ, số điện thoại; không nhắc giảm giá.' },
    ],
  },
  {
    id: 'p7-3', kind: 'single',
    docs: [{ title: 'E-mail', text: 'To: Daniel Park\nFrom: Helen Cho\nSubject: Interview\n\nDear Mr. Park,\n\nThank you for applying for the position of sales coordinator at Norland Electronics. We were impressed by your experience and would like to invite you to an interview on Tuesday, April 9, at 10 A.M. The interview will last about forty-five minutes and will be conducted by me and the regional sales manager, Mr. Gupta. Please bring a copy of your résumé and a list of three references. If this time does not suit you, please reply by Friday so that we can arrange an alternative.\n\nBest regards,\nHelen Cho, Human Resources' }],
    qs: [
      { q: 'Why did Ms. Cho write the e-mail?', o: ['To schedule an interview', 'To offer a job', 'To request a payment', 'To announce a promotion'], a: 0, type: 'main', why: '"would like to invite you to an interview".' },
      { q: 'The word "suit" in the e-mail is closest in meaning to', o: ['be convenient for', 'dress', 'match in color', 'sue'], a: 0, type: 'wordctx', why: '"If this time does not suit you" = nếu giờ này không tiện cho bạn.' },
      { q: 'What is Mr. Park asked to bring?', o: ['A list of references', 'A photo ID', 'A writing sample', 'A completed application'], a: 0, type: 'detail', why: '"a list of three references".' },
    ],
  },
  {
    id: 'p7-4', kind: 'single',
    docs: [{ title: 'Advertisement', text: 'Summit Language School\n\nWant to improve your business English? Summit Language School offers evening and weekend courses for working professionals. [1] Classes are limited to eight students, so every learner gets plenty of speaking practice. [2] All of our instructors are certified and have experience in international business. [3] New courses begin on the first Monday of every month. [4] Visit www.summitlang.com to take a free placement test.' }],
    qs: [
      { q: 'Who is the advertisement intended for?', o: ['Working adults', 'Elementary school students', 'Language teachers', 'Tourists'], a: 0, type: 'infer', why: '"courses for working professionals", học buổi tối và cuối tuần.' },
      { q: 'What is stated about the classes?', o: ['They are small.', 'They are free.', 'They are held online only.', 'They last one year.'], a: 0, type: 'detail', why: '"limited to eight students".' },
      { q: 'In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? "Many of them have worked abroad for global companies."', o: ['[3]', '[1]', '[2]', '[4]'], a: 0, type: 'insert', why: '"them" = instructors ở câu ngay trước vị trí [3].' },
    ],
  },
  {
    id: 'p7-5', kind: 'single',
    docs: [{ title: 'Invoice', text: 'Riverside Office Furniture — Invoice #4471\nCustomer: Tamsin Design Studio, 22 Elm Street\nDate: March 12\n\nStanding desk (x2) ........ $640.00\nDesk lamp (x4) ............ $120.00\nDelivery and assembly ..... $60.00\nTotal ..................... $820.00\n\nPayment due: April 11. A late fee of 5% will be charged on payments received after the due date.\nNote: The desk lamps are on back order and will be delivered separately.' }],
    qs: [
      { q: 'How much did the customer pay for delivery and assembly?', o: ['$60', '$120', '$640', '$820'], a: 0, type: 'detail', why: 'Dòng "Delivery and assembly ... $60.00".' },
      { q: 'What is indicated about the desk lamps?', o: ['They will arrive later.', 'They were damaged.', 'They were free.', 'They cost $640.'], a: 0, type: 'detail', why: '"on back order and will be delivered separately" = giao sau.' },
      { q: 'What will most likely happen if the payment arrives on April 20?', o: ['A fee will be added.', 'The order will be canceled.', 'The desks will be returned.', 'A discount will be applied.'], a: 0, type: 'infer', why: 'Sau hạn April 11 → phí trễ 5%.' },
    ],
  },
  {
    id: 'p7-6', kind: 'single',
    docs: [{ title: 'Article', text: 'Local Café Expands to Second Location\n\nBean There Café, a popular coffee shop on Oak Street, will open a second location next month near Harbor Park. Owner Lisa Moreno started the business five years ago with just two employees. Today she employs fifteen people. The new café will be larger than the original and will include a small stage for live music on weekends. "Our customers kept asking for more space," Ms. Moreno said. The Harbor Park location will also offer a lunch menu, something the Oak Street café does not currently provide. Ms. Moreno plans to hire ten additional staff members before the opening.' }],
    qs: [
      { q: 'What is the article mainly about?', o: ['A business opening a new branch', 'A music festival', 'A new park', 'A cooking class'], a: 0, type: 'main', why: 'Tiêu đề: mở địa điểm thứ hai.' },
      { q: 'What will the new café offer that the original does not?', o: ['Lunch', 'Coffee', 'Pastries', 'Free Wi-Fi'], a: 0, type: 'detail', why: '"a lunch menu, something the Oak Street café does not currently provide".' },
      { q: 'How many people will Ms. Moreno probably employ after the opening?', o: ['25', '15', '10', '5'], a: 0, type: 'infer', why: '15 người hiện tại + tuyển thêm 10.' },
    ],
  },
  {
    id: 'p7-7', kind: 'single',
    docs: [{ title: 'Memo', text: 'MEMO\nTo: All Department Heads\nFrom: Paul Ferris, Operations Director\nDate: June 3\nSubject: Office move\n\nAs you know, our company will relocate to the Granite Tower on July 15. Movers will pack equipment from each department on July 12 and 13. Please make sure that all personal items are removed from desks by July 11. Each department should label its boxes with the department name and floor number. The IT team will set up computers at the new office on July 14, so employees will be able to work normally on the first day. Please share this information with your staff.' }],
    qs: [
      { q: 'By when should personal items be removed from desks?', o: ['July 11', 'July 12', 'July 14', 'July 15'], a: 0, type: 'detail', why: '"removed from desks by July 11".' },
      { q: 'What is NOT requested of departments?', o: ['Ordering new furniture', 'Labeling boxes', 'Clearing desks', 'Informing staff'], a: 0, type: 'not', why: 'Có yêu cầu dán nhãn, dọn bàn, báo nhân viên; không có đặt nội thất.' },
      { q: 'What will happen on July 14?', o: ['Computers will be installed.', 'Boxes will be packed.', 'The company will hold a party.', 'Employees will start working at the new office.'], a: 0, type: 'detail', why: '"The IT team will set up computers ... on July 14".' },
    ],
  },
  {
    id: 'p7-8', kind: 'single',
    docs: [{ title: 'Online review', text: '★★★★☆ Reviewed by K. Adebayo\n\nI stayed at the Lakeside Inn for three nights during a business trip. The room was clean and spacious, and the staff were very friendly. The hotel\'s location is convenient — it\'s only a five-minute walk from the convention center. My only complaint is that the Wi-Fi was slow in the evenings, which made it difficult to finish my work. Breakfast was included and offered a good selection. I would definitely stay here again, especially if the internet connection is improved.' }],
    qs: [
      { q: 'Why did the reviewer stay at the hotel?', o: ['For work', 'For a family vacation', 'To attend a wedding', 'To look for an apartment'], a: 0, type: 'detail', why: '"during a business trip".' },
      { q: 'What problem did the reviewer mention?', o: ['A slow internet connection', 'A noisy room', 'Rude staff', 'An expensive breakfast'], a: 0, type: 'detail', why: '"the Wi-Fi was slow in the evenings" (paraphrase: internet connection).' },
      { q: 'The word "selection" in the review is closest in meaning to', o: ['range', 'decision', 'election', 'payment'], a: 0, type: 'wordctx', why: '"a good selection" (bữa sáng) = nhiều lựa chọn, range.' },
    ],
  },
  {
    id: 'p7-9', kind: 'single',
    docs: [{ title: 'Job posting', text: 'Job Opening: Part-Time Receptionist\n\nGreenfield Dental Clinic is looking for a friendly, organized person to work at our front desk on Tuesdays, Thursdays, and Saturdays. Duties include greeting patients, answering phones, and scheduling appointments. Previous experience in a medical office is preferred but not required. Applicants must be comfortable using computers. To apply, send a résumé and cover letter to hiring@greenfielddental.com by May 20. Interviews will be held the following week.' }],
    qs: [
      { q: 'What is one duty of the position?', o: ['Scheduling appointments', 'Cleaning teeth', 'Ordering supplies', 'Training staff'], a: 0, type: 'detail', why: '"scheduling appointments".' },
      { q: 'What is a requirement for applicants?', o: ['Computer skills', 'A medical degree', 'Experience in a dental office', 'Availability on Sundays'], a: 0, type: 'detail', why: '"must be comfortable using computers"; kinh nghiệm chỉ là "preferred".' },
      { q: 'When will interviews most likely take place?', o: ['In the week after May 20', 'Before May 20', 'On Saturdays only', 'In July'], a: 0, type: 'infer', why: 'Hạn nộp May 20, phỏng vấn "the following week".' },
    ],
  },
  {
    id: 'p7-10', kind: 'single',
    docs: [{ title: 'Online chat', text: 'Grace Kim [2:01 P.M.]\nThe client from Lumen Corp. just called. They want to see the revised design by Thursday instead of Friday.\n\nOmar Haddad [2:02 P.M.]\nThursday? We\'re still waiting for their feedback on the color scheme.\n\nRachel Stone [2:03 P.M.]\nI\'ll e-mail them now and ask for it today.\n\nGrace Kim [2:04 P.M.]\nThanks, Rachel. Omar, can you finish the layout if we get the feedback by tonight?\n\nOmar Haddad [2:05 P.M.]\nI\'ll make it work.\n\nGrace Kim [2:06 P.M.]\nGreat. I\'ll tell the client we\'re on track.' }],
    qs: [
      { q: 'What did the client request?', o: ['An earlier deadline', 'A lower price', 'A new color scheme', 'A meeting on Friday'], a: 0, type: 'detail', why: '"by Thursday instead of Friday" = sớm hơn.' },
      { q: 'What will Ms. Stone most likely do next?', o: ['Contact the client', 'Revise the layout', 'Call Mr. Haddad', 'Prepare a contract'], a: 0, type: 'infer', why: '"I\'ll e-mail them now".' },
      { q: 'At 2:05 P.M., what does Mr. Haddad mean when he writes, "I\'ll make it work"?', o: ['He will finish the layout on time.', 'He will fix a broken machine.', 'He wants to work from home.', 'He disagrees with the client.'], a: 0, type: 'intent', why: 'Trả lời câu hỏi "can you finish the layout...?" → sẽ cố hoàn thành kịp.' },
    ],
  },
  {
    id: 'p7-11', kind: 'double',
    docs: [
      { title: 'Conference schedule', text: 'Regional Marketing Summit — Hall B\n\n9:00 A.M.  Opening remarks — Sarah Lin\n9:30 A.M.  Social media trends — Victor Hale\n11:00 A.M. Building customer loyalty — Amina Yusuf\n1:30 P.M.  Data-driven advertising — Tom Becker\n3:00 P.M.  Panel discussion' },
      { title: 'E-mail', text: 'To: Event staff\nFrom: Sarah Lin\nSubject: Schedule change\n\nHi all,\n\nVictor Hale\'s flight has been delayed, so he will not arrive until noon. I have asked Tom Becker to switch time slots with him, and he has agreed. Please update the printed programs and the screen at the entrance. Also, Amina Yusuf has requested a microphone that she can clip to her jacket.\n\nThanks,\nSarah' },
    ],
    qs: [
      { q: 'Why was the schedule changed?', o: ['A speaker\'s flight was delayed.', 'A room was unavailable.', 'A speaker canceled.', 'The panel discussion was extended.'], a: 0, type: 'detail', why: 'E-mail: "Victor Hale\'s flight has been delayed".' },
      { q: 'At what time will Mr. Hale now give his talk?', o: ['1:30 P.M.', '9:30 A.M.', '11:00 A.M.', '3:00 P.M.'], a: 0, type: 'cross', why: 'Đổi giờ với Tom Becker (1:30 P.M. trong lịch).' },
      { q: 'What topic will now be presented at 9:30 A.M.?', o: ['Data-driven advertising', 'Social media trends', 'Building customer loyalty', 'Opening remarks'], a: 0, type: 'cross', why: 'Tom Becker lên 9:30 với chủ đề của anh ấy.' },
      { q: 'What does Ms. Yusuf want?', o: ['A microphone she can wear', 'A larger room', 'A printed program', 'A later time slot'], a: 0, type: 'detail', why: '"a microphone that she can clip to her jacket".' },
      { q: 'Who most likely is Ms. Lin?', o: ['An event organizer', 'A flight attendant', 'A hotel guest', 'A journalist'], a: 0, type: 'infer', why: 'Phát biểu khai mạc và chỉ đạo nhân viên sự kiện.' },
    ],
  },
  {
    id: 'p7-12', kind: 'double',
    docs: [
      { title: 'Price list', text: 'Clearview Window Cleaning\n\nResidential: $90 per house (up to 2 floors)\nCommercial: $150 per office (up to 1,000 square meters)\nAdd-on: Screen cleaning $20\n\nBook two or more services in the same month and save 10%!' },
      { title: 'E-mail', text: 'To: bookings@clearview.com\nFrom: Martin Osei\nSubject: Booking\n\nHello,\n\nI would like to book window cleaning for my home, which has two floors, and for my small office downtown (about 600 square meters). Could both be done during the week of May 13? I would also like the screens cleaned at my home. Please confirm the total cost.\n\nThank you,\nMartin Osei' },
    ],
    qs: [
      { q: 'What does Mr. Osei request?', o: ['Two cleaning services', 'A job interview', 'A refund', 'Window repairs'], a: 0, type: 'detail', why: 'Nhà + văn phòng.' },
      { q: 'How much does screen cleaning cost?', o: ['$20', '$90', '$150', '$10'], a: 0, type: 'detail', why: '"Screen cleaning $20".' },
      { q: 'What will Mr. Osei most likely receive?', o: ['A 10 percent discount', 'Free screen cleaning', 'A free second visit', 'A refund'], a: 0, type: 'cross', why: 'Đặt 2 dịch vụ trong cùng tháng → giảm 10%.' },
      { q: 'What is indicated about Mr. Osei\'s office?', o: ['It is smaller than 1,000 square meters.', 'It has two floors.', 'It is in a suburb.', 'It needs new windows.'], a: 0, type: 'cross', why: '600 m² < 1.000 m² → giá commercial áp dụng.' },
      { q: 'The word "confirm" in the e-mail is closest in meaning to', o: ['verify', 'deny', 'delay', 'reduce'], a: 0, type: 'wordctx', why: 'confirm the total cost = xác nhận tổng chi phí.' },
    ],
  },
  {
    id: 'p7-13', kind: 'triple',
    docs: [
      { title: 'Notice', text: 'Harbor City Volunteer Day — Saturday, October 5\n\nJoin us to clean up Harbor City\'s parks! Choose one of three sites:\n• Site A: Westside Park (8 A.M.–11 A.M.)\n• Site B: Pine Hill Garden (9 A.M.–12 P.M.)\n• Site C: Riverside Trail (1 P.M.–4 P.M.)\n\nGloves and bags will be provided. Volunteers at Site C should wear boots because the trail can be muddy. Register by September 28.' },
      { title: 'E-mail', text: 'To: volunteer@harborcity.gov\nFrom: Ana Ruiz\nDate: September 25\n\nHello,\n\nMy coworkers and I would like to volunteer. There are six of us. We have a team meeting on Saturday morning until 11:30, so we can only come in the afternoon. Is there still space?\n\nAna Ruiz, Delta Engineering' },
      { title: 'Registration confirmation', text: 'Group: Delta Engineering (6 volunteers)\nAssigned site: Riverside Trail\nContact: Ana Ruiz\n\nNote: A free lunch will be served at City Hall at 12:30 P.M. for all volunteers.' },
    ],
    qs: [
      { q: 'What is the purpose of the notice?', o: ['To recruit volunteers', 'To announce a park opening', 'To sell gardening tools', 'To report the weather'], a: 0, type: 'main', why: '"Join us to clean up..." → kêu gọi tình nguyện.' },
      { q: 'Why can\'t Ms. Ruiz\'s group come in the morning?', o: ['They have a meeting.', 'They are traveling.', 'The parks are closed.', 'They must work late.'], a: 0, type: 'detail', why: '"a team meeting on Saturday morning until 11:30".' },
      { q: 'What should Ms. Ruiz\'s group bring?', o: ['Boots', 'Gloves', 'Bags', 'Lunch'], a: 0, type: 'cross', why: 'Được xếp Riverside Trail (Site C) → nên mang ủng; găng và túi được phát.' },
      { q: 'What is true about Ms. Ruiz\'s e-mail?', o: ['It was sent before the registration deadline.', 'It was sent on the volunteer day.', 'It was sent after September 28.', 'It was sent to a park ranger.'], a: 0, type: 'cross', why: 'Gửi September 25, hạn đăng ký September 28.' },
      { q: 'What is suggested about Ms. Ruiz\'s group?', o: ['They can have the free lunch before their shift.', 'They will clean Westside Park.', 'They need to buy gloves.', 'They registered late.'], a: 0, type: 'infer', why: 'Bữa trưa 12:30, ca Site C bắt đầu 1 P.M.' },
    ],
  },
];
