# Seikkailuhuone

A cosy, fully-offline **adventure-room game hub** for a 5–7-year-old (Finnish),
in the spirit of the old point-and-click Moomin games. One hub with doors to eight
little games — all **calm**: point-and-click, find, tinker. **No speed, no timers,
no flashing.** Dragons, dinosaurs, volcanos, space, potions and silly monsters, with
simple readable Finnish text (for a child learning to read) and plenty of sound.

Sibling project to [opijapelaa](https://github.com/gofjhmakit/opijapelaa) (the
learn-and-play hub); same house style and device target.

## The games
| # | Peli | What you do |
|---|------|-------------|
| 1 | **Tulivuori** | Poke a volcano until it erupts and launches a named object; 4 eruption types, day/night, a 26-object museum. |
| 2 | **Lohikäärmeen muna** | Warm a dragon egg until it hatches a random baby (216 looks); feed, pet, grow it; a kirja of every dragon. |
| 3 | **Dinon luut** | Brush sand off a buried dino skeleton; 5 dinos, surprise finds, a löytökirja. |
| 4 | **Tähtikuvio** | Connect numbered stars into 8 constellations; a star-map collection. |
| 5 | **Taikapata** | Drop ingredients in a cauldron, stir, discover reactions (36 pairs → 14 results); a reseptikirja. |
| 6 | **Salahuone** | Explore a 10-room dragon house point-and-click; find hidden star-stones. |
| 7 | **Rakettipaja** | Build a rocket and fly it to space destinations. |
| 8 | **Hassu hirviöpaja** | Mix monster parts into silly creatures with compound Finnish names and voices; a gallery. |

## Dual target (one codebase)
- **Old:** Acer Iconia B1 — Android 4.1.2, old WebKit, 512 MB RAM, weak PowerVR
  SGX531, 1024×600, offline, run from the SD card in a fullscreen WebView.
- **New:** modern desktop and mobile browsers.

Rules that keep both happy: **ES5 only**, no CSS flexbox/grid/variables, `-webkit-`
prefixes, no `classList` on SVG; all art is **inline SVG** on a fixed 1024×600 stage
scaled with `transform`; **no SVG filters/blur** (too slow on the SGX531);
**time-based animation that hard-stops when idle** (old WebView can stall rAF);
**audio = pre-baked 22 kHz PCM WAV**. See `ARCHITECTURE.md`.

## Layout
- `index.html` — the Adventure Room hub (8 doors)
- `engine/` — shared runtime: `core` (stage/tap/nav/storage), `anim` (time-based loop,
  capped particles), `audio` (WAV pools + mute), `celebrate` (confetti + praise + fanfare)
- `content/logic.js` — single-source-of-truth game DATA + pure generators (also run by the tests)
- `games/*.html` — one thin page per game (built from `*.template.html` + the design art)
- `assets/audio/` — generated sound effects · `tools/make_sound.py` regenerates them
- `tools/build_*.py` — bundle each game's design SVGs into its page
- `tests/run-tests.js` — zero-dependency node tests for the generators
- `design/<game>/` — the UX design docs + SVG art each game is built from

## Build & test
```sh
python3 tools/make_sound.py        # (re)generate assets/audio/*.wav
python3 tools/build_<game>.py      # (re)build a game page from its design art
node tests/run-tests.js            # run the generator tests
```
Open `index.html` in a browser to play.

## License
[PolyForm Noncommercial 1.0.0](LICENSE.md) — free for noncommercial use;
commercial use needs the author's permission.
