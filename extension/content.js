// Uncap Capture — content script on go.uncap.com.
//
// Bridges the extension and the discovery page: announces discovery tabs to
// the service worker, relays transcript segments into the page (where they
// are handled exactly like the page's own mic transcription), and forwards
// the page-minted Deepgram key back to the extension. The page mints the key
// with its own admin session, so the extension holds no secrets.

const IS_DISCOVERY = /\/(discovery\/[a-z0-9-]+|[a-z0-9-]+\/discovery)/.test(location.pathname);

if (IS_DISCOVERY) {
  try { chrome.runtime.sendMessage({ kind: 'discovery-tab' }); } catch (_) {}
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      try { chrome.runtime.sendMessage({ kind: 'discovery-tab' }); } catch (_) {}
    }
  });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg) return;
  if (msg.kind === 'segment') {
    window.postMessage({ source: 'uncap-capture', kind: msg.final ? 'final' : 'interim', text: msg.text || '' }, location.origin);
    return;
  }
  if (msg.kind === 'mint-key') {
    // Ask the page to mint a Deepgram key; it answers via postMessage.
    const onKey = (ev) => {
      if (ev.source !== window || !ev.data || ev.data.source !== 'uncap-page' || ev.data.kind !== 'key') return;
      window.removeEventListener('message', onKey);
      clearTimeout(timer);
      sendResponse({ key: ev.data.key || '' });
    };
    const timer = setTimeout(() => { window.removeEventListener('message', onKey); sendResponse({ key: '' }); }, 8000);
    window.addEventListener('message', onKey);
    window.postMessage({ source: 'uncap-capture', kind: 'mint-key' }, location.origin);
    return true; // async sendResponse
  }
});
