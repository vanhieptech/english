// Topic word maps (for the mindmap) and antonym pairs. Original lists written for this app,
// built from high-frequency TOEIC workplace vocabulary. Format: [word, Vietnamese, common collocation]

export const TOPICS = [
  { id: 'office', name: 'Văn phòng & hành chính', branches: [
    { name: 'Thiết bị', words: [['photocopier', 'máy photo', 'the photocopier is jammed'], ['stationery', 'văn phòng phẩm', 'order stationery'], ['cabinet', 'tủ hồ sơ', 'a filing cabinet'], ['projector', 'máy chiếu', 'set up the projector']] },
    { name: 'Công việc giấy tờ', words: [['memo', 'bản ghi nhớ', 'send a memo'], ['agenda', 'chương trình họp', 'on the agenda'], ['deadline', 'hạn chót', 'meet a deadline'], ['submit', 'nộp', 'submit a report']] },
    { name: 'Lịch & họp', words: [['schedule', 'lịch / lên lịch', 'ahead of schedule'], ['postpone', 'hoãn', 'postpone a meeting'], ['attend', 'tham dự', 'attend a conference'], ['minutes', 'biên bản họp', 'take the minutes']] },
  ] },
  { id: 'hr', name: 'Nhân sự & tuyển dụng', branches: [
    { name: 'Tuyển dụng', words: [['applicant', 'ứng viên', 'qualified applicants'], ['résumé', 'sơ yếu lý lịch', 'submit a résumé'], ['interview', 'phỏng vấn', 'schedule an interview'], ['qualification', 'bằng cấp, trình độ', 'meet the qualifications']] },
    { name: 'Làm việc', words: [['promotion', 'thăng chức', 'be eligible for promotion'], ['transfer', 'chuyển công tác', 'request a transfer'], ['shift', 'ca làm', 'work the night shift'], ['overtime', 'làm thêm giờ', 'work overtime']] },
    { name: 'Phúc lợi', words: [['benefits', 'phúc lợi', 'a benefits package'], ['salary', 'lương', 'a competitive salary'], ['leave', 'nghỉ phép', 'take annual leave'], ['retire', 'nghỉ hưu', 'retire next year']] },
  ] },
  { id: 'finance', name: 'Tài chính & ngân sách', branches: [
    { name: 'Ngân sách', words: [['budget', 'ngân sách', 'within budget'], ['expense', 'chi phí', 'reduce expenses'], ['estimate', 'ước tính / báo giá', 'a cost estimate'], ['allocate', 'phân bổ', 'allocate funds']] },
    { name: 'Thanh toán', words: [['invoice', 'hóa đơn', 'issue an invoice'], ['receipt', 'biên lai', 'keep the receipt'], ['reimburse', 'hoàn tiền', 'reimburse travel costs'], ['deposit', 'tiền đặt cọc', 'pay a deposit']] },
    { name: 'Kết quả', words: [['revenue', 'doanh thu', 'annual revenue'], ['profit', 'lợi nhuận', 'a record profit'], ['quarterly', 'hằng quý', 'quarterly earnings'], ['audit', 'kiểm toán', 'conduct an audit']] },
  ] },
  { id: 'marketing', name: 'Marketing & bán hàng', branches: [
    { name: 'Quảng bá', words: [['campaign', 'chiến dịch', 'launch a campaign'], ['advertise', 'quảng cáo', 'advertise online'], ['brochure', 'tờ giới thiệu', 'distribute brochures'], ['promote', 'quảng bá', 'promote a product']] },
    { name: 'Khách hàng', words: [['survey', 'khảo sát', 'conduct a survey'], ['feedback', 'phản hồi', 'customer feedback'], ['loyalty', 'lòng trung thành', 'a loyalty program'], ['target', 'nhắm tới', 'target young buyers']] },
    { name: 'Bán hàng', words: [['discount', 'giảm giá', 'offer a discount'], ['sales figures', 'số liệu bán hàng', 'sales figures rose'], ['competitor', 'đối thủ', 'a major competitor'], ['launch', 'ra mắt', 'launch a new line']] },
  ] },
  { id: 'production', name: 'Sản xuất & kho vận', branches: [
    { name: 'Nhà máy', words: [['manufacture', 'sản xuất', 'manufacture parts'], ['assembly line', 'dây chuyền lắp ráp', 'work on the assembly line'], ['equipment', 'thiết bị', 'operate equipment'], ['inspection', 'kiểm tra', 'a safety inspection']] },
    { name: 'Kho & giao hàng', words: [['warehouse', 'nhà kho', 'store in the warehouse'], ['inventory', 'hàng tồn kho', 'check inventory'], ['shipment', 'lô hàng', 'a delayed shipment'], ['supplier', 'nhà cung cấp', 'a reliable supplier']] },
    { name: 'Chất lượng', words: [['defect', 'lỗi sản phẩm', 'a manufacturing defect'], ['specification', 'thông số kỹ thuật', 'meet specifications'], ['efficiency', 'hiệu suất', 'improve efficiency'], ['output', 'sản lượng', 'increase output']] },
  ] },
  { id: 'travel', name: 'Du lịch & công tác', branches: [
    { name: 'Đi lại', words: [['itinerary', 'lịch trình', 'a travel itinerary'], ['boarding pass', 'thẻ lên máy bay', 'show your boarding pass'], ['layover', 'quá cảnh', 'a two-hour layover'], ['depart', 'khởi hành', 'depart on time']] },
    { name: 'Khách sạn', words: [['reservation', 'đặt chỗ', 'make a reservation'], ['check in', 'nhận phòng', 'check in at the front desk'], ['amenities', 'tiện nghi', 'hotel amenities'], ['complimentary', 'miễn phí (tặng kèm)', 'complimentary breakfast']] },
    { name: 'Sự cố', words: [['delay', 'trì hoãn', 'a flight delay'], ['cancel', 'hủy', 'cancel a booking'], ['luggage', 'hành lý', 'lost luggage'], ['refund', 'hoàn tiền', 'request a refund']] },
  ] },
  { id: 'events', name: 'Nhà hàng & sự kiện', branches: [
    { name: 'Sự kiện', words: [['venue', 'địa điểm', 'book a venue'], ['banquet', 'tiệc trang trọng', 'an awards banquet'], ['registration', 'đăng ký', 'registration fee'], ['keynote', 'bài phát biểu chính', 'a keynote speaker']] },
    { name: 'Ăn uống', words: [['cater', 'cung cấp đồ ăn', 'cater an event'], ['refreshments', 'đồ ăn nhẹ', 'light refreshments'], ['menu', 'thực đơn', 'a seasonal menu'], ['reserve', 'đặt trước', 'reserve a table']] },
    { name: 'Tổ chức', words: [['organize', 'tổ chức', 'organize a workshop'], ['attendee', 'người tham dự', 'conference attendees'], ['host', 'tổ chức / chủ trì', 'host a reception'], ['sponsor', 'nhà tài trợ', 'a corporate sponsor']] },
  ] },
  { id: 'property', name: 'Bất động sản & cơ sở vật chất', branches: [
    { name: 'Thuê nhà', words: [['lease', 'hợp đồng thuê', 'sign a lease'], ['tenant', 'người thuê', 'notify tenants'], ['landlord', 'chủ nhà', 'contact the landlord'], ['utilities', 'điện nước', 'utilities are included']] },
    { name: 'Sửa chữa', words: [['renovate', 'cải tạo', 'renovate the lobby'], ['maintenance', 'bảo trì', 'scheduled maintenance'], ['repair', 'sửa chữa', 'repair the roof'], ['contractor', 'nhà thầu', 'hire a contractor']] },
    { name: 'Tòa nhà', words: [['facility', 'cơ sở', 'a new facility'], ['premises', 'khuôn viên', 'on the premises'], ['relocate', 'chuyển địa điểm', 'relocate the office'], ['spacious', 'rộng rãi', 'a spacious room']] },
  ] },
  { id: 'health', name: 'Sức khỏe & an toàn', branches: [
    { name: 'Khám bệnh', words: [['appointment', 'cuộc hẹn', 'make an appointment'], ['clinic', 'phòng khám', 'a dental clinic'], ['prescription', 'đơn thuốc', 'fill a prescription'], ['physician', 'bác sĩ', 'consult a physician']] },
    { name: 'An toàn', words: [['protective', 'bảo hộ', 'protective gear'], ['hazard', 'mối nguy', 'a safety hazard'], ['regulation', 'quy định', 'comply with regulations'], ['evacuate', 'sơ tán', 'evacuate the building']] },
    { name: 'Bảo hiểm', words: [['insurance', 'bảo hiểm', 'health insurance'], ['coverage', 'phạm vi bảo hiểm', 'full coverage'], ['claim', 'yêu cầu bồi thường', 'file a claim'], ['policy', 'hợp đồng / chính sách', 'an insurance policy']] },
  ] },
  { id: 'tech', name: 'Công nghệ', branches: [
    { name: 'Phần mềm', words: [['install', 'cài đặt', 'install an update'], ['upgrade', 'nâng cấp', 'upgrade the system'], ['compatible', 'tương thích', 'compatible with'], ['malfunction', 'trục trặc', 'a system malfunction']] },
    { name: 'Dữ liệu', words: [['database', 'cơ sở dữ liệu', 'update the database'], ['backup', 'bản sao lưu', 'make a backup'], ['access', 'truy cập', 'access the files'], ['password', 'mật khẩu', 'reset your password']] },
    { name: 'Hỗ trợ', words: [['technician', 'kỹ thuật viên', 'call a technician'], ['troubleshoot', 'xử lý sự cố', 'troubleshoot a problem'], ['manual', 'sách hướng dẫn', 'refer to the manual'], ['device', 'thiết bị', 'a mobile device']] },
  ] },
  { id: 'legal', name: 'Hợp đồng & pháp lý', branches: [
    { name: 'Hợp đồng', words: [['contract', 'hợp đồng', 'renew a contract'], ['terms', 'điều khoản', 'terms and conditions'], ['negotiate', 'đàm phán', 'negotiate a deal'], ['signature', 'chữ ký', 'require a signature']] },
    { name: 'Tuân thủ', words: [['comply', 'tuân thủ', 'comply with the law'], ['authorize', 'ủy quyền, cho phép', 'authorized personnel'], ['confidential', 'bảo mật', 'confidential information'], ['violation', 'vi phạm', 'a safety violation']] },
    { name: 'Hiệu lực', words: [['effective', 'có hiệu lực', 'effective immediately'], ['expire', 'hết hạn', 'the offer expires'], ['valid', 'hợp lệ', 'a valid ID'], ['terminate', 'chấm dứt', 'terminate an agreement']] },
  ] },
  { id: 'service', name: 'Dịch vụ khách hàng', branches: [
    { name: 'Hỗ trợ', words: [['inquiry', 'yêu cầu thông tin', 'respond to an inquiry'], ['assist', 'hỗ trợ', 'assist customers'], ['representative', 'nhân viên đại diện', 'a customer service representative'], ['resolve', 'giải quyết', 'resolve a complaint']] },
    { name: 'Vấn đề', words: [['complaint', 'phàn nàn', 'file a complaint'], ['inconvenience', 'sự bất tiện', 'apologize for the inconvenience'], ['replacement', 'hàng thay thế', 'send a replacement'], ['warranty', 'bảo hành', 'under warranty']] },
    { name: 'Đơn hàng', words: [['order', 'đơn hàng', 'place an order'], ['track', 'theo dõi', 'track a package'], ['deliver', 'giao hàng', 'deliver on time'], ['out of stock', 'hết hàng', 'currently out of stock']] },
  ] },
];

// [word, antonym, short Vietnamese hint]
const ANTONYMS = [
  ['increase', 'decrease', 'tăng / giảm'], ['expand', 'reduce', 'mở rộng / thu hẹp'], ['approve', 'reject', 'duyệt / bác bỏ'], ['accept', 'decline', 'nhận / từ chối'],
  ['hire', 'dismiss', 'tuyển / sa thải'], ['profit', 'loss', 'lãi / lỗ'], ['temporary', 'permanent', 'tạm thời / lâu dài'], ['mandatory', 'optional', 'bắt buộc / tùy chọn'],
  ['arrive', 'depart', 'đến / khởi hành'], ['import', 'export', 'nhập / xuất'], ['punctual', 'late', 'đúng giờ / trễ'], ['available', 'occupied', 'trống / đã có người'],
  ['include', 'exclude', 'gồm / loại trừ'], ['rise', 'fall', 'tăng / giảm (nội động)'], ['maximum', 'minimum', 'tối đa / tối thiểu'], ['advance', 'delay', 'đẩy sớm / trì hoãn'],
  ['confirm', 'cancel', 'xác nhận / hủy'], ['efficient', 'wasteful', 'hiệu quả / lãng phí'], ['reliable', 'unreliable', 'đáng tin / không đáng tin'], ['expensive', 'affordable', 'đắt / phải chăng'],
  ['full-time', 'part-time', 'toàn thời gian / bán thời gian'], ['wholesale', 'retail', 'bán sỉ / bán lẻ'], ['domestic', 'international', 'trong nước / quốc tế'], ['senior', 'junior', 'cấp cao / cấp dưới'],
  ['supply', 'demand', 'cung / cầu'], ['lend', 'borrow', 'cho mượn / mượn'], ['purchase', 'sell', 'mua / bán'], ['assemble', 'dismantle', 'lắp / tháo'],
  ['widen', 'narrow', 'nới rộng / thu hẹp'], ['strengthen', 'weaken', 'củng cố / làm yếu'], ['public', 'private', 'công khai / riêng'], ['upstairs', 'downstairs', 'tầng trên / tầng dưới'],
  ['inbound', 'outbound', 'chiều về / chiều đi'], ['entrance', 'exit', 'lối vào / lối ra'], ['ascend', 'descend', 'đi lên / đi xuống'], ['victory', 'defeat', 'thắng / thua'],
  ['generous', 'stingy', 'hào phóng / keo kiệt'], ['flexible', 'rigid', 'linh hoạt / cứng nhắc'], ['complex', 'simple', 'phức tạp / đơn giản'], ['brief', 'lengthy', 'ngắn gọn / dài dòng'],
  ['frequent', 'rare', 'thường xuyên / hiếm'], ['ancient', 'modern', 'cổ / hiện đại'], ['accurate', 'inaccurate', 'chính xác / sai'], ['legal', 'illegal', 'hợp pháp / bất hợp pháp'],
  ['visible', 'invisible', 'nhìn thấy / không thấy'], ['satisfied', 'dissatisfied', 'hài lòng / không hài lòng'], ['agree', 'disagree', 'đồng ý / không đồng ý'], ['appear', 'disappear', 'xuất hiện / biến mất'],
  ['connect', 'disconnect', 'kết nối / ngắt'], ['qualified', 'unqualified', 'đủ điều kiện / không đủ'], ['employed', 'unemployed', 'có việc / thất nghiệp'], ['familiar', 'unfamiliar', 'quen / lạ'],
  ['crowded', 'empty', 'đông / vắng'], ['damaged', 'intact', 'hư hỏng / nguyên vẹn'], ['tight', 'loose', 'chặt / lỏng'], ['heavy', 'light', 'nặng / nhẹ'],
  ['spacious', 'cramped', 'rộng rãi / chật chội'], ['outdated', 'up-to-date', 'lỗi thời / cập nhật'], ['urgent', 'routine', 'khẩn / thường lệ'], ['rough', 'smooth', 'gồ ghề / trơn tru'],
  ['active', 'inactive', 'hoạt động / ngưng'], ['vacant', 'filled', 'còn trống / đã tuyển đủ (vị trí)'], ['gain', 'lose', 'được / mất'], ['attach', 'detach', 'đính kèm / tách ra'],
  ['encourage', 'discourage', 'khuyến khích / ngăn cản'], ['permit', 'prohibit', 'cho phép / cấm'], ['reveal', 'conceal', 'tiết lộ / che giấu'], ['raise', 'lower', 'nâng / hạ'],
  ['majority', 'minority', 'đa số / thiểu số'], ['strength', 'weakness', 'điểm mạnh / điểm yếu'], ['shortage', 'surplus', 'thiếu hụt / dư thừa'], ['beginning', 'conclusion', 'mở đầu / kết luận'],
  ['optimistic', 'pessimistic', 'lạc quan / bi quan'], ['voluntary', 'compulsory', 'tự nguyện / bắt buộc'], ['internal', 'external', 'nội bộ / bên ngoài'], ['previous', 'following', 'trước / sau'],
];

export const ANTO = ANTONYMS.map(([a, b, vi], i) => ({ id: `anto-${i + 1}`, a, b, vi }));

export function allTopicWords() {
  return TOPICS.flatMap((t) => t.branches.flatMap((b) => b.words.map(([w, vi, col]) => ({ topic: t.id, branch: b.name, w, vi, col }))));
}
