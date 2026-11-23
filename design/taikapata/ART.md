# 05 · Taikapata — ART map

Files, ids, coordinate spaces, and the motion the engine applies. Animation is the engine's
(time-based, bounded, hard-stopped); the art marks groups with ids + notes motion. One gradient
per scene; everything else flat. **No clipPath** (liquid is a pre-shaped path). No filters /
blur / masks; glows/fire/steam are low-opacity solids; bursts are canvas ≤24.

---

## Files
| file | viewBox | role |
|---|---|---|
| `art/scene.svg` | 0 0 1024 600 | lab + cauldron + fire (one `#lab` gradient) |
| `art/ingredients.svg` | 0 0 100 130 | 9 shelf bottles, centred (50,78) |
| `art/results.svg` | 0 0 160 160 | 14 reaction-result sprites, centred (80,80) |
| `art/kirja.svg` | 0 0 1024 600 | reseptikirja, 14 recipe slots |
| `art/door.svg` | 0 0 240 240 | hub door tile |

---

## scene.svg — id → motion
Shelf + control positions are in the file header.
| id | what | motion |
|---|---|---|
| `#lab` (gradient) | the one scene gradient | static |
| `liquid` | pot liquid (pre-shaped path, **no clip**) | recolour `fill` = averaged ingredient colour; level may nudge up per add |
| `surface` | liquid top ellipse | recolour to a lighter shade; gentle bob on stir |
| `cauldron-glow` | warm pool | static low-opacity |
| `fire` | 3 flame shapes | gentle bounded flicker (sway/scale ±, ~1.2 s), **no strobe** |

The engine draws bubbles + the result sprite above the pot (~y200) and the ≤24 particle burst
on the canvas.

## ingredients.svg — 9 bottles + mix colours
`ing-tuli #ff8a4c · ing-vesi #7cc0ff · ing-myrkky #3aa64a · ing-tahti #ffd264 · ing-kukka
#e8452f · ing-sammakko #2b7d39 · ing-kivi #7a6f86 · ing-hunaja #ffb43d · ing-lumi #cfe8ff`
(the baked contents colour of each = its mix colour; full table in DESIGN §3).
Motion: on tap, the bottle tips and a drop falls into the pot (`glug`); the pot `liquid`
recolours to the running average.

## results.svg — 14 result sprites
`result-hoyry, result-pamaus, result-sammakko, result-sateenkaari, result-kukka, result-jaa,
result-kutistuu, result-haju, result-kimallus, result-kulta, result-tahtisade, result-kupla,
result-kasvaa, result-fizz`. Reaction table (which recipes → which result) + burst colours in
DESIGN §4. Motion: fade-in + soft rise above the pot, hold ~1.8 s, fade. `kasvaa`/`kutistuu`
may also briefly scale the whole pot up/down with a comedic slide-pitch.

## kirja.svg
14 recipe slots (centres in the file header). Engine draws each discovered result mini + name;
undiscovered = grey "?". Tap a found slot to read it big. Static background.

## door.svg
Static hub tile (bubbling cauldron on a fire). Engine may apply the shared hover "lift".
(The tile also tags its potion as `#liquid` for consistency, but it is not animated.)

---

## Colour / outline convention
Flat palette fill + a darker palette shade for the stroke, `stroke-width` ~4 (thinner on tiny
details), round caps & joins. Glass uses `fill-opacity` (not a filter). Ingredient contents &
result bursts use the mix/burst colours in DESIGN §3–4. One `linearGradient` per scene
(`#lab`); cauldron glow, fire embers, steam and bubble bodies are low-opacity solids /
fill-opacity. **No clipPath, no filters, no blur, no masks.** Palette only.
