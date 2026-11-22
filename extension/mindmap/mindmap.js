import * as store from '../lib/store.js';
import { TOPICS } from '../data/topics.js';
import { goodVoices } from '../panel/drill-ui.js';

// Saving can fail when this page was left open while the extension was reloaded.
function showSaveError(msg) {
  let b = document.getElementById('tc-save-error');
  if (!b) {
    b = document.createElement('div');
    b.id = 'tc-save-error';
    b.style.cssText = 'position:fixed;left:8px;right:8px;top:8px;z-index:99;background:#b91c1c;color:#fff;padding:10px 12px;border-radius:8px;font-size:13px';
    document.body.appendChild(b);
  }
  b.textContent = 'Không lưu được dữ liệu (' + msg + '). Hãy ĐÓNG trang/panel này và mở lại, rồi làm lại bước vừa rồi.';
}
window.addEventListener('tc-save-error', (e) => showSaveError(e.detail.message));
window.addEventListener('unhandledrejection', (e) => {
  const m = String(e.reason && e.reason.message || e.reason || '');
  if (/context invalidated|storage|quota/i.test(m)) showSaveError(m);
});


const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let db = null;
let topicId = new URLSearchParams(location.search).get('topic') || TOPICS[0].id;
let selected = null; // {w, vi, col, branch, mine}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast.h);
  toast.h = setTimeout(() => t.classList.add('hidden'), 2000);
}

function status(word) {
  return db.drill?.wordStatus?.[word.toLowerCase()] || '';
}

function topicWords(t) {
  const mine = (db.drill?.myWords || []).filter((m) => m.topic === t.id);
  return t.branches.map((b) => ({
    name: b.name,
    words: [
      ...b.words.map(([w, vi, col]) => ({ w, vi, col, branch: b.name, mine: false })),
      ...mine.filter((m) => m.branch === b.name).map((m) => ({ ...m, mine: true })),
    ],
  }));
}

function renderChips() {
  $('#chips').innerHTML = TOPICS.map((t) => {
    const words = topicWords(t).flatMap((b) => b.words);
    const known = words.filter((w) => status(w.w) === 'known').length;
    return `<button class="${t.id === topicId ? 'sel' : ''}" data-topic="${t.id}">${esc(t.name)}<small>${known}/${words.length}</small></button>`;
  }).join('');
}

function box(x, y, w, h, cls, lines, data = '') {
  const tx = lines.map((l, i) => `<text x="${x}" y="${y + (i - (lines.length - 1) / 2) * 18 + 5}" text-anchor="middle" class="${l.cls || ''}">${esc(l.t)}</text>`).join('');
  return `<g class="${cls}" ${data}><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="8"/>${tx}</g>`;
}

function renderMap() {
  const t = TOPICS.find((x) => x.id === topicId) || TOPICS[0];
  const branches = topicWords(t);
  const hideVi = $('#hideVi').checked;
  const W = 980;
  const H = 680;
  const cx = W / 2;
  const cy = H / 2;
  let lines = '';
  let nodes = '';
  const nB = branches.length;
  branches.forEach((b, bi) => {
    const ang = -Math.PI / 2 + (bi * 2 * Math.PI) / nB;
    const bx = cx + Math.cos(ang) * 150;
    const by = cy + Math.sin(ang) * 120;
    lines += `<line x1="${cx}" y1="${cy}" x2="${bx}" y2="${by}"/>`;
    const n = b.words.length;
    const spread = Math.min(Math.PI * 0.75, 0.32 * n);
    b.words.forEach((w, wi) => {
      const a = ang + (n === 1 ? 0 : -spread / 2 + (wi * spread) / (n - 1));
      const r = 255 + (wi % 2) * 22;
      const lx = Math.max(85, Math.min(W - 85, cx + Math.cos(a) * r * 1.3));
      const ly = Math.max(28, Math.min(H - 28, cy + Math.sin(a) * r * 0.95));
      lines += `<line x1="${bx}" y1="${by}" x2="${lx}" y2="${ly}"/>`;
      const st = status(w.w);
      const isSel = selected && selected.w === w.w;
      const wordW = Math.max(100, Math.max(w.w.length * 9.6, (w.vi || '').length * (hideVi ? 0 : 7)) + 24);
      const textLines = hideVi ? [{ t: w.w }] : [{ t: w.w }, { t: w.vi, cls: 'vi' }];
      nodes += box(lx, ly, wordW, hideVi ? 32 : 48, `leaf ${st} ${w.mine ? 'mine' : ''} ${isSel ? 'sel' : ''}`, textLines, `data-word="${esc(w.w)}" data-branch="${esc(b.name)}"`);
    });
    nodes += box(bx, by, Math.max(120, b.name.length * 10 + 24), 36, 'branch', [{ t: b.name }]);
  });
  nodes += box(cx, cy, Math.max(180, t.name.length * 10.5 + 28), 46, 'center', [{ t: t.name }]);
  $('#map').innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="map" role="img" aria-label="Mindmap ${esc(t.name)}">${lines}${nodes}</svg>`;
  $('#addBranch').innerHTML = t.branches.map((b) => `<option>${esc(b.name)}</option>`).join('');
}

function renderInfo() {
  if (!selected) return;
  const st = status(selected.w);
  $('#info').innerHTML = `
    <div style="font-size:20px;font-weight:700">${esc(selected.w)}</div>
    <div>${esc(selected.vi || '')}</div>
    ${selected.col ? `<div class="small muted" style="margin-top:4px">Cụm đi kèm: <b>${esc(selected.col)}</b></div>` : ''}
    <div class="small muted" style="margin-top:4px">Nhánh: ${esc(selected.branch)}${selected.mine ? ' · từ bạn thêm' : ''}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
      <button class="btn" id="btnSpeak">▶ Nghe</button>
      <button class="btn ${st === 'learning' ? 'primary' : ''}" data-status="learning">Đang học</button>
      <button class="btn ${st === 'known' ? 'ok' : ''}" data-status="known">Đã nhớ</button>
      ${st ? '<button class="link" data-status="">bỏ đánh dấu</button>' : ''}
      ${selected.mine ? '<button class="link" id="btnDelMine">xóa từ</button>' : ''}
    </div>`;
}

function speak(text) {
  if (typeof speechSynthesis === 'undefined') return toast('Trình duyệt không hỗ trợ đọc to.');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = goodVoices(speechSynthesis.getVoices(), 'en-US')[0];
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

function findWord(word, branch) {
  const t = TOPICS.find((x) => x.id === topicId);
  for (const b of topicWords(t)) {
    if (b.name !== branch) continue;
    const w = b.words.find((x) => x.w === word);
    if (w) return w;
  }
  return null;
}

document.addEventListener('click', async (e) => {
  const leaf = e.target.closest('.leaf');
  if (leaf) {
    selected = findWord(leaf.dataset.word, leaf.dataset.branch);
    renderMap();
    renderInfo();
    return;
  }
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.topic) {
    topicId = b.dataset.topic;
    selected = null;
    history.replaceState(null, '', '?topic=' + topicId);
    $('#info').innerHTML = '<div class="muted small">Bấm vào một từ để xem nghĩa, cụm từ đi kèm và nghe phát âm.</div>';
    renderChips();
    renderMap();
    return;
  }
  if (b.id === 'btnSpeak' && selected) return speak(selected.col ? `${selected.w}. ${selected.col}` : selected.w);
  if (b.dataset.status != null && selected) {
    const key = selected.w.toLowerCase();
    await store.update('drill', (dr) => ({ ...dr, wordStatus: { ...(dr.wordStatus || {}), [key]: b.dataset.status } }));
    return;
  }
  if (b.id === 'btnDelMine' && selected) {
    const w = selected.w;
    selected = null;
    await store.update('drill', (dr) => ({ ...dr, myWords: (dr.myWords || []).filter((m) => !(m.topic === topicId && m.w === w)) }));
    $('#info').innerHTML = '<div class="muted small">Đã xóa.</div>';
    return;
  }
  if (b.id === 'btnAdd') {
    const w = $('#addWord').value.trim();
    const vi = $('#addVi').value.trim();
    if (!w || !vi) return toast('Nhập từ và nghĩa.');
    await store.update('drill', (dr) => ({ ...dr, myWords: [...(dr.myWords || []), { topic: topicId, branch: $('#addBranch').value, w, vi, col: $('#addCol').value.trim() }] }));
    $('#addWord').value = '';
    $('#addVi').value = '';
    $('#addCol').value = '';
    toast('Đã thêm vào mindmap.');
  }
});

$('#hideVi').addEventListener('change', () => renderMap());

async function refresh() {
  db = await store.getAll();
  renderChips();
  renderMap();
  renderInfo();
}

store.onChange(refresh);
refresh();
