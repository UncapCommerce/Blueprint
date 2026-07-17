// Blueprint content generator. Turns a portal company (+ its discovery
// answers, if any) into a structured proposal that the dynamic blueprint
// template renders. Grounded in the company profile and discovery, written in
// Uncap's voice. Falls back to deterministic content when no ANTHROPIC_API_KEY
// or no discovery, so generation never hard-fails.

import { QUESTION_CATALOG } from './discovery-questions.js';
import { anthropicJson, strictObject } from './anthropic.js';

const str = { type: 'string' };
const strArr = (shape) => ({ type: 'array', items: strictObject(shape) });

// The AI writes the narrative sections; team is a fixed Uncap default the
// admin can edit (so the model never invents Uncap people).
function contentSchema() {
  return strictObject({
    headline: str,
    subhead: str,
    summary: str,
    objectives: strArr({ title: str, body: str }),
    scope: strArr({ title: str, body: str }),
    investment: strictObject({ total: str, note: str, installments: strArr({ label: str, amount: str }) }),
    timeline: strictObject({ weeks: str, note: str, phases: strArr({ name: str, weeks: str, detail: str }) }),
  });
}

const SYSTEM = 'You write a concise, credible B2B ecommerce project proposal (an Uncap "blueprint") for a prospective client, grounded strictly in their discovery answers and company profile. Be specific and concrete; never invent facts the inputs do not support; when unsure, stay general. Uncap builds on Shopify for B2B/wholesale distributors. Hard rules: never use em dashes or en dashes (use commas or periods); keep every string tight (headline under 90 chars, summary 2 to 4 sentences, each body 1 to 2 sentences); amounts as plain strings like "$50,000"; return only JSON matching the schema.';

function answersTranscript(answers) {
  if (!answers || typeof answers !== 'object') return '';
  const byId = new Map(QUESTION_CATALOG.map((q) => [q.id, q]));
  const lines = [];
  for (const [id, v] of Object.entries(answers)) {
    const q = byId.get(id);
    if (!q) continue;
    const val = Array.isArray(v) ? v.join(', ') : (v || '').toString().trim();
    if (val) lines.push(`- ${q.label}: ${val}`);
  }
  return lines.join('\n');
}

function prompt(company, answers) {
  const c = company || {};
  const transcript = answersTranscript(answers);
  return [
    `Company: ${c.name || ''}`,
    c.storeUrl ? `Website: ${c.storeUrl}` : '',
    c.description ? `What they do: ${c.description}` : '',
    c.platform ? `Current commerce platform: ${c.platform}` : '',
    c.erp ? `Current ERP: ${c.erp}` : '',
    '',
    transcript ? `Discovery answers:\n${transcript}` : 'No discovery answers are available; write a credible general proposal for their vertical.',
    '',
    'Write the blueprint proposal:',
    '- headline: the transformation in one line.',
    '- subhead: one supporting sentence.',
    '- summary: 2 to 4 sentences on where they are and what we will build.',
    '- objectives: 3 to 4 outcomes this project delivers (title + one sentence).',
    '- scope: 4 to 6 concrete workstreams we will deliver (title + one sentence).',
    '- investment: a total (e.g. "$50,000") a short note, and 2 to 3 installments that sum to the total (label + amount).',
    '- timeline: total weeks (e.g. "16 weeks"), a short note, and 3 to 5 phases (name, weeks, one-sentence detail).',
  ].filter((l) => l !== '').join('\n');
}

const DEFAULT_TEAM = [
  { name: 'Denis Dyli', role: 'Principal, Uncap' },
  { name: 'Uncap Delivery', role: 'Design, engineering & launch' },
];

// Deterministic fallback so a missing key or a refusal never blocks creation.
function deterministicContent(company) {
  const name = (company && company.name) || 'Your company';
  const plat = (company && company.platform) ? `Replatform off ${company.platform} onto Shopify` : 'Launch on Shopify';
  return {
    headline: `A commerce platform ${name} can grow on.`,
    subhead: 'A focused build that turns your catalog and accounts into a self-serve storefront.',
    summary: `This blueprint outlines how Uncap will design, build, and launch ${name}'s new commerce experience on Shopify. It is grounded in your goals and the systems you run today, with a clear scope, investment, and timeline.`,
    objectives: [
      { title: 'Self-serve storefront', body: 'Give buyers a fast way to find products, see their pricing, and order without a phone call.' },
      { title: 'Connected systems', body: 'Keep your ERP and product data in sync so inventory and pricing are always right.' },
      { title: 'A platform to grow on', body: 'Launch on a modern stack your team can extend as the business grows.' },
    ],
    scope: [
      { title: 'Discovery & design', body: 'Turn your requirements into a designed storefront and account experience.' },
      { title: plat, body: 'Stand up the store, theme, catalog, and B2B features on Shopify.' },
      { title: 'Integrations', body: 'Connect commerce to your systems of record for products, inventory, and orders.' },
      { title: 'Migration', body: 'Move products, collections, pages, and content onto the new platform.' },
      { title: 'Launch', body: 'Test, train your team, and go live with support.' },
    ],
    investment: {
      total: '$50,000',
      note: 'Fixed scope, billed across the project.',
      installments: [
        { label: 'At signing', amount: '$25,000' },
        { label: 'Midpoint', amount: '$12,500' },
        { label: 'At launch', amount: '$12,500' },
      ],
    },
    timeline: {
      weeks: '16 weeks',
      note: 'A four-month build from kickoff to launch.',
      phases: [
        { name: 'Blueprint', weeks: '2 weeks', detail: 'Align on scope, design direction, and the plan.' },
        { name: 'Design', weeks: '4 weeks', detail: 'Design the storefront and account experience.' },
        { name: 'Build', weeks: '8 weeks', detail: 'Develop the store, B2B features, and integrations.' },
        { name: 'Launch', weeks: '2 weeks', detail: 'Test, migrate, train, and go live.' },
      ],
    },
    team: DEFAULT_TEAM,
  };
}

// Strip banned dashes and collapse whitespace on every generated string.
function clean(v) {
  if (typeof v !== 'string') return v;
  return v.replace(/\s+[—–]\s+/g, ', ').replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim();
}
function deepClean(node) {
  if (typeof node === 'string') return clean(node);
  if (Array.isArray(node)) return node.map(deepClean);
  if (node && typeof node === 'object') {
    const out = {};
    for (const k of Object.keys(node)) out[k] = deepClean(node[k]);
    return out;
  }
  return node;
}

// Returns the content object (without a status; the caller sets 'draft').
export async function buildBlueprintContent(env, { company, answers }) {
  if (!env || !env.ANTHROPIC_API_KEY) return deterministicContent(company);
  try {
    const ai = await anthropicJson(env, {
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt(company, answers) }],
      schema: contentSchema(),
      maxTokens: 8000,
      timeoutMs: 60000,
    });
    return { ...deepClean(ai), team: DEFAULT_TEAM };
  } catch (_) {
    return deterministicContent(company);
  }
}

export { deterministicContent };
