// Service worker: receives data from the content script, keeps reminders and weekly backups.

import * as store from './lib/store.js';
import { today } from './lib/dates.js';
import { buildDay } from './lib/plan.js';
import { dueErrors, applyRedo, scheduleNew } from './lib/rules.js';
import { LINKS, slugify, parseUSDate } from './lib/constants.js';
import { toResult } from './lib/autoresult.js';
import { addSaved } from './lib/vocab.js';

// Serialize writes so concurrent messages do not overwrite each other.
let queue = Promise.resolve();
function serial(fn) {
  queue = queue.then(fn).catch((e) => console.error('[TOEIC Coach]', e));
  return queue;
}

chrome.runtime.onInstalled.addListener(() => setup());
chrome.runtime.onStartup.addListener(() => setup());

async function setup() {
  if (chrome.sidePanel?.setPanelBehavior) await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  await schedule();
}

function nextAt(hhmm, offsetMin = 0) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m + offsetMin, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d.getTime();
}

async function schedule() {
  const s = await store.get('settings');
  await chrome.alarms.clearAll();
  chrome.alarms.create('study', { when: nextAt(s.studyStart || '13:30', -5), periodInMinutes: 1440 });
  chrome.alarms.create('evening', { when: nextAt(s.eveningStart || '21:00', -5), periodInMinutes: 1440 });
  chrome.alarms.create('backup', { when: nextAt('22:30'), periodInMinutes: 1440 });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'backup') {
    const meta = await store.get('meta');
    const last = meta.lastBackup ? new Date(meta.lastBackup) : null;
    if (!last || Date.now() - last.getTime() > 6.5 * 86400000) await backup();
    return;
  }
  const db = await store.getAll();
  if (!db.settings.remindersOn || !db.settings.examDate) return;
  const r = buildDay(db, today());
  const pending = r.tasks.filter((t) => !t.done);
  if (!pending.length) return;
  const due = dueErrors(db.errors, today()).length;
  const title = alarm.name === 'study' ? `Ngày ${r.day}/30: 5 phút nữa vào học` : 'Buổi tối: từ mới + Word Rain';
  const first = pending[0];
  const msg = `${pending.length} việc chưa xong. Tiếp theo: ${first.title}.${due ? ` ${due} câu sai đến hạn làm lại.` : ''}`;
  chrome.notifications.create('remind-' + alarm.name, { type: 'basic', iconUrl: 'icons/icon128.png', title, message: msg, priority: 1 });
});

chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: LINKS.exams });
});

async function backup() {
  const data = await store.getRaw();
  const json = JSON.stringify({ app: 'toeic-coach', version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2);
  const url = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
  await chrome.downloads.download({ url, filename: `toeic-coach/backup-${today()}.json`, conflictAction: 'overwrite', saveAs: false });
  await store.update('meta', (m) => ({ ...m, lastBackup: new Date().toLocaleString('vi-VN') }));
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const d = today();
  if (msg.type === 'tick') {
    serial(() => store.update('time', (t) => {
      const day = t[d] || {};
      day[msg.cat] = (day[msg.cat] || 0) + msg.sec;
      t[d] = day;
      return t;
    }));
  } else if (msg.type === 'lessons') {
    serial(() => store.update('lessons', (all) => {
      for (const it of msg.items) {
        const key = it.title + '|' + it.level;
        const old = all[key] || { updated: {} };
        const updated = { ...(old.updated || {}) };
        // Only a change seen after the first scan counts as work done today.
        const known = !!all[key];
        if (known && it.dictation != null && it.dictation !== old.dictation) updated.dictation = d;
        if (known && it.shadowing != null && it.shadowing !== old.shadowing) updated.shadowing = d;
        all[key] = {
          ...old,
          title: it.title, level: it.level, pro: it.pro, order: it.order,
          slug: old.slugConfirmed ? old.slug : slugify(it.title),
          slugConfirmed: !!old.slugConfirmed,
          dictation: it.dictation ?? old.dictation ?? null,
          shadowing: it.shadowing ?? old.shadowing ?? null,
          updated,
        };
      }
      return all;
    }));
  } else if (msg.type === 'lesson') {
    serial(() => store.update('lessons', (all) => {
      let key = Object.keys(all).find((k) => all[k].slug === msg.slug) || Object.keys(all).find((k) => all[k].title === msg.title);
      if (!key) key = msg.title + '|';
      const old = all[key] || { title: msg.title, level: '', order: 9999, updated: {} };
      const updated = { ...(old.updated || {}) };
      if (old[msg.mode] !== msg.score) updated[msg.mode] = d;
      all[key] = { ...old, slug: msg.slug, slugConfirmed: true, [msg.mode]: msg.score, updated };
      return all;
    }));
  } else if (msg.type === 'examResult') {
    serial(async () => {
      const parroto = await store.get('parroto');
      const h = (parroto.history || []).find((x) => x.session === msg.raw.session);
      const date = (h && h.date) || d;
      await store.update('autoResults', (list) => {
        const r = toResult(msg.raw, date);
        const i = list.findIndex((x) => x.session === r.session);
        if (i >= 0) list[i] = { ...r, date: list[i].date };
        else list.push(r);
        return list;
      });
    });
  } else if (msg.type === 'history') {
    serial(() => store.update('parroto', (p) => {
      const items = msg.items.map((it) => ({ ...it, date: parseUSDate(it.dateText) }));
      return { ...p, history: items, historyAt: d };
    }));
  } else if (msg.type === 'review') {
    serial(() => store.update('review', (rv) => {
      const sess = { ...(rv[msg.session] || {}) };
      for (const f of msg.items) sess[f.q] = { ...(sess[f.q] || {}), ...f }; // keep your own diagnosis
      return { ...rv, [msg.session]: sess };
    }));
  } else if (msg.type === 'codeError') {
    // One-tap error code from Parroto's result page: create the error or change its code.
    serial(async () => {
      const results = await store.get('autoResults');
      const r = results.find((x) => x.session === msg.session);
      const key = `${msg.session}|${msg.q}`;
      await store.update('errors', (list) => {
        const i = list.findIndex((e) => e.srcKey === key);
        if (i >= 0) {
          list[i] = { ...list[i], code: msg.code };
          return list;
        }
        list.push({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), date: d,
          set: r ? r.set : 'unknown', test: r ? r.test : 0, part: msg.part, q: msg.q, code: msg.code,
          confidence: 'low', guessed: false, cause: msg.skipped ? 'bỏ trống' : '', srcKey: key, redo: scheduleNew(d),
          suggested: msg.suggested, suggestReason: msg.suggestReason, from: 'parroto-page',
        });
        return list;
      });
    });
  } else if (msg.type === 'redoResult') {
    // Redo on Parroto's own result page counts as a step of the spaced redo schedule.
    serial(() => store.update('errors', (list) => list.map((e) => (e.srcKey === `${msg.session}|${msg.q}` && e.redo && !e.redo.done ? { ...e, redo: applyRedo(e.redo, d, !!msg.ok) } : e))));
  } else if (msg.type === 'openTranscript') {
    // Only Parroto's own audio CDN is accepted.
    if (/^https:\/\/assets\.parroto\.app\//.test(msg.src)) {
      chrome.tabs.create({ url: chrome.runtime.getURL(`transcript/transcript.html?q=${encodeURIComponent(msg.q)}&src=${encodeURIComponent(msg.src)}&auto=1`) });
    }
  } else if (msg.type === 'diagnosis') {
    serial(() => store.update('review', (rv) => {
      const sess = { ...(rv[msg.session] || {}) };
      sess[msg.q] = { ...(sess[msg.q] || { q: msg.q }), diag: msg.code, diagReason: msg.reason };
      return { ...rv, [msg.session]: sess };
    }));
  } else if (msg.type === 'vocabStats') {
    serial(() => store.update('vocab', (v) => {
      const snaps = { ...(v.snaps || {}) };
      const snap = { ...msg.data, at: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) };
      snaps[d] = { first: snaps[d]?.first || snap, last: snap };
      return { ...v, snaps };
    }));
  } else if (msg.type === 'pace') {
    serial(() => store.update('pace', (all) => ({ ...all, [msg.session]: { ...(all[msg.session] || {}), date: all[msg.session]?.date || d, start: msg.start, scale: msg.scale, qSecs: msg.qSecs, groups: msg.groups || all[msg.session]?.groups || null } })));
  } else if (msg.type === 'listenPace') {
    serial(() => store.update('pace', (all) => ({ ...all, [msg.session]: { ...(all[msg.session] || { date: d }), listen: { ...(all[msg.session]?.listen || {}), ...msg.sets } } })));
  } else if (msg.type === 'openDrill') {
    const q = new URLSearchParams({ drill: msg.kind, focus: msg.focus || '', n: String(msg.n || 5) });
    chrome.tabs.create({ url: chrome.runtime.getURL('panel/panel.html') + '?' + q.toString() });
  } else if (msg.type === 'vocabSave') {
    serial(() => store.update('vocab', (v) => ({ ...v, saved: addSaved(v.saved, msg, d) })));
  } else if (msg.type === 'vocabRate') {
    serial(() => store.update('vocab', (v) => {
      const rates = { ...(v.rates || {}) };
      const day = { ...(rates[d] || {}) };
      day[msg.rating] = (day[msg.rating] || 0) + 1;
      day.total = (day.total || 0) + 1;
      rates[d] = day;
      return { ...v, rates };
    }));
  } else if (msg.type === 'analytics') {
    serial(() => store.update('parroto', (p) => ({ ...p, analytics: { ...msg.data, date: d } })));
  } else if (msg.type === 'scrapeWarn') {
    serial(() => store.update('meta', (m) => ({ ...m, scraperWarnings: { ...(m.scraperWarnings || {}), [msg.page]: { date: d, msg: msg.msg } } })));
  } else if (msg.type === 'scrapeOk') {
    serial(async () => {
      const m = await store.get('meta');
      if (m.scraperWarnings?.[msg.page]) {
        delete m.scraperWarnings[msg.page];
        await store.set('meta', m);
      }
    });
  } else if (msg.type === 'backup') {
    serial(backup).then(() => sendResponse({ ok: true }));
    return true;
  } else if (msg.type === 'reschedule') {
    schedule();
  }
  return false;
});

