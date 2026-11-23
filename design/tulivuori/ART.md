# 01 · Tulivuori — ART map

Files, ids, coordinate spaces, and the motion the engine applies. All animation is the
engine's (time-based, bounded, hard-stopped); the art just marks groups with ids and notes the
intended motion. Particles are canvas, **≤24**. One `linearGradient` (`#sky`) in the whole
game — everything else flat. No filters / blur / masks anywhere; glows are low-opacity solids.

---

## Files
| file | viewBox | role |
|---|---|---|
| `art/scene.svg` | 0 0 1024 600 | main volcano scene (background + volcano + critters + gauge) |
| `art/objects.svg` | 0 0 100 100 | 26 launchable object sprites, centred (50,50) |
| `art/icons.svg` | 0 0 64 64 | UI icons (eruption types, sun/moon, home, collection), centred (32,32) |
| `art/museum.svg` | 0 0 1024 600 | kokoelma shelf wall, 26 slot discs |
| `art/door.svg` | 0 0 240 240 | hub door tile |

---

## scene.svg — id → motion
**Eruption origin for particles & launches = (512,165).** Monster-free scene; the engine adds
the launched object + its name text on top.

| id | what | motion (engine, time-based) |
|---|---|---|
| `sky` (gradient) | the ONE gradient | day→night: swap the two stops (day `#a5d8ff`/`#7cc0ff` → night `#342a4e`/`#241a33`) over 400 ms |
| `scene-stars` | 8 static stars | opacity 0→1 fade in at night; **no twinkle** |
| `scene-sun` | sun + rays | shown in day; cross-fade out at night |
| `scene-moon` | crescent moon | opacity 0 by default; cross-fade in at night |
| `scene-hills` | 2 distant hills | optional slight darken at night |
| `volc-shake` | wraps the whole cone | poke: translateY 0→+2px→0 (~90 ms); small extra shudder during eruption |
| `volc-glow` | crater glow ellipse | opacity 0→~0.9 by pressure; stays warmer/brighter at night; fades on settle |
| `volc-partyhat` | tiny party hat at apex | opacity 0 until museum complete (26/26), then show |
| `gauge-fill` | pressure gauge liquid (a `<rect>` in the group) | grow height from the bottom (anchor y≈510) 0→full as pressure 0→100; empties on settle |
| `critter-dino` | green dino, left | idle breathing bob; on eruption **duck** down ~14px, pop back after ~0.6 s |
| `critter-bird` | bird on right rock | on eruption **flap up** ~10px + wobble, settle |
| `critter-peek` | baby dino behind right rock | on eruption **pop up** ~10px to look, then hide (drawn behind the rock-top cover path) |
| `critter-etana` | snail, foreground | reacts **late & slow** (the gag): small bob ~0.5 s after the others |

Particle types by selected eruption (engine draws on canvas from (512,165), ≤24 total):
see DESIGN.md §5 for colours/motion per type (laava / savurenkaat / kivet / ilotulitus).

## objects.svg — 26 sprites (centred (50,50), within ~r40)
`obj-saapas, obj-kana, obj-kala, obj-kello, obj-porkkana, obj-harja, obj-sukka, obj-banaani,
obj-ankka, obj-omena, obj-tahti, obj-sydan, obj-kuppi, obj-hattu, obj-avain, obj-pallo,
obj-kukka, obj-kirja, obj-makkara, obj-etana, obj-sammakko, obj-luu, obj-kivi, obj-raketti,
obj-dino, obj-aarre`. Finnish names in DESIGN.md §4.
Motion: the engine launches ONE on eruption — up-arc from the crater, slow spin, gravity,
soft land (`kops`), brief rest, then fade (or drop into the museum slot if new). Only one
object sprite is ever in the scene at a time.

## icons.svg — UI icons (centred (32,32))
`icon-laava, icon-savu, icon-kivet, icon-ilotulitus` (the 4 eruption-type chips),
`icon-sun, icon-moon` (day/night toggle), `icon-koti` (home), `icon-kokoelma` (collection).
Static; the engine places them in buttons. The lever points to the selected type chip.

## museum.svg — kokoelma screen
Shelf wall with 26 slot discs. Slot centres listed in the file header + DESIGN.md §8. Motion:
the engine clones each found `obj-*` into its slot (greyed if not yet found); tapping a found
slot lifts it a touch and shows the name big. Static background.

## door.svg
Static hub tile (erupting volcano). The engine may apply the shared hover "lift".

---

## Colour / outline convention
Flat palette fill + a darker palette shade for the stroke, `stroke-width` ~4, round caps &
joins. Darker-shade pairs used match round 1: ember `#ff8a4c`/`#c75a2a`, amber
`#ffb43d`/`#c77f1e`, gold `#ffd264`/`#c9922f`, lava `#e8452f`/`#a82e1e`, teal
`#46c4a8`/`#2e8a76`, leaf `#3aa64a`/`#2b7d39`, leaf-dark `#2b7d39`/`#1e5a28`, sky
`#7cc0ff`/`#3f84c4`, star `#cfe8ff`/`#8fb8db`, stone `#7a6f86`/`#4a4150`, cream
`#fff7e6`/`#d9c89a`, wood `#b07a3c`/`#8a5a2b`/`#5e3d1c`/`#3b2611`, ink `#2a2440`/`#16122a`.
Eyes white `#ffffff` with ink pupils. One `linearGradient` total (`#sky`). No filters / blur /
masks; glows & light pools are low-opacity solid shapes.
