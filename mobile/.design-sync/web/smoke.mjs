// Crash smoke test without Chromium: mount every preview cell into jsdom with
// the real react-dom/client (same path the card takes in the browser).
// Catches runtime throws and empty renders; does NOT verify visuals.
// Usage (from mobile/): node .ds-sync/smoke.mjs ./ds-bundle
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const OUT = resolve(process.argv[2] ?? './ds-bundle');
const require = createRequire(resolve('.ds-sync/package.json'));
const { JSDOM, VirtualConsole } = require('jsdom');

const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errs.push('jsdomError: ' + String(e?.message ?? e).slice(0, 300)));
vc.on('error', (...a) => errs.push(a.map(String).join(' ').slice(0, 300)));
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc, url: 'http://localhost/',
});
const w = dom.window;
w.matchMedia ??= () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
w.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };

const run = (file) => w.eval(readFileSync(file, "utf8") + `\n;if (typeof __dsPreview !== "undefined") window.__dsPreview = __dsPreview;\n//# sourceURL=${file}`);
run(join(OUT, '_vendor/react.js'));
run(join(OUT, '_ds_bundle.js'));

const cfg = JSON.parse(readFileSync('.design-sync/config.json', 'utf8'));
const wrap = (el) => cfg.provider ? w.React.createElement(w.HomeTour[cfg.provider.component], cfg.provider.props ?? {}, el) : el;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
for (const f of readdirSync(join(OUT, '_preview')).filter((f) => f.endsWith('.js')).sort()) {
  const name = f.replace(/\.js$/, '');
  try { run(join(OUT, '_preview', f)); }
  catch (e) { results.push({ name, cell: '(load)', ok: false, err: String(e).slice(0, 300) }); continue; }
  for (const [cell, C] of Object.entries(w.__dsPreview ?? {})) {
    if (typeof C !== 'function' || !/^[A-Z]/.test(cell)) continue;
    errs.length = 0;
    const host = w.document.createElement('div');
    w.document.body.appendChild(host);
    let thrown;
    try {
      const root = w.ReactDOM.createRoot(host, { onUncaughtError: (e) => { thrown = e; }, onCaughtError: (e) => { thrown = e; } });
      w.ReactDOM.flushSync(() => root.render(wrap(w.React.createElement(C))));
      await sleep(30);
      const text = host.textContent.replace(/\s+/g, ' ').trim();
      const nodes = host.querySelectorAll('*').length;
      results.push({ name, cell, ok: !thrown && nodes > 3, nodes, text: text.slice(0, 100), err: thrown && String(thrown?.message ?? thrown).slice(0, 300), warn: errs[0] });
      root.unmount();
    } catch (e) {
      results.push({ name, cell, ok: false, err: String(e?.message ?? e).slice(0, 300), warn: errs[0] });
    }
    host.remove();
  }
}
for (const r of results) {
  const head = `${r.ok ? '✓' : '✘'} ${r.name}.${r.cell}`;
  console.log(r.ok ? `${head}  ${r.nodes} nodes  "${r.text}"` : `${head}  ${r.err ?? `only ${r.nodes} nodes`}`);
  if (r.warn) console.log(`    console: ${r.warn}`);
}
const bad = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - bad}/${results.length} cells mounted`);
process.exit(bad ? 1 : 0);
