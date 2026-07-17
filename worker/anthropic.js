// Shared Claude (Anthropic Messages API) call used by the discovery profile,
// the document pre-fill, and the blueprint content generator. Centralizes the
// model id, endpoint, headers, structured-output wiring, refusal check, and
// abort timeout so the three callers don't each re-implement it.
//
// The repo has zero npm runtime deps, so this is a thin raw-fetch wrapper.

export const AI_MODEL = 'claude-opus-4-8';

// One structured-output call. Returns the parsed JSON object matching `schema`,
// or throws (no key, network/timeout, non-2xx, refusal, unparseable). Callers
// map the throw onto their own error semantics.
//   opts: { system?, messages, schema, maxTokens?, thinking?, timeoutMs? }
export async function anthropicJson(env, { system, messages, schema, maxTokens = 16000, thinking, timeoutMs = 25000 }) {
  if (!env || !env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const body = {
      model: AI_MODEL,
      max_tokens: maxTokens,
      output_config: { format: { type: 'json_schema', schema } },
      messages,
    };
    if (system) body.system = system;
    if (thinking) body.thinking = thinking;
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`claude api ${resp.status}`);
    const data = await resp.json();
    if (data.stop_reason === 'refusal') throw new Error('claude api refusal');
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

// Build a json_schema object where every property is required and
// additionalProperties is false at each level (what Anthropic structured
// outputs expect). `shape` maps key → a JSON-schema fragment.
export function strictObject(shape) {
  return { type: 'object', properties: shape, required: Object.keys(shape), additionalProperties: false };
}
