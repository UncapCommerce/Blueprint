// Deploy-time JSX precompiler.
//
// In development the pages load @babel/standalone (~3MB) and transpile their
// `.jsx` in the browser on every load. That's ~3MB of blocking download plus a
// main-thread transpile per page. This module runs at DEPLOY time (from
// stamp-deploy.js) and does that transpile once, ahead of time:
//
//   • every `<script type="text/babel" src="X.jsx">` becomes a plain
//     `<script src="X.js">`, and X.jsx is transpiled to a sibling X.js
//   • every inline `<script type="text/babel">…</script>` is transpiled in place
//   • the `/vendor/babel.min.js` tag is removed
//
// Source stays `.jsx` + Babel in the repo (so local `wrangler dev` is unchanged
// and Denis keeps editing `.jsx`); only the deployed copy is precompiled. Uses
// the already-vendored Babel, so there is no new build dependency.

const fs = require('fs');
const path = require('path');

// The transpiler itself (loaded from the repo, not the tree being processed).
const Babel = require(path.resolve(__dirname, '..', 'public', 'vendor', 'babel.min.js'));

function transpile(code, filename) {
  return Babel.transform(code, {
    presets: ['react'],           // JSX only; modern JS passes through untouched
    compact: false,
    comments: false,
    filename,
  }).code;
}

// Map a script src (absolute "/a/b.jsx" or relative "c/d.jsx", possibly with a
// ?query) to its file path inside `publicDir`, relative to the owning HTML file.
function resolveSrc(publicDir, htmlAbsPath, src) {
  const clean = src.split('?')[0];
  return clean.startsWith('/')
    ? path.join(publicDir, clean)
    : path.join(path.dirname(htmlAbsPath), clean);
}

// Walk a directory tree collecting every *.html file.
function findHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findHtml(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

// Precompile a whole public/ tree in place. Idempotent per file: a page with no
// `text/babel` scripts is left untouched. Returns { pages, files } counts.
function precompileTree(publicDir) {
  const transpiledFiles = new Set();
  let pages = 0;

  const transpileFile = (absJsx) => {
    if (transpiledFiles.has(absJsx)) return;
    transpiledFiles.add(absJsx);
    const absJs = absJsx.replace(/\.jsx$/, '.js');
    const src = fs.readFileSync(absJsx, 'utf8');
    fs.writeFileSync(absJs, transpile(src, absJsx));
  };

  for (const htmlAbs of findHtml(publicDir)) {
    let html = fs.readFileSync(htmlAbs, 'utf8');
    if (!html.includes('type="text/babel"')) continue;

    // 1) External JSX modules → transpile the file, point the tag at the .js.
    html = html.replace(/<script type="text\/babel" src="([^"?]+\.jsx)([^"]*)"><\/script>/g,
      (_m, jsxSrc, query) => {
        transpileFile(resolveSrc(publicDir, htmlAbs, jsxSrc));
        return `<script src="${jsxSrc.replace(/\.jsx$/, '.js')}${query}"></script>`;
      });

    // 2) Inline JSX (the render call, page components) → transpile in place.
    html = html.replace(/<script type="text\/babel">([\s\S]*?)<\/script>/g,
      (_m, body) => `<script>${transpile(body, htmlAbs)}</script>`);

    // 3) Drop the now-unused in-browser transpiler.
    html = html.replace(/[ \t]*<script src="\/vendor\/babel\.min\.js"><\/script>\r?\n?/g, '');

    fs.writeFileSync(htmlAbs, html);
    pages++;
  }
  return { pages, files: transpiledFiles.size };
}

module.exports = { precompileTree, transpile };
