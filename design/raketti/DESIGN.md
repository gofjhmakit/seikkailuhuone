# 07 · Rakettipaja — DESIGN

*Game UX Designer A · Seikkailuhuone / Adventure Room*
*Target: Acer Iconia B1 (Android 4.1, PowerVR SGX531) + modern browsers. One codebase, inline SVG on a 1024×600 stage. Shared palette + perf caps.*

---

## 1. Concept + core loop

Build your own rocket, then fly it gently into space. Two phases, both calm:

1. **PAJA (build):** cycle three part categories — **nokka** (nose), **väri**
   (body colour), **evät** (fins) — with ◀ ▶ arrows. The rocket redraws instantly
   with a tiny bounce. Part names are short readable Finnish words.
2. **LENTO (flight):** tap the big **"lähtö!"** button → gentle ignition (≤24 flame
   particles, soft rumble, NO countdown stress) → the rocket climbs smoothly
   (ease-out), the starfield scrolls down → it arrives at a **destination** (kuu,
   asteroidit, planeetta, tähti, komeetta) with a soft fanfare → that destination is
   stamped into the **matkakirja** (travel book) with a sticker.

Sometimes, instead of flying, a **runaway chicken** bursts out ("pöö! kana
karkasi!") — the rocket just sits there. Pure giggle, no fail.

No timer, no countdown pressure, no way to lose. Build and fly at your own pace,
again and again; each flight can reach a different place.

---

## 2. Build parts + the SHARED ANCHOR frame

All parts are authored in ONE **rocket-local coordinate frame** (viewBox
`0 0 200 340` in `rocket-parts.svg`) so any nose + any fins + the body always line
up. The engine composes the rocket in a `#rocketSlot` group and `translate`s that
group to wherever the scene needs it (workshop stand, flight path, matkakirja card).

**Anchors (rocket-local):**
- **Body** `#body`: x 50→150 (width 100, centre x=100), y 60→260. The coloured part.
- **Nose anchor:** base line **(50,60)–(150,60)**, nose extends UP toward y≈4. Every
  nose is drawn with its base exactly on this line so it caps the body.
- **Window** `#window`: centre **(100,130)**, r 22 (fixed).
- **Fins anchor:** the body's bottom corners **(50,260)** and **(150,260)**; each fins
  part is a left+right pair drawn from there, out/down toward y≈300.
- **Flame anchor:** bottom centre **(100,260)**, flame extends DOWN to y≈334.
- Rocket-local bounding box ≈ x 0→200, y 0→340.

### nokka — nose (5 options)
| id | word | shape |
|---|---|---|
| `#nose_terava` | **terävä** | tall sharp cone |
| `#nose_pyorea` | **pyöreä** | round dome |
| `#nose_littea` | **litteä** | flat/blunt cap |
| `#nose_kruunu` | **kruunu** | jagged 3-prong crown |
| `#nose_tahti` | **tähti** | cone with a little star on the tip |

### väri — body colour (5 options; engine sets `#body` fill)
| word | fill |
|---|---|
| **punainen** | #e8452f |
| **sininen** | #7cc0ff |
| **vihreä** | #3aa64a |
| **keltainen** | #ffd264 |
| **turkoosi** | #46c4a8 |

### evät — fins (5 options; each a left+right pair)
| id | word | shape |
|---|---|---|
| `#fins_kolmio` | **kolmio** | classic triangle fins |
| `#fins_pyorea` | **pyöreä** | rounded fins |
| `#fins_nuoli` | **nuoli** | swept-back arrow fins |
| `#fins_isot` | **isot** | big tall fins |
| `#fins_pienet` | **pienet** | small stubby fins |

5 × 5 × 5 = **125 rocket combinations.** Nose & fins are a friendly metal (#7a6f86);
only the body takes the colour, so a chosen colour reads clearly across all mixes.

---

## 3. Destinations (5) + Finnish names

Shown on arrival at the top of the flight scene; each has a matkakirja card + sticker.

| id | name shown | what it is | arrival line |
|---|---|---|---|
| `#dest_kuu` | **kuu** | smiling moon with craters | "olet kuussa!" |
| `#dest_asteroidit` | **asteroidit** | a little cluster of space rocks | "asteroidit!" |
| `#dest_planeetta` | **planeetta** | ringed planet | "uusi planeetta!" |
| `#dest_tahti` | **tähti** | big bright star | "kirkas tähti!" |
| `#dest_komeetta` | **komeetta** | comet with a tail + face | "komeetta lensi ohi!" |

Destination each flight is **random** (replay). Reaching a new one adds its sticker
to the matkakirja.

---

## 4. Flight sequence (time-based, HARD STOP — the key device rule)

1. **lähtö! tapped.** `#flame` fades in, ≤24 time-based flame particles start,
   `rumble` + `whoosh`. A gentle half-second of shake (translate ±2 px). No countdown.
2. **Climb.** Crossfade paja → `flight.svg`. The assembled rocket (in `#rocketSlot`)
   eases UP over ~3.5 s using `Date.now()` delta (NOT frame count); the `#starfield`
   scrolls DOWN (single canvas repaint OR ≤20 star nodes translated + wrapped); a
   soft `whoosh` bed. **At t_end the loop STOPS dead** (clear the interval/rAF, hide
   particle canvas `display:none`) — no eternal loop. This was flagged as the single
   biggest device risk; the whole flight is one bounded, self-terminating tween.
3. **Arrive.** `#destinationSlot` fades/scales a destination sprite in at the top;
   the rocket settles beside it (ease); flame off; soft **fanfare**; the arrival line
   shows. Sticker added to matkakirja.
4. **Return.** `#navWorkshop` ("takaisin pajaan") → crossfade back to the paja with
   the same rocket, ready to rebuild/relaunch. `#navBook` → matkakirja.

**Chicken variant (random ~1 in 6):** on lähtö, no climb — `#chicken` pops from
under the rocket, `pop` + `cluck`, runs off-screen (bounded translate, then stop),
"pöö! kana karkasi!". Rocket unbothered. Tap lähtö again to really go.

---

## 5. Matkakirja (travel book / collection)

`matkakirja.svg`: 5 destination cards in a row, each with a baked **name plaque**
(kuu, asteroidit, planeetta, tähti, komeetta) and a **`#sticker{n}`** slot. Before a
place is visited the card shows a faint **`#q{n}` "?"**; after, the engine drops the
destination sprite + a **star sticker** (`#sticker`) in and hides the "?". Browse-only,
calm; the child re-reads the names of the places he has flown to. Line: "olet käynyt
3 paikassa." Reached via `#navBook`; `#navWorkshop` returns.

---

## 6. Audio cue list (small, reusable, 22050 Hz PCM)

Shared `fanfare.wav` already exists (celebrate()/arrival).

| name | description | used by |
|---|---|---|
| `tap` | soft pop | part-cycle arrows, nav |
| `clunk` | light mechanical snap | rocket redraws when a part changes |
| `rumble` | low filtered engine rumble, ~0.8 s, non-looping | ignition |
| `whoosh` | gentle airy whoosh (filtered noise) | climb |
| `chime` | bright sparkle | sticker earned / destination |
| `pop` | springy boing | chicken jack-out |
| `cluck` | funny chicken cluck | chicken gag |
| `page` | paper turn | open/close matkakirja |

---

## 7. Funny beats

1. **Runaway chicken** — the signature gag (from the POC): press lähtö, a chicken
   springs out instead, clucks, bolts: "pöö! kana karkasi!".
2. **Mismatched rockets** — a huge `kruunu` nose on `pienet` fins looks gloriously
   silly; all mixes are "valid" and funny.
3. **Smiling moon** — `#dest_kuu` has a sleepy happy face.
4. **Comet with a face** — `#dest_komeetta` zooms with a little grin and a long tail.
5. **Part bounce** — every part change makes the rocket do a tiny springy bounce + `clunk`.

---

## 8. Success / celebrate

Arrival is the payoff: destination eases in, rocket settles, soft **fanfare** +
(for a brand-new destination) the shared **celebrate()** (confetti + Finnish praise
banner). Praise pool: "sinä lensit avaruuteen!", "hienoa!", "mahtava matka!",
"uusi tarra!". The matkakirja card fills with the destination + a star sticker.

---

## 9. Replayability (no levels, no speed)

1. **125 rocket builds** (5 nose × 5 colour × 5 fins).
2. **Random destination** each flight (1 of 5) → the matkakirja fills over many trips.
3. **Random chicken gag** keeps launches surprising.
4. **Collect-all-5** destinations = a gentle goal, no pressure.
5. *(Future, free):* more noses/fins/destinations drop in as new sprites with no
   engine change.

---

## 10. Hub door look (tile in the 8-door hub)

`art/door.svg`, viewBox `0 0 240 240`. Night-mid tile (cohesion) + a cheerful little
**rocket** climbing on a short flame, a couple of stars and a tiny moon — instantly
"rocket/space" to a 5-year-old. Chunky outlines, faked flame glow (low-opacity solid),
no filters.

---

## 11. Performance budget

Caps: scene < ~160 nodes · ≤24 particles · ≤~20 animated elements · no
filters/blur/masks · flat fills · fake glows only · ≤1 gradient per scene.

| scene | est. nodes | gradient | animated | particles |
|---|---|---|---|---|
| door.svg | ~16 | 0 | 0 | 0 |
| workshop.svg | ~60 (+ rocket ~12) | 1 (optional window sky) | rocket redraw, 3 selectors | 0 (flame starts at launch) |
| flight.svg | ~34 (incl. ≤18 stars) | 1 (space, optional) | rocket climb + starfield + destination | flame ≤24 |
| matkakirja.svg | ~48 | 0 | 5 card reveals | 0 |
| rocket-parts.svg | ~34 (library) | 0 | — | — |
| destinations.svg | ~34 | 0 | — | — |

Flags for you (lead engineer):
- **Flight loop is the #1 device risk → it is fully bounded:** one `Date.now()`
  ease over ~3.5 s, then HARD STOP (clear timer, hide particle canvas). No eternal
  rAF. Documented in ART.md.
- **Starfield:** I ship `#starfield` as **18 star nodes** you can translate+wrap; or
  ignore them and paint stars on one canvas — either stays within budget.
- **Flame particles ≤24**, time-based, hard-stop at climb end / on chicken gag.
- **Shared anchor frame** (`0 0 200 340`) guarantees any nose+body+fins line up;
  anchors listed in §2 and ART.md. Nose/fins carry their own anchor-aligned coords —
  no per-mix nudging needed.
- **Gradients:** at most one per scene (space/sky), optional — flat fills are fine.
- Dynamic text (part name being shown, arrival line, matkakirja "x/5") = your DOM
  overlay; baked `<text>` (button labels, plaques, incl. ä/ö) is static.

---

## 12. File map

```
design/raketti/
  DESIGN.md            (this file)
  ART.md               (part anchors, destination ids, id→motion map)
  art/
    door.svg               hub tile, 240×240
    workshop.svg           paja: build controls + rocket on stand + lähtö
    flight.svg             lento: space + #starfield + #rocketSlot + #destinationSlot
    matkakirja.svg         travel-book collection (5 cards)
    rocket-parts.svg       #body #window #flame + 5 noses + 5 fins (shared anchor frame)
    destinations.svg       5 destinations (kuu/asteroidit/planeetta/tahti/komeetta)
    extras.svg             #chicken (gag) + #sticker (star badge)
  (workshop/flight/matkakirja scenes viewBox "0 0 1024 600"; rocket-parts "0 0 200 340")
```
