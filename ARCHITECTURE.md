# Seikkailuhuone — architecture

A cosy offline kids' game app: one hub ("Adventure Room") with doors to 8 little
games. Finnish, for a 5–7-year-old learning to read. Calm point-and-click / find /
tinker — **no speed, no timers, no flashing**.

## Dual target (one codebase)
- **Old:** Acer Iconia B1 — Android 4.1.2, old WebKit, 512 MB RAM, weak PowerVR
  SGX531 GPU, 1024×600, offline, loaded from SD card in a fullscreen WebView.
- **New:** modern desktop/mobile browsers.

### Rules that keep both happy
- **ES5 only.** No `let`/`const`/arrow/`class`/template strings/Promise.
- **No CSS flexbox/grid, no CSS variables.** `-webkit-` prefixes on transform/transition.
- **No `classList` on SVG** (unreliable in 4.1) — use `setAttribute`.
- **All art = inline SVG** on a fixed **1024×600** logical `#stage`, scaled to fit via
  `transform: scale` (`engine/core.js` `fitStage`). Crisp + low-memory on both.
- **No SVG filters / blur / heavy masks** (murders the SGX531). Fake glows with flat
  low-opacity shapes.
- **Animation is time-based** (`Date.now` deltas) and the loop **hard-stops when idle**
  so a stalled rAF can't freeze a frame. Particle bursts are **capped (≤24)**.
- **Audio = pre-baked 22 kHz mono PCM WAV** via `tools/make_sound.py` (HTML5 Audio,
  confirmed on the device). WebAudio synth is only a dev/modern fallback.

## Layout
```
index.html            Hub: the Adventure Room, 8 doors
seikkailu.css         Shared styles (WebKit-safe)
engine/
  core.js             Seik.core: stage scaling, tap, nav, storage, SVG + back/mute buttons
  anim.js             Seik.anim: one time-based loop, tweens, capped self-cleaning Particles
  audio.js            Seik.audio: WAV pools + per-page setSounds(); synth fallback; mute
  celebrate.js        Seik.celebrate(): confetti + Finnish praise + fanfare (device-verified)
content/
  logic.js            Seik.logic: UMD single-source-of-truth DATA + pure generators (also used by tests)
games/
  <slug>.html         One thin DOM page per game (currently stubs: "Tulossa pian")
  _stub.html          Template the stubs were copied from
assets/audio/*.wav    Generated sounds (tiny)
tools/make_sound.py   Regenerate the WAVs
tests/run-tests.js    node, zero-dep; validates logic.js generators (per-game selfTest hooks)
design/<slug>/        UX designers' DESIGN.md + SVG art (input to coding; not shipped as-is)
poc/                  Original proof-of-concepts + CONCEPTS.md (reference)
review.html           The idea-review page shown to the client
```

## Adding a game
1. Put its pure data/generators in `content/logic.js` as `logic.<slug>` with a
   `selfTest(ok, eq)` hook; `tests/run-tests.js` picks it up automatically.
2. Replace `games/<slug>.html`: load `../seikkailu.css` + logic + the 4 engine files,
   build the scene from the designer's SVG, wire taps via `Seik.core.tap`, animate via
   `Seik.anim`, play sounds via `Seik.audio.play`, celebrate via `Seik.celebrate`.
3. Call `Seik.audio.setBase("../assets/audio/")` and `setSounds([...])` with only the
   sounds that page uses.
4. Add any new sounds to `tools/make_sound.py`, rerun it.
5. Mark the game ready in `index.html` (`READY` map) and drop in its real door art.
6. `node tests/run-tests.js` before shipping.

## Slugs
tulivuori · muna · luut · tahdet · taikapata · salahuone · raketti · hirviopaja
