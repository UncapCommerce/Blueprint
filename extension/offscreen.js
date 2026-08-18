// Uncap Capture — offscreen audio pipeline.
//
// Opens the captured meeting-tab stream, plays it back through an
// AudioContext destination (tabCapture mutes the tab otherwise, and the rep
// still needs to hear the call), and streams 250ms opus chunks to Deepgram.
// Finalized/interim segments go back through the service worker to the
// discovery page.

let session = null; // { ws, recorder, ctx, stream, keepalive }

function stop() {
  const s = session;
  session = null;
  if (!s) return;
  try { clearInterval(s.keepalive); } catch (_) {}
  try { if (s.recorder && s.recorder.state !== 'inactive') s.recorder.stop(); } catch (_) {}
  try { if (s.ws && s.ws.readyState === 1) s.ws.send(JSON.stringify({ type: 'CloseStream' })); } catch (_) {}
  try { if (s.ws) s.ws.close(); } catch (_) {}
  try { s.stream.getTracks().forEach((t) => t.stop()); } catch (_) {}
  try { s.ctx.close(); } catch (_) {}
}

async function start(streamId, key) {
  stop();
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } },
    });
  } catch (_) {
    chrome.runtime.sendMessage({ from: 'offscreen', kind: 'ended' });
    return;
  }
  const ctx = new AudioContext();
  const src = ctx.createMediaStreamSource(stream);
  src.connect(ctx.destination); // keep the call audible for the rep
  const dest = ctx.createMediaStreamDestination();
  src.connect(dest);

  const recorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm;codecs=opus' });
  const ws = new WebSocket('wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true', ['token', key]);
  const s = { ws, recorder, ctx, stream, keepalive: 0 };
  session = s;

  ws.onopen = () => {
    recorder.start(250);
    s.keepalive = setInterval(() => { try { if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'KeepAlive' })); } catch (_) {} }, 8000);
  };
  recorder.ondataavailable = (e) => { try { if (e.data && e.data.size && ws.readyState === 1) ws.send(e.data); } catch (_) {} };
  ws.onmessage = (ev) => {
    let d; try { d = JSON.parse(ev.data); } catch (_) { return; }
    const alt = d.channel && d.channel.alternatives && d.channel.alternatives[0];
    const t = alt && alt.transcript ? alt.transcript.trim() : '';
    if (!t) return;
    chrome.runtime.sendMessage({ from: 'offscreen', kind: 'segment', final: !!d.is_final, text: t });
  };
  const ended = () => { if (session === s) { stop(); chrome.runtime.sendMessage({ from: 'offscreen', kind: 'ended' }); } };
  ws.onerror = ended;
  ws.onclose = ended;
  stream.getAudioTracks().forEach((tr) => { tr.onended = ended; });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || msg.target !== 'offscreen') return;
  if (msg.kind === 'start') start(msg.streamId, msg.key);
  else if (msg.kind === 'stop') stop();
});
