// Pre-fill discovery answers from an uploaded client document (RFP,
// requirements brief, partner notes). PDFs go to Claude natively as a
// document block; .docx files are unzipped in the worker and their text
// extracted; plain text passes through. Claude maps the content onto the
// question catalog with a structured-output schema so chip answers always
// match a real option. Called synchronously from the new-discovery modal,
// which shows an "analyzing" state while this runs.

import { QUESTION_CATALOG } from './discovery-questions.js';

const AI_MODEL = 'claude-opus-4-8';

export function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Minimal zip reader, enough for .docx: walk the central directory to find
// word/document.xml, inflate it with DecompressionStream, strip the XML.
// Central-directory sizes are reliable even when local headers defer to
// data descriptors, which is why we read from there.
async function docxToText(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  const min = Math.max(0, bytes.length - 65558);
  for (let i = bytes.length - 22; i >= min; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw httpErr(400, 'That file does not look like a valid .docx document.');
  const count = dv.getUint16(eocd + 10, true);
  let off = dv.getUint32(eocd + 16, true);
  let entry = null;
  const td = new TextDecoder();
  for (let n = 0; n < count; n++) {
    if (dv.getUint32(off, true) !== 0x02014b50) break;
    const method = dv.getUint16(off + 10, true);
    const compSize = dv.getUint32(off + 20, true);
    const nameLen = dv.getUint16(off + 28, true);
    const extraLen = dv.getUint16(off + 30, true);
    const commentLen = dv.getUint16(off + 32, true);
    const localOff = dv.getUint32(off + 42, true);
    const name = td.decode(bytes.subarray(off + 46, off + 46 + nameLen));
    if (name === 'word/document.xml') { entry = { method, compSize, localOff }; break; }
    off += 46 + nameLen + extraLen + commentLen;
  }
  if (!entry) throw httpErr(400, 'Could not find the document body inside that .docx.');
  if (dv.getUint32(entry.localOff, true) !== 0x04034b50) throw httpErr(400, 'That .docx file appears corrupt.');
  const lNameLen = dv.getUint16(entry.localOff + 26, true);
  const lExtraLen = dv.getUint16(entry.localOff + 28, true);
  const dataStart = entry.localOff + 30 + lNameLen + lExtraLen;
  const comp = bytes.subarray(dataStart, dataStart + entry.compSize);
  let xmlBytes;
  if (entry.method === 0) {
    xmlBytes = comp;
  } else if (entry.method === 8) {
    const stream = new Blob([comp]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    xmlBytes = new Uint8Array(await new Response(stream).arrayBuffer());
  } else {
    throw httpErr(400, 'That .docx uses an unsupported compression method.');
  }
  return td.decode(xmlBytes)
    .replace(/<w:tab[^>]*\/>/g, '\t')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(+n); } catch { return ' '; } })
    .replace(/[  ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function httpErr(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function prefillSchema() {
  const props = { skuCountExact: { type: 'string' } };
  for (const q of QUESTION_CATALOG) {
    if (q.type === 'chips') props[q.id] = { type: 'string', enum: [...q.options, ''] };
    else if (q.type === 'chips-multi') props[q.id] = { type: 'array', items: { type: 'string', enum: q.options } };
    else props[q.id] = { type: 'string' };
  }
  return { type: 'object', properties: props, required: Object.keys(props), additionalProperties: false };
}

function prefillPrompt() {
  const lines = QUESTION_CATALOG.map((q) => {
    const kind = q.type === 'chips'
      ? `one of: ${q.options.join(' | ')} (or "" when the document does not say)`
      : q.type === 'chips-multi'
        ? `array from: ${q.options.join(' | ')} ([] when the document does not say)`
        : 'free text ("" when the document does not say)';
    return `- ${q.id} · ${q.step} · ${q.label} → ${kind}`;
  }).join('\n');
  return 'Read the attached client document (an RFP, requirements brief, or partner notes) and pre-fill our ecommerce discovery questionnaire from it.\n\n'
    + 'Answer ONLY from the document. Leave a field empty ("" or []) when the document does not address it: never guess or pad. '
    + 'Write free-text answers concisely in the client\'s own terms, as answers the client would give. '
    + 'For chip fields pick the single closest option only when the document clearly supports it.\n\nQuestions:\n' + lines
    + '\n- skuCountExact · Meta · The exact total SKU/product count, ONLY if the document states one explicitly → digits with separators as written (e.g. "48,000"), or "" when not stated';
}

// Returns { qid: value } for every question the document answered.
export async function prefillAnswersFromDoc(env, doc) {
  if (!env || !env.ANTHROPIC_API_KEY) throw httpErr(503, 'Document analysis needs the ANTHROPIC_API_KEY secret in the Cloudflare dashboard.');
  const type = ((doc && doc.type) || '').toString().toLowerCase();
  const name = ((doc && doc.name) || '').toString().toLowerCase();
  const data = ((doc && doc.data) || '').toString();
  if (!data) throw httpErr(400, 'No document received.');
  if (data.length > 14_000_000) throw httpErr(400, 'Document must be under 10 MB.');

  let content;
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    content = [
      { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } },
      { type: 'text', text: prefillPrompt() },
    ];
  } else if (name.endsWith('.docx') || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const text = await docxToText(b64ToBytes(data));
    if (text.length < 40) throw httpErr(400, 'Could not read any text out of that document.');
    content = [{ type: 'text', text: `${prefillPrompt()}\n\n--- DOCUMENT (${name || 'upload'}) ---\n${text.slice(0, 300_000)}` }];
  } else if (type === 'text/plain' || name.endsWith('.txt') || name.endsWith('.md')) {
    const text = new TextDecoder().decode(b64ToBytes(data));
    content = [{ type: 'text', text: `${prefillPrompt()}\n\n--- DOCUMENT ---\n${text.slice(0, 300_000)}` }];
  } else if (name.endsWith('.doc')) {
    throw httpErr(400, 'Legacy .doc files are not supported. Save it as .docx or PDF and try again.');
  } else {
    throw httpErr(400, 'Upload a PDF or Word (.docx) document.');
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 120_000);
  let resp;
  try {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 16000,
        thinking: { type: 'adaptive' },
        output_config: { format: { type: 'json_schema', schema: prefillSchema() } },
        messages: [{ role: 'user', content }],
      }),
    });
  } catch (e) {
    throw httpErr(502, 'Document analysis timed out or failed to reach the model.');
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) throw httpErr(502, `Document analysis failed (Claude API ${resp.status}).`);
  const out = await resp.json().catch(() => ({}));
  if (out.stop_reason === 'refusal') throw httpErr(502, 'The model declined to analyze this document.');
  const text = (out.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw httpErr(502, 'Document analysis returned an unreadable result.'); }

  const answers = {};
  for (const q of QUESTION_CATALOG) {
    const v = parsed[q.id];
    if (Array.isArray(v)) {
      const arr = v.filter((x) => typeof x === 'string' && x.trim());
      if (arr.length) answers[q.id] = arr;
    } else if (typeof v === 'string' && v.trim()) {
      answers[q.id] = v.trim();
    }
  }
  const rawCount = typeof parsed.skuCountExact === 'string' ? parsed.skuCountExact.trim() : '';
  const skuCount = /^[\d][\d,.]{0,11}\+?$/.test(rawCount) ? rawCount : '';
  return { answers, skuCount };
}
