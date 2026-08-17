# Working on Blueprint with Claude

This file tells Claude how Denis prefers to work on this repo. Treat it as
durable instruction across sessions.

## Engineering defaults (always, without being asked)

Every change — new feature, fix, or refactor — must be built to these
standards by default. Denis should never have to ask for them.

- **Performance & speed first.** Fewest network/KV round-trips (batch with
  `Promise.all`, cache hot reads, avoid N+1 and redundant `list()` scans);
  ship the least JS/CSS/image weight to the client; keep the critical path
  fast. Measure when it matters.
- **Clean, minimal code.** Reuse existing helpers and patterns instead of
  adding new ones; no dead code, no duplication, no needless dependencies.
  Match the surrounding style. Delete more than you add when you can.
- **Light database.** KV is the store — keep records small, avoid write-only
  or orphaned keys, don't add a prefix without a reader, and clean up after
  migrations. No unbounded growth on hot paths.
- **Mobile experience is not optional.** Design every page and screen for a
  ~390px phone as well as desktop: no horizontal overflow, layouts stack,
  tap targets ≥ ~40px, inputs ≥ 16px (no iOS zoom). Test at phone width.

## Architecture in 30 seconds

Single Cloudflare Worker (`worker/index.js`) backed by Workers Static
Assets in `public/`. **No build tooling to install** — you edit `.jsx`
directly and locally (`wrangler dev`) `index.html` loads React, ReactDOM,
and `@babel/standalone` (vendored under `/vendor/`) from `<script>` tags
and Babel transpiles the `.jsx` in the browser. On real Cloudflare deploys
a precompile step (`scripts/precompile-jsx.js`, invoked from
`scripts/stamp-deploy.js` when `WORKERS_CI_COMMIT_SHA` is set) transpiles
every `.jsx` to a sibling `.js`, rewrites the `type="text/babel"` script
tags to plain scripts, and drops the 3MB Babel runtime — so production
ships plain `.js` with no in-browser transpile. Source stays `.jsx`; the
`.js` is generated in CI only, never committed. Keep validating changed
JSX with a `babel.transform` (that's exactly what the deploy runs).

- Root page (`/` on `go.uncap.com`): the **customer portal** login
  (`public/index.html` + `public/portal/PortalApp.jsx`). Passwordless
  sign-in (email → 6-digit code) for contacts on portal Companies;
  7-day `__Host-bp_portal` cookie sessions (`portal_session:<token>` in
  KV). View + signature only
- **Company folder URLs**: every company lives at
  `go.uncap.com/<companyId>/` where the id derives from its store domain
  (companyname.com → `companyname`). Tabs are sub-paths: `/company`
  (portal profile), `/discovery` (the discovery experience itself, or a
  completed-manually portal page), `/blueprint` (the blueprint proposal
  itself, or an under-review portal page), `/estimate` (the ballpark
  investment estimate, rendered in the Hub once shared), `/delivery`,
  `/growth`. All future portal functions extend this folder structure. Old
  `/blueprint/<id>/` and `/discovery/<handle>` document URLs 301 to the
  company folder; `PORTAL_RESERVED` in `worker/index.js` guards the
  segments that can never be company ids. `comigrate:v1` (flag-guarded,
  runs from the admin Companies list) backfilled a company for every
  pre-portal blueprint and discovery
- **Estimates** are built from a master item catalog. **Sales → Items**
  (`item:<id>` in KV) is the shared line-item list (name, description,
  price range, derived hours at `ITEM_RATE`, group, type
  module/integration/foundation, recommended flag), seeded once from the
  estimate template (`SEED_ITEMS`, flag `items:seeded:v1`). A per-company
  estimate (`estimate:<companyId>`) snapshots chosen lines (so later master
  edits never change a shared estimate) plus an editable timeline + note.
  Built in the `/admin/estimate/<companyId>` editor (recommended items
  pre-selected, ERP integration is pick-one), saved `draft` or `ready`;
  `ready` lights up `co.hasEstimate/estimateReady` and renders in the Hub's
  Estimate tab (`estimateForPortal` in the portal `me`). Item CRUD:
  `/api/admin/items`, `/api/admin/item/{update,delete}`; estimate:
  `GET/POST /api/admin/estimate`, `/api/admin/estimate/delete`
- Admin app lives at `/admin` (`public/admin/index.html` +
  `public/admin/AdminApp.jsx`, client routes `/admin/companies|
  discoveries|blueprints`). Google sign-in (Google Identity Services),
  reserved for `@uncap.com` accounts. Sessions live in KV
  (`admin_session:<token>`) behind an HttpOnly `__Host-bp_admin` cookie.
  Sections: Companies / Discoveries / Blueprints (+ Users for the super
  admin)
- **P&L (owner-only)**: a top-level tab visible only to the super admin
  (`isSuper`, denis@uncap.com), a full-width whole-year statement.
  `GET /api/admin/pnl?year=YYYY` returns it: a `columns` array with values keyed
  by each column, so the client renders it generically. Columns are all twelve
  months plus every quarter subtotal (Q1–Q4) and a Year total; actuals only fill
  elapsed months so future columns read blank, while the projected plan fills the
  whole year. The year selector spans the current year plus the next two, so
  projected P&Ls for this and the next two years can be built. Revenue reuses the
  same integrated sources as the Revenues section (via the shared
  `collectRevenueItems` fan-out over Shopify/Stripe/QuickBooks/Partner), minus
  manual expense lines. **Projections**: a per-year plan (`pnlplan:<year>`, saved
  via `POST /api/admin/pnl/plan`) holds an annual target per revenue channel plus
  plan expense lines; the backend splits each annual evenly across the columns
  (month = annual/12, quarter = annual/4, year = annual) and returns it as
  `plan` on the P&L payload. The client offers an **Actuals · Plan · Variance**
  view toggle (Variance = actual − plan, aligned at each revenue channel and the
  revenue/expense/net totals; future years default to Plan). Expenses are KV
  records (`pnlexp:<id>`, editable via
  `POST /api/admin/pnl/expense{,/delete}`) with a `recurring` monthly flag or a
  one-off `month`. **Payroll** fills automatically from **Gusto** once connected:
  OAuth 2.0 at `/api/gusto/{install,callback}` (owner-only), tokens in
  `gusto:tokens` (refresh tokens ROTATE — persist both on every refresh);
  `gustoPayrollByMonth` reads processed payrolls and sums each one's
  `gross_pay + employer_taxes + benefits` bucketed by `check_date` month into a
  read-only `source:'gusto'` expense line. Creds are Cloudflare dashboard
  vars/secrets: `GUSTO_CLIENT_ID`, `GUSTO_CLIENT_SECRET`, `GUSTO_ENVIRONMENT`
  (`demo`|`production` — new apps are demo-only until Gusto approves prod). The
  `/pnl` routes are gated on `isSuperAdmin` in the worker; the P&L endpoint uses
  the same `revenueCached` SWR wrapper as the revenue endpoints
- **Admin hierarchy (4 roles)**: any `@uncap.com` Google account can sign
  in but is **Pending** (no access) until the Admin approves them into a
  role. Roles, most to least privileged: **Admin** (`SUPER_ADMIN_EMAIL` =
  `denis@uncap.com`, the only one; `isSuperAdmin`) manages users/roles and
  can do everything; **Management** (approved by Admin) has full content
  access plus delete + reopen-signed (`adminCanDelete`); **Staff**
  (approved by Admin) can create/edit/invite/view but not delete;
  **Pending** has no access. Role lives on the `adminuser:<email>` KV
  record (`role`), resolved by `getAdminRole`/`roleFromRecord` (legacy
  approved records with no role default to Staff). `SEED_MANAGEMENT`
  (`ryan@uncap.com`, `mj@uncap.com`) are auto-approved as Management and
  can't be revoked or downgraded. The worker gates every `/api/admin/*`
  route (except config/login/me/logout and the dual-auth bp-token) on
  approval, the delete/reopen endpoints on `adminCanDelete`
  (Admin+Management), and the Users endpoints on Admin only, so UI hiding
  is defense-in-depth only
- **Companies are the source of truth** for creation flows: new
  discoveries and blueprint drafts pick a portal company (never Attio
  directly; Attio is only the one-time import in Add company) and pull
  its contacts, store URL, address, palette, logo, and files. Records in
  KV: `company:<id>`, `cologo:<id>`, `cofile:<id>:<fid>`. Creating a
  discovery/blueprint back-links `discoveryHandle`/`blueprintId` onto the
  company so the portal tabs light up
- Every blueprint's public URL is `/blueprint/<id>/` (e.g.
  `/blueprint/mitutoyo/`), not its physical folder name. `worker/index.js`
  transparently rewrites `/blueprint/<id>/<rest>` to `/<dir>/<rest>`
  before handing the request to Static Assets — the physical
  `public/<Brand>/` layout is unchanged, only the public-facing URL
  differs from the folder name. `blueprint.uncap.com` stays attached to
  this same Worker purely to 301-redirect old bare `/<Brand>/` links
  (some already signed by clients) to their new `/blueprint/<id>/` home
  on `go.uncap.com`
- **Blueprints are hybrid (templated default + bespoke upgrade).** Every
  blueprint draft created from the admin gets structured proposal
  `content` on its `bp:<id>` record, drafted in the background by Claude
  (`worker/blueprint-content.js`, via the shared `worker/anthropic.js`)
  from the linked company + discovery answers. The dynamic renderer
  `public/blueprint-template/` serves it at `/<company>/blueprint` once an
  admin reviews it in the `/admin/blueprint/<id>` editor and flips
  `content.status` to `ready` (drafts stay hidden). Serving precedence is
  **bespoke wins**: `blueprintIsViewable()` and the page routes serve a
  `BLUEPRINT_REGISTRY` static page if one exists, else the templated page.
  To upgrade a client to a hand-designed page, run
  `node scripts/new-blueprint.js` (clones a brand folder) then add the
  registry row + `stamp-deploy.js` line — the same URL, portal link, and
  signature history carry over. The sign/approve flow (`/api/auth/sign`,
  `window.UncapMSA`) is shared by both tiers. Content APIs:
  `GET /api/blueprint/content`, `POST /api/admin/blueprint/{content,generate}`
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
  preview session from the `__Host-bp_admin` cookie via `/api/admin/bp-token`,
  so the team never types email codes
- Discovery experience: `public/discovery/` served at `/discovery/<handle>/`.
  10-step questionnaire over scaled artboard "scenes". CRITICAL pattern:
  every section of every scene must be click-to-highlight — coordinate
  hotspots for the plain artboards, and a `data-hotspot="<groupId>"`
  attribute on each section of the rich website-frame scenes (3-6, built by
  the scenes generator). Clicking a section spotlights it and links to its
  question group. ALWAYS tag any new/updated section this way. The `uncap`
  handle is a fixed, always-filled training demo (`DEMO_ANSWERS` in
  `worker/index.js`) — enrich only that one with example entries
- `/build` quiz: `public/build/index.html` + `public/components/QuizApp.jsx`
- Worker handles `/api/checkout/*` (Stripe SetupIntents) and
  `/api/build/session/*` (KV-backed quiz resume), then falls through to
  the static assets binding for everything else
- Production: `go.uncap.com`. Deploys run on every push to
  `main` via Cloudflare's native Workers Builds GitHub connection (the
  Worker is connected directly to this repo in the Cloudflare
  dashboard) — there is no GitHub Actions deploy workflow and no
  `CLOUDFLARE_API_TOKEN` repo secret involved
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

- **Auth gate** in `index.html`: email → 6-digit code → 2-hour token
  (bound to the client's IP + User-Agent server-side; a wrong code is
  burned after 5 tries, and request-code/verify are rate-limited),
  with `denis@uncap.com` as a no-email self-test. Team/admin access
  comes from the admin dashboard (each Gate mints a preview session from
  the `__Host-bp_admin` cookie via `/api/admin/bp-token`), not a passcode typed
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
  `files` array in `scripts/stamp-deploy.js`. The `_headers` per-brand cache
  rules are now auto-generated at deploy (stamp-deploy scans for dirs with
  `index.html` + `components/`), so no manual `_headers` edits are needed for a
  new blueprint

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
- **Inline editing is the standard**: for editable fields, use the `InlineEdit`
  component in `AdminApp.jsx` (read-as-text, click to edit, auto-save on
  blur/Enter, Esc cancels) instead of a bare `<input>` + Save button. The
  company profile is the reference implementation; new editable surfaces should
  read as a normal page, not a form
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

`go.uncap.com` is the production target. After a deploy the fast checks
are:

```bash
# Asset cache headers (should be max-age=31536000, immutable)
curl -sI https://go.uncap.com/vendor/react.production.min.js | head

# Worker still serving HTML
curl -s https://go.uncap.com/ | head -20

# A blueprint resolves under its new /blueprint/<id>/ path
curl -s -o /dev/null -w '%{http_code}\n' https://go.uncap.com/blueprint/mitutoyo/

# Old link still redirects (expect 301 -> go.uncap.com/blueprint/mitutoyo/)
curl -sI https://blueprint.uncap.com/Mitutoyo/ | head -5

# /build quiz session API
curl -s -o /dev/null -w '%{http_code}\n' \
  https://go.uncap.com/api/build/session?id=deadbeefdeadbeef
# Expect 404 (session not found) or 503 (KV missing) — both prove the
# worker is routing
```
