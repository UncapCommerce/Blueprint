// Uncap Capture — background service worker.
//
// One click on the extension icon while on the MEETING tab starts capturing
// that tab's audio (the client's voice); a second click stops it. Audio is
// opened in an offscreen document (MV3 requirement), streamed to Deepgram
// with a short-lived key minted by the open Uncap discovery page (the
// extension itself never holds a stored secret), and every transcript
// segment is relayed into that discovery page, where it lands in the focused
// question exactly like the page's own mic transcription.

let capturing = false;      // are we currently streaming a tab?
let capturedTabId = null;   // the meeting tab
let discoveryTabId = null;  // the Uncap discovery tab segments go to

const badge = (text, color) => {
  chrome.action.setBadgeText({ text });
  if (color) chrome.action.setBadgeBackgroundColor({ color });
};

async function findDiscoveryTab() {
  // Prefer the tab that announced itself most recently; fall back to a scan.
  if (discoveryTabId != null) {
    try { await chrome.tabs.get(discoveryTabId); return discoveryTabId; } catch (_) { discoveryTabId = null; }
  }
  const tabs = await chrome.tabs.query({ url: 'https://go.uncap.com/*' });
  const disc = tabs.find((t) => /\/(discovery\/[a-z0-9-]+|[a-z0-9-]+\/discovery)/.test(t.url || ''));
  return disc ? disc.id : null;
}

async function ensureOffscreen() {
  const has = await chrome.offscreen.hasDocument();
  if (!has) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Capture the meeting tab audio and stream it for live transcription.',
    });
  }
}

async function stopCapture() {
  capturing = false;
  capturedTabId = null;
  badge('');
  try { await chrome.runtime.sendMessage({ target: 'offscreen', kind: 'stop' }); } catch (_) {}
}

chrome.action.onClicked.addListener(async (tab) => {
  if (capturing) { await stopCapture(); return; }

  const discId = await findDiscoveryTab();
  if (!discId) { badge('!', '#B5322B'); setTimeout(() => badge(''), 4000); return; }
  if (tab.id === discId) { badge('?', '#B8741F'); setTimeout(() => badge(''), 4000); return; } // click the MEETING tab, not the discovery

  // Ask the discovery page (via its content script) to mint a Deepgram key
  // with its own admin session.
  let key = '';
  try {
    const resp = await chrome.tabs.sendMessage(discId, { kind: 'mint-key' });
    key = (resp && resp.key) || '';
  } catch (_) {}
  if (!key) { badge('!', '#B5322B'); setTimeout(() => badge(''), 4000); return; }

  let streamId;
  try {
    streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
  } catch (_) { badge('!', '#B5322B'); setTimeout(() => badge(''), 4000); return; }

  await ensureOffscreen();
  discoveryTabId = discId;
  capturedTabId = tab.id;
  capturing = true;
  badge('ON', '#2F7A47');
  chrome.runtime.sendMessage({ target: 'offscreen', kind: 'start', streamId, key });
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg) return;
  // A discovery tab's content script announces itself so segment routing
  // always has a fresh target.
  if (msg.kind === 'discovery-tab' && sender.tab) { discoveryTabId = sender.tab.id; return; }
  // Transcript segments from the offscreen recorder → the discovery page.
  if (msg.from === 'offscreen' && msg.kind === 'segment' && discoveryTabId != null) {
    chrome.tabs.sendMessage(discoveryTabId, { kind: 'segment', final: !!msg.final, text: msg.text || '' }).catch(() => {});
    return;
  }
  if (msg.from === 'offscreen' && msg.kind === 'ended') { stopCapture(); }
});

// Meeting tab or discovery tab closing ends the session cleanly.
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === capturedTabId) stopCapture();
  if (tabId === discoveryTabId) discoveryTabId = null;
});
