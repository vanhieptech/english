// Storage wrapper. Uses chrome.storage.local inside the extension and
// falls back to localStorage so the panel can be previewed as a plain page.
//
// Keys and who writes them (one writer per key avoids lost updates):
//   settings, results, errors, daily, assign, ignore, drill  -> panel
//   time, lessons, meta, autoResults, parroto, vocab, review, pace -> service worker
// errors: panel, plus one-tap codes / redo results sent from Parroto's result page (service worker, serialised).
// getAll() merges autoResults (read from Parroto result pages) into results.

const hasChrome = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

export const DEFAULTS = {
  settings: {
    examDate: '',
    studyStart: '13:30',
    eveningStart: '21:00',
    newWordsPerDay: 25,
    dictationPerDay: 2,
    remindersOn: true,
  },
  results: [],
  errors: [],
  daily: {},
  assign: {},
  time: {},
  lessons: {},
  meta: { lastBackup: '', scraperWarnings: {} },
  autoResults: [],
  parroto: { history: [], analytics: null },
  ignore: { sessions: [], errorKeys: [] },
  drill: { items: {}, log: [] },
  vocab: { snaps: {}, rates: {} },
  review: {},
  pace: {}, // session -> { date, start, scale, qSecs, groups } from the Reading pacing overlay
};

export const KEYS = Object.keys(DEFAULTS);

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

export async function get(key) {
  if (hasChrome) {
    const r = await chrome.storage.local.get(key);
    return r[key] === undefined ? clone(DEFAULTS[key]) : r[key];
  }
  const raw = localStorage.getItem('tc:' + key);
  return raw == null ? clone(DEFAULTS[key]) : JSON.parse(raw);
}

export async function set(key, value) {
  if (hasChrome) {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (e) {
      // Usually "Extension context invalidated": this page was open while the extension was reloaded.
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tc-save-error', { detail: { key, message: String(e && e.message || e) } }));
      throw e;
    }
  } else {
    localStorage.setItem('tc:' + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('tc-change', { detail: { key } }));
  }
}

// Read-modify-write for a single key.
export async function update(key, fn) {
  const cur = await get(key);
  const next = (await fn(cur)) ?? cur;
  await set(key, next);
  return next;
}

// Raw keys as stored (used for backups).
export async function getRaw() {
  const out = {};
  for (const k of KEYS) out[k] = await get(k);
  return out;
}

export function merge(raw) {
  const out = { ...raw };
  // Merge defaults so new fields appear for old installs.
  out.settings = { ...DEFAULTS.settings, ...raw.settings };
  out.meta = { ...DEFAULTS.meta, ...raw.meta };
  out.ignore = { ...DEFAULTS.ignore, ...raw.ignore };
  out.parroto = { ...DEFAULTS.parroto, ...raw.parroto };
  out.drill = { ...DEFAULTS.drill, ...raw.drill };
  const ignored = new Set(out.ignore.sessions || []);
  out.manualResults = raw.results || [];
  out.results = [...out.manualResults, ...(raw.autoResults || []).filter((r) => !ignored.has(r.session))];
  return out;
}

export async function getAll() {
  return merge(await getRaw());
}

export async function replaceAll(data) {
  for (const k of KEYS) {
    if (data[k] !== undefined) await set(k, data[k]);
  }
}

export function onChange(cb) {
  if (hasChrome) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') cb(Object.keys(changes));
    });
  } else {
    window.addEventListener('tc-change', (e) => cb([e.detail.key]));
  }
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
