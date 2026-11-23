# 04 · Tähtikuvio / Tähdet — ART map

Files, ids, coordinate spaces, and the motion the engine applies. Animation is the engine's
(time-based, bounded, hard-stopped); the art marks groups with ids + notes motion. One gradient
per scene; decorative stars ≤16 and slow. No filters / blur / masks / clipPath; glows are
low-opacity solids.

---

## Files
| file | viewBox | role |
|---|---|---|
| `art/sky.svg` | 0 0 1024 600 | night-sky background (one `#sky` gradient, 16 bg stars, owl, shoot) |
| `art/star.svg` | 0 0 56 56 | puzzle-star sprite: `star-off` / `star-on` |
| `art/figures.svg` | 0 0 1024 600 | 8 finished line-arts (`fig-*`) at real stage coords |
| `art/kartta.svg` | 0 0 1024 600 | tähtikartta collection, 8 window slots |
| `art/door.svg` | 0 0 240 240 | hub door tile |

---

## Puzzle data — per figure (coords in the 1024×600 stage, tap order 1→N)

The engine clones `star.svg#star-off` at each coord (drawing the gold number near it), turns it
to `star-on` on a correct tap, and grows a `<line>` (gold `#ffd264`, width 4, round caps) from
the previous star. `closed` → also draw a final line N→1 on completion. The finished look =
`figures.svg#fig-<name>` (lines + a low-opacity wide glow line + lit star dots).

| # | id | N | closed | coordinates (in order) |
|---|---|---|---|---|
| 1 | fig-lohikaarme | 7 | no | (770,175)(685,215)(590,235)(515,160)(465,290)(360,335)(270,300) |
| 2 | fig-dino | 8 | yes | (180,370)(320,280)(450,245)(575,170)(620,205)(510,300)(455,440)(290,435) |
| 3 | fig-raketti | 8 | yes | (512,150)(558,250)(612,385)(548,365)(512,425)(476,365)(412,385)(466,250) |
| 4 | fig-laiva | 6 | yes | (350,410)(500,420)(650,410)(605,365)(500,180)(395,365) |
| 5 | fig-kissa | 7 | yes | (410,175)(465,215)(560,215)(615,175)(600,300)(512,350)(425,300) |
| 6 | fig-kala | 6 | yes | (360,290)(470,245)(600,215)(560,290)(600,365)(470,335) |
| 7 | fig-talo | 7 | yes | (410,430)(614,430)(614,315)(650,315)(512,215)(374,315)(410,315) |
| 8 | fig-sydan | 8 | yes | (512,440)(425,360)(372,292)(425,232)(512,285)(599,232)(652,292)(599,360) |

Names shown on completion: **lohikäärme, dino, raketti, laiva, kissa, kala, talo, sydän**
(note the ä in the shipped name; the ids are ASCII). **57 puzzle stars total.**

---

## sky.svg — id → motion
Control positions in the file header.
| id | what | motion |
|---|---|---|
| `#sky` (gradient) | the one scene gradient | static |
| `bg-stars` | 16 decorative stars | slow ~4 s opacity twinkle on a SUBSET (or static) — **no flash** |
| `shoot` | shooting star (dot + solid trail line) | one-shot slow drift L→R every ~9 s (opacity 0→1→0) |
| `owl` / `owl-head` | owl on the hill | `owl-head` turns ±8° + the owl hoots on completion; rare blink |

## star.svg
`star-off` (grey, not yet connected) · `star-on` (gold + low-opacity solid glow). Engine swaps
off→on on a correct tap (scale-pop + `twinkle`); a wrong tap gives `star-off` a gentle twinkle
only (no state change).

## figures.svg
`fig-lohikaarme, fig-dino, fig-raketti, fig-laiva, fig-kissa, fig-kala, fig-talo, fig-sydan`.
Each = a wide low-opacity glow polyline + the gold line polyline + lit star dots, at the real
coords above. Engine shows one on completion and clones a scaled copy into the tähtikartta.
On completion: a gentle sequential **sparkle wave** across the star dots (not a flash).

## kartta.svg
8 window slots (centres in the file header). Engine draws each discovered `fig-*` mini + name;
undiscovered = grey "?". Tap a found window to see it big. Static background.

## door.svg
Static hub tile (a 5-star constellation + moon). Engine may apply the shared hover "lift".

---

## Colour / outline convention
Lines & lit stars: gold `#ffd264` with cream `#fff7e6` accents; unlit stars stone `#7a6f86` /
`#4a4150`. Decorative bg stars star-pale `#cfe8ff` / cream. Owl wood `#5e3d1c` / `#3b2611` with
white `#fff7e6` eyes + amber `#ffb43d` beak. One `linearGradient` per scene (`#sky`); figure
glow and the shooting-star trail are low-opacity **solid** shapes/lines (no blur). No filters /
blur / masks / clipPath. Palette only.
