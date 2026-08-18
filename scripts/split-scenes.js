#!/usr/bin/env node
// Splits the discovery scenes bundle into one lazily-loaded file per scene.
//
// The discovery page used to ship all nine scenes as a single 228KB
// public/discovery/scenes.js even though the login Gate needs none of them
// and a step only ever shows one. The app now lazy-loads
// /discovery/scenes/scene-<n>.js on demand (and prefetches the rest when
// idle), so this script is the bridge for the scenes-generator workflow:
// whenever a new scenes.js-style bundle is produced, run
//
//   node scripts/split-scenes.js [path/to/scenes.js]
//
// and it writes public/discovery/scenes/scene-1.js … scene-9.js. The input
// defaults to public/discovery/scenes.js when that file exists (it is no
// longer checked in after the split; pass the generator's output path).

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const input = process.argv[2] || path.join(root, 'public', 'discovery', 'scenes.js');
const outDir = path.join(root, 'public', 'discovery', 'scenes');

const src = fs.readFileSync(input, 'utf8');
const json = src.replace(/^\s*window\.DISCOVERY_SCENES\s*=\s*/, '').replace(/;\s*$/, '');
const scenes = JSON.parse(json);

fs.mkdirSync(outDir, { recursive: true });
let total = 0;
for (const [n, html] of Object.entries(scenes)) {
  const body = 'window.DISCOVERY_SCENES = window.DISCOVERY_SCENES || {};\n'
    + `window.DISCOVERY_SCENES[${JSON.stringify(n)}] = ${JSON.stringify(html)};\n`;
  const file = path.join(outDir, `scene-${n}.js`);
  fs.writeFileSync(file, body);
  total += body.length;
  console.log(`  scenes/scene-${n}.js  ${Math.round(body.length / 1024)}KB`);
}

// Round-trip check: evaluating every emitted file must rebuild the map.
const rebuilt = {};
global.window = { DISCOVERY_SCENES: rebuilt };
for (const n of Object.keys(scenes)) {
  // eslint-disable-next-line no-eval
  eval(fs.readFileSync(path.join(outDir, `scene-${n}.js`), 'utf8'));
}
for (const [n, html] of Object.entries(scenes)) {
  if (rebuilt[n] !== html) { console.error(`MISMATCH scene ${n}`); process.exit(1); }
}
console.log(`✓ ${Object.keys(scenes).length} scenes, ${Math.round(total / 1024)}KB total, round-trip verified`);
