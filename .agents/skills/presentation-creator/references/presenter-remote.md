# Optional local presenter remote

Use only for requested phone/private-note features or to preserve an existing remote. This is a standalone design guide, not a dependency on another project's implementation. Inspect the target's remote/server/tests if present. For a new remote, implement and test the contracts below in the target's structure. The bundled starter intentionally has no server, phone route, or remote startup command.

## Architecture and contracts

- Express serves built HTML with a role bootstrap; `ws` transports a validated protocol; `qrcode` produces a private pairing code.
- The display is authoritative. Phones submit allowed `next`, `previous`, `replay`, `pause`, `appendix` actions, not new positions or a second simulation.
- Share storyboard/pure navigation for titles, counters, progress, and next-cue previews. A phone route such as `/remote` is a separate responsive surface, not a scaled stage; choose the route to fit the target's router and deployment.
- Read notes server-side from the user's chosen document or store, when provided; do not assume a filename, language, or numbering scheme. Prefer stable slide IDs and validate any numbering adapter. Do not bake private notes into public HTML.

Host state:

```js
{ position: { slide, step, mode }, paused, replayToken, sceneRevision }
```

Validate bounds, modes/actions/types, nonnegative safe revisions, command IDs, and payload limits. Authenticate roles before processing messages.

A command has a unique ID and its base revision/stamp. Reject stale state, deduplicate IDs, bound in-flight work, and acknowledge only after the **React-committed display state**, including replay/reset revisions when position is unchanged.

On disconnect/backgrounding, discard queued/unconfirmed work and wait for fresh authoritative state before enabling controls. Never resend old navigation taps on reconnect. An acknowledgement timeout does not prove the action failed; ask the presenter to inspect current state.

## Security and operations

- Random high-entropy session secrets; separate display/phone roles; key rotation revokes phones; restart expires old links.
- Display/pairing management are loopback-only. Validate Host/Origin, bound payloads/connections, and debounce/rate-limit actions. Do not log secrets/notes.
- Prefer pairing URL fragments to query-string secrets in ordinary request logs. Treat QR/link as a password; pair before projecting it publicly.
- Local HTTP/WS is for a **trusted private network**. No public tunnels, port forwarding, or globally disabled firewall. Public hosting needs a separate HTTPS/WSS/authentication design.
- Fullscreen remains a local display user gesture. Do not promise remote bypasses or reliable secure-context wake lock on an ordinary HTTP phone page.
- Keep clicker/keyboard fallback and standalone file operation independent of network availability.

## Phone UX and tests

- Use `100dvh`, safe-area padding, and `min-height: 0` scroll regions.
- Large thumb-reachable Next, accessible previous/replay/pause/appendix, current/next cue, connection and confirmation feedback.
- Notes expand inside a scrollable reading area without pushing navigation offscreen. Landscape places controls alongside reading.
- Disable actions while disconnected, stale, or awaiting confirmation. Expose busy/pressed/disabled state; use a short tap guard.
- Explain waiting-for-display, expired-session, and competing-display-tab states; recover after mobile-browser backgrounding.

Test authentication, role separation, stale/double commands, post-commit acknowledgements, notes privacy, rotation, reconnect/restart, and independent display keyboard input. Include Chromium/WebKit, portrait widths 320/390px, landscape around 844px, and expanded notes.

Then rehearse on the actual display, phone, network, and projector. Browser-engine emulation is not a real-device/network test. Document and run the target application's actual server command; do not assume a `present` script exists. When operating the remote, use the served loopback page on the display, not standalone HTML.
