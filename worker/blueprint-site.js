// Blueprint Template wireframe copy. Reads the company's live website and has
// Claude lift the words the Commerce and Content wireframes show (navigation,
// categories, real product names and prices, hero, brand story, guides), so a
// new Template-based blueprint opens already looking like the client's store.
// Grounded only in the fetched pages and the company profile; anything the
// site doesn't show is left blank and the page falls back to neutral defaults.

import { anthropicJson, strictObject } from './anthropic.js';
import { answersTranscript } from './blueprint-content.js';

const str = { type: 'string' };
const strs = { type: 'array', items: str };
const pairs = { type: 'array', items: { type: 'array', items: str } };

function siteSchema() {
  return strictObject({
    announcement: str,
    nav: strs,
    mega: { type: 'array', items: strictObject({ h: str, items: strs }) },
    featured: strs,
    hero: strictObject({ eyebrow: str, title: str, titleSerif: str, cta: str }),
    finder: strs,
    brands: strs,
    products: { type: 'array', items: strictObject({ name: str, price: str }) },
    pdp: strictObject({ sub: str, specs: pairs, why: strs }),
    trust: strs,
    review: str,
    story: str,
    est: str,
    about: strictObject({ eyebrow: str, title: str, titleSerif: str, location: str, manifesto: str, stats: pairs }),
    blog: strictObject({ tag: str, featured: str, articles: strs }),
    searchExample: str,
    erp: str,
    platform: str,
  });
}

const SYSTEM = 'You extract the real wording of a company\'s ecommerce website so a proposal can show wireframes of their future Shopify store in their own words. Use only words, categories, products, and prices that appear in the provided pages or company profile; never invent products, prices, brands, certifications, or numbers. When something is not present, return an empty string or an empty array. Keep labels short (navigation and menu items 1 to 3 words; product names under 40 characters). Never use em dashes or en dashes. Return only JSON matching the schema.';

const MAX_HTML = 400000;
const MAX_TEXT = 14000;

function siteOrigin(raw) {
  const v = (raw || '').toString().trim();
  if (!v) return '';
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname) ? `https://${u.hostname}` : '';
  } catch { return ''; }
}

async function fetchHtml(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const resp = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; UncapBlueprint/1.0)', accept: 'text/html' } });
    if (!resp.ok || !/html/i.test(resp.headers.get('content-type') || '')) return '';
    return (await resp.text()).slice(0, MAX_HTML);
  } catch { return ''; } finally { clearTimeout(timer); }
}

// Storefront platform from the page source, for the Migration "from" label.
function detectPlatform(html, origin) {
  const h = html || '';
  if (/cdn\.shopify\.com|Shopify\.theme/i.test(h)) return 'Shopify';
  if (/bigcommerce\.com/i.test(h)) return 'BigCommerce';
  if (/woocommerce/i.test(h)) return 'WooCommerce';
  if (/Magento|mage\/cookies|\/static\/version\d+/i.test(h)) return 'Magento';
  if (/cyberstore/i.test(h) || /cyberstore/i.test(origin)) return 'CyberStore';
  if (/SuiteCommerce|\/ssp\//i.test(h)) return 'NetSuite SuiteCommerce';
  if (/wix\.com|wixstatic/i.test(h)) return 'Wix';
  if (/squarespace/i.test(h)) return 'Squarespace';
  return '';
}

const decode = (t) => t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// Readable page text plus its link labels (menus carry the category names).
function pageText(html) {
  const body = html.replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, ' ');
  const title = (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const desc = (body.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || '';
  const links = [...new Set([...body.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((m) => decode(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim())
    .filter((t) => t && t.length <= 40))].slice(0, 160);
  const text = decode(body.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  return `TITLE: ${decode(title).trim()}\nDESCRIPTION: ${decode(desc).trim()}\nLINKS: ${links.join(' | ')}\nTEXT: ${text}`;
}

// First same-site link that looks like an about/story page.
function aboutUrl(html, origin) {
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = m[2].replace(/<[^>]+>/g, ' ').toLowerCase();
    if (!/about|our story|who we are|company/.test(label) && !/about/.test(m[1])) continue;
    try {
      const u = new URL(m[1], origin);
      if (u.origin === origin) return u.toString();
    } catch { /* skip */ }
  }
  return '';
}

// Returns the site object for bp.site, or null when the site can't be read or
// Claude isn't configured (the page then shows its neutral defaults).
export async function buildBlueprintSite(env, { company, answers }) {
  const c = company || {};
  const origin = siteOrigin(c.storeUrl);
  const home = origin ? await fetchHtml(origin) : '';
  const about = home ? aboutUrl(home, origin) : '';
  const aboutHtml = about ? await fetchHtml(about) : '';
  const detected = detectPlatform(home, origin);
  if (!home && !c.description) return null;

  const pages = [home && `HOMEPAGE (${origin})\n${pageText(home)}`, aboutHtml && `ABOUT PAGE (${about})\n${pageText(aboutHtml)}`]
    .filter(Boolean).join('\n\n').slice(0, MAX_TEXT);
  const transcript = answersTranscript(answers);
  const content = [
    `Company: ${c.name || ''}`,
    c.description ? `What they do: ${c.description}` : '',
    c.address ? `Address: ${c.address}` : '',
    c.erp ? `Current ERP: ${c.erp}` : '',
    (c.platform || detected) ? `Current storefront platform: ${c.platform || detected}` : '',
    transcript ? `Discovery answers (use only to identify the ERP and platform):\n${transcript.slice(0, 3000)}` : '',
    '',
    pages || 'The website could not be read; fill only what the company profile supports.',
    '',
    'Fill the wireframe copy:',
    '- announcement: their real promo/announcement bar line, or a short factual line about them (e.g. "Serving the industry since 1977").',
    '- nav: 4 to 5 top-level menu labels from their site.',
    '- mega: exactly 3 menu groups, each a heading (h) and 4 sub-category labels from their site.',
    '- featured: 3 short featured links (e.g. a flagship product line, "Download Catalog").',
    '- hero: eyebrow (short tag line), title + titleSerif (a 2 to 4 word headline split in two halves), cta (button label, 2 to 3 words).',
    '- finder: 3 labels a buyer filters by on their site (e.g. Manufacturer, Category, Model).',
    '- brands: up to 6 brand or manufacturer names they sell or serve, if listed.',
    '- products: 6 to 8 real product names from their site, with the price exactly as shown, or an empty price when none is shown.',
    '- pdp: for the first product, sub (a short variant/size line), specs (4 [label, value] pairs from the site), why (3 short reasons to buy grounded in the site).',
    '- trust: 3 short trust badges they claim (certifications, shipping, years).',
    '- review: a short customer-style quote only if the site shows a testimonial, else empty.',
    '- story: one sentence brand story in their words. est: e.g. "EST. 1977" if a founding year is stated, else empty.',
    '- about: eyebrow (e.g. "EST. 1977 · CITY, ST"), title + titleSerif (a headline split in two), location, manifesto (their mission line), stats (3 [value, label] pairs stated on the site).',
    '- blog: tag (e.g. "GUIDES · 5 MIN"), featured (a guide title fitting their catalog), articles (3 guide titles fitting their catalog).',
    '- searchExample: a natural-language query a buyer would type on their site.',
    '- erp: the ERP name if known from the profile or discovery, else empty. platform: the current storefront platform if known, else empty.',
  ].filter((l) => l !== '').join('\n');

  try {
    const site = await anthropicJson(env, { system: SYSTEM, messages: [{ role: 'user', content }], schema: siteSchema(), maxTokens: 4000, timeoutMs: 45000 });
    if (!site.erp && c.erp) site.erp = c.erp;
    if (!site.platform) site.platform = c.platform || detected;
    return site;
  } catch {
    return (c.erp || c.platform || detected) ? { erp: c.erp || '', platform: c.platform || detected } : null;
  }
}
