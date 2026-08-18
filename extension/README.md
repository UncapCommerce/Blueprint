# Uncap Capture (Chrome extension)

Streams the **meeting tab's audio** (the client's voice, even when you wear
headphones) into the open Uncap discovery, where it transcribes live into the
focused question alongside your own mic. The discovery page itself already
transcribes your microphone automatically; this extension adds the other side
of the call.

## Install (one time, ~30 seconds)

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and pick this `extension/` folder
4. Pin "Uncap Capture" to the toolbar (puzzle icon → pin)

## Use (during a call)

1. Have the client's discovery open at go.uncap.com (signed in as admin)
2. Switch to the **meeting tab** (Zoom / Meet / Teams running in Chrome)
3. Click the **Uncap Capture** icon once — badge shows **ON**
4. That's it. The client's speech lands in whichever open question you have
   focused on the discovery; fields auto-fill from the whole conversation
   every ~75 seconds. Click the icon again to stop (or just end the call —
   closing the meeting tab stops it too).

Badge states: **ON** capturing · **!** no discovery tab open / key minting
failed (open the discovery as admin first) · **?** you clicked the icon on
the discovery tab — click it on the meeting tab instead.

Notes: the meeting must run in a Chrome **tab** (not the desktop app) for its
audio to be capturable. The extension stores no credentials; it borrows a
2-hour transcription key minted by the discovery page's own admin session.
