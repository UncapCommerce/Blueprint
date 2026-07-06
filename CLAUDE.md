# Working on Blueprint with Claude

This file tells Claude how Denis prefers to work on this repo. Treat it as
durable instruction across sessions.

## Architecture in 30 seconds

Single Cloudflare Worker (`worker/index.js`) backed by Workers Static
Assets in `public/`. There is **no build step** — `index.html` loads
React, ReactDOM, and `@babel/standalone` (vendored under `/vendor/`) from
`<script>` tags, and Babel transpiles `.jsx` files in the browser.

- Root page: the **Blueprint admin app** (`public/index.html` +
  `public/admin/AdminApp.jsx`). Google sign-in (Google Identity
  Services), reserved for `@uncap.com` accounts. Sessions live in KV
  (`admin_session:<token>`) behind an HttpOnly `bp_admin` cookie.
  Sections: Home / Discoveries / Blueprints (Preview, Share, Activity,
  Print per blueprint, plus draft creation)
- Google OAuth Client ID: `GOOGLE_CLIENT_ID_FALLBACK` constant in
  `worker/index.js` (a public value; hardcoded because `--keep-vars`
  means wrangler.toml var edits never reach the worker). A
  `GOOGLE_CLIENT_ID` dashboard var overrides it
- Admin API: `/api/admin/*` in `worker/index.js` (google-login, me,
  logout, blueprints, discoveries, access-log, bp-token). The
  `BLUEPRINT_REGISTRY` const lists every shipped blueprint — append to
  it when adding blueprint 012+
- Blueprint pages no longer render a floating admin toolbar;
  `public/admin/AdminToolbar.jsx` is print hooks only (print-quality CSS
  for everyone + `?bpPrint=delivery|shopify` auto-print for admins,
  triggered from the admin app). Each blueprint Gate silently mints a
  preview session from the `bp_admin` cookie via `/api/admin/bp-token`,
  so the team never types email codes
- `/build` quiz: `public/build/index.html` + `public/components/QuizApp.jsx`
- Worker handles `/api/checkout/*` (Stripe SetupIntents) and
  `/api/build/session/*` (KV-backed quiz resume), then falls through to
  the static assets binding for everything else
- Production: `blueprint.uncap.com`. Deploys run on every push to
  `main` via the GitHub Actions workflow
  (`.github/workflows/deploy.yml`, `npm run deploy` with the
  `CLOUDFLARE_API_TOKEN` repo secret). Cloudflare's Workers Builds
  GitHub integration may also be connected as a second pipeline
- `wrangler dev --local` cannot emulate the `cloudflare:email` module on
  the pinned wrangler 3.x — local worker smoke tests fail at startup
  with "No such module". Validate with `wrangler deploy --dry-run` plus
  a babel-transform of changed JSX instead
- Stripe + Resend secrets live in the Cloudflare dashboard, not in env
  files. `wrangler.toml` only declares vars that are safe in plaintext
  (e.g. `STRIPE_PUBLISHABLE_KEY`)

## Standard for every Blueprint proposal page

Every per-client Blueprint under `public/<Brand>/` follows the same
contract — match this when adding a new one:

- **Auth gate** in `index.html`: email → 6-digit code → 24-hour token,
  with `denis@uncap.com` as a no-email self-test. Team/admin access
  comes from the admin dashboard (each Gate mints a preview session from
  the `bp_admin` cookie via `/api/admin/bp-token`), not a passcode typed
  into the email field. Token is exposed on `window.__bpToken` for the
  approve button to read
- **Blueprint number**: assign the next sequential ID (`001` Mitutoyo,
  `002` wichelt, `003` ElevateOralCare, `004` ValveMan, `005` Ben-Ami,
  `006` AnatomyWarehouse, `007` SperScientific, `008` GPSCity,
  `009` TucsonAlternator, `010` ElyCattleman, `011` VIVO, etc.) and put
  it in the page header. Number is by creation order, not alphabetical
- **Approve & kickoff button**: use the `BPApproveButton` pattern that
  opens a signature modal collecting full name + title, POSTs to
  `/api/auth/sign`, and only flips to "Approved ✓" after the server
  confirms. Bump the `APPROVED_KEY` version (`<brand>_approved_vN`) any
  time the flow changes so stale `sessionStorage` flags don't keep old
  testers stuck on "Approved"
- **Master Services Agreement inline in the modal**: the popup must show
  the full Uncap MSA text below the name/title fields. Load
  `<script type="text/babel" src="/legal/UncapMSA.jsx?v=DEPLOY_HASH"></script>`
  BEFORE `BlueprintSections.jsx` in `index.html`, then render
  `{MSA ? <MSA company={BRAND_NAME} name={name.trim()} title={title.trim()}/> : null}`
  inside the modal. Do NOT iframe a standalone HTML — the MSA component
  is the single source of truth for legal terms
- **Cache-bust** the new `public/<Brand>/index.html` by adding it to the
  `files` array in `scripts/stamp-deploy.js`

## Default workflow for every change

For any change Denis asks for, follow this loop without asking:

1. **Stay on `main`**. Don't create feature/session branches, don't
   open PRs. Edit, commit, push to `main` directly. Cloudflare's
   GitHub integration auto-deploys on push.
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
5. **Push to `main`** with `git push origin main`. Cloudflare's
   GitHub integration deploys automatically on push.

The user has pre-authorized this loop. Don't ask before committing or
pushing to `main`. Do still ask before destructive ops (force push,
anything that rewrites already-pushed commits).

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
