// Local speech-to-text for a Parroto listening clip, with Whisper running in the browser (transformers.js).
// The audio is fetched from Parroto's CDN and processed on this machine only; the transcript is not stored.

import { pipeline, env } from '../vendor/transformers/transformers.min.js';

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const src = params.get('src');
const q = params.get('q');

env.allowLocalModels = false;
env.useBrowserCache = true;
// ONNX runtime files ship inside the extension (no code is loaded from a CDN).
env.backends.onnx.wasm.wasmPaths = new URL('../vendor/transformers/', import.meta.url).href;
env.backends.onnx.wasm.numThreads = 1; // extension pages are not cross-origin isolated

let asr = null;
let asrModel = '';

function status(msg) {
  $('#status').textContent = msg;
}

function fmt(t) {
  if (t == null) return '';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function loadAudio(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('không tải được audio (' + res.status + ')');
  const buf = await res.arrayBuffer();
  // Decoding into a 16 kHz context resamples to what Whisper expects.
  const ctx = new AudioContext({ sampleRate: 16000 });
  const audio = await ctx.decodeAudioData(buf);
  const ch0 = audio.getChannelData(0);
  if (audio.numberOfChannels > 1) {
    const ch1 = audio.getChannelData(1);
    const mono = new Float32Array(ch0.length);
    for (let i = 0; i < ch0.length; i++) mono[i] = (ch0[i] + ch1[i]) / 2;
    ctx.close();
    return mono;
  }
  ctx.close();
  return ch0;
}

async function getModel(name) {
  if (asr && asrModel === name) return asr;
  const files = {};
  asr = await pipeline('automatic-speech-recognition', name, {
    dtype: 'q8',
    device: 'wasm',
    progress_callback: (p) => {
      if (p.status === 'progress' && p.total) {
        files[p.file] = p.loaded / p.total;
        const vals = Object.values(files);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        $('#bar').style.width = Math.round(avg * 100) + '%';
        status(`Đang tải mô hình (lần đầu): ${Math.round(avg * 100)}%`);
      }
    },
  });
  asrModel = name;
  return asr;
}

// Split the clip at pauses (≥ 0.35 s of near-silence) so each spoken turn becomes one line.
// Whisper's timestamp mode is unreliable on short clips; plain transcription per pause-delimited segment is stable.
export function segmentsBySilence(x, SR = 16000) {
  const F = Math.floor(SR * 0.03);
  const rms = [];
  for (let i = 0; i + F <= x.length; i += F) {
    let s = 0;
    for (let j = i; j < i + F; j++) s += x[j] * x[j];
    rms.push(Math.sqrt(s / F));
  }
  if (!rms.length) return [[0, x.length]];
  const sorted = [...rms].sort((a, b) => a - b);
  const thr = Math.max(0.005, sorted[Math.floor(sorted.length * 0.1)] * 3);
  const raw = [];
  let start = null;
  let silent = 0;
  for (let k = 0; k < rms.length; k++) {
    if (rms[k] > thr) { if (start == null) start = k; silent = 0; } else if (start != null) {
      silent++;
      if (silent * 0.03 >= 0.35) { raw.push([start, k - silent + 1]); start = null; silent = 0; }
    }
  }
  if (start != null) raw.push([start, rms.length]);
  const merged = [];
  for (const [a, b] of raw) {
    const last = merged[merged.length - 1];
    if (last && (a - last[1]) * 0.03 < 0.25 && (b - last[0]) * 0.03 < 15) last[1] = b; else merged.push([a, b]);
  }
  // Long monologues (Part 4) are cut into ≤ 25 s pieces so each fits Whisper's 30 s window.
  const out = [];
  for (const [a, b] of merged.filter(([a, b]) => (b - a) * 0.03 > 0.3)) {
    const maxF = Math.floor(25 / 0.03);
    for (let c = a; c < b; c += maxF) out.push([c, Math.min(b, c + maxF)]);
  }
  return out.map(([a, b]) => [Math.max(0, a * F - 0.15 * SR) | 0, Math.min(x.length, b * F + 0.15 * SR) | 0]);
}

function render(chunks) {
  const box = $('#segs');
  box.innerHTML = chunks.map((c, i) => `<div class="seg" data-i="${i}" data-start="${c.timestamp?.[0] ?? ''}"><div class="t">${fmt(c.timestamp?.[0])}</div><div class="x">${c.text.trim().replace(/</g, '&lt;')}</div></div>`).join('')
    || '<div class="muted small">Không nhận ra lời nào.</div>';
  box.classList.toggle('hidden-text', $('#hide').checked);
}

async function run() {
  if (!src) { status('Thiếu đường dẫn audio.'); return; }
  $('#go').disabled = true;
  try {
    const model = $('#model').value;
    status('Đang chuẩn bị mô hình…');
    const pipe = await getModel(model);
    status('Đang tải audio…');
    const audio = await loadAudio(src);
    $('#bar').style.width = '100%';
    status(`Đang chuyển thành chữ (${Math.round(audio.length / 16000)} giây audio)…`);
    const t0 = performance.now();
    const parts = segmentsBySilence(audio);
    const chunks = [];
    for (let i = 0; i < parts.length; i++) {
      const [a, b] = parts[i];
      status(`Đang chuyển thành chữ: đoạn ${i + 1}/${parts.length}…`);
      $('#bar').style.width = Math.round(((i + 1) / parts.length) * 100) + '%';
      const r = await pipe(audio.slice(a, b));
      const text = (r.text || '').trim();
      if (text) chunks.push({ timestamp: [a / 16000, b / 16000], text });
      render(chunks);
    }
    render(chunks);
    status(`Xong trong ${Math.round((performance.now() - t0) / 1000)} giây. Bấm một dòng để nghe từ chỗ đó.`);
  } catch (e) {
    status('Lỗi: ' + (e && e.message ? e.message : e));
  } finally {
    $('#go').disabled = false;
  }
}

$('#title').textContent = q ? `Lời thoại – câu ${q}` : 'Lời thoại';
if (src) $('#player').src = src;
$('#go').addEventListener('click', run);
$('#hide').addEventListener('change', () => $('#segs').classList.toggle('hidden-text', $('#hide').checked));
$('#segs').addEventListener('click', (e) => {
  const seg = e.target.closest('.seg');
  if (!seg) return;
  seg.classList.add('revealed');
  const t = Number(seg.dataset.start);
  if (!Number.isNaN(t)) { $('#player').currentTime = t; $('#player').play(); }
});
$('#player').addEventListener('timeupdate', () => {
  const t = $('#player').currentTime;
  let cur = null;
  document.querySelectorAll('.seg').forEach((s) => { if (Number(s.dataset.start) <= t) cur = s; });
  document.querySelectorAll('.seg').forEach((s) => s.classList.toggle('now', s === cur));
});
// Remember the model choice for next time (a preference, not data).
try {
  const saved = localStorage.getItem('tc:whisperModel');
  if (saved) $('#model').value = saved;
  $('#model').addEventListener('change', () => localStorage.setItem('tc:whisperModel', $('#model').value));
} catch { /* storage blocked */ }
if (params.get('auto') === '1') run();
