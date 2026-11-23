# 03 · Dinon luut — ART.md

*SVG id → what it is + the motion the engine applies. All motion is time-based,
eased, capped, hard-stopped on scene exit. No filters; the one "glow" (`#digGlow`)
is a low-opacity solid whose opacity the engine tweens. Default stroke 4, rounded
caps/joins (set once per `<svg>`). `.hot` = tappable; on `:active` drop opacity to
~0.85.*

## Scenes & flow
`dig.svg` ⇄ `museum.svg` (crossfade ~400 ms). `#navNew` reloads `dig.svg` with a
new random skeleton + fresh grid. `#navHome` → the 8-door hub (engine).

---

## door.svg (hub tile, 240×240)
Static. Dino skull + bone in a sand mound.

## dig.svg — the dig pit
**Grid:** 7 cols × 4 rows = 28 tiles in `#sandGrid`. Origin (120,180), tile
112×85. Tile id `#t{r}_{c}`, r 0–3 (top→bottom), c 0–6 (left→right).
`x = 120 + 112*c`, `y = 180 + 85*r`.

| id | motion |
|---|---|
| `#t{r}_{c}` (28 tiles) | tap/brush → opacity 1→0 over ~180 ms + dust puff (≤24 particles, time-based, hard-stop). Reveals the bone / surprise beneath. |
| `#digContents` | empty slot; engine injects the chosen `skel-*.svg` `#skeleton` + surprise sprites here (renders UNDER `#sandGrid`). |
| `#counterPlaque` | static wood sign; engine writes "luut: n/N" on the parchment inset. |
| `#brush` | rests top-right; engine moves it to the tapped tile with a small sweep (rotate ±12°). |
| `#navHome` | → hub |
| `#navBook` | → museum (löytökirja) |
| `#navNew` | → fresh dig (new random skeleton) |
| sky `linearGradient #digSky` | the one allowed gradient (sky only). |

**Reveal/completion logic:** map each tile to a bone-zone by bbox overlap (boxes
below). When the LAST tile overlapping a zone's bbox is cleared → that zone counts
(+1), the zone group pops (scale 1→1.08→1), `chime`, "löysit luun!". When all N
zones are found → run the completion sequence (below) + `celebrate()`.

---

## Skeletons (injected into `#digContents`; built in scene coords inside the pit)

Common per skeleton:
- `#skeleton` — the whole group.
- `#digGlow` — low-opacity gold ellipse, opacity 0 → ~0.3 at completion (faked glow).
- `#skull` — the cranium path; at completion it **nods** (rotate ±6° about its base).
- `#jaw` (tyrannosaurus, raptori only) — opens on the wake-up roar (rotate ~ -16°
  about the jaw hinge, the skull's lower-rear point); other dinos just nod `#skull`.
- **Completion sequence:** `#digGlow` fade in → `#skull` nod + `#jaw` open + soft
  `roar` → settle → `celebrate()` + show name → fill löytökirja card.

Bone-zone **bounding boxes** (x, y, w, h) for the tile→zone mapping:

### skel-tyrannosaurus.svg — N=6
| zone | bbox |
|---|---|
| `#bz_kallo` | 180, 234, 140, 82 |
| `#bz_selka` | 300, 248, 270, 90 |
| `#bz_kylki` | 356, 286, 145, 125 |
| `#bz_kasi` | 368, 350, 36, 50 |
| `#bz_jalka` | 500, 320, 70, 185 |
| `#bz_hanta` | 556, 330, 310, 125 |

### skel-triceratops.svg — N=6
| zone | bbox |
|---|---|
| `#bz_kallo` | 168, 246, 212, 145 |
| `#bz_selka` | 372, 268, 250, 42 |
| `#bz_kylki` | 410, 292, 155, 118 |
| `#bz_etujalka` | 398, 318, 40, 182 |
| `#bz_takajalka` | 596, 312, 42, 188 |
| `#bz_hanta` | 620, 304, 146, 56 |

### skel-mammutti.svg — N=5
| zone | bbox |
|---|---|
| `#bz_kallo` | 186, 258, 160, 205 |
| `#bz_selka` | 320, 232, 305, 60 |
| `#bz_kylki` | 376, 280, 185, 140 |
| `#bz_etujalka` | 372, 298, 24, 200 |
| `#bz_takajalka` | 596, 302, 24, 196 |

### skel-pitkakaula.svg — N=5
| zone | bbox |
|---|---|
| `#bz_kallo` | 160, 208, 58, 40 |
| `#bz_kaula` | 190, 230, 175, 118 |
| `#bz_runko` | 360, 300, 276, 135 |
| `#bz_jalat` | 400, 336, 230, 166 |
| `#bz_hanta` | 636, 322, 252, 54 |

### skel-raptori.svg — N=5
| zone | bbox |
|---|---|
| `#bz_kallo` | 190, 292, 115, 54 |
| `#bz_selka` | 300, 290, 210, 44 |
| `#bz_kylki` | 344, 312, 140, 100 |
| `#bz_jalka` | 460, 320, 56, 154 |
| `#bz_hanta` | 506, 310, 284, 34 |

*(Zones overlap slightly; assign each tile to the zone with the largest overlap so
every tile belongs to exactly one zone, and Σ zone-tiles = 28.)*

---

## museum.svg (löytökirja)
| id | motion |
|---|---|
| `#slot1`…`#slot5` | engine injects a scaled-down `#skeleton` for each dug-up dino |
| `#q1`…`#q5` | "?" placeholder; opacity 1→0 when that dino is found |
| name plaques (static `<text>`) | tyrannosaurus · triceratops · mammutti · pitkäkaula · raptori |
| `#navHome` / `#navBack` | → hub / → dig |

Slot centers (for placing the scaled skeleton): card1 (118,240) · card2 (314,240)
· card3 (510,240) · card4 (706,240) · card5 (902,240), each card ~150×170 usable.

## sprites.svg (overlay atlas — take each `<g id>`, drop its translate, reposition)
| id | what | motion |
|---|---|---|
| `#spr_brush` | brush tool | follows taps (same as dig `#brush`) |
| `#spr_tile` | sand-tile reference | — (reference only) |
| `#sfx_ankka` | kumiankka | reveal: fade/scale in + a little wobble; `duck` |
| `#sfx_kivi` | plain rock | reveal: fade in; `clink` |
| `#sfx_aarre` | gem | reveal: fade in + sparkle (its glow disc opacity pulse); `clink` |
| `#sfx_simpukka` | shell | reveal: fade in; `chime` |
| `#sfx_hammas` | big tooth | reveal: fade in; `chime` |

Surprise objects are placed by the engine at random tiles under the sand (0–2 per
dig), revealed when that tile is brushed.

---

## Notes for the engineer
- **Z-order:** `#digContents` is declared before `#sandGrid`, so an injected
  skeleton/surprise renders beneath the sand and is revealed tile by tile.
- **Coordinates:** every skeleton is drawn in the same 1024×600 scene space inside
  the pit box (x120–904, y180–520), so its `#skeleton` drops into `#digContents`
  with no re-positioning. For the museum, scale the same `#skeleton` to fit a card.
- **Pivots:** `#jaw` hinge ≈ the skull's lower-rear corner (tyrannosaurus ~300,296;
  raptori ~296,330). `#skull` nod about its base center.
- **Dynamic text** (counter "luut: n/N", found-dino name, "x/5" in museum) =
  your DOM overlay. Baked `<text>` (nav buttons, museum name plaques, incl. ä/ö)
  is static.
- **Caps:** dust puff is the only emitter (≤24, time-based, hard-stop); one
  gradient (dig sky); no filters; every scene < ~160 nodes.
