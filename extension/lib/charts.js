// Small inline-SVG charts for the panel. No libraries, theme colors via CSS variables.
// Every mark carries a <title> so hovering shows the exact value.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Line chart on one shared y-axis. series: [{name, color, values: [number|null]}], labels: [string]
// bands: [{ values, pm, color }] draws a shaded ±pm area around each value (normal test-to-test noise).
export function lineChart({ labels, series, yMax, yMin = 0, height = 170, unit = '', bands = [] }) {
  const W = 340;
  const H = height;
  const pad = { l: 34, r: 34, t: 12, b: 24 };
  const n = labels.length;
  if (!n) return '';
  const x = (i) => pad.l + (n === 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (n - 1));
  const y = (v) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * (H - pad.t - pad.b);
  const ticks = [yMin, yMin + (yMax - yMin) / 2, yMax].map(Math.round);
  let svg = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(series.map((s) => s.name).join(', '))}">`;
  for (const t of ticks) svg += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(t)}" y2="${y(t)}" class="grid"/><text x="${pad.l - 6}" y="${y(t) + 4}" class="axis" text-anchor="end">${t}</text>`;
  labels.forEach((l, i) => { svg += `<text x="${x(i)}" y="${H - 6}" class="axis" text-anchor="middle">${esc(l)}</text>`; });
  for (const b of bands) {
    const pts = b.values.map((v, i) => (v == null ? null : [x(i), v])).filter(Boolean);
    if (pts.length) {
      const clamp = (v) => Math.max(yMin, Math.min(yMax, v));
      const up = pts.map(([px, v]) => `${px},${y(clamp(v + b.pm))}`);
      const lo = pts.map(([px, v]) => `${px},${y(clamp(v - b.pm))}`).reverse();
      const pad1 = pts.length === 1 ? 8 : 0;
      svg += pts.length === 1
        ? `<rect x="${pts[0][0] - pad1}" y="${y(clamp(pts[0][1] + b.pm))}" width="${pad1 * 2}" height="${y(clamp(pts[0][1] - b.pm)) - y(clamp(pts[0][1] + b.pm))}" fill="${b.color}" opacity="0.18"/>`
        : `<polygon points="${[...up, ...lo].join(' ')}" fill="${b.color}" opacity="0.18"/>`;
    }
  }
  for (const s of series) {
    const pts = s.values.map((v, i) => (v == null ? null : [x(i), y(v), v, i])).filter(Boolean);
    if (pts.length > 1) svg += `<polyline points="${pts.map((p) => p[0] + ',' + p[1]).join(' ')}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (const p of pts) {
      svg += `<g class="pt"><circle cx="${p[0]}" cy="${p[1]}" r="10" fill="transparent"/><circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${s.color}" stroke="var(--card)" stroke-width="2"/><title>${esc(s.name)} · ${esc(labels[p[3]])}: ${p[2]}${unit}</title></g>`;
    }
    const last = pts[pts.length - 1];
    if (last) svg += `<text x="${Math.min(last[0] + 7, W - 2)}" y="${last[1] + 4}" class="dlabel">${last[2]}</text>`;
  }
  svg += '</svg>';
  const legend = series.length > 1 ? `<div class="legend-row">${series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
  return legend + svg;
}

// Vertical bars, one series. items: [{label, value, tip, ref?}] ; ref draws a short dashed target mark on that bar.
export function barChart({ items, yMax, height = 140, unit = '', color = 'var(--series-1)' }) {
  const W = 340;
  const H = height;
  const pad = { l: 30, r: 6, t: 10, b: 22 };
  const n = items.length;
  if (!n) return '';
  const max = yMax || Math.max(1, ...items.map((i) => Math.max(i.value, i.ref || 0)));
  const bw = (W - pad.l - pad.r) / n;
  const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  let svg = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img">`;
  for (const t of [0, Math.round(max / 2), Math.round(max)]) svg += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(t)}" y2="${y(t)}" class="grid"/><text x="${pad.l - 5}" y="${y(t) + 4}" class="axis" text-anchor="end">${t}</text>`;
  items.forEach((it, i) => {
    const x0 = pad.l + i * bw + 1;
    const w = Math.max(2, bw - 2);
    const h = Math.max(0, H - pad.b - y(it.value));
    const r = Math.min(4, w / 2, h);
    // Rounded top, square base.
    const top = y(it.value);
    const base = H - pad.b;
    const path = h > 0 ? `M${x0},${base} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + w - r} Q${x0 + w},${top} ${x0 + w},${top + r} V${base} Z` : '';
    svg += `<g class="pt"><rect x="${x0}" y="${pad.t}" width="${w}" height="${base - pad.t}" fill="transparent"/>${path ? `<path d="${path}" fill="${it.color || color}"/>` : ''}`;
    if (it.ref) svg += `<line x1="${x0}" x2="${x0 + w}" y1="${y(it.ref)}" y2="${y(it.ref)}" class="ref"/>`;
    svg += `<title>${esc(it.tip || `${it.label}: ${it.value}${unit}`)}</title></g>`;
    if (n <= 16 && (n - 1 - i) % Math.ceil(n / 7) === 0) svg += `<text x="${x0 + w / 2}" y="${H - 6}" class="axis" text-anchor="middle">${esc(it.label)}</text>`;
  });
  return svg + '</svg>';
}

// Horizontal bars for rates 0..1 with a threshold line (e.g. 60%).
export function rateBars({ items, threshold = 0.6 }) {
  const W = 340;
  const rowH = 22;
  const pad = { l: 34, r: 40 };
  const H = items.length * rowH + 14;
  const x = (v) => pad.l + v * (W - pad.l - pad.r);
  let svg = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img">`;
  items.forEach((it, i) => {
    const yy = 6 + i * rowH;
    svg += `<g class="pt"><rect x="0" y="${yy}" width="${W}" height="${rowH}" fill="transparent"/><text x="0" y="${yy + 14}" class="axis">${esc(it.label)}</text>`;
    if (it.rate != null) {
      const w = Math.max(2, x(it.rate) - pad.l);
      const bad = it.n >= 20 && it.rate < threshold;
      svg += `<rect x="${pad.l}" y="${yy + 4}" width="${w}" height="12" rx="3" fill="${bad ? 'var(--bad)' : 'var(--series-1)'}"/><text x="${pad.l + w + 5}" y="${yy + 14}" class="dlabel">${Math.round(it.rate * 100)}%${bad ? ' ⚠' : ''}</text>`;
    } else {
      svg += `<text x="${pad.l}" y="${yy + 14}" class="axis">chưa có dữ liệu</text>`;
    }
    svg += `<title>${esc(it.tip || it.label)}</title></g>`;
  });
  svg += `<line x1="${x(threshold)}" x2="${x(threshold)}" y1="2" y2="${H - 4}" class="ref"/><text x="${x(threshold)}" y="${H}" class="axis" text-anchor="middle">${Math.round(threshold * 100)}%</text>`;
  return svg + '</svg>';
}
