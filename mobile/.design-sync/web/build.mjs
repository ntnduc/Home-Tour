// Web render bridge for claude.ai/design (cfg.buildCmd).
//
// Compiles .design-sync/web/entry.ts — the Dashboard + PropertyList reference
// components — into a browser ESM package at .design-sync/web-dist/:
//   index.js        react-native -> react-native-web, react/react-dom external
//   types/**.d.ts   tsc declarations (the converter reads props from these)
//   package.json    { name, module, types } so the converter treats it as a DS
//
// The app itself stays mobile-only: react-dom / react-native-web live in the
// gitignored .ds-sync/web-deps (see NOTES.md), never in mobile/package.json.
//
// Run from mobile/:  node .design-sync/web/build.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../..');
const WEB_NM = join(APP, '.ds-sync/web-deps/node_modules');
const APP_NM = join(APP, 'node_modules');
const OUT = join(APP, '.design-sync/web-dist');
const ENTRY = join(HERE, 'entry.ts');

if (!existsSync(join(WEB_NM, 'react-native-web'))) {
  console.error('[WEB_DEPS] missing .ds-sync/web-deps — run:\n  (cd .ds-sync/web-deps && npm i react@19.2.3 react-dom@19.2.3 react-native-web)');
  process.exit(1);
}
const require = createRequire(join(APP, '.ds-sync/package.json'));
const { build } = require('esbuild');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// expo-font's web build imports `node:async_hooks` for its SSR font registry;
// in the browser that path never runs — give it an inert stand-in.
const nodeBuiltinShim = {
  name: 'node-builtin-shim',
  setup(b) {
    b.onResolve({ filter: /^node:/ }, (a) => ({ path: a.path, namespace: 'node-shim' }));
    b.onLoad({ filter: /.*/, namespace: 'node-shim' }, () => ({
      contents: 'export class AsyncLocalStorage { getStore() { return undefined; } run(_s, fn, ...a) { return fn(...a); } }\nexport default {};',
      loader: 'js',
    }));
  },
};

// 1. JS bundle ---------------------------------------------------------------
const EXTERNAL = ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client'];
await build({
  entryPoints: [ENTRY],
  outfile: join(OUT, 'index.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  tsconfig: join(APP, 'tsconfig.json'),
  external: EXTERNAL,
  // react-native-web first so its copy of every web shim wins.
  nodePaths: [WEB_NM, APP_NM],
  alias: { 'react-native': 'react-native-web' },
  // Expo/RN packages ship *.web.* variants for the browser — prefer them.
  resolveExtensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  mainFields: ['react-native', 'browser', 'module', 'main'],
  conditions: ['react-native', 'browser', 'import', 'default'],
  loader: { '.js': 'jsx', '.ttf': 'dataurl', '.otf': 'dataurl', '.png': 'dataurl', '.jpg': 'dataurl' },
  define: {
    __DEV__: 'false',
    'process.env.NODE_ENV': '"production"',
    'process.env.EXPO_OS': '"web"',
    global: 'globalThis',
  },
  // RN libs read process.env.* beyond the defined keys (e.g. Reanimated's
  // JEST_WORKER_ID) — `process` doesn't exist in the browser.
  banner: { js: 'var process = globalThis.process || { env: { NODE_ENV: "production" } };' },
  plugins: [nodeBuiltinShim],
  logLevel: 'warning',
});

// 2. Declarations --------------------------------------------------------------
const tsc = join(APP_NM, 'typescript/bin/tsc');
const typesDir = join(OUT, 'types');
// Extends the app's tsconfig so `@/*` paths and expo's base settings apply.
const tsconfigDts = join(OUT, 'tsconfig.dts.json');
writeFileSync(tsconfigDts, JSON.stringify({
  extends: join(APP, 'tsconfig.json'),
  compilerOptions: {
    declaration: true, emitDeclarationOnly: true, noEmit: false, noEmitOnError: false,
    skipLibCheck: true, allowJs: false, rootDir: APP, outDir: typesDir,
  },
  files: [ENTRY],
  include: [],
}, null, 2));
try {
  execFileSync(process.execPath, [tsc, '-p', tsconfigDts], { cwd: APP, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) {
  // Pre-existing repo type errors don't block declaration emit.
  const n = String(e.stdout ?? '').split('\n').filter((l) => /error TS/.test(l)).length;
  console.error(`  tsc: ${n} type error(s) (declarations still emitted)`);
}

// tsc keeps `@/x` specifiers verbatim; rewrite them to relative paths so the
// .d.ts tree resolves standalone.
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.d.ts') ? [p] : [];
});
const srcTypes = join(typesDir, 'src');
for (const f of walk(typesDir)) {
  const txt = readFileSync(f, 'utf8').replace(/(["'])@\/([^"']+)\1/g, (_, q, p) => {
    let rel = relative(dirname(f), join(srcTypes, p)).replace(/\\/g, '/');
    if (!rel.startsWith('.')) rel = './' + rel;
    return q + rel + q;
  });
  writeFileSync(f, txt);
}
const entryDts = relative(OUT, join(typesDir, relative(APP, ENTRY)).replace(/\.ts$/, '.d.ts')).replace(/\\/g, '/');
if (!existsSync(join(OUT, entryDts))) {
  console.error(`[DTS] expected ${entryDts} — declaration emit failed`);
  process.exit(1);
}

// 3. Package manifest -------------------------------------------------------------
const app = JSON.parse(readFileSync(join(APP, 'package.json'), 'utf8'));
writeFileSync(join(OUT, 'package.json'), JSON.stringify({
  name: 'home-tour-mobile',
  version: app.version ?? '1.0.0',
  private: true,
  type: 'module',
  module: 'index.js',
  types: entryDts,
  peerDependencies: { react: app.dependencies.react },
}, null, 2) + '\n');

console.error(`  web-dist: ${(statSync(join(OUT, 'index.js')).size / 1024).toFixed(0)} KB · types: ${entryDts}`);
