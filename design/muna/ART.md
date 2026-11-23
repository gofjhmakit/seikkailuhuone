# 02 · Lohikäärmeen muna — ART map

Files, ids/classes, coordinate spaces, and the motion the engine applies. Animation is the
engine's (time-based, bounded, hard-stopped); the art marks groups with ids + notes motion.
One gradient per scene; everything else flat. No filters / blur / masks; glows are low-opacity
solids. Flame puff ≤3 solid circles; any burst is canvas ≤24.

---

## Files
| file | viewBox | role |
|---|---|---|
| `art/scene.svg` | 0 0 1024 600 | nest-cave background (one `#cave` gradient) |
| `art/egg.svg` | 0 0 260 330 | egg + 5 crack stages + 2 shell halves |
| `art/dragon.svg` | 0 0 300 340 | baby-dragon base + horn/wing/pattern variants + overlays |
| `art/foods.svg` | 0 0 80 80 | 6 food sprites, centred (40,40) |
| `art/kirja.svg` | 0 0 1024 600 | collection book, 12 portrait cards |
| `art/door.svg` | 0 0 240 240 | hub door tile |

---

## scene.svg
Placement (engine): `egg.svg` → `translate(382,158)`, `dragon.svg` → `translate(362,150)`
(both land in the nest, centred x512). Control positions are in the file header.
| id | what | motion |
|---|---|---|
| `#cave` (gradient) | the one scene gradient | static (could darken slightly if you add day/night later) |
| `warm-glow` | ember ellipse around the nest | opacity 0→~0.3 while warming the egg, then soft fade; **no pulse/flash** |
| `hearth` | cosy embers pile | static |

## egg.svg
| id | what | motion |
|---|---|---|
| `egg-whole` | the intact egg (+ speckles + `cracks`) | wobble ±6px / ±3° on each tap (~120 ms) |
| `cracks` → `c1`..`c5` | 5 crack stages | reveal one more child (opacity 0→1) every couple of taps as warmth builds |
| `egg-shell-top` | upper broken half | at hatch: opacity 1, flips/slides up-and-away, fades |
| `egg-shell-bottom` | lower broken half (cradle) | at hatch: opacity 1, stays as a shell cradle under the baby, then fades |

Hatch sequence (engine): last crack → hide `egg-whole`, show both shell halves parting →
scale the dragon up from ~0.2 (soft `cubic-bezier` pop) → `karjaisu` + `#puff` + celebrate.

## dragon.svg — recolour + compose
**Recolour:** engine sets `fill` on every `.d-main` / `.d-belly` / `.d-dark` and `stroke` on
all three to the scheme's outline (8 schemes, DESIGN §4). Eyes stay white + ink pupils.
**Compose per hatch (z-order):** chosen `wing-*` → `dragon-base` → chosen `pat-*` → chosen
`horn-*`, then toggle overlays.
| id | what | motion |
|---|---|---|
| `dragon-base` | body, belly, tail, feet, head, snout, open eyes | idle bob (translateY ±5px, slow sin); hop on feed; lean on pet |
| `dragon-eyes-open` | the open eyes (inside base) | hidden when sleeping (show `eyes-closed`); occasional blink |
| `horn-sarvet` / `horn-piikit` / `horn-nuppu` | 3 horn choices (crown 126/174,98) | static (move with the head) |
| `wing-nahka` / `wing-hoyhen` / `wing-pikku` | 3 wing choices (shoulders 95/205,195) | optional gentle flap ±4° on hop/hatch |
| `pat-silea` / `pat-pilkut` / `pat-raidat` | 3 body patterns | static overlay on the body |
| `puff` | 3-circle flame (hidden) | show ~0.4 s on feed/hatch/sneeze (fade) |
| `eyes-closed` | 2 closed-eye arcs (hidden) | show for `nukkuu` + blinks (hide `dragon-eyes-open`) |
| `zzz` | 3 "z" marks (hidden) | show while sleeping; drift up + fade (engine) |
| `hearts` | 2 hearts (hidden) | show on pet; float up + fade |

## foods.svg
`food-liha, food-kala, food-marja, food-keksi, food-leipa, food-omena` (names in DESIGN §5).
Motion: on tap, the food hops from the tray to the dragon's mouth, then the dragon chomps
(`#puff` + `nam`); every ~4th feed a `hik` burp (pink puff).

## kirja.svg
12 portrait cards (centres in the file header). Engine draws each hatched dragon (mini) +
name + colour word in the next card; tap a card to read it big. Static background.

## door.svg
Static hub tile (speckled egg in a nest, crack, warm glow). Engine may apply the shared hover
"lift".

---

## Colour / outline convention
Flat palette fill + a darker palette shade for the stroke, `stroke-width` ~5 (thinner on tiny
details), round caps & joins. Dragon recolour schemes (main/belly/dark+outline) are in
DESIGN §4; default baked scheme = **turkoosi** (main `#46c4a8`, belly `#cfe8ff`, dark/outline
`#2e8a76`). Eyes white `#ffffff` + ink `#2a2440`. Egg is neutral parchment `#f3e7cc` /
`#d9c89a` with amber speckles (keeps the hatch a surprise). One `linearGradient` per scene
(`#cave`); glows & embers are low-opacity solids. No filters / blur / masks.
