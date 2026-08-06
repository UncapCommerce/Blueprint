#!/usr/bin/env node
// Stamps the deploy SHA into JSX <script src> tags in the public HTML files
// so every deploy invalidates the Cloudflare edge + browser cache of those
// files. Runs as part of `npm run deploy`, which Cloudflare Workers Builds
// executes on every push to main. Without this, edge-cached JSX persists
// past the deploy and users see stale UI for hours.
//
// Hash source priority:
//   WORKERS_CI_COMMIT_SHA   (Cloudflare Workers Builds)
//   GITHUB_SHA              (GitHub Actions, if we ever re-add one)
//   `git rev-parse HEAD`    (local fallback for manual `wrangler deploy`)
//   timestamp               (last-resort fallback so we always stamp something)

const fs = require('fs');
const { execSync } = require('child_process');

function resolveSha() {
  if (process.env.WORKERS_CI_COMMIT_SHA) return process.env.WORKERS_CI_COMMIT_SHA;
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (_) {
    return 't' + Date.now().toString(36);
  }
}

const sha = resolveSha().slice(0, 8);
const files = [
  'public/index.html',
  'public/admin/index.html',
  'public/blueprint-template/index.html',
  'public/estimate-template/index.html',
  'public/Mitutoyo/index.html',
  'public/wichelt/index.html',
  'public/ElevateOralCare/index.html',
  'public/ValveMan/index.html',
  'public/Ben-Ami/index.html',
  'public/AnatomyWarehouse/index.html',
  'public/SperScientific/index.html',
  'public/GPSCity/index.html',
  'public/TucsonAlternator/index.html',
  'public/ElyCattleman/index.html',
  'public/VIVO/index.html',
  'public/Weedoo/index.html',
  'public/CartonCraftSupply/index.html',
  'public/Uncap/index.html',
  'public/HydraPower/index.html',
  'public/TrustyCook/index.html',
  'public/QPFeed/index.html',
  'public/demo/blueprint/index.html',
  'public/discovery/index.html',
];

let touched = 0;
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  const after = before.replace(/DEPLOY_HASH/g, sha);
  if (after !== before) {
    fs.writeFileSync(f, after);
    touched++;
  }
}
console.log(`[stamp-deploy] sha=${sha} files-rewritten=${touched}`);
