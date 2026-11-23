# 03 · Dinon luut — DESIGN

*Game UX Designer A · Seikkailuhuone / Adventure Room*
*Target: Acer Iconia B1 (Android 4.1, PowerVR SGX531) + modern browsers. One codebase, inline SVG on a 1024×600 stage. Shared palette + perf caps.*

---

## 1. Concept + core loop

A calm **dig-and-reveal** game. The screen is a sandy **dig pit** covered by a
coarse grid of sand tiles. The child **brushes tiles away one by one** (soft brush
sound, little dust puff); under the sand a **dinosaur skeleton** slowly appears.
A big readable counter shows **"luut: n/N"**. When the whole skeleton is uncovered
→ it reads as a full dino, does a gentle funny "comes-alive" roar, and
**celebrate()** fires. The dino is added to the **löytökirja** (find-book / museum).

No timer, no fail, fully self-paced. Brush as slowly or fast as you like; tiles
never come back while you're digging. The joy is the reveal + the surprise of
*which* dino it is + the giggle objects buried in the sand.

**Loop:**
1. A random skeleton is hidden under a fresh sand grid (child doesn't know which).
2. Brush tiles → dust puff + bones appear underneath.
3. Each bone-zone fully uncovered → chime + "löysit luun!" + counter n/N ticks up.
4. Occasionally a **surprise object** (rubber duck, rock, gem…) turns up → giggle.
5. All bones found → the dino "wakes" (soft roar, jaw opens) → confetti + praise +
   fanfare → its name appears → it joins the löytökirja.
6. **"kaiva uusi"** button → a new random skeleton + fresh sand. **"löytökirja"**
   button → browse every dino dug up so far (names = reading practice).

---

## 2. Scenes + states (all calm)

- **dig.svg** — the dig pit. States: *buried* (full sand grid) → *digging* (tiles
  fading, bones showing, counter rising) → *complete* (skeleton whole, roar,
  celebrate). Then *new* (fresh grid, new skeleton) on "kaiva uusi".
- **museum.svg** (löytökirja) — a cosy find-book of the 5 dinos, each with its
  name; undiscovered ones show a "?" card. Browse-only, calm.
- Transitions: soft ~400 ms crossfade between dig ↔ museum, and a gentle fade when
  loading a new dig. No slide, no speed.

The skeleton and surprise objects are **not baked into dig.svg** — the engine drops
the chosen `skel-*.svg` + surprise sprites into the `#digContents` slot (which sits
*under* `#sandGrid`), then lays the sand tiles on top.

---

## 3. Sand grid spec (coarse, device-light)

**7 columns × 4 rows = 28 tiles** (within the ~24–32 cap; NOT 60).

- Pit interior origin: **x0 = 120, y0 = 180**.
- Tile size: **112 wide × 85 tall**.
- Tile at column `c` (0–6), row `r` (0–3): `x = 120 + 112*c`, `y = 180 + 85*r`.
- Pit spans x 120→904 (784 wide), y 180→520 (340 tall).
- Tile id: **`#t{r}_{c}`** (e.g. `#t0_0` top-left … `#t3_6` bottom-right). All live
  in group **`#sandGrid`**.
- Tiles alternate fill `#ffd264` / `#ffb43d` (checker, so the grid reads) with a
  thin `#b07a3c` stroke as the "brush me" grid lines.

Brush = tap a tile → that tile fades out (opacity 1→0, ~180 ms) + a small dust puff
(≤24 particles total, time-based, in code). The bone/surprise beneath is revealed.

**Counter model:** each skeleton is built from **N named bone-zones** (groups, §4).
A zone counts as "found" (+1, chime, "löysit luun!") when the last sand tile
overlapping its bounding box has been brushed away. N is the skeleton's bone-zone
count (5–6). "luut: n/N" is rendered by the engine as a DOM overlay.

---

## 4. Skeletons (5, randomized per dig) + Finnish names + bone-zones

Bones drawn in `#f3e7cc` (bone) with `#b07a3c` outline, positioned inside the pit
box. Each file `skel-*.svg` is a standalone scene (viewBox 0 0 1024 600) whose
`#skeleton` group the engine drops into `#digContents`. Bone-zones are sub-groups.

| file | name shown (reading practice) | real dino | bone-zones (N) |
|---|---|---|---|
| `skel-tyrannosaurus.svg` | **tyrannosaurus** | T. rex | `#bz_kallo` `#bz_selka` `#bz_kylki` `#bz_kasi` `#bz_jalka` `#bz_hanta` (6) |
| `skel-triceratops.svg` | **triceratops** | Triceratops | `#bz_kallo` (frill+3 horns) `#bz_selka` `#bz_kylki` `#bz_etujalka` `#bz_takajalka` `#bz_hanta` (6) |
| `skel-mammutti.svg` | **mammutti** | Mammoth | `#bz_kallo` (tusks) `#bz_selka` `#bz_kylki` `#bz_etujalka` `#bz_takajalka` (5) |
| `skel-pitkakaula.svg` | **pitkäkaula** | Brontosaurus / long-neck | `#bz_kallo` `#bz_kaula` `#bz_runko` `#bz_jalat` `#bz_hanta` (5) |
| `skel-raptori.svg` | **raptori** | Velociraptor | `#bz_kallo` `#bz_selka` `#bz_kylki` `#bz_jalka` `#bz_hanta` (5) |

Names are chosen as a reading ladder: **mammutti · raptori · pitkäkaula** are easy
syllables; **triceratops · tyrannosaurus** are the proud "big-word" stretches he
loves. Engine shows the name big on completion and in the löytökirja.

Bone-zone bounding boxes (for the tile→zone mapping) are listed in ART.md.

---

## 5. Hidden surprise objects (buried giggles)

0–2 per dig, at random tiles (engine places from `sprites.svg` under the sand).
Each: revealed on brush → short line + sound. Never required, pure delight.

| id | object | Finnish line | sound |
|---|---|---|---|
| `#sfx_ankka` | kumiankka (rubber duck) | "hihi! kumiankka hiekassa!" | duck |
| `#sfx_kivi` | tavallinen kivi (plain rock) | "vain kivi. ei luu." | clink |
| `#sfx_aarre` | aarre / jalokivi (gem) | "oho! aarre!" | clink |
| `#sfx_simpukka` | simpukka (shell / sea fossil) | "simpukka! vanha meri." | chime |
| `#sfx_hammas` | iso hammas (big tooth) | "iso hammas!" | chime |

---

## 6. Löytökirja (find-book / museum)

`museum.svg`: a warm little museum room with a **shelf of 5 display cards**, one per
dino, each with a baked **name plaque** (tyrannosaurus, triceratops, mammutti,
pitkäkaula, raptori). Each card holds a **`#q{n}` "?" placeholder** shown until that
dino is dug up; when found, the engine drops a small `#skeleton` (scaled) into the
card (`#slot{n}`) and hides the "?". Browse-only, calm — the child re-reads the
names of the dinos he has collected. A line like "olet löytänyt 3 dinoa."

Reached via **`#navBook`** from the dig scene; **`#navBack`** returns to digging.

---

## 7. Every interaction (tap → visual + sound + Finnish)

| action | visual | sound | Finnish |
|---|---|---|---|
| brush a sand tile | tile fades out + dust puff; bone/surprise shows | brush | *(mostly wordless; rare)* "harjaa vielä!" |
| bone-zone uncovered | the bone "pops" (quick scale 1→1.08→1) | chime | "löysit luun!" · counter "luut: n/N" |
| surprise uncovered | object pops in | duck/clink/chime | per §5 |
| skeleton complete | whole dino glows warm (faked), `#skull`/jaw opens, soft roar, then settles | roar → fanfare | "valmis! tämä on <nimi>." → celebrate() |
| `#navNew` "kaiva uusi" | fade → fresh sand grid + new random skeleton | page | "uusi kaivaus!" |
| `#navBook` "löytökirja" | crossfade to museum | page | "löytökirja" |
| `#navBack` (museum) | crossfade to dig | page | — |
| `#navHome` | back to the 8-door hub (engine) | tap | (house icon) |
| `#brush` tool | rests in a corner; engine moves it to the tapped tile | — | — |

---

## 8. Audio cue list (small, reusable, 22050 Hz PCM)

Shared `fanfare.wav` already exists (celebrate()), reused on skeleton complete.

| name | description | used by |
|---|---|---|
| `brush` | soft sandy sweep/scrape, ~250 ms | every tile brushed (core sound) |
| `chime` | bright 2–3 note sparkle | bone found, simpukka, hammas |
| `clink` | small stony/metallic tap | kivi, aarre |
| `duck` | squeaky rubber-duck honk | kumiankka gag |
| `roar` | small, SOFT, funny dino roar (not scary) | skeleton "wakes" on completion |
| `page` | gentle paper/book turn | new dig, open/close löytökirja |
| `tap` | soft pop | generic / nav buttons |

---

## 9. Funny beats

1. **Rubber duck in the dinosaur dig** — "hihi! kumiankka hiekassa!" squeak. Pure
   absurd delight (from the POC, kept).
2. **The "just a rock"** — brush a big promising lump, it's only `#sfx_kivi`: "vain
   kivi. ei luu." (mock disappointment).
3. **The wake-up roar** — when the skeleton is complete it briefly "comes alive":
   jaw opens, a soft roar, a warm glow — then it settles back into a still fossil.
   "roaar! ...vai sittenkin vanha luu." The dino pretends.
4. **Tiny T-rex arms** — the tyrannosaurus's `#bz_kasi` is a comically tiny arm bone.
5. **Mammutti tusks** — curl up in a big goofy smile shape.

---

## 10. Success / celebrate

On the last bone-zone: the full skeleton gets a faked warm glow (`#digGlow`,
low-opacity solid), `#skull` jaw opens with a soft `roar`, then the shared
**celebrate()** (confetti + rotating Finnish praise banner + `fanfare.wav`). Praise
pool: "sinä kaivoit dinon!", "hienoa!", "mahtavaa!", "valmis luuranko!". The dino's
name shows big, and its löytökirja card fills in. Then "kaiva uusi" offers another.

---

## 11. Replayability (no levels, no speed)

1. **Random skeleton** each dig (1 of 5) — you don't know which until you brush.
2. **Random surprise objects** (0–2 of 5) at **random tiles** each dig.
3. **Random tile order** is the child's own; the reveal path differs every time.
4. **Löytökirja** gives a gentle collection goal: dig up all 5 different dinos.
5. *(Future, free):* more skeletons drop in as new `skel-*.svg` files with no engine
   change — the set is open-ended.

5 skeletons × (0–2 surprises from 5, at 28 tile positions) = a fresh dig every time,
with no levels and no speed.

---

## 12. Hub door look (tile in the main 8-door hub)

`art/door.svg`, viewBox `0 0 240 240`. Night-mid tile (cohesion with the other
doors) + a sandy mound with a **cream dino skull** peeking out and a crossed
**bone** — instantly "dinosaur dig" to a 5-year-old. Chunky outlines, one little
sand-sparkle. No filters.

---

## 13. Performance budget

Caps: full scene < ~160 nodes · ≤24 particles · ≤~20 animated elements · no
filters/blur/masks · flat fills · fake glows only · **≤1 gradient per scene**.

| scene | est. nodes | gradient | animated | particles |
|---|---|---|---|---|
| door.svg | ~16 | 0 | 0 | 0 |
| dig.svg | ~70 (28 tiles + frame + nav + brush) | 1 (sky) | the 28 `#t*` tiles + brush | dust ≤24 |
| museum.svg | ~55 | 0 | ~5 (card reveals) | 0 |
| skel-*.svg each | ~18–24 bones | 0 | `#skull`/`#jaw` + glow | 0 |

Confirmations / flags for you (lead engineer):
- **Grid is 28 tiles** (7×4), the only "many small nodes" cost; well within the cap,
  and only a handful fade at once (one per tap). Each tile fade is a simple opacity
  tween — no filters.
- **Dust puff is the one emitter — cap ≤24, time-based, hard-stop** when the tile
  settles / scene exits (per the celebrate.js rAF-stall lesson).
- **One gradient** total (dig sky). Everything else flat.
- **Skeleton + surprises injected into `#digContents`** (declared before `#sandGrid`
  so they render underneath). I built each skeleton in scene coordinates inside the
  pit box so it drops in with no re-positioning.
- **Counter "luut: n/N" + names** are dynamic → render as your DOM overlay; the
  baked `<text>` in museum name-plaques and nav buttons is static (ASCII + ä).
- Tile→bone-zone mapping: I give each zone's bbox in ART.md; map a tile to a zone by
  bbox overlap, count the zone found when its last covering tile is cleared.

---

## 14. File map

```
design/luut/
  DESIGN.md              (this file)
  ART.md                 (id→motion, grid coords, skeleton bone-zone boxes)
  art/
    door.svg                 hub tile, 240×240
    dig.svg                  dig pit scene (sky, pit, #digContents slot, #sandGrid 28 tiles, brush, nav)
    museum.svg               löytökirja (5 dino cards + name plaques)
    skel-tyrannosaurus.svg   skeleton (6 bone-zones)
    skel-triceratops.svg     skeleton (6 bone-zones)
    skel-mammutti.svg        skeleton (5 bone-zones)
    skel-pitkakaula.svg      skeleton (5 bone-zones)
    skel-raptori.svg         skeleton (5 bone-zones)
    sprites.svg              brush, sand-tile ref, 5 surprise objects (ankka/kivi/aarre/simpukka/hammas)
  (dig/museum/skeleton scenes all viewBox "0 0 1024 600")
```
