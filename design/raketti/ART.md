# 07 · Rakettipaja — ART.md

*SVG id → what it is + the motion the engine applies. All motion is time-based
(`Date.now()` delta), eased, capped, and HARD-STOPPED at the end — no eternal rAF.
No filters; the one "glow" is a low-opacity solid. Default stroke 4, rounded
caps/joins. `.hot` = tappable; `:active` → opacity ~0.85.*

## Scenes & flow
`workshop.svg` (build) → tap `#launch` → `flight.svg` (climb + arrive) → `#navWorkshop`
back. `#navBook` ↔ `matkakirja.svg`. `#navHome` → the 8-door hub. Transitions = soft
~400 ms crossfade.

---

## Shared anchor frame (rocket-parts.svg, viewBox 0 0 200 340)
Every part is authored in this ONE local frame, so any nose + body + fins line up.
The engine builds the rocket in a `#rocketSlot` group and `translate`s it per scene.

- `#body` — x50→150 (centre x=100), y60→260. Engine sets its `fill` = chosen väri.
- **Nose anchor** — base (50,60)→(150,60); noses extend up to ≈y4.
- `#window` — (100,130) r22, fixed.
- **Fins anchor** — body bottom corners (50,260)/(150,260); fins extend out/down to ≈y300.
- **Flame anchor** — (100,260); flame + particles extend down to ≈y334.

| part set | ids |
|---|---|
| noses | `#nose_terava` `#nose_pyorea` `#nose_littea` `#nose_kruunu` `#nose_tahti` |
| fins (L+R pairs) | `#fins_kolmio` `#fins_pyorea` `#fins_nuoli` `#fins_isot` `#fins_pienet` |
| colours (set `#body` fill) | #e8452f #7cc0ff #3aa64a #ffd264 #46c4a8 |
| fixed | `#body` `#window` `#flame` |

Compose order (back→front): `#flame`, fins, `#body`, nose, `#window`.

---

## door.svg (hub tile)  — static rocket on a flame.

## rocket-parts.svg  — the library above. Noses/fins overlap at their anchors on
purpose (library, not a finished rocket); engine shows one of each.

## workshop.svg (paja)
| id | motion |
|---|---|
| `#rocketSlot` (translate 560,110) | baked default rocket; engine recolours `#rocketBody` + swaps `#noseSlot` / `#finsSlot` children. On any part change: `clunk` + a tiny spring bounce (scale 1→1.04→1). |
| `#rocketBody` | fill = chosen väri |
| `#noseSlot` / `#finsSlot` | engine replaces inner part from rocket-parts.svg |
| `#nosePrev` / `#noseNext` | cycle nose; `tap` |
| `#colorPrev` / `#colorNext` | cycle colour; `tap` |
| `#finPrev` / `#finNext` | cycle fins; `tap` |
| `#launch` ("lähtö!") | ignition: `#flame` opacity 0→1, start flame particles, `rumble`+`whoosh`, ~0.5 s shake (translate ±2) → crossfade to flight. **(random ~1/6 → chicken gag instead, see extras.)** |
| `#navHome` / `#navBook` | → hub / → matkakirja |

## flight.svg (lento) — the bounded flight
| id | motion |
|---|---|
| `#rocketSlot` | engine injects the assembled rocket. **Climb:** translate from (412,320) → (412,70) over ~3.5 s `Date.now()` ease-out, then **STOP** (clear timer, `#flame` off, hide particle canvas `display:none`). Rocket centre lands at scene x=512. |
| `#starfield` (18 nodes) | scroll DOWN (translateY increasing, wrap each star past y=600 back to top) during the climb only; stop with the climb. Or ignore these nodes and repaint stars on one canvas — either ≤ budget. |
| `#destinationSlot` | on arrival, engine injects a `dest_*` sprite (top centre ~translate 420,40); fade + scale 0.6→1; soft `fanfare`; show arrival line; add sticker to matkakirja; new destination → `celebrate()`. |
| flame particles | ≤24, time-based, emitted from the rocket's flame anchor; hard-stop at climb end. |
| `#navHome` / `#navWorkshop` | → hub / → paja (same rocket) |

**Start/arrival positions** are approximate — tune in code; the key rule is the
single bounded ease with a hard stop (no looping rAF).

## destinations.svg (1 of 5, random per flight)
`#dest_kuu` `#dest_asteroidit` `#dest_planeetta` `#dest_tahti` `#dest_komeetta`
— arrival: fade + gentle scale-in; `#dest_komeetta` may drift across with its tail.
Names (reading): kuu · asteroidit · planeetta · tähti · komeetta.

## extras.svg
| id | motion |
|---|---|
| `#chicken` | chicken gag: inject under the rocket (~scene 560,440), pop up (translateY -40 spring, `pop`), then run off-screen (translateX → +1120 over ~1.3 s, `cluck`), then STOP + remove. "pöö! kana karkasi!" Rocket stays put. |
| `#sticker` | star reward; engine drops it onto the matkakirja card of a newly visited destination (scale 0.4→1 pop, `chime`). |

## matkakirja.svg
| id | motion |
|---|---|
| `#slot1`…`#slot5` | engine injects the visited `dest_*` sprite (scaled) + a `#sticker` |
| `#q1`…`#q5` | "?" placeholder; opacity 1→0 when that place is visited |
| name plaques (static) | kuu · asteroidit · planeetta · tähti · komeetta |
| `#navHome` / `#navWorkshop` | → hub / → paja |
Slot centres: (118,240) (314,240) (510,240) (706,240) (902,240).

---

## Notes for the engineer
- **Flight = one bounded tween** (`Date.now()`), HARD STOP at the end: clear the
  timer/rAF, set `#flame` opacity 0 and hide the particle canvas (`display:none`,
  per the celebrate.js stall lesson). Nothing loops forever.
- **Shared anchor frame** guarantees mix-and-match alignment; nose/fins carry their
  own anchor-aligned coordinates — no per-combination nudging.
- **Caps:** flame particles ≤24; starfield ≤18 nodes (or 1 canvas); ≤1 gradient per
  scene (none used — all flat); no filters; every scene < ~160 nodes.
- **Dynamic text** (current part name, arrival line, matkakirja "x/5") = your DOM
  overlay; baked `<text>` (button labels, plaques, incl. ä/ö/ö) is static.
- **Pivots:** part-change bounce about the rocket's base (local 100,260); shake about
  the rocket centre.
