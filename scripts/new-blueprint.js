#!/usr/bin/env node
// Scaffold a bespoke blueprint page by cloning an existing brand folder.
//
// This is the TIER-2 "assisted handoff" path: every draft already renders as a
// templated proposal at /<company>/blueprint automatically (no script needed).
// Run this only to UPGRADE an important client to a hand-designed page. Because
// a registry entry wins over the templated draft, adding the printed row takes
// over the client's existing URL, portal link, and signature history with zero
// customer-visible change.
//
// This is a LOCAL dev tool, not a runtime feature (static assets + the registry
// are build-time). After running it, hand-design the page, then add the two
// printed lines and push.
//
// Usage:
//   node scripts/new-blueprint.js --slug=acme --name="Acme Supply" --dir=Acme [--from=CartonCraftSupply]
//
// --slug : the blueprint id (must match the company's Blueprint ID); lowercase.
// --name : the display brand name.
// --dir  : the public/<Dir>/ folder name (defaults to a CamelCase of --name).
// --from : the source brand to clone (defaults to CartonCraftSupply).

const fs = require('fs');
const path = require('path');

function arg(k, def) {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.slice(k.length + 3) : def;
}

const slug = (arg('slug') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
const name = arg('name') || '';
const from = arg('from', 'CartonCraftSupply');
const dir = arg('dir') || name.replace(/[^A-Za-z0-9]+/g, '');

if (!slug || !name) {
  console.error('Usage: node scripts/new-blueprint.js --slug=acme --name="Acme Supply" [--dir=Acme] [--from=CartonCraftSupply]');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'public', from);
const dest = path.join(root, 'public', dir);
if (!fs.existsSync(src)) { console.error(`Source brand not found: public/${from}`); process.exit(1); }
if (fs.existsSync(dest)) { console.error(`Destination already exists: public/${dir}`); process.exit(1); }

// Recursive copy (Node 16+ has fs.cpSync).
fs.cpSync(src, dest, { recursive: true });

// Read the source brand's identity to swap it out everywhere.
const idxSrc = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
const srcName = (idxSrc.match(/name:\s*'([^']+)'/) || [])[1] || from;
const srcId = (idxSrc.match(/const BLUEPRINT_ID\s*=\s*'([^']+)'/) || [])[1] || from.toLowerCase();

function swapInFile(rel, pairs) {
  const p = path.join(dest, rel);
  if (!fs.existsSync(p)) return;
  let s = fs.readFileSync(p, 'utf8');
  for (const [a, b] of pairs) s = s.split(a).join(b);
  fs.writeFileSync(p, s);
}

// index.html: title, brand name, gate id, session key.
swapInFile('index.html', [
  [`<title>${srcName}`, `<title>${name}`],
  [`name: '${srcName}'`, `name: '${name}'`],
  [`const BLUEPRINT_ID = '${srcId}';`, `const BLUEPRINT_ID = '${slug}';`],
  [`bp_token_${srcId}`, `bp_token_${slug}`],
]);
// BlueprintSections.jsx: brand default, approved key, brand name, then any
// remaining literal mentions of the source brand name.
swapInFile('components/blueprint/BlueprintSections.jsx', [
  [`${srcId}_approved_v1`, `${slug}_approved_v1`],
  [srcName, name],
]);

console.log(`\n✓ Cloned public/${from} → public/${dir}\n`);
console.log('Next steps:');
console.log(`  1. Hand-design public/${dir}/ (content, numbers, client lead, blueprint number).`);
console.log('  2. Add this row to BLUEPRINT_REGISTRY in worker/index.js:');
console.log(`     { id: '${slug}', dir: '${dir}', name: '${name}', num: 'NNN', channel: 'Inbound' },`);
console.log("  3. Add this line to the `files` array in scripts/stamp-deploy.js:");
console.log(`     'public/${dir}/index.html',`);
console.log(`  4. Ensure the company's Blueprint ID is '${slug}' so the URL upgrades in place.`);
console.log('  5. Validate (babel + wrangler dry-run), commit, push.\n');
