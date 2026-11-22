// "Chỉ số chuyên sâu" section of the Tiến độ tab: four groups of metrics.

import { accuracyDetail, speedStamina, memoryFixing, forecast } from '../lib/metrics.js';
import { P5_CATS } from '../data/p5.js';
import { P2_TYPES, P2_TRAPS } from '../data/p2.js';
import { Q_TYPES } from '../data/reading.js';
import { FOCUS } from '../data/listen-read.js';
import { CODES } from '../lib/constants.js';
import { formatVN } from '../lib/dates.js';
import { savedFromErrors } from '../lib/vocab.js';
import { summarize, mmss } from '../lib/pace.js';
import { realP5Wrong } from '../lib/p5type.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (r) => (r == null ? '–' : Math.round(r * 100) + '%');
const cls = (r, n = 5) => (r == null || n < 5 ? '' : r < 0.6 ? 'rate-bad' : r >= 0.85 ? 'rate-ok' : '');

function worst(groups, names, k = 4) {
  return Object.entries(groups)
    .filter(([, v]) => v.n >= 3)
    .sort((a, b) => a[1].rate - b[1].rate)
    .slice(0, k)
    .map(([g, v]) => `<tr><td>${esc(names[g] || g)}</td><td class="num ${cls(v.rate, v.n)}">${pct(v.rate)}</td><td class="num muted">${v.n}</td></tr>`)
    .join('');
}

function cell(v) {
  if (!v) return '';
  const a = Math.min(1, v / 8);
  return `background:color-mix(in srgb, var(--series-2) ${Math.round(a * 70)}%, transparent)`;
}

export function renderMetrics(db, d) {
  const A = accuracyDetail(db, d);
  const S = speedStamina(db, d);
  const M = memoryFixing(db, d);
  const F = forecast(db, d, 800);
  let html = '<h2>Chỉ số chuyên sâu</h2>';

  // 4. Forecast first: it frames everything else.
  html += `<div class="card"><h3 style="margin-top:0">Dự báo & sẵn sàng (mục tiêu 800)</h3>`;
  if (F.est == null) {
    html += '<div class="small muted">Chưa đủ dữ liệu: cần ít nhất 50 câu Listening và 50 câu Reading trong 3 tuần (luyện Part hoặc đề full).</div>';
  } else {
    const band = F.L && F.R ? `${F.L.low + F.R.low}–${F.L.high + F.R.high}` : `${F.est}`;
    html += `<div class="stat-row" style="margin-bottom:6px">
        <div class="stat"><div class="v">${band}</div><div class="l">khoảng điểm ước lượng${F.L && F.R ? ` (L ${F.L.low}–${F.L.high} · R ${F.R.low}–${F.R.high})` : ''}</div></div>
        <div class="stat"><div class="v">${F.gap}</div><div class="l">điểm còn thiếu tới 800${F.perWeek != null ? ` · cần ≈ +${F.perWeek}/tuần` : ''}</div></div>
      </div>
      <div class="progressbar"><div style="width:${Math.round(F.readiness * 100)}%"></div></div>
      <div class="small muted" style="margin-top:4px">Sẵn sàng ${pct(F.readiness)} · ${F.daysLeft ?? '–'} ngày tới kỳ thi · ${F.fullCount} đề full${F.lastFull ? ` (gần nhất ${F.lastFull.L + F.lastFull.R} ngày ${formatVN(F.lastFull.date)})` : ''}</div>
      ${F.levers.length ? `<div class="small" style="margin-top:6px">Part kéo điểm nhiều nhất nếu lên 90%: ${F.levers.map((l) => `<b>${l.part}</b> (${pct(l.rate)} → +${l.potential} điểm)`).join(' · ')}</div>` : ''}
      <div class="small muted" style="margin-top:4px">Ước lượng thô: điểm ≈ 5 × số câu đúng mỗi phần, ± 35. ETS không công bố bảng quy đổi; chỉ dùng để định hướng.</div>`;
  }
  html += '</div>';

  // 1. Accuracy detail
  const w = A.weeks;
  html += `<div class="card"><h3 style="margin-top:0">Độ chính xác chi tiết (14 ngày)</h3>
    <div class="small muted">Dạng yếu nhất ở từng bài luyện (≥ 3 câu):</div>
    <table><tr><th>Part 5 – dạng ngữ pháp</th><th class="num">Đúng</th><th class="num">Câu</th></tr>${worst(A.p5, P5_CATS) || '<tr><td class="muted">chưa đủ dữ liệu</td></tr>'}</table>
    ${(() => {
      const w = Object.entries(realP5Wrong(db, d)).sort((a, b) => b[1] - a[1]);
      return w.length ? `<div class="small" style="margin-top:6px">Part 5 đề thật (21 ngày) – dạng sai nhiều nhất: ${w.slice(0, 5).map(([c, n]) => `<b>${esc(P5_CATS[c] || c)}</b> ${n}`).join(' · ')}. Luyện P5 tự ưu tiên các dạng này.</div>` : '<div class="small muted" style="margin-top:6px">Part 5 đề thật: mở trang kết quả đề trên Parroto (tab Part 5) để extension nhận dạng dạng câu sai.</div>';
    })()}
    <table style="margin-top:6px"><tr><th>Part 2 – nhận diện bẫy</th><th class="num">Đúng</th><th class="num">Lần</th></tr>${worst(A.traps, Object.fromEntries(Object.entries(P2_TRAPS).map(([k, v]) => [k, v.name]))) || '<tr><td class="muted">chưa đủ dữ liệu</td></tr>'}</table>
    <table style="margin-top:6px"><tr><th>Part 6/7 – dạng câu (mô phỏng)</th><th class="num">Đúng</th><th class="num">Câu</th></tr>${worst(A.reading, Q_TYPES) || '<tr><td class="muted">chưa đủ dữ liệu</td></tr>'}</table>
    <table style="margin-top:6px"><tr><th>Part 3/4 – nhớ câu hỏi</th><th class="num">Đúng</th><th class="num">Câu</th></tr>${worst(A.focus, FOCUS) || '<tr><td class="muted">chưa đủ dữ liệu</td></tr>'}</table>
    ${A.parrotoWeak.length ? `<div class="small" style="margin-top:6px">Parroto "Weak areas": ${A.parrotoWeak.slice(0, 6).map((x) => `${esc(x.tag)} (${x.wrong})`).join(', ')}</div>` : ''}
    <div class="small muted" style="margin-top:8px">Mã lỗi theo tuần (đậm = nhiều):</div>
    <table><tr><th>Mã</th>${w.map((x) => `<th class="num">${formatVN(x.to).slice(3)}</th>`).join('')}</tr>
      ${Object.keys(CODES).filter((k) => w.some((x) => x.c[k])).map((k) => `<tr><td><b>${k}</b> <span class="muted small">${esc(CODES[k].name)}</span></td>${w.map((x) => `<td class="num" style="${cell(x.c[k])}">${x.c[k] || ''}</td>`).join('')}</tr>`).join('') || '<tr><td class="muted" colspan="5">chưa có lỗi nào được gắn mã</td></tr>'}
    </table></div>`;

  // 2. Speed & stamina
  const st = S.stamina;
  const halfRow = (label, h) => (h ? `<tr><td>${label}</td><td class="num">${pct(h.first)}</td><td class="num ${h.second != null && h.first != null && h.second < h.first - 0.1 ? 'rate-bad' : ''}">${pct(h.second)}</td></tr>` : '');
  html += `<div class="card"><h3 style="margin-top:0">Tốc độ & sức bền</h3>
    <table>
      <tr><td>Part 5 (luyện)</td><td class="num"><b>${S.p5Secs != null ? Math.round(S.p5Secs) + ' giây/câu' : '–'}</b></td><td class="muted small">mục tiêu 15–20 · hết giờ ${S.p5Timeouts} lần</td></tr>
      <tr><td>Part 6 (mô phỏng)</td><td class="num"><b>${S.p6Secs != null ? Math.round(S.p6Secs) + ' giây/câu' : '–'}</b></td><td class="muted small">mục tiêu ≤ 37</td></tr>
      <tr><td>Part 7 (mô phỏng)</td><td class="num"><b>${S.p7Secs != null ? Math.round(S.p7Secs) + ' giây/câu' : '–'}</b></td><td class="muted small">mục tiêu ≤ 60</td></tr>
    </table>
    ${(() => {
      const sessions = Object.entries(db.pace || {}).filter(([, p]) => p.qSecs && Object.keys(p.qSecs).length >= 10).sort((a, b) => (a[1].date < b[1].date ? -1 : 1));
      if (!sessions.length) return '<div class="small muted" style="margin-top:6px">Đề Reading thật trên Parroto: chưa có số liệu. Khi làm Reading, khung ⏱ góc trái dưới tự đo giây/câu và mốc giờ.</div>';
      const rows = sessions.slice(-4).map(([, p]) => {
        const groups = p.groups ? p.groups.map(([a, b, texts]) => ({ qs: Array.from({ length: b - a + 1 }, (_, i) => a + i), texts })) : undefined;
        const s = summarize(p.qSecs, groups, p.scale || 1);
        const f = (x, goal) => (x ? `<span class="${x.avg > goal * 1.15 ? 'rate-bad' : ''}">${Math.round(x.avg)}s</span>` : '–');
        return `<tr><td>${formatVN(p.date)}</td><td class="num">${f(s.P5, 22)}</td><td class="num">${f(s.P6, 34)}</td><td class="num">${f(s.P7, 61)}</td><td class="num">${s.over.length ? s.over.map((o) => `${o.first}–${o.last} (+${mmss(o.usedSec - o.budgetSec)})`).join(', ') : '–'}</td></tr>`;
      }).join('');
      return `<div class="small muted" style="margin-top:8px">Đề Reading trên Parroto (đo bằng khung ⏱): giây/câu, mục tiêu P5 ≤ 22 · P6 ≤ 34 · P7 ≤ 61</div>
        <table><tr><th>Ngày</th><th class="num">P5</th><th class="num">P6</th><th class="num">P7</th><th class="num">Đoạn P7 vượt ngân sách</th></tr>${rows}</table>`;
    })()}
    ${(() => {
      const sets = Object.values(db.pace || {}).flatMap((p) => Object.values(p.listen || {}));
      if (!sets.length) return '';
      const replay = sets.filter((x) => x.plays > 1).length;
      const pre = sets.map((x) => x.preread).filter((x) => x != null);
      const avgPre = pre.length ? Math.round(pre.reduce((a, b) => a + b, 0) / pre.length) : null;
      return `<div class="small" style="margin-top:6px">Nghe P3/P4 trên Parroto: ${sets.length} bộ · nghe lại ${replay} bộ (${Math.round((replay / sets.length) * 100)}%, thi thật 0%) · đọc trước trung bình ${avgPre != null ? avgPre + ' giây' : '–'} (nên 15–30)</div>`;
    })()}
    ${st ? `<div class="small muted" style="margin-top:8px">Sức bền – đề full ngày ${formatVN(st.date)}: tỷ lệ đúng nửa đầu vs nửa sau (đỏ = tụt > 10 điểm %):</div>
      <table><tr><th></th><th class="num">Nửa đầu</th><th class="num">Nửa sau</th></tr>${halfRow('Listening', st.L)}${halfRow('Reading', st.R)}${halfRow('Part 7', st.p7)}</table>
      <div class="small">Câu bỏ trống: <b>${st.skipped}</b>${S.skippedTrend.length > 1 ? ` · xu hướng: ${S.skippedTrend.map((x) => x.n).join(' → ')}` : ''}${st.skipped > 5 ? ' — cần tăng tốc Part 7' : ''}</div>`
    : '<div class="small muted" style="margin-top:6px">Sức bền: cần 1 đề full tự ghi (Test Mode) để so nửa đầu / nửa sau.</div>'}
  </div>`;

  // 3. Memory & error fixing
  const v = M.vocab;
  html += `<div class="card"><h3 style="margin-top:0">Trí nhớ & sửa lỗi</h3>
    <table>
      <tr><td>Làm lại đúng ở mốc +2 ngày</td><td class="num ${cls(M.redo2, M.redo2n)}"><b>${pct(M.redo2)}</b></td><td class="muted small">${M.redo2n} lần</td></tr>
      <tr><td>Làm lại đúng ở mốc +7 ngày</td><td class="num ${cls(M.redo7, M.redo7n)}"><b>${pct(M.redo7)}</b></td><td class="muted small">${M.redo7n} lần</td></tr>
      <tr><td>Câu luyện gặp lại, lần mới nhất đúng</td><td class="num ${cls(M.drillRepeatOk.rate, M.drillRepeatOk.n)}"><b>${pct(M.drillRepeatOk.rate)}</b></td><td class="muted small">${M.drillRepeatOk.n} câu</td></tr>
      <tr><td>Sai khi tự tin (14 ngày)</td><td class="num"><b>${pct(M.hiConfRate)}</b></td><td class="muted small">${M.hiConfN} câu — sửa được nhớ lâu nhất</td></tr>
    </table>
    <div class="small" style="margin-top:6px">Lỗi lặp lại 2 tuần liền (≥ 3/tuần): ${M.recurring.length ? M.recurring.map((k) => `<b>${k}</b> ${esc(CODES[k].name)}`).join(', ') + ' → ưu tiên tuần này' : '<span class="muted">không có</span>'}</div>
    ${v ? `<div class="small" style="margin-top:6px">Từ vựng (Parroto): độ chính xác <b>${v.accuracy ?? '–'}%</b> · Mastered <b>${v.mastered ?? '–'}</b>${v.masteredGain != null ? ` (+${v.masteredGain} từ lần đầu ghi)` : ''} · tổng ${v.totalCards} thẻ · đến hạn ${v.due}${M.dueTrend.length > 1 ? ` · Due 7 ngày: ${M.dueTrend.map((x) => x.due).join(' → ')}` : ''}</div>` : '<div class="small muted" style="margin-top:6px">Từ vựng: mở trang Vocabulary trên Parroto để có số liệu.</div>'}
    ${(() => {
      const all = db.vocab?.saved || [];
      const fromErr = all.filter((w) => w.session);
      const recent = savedFromErrors(db, d);
      if (!all.length) return '<div class="small muted" style="margin-top:6px">Từ lưu từ câu sai: chưa có. Bôi đen từ trong câu sai trên trang kết quả Parroto → "Tra & lưu" → chọn nghĩa → Save.</div>';
      const byCode = {};
      for (const w of fromErr) if (w.code) byCode[w.code] = (byCode[w.code] || 0) + 1;
      return `<div class="small" style="margin-top:6px">Từ lưu vào My vocabulary: <b>${all.length}</b> (từ câu sai ${fromErr.length}, 14 ngày qua ${recent.length})${Object.keys(byCode).length ? ' · theo mã lỗi: ' + Object.entries(byCode).map(([k, n]) => `${k} ${n}`).join(', ') : ''}${recent.length ? ' · gần nhất: ' + recent.slice(-6).map((w) => esc(w.word)).join(', ') : ''}</div>`;
    })()}
  </div>`;
  return html;
}
