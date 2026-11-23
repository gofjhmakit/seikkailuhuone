# 02 · Lohikäärmeen muna — DESIGN

*Game UX Designer B · design + content + SVG art. Logic/HTML/animation are the lead
engineer's. Same shared rules, palette, perf caps, 1024×600 stage, inline-SVG, no-flash /
no-speed / no-lose, simple Finnish as rounds 1–2.*

Warm a dragon egg with your hands until it hatches — and you never know which baby comes out.
Then a cosy, open-ended **care loop**: feed it readable foods, pet it, watch it chomp, puff a
little flame, burp ("hik!"), play, sleep and grow a little. Nothing can go wrong, nothing is
timed. Every hatch is a surprise (random colour + features + name), and each one is saved in
your **lohikäärmekirja** — gentle reading and endless replay.

The POC (`poc/02-lohikaarmeen-muna.html`): tap egg → cracks → one fixed purple dragon → feed.
This randomises the dragon, adds a real care loop, foods, states, and a collection.

---

## 1. Core loop (expanded)

**EGG phase**
1. **Stroke/tap the egg.** A warm glow pulses (soft, no flash), the egg gives a tiny wobble,
   a `lampo` warm tone rises. Every couple of taps a new **crack stage** appears (opacity
   stages 1→5), with a soft `naks`.
2. At the last stage the egg **halkee** (splits): shell halves fall aside, and a **random baby
   dragon** pops up with a cute little `karjaisu` and a flame `puff`. **Celebrate** (confetti +
   praise + fanfare), and it's added to the **kirja**.

**CARE phase** (self-paced, no fail, no timer)
3. **Pet** (tap the dragon): it leans into it, hearts float up, a `kehraa` purr, tail wags.
4. **Feed** (tap a food on the tray): the food hops to its mouth, it **chomps** (`nam`) and
   **puffs** a flame; every few feeds a funny **burp** (`hik`) with a pink puff.
5. Gentle **states** the child triggers or that drift in: **leikkii** (idle bob), **nukkuu**
   (sleep, zzz — tap to wake), **kasvaa** (after some feeds it grows a touch, proud puff +
   sparkle). It never leaves or dies.
6. **uusi muna** lays a fresh egg (optional second nest for twins) → hatch another, surprise
   again. Browse the **lohikäärmekirja** any time.

Replay = random hatch (216 looks × names) + collecting them + the cosy care. No levels/scores.

---

## 2. Screens / states + transitions (calm)

- **A · Pesä (nest):** cosy cave + warm nest in the centre. Egg sits in it (then the dragon).
  Foods on a little tray (bottom). Buttons: **koti** (top-left), **kirja** (top-right),
  **uni** (sleep toggle), **uusi muna** (new egg). Pet by tapping the dragon.
- **B · Lohikäärmekirja (collection):** a warm book/shelf of hatched dragons — each a little
  portrait with its **name** and **colour word** (punainen, vihreä…). **takaisin** returns.

Transitions: 250 ms cross-fade. Egg wobble, hatch scale-up (soft `cubic-bezier` pop), dragon
idle bob, food hop, grow — all soft easing, **no flash/blink/strobe**. The warm glow fades
gently (opacity ease), never pulses harshly. Nothing loops forever (bounded, hard-stopped).

---

## 3. Every interaction — tap → result (visual + sound + Finnish)

| Child taps | Visual | Sound | Finnish text |
|---|---|---|---|
| the **egg** (not last stage) | warm glow, wobble, next crack stage shows | `lampo` + `naks` | `lämmintä! jatka vielä` |
| the **egg** (last stage) | egg splits, **random dragon** pops up, celebrate | `halkee` + `karjaisu` + `fanfaari` | `se kuoriutui!` → `Uusi lohikäärme!` |
| the **dragon** (pet) | leans, hearts float, tail wags | `kehraa` purr | `silitä vaan!` |
| a **food** on the tray | food hops to mouth, chomp + flame puff | `nam` (+ `liekki`) | `nam nam! <ruoka>` |
| food, every ~4th | pink puff, little hop | `hik` burp | `hik! pikku röyhtäys` |
| **uni** (sleep toggle) | eyes close, zzz bubbles; tap again/anywhere wakes | `uni` → `heraa` | `nukkuu…` / `heräsi!` |
| after N feeds (auto) | dragon **grows** a touch, sparkle, proud puff | `kasva` sparkle | `se kasvaa!` |
| **uusi muna** | dragon hops to the kirja, fresh egg appears | `pop` | `uusi muna!` |
| **kirja** button | cross-fade to collection | `naps` | `lohikäärmekirja` |
| a kirja **portrait** | lifts, name + colour word big | `naps` | `<nimi> · <väri>` |
| **koti** | return to hub | `naps` | — |

Idle gags (engine, gentle): the baby occasionally **sneezes** a tiny puff, or the egg (before
hatch) **wobbles by itself** to tease.

---

## 4. Dragon variants (the surprise) — 8 colours × 3 horns × 3 wings × 3 patterns = 216 looks

One cute baby-dragon shape, composed from swappable groups and recoloured by a **colour
scheme**. The engine picks all four at random on each hatch, plus a **name** from the pool.

### Colour schemes (class-based recolour)
Shapes carry classes `d-main`, `d-belly`, `d-dark`; the engine sets fill (+ darker outline)
per scheme. Eyes stay white with ink pupils. Default baked scheme = **turkoosi**.

| väri (colour word) | d-main | d-belly | d-dark / outline |
|---|---|---|---|
| **punainen** | lava `#e8452f` | ember `#ff8a4c` | `#a82e1e` |
| **oranssi** | ember `#ff8a4c` | gold `#ffd264` | `#c75a2a` |
| **keltainen** | gold `#ffd264` | cream `#fff7e6` | `#c9922f` |
| **vihreä** | leaf `#3aa64a` | parchment `#f3e7cc` | `#2b7d39` |
| **turkoosi** | teal `#46c4a8` | star `#cfe8ff` | `#2e8a76` |
| **sininen** | sky `#7cc0ff` | star `#cfe8ff` | `#3f84c4` |
| **valkoinen** | cream `#fff7e6` | parchment `#f3e7cc` | `#d9c89a` |
| **kulta** | amber `#ffb43d` | gold `#ffd264` | `#c77f1e` |

### Feature groups (species flavour)
- **Horns (3):** `horn-sarvet` (curved pair), `horn-piikit` (straight spikes), `horn-nuppu`
  (round knobs on stems). Attach at crown anchors (126,98) & (174,98).
- **Wings (3):** `wing-nahka` (leathery bat), `wing-hoyhen` (feathered), `wing-pikku` (tiny
  stubby). Attach behind body at shoulders (95,195) & (205,195).
- **Patterns (3):** `pat-silea` (none), `pat-pilkut` (spots), `pat-raidat` (stripes). Overlay
  on the body/belly.

### Name pool (short, readable Finnish) — 14
Roihu, Liekki, Tuli, Pörö, Nuppu, Köpi, Riku, Pulla, Myrsky, Tähti, Pilvi, Nalle, Vilkku,
Tassu. The kirja shows **name + colour word** (e.g. *"Roihu · punainen"*).

---

## 5. Foods (reading practice) — 6 · `art/foods.svg`

Each a small sprite (shared box `0 0 80 80`, centred (40,40)) on the tray, with its readable
name. Tapping one feeds the dragon.

| id | nimi | what |
|---|---|---|
| food-liha | **liha** | meat drumstick |
| food-kala | **kala** | fish |
| food-marja | **marja** | berry |
| food-keksi | **keksi** | cookie |
| food-leipa | **leipä** | bread loaf |
| food-omena | **omena** | apple |

Any food is always welcomed (no wrong answers). `marja` triggers a pink hiccup more often (gag).

---

## 6. Care states (gentle, no fail)

| state | look | trigger |
|---|---|---|
| **leikkii** | soft idle bob, blink, tail sway | default |
| **silitetään** | leans, hearts, tail wag | child pets (taps dragon) |
| **syö** | chomp + flame puff | child feeds |
| **nukkuu** | eyes closed, `zzz` bubbles, tiny snore | child taps **uni** |
| **kasvaa** | scales up a notch, sparkle, proud puff | automatically after N feeds |

States are moods, not a tamagotchi meter — the dragon is always happy and safe.

---

## 7. Lohikäärmekirja (collection) — replay without scores

- `art/kirja.svg`: a warm book/shelf with **12 portrait slots**. Each hatched dragon fills the
  next slot: a mini portrait (its colour + features) + its **name** + **colour word**.
- Gentle line *"N lohikäärmettä"* — a count, never a score.
- Tap a portrait to read its name/colour big. Ring-buffer the 12 most recent (or scroll).
- Replay engine: 216 looks × 14 names → every hatch feels new; "collect different colours" is
  a calm open goal. No timers/levels.

Persistence: `localStorage` if the 4.1 WebView allows; else per-session (hatching still
celebrates and shows in the kirja for the session).

---

## 8. Audio cue list (small reusable set · 22050 Hz PCM WAV)

| name | one-line description |
|---|---|
| `lampo` | pehmeä nouseva lämmin "hmm" — joka munan silityksestä (pitch rises with taps) |
| `naks` | pieni rapsahdus — uusi säröstage ilmestyy |
| `halkee` | isompi kuoren rsahdus/napsaus — muna halkeaa |
| `karjaisu` | söpö pieni karjahdus/piipitys — vauva kuoriutuu (ei pelottava) |
| `liekki` | pehmeä liekkipuff-henkäys — tulihönkäys |
| `nam` | napsiva maiskautus — syöminen |
| `hik` | hassu nouseva "hik" — röyhtäys |
| `kehraa` | pehmeä hyrinä — silittäminen |
| `kasva` | lempeä kimallehelinä — kasvaa |
| `uni` / `heraa` | pehmeä laskeva uni-ääni / pieni nouseva herätys |
| `fanfaari` | = jaettu `success.wav` — kuoriutumisen juhla |

Small & reusable: one egg/warm family, hatch (halkee+karjaisu), care (nam/hik/kehraa/liekki),
sparkle/sleep, shared fanfare.

---

## 9. Funny beats (specific gags)

- **Surprise hatch.** You never know the colour/features/name — the reveal is the joke & joy.
- **"hik!" burp** every few feeds, with a pink flame puff.
- **Berry hiccups.** `marja` makes it hiccup pink more often.
- **Sneeze.** Idle, it occasionally sneezes a tiny puff and looks surprised.
- **Teasing egg.** Before hatch the egg sometimes wobbles on its own.
- **Petting roll.** Pet it enough and it happily tips over, legs up, tail wagging.
- **Startled wake.** Tapping a sleeping dragon wakes it with a cute squeak and wide eyes.
- **Twins.** A second egg can hatch a different-coloured sibling beside the first.

---

## 10. Success / celebrate moments

The celebrate is **hatching** (and **kasvaa**): shared `celebrate()` (≤24-particle confetti
burst, rotating Finnish praise banner, `success.wav`) + the baby popping up and sliding into
its kirja slot, banner reading **"Uusi lohikäärme!"** / **"Hieno!"**. Always reachable by just
warming an egg; it rewards care and discovery, never winning.

---

## 11. Hub door

`art/door.svg` (viewBox `0 0 240 240`): wood-framed night tile (matching the set) with a chunky
**dragon egg in a nest**, a tiny crack and a warm glow behind it, plus a little star —
instantly "the dragon-egg game" to a 5-year-old. Flat fills, thick rounded outlines, palette
only, no filters.

---

## 12. Performance budget (within device caps)

- **scene.svg** (nest cave) ≈ 45 nodes; one `linearGradient` (`cave` back wall) only — the
  single gradient in the scene; the hearth glow is a low-opacity **solid**.
- **Assembled dragon** worst case ≈ 30 nodes (base ~18 + wings ~4 + horns ~4 + pattern ~5 +
  hidden puff/zzz/heart overlays). Scene + dragon ≈ 75 nodes — well under the ~160 cap.
- **egg.svg** ≈ 20 nodes (body + speckles + 5 crack paths + 2 shell halves).
- **foods.svg** 6 sprites (~5 nodes each); only the tray row is shown (~30 nodes), fine.
- **kirja.svg** book frame ≈ 25 nodes; engine clones up to 12 mini dragon portraits
  (~12 × ~12 = ~145) only on that screen, which has nothing else — acceptable; page 6+6 if a
  scroll frame hitches on the SGX531.
- **No filters, no feGaussianBlur, no masks, no blurred shadows.** Warm glow & embers are
  low-opacity solid shapes. Flame puff is ≤3 solid circles; any particle burst is canvas, ≤24,
  time-based, hard-cleared.
- Animation is the engine's and bounded (egg wobble, crack stages, hatch pop, idle bob, food
  hop, puff, grow, sleep). No infinite rAF.
- **Flag:** only the **kirja screen** approaches the cap (12 portraits). Static screen, no
  particles — fine; page it if needed. Nothing else is a concern (this game is light).
