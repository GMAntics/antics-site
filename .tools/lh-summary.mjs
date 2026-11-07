// Summarise the Lighthouse JSON files in <dir>/raw into <dir>/summary.json and a markdown table on stdout.
// Usage: node .tools/lh-summary.mjs <dir>
import fs from 'node:fs'; import path from 'node:path';
const dir = process.argv[2]; const raw = path.join(dir, 'raw');
const rows = [];
for (const f of fs.readdirSync(raw).filter(f => f.endsWith('.json')).sort()) {
  const j = JSON.parse(fs.readFileSync(path.join(raw, f), 'utf8'));
  const a = j.audits, c = j.categories;
  const rb = (a['render-blocking-insight'] || a['render-blocking-resources'] || {});
  const items = (rb.details && rb.details.items) || [];
  rows.push({
    file: f, url: j.finalDisplayedUrl || j.finalUrl, formFactor: j.configSettings.formFactor,
    fetchTime: j.fetchTime, lighthouse: j.lighthouseVersion,
    perf: Math.round((c.performance.score ?? 0) * 100), a11y: Math.round((c.accessibility?.score ?? 0) * 100),
    bp: Math.round((c['best-practices']?.score ?? 0) * 100), seo: Math.round((c.seo?.score ?? 0) * 100),
    fcp_ms: Math.round(a['first-contentful-paint'].numericValue), lcp_ms: Math.round(a['largest-contentful-paint'].numericValue),
    cls: +(a['cumulative-layout-shift'].numericValue).toFixed(4), tbt_ms: Math.round(a['total-blocking-time'].numericValue),
    si_ms: Math.round(a['speed-index'].numericValue),
    lcp_element: a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet?.slice(0, 80) || '',
    render_blocking: items.map(i => (i.url || (i.node && i.node.snippet) || '?') + (i.wastedMs != null ? ' (' + Math.round(i.wastedMs) + 'ms)' : '')),
    render_blocking_savings_ms: Math.round(rb.numericValue || rb.details?.overallSavingsMs || 0),
  });
}
fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify(rows, null, 2));
console.log('| page | form | perf | a11y | BP | SEO | FCP | LCP | CLS | TBT | SI | render-blocking |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) console.log(`| ${new URL(r.url).pathname} | ${r.formFactor} | ${r.perf} | ${r.a11y} | ${r.bp} | ${r.seo} | ${r.fcp_ms} | ${r.lcp_ms} | ${r.cls} | ${r.tbt_ms} | ${r.si_ms} | ${r.render_blocking.map(u => u.replace('https://anticsapp.com', '').replace('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&display=swap', 'GoogleFontsCSS')).join('; ') || 'none'} |`);
