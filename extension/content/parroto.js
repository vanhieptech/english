// Content script for parroto.app.
// Reads only what is shown to you on the page, and sends numbers to the extension.
// It never clicks anything and never copies lesson or test content.

(() => {
  const TICK = 15; // seconds
  const IDLE_LIMIT = 120000; // stop counting after 2 minutes without activity
  let lastActivity = Date.now();
  let lastUrl = '';
  let lastLessonsHash = '';
  let lastLessonSent = '';
  let pageSince = Date.now();

  function send(msg) {
    try {
      chrome.runtime.sendMessage(msg).catch(() => {});
    } catch {
      // Extension was reloaded; this old script can no longer talk to it.
    }
  }

  function category(path) {
    if (path.startsWith('/exams/toeic')) return 'exam';
    if (path.startsWith('/lessons/dictation')) return 'dictation';
    if (path.startsWith('/lessons/shadowing')) return 'shadowing';
    if (path.startsWith('/topics')) return 'listening';
    if (path.startsWith('/vocabulary') || path.startsWith('/flashcard') || path.startsWith('/decks')) return 'vocab';
    if (path.startsWith('/games')) return 'games';
    return 'other';
  }

  function mediaPlaying() {
    return [...document.querySelectorAll('audio, video')].some((m) => !m.paused && !m.ended);
  }

  const mark = () => { lastActivity = Date.now(); };
  ['keydown', 'mousedown', 'wheel', 'touchstart', 'scroll'].forEach((e) => window.addEventListener(e, mark, { passive: true, capture: true }));
  let lastMove = 0;
  window.addEventListener('mousemove', () => {
    const n = Date.now();
    if (n - lastMove > 5000) { lastMove = n; mark(); }
  }, { passive: true });

  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    const active = Date.now() - lastActivity < IDLE_LIMIT || mediaPlaying();
    if (!active) return;
    send({ type: 'tick', cat: category(location.pathname), sec: TICK });
  }, TICK * 1000);

  // ---- TOEIC Listening topic page: lesson list with scores ----
  function parseTopic() {
    const cards = [...document.querySelectorAll('main div.cursor-pointer')];
    const items = [];
    const seen = new Set();
    for (const card of cards) {
      const img = card.querySelector('img[alt]');
      if (!img) continue;
      const text = card.innerText.replace(/\s+/g, ' ');
      if (!/Dictation/i.test(text)) continue;
      const title = img.alt.trim();
      const level = (text.match(/\b(A1|A2|B1|B2|C1|C2)\b/) || [])[1] || '';
      const key = title + '|' + level;
      if (seen.has(key)) continue;
      seen.add(key);
      const d = text.match(/Dictation\s*(\d{1,3})\s*\/\s*100/i);
      const s = text.match(/Shadowing\s*(\d{1,3})\s*\/\s*100/i);
      items.push({
        title, level, pro: /\bPRO\b/.test(text),
        dictation: d ? Number(d[1]) : null,
        shadowing: s ? Number(s[1]) : null,
        order: items.length,
      });
    }
    return items;
  }

  // ---- Lesson page: score after "LESSON COMPLETE" ----
  function parseLesson() {
    const m = location.pathname.match(/^\/lessons\/(dictation|shadowing)\/([^/?#]+)/);
    if (!m) return null;
    const main = document.querySelector('main');
    if (!main) return null;
    const text = main.innerText;
    const sc = text.match(/(\d{1,3})\s*\n?\s*LESSON COMPLETE/i);
    if (!sc) return null;
    const title = document.title.split(' - ')[0].trim();
    return { mode: m[1], slug: m[2], title, score: Number(sc[1]), toeic: /TOEIC Listening/i.test(text.slice(0, 400)) };
  }

  // ---- Exam result page: /exams/toeic/session/<id>/result ----
  function parseResult() {
    const m = location.pathname.match(/^\/exams\/toeic\/session\/([^/]+)\/result/);
    if (!m) return null;
    const main = document.querySelector('main');
    if (!main) return null;
    const text = main.innerText;
    const isExam = /^\s*Back to list\s*\n+\s*Exam Result/i.test(text) || /\nExam Result\n/.test(text);
    const isPractice = /Practice Result/i.test(text.slice(0, 200));
    if (!isExam && !isPractice) return null;
    const byPart = text.indexOf('RESULTS BY PART') >= 0 ? text.indexOf('RESULTS BY PART') : text.search(/Results by Part/i);
    if (byPart < 0) return null;
    const areas = text.search(/Areas to Improve/i);
    const partBlock = text.slice(byPart, areas > byPart ? areas : byPart + 600);
    const parts = {};
    for (const pm of partBlock.matchAll(/Part\s+(\d)\s*\n[^\n]*\n\s*(\d+)\s*\/\s*(\d+)/g)) {
      parts['P' + pm[1]] = { correct: Number(pm[2]), total: Number(pm[3]) };
    }
    if (!Object.keys(parts).length) return null;
    const raw = {
      session: m[1],
      testName: document.title.replace(/^Result\s*[—-]\s*/, '').replace(/\s*\|\s*Parroto\s*$/, '').trim(),
      mode: isExam ? 'test' : 'practice',
      parts,
    };
    if (isExam) {
      const tot = text.match(/(\d+)\s*\n*\s*\/\s*990/);
      const halves = [...text.matchAll(/(\d+)\s*\n*\s*\/\s*495/g)].map((x) => Number(x[1]));
      if (tot) raw.total = Number(tot[1]);
      if (halves.length >= 2) { raw.L = halves[0]; raw.R = halves[1]; }
    }
    const tm = text.match(/Time spent:\s*(?:(\d+)h\s*)?(\d+)m/i);
    if (tm) raw.minutes = Number(tm[1] || 0) * 60 + Number(tm[2]);
    if (areas >= 0) {
      const after = text.slice(areas).split('\n').map((s) => s.trim()).filter(Boolean);
      const tags = [];
      for (const line of after.slice(1)) {
        if (/^KEEP IMPROVING$/i.test(line) || /^QUESTION MAP$/i.test(line) || line.length > 40) break;
        tags.push(line);
      }
      raw.tags = tags;
    }
    // Question map: green = correct, red = incorrect, muted = skipped.
    const label = [...main.querySelectorAll('*')].find((e) => e.children.length === 0 && /^question map$/i.test(e.textContent.trim()));
    if (label) {
      const box = label.parentElement.parentElement;
      const qmap = { correct: [], wrong: [], skipped: [] };
      for (const b of box.querySelectorAll('button')) {
        const n = Number(b.textContent.trim());
        if (!n) continue;
        const c = b.className;
        if (/bg-green-/.test(c)) qmap.correct.push(n);
        else if (/bg-red-/.test(c)) qmap.wrong.push(n);
        else qmap.skipped.push(n);
      }
      // Practice on a few parts shows only those questions; skipped ones outside the parts are not listed.
      raw.qmap = qmap;
    }
    return raw;
  }

  // ---- Review answers on the result page: features for error-code suggestions ----
  // Only features (indexes, yes/no flags) leave the page; question and option text are not stored.
  const STOP = new Set(['the','a','an','is','are','was','were','be','to','of','in','on','at','for','and','or','it','its','this','that','you','your','we','our','i','my','he','she','they','do','does','did','have','has','had','will','would','can','could','with','from','about','what','when','where','who','why','how','which','not','no','yes','there','here','them','his','her','me','us','just','so','one']);
  const FUNC = new Set(['in','on','at','by','for','with','from','to','of','about','during','since','until','despite','although','though','because','while','whereas','unless','if','whether','so','but','and','or','nor','yet','however','therefore','moreover','who','whom','whose','which','that','where','when','he','him','his','himself','she','her','herself','it','its','itself','they','them','their','theirs','themselves','we','us','our','ours','you','your','yours','yourself','each','every','all','any','some','both','either','neither','because of','due to','in spite of','as well as','so that','in order to','owing to','such as']);
  const words = (t) => (t.toLowerCase().match(/[a-z']+/g) || []);
  const content = (t) => words(t).filter((w) => w.length >= 4 && !STOP.has(w));

  function reviewFeatures(block, qNum) {
    const text = block.innerText;
    const status = (text.match(/\n\s*(INCORRECT|CORRECT|Skipped|SKIPPED|Unanswered)\s*\n/) || [])[1] || '';
    const letters = [...block.querySelectorAll('*')].filter((e) => e.children.length === 0 && /^[A-D]$/.test(e.textContent.trim()));
    const opts = [];
    for (const el of letters) {
      let box = el.parentElement;
      for (let i = 0; i < 3 && box && !/border/.test(box.className); i++) box = box.parentElement;
      const optText = (box ? box.innerText : '').replace(/^[A-D]\s*/, '').trim();
      const cls = box ? box.className : '';
      opts.push({ letter: el.textContent.trim(), text: optText, chosen: /(border|bg)-red-/.test(cls), correct: /(border|bg)-green-/.test(cls) });
    }
    if (!opts.length) return null;
    const expl = (text.split(/Explanation:/i)[1] || '').trim();
    const head = text.split(/\n\s*A\s*\n/)[0];
    const question = head.replace(/^[\s\S]*?(INCORRECT|CORRECT|Skipped|SKIPPED|Unanswered)\s*/i, '').trim();
    const chosenIdx = opts.findIndex((o) => o.chosen);
    const correctIdx = opts.findIndex((o) => o.correct);
    const chosen = chosenIdx >= 0 ? opts[chosenIdx] : null;
    const L = chosen ? chosen.letter : null;
    // Sentences of the explanation that talk about the option you picked.
    const sentences = expl.split(/(?<=[.!?])\s+/);
    const about = L ? sentences.filter((x) => x.includes(`(${L})`) || new RegExp(`(^|\\s)${L}[.:)]\\s`).test(x) || new RegExp(`(Choice|Option|Statement|Answer)\\s*\\(?${L}\\)?`, 'i').test(x) || (chosen.text.length > 6 && x.includes(chosen.text.slice(0, 25)))).join(' ') : '';
    const scope = about || expl;
    const qText = question || ((expl.match(/question (?:asks|is)[,:]?\s*["“]([^"”]+)["”]/i) || [])[1] || '');
    const optWords = opts.map((o) => o.text.trim());
    const single = optWords.every((o) => o && o.split(/\s+/).length <= 3);
    const stem = (w) => w.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5);
    const stems = optWords.map((o) => stem(o.split(/\s+/).pop()));
    const sameRoot = single && stems.filter((x) => x && x === stems[0]).length >= 3;
    const funcWords = single && optWords.filter((o) => FUNC.has(o.toLowerCase())).length >= 3;
    const verbForms = single && optWords.filter((o) => /^(to |is |are |was |were |be |been |being |has |have |had |will )/i.test(o) || /(ing|ed)$/i.test(o)).length >= 2;
    const qWords = new Set(content(qText));
    return {
      q: qNum,
      status: status.toUpperCase(),
      nOpt: opts.length,
      chosenIdx, correctIdx,
      reviewed: true,
      sameRoot, funcWords, verbForms,
      sentenceOpts: optWords.reduce((n, o) => n + o.length, 0) / opts.length > 35,
      qWh: /^\s*(what|when|where|who|whom|whose|why|which|how)\b/i.test(qText),
      qInfer: /\b(imply|implied|infer|inferred|most likely|suggest(ed)?|probably|mean when|says?,|why does the (man|woman|speaker)|intend)/i.test(qText),
      qVocab: /closest in meaning/i.test(qText),
      qNot: /\bNOT\b/.test(qText),
      qGraphic: /look at the graphic/i.test(qText),
      qInsert: /\[\s*1\s*\]|best belong/i.test(qText),
      chosenYesNo: chosen ? /^(yes|no)\b/i.test(chosen.text) : false,
      chosenRepeat: chosen ? content(chosen.text).some((w) => qWords.has(w)) : false,
      expYesNo: /yes\/no|yes-no|yes or no/i.test(scope),
      expSound: /sound(s)? (like|similar)|similar[- ]sounding|sound-alike|homophone|confus\w+ .* sound/i.test(scope),
      expRepeat: /repeat|same word|reuses?|echo/i.test(scope),
      expMismatch: /answers? a (different )?question about|instead of|not (about|related)|irrelevant|unrelated|does not (answer|address)/i.test(scope),
      expParaphrase: /paraphras|rephras|restat|another way of saying|synonym|in other words/i.test(expl),
      expNotMentioned: /not mentioned|not stated|no mention|does not say|never mentioned/i.test(scope),
      expInfer: /infer|impl(y|ies|ied)|suggests that/i.test(scope),
      expTense: /\btense\b|subject[- ]verb|agreement|plural|singular/i.test(scope),
    };
  }

  function parseReview() {
    const m = location.pathname.match(/^\/exams\/toeic\/session\/([^/]+)\/result/);
    if (!m) return null;
    const main = document.querySelector('main');
    if (!main) return null;
    const labels = [...main.querySelectorAll('*')].filter((e) => e.children.length === 0 && /^Q\.\d+$/.test(e.textContent.trim()));
    const out = [];
    for (const lab of labels) {
      let block = lab.parentElement;
      for (let i = 0; i < 6 && block && !/Explanation:/i.test(block.innerText); i++) block = block.parentElement;
      if (!block) continue;
      const f = reviewFeatures(block, Number(lab.textContent.trim().slice(2)));
      if (f) out.push(f);
    }
    return out.length ? { session: m[1], items: out } : null;
  }

  // ---- Listening self-diagnosis, injected under wrong Part 1–4 questions on the result page ----
  // Step 1: replay the audio without reading the explanation (it is blurred).
  // Step 2: read the sentence that contains the answer (quoted from Parroto's explanation, shown live, not stored).
  // Step 3: if you did hear it, say why you still picked wrong. The result is an error code.
  const diagState = {}; // q -> { step, heard, understood }
  const DIAG_CSS = 'margin:8px 0;padding:10px 12px;border:1px dashed #6d9bff;border-radius:8px;background:rgba(37,99,235,.08);font:13px/1.45 -apple-system,Segoe UI,sans-serif;color:inherit';
  const BTN = 'margin:4px 6px 0 0;padding:4px 10px;border-radius:6px;border:1px solid #6d9bff;background:transparent;color:inherit;cursor:pointer;font:inherit';

  function partOf(q) {
    return q <= 6 ? 'P1' : q <= 31 ? 'P2' : q <= 70 ? 'P3' : q <= 100 ? 'P4' : 'R';
  }

  function quotesFrom(text) {
    const out = [];
    for (const m of text.matchAll(/["“]([^"”]{12,220})["”]/g)) out.push(m[1].trim());
    return [...new Set(out)].slice(0, 3);
  }

  function audioFor(block) {
    const own = block.querySelector('audio');
    if (own) return own;
    let found = null;
    for (const a of document.querySelectorAll('main audio')) {
      if (a.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING) found = a;
    }
    return found;
  }

  function explanationNode(block) {
    // Smallest element that starts with "Explanation:" and also holds the explanation text.
    return [...block.querySelectorAll('*')].find((e) => /^\s*Explanation:/i.test(e.textContent) && e.textContent.trim().length > 25 && ![...e.children].some((c) => /^\s*Explanation:/i.test(c.textContent) && c.textContent.trim().length > 25));
  }

  function finishDiag(session, q, code, reason) {
    diagState[q] = { ...(diagState[q] || {}), step: 'done', code, reason };
    send({ type: 'diagnosis', session, q, code, reason });
  }

  function renderDiag(box, session, q, block) {
    const st = diagState[q] || { step: 1 };
    const part = partOf(q);
    const expl = explanationNode(block);
    const text = block.innerText;
    const correctOpt = (() => {
      const g = [...block.querySelectorAll('[class*="border-green"]')][0];
      return g ? g.innerText.replace(/^[A-D]\s*/, '').trim() : '';
    })();
    const keyLines = part === 'P1' ? [correctOpt].filter(Boolean) : quotesFrom((text.split(/Explanation:/i)[1] || ''));
    if (expl) expl.style.filter = st.step === 'done' || st.step >= 3 || st.revealed ? '' : 'blur(5px)';
    let html = `<b>Chẩn đoán nghe – câu ${q}</b> <span style="opacity:.7">(TOEIC Coach)</span><br>`;
    const tBtn = `<button data-tcd="transcript" style="${BTN}">📝 Lời thoại đầy đủ (Whisper)</button>`;
    if (st.step === 'done') {
      html += `→ Mã <b>${st.code}</b>: ${st.reason}. <button data-tcd="redo" style="${BTN}">Làm lại</button>${tBtn}`;
    } else if (st.step === 1) {
      html += `1) Nghe lại đoạn này, <b>chưa đọc giải thích</b> (đang làm mờ). <button data-tcd="play" style="${BTN}">▶ Nghe lại</button><br>
        Lần này bạn có nghe ra câu chứa đáp án không?<br>
        <button data-tcd="heard" style="${BTN}">Nghe ra</button><button data-tcd="notheard" style="${BTN}">Vẫn không nghe ra</button>`;
    } else if (st.step === 2) {
      html += `2) Câu chứa đáp án${part === 'P1' ? ' (câu mô tả đúng)' : ' (trích từ lời giải thích)'}:<br>${keyLines.length ? keyLines.map((l) => `<i>“${l.replace(/</g, '&lt;')}”</i>`).join('<br>') : '<i>(không tìm thấy câu trích — xem lời giải thích bên dưới)</i>'}<br>
        <button data-tcd="play" style="${BTN}">▶ Nghe lại khi nhìn câu</button><br>Đọc câu này bạn có hiểu không?<br>
        <button data-tcd="understood" style="${BTN}">Hiểu – chỉ là nghe không ra</button><button data-tcd="notunderstood" style="${BTN}">Không hiểu từ / cấu trúc</button><br>${tBtn}`;
    } else if (st.step === 3) {
      html += `3) Bạn nghe ra mà vẫn chọn sai vì:<br>
        <button data-tcd="c-D" style="${BTN}">Chọn vì nghe thấy từ giống / lặp lại</button>
        <button data-tcd="c-P" style="${BTN}">Đáp án đúng nói bằng từ khác</button>
        <button data-tcd="c-Q" style="${BTN}">Hiểu sai câu hỏi</button>
        <button data-tcd="c-I" style="${BTN}">Suy luận sai</button>
        <button data-tcd="c-C" style="${BTN}">Lỡ nhịp / mất tập trung</button>`;
    }
    box.innerHTML = html;
    box.onclick = (e) => {
      const b = e.target.closest('button[data-tcd]');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      const a = b.dataset.tcd;
      if (a === 'play') { const au = audioFor(block); if (au) { au.currentTime = 0; au.play(); } return; }
      if (a === 'transcript') {
        const au = audioFor(block);
        const url = au && (au.querySelector('source')?.src || au.currentSrc || au.src);
        if (url) send({ type: 'openTranscript', src: url, q });
        return;
      }
      if (a === 'redo') { diagState[q] = { step: 1 }; return renderDiag(box, session, q, block); }
      if (a === 'notheard') { diagState[q] = { step: 2 }; return renderDiag(box, session, q, block); }
      if (a === 'heard') { diagState[q] = { step: 3 }; return renderDiag(box, session, q, block); }
      if (a === 'understood') return finishDiag(session, q, 'A', 'đọc thì hiểu nhưng nghe không ra → nghe sót âm'), renderDiag(box, session, q, block);
      if (a === 'notunderstood') return finishDiag(session, q, 'V', 'đọc cũng không hiểu → thiếu từ vựng / cấu trúc'), renderDiag(box, session, q, block);
      const why = { 'c-D': 'nghe ra nhưng chọn theo từ giống / lặp lại → dính bẫy', 'c-P': 'nghe ra nhưng không nhận ra đáp án nói bằng từ khác', 'c-Q': 'nghe ra nhưng hiểu sai câu hỏi', 'c-I': 'nghe ra nhưng suy luận sai', 'c-C': 'nghe ra nhưng lỡ nhịp / mất tập trung' };
      if (why[a]) { finishDiag(session, q, a.slice(2), why[a]); renderDiag(box, session, q, block); }
    };
  }

  function injectDiagnosis() {
    const m = location.pathname.match(/^\/exams\/toeic\/session\/([^/]+)\/result/);
    if (!m) return;
    const main = document.querySelector('main');
    if (!main) return;
    const labels = [...main.querySelectorAll('*')].filter((e) => e.children.length === 0 && /^Q\.\d+$/.test(e.textContent.trim()));
    for (const lab of labels) {
      const q = Number(lab.textContent.trim().slice(2));
      if (partOf(q) === 'R') continue;
      let block = lab.parentElement;
      for (let i = 0; i < 6 && block && !/Explanation:/i.test(block.innerText); i++) block = block.parentElement;
      if (!block) continue;
      if (!/\n\s*(INCORRECT|Skipped|SKIPPED|Unanswered)\s*\n/.test(block.innerText)) continue;
      if (block.querySelector(':scope > .tc-diag, .tc-diag')) continue;
      const box = document.createElement('div');
      box.className = 'tc-diag';
      box.style.cssText = DIAG_CSS;
      const expl = explanationNode(block);
      if (expl && expl.parentElement) expl.parentElement.insertBefore(box, expl);
      else block.appendChild(box);
      renderDiag(box, m[1], q, block);
    }
  }

  // ---- On-page tools on the result page: redo wrong questions with Parroto's own items, one-tap error codes ----
  let autocode = null;
  import(chrome.runtime.getURL('lib/autocode.js')).then((m) => { autocode = m; }).catch(() => {});
  let tcStore = { errors: [], autoResults: [], review: {} };
  function loadStore() {
    try {
      chrome.storage.local.get(['errors', 'autoResults', 'review'], (r) => {
        tcStore = { errors: r.errors || [], autoResults: r.autoResults || [], review: r.review || {} };
      });
    } catch { /* extension reloaded */ }
  }
  loadStore();
  try { chrome.storage.onChanged.addListener((ch, area) => { if (area === 'local' && (ch.errors || ch.autoResults || ch.review)) loadStore(); }); } catch { /* ignore */ }

  const CODE_NAMES = { V: 'Từ vựng', G: 'Ngữ pháp', A: 'Nghe sót âm', D: 'Dính bẫy', P: 'Paraphrase', I: 'Suy luận', T: 'Hết giờ', C: 'Bất cẩn', Q: 'Hiểu sai câu hỏi' };
  const redo = { on: false, answered: {} }; // answered: q -> { pick, ok }
  const todayStr = () => new Date().toLocaleDateString('sv-SE');

  function ensureStyle() {
    if (document.getElementById('tc-style')) return;
    const st = document.createElement('style');
    st.id = 'tc-style';
    st.textContent = `
      .tc-redo-q [class*="border-red-"], .tc-redo-q [class*="border-green-"] { border-color: rgba(128,128,128,.35) !important; color: inherit !important; }
      .tc-redo-q [class*="bg-red-"], .tc-redo-q [class*="bg-green-"] { background: transparent !important; color: inherit !important; }
      .tc-redo-q .lucide-circle-x, .tc-redo-q .lucide-circle-check, .tc-redo-q .lucide-check, .tc-redo-q .lucide-x { visibility: hidden; }
      .tc-redo-q .tc-expl { filter: blur(6px); }
      .tc-redo-q .tc-status { visibility: hidden; }
      .tc-bar { position: sticky; top: 0; z-index: 30; margin: 8px 0; padding: 8px 12px; border-radius: 8px; border: 1px solid #6d9bff; background: rgba(20,30,60,.92); color: #e8efff; font: 13px/1.4 -apple-system, Segoe UI, sans-serif; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
      .tc-bar button, .tc-tools button { padding: 4px 10px; border-radius: 6px; border: 1px solid #6d9bff; background: transparent; color: inherit; cursor: pointer; font: inherit; }
      .tc-bar button.on { background: #2563eb; color: #fff; }
      .tc-tools { margin: 8px 0; padding: 8px 10px; border-radius: 8px; border: 1px dashed rgba(109,155,255,.6); font: 13px/1.45 -apple-system, Segoe UI, sans-serif; }
      .tc-tools .codes button { min-width: 30px; margin: 3px 3px 0 0; font-weight: 700; }
      .tc-tools .codes button.sug { border-color: #16a34a; color: #4ade80; }
      .tc-tools .codes button.cur { background: #16a34a; color: #fff; border-color: #16a34a; }
      .tc-tools .ans button { min-width: 40px; margin: 4px 4px 0 0; font-weight: 700; }
      .tc-tools .ok { color: #4ade80; } .tc-tools .bad { color: #f87171; }
    `;
    document.head.appendChild(st);
  }

  function visibleBlocks() {
    const main = document.querySelector('main');
    if (!main) return [];
    const labels = [...main.querySelectorAll('*')].filter((e) => e.children.length === 0 && /^Q\.\d+$/.test(e.textContent.trim()) && e.offsetParent !== null);
    const out = [];
    for (const lab of labels) {
      let block = lab.parentElement;
      for (let i = 0; i < 6 && block && !/Explanation:/i.test(block.innerText); i++) block = block.parentElement;
      if (!block) continue;
      const q = Number(lab.textContent.trim().slice(2));
      const wrong = /\n\s*(INCORRECT|Skipped|SKIPPED|Unanswered)\s*\n/i.test(block.innerText);
      out.push({ q, block, wrong });
    }
    return out;
  }

  function optionInfo(block) {
    const letters = [...block.querySelectorAll('*')].filter((e) => e.children.length === 0 && /^[A-D]$/.test(e.textContent.trim()) && !e.closest('.tc-tools,.tc-diag'));
    return letters.map((el) => {
      let box = el.parentElement;
      for (let i = 0; i < 3 && box && !/border/.test(box.className); i++) box = box.parentElement;
      const cls = box ? box.className : '';
      return { letter: el.textContent.trim(), correct: /(border|bg)-green-/.test(cls), chosen: /(border|bg)-red-/.test(cls) };
    });
  }

  function errorFor(session, q) {
    return tcStore.errors.find((e) => e.srcKey === `${session}|${q}`);
  }

  function partOfQ(q) {
    return q <= 6 ? 'P1' : q <= 31 ? 'P2' : q <= 70 ? 'P3' : q <= 100 ? 'P4' : q <= 130 ? 'P5' : q <= 146 ? 'P6' : 'P7';
  }

  function markParts(block) {
    const expl = explanationNode(block);
    if (expl) expl.classList.add('tc-expl');
    const status = [...block.querySelectorAll('*')].find((e) => e.children.length === 0 && /^(INCORRECT|Incorrect|Skipped|SKIPPED|Unanswered)$/.test(e.textContent.trim()));
    if (status) status.classList.add('tc-status');
    return expl;
  }

  function renderTools(box, session, q, block) {
    const opts = optionInfo(block);
    const correctIdx = opts.findIndex((o) => o.correct);
    const chosenIdx = opts.findIndex((o) => o.chosen);
    const part = partOfQ(q);
    const err = errorFor(session, q);
    const f = tcStore.review?.[session]?.[q] || (typeof reviewFeatures === 'function' ? reviewFeatures(block, q) : null);
    const sug = autocode ? autocode.suggest(part, chosenIdx < 0, f) : null;
    let html = '';
    if (redo.on) {
      const a = redo.answered[q];
      html += `<div><b>Làm lại câu ${q}</b> – chọn đáp án:</div><div class="ans">${opts.map((o, i) => `<button data-tct="ans" data-i="${i}" ${a ? 'disabled' : ''}>${o.letter}</button>`).join('')}</div>`;
      if (a) html += `<div class="${a.ok ? 'ok' : 'bad'}" style="margin-top:4px">${a.ok ? '✓ Đúng' : `✗ Chưa đúng – đáp án ${opts[correctIdx]?.letter || '?'}`}. ${err ? 'Đã ghi vào lịch làm lại.' : 'Gắn mã lỗi bên dưới để đưa câu này vào lịch làm lại.'}</div>`;
    }
    if (!redo.on || redo.answered[q]) {
      html += `<div style="margin-top:${redo.on ? 8 : 0}px"><b>Mã lỗi</b>${err ? ` · đang là <b>${err.code}</b>` : ''}${sug ? ` · gợi ý <b>${sug.code}</b>: ${sug.reason.replace(/</g, '&lt;')}` : ''}</div>
        <div class="codes">${Object.keys(CODE_NAMES).map((c) => `<button data-tct="code" data-c="${c}" title="${CODE_NAMES[c]}" class="${err && err.code === c ? 'cur' : ''} ${sug && sug.code === c ? 'sug' : ''}">${c}</button>`).join('')}</div>`;
    }
    box.innerHTML = html;
    box.onclick = (e) => {
      const b = e.target.closest('button[data-tct]');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      if (b.dataset.tct === 'ans') {
        const i = Number(b.dataset.i);
        const ok = i === correctIdx;
        redo.answered[q] = { pick: i, ok };
        block.classList.remove('tc-redo-q');
        send({ type: 'redoResult', session, q, ok });
        renderTools(box, session, q, block);
      } else if (b.dataset.tct === 'code') {
        const code = b.dataset.c;
        send({ type: 'codeError', session, q, part, code, skipped: chosenIdx < 0, suggested: sug ? sug.code : null, suggestReason: sug ? sug.reason : null });
        // Optimistic update so the button state changes at once.
        const idx = tcStore.errors.findIndex((x) => x.srcKey === `${session}|${q}`);
        if (idx >= 0) tcStore.errors[idx] = { ...tcStore.errors[idx], code };
        else tcStore.errors.push({ srcKey: `${session}|${q}`, code });
        renderTools(box, session, q, block);
      }
    };
  }

  function injectTools() {
    const m = location.pathname.match(/^\/exams\/toeic\/session\/([^/]+)\/result/);
    if (!m) return;
    ensureStyle();
    const session = m[1];
    const blocks = visibleBlocks();
    const wrong = blocks.filter((b) => b.wrong);
    // Toolbar above the Part tabs.
    const tablist = document.querySelector('main [role=tablist]');
    if (tablist) {
      let bar = document.querySelector('.tc-bar');
      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'tc-bar';
        tablist.parentElement.insertBefore(bar, tablist);
        bar.addEventListener('click', (e) => {
          const b = e.target.closest('button[data-tcb]');
          if (!b) return;
          e.preventDefault();
          if (b.dataset.tcb === 'redo') { redo.on = !redo.on; redo.answered = {}; document.querySelectorAll('.tc-tools').forEach((x) => x.remove()); }
          injectTools();
        });
      }
      const coded = wrong.filter((b) => errorFor(session, b.q)).length;
      const due = tcStore.errors.filter((e) => e.srcKey && e.srcKey.startsWith(session + '|') && e.redo && !e.redo.done && e.redo.due <= todayStr()).length;
      bar.innerHTML = `<b>TOEIC Coach</b><button data-tcb="redo" class="${redo.on ? 'on' : ''}">${redo.on ? 'Thoát làm lại' : `Làm lại câu sai của Part này (${wrong.length})`}</button>
        <span>Đã gắn mã ${coded}/${wrong.length} câu sai ở Part này${due ? ` · <b>${due}</b> câu của đề này đến hạn làm lại hôm nay` : ''}</span>`;
    }
    for (const { q, block } of wrong) {
      markParts(block);
      if (redo.on && !redo.answered[q]) block.classList.add('tc-redo-q'); else block.classList.remove('tc-redo-q');
      let box = block.querySelector('.tc-tools');
      if (!box) {
        box = document.createElement('div');
        box.className = 'tc-tools';
        const expl = explanationNode(block);
        const diag = block.querySelector('.tc-diag');
        const anchorEl = diag || expl;
        if (anchorEl && anchorEl.parentElement) anchorEl.parentElement.insertBefore(box, anchorEl); else block.appendChild(box);
        renderTools(box, session, q, block);
      } else if (!box.dataset.rendered || box.dataset.redo !== String(redo.on)) {
        renderTools(box, session, q, block);
      }
      box.dataset.rendered = '1';
      box.dataset.redo = String(redo.on);
    }
  }

  // ---- Exam history: /exams/toeic/history ----
  function parseHistory() {
    if (!location.pathname.startsWith('/exams/toeic/history')) return null;
    const links = [...document.querySelectorAll('main a[href*="/exams/toeic/session/"]')];
    const items = [];
    for (const a of links) {
      const sm = a.getAttribute('href').match(/session\/([^/]+)\/result/);
      if (!sm) continue;
      const card = a.parentElement && a.parentElement.parentElement;
      if (!card) continue;
      const lines = card.innerText.split('\n').map((s) => s.trim()).filter(Boolean);
      items.push({
        session: sm[1],
        testName: lines[0] || '',
        label: lines[1] || '',
        score: lines.find((l) => /\d+\s*\/\s*\d+/.test(l)) || '',
        dateText: lines.find((l) => /\d{1,2}\/\d{1,2}\/\d{4}/.test(l)) || '',
      });
    }
    return items;
  }

  // ---- Exam analytics: /exams/toeic/analytics ----
  function parseAnalytics() {
    if (!location.pathname.startsWith('/exams/toeic/analytics')) return null;
    const main = document.querySelector('main');
    if (!main) return null;
    const text = main.innerText;
    const num = (label) => {
      const r = text.match(new RegExp('(\\d+)\\s*\\n+\\s*' + label, 'i'));
      return r ? Number(r[1]) : null;
    };
    const weak = [];
    const w = text.search(/WEAK AREAS/i);
    if (w >= 0) {
      for (const m of text.slice(w).matchAll(/\d+\.\s*\n\s*([^\n]+)\n\s*(\d+)\s+wrong/gi)) weak.push({ tag: m[1].trim(), wrong: Number(m[2]) });
    }
    const examsTaken = num('Exams taken');
    if (examsTaken == null && !weak.length) return null;
    return { examsTaken, best: num('Best score'), average: num('Average'), latest: num('Latest'), weak };
  }

  // ---- Vocabulary statistics: parroto.app/vocabulary (account-wide, includes phone study) ----
  function parseVocabStats() {
    if (location.pathname.replace(/\/$/, '') !== '/vocabulary') return null;
    const main = document.querySelector('main');
    if (!main) return null;
    const text = main.innerText;
    const i = text.search(/Learning Statistics/i);
    if (i < 0) return null;
    const block = text.slice(i, i + 1200);
    const after = (label) => {
      const m = block.match(new RegExp(label + '\\s*\\n+\\s*(\\d[\\d,]*)', 'i'));
      return m ? Number(m[1].replace(/,/g, '')) : null;
    };
    const before = (label) => {
      const m = block.match(new RegExp('(\\d[\\d,]*)\\s*\\n+\\s*' + label, 'i'));
      return m ? Number(m[1].replace(/,/g, '')) : null;
    };
    const totalCards = after('Total Cards');
    const totalReviews = after('Total Reviews');
    if (totalCards == null || totalReviews == null) return null;
    const acc = block.match(/Accuracy\s*\n+\s*(\d+)%/i);
    return {
      totalCards, due: after('Due'), totalReviews, accuracy: acc ? Number(acc[1]) : null,
      learning: before('Learning'), reviewing: before('Reviewing'), mastered: before('Mastered'),
    };
  }

  // ---- Flashcard ratings: Again / Hard / Good / Easy / Master buttons ----
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('button');
    if (!b) return;
    const first = (b.querySelector('span') || b).textContent.trim();
    const m = first.match(/^(Again|Hard|Good|Easy|Master)$/);
    if (!m) return;
    // Only count rating buttons (they show an interval such as "10 min" / "1-4 day"), or Master.
    if (m[1] !== 'Master' && !/\d\s*(min|day|hour|month|year)/i.test(b.textContent)) return;
    send({ type: 'vocabRate', rating: m[1], path: location.pathname });
  }, true);

  const reviewSent = new Set();
  let lastResultSent = '';
  let lastHistorySent = '';
  let lastAnalyticsSent = '';
  let lastVocabSent = '';

  function scan() {
    const path = location.pathname;
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      pageSince = Date.now();
    }
    const result = parseResult();
    if (result) {
      const k = JSON.stringify(result);
      if (k !== lastResultSent) {
        lastResultSent = k;
        send({ type: 'examResult', raw: result });
        send({ type: 'scrapeOk', page: 'Kết quả đề' });
      }
    } else if (/^\/exams\/toeic\/session\/[^/]+\/result/.test(path) && Date.now() - pageSince > 12000) {
      send({ type: 'scrapeWarn', page: 'Kết quả đề', msg: 'không đọc được điểm hoặc kết quả từng Part' });
      pageSince = Date.now() + 600000;
    }
    injectDiagnosis();
    injectTools();
    const rv = parseReview();
    if (rv) {
      const fresh = rv.items.filter((f) => !reviewSent.has(rv.session + '|' + f.q + '|' + f.chosenIdx));
      if (fresh.length) {
        fresh.forEach((f) => reviewSent.add(rv.session + '|' + f.q + '|' + f.chosenIdx));
        send({ type: 'review', session: rv.session, items: fresh });
      }
    }
    const hist = parseHistory();
    if (hist && hist.length) {
      const k = JSON.stringify(hist);
      if (k !== lastHistorySent) { lastHistorySent = k; send({ type: 'history', items: hist }); }
    }
    const vs = parseVocabStats();
    if (vs) {
      const k = JSON.stringify(vs);
      if (k !== lastVocabSent) { lastVocabSent = k; send({ type: 'vocabStats', data: vs }); send({ type: 'scrapeOk', page: 'Vocabulary' }); }
    } else if (location.pathname.replace(/\/$/, '') === '/vocabulary' && Date.now() - pageSince > 12000) {
      send({ type: 'scrapeWarn', page: 'Vocabulary', msg: 'không đọc được bảng Learning Statistics' });
      pageSince = Date.now() + 600000;
    }
    const an = parseAnalytics();
    if (an) {
      const k = JSON.stringify(an);
      if (k !== lastAnalyticsSent) { lastAnalyticsSent = k; send({ type: 'analytics', data: an }); }
    }
    if (path.startsWith('/topics/toeic-listening')) {
      const items = parseTopic();
      if (items.length) {
        const hash = JSON.stringify(items.map((i) => [i.title, i.dictation, i.shadowing]));
        if (hash !== lastLessonsHash) {
          lastLessonsHash = hash;
          send({ type: 'lessons', items });
        }
        send({ type: 'scrapeOk', page: 'TOEIC Listening' });
      } else if (Date.now() - pageSince > 10000) {
        send({ type: 'scrapeWarn', page: 'TOEIC Listening', msg: 'không tìm thấy thẻ bài học nào sau 10 giây' });
        pageSince = Date.now() + 600000; // warn at most every 10 minutes
      }
    }
    const lesson = parseLesson();
    if (lesson) {
      const k = `${lesson.mode}|${lesson.slug}|${lesson.score}`;
      if (k !== lastLessonSent) {
        lastLessonSent = k;
        send({ type: 'lesson', ...lesson });
      }
    }
  }

  // Self-check: open any parroto.app page with #tc-debug at the end of the address
  // to see a short summary of what the extension has stored (counts only, no study content).
  async function debugPanel() {
    if (location.hash !== '#tc-debug') return;
    let box = document.getElementById('tc-debug');
    if (!box) {
      box = document.createElement('pre');
      box.id = 'tc-debug';
      box.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:2147483647;max-width:440px;max-height:70vh;overflow:auto;background:#111;color:#9f9;font:12px/1.4 ui-monospace,monospace;padding:10px;border-radius:8px;white-space:pre-wrap';
      document.body.appendChild(box);
    }
    try {
      const all = await chrome.storage.local.get(null);
      const today = new Date().toLocaleDateString('sv-SE');
      const lessons = Object.values(all.lessons || {});
      const summary = {
        version: chrome.runtime.getManifest().version,
        examDate: all.settings?.examDate || '(chưa nhập)',
        autoResults: (all.autoResults || []).map((r) => `${r.date} ${r.set} T${r.test} ${r.kind} ${r.kind === 'full' ? r.L + r.R : r.kind === 'part' ? r.part + ' ' + r.correct + '/' + r.total : ''} sai:${(r.wrongQs || []).length} trống:${(r.skippedQs || []).length}`),
        manualResults: (all.results || []).length,
        errors: (all.errors || []).length,
        history: (all.parroto?.history || []).map((h) => `${h.testName} ${h.label} ${h.score}`),
        analytics: all.parroto?.analytics ? `${all.parroto.analytics.examsTaken} lần, yếu: ${(all.parroto.analytics.weak || []).map((w) => w.tag + '(' + w.wrong + ')').join(', ')}` : '(chưa có)',
        lessons: `${lessons.length} bài, đã dictation ${lessons.filter((l) => l.dictation != null).length}`,
        timeToday: all.time?.[today] || {},
        drillToday: (() => {
          const log = (all.drill?.log || []).filter((e) => e.date === today);
          const c = (k) => log.filter((e) => e.kind === k);
          const ok = (arr) => arr.filter((e) => e.correct).length;
          return `P5 ${ok(c('p5'))}/${c('p5').length} đúng · P2 ${ok(c('p2'))}/${c('p2').length} đúng · gọi tên bẫy ${ok(c('p2trap'))}/${c('p2trap').length} · mô phỏng ${c('sim').map((e) => e.correct + '/' + e.total).join(', ') || 0} · P6/P7 ${ok([...c('p6'), ...c('p7')])}/${c('p6').length + c('p7').length} · đọc nhanh P3/4 ${ok(c('p34'))}/${c('p34').length} · paraphrase ${ok(c('para'))}/${c('para').length} · viết câu đạt ${ok(c('write'))}/${c('write').length} · trái nghĩa ${ok(c('anto'))}/${c('anto').length} · từ đã nhớ (mindmap) ${Object.values(all.drill?.wordStatus || {}).filter((v) => v === 'known').length} · sprint ${log.filter((e) => e.src === 'sprint').length} · ôn lỗi hôm nay ${log.filter((e) => e.src === 'today').length} · mức tốc độ P5 ${[20, 15, 12][all.drill?.p5Level || 0]}s · câu đã ẩn ${(all.drill?.hidden || []).length}`;
        })(),
        drillSaves: (() => {
          const log = all.drill?.log || [];
          const anto = log.filter((e) => e.kind === 'anto');
          return `tổng ${log.length} lần lưu · trái nghĩa (mọi ngày) ${anto.length} · 3 lần gần nhất: ${log.slice(-3).map((e) => e.kind + ' ' + e.date).join(', ')}`;
        })(),
        vocabToday: (() => {
          const v = all.vocab || {};
          const snap = v.snaps?.[today]?.last;
          const r = v.rates?.[today] || {};
          return `bấm chấm thẻ hôm nay ${r.total || 0} · ảnh chụp Vocabulary: ${snap ? `Total Cards ${snap.totalCards}, Due ${snap.due}, Total Reviews ${snap.totalReviews} lúc ${snap.at}` : 'chưa có'}`;
        })(),
        reviewRead: Object.entries(all.review || {}).map(([sid, qs]) => `${sid.slice(-6)}: ${Object.keys(qs).length} câu`).join(' · ') || 'chưa có',
        warnings: all.meta?.scraperWarnings || {},
      };
      box.textContent = 'TOEIC Coach self-check\n' + JSON.stringify(summary, null, 2);
    } catch (e) {
      box.textContent = 'TOEIC Coach self-check lỗi: ' + e.message;
    }
  }

  setInterval(scan, 2000);
  setInterval(debugPanel, 3000);
  scan();
  debugPanel();
})();
