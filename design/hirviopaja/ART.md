# 08 · Hassu hirviöpaja — ART map

How the SVG files fit together, the shared anchor grid, every part id, and the motion the
engine applies. All part art lives in the **shared monster-local space `viewBox 0 0 400 440`**,
pre-positioned at the anchors below. The scene (`workshop.svg`) and the tile (`door.svg`) have
their own viewBoxes.

---

## The shared anchor grid (THE key spec)

All parts are drawn in **one coordinate space, `0 0 400 440`**, with bilateral symmetry about
**x = 200**. Each part is already positioned so it attaches at its anchor — the engine does
**not** transform individual parts. It just concatenates the chosen `<g>` from each slot file,
in z-order, into one `<svg viewBox="0 0 400 440">`, then places that whole group in the scene
with a single transform.

| Anchor | Coord | Used by |
|---|---|---|
| Symmetry axis | x = 200 | everything |
| **Head neck** | **(200,170)** | heads attach here; each head's lowest mass reaches ~y168-174 to overlap the body top |
| **Horn crown** | **(200,70)**, pivots (165,70)/(235,70) | horns emerge above the head |
| **Hat crown** | **(200,62)** | hat rests on top of the head |
| **Body centre** | **(200,260)** | body silhouette ~x112..288, top y~172, bottom y~358 |
| **Tail root** | **(285,300)** | tail starts at body lower-right, extends right |
| **Wing roots** | **(160,220)** & **(240,220)** | symmetric wing pair, spreads up-and-out behind body |
| **Feet (ground)** | **(165,400)** & **(235,400)** | leg feet rest here; leg tops tuck under body ~y340 |
| **Pattern safe area** | circle r~66 around **(200,268)** | pattern marks stay inside → land on every body |
| **Ground shadow** | ellipse centre **(200,408)** | `base.svg` |

### Z-order (back → front) — assemble in this order
1. `base-shadow` (base.svg)
2. `wing-*` (wings.svg)
3. `tail-*` (tails.svg)
4. `leg-*` (legs.svg)
5. `horn-*` (horns.svg)
6. `body-*` (bodies.svg)
7. `pat-*` (patterns.svg)
8. `head-*` (heads.svg)
9. `hat-*` (hats.svg)

### Scene placement (one transform)
Wrap the assembled monster `<g>` in:
```
<g transform="translate(312,95)"> … parts in z-order … </g>
```
This maps local ground y408 → scene y503 and centre x200 → scene x512 on the `workshop.svg`
stage. Bump to `translate(292,55) scale(1.1)` if you want the monster a touch bigger — same
anchor maths, the whole group scales as one.

---

## File → id map

### base.svg  (`0 0 400 440`)
| id | what | motion |
|---|---|---|
| `base-shadow` | flat ground shadow ellipse (opacity .20) | static; the engine may scale it a hair during the hop |

### heads.svg  (`0 0 400 440`) — neck at (200,170)
| id | what | motion |
|---|---|---|
| `head-liekki` | dragon, nostrils, little nubs | — |
| `head-narsku` | dino long toothy snout | — |
| `head-tuijo` | cyclops, one big eye | — |
| `head-nokka` | bird, big beak | — |
| `head-kurno` | frog, wide mouth, eyes on top | — |
| `head-moly` | fuzzy monster, open mouth | — |
| `head-piip` | robot; child `head-piip-antenna` | wobble the antenna ±6° idle (~1.4 s ease-in-out) |
| `head-napse` | fanged beast, ears | — |

### bodies.svg  (`0 0 400 440`) — centre (200,260)
`body-potko`, `body-pallo`, `body-nukka`, `body-muna`, `body-okki`, `body-kuori`,
`body-mohko`, `body-tolkki`. Static (the whole monster hops as one on huuda).

### tails.svg  (`0 0 400 440`) — root (285,300)
`tail-piikki`, `tail-pompo`, `tail-sakara`, `tail-kiemu`, `tail-viuhka`, `tail-topo`,
`tail-nuija`, `tail-suti`. Optional idle sway ±3° about the root (285,300).

### wings.svg  (`0 0 400 440`) — roots (160,220)/(240,220)
| id | what | motion |
|---|---|---|
| `wing-none` | empty group | — |
| `wing-nahka` | leathery dragon; child `wing-nahka-flap` | rock the `-flap` child ±4° (~1.6 s) |
| `wing-hoyhen` | feathered; `wing-hoyhen-flap` | rock ±4° |
| `wing-perho` | butterfly; `wing-perho-flap` | rock ±5° |
| `wing-surri` | tiny bee wings; `wing-surri-flap` | faster tiny rock ±6° (~0.9 s) |
| `wing-porro` | fluffy puffs; `wing-porro-flap` | gentle rock ±3° |
| `wing-pyorre` | propeller; child `wing-pyorre-blade` | slow continuous rotate about (200,150), capped, hard-stop on leave |

### horns.svg  (`0 0 400 440`) — crown (200,70)
| id | what | motion |
|---|---|---|
| `horn-none` | empty | — |
| `horn-sarvi` | curved pair | — |
| `horn-kruunu` | spiky crown row | — |
| `horn-tunto` | antennae; children `horn-tunto-l` / `horn-tunto-r` | wobble each ball ±8° idle (~1.3 s), slight offset |
| `horn-torvi` | single big horn | — |
| `horn-kohmy` | knobs | — |
| `horn-harja` | mohawk ridge | — |

### legs.svg  (`0 0 400 440`) — feet (165,400)/(235,400)
| id | what | motion |
|---|---|---|
| `leg-tassu` | round paws | — |
| `leg-toppo` | stubby | — |
| `leg-kavio` | hooves | — |
| `leg-kynsi` | clawed toes | — |
| `leg-jousi` | springs; children `leg-jousi-l` / `leg-jousi-r` | squash/bounce on hop |
| `leg-pyora` | wheels; children `leg-pyora-l` / `leg-pyora-r` | on huuda, roll: translate monster a few px sideways + settle; may spin wheel children |

### patterns.svg  (`0 0 400 440`) — overlay, safe circle r66 @ (200,268)
`pat-none` (empty), `pat-pilkku`, `pat-raita`, `pat-tapla`, `pat-tahti`, `pat-ruutu`,
`pat-sydan`. Static overlay on the body front.

### hats.svg  (`0 0 400 440`) — crown (200,62)
| id | what | motion |
|---|---|---|
| `hat-none` | empty | — |
| `hat-silinteri` | top hat | — |
| `hat-lippis` | cap | — |
| `hat-kruunu` | crown | — |
| `hat-juhla` | party cone | — |
| `hat-kypara` | helmet | — |
| `hat-kukka` | flower; child `hat-kukka-bee` | optional tiny bob of the `-bee` child |

### workshop.svg  (`0 0 1024 600`)
Cosy lab background: night wall, arched window with `ws-sky` gradient + moon + stars, top
bunting, two corner shelves with potion jars, a hanging lamp with a low-opacity warm pool, a
stone **stage/pedestal** centred at x512 (monster stands here), wood floor. The monster `<g>`
(with `transform="translate(312,95)"`) is drawn on top of this. **Control positions are
documented in the file header comment** (KOTI, title/hint, the 8 slot cyclers left/right, and
the 4 bottom action buttons) — the engine draws those as live DOM/SVG, not baked into the
scene. Motion: window stars/moon are static (no twinkle — calm rule); the warm pool is static.

### door.svg  (`0 0 240 240`)
Hub tile: wood-framed night square with a friendly teal monster face (two horns, big eyes, a
happy fanged smile) and a little gold spanner. Static. The engine may apply the shared hover
"lift" the other hub tiles use.

---

## Colour / outline convention used
Flat palette fill + a darker palette shade for the stroke, `stroke-width` 4 (thinner on tiny
details), round caps & joins. Darker-shade pairs used: ember `#ff8a4c`/`#c75a2a`, leaf
`#3aa64a`/`#2b7d39`, leaf-dark `#2b7d39`/`#1e5a28`, teal `#46c4a8`/`#2e8a76`, gold
`#ffd264`/`#c9922f`, amber `#ffb43d`/`#c77f1e`, sky `#7cc0ff`/`#3f84c4`, star
`#cfe8ff`/`#8fb8db`, stone `#7a6f86`/`#4a4150`, lava `#e8452f`/`#a82e1e`, cream
`#fff7e6`/`#d9c89a`, wood `#8a5a2b`/`#5e3d1c`/`#3b2611`, ink `#2a2440`/`#16122a`. Eyes are
white `#ffffff` with ink pupils/outline.

No filters, no `feGaussianBlur`, no masks, no blurred shadows anywhere. One `linearGradient`
(`ws-sky`) total, in the workshop window. Highlights/glows are low-opacity solid shapes.
