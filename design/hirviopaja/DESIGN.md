# 08 · Hassu hirviöpaja — DESIGN

*Game UX Designer B · design + content + SVG art. Logic/HTML are the lead engineer's.*

A cosy monster workshop. The child mixes **head + body + tail** (and now also
**wings, horns, legs, patterns and hats**) to build a silly creature that gets its own
**compound name** (e.g. *liekkipötköpiikki*) and its own silly **3-note voice**. No goal,
no timer, no way to lose — pure "mitä jos vaihdan tämän?" tinkering, in the Moomin
storybook warmth of the shared app.

The POC (`poc/08-hassu-hirviopaja.html`) had 4 heads / 4 bodies / 4 tails and three
arrow pairs. This expands it a LOT while staying calm and light.

---

## 1. Expanded concept — "more to do" vs the POC

| | POC | This build |
|---|---|---|
| Slots | head, body, tail | head, body, tail, **wings, horns, legs, pattern, hat** (8 slots) |
| Parts | 4 + 4 + 4 = 12 | **8 heads, 8 bodies, 8 tails, 6 wings, 6 horns, 6 legs, 6 patterns, 6 hats** (+ "none" on wings/horns/pattern/hat) |
| Core combos | 4×4×4 = 64 | 8×8×8 = **512 core**, ×(7 wings ×7 horns ×6 legs ×7 patterns ×7 hats) = **hundreds of thousands** |
| Name | 3 fixed pieces | compound generator, 24 core pieces + optional prefix (readable, capped) |
| Voice | 3 notes | 3-note voice, per-part pitch table + optional wing/horn flourish |
| Surprise | randomise h/b/t | **yllätys** randomises every slot, with a gentle wobble + voice |
| Keep it | — | **tallenna** → save to a **galleria** of named monsters (reading practice!) |
| Dress-up | — | **patterns** (spots/stripes/stars…) + **hats** (top hat, crown, flower…) |

New things the child can DO: pick 8 kinds of parts instead of 3, dress the monster with a
pattern and a hat, press **yllätys** for a random beast, press **huuda** to hear its voice,
tap the monster itself to make it shout and hop, and **tallenna** favourites into a gallery
they can browse and re-open. Replay comes from the combinatorics, the funny names, the funny
voices and the gallery — never from levels or speed.

---

## 2. Screens / states + transitions (all calm)

**A. Paja (workshop)** — the main screen. Monster stands on a little stage in the centre.
Slot controls (label + ‹ › arrows) line the left and right edges; pattern + hat cyclers and
the big action buttons sit along the bottom; a small **koti** (home) button top-left returns
to the hub. Title top-centre, one short hint line under it.

**B. Galleria** — a grid of saved monsters as little framed portraits, each with its name
underneath. Tap a portrait → it gently enlarges; **"ota tämä"** loads it back into the paja;
**"takaisin"** returns. Empty state: one friendly line *"Ei vielä otuksia. Tee ja tallenna!"*.

Transitions: gentle 250 ms cross-fade / slide between paja and galleria. **No flash, no
blink.** A part swap is a quick scale "pop" (1.0 → 1.06 → 1.0, ~130 ms ease-out) on the
monster group — the only motion on a tap. Nothing loops forever.

```
   HUB door ──tap──▶  PAJA  ◀──"takaisin"──  GALLERIA
                       │  ▲                     ▲
                 "galleria"│                    │
                       └───┘   "tallenna" ──────┘ (save + celebrate, stay in paja)
   PAJA ──"koti"──▶ HUB
```

---

## 3. Every interaction — tap → result (visual + sound + Finnish text)

| Child taps | Visual | Sound | Finnish text shown |
|---|---|---|---|
| ‹ / › on **PÄÄ** | head swaps, monster pops | `naps` then `pulp` | hint: `vaihda pää!` → name updates |
| ‹ / › on **KEHO** | body swaps, pops | `naps`+`pulp` | `vaihda keho!` |
| ‹ / › on **HÄNTÄ** | tail swaps, pops | `naps`+`pulp` | `vaihda häntä!` |
| ‹ / › on **SIIVET** | wings swap (incl. *ei siipiä*), pops | `naps`+`pulp` | `siivet!` |
| ‹ / › on **SARVET** | horns swap (incl. *ei sarvia*), pops | `naps`+`pulp` | `sarvet!` |
| ‹ / › on **JALAT** | legs swap, pops | `naps`+`pulp` | `jalat!` |
| **KUVIO** cycler | pattern swaps (incl. *sileä*) | `naps` | `kuvio!` |
| **HATTU** cycler | hat swaps (incl. *paljas pää*) | `naps` | `hattu!` |
| **HUUDA** button | monster hops once; mouth part may open (engine) | **voice** (3 notes) | `se ääntelee!` |
| the **monster** itself | hops once | **voice** | `huu!` |
| monster, 5th tap in a row | bigger silly wobble | voice + `pöö!` easter-egg blip | `pöö!` |
| **YLLÄTYS** button | every slot randomises, monster wobbles | `taika` + voice | `yllätys-otus!` |
| **TALLENNA** button | portrait flies to gallery; **celebrate** | `tallenna` + `fanfaari` | `Hieno otus!` (praise banner) |
| **GALLERIA** button | cross-fade to gallery grid | `naps` | `galleria` |
| a gallery portrait | portrait enlarges | `naps` | the monster's name, big |
| **OTA TÄMÄ** (gallery) | loads monster into paja, cross-fade | `pulp` | `vaihda osia nuolista` |
| **KOTI** button | return to hub | `naps` | — |

After every slot change the **name** (big, yellow, centred under the title) and the stored
**voice pitches** update instantly.

---

## 4. CONTENT — all parts, names, voices (explicit lists, simple Finnish)

Each part has: a short readable **name piece** (for the compound name) and a **voice
value**. Colours are palette hex, baked into the SVG. The voice plays three notes in order:
**head-note (sawtooth, ~0.18 s, slides down) → body-note (triangle, ~0.20 s, slides up) →
tail-note (square, ~0.22 s, slides down)**. Only the frequency changes per part; the timbre
is fixed per slot (reusable, small). Values are gentle and pentatonic-ish so random combos
never sound harsh.

### HEADS (8) — `head-*`, neck attaches at anchor **(200,170)**
| # | id | look | name piece | colour | head-note Hz |
|---|---|---|---|---|---|
| 1 | head-liekki | lohikäärme, sieraimet, pikkusarvet | **liekki** | ember `#ff8a4c` | 392 |
| 2 | head-narsku | dino, pitkä kuono, hampaat | **narsku** | leaf `#3aa64a` | 262 |
| 3 | head-tuijo | kyklooppi, yksi iso silmä | **tuijo** | teal `#46c4a8` | 440 |
| 4 | head-nokka | lintu, iso nokka | **nokka** | gold `#ffd264` | 523 |
| 5 | head-kurno | sammakko, leveä suu, silmät päällä | **kurno** | leaf-dark `#2b7d39` | 196 |
| 6 | head-moly | pörröhirviö, iso suu | **möly** | sky `#7cc0ff` | 330 |
| 7 | head-piip | robotti, antenni | **piip** | stone `#7a6f86` | 659 |
| 8 | head-napse | hammaspeto, torahampaat | **napse** | amber `#ffb43d` | 349 |

### BODIES (8) — `body-*`, centred at **(200,260)**
| # | id | look | name piece | colour | body-note Hz |
|---|---|---|---|---|---|
| 1 | body-potko | pullea soikio-maha | **pötkö** | teal `#46c4a8` | 196 |
| 2 | body-pallo | pyöreä pallo | **pallo** | gold `#ffd264` | 220 |
| 3 | body-nukka | pörröinen | **nukka** | leaf `#3aa64a` | 165 |
| 4 | body-muna | korkea munanmuoto | **muna** | cream `#fff7e6` | 247 |
| 5 | body-okki | piikikäs | **okki** | ember `#ff8a4c` | 208 |
| 6 | body-kuori | panssari-levyt | **kuori** | stone `#7a6f86` | 147 |
| 7 | body-mohko | hyytelö-möhkäle | **möhkö** | sky `#7cc0ff` | 175 |
| 8 | body-tolkki | tynnyri, raidat | **tölkki** | amber `#ffb43d` | 233 |

### TAILS (8) — `tail-*`, attaches at **(285,300)**, extends right
| # | id | look | name piece | colour | tail-note Hz |
|---|---|---|---|---|---|
| 1 | tail-piikki | terävä kärki | **piikki** | lava `#e8452f` | 587 |
| 2 | tail-pompo | pallokärki | **pömpö** | gold `#ffd264` | 440 |
| 3 | tail-sakara | sahalaita-piikit | **sakara** | ember `#ff8a4c` | 523 |
| 4 | tail-kiemu | kiemurainen | **kiemu** | teal `#46c4a8` | 494 |
| 5 | tail-viuhka | viuhka / evä | **viuhka** | sky `#7cc0ff` | 659 |
| 6 | tail-topo | töpö, lyhyt | **töpö** | leaf `#3aa64a` | 392 |
| 7 | tail-nuija | nuijakärki | **nuija** | stone `#7a6f86` | 330 |
| 8 | tail-suti | tupsukärki | **suti** | amber `#ffb43d` | 698 |

### WINGS (6 + none) — `wing-*`, symmetric pair behind body, roots at **(160,220)** & **(240,220)**
| # | id | look | name piece | colour |
|---|---|---|---|---|
| 0 | wing-none | ei siipiä | *(no piece)* | — |
| 1 | wing-nahka | nahkasiivet (lohikäärme) | **nahka** | ember `#ff8a4c` |
| 2 | wing-hoyhen | höyhensiivet | **höyhen** | star `#cfe8ff` |
| 3 | wing-perho | perhossiivet | **perho** | gold `#ffd264` |
| 4 | wing-surri | pikku mehiläissiivet | **surri** | star `#cfe8ff` |
| 5 | wing-porro | pörrösiivet | **pörrö** | cream `#fff7e6` |
| 6 | wing-pyorre | potkuri / pyörre | **pyörre** | teal `#46c4a8` |

### HORNS (6 + none) — `horn-*`, behind head, crown anchor **(200,70)**, pair pivots **(165,70)** & **(235,70)**
| # | id | look | name piece | colour |
|---|---|---|---|---|
| 0 | horn-none | ei sarvia | *(no piece)* | — |
| 1 | horn-sarvi | kaarevat sarvet | **sarvi** | cream `#fff7e6` |
| 2 | horn-kruunu | piikkikruunu-rivi | **kruunu** | gold `#ffd264` |
| 3 | horn-tunto | tuntosarvet (pallot) | **tunto** | teal `#46c4a8` |
| 4 | horn-torvi | yksi iso torvi | **torvi** | amber `#ffb43d` |
| 5 | horn-kohmy | köhmyt / nystyt | **köhmy** | stone `#7a6f86` |
| 6 | horn-harja | harja (mohikaani) | **harja** | ember `#ff8a4c` |

### LEGS (6) — `leg-*`, two legs, feet rest on ground **(165,400)** & **(235,400)**
| # | id | look | name piece | colour |
|---|---|---|---|---|
| 1 | leg-tassu | pyöreät tassut | **tassu** | wood-mid `#8a5a2b` |
| 2 | leg-toppo | töpöjalat | **töppö** | stone `#7a6f86` |
| 3 | leg-kavio | kaviot | **kavio** | wood-dark `#5e3d1c` |
| 4 | leg-kynsi | kynsivarpaat | **kynsi** | leaf-dark `#2b7d39` |
| 5 | leg-jousi | jousijalat (spiraali) | **jousi** | teal `#46c4a8` |
| 6 | leg-pyora | pyörät! | **pyörä** | stone `#7a6f86` |

### PATTERNS (6 + none) — `pat-*`, overlay on the body, centred **(200,275)**
| # | id | look | name piece | colour |
|---|---|---|---|---|
| 0 | pat-none | sileä | *(no piece)* | — |
| 1 | pat-pilkku | pienet pilkut | **pilkku** | ink `#2a2440` |
| 2 | pat-raita | raidat | **raita** | ink `#2a2440` |
| 3 | pat-tapla | isot täplät | **täplä** | cream `#fff7e6` |
| 4 | pat-tahti | tähdet | **tähti** | gold `#ffd264` |
| 5 | pat-ruutu | ruudut | **ruutu** | ink `#2a2440` |
| 6 | pat-sydan | sydämet | **sydän** | lava `#e8452f` |

### HATS (6 + none) — dress-up — `hat-*`, sits on crown **(200,62)**
| # | id | look | name piece | colour |
|---|---|---|---|---|
| 0 | hat-none | paljas pää | *(no piece)* | — |
| 1 | hat-silinteri | silinteri | **hattu** | ink `#2a2440` |
| 2 | hat-lippis | lippalakki | **lippis** | lava `#e8452f` |
| 3 | hat-kruunu | kruunu | **kruunu** | gold `#ffd264` |
| 4 | hat-juhla | juhlatötterö | **juhla** | teal `#46c4a8` |
| 5 | hat-kypara | kypärä | **kypärä** | sky `#7cc0ff` |
| 6 | hat-kukka | kukka | **kukka** | gold `#ffd264` |

---

## 5. Compound-name generator (readable Finnish)

**Default name = head-piece + body-piece + tail-piece**, concatenated lowercase.
Example: `liekki` + `pötkö` + `piikki` = **liekkipötköpiikki**. Another:
`nokka` + `pallo` + `pömpö` = **nokkapallopömpö**.

- Always exactly these 3 core pieces by default → short, readable, ~4–6 syllables.
- Pieces are chosen to concatenate without ugly clusters (all end/start on vowels or soft
  consonants). 8×8×8 = **512 names**.
- Optional (for extra fun, keep OFF by default or only on **yllätys**): prepend ONE short
  adjective so the name stays ≤ 4 pieces. Adjective pieces: **iso, pikku, super, hassu,
  mahti, kulta** (→ e.g. *isoliekkipötköpiikki*). Never chain more than one.
- Wing/horn pieces (nahka, höyhen, sarvi, kruunu, …) exist and MAY be used as the prefix
  slot instead of an adjective if you want the extras to show in the name — but the brief's
  readability wins, so **cap total at 4 pieces** and never stack wing+horn+adjective.

**Name-piece count:** 8 head + 8 body + 8 tail = **24 core**; +6 wing +6 horn = 36;
+6 adjective = **42 pieces** available to the generator.

Display: big, warm yellow (`#ffd264`), centred under the title, lowercase (a learning reader
reads lowercase first). One word. Updates on every slot change with a soft name-pop.

---

## 6. Audio cue list (small reusable set, for WAV synthesis @ 22050 Hz PCM)

| name | one-line description |
|---|---|
| `naps` | lyhyt pehmeä "tik" — soi kun vaihdat osaa / painat nuolta |
| `pulp` | pehmeä "plop" — soi kun uusi osa ilmestyy otukseen |
| `taika` | lempeä laskeva kimalle-helinä (3 nopeaa nousevaa pikku nuottia) — "yllätys"-arvonta |
| `tallenna` | iloinen kaksisävelinen pikku kilahdus ( up two notes) — otus tallennettu |
| `fiuh` | hyvin pehmeä henkäys/kohina-puff — valinnainen, soi kun siivet lepattaa |
| `poo` | matala hassu "pöö" (lyhyt laskeva saha) — easter-egg, 5. peräkkäinen klikkaus |
| `fanfaari` | = jaettu `success.wav` (olemassa `celebrate.js`:ssä) — tallennusjuhla |

**Voice** is not a separate WAV: render it from the pitch tables above — head-note
(sawtooth), body-note (triangle), tail-note (square), ~0.18/0.20/0.22 s, each with a small
glide, played back-to-back (~0.55 s total). A tiny bank of pitched blips can be pre-rendered
if runtime synthesis is too heavy on the device. Optional: if wings ≠ none, play `fiuh`
before the voice; if horns = horn-torvi, add a soft honk after. All gentle.

---

## 7. Funny beats (specific gags)

- **Mismatch comedy** is the engine of the whole toy: a tiny dragon head on a huge fuzzy
  body standing on **wheels** is funny by construction. The parts are drawn so mismatches
  look deliberately absurd, not broken.
- **Tap-the-monster hop + shout.** Tapping it makes it hop once and sing its voice. The
  voice is often ridiculous (low body + squeaky tail).
- **Pöö easter-egg.** 5 taps in a row (a counter, not a timer) → a bigger silly wobble and a
  `poo` blip with the word **pöö!** — rewards curiosity without any pressure.
- **Wheels roll.** With `leg-pyora`, on *huuda* the monster nudges sideways a few px and
  settles (engine) — a creature on wheels that scoots is a reliable giggle.
- **Antenna & tuntosarvet wobble.** `head-piip` antenna and `horn-tunto` balls are marked for
  a gentle idle wobble.
- **Funny names.** The generator itself is a gag: *kurnomöhköpömpö*, *piiptölkkisuti*.
- **Flower-hat bee.** `hat-kukka` has a tiny static bee on it (visual easter-egg).
- **yllätys** occasionally lands on an extra-silly combo; the little wobble + daft voice
  sells the joke.

---

## 8. Success / celebrate moments

There is no "win" — the celebrate moment is **tallenna** (saving a monster you like). On save:
the shared `celebrate()` fires (canvas confetti burst, rotating Finnish praise banner, and
`success.wav` fanfare), the portrait animates into the gallery, and the praise banner reads a
short line like **"Hieno otus!"** / **"Mahtava!"** / **"Hassu!"**. Saving is always available
and always celebrated — it rewards making, not winning.

---

## 9. Replayability (no levels, no speed)

- **Combinatorics:** 512 core combos; with extras hundreds of thousands. You will not see the
  same monster twice by accident.
- **Names & voices:** every combo yields a unique silly name and a unique 3-note song —
  reasons to keep mixing just to hear/read the next one.
- **yllätys randomiser:** one tap for a brand-new beast.
- **Galleria:** save up to ~12 favourites (ring-buffer or "poista" to free a slot); each
  shows its name → gentle, self-paced **reading practice**. Re-open any to keep tinkering.
- Freshness is entirely from combinations + names + voices + the gallery, never from
  difficulty, score or time.

Persistence note (for the lead): gallery can persist via `localStorage` if available on the
4.1 WebView; if not, in-memory for the session is fine — saving still celebrates.

---

## 10. Hub door

`art/door.svg` (viewBox `0 0 240 240`). A rounded night-purple tile (`#342a4e` face,
`#241a33` inset) framed in warm wood (`#8a5a2b` / `#5e3d1c`). On it, a friendly chunky
**monster face** peeking out: round teal body-blob with two big white eyes, two little cream
horns and a wide happy mouth — plus a small gold **spanner/wrench** cue in a corner so it
reads as a *workshop*. Instantly "a place where you make a cute monster" to a 5-year-old.
Thick rounded outlines, flat fills, palette only. Consistent with the other 7 door tiles'
wood-frame-on-night format.

---

## 11. Performance budget (within device caps)

- **Assembled monster node count** (worst case, every slot filled): shadow 1 + wings ~8 +
  tail ~5 + legs ~6 + horns ~5 + body ~5 + pattern ~8 + head ~11 + hat ~5 ≈ **54 nodes**.
- **Workshop background** (`art/workshop.svg`): ~**70 nodes** (one sky linearGradient, flat
  shelves, jars, stage, bunting). Scene total with monster ≈ **125 nodes** — under the ~160
  cap.
- **No filters, no feGaussianBlur, no masks, no blurred shadows.** Shadows are a single
  flat low-opacity ellipse. "Glow" (jar contents, stage pool) is a low-opacity solid shape.
- **One** `linearGradient` only, for the back-wall sky in `workshop.svg`. Everything else is
  flat fill. No per-part gradients.
- Animation is the engine's, time-based and capped: part-swap pop (one transform, ~130 ms),
  idle wobble on marked groups, hop on huuda, ≤24 confetti particles on save (shared
  `celebrate.js`, already device-verified). No infinite rAF — every motion is a bounded
  tween with a hard stop.
- Redraw cost is the POC's model (replace the monster `<g>` innerHTML on change) — cheapest
  possible path for the SGX531, the lightest of all 8 games.
- **Flag:** none. This is the lightest game in the app; even with 8 slots the scene stays
  well inside budget because only the chosen parts are ever in the DOM.
