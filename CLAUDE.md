# Working on Blueprint with Claude

This file tells Claude how Denis prefers to work on this repo. Treat it as
durable instruction across sessions.

## Architecture in 30 seconds

Single Cloudflare Worker (`worker/index.js`) backed by Workers Static
Assets in `public/`. There is **no build step** — `index.html` loads
React, ReactDOM, and `@babel/standalone` (vendored under `/vendor/`) from
`<script>` tags, and Babel transpiles `.jsx` files in the browser.

- Landing page: `public/index.html` + `public/components/*.jsx`
- `/build` quiz: `public/build/index.html` + `public/components/QuizApp.jsx`
- Worker handles `/api/checkout/*` (Stripe SetupIntents) and
  `/api/build/session/*` (KV-backed quiz resume), then falls through to
  the static assets binding for everything else
- Production: `blueprint.uncap.com`. Deploy is **automatic** on push to
  `main` via Cloudflare's GitHub integration (Workers Builds). Status
  visible at Cloudflare dashboard → Workers & Pages →
  `uncap-blueprint` → Builds. There is **no GitHub Actions
  workflow** — Cloudflare's CI handles it
- Stripe + Resend secrets live in the Cloudflare dashboard, not in env
  files. `wrangler.toml` only declares vars that are safe in plaintext
  (e.g. `STRIPE_PUBLISHABLE_KEY`)

## Default workflow for every change

For any change Denis asks for, follow this loop without asking:

1. **Branch** off latest `main` (`git checkout main && git pull --ff-only
   origin main && git checkout -b claude/<short-slug>`)
2. **Make the change** — edit files, no need to add a build step
3. **Smoke-test locally** before pushing for any non-trivial change:
   - For JSX/CSS/HTML edits: `wrangler dev` (or `npx wrangler dev`),
     hit `http://localhost:8787/` and the affected page, watch the
     console for errors
   - For `worker/index.js` edits: also exercise the affected
     `/api/...` route (curl + a quick happy-path payload)
   - Trivial copy / one-line CSS tweaks can skip the dev server
4. **Commit** with a clear message that explains the *why*, not the
   *what* (the diff already shows the what). Match the existing repo
   style: lowercase prefix, em-dashes are banned site-wide and in commit
   messages (PR #66 stripped them as an "AI tell"), keep it concise
5. **Push** the branch with `git push -u origin <branch>`
6. **Open a PR** via `mcp__github__create_pull_request` against `main`
   with a summary + a test plan checklist
7. **Squash-merge** via `mcp__github__merge_pull_request` (method:
   `squash`) once the PR's `mergeable_state` is `clean`. The merge
   triggers the Deploy workflow automatically
8. **Confirm deploy kicked off** by linking to the Actions tab. Don't
   poll — Denis will tell you if something looks off

The user has pre-authorized this loop. Don't ask before any of:
branching, committing, pushing, opening a PR, squash-merging, or
deploying. Do still ask before destructive ops (force push, branch
deletes that touch shared history, anything that rewrites already-pushed
commits).

## When to pause and ask

- Any schema/data migration on Stripe customers or KV (`BUILD_SESSIONS`)
- Anything that touches the deploy workflow itself
  (`.github/workflows/deploy.yml`) or `wrangler.toml`'s routes / account
  / KV bindings
- Adding a third-party origin to the critical path (new SDK, new font
  source, new analytics) — propose first, then deploy
- Visual / brand changes that go beyond the existing design tokens in
  `colors_and_type.css`
- Anything that costs money (new Cloudflare paid feature, new SaaS
  integration)

## Style notes for code in this repo

- Components are inline-styled React with no Tailwind / CSS modules.
  Match that pattern; don't introduce a CSS-in-JS lib
- Mobile/tablet rules are written as `[style*="..."]` attribute
  selectors in the per-page `<style>` block. Ugly but intentional —
  it keeps responsive overrides next to the page they affect
- `_hooks.jsx` exposes `window.useIsMobile()`; new components should use
  it rather than rolling their own breakpoint detection
- Don't strip `loading="lazy"` / `decoding="async"` from existing
  `<img>` tags. Above-the-fold imagery uses `fetchpriority="high"`
  with explicit `width`/`height` to anchor LCP
- Em-dashes are banned (per PR #66). Use a comma, semicolon, or two
  separate sentences

## Testing the deploy after merge

`blueprint.uncap.com` is the production target. After a deploy the fast
checks are:

```bash
# Asset cache headers (should be max-age=31536000, immutable)
curl -sI https://blueprint.uncap.com/vendor/react.production.min.js | head

# Worker still serving HTML
curl -s https://blueprint.uncap.com/ | head -20

# /build quiz session API
curl -s -o /dev/null -w '%{http_code}\n' \
  https://blueprint.uncap.com/api/build/session?id=deadbeefdeadbeef
# Expect 404 (session not found) or 503 (KV missing) — both prove the
# worker is routing
```
