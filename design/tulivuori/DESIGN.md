# 01 · Tulivuori — DESIGN

*Game UX Designer B · design + content + SVG art. Logic/HTML/animation are the lead
engineer's. Same shared rules, palette, perf caps, 1024×600 stage, inline-SVG, no-flash /
no-speed / no-lose, simple Finnish as round 1.*

A living volcano the child **pokes** to build pressure until it **erupts** — soft lava arcs,
a low rumble, and a **random silly object** sails out with its name written big (reading
practice). Pure cause-and-effect, impossible to lose, entirely self-paced. Expanded far past
the POC: a big object library, 4 selectable **eruption types**, reacting **critters**, a calm
**day↔night** toggle, and a **kokoelma** (little museum) that fills up as new objects fly out.

The POC (`poc/01-tulivuori.html`): poke → meter fills → eruption launches ONE emoji. This
keeps that heartbeat and builds a whole world around it.

---

## 1. Core loop (expanded)

1. **Poke the volcano** (big tap target). Pressure +~12%, the **paine** gauge fills, the
   crater **glow** grows, the cone gives a tiny shudder. Sound: soft `toks` + a rising pitch.
2. At **100%** it **erupts** in the currently-selected **type** (laava / savurenkaat / kivet /
   ilotulitus): ≤24 soft particle arcs + `jyrina` rumble, and **one random object** launches
   on a gentle arc, spins slowly, and lands soft — with its **Finnish name** shown big.
3. **Critters react** (duck, flap, peek). If the object is **new**, it's added to the
   **kokoelma** with a happy `loyto` chime + the shared celebrate (confetti + praise).
4. The volcano **settles** (glow fades, gauge empties, hint resets). Poke again any time.

No timer, no fail, no score. It never rushes and never ends. Freshness comes from the random
object, the 4 eruption moods, day/night, and filling the museum.

---

## 2. Screens / states + transitions (calm)

- **A · Tulivuori (main):** the scene. Poke target = the volcano. Left: paine gauge. Bottom:
  the 4 eruption-type chips + lever. Top-right: day/night toggle. A **kokoelma** button opens
  the museum. **koti** button top-left → hub.
- **B · Kokoelma (museum):** a shelf wall of 26 slots. Found objects show in colour with
  their name; not-yet-found show as a soft grey silhouette ("?"). A gentle count
  *"12 / 26 löydetty"*. **takaisin** returns. No scores, just collecting.

Transitions: 250 ms cross-fade between main and museum. Part/particle motion is soft easing,
arcs not strobe. **No flash, no blink, no twinkle.** The day↔night swap is a slow 400 ms
cross-fade of sky colours. Nothing loops forever — every motion is a bounded, time-based tween
with a hard stop (engine).

---

## 3. Every interaction — tap → result (visual + sound + Finnish)

| Child taps | Visual | Sound | Finnish text |
|---|---|---|---|
| the **volcano** (pressure < 100) | gauge fills a step, glow grows, cone shudders | `toks` + rising pitch | hint: `paina vielä!` |
| the **volcano** (hits 100) | **eruption** (selected type), object launches, critters react | `jyrina` + type sound + `viuh` | `PAM! se purkautuu!` |
| object lands, **new** | object drops into place, celebrate | `loyto` + `fanfaari` | `löysit: <nimi>!` |
| object lands, already seen | object rests then fades | soft `kops` | `<nimi>!` |
| **laava** chip | lever points to it, chip highlights | `naps` | `laava` |
| **savurenkaat** chip | lever points, highlights | `naps` | `savurenkaat` |
| **kivet** chip | lever points, highlights | `naps` | `kivet` |
| **ilotulitus** chip | lever points, highlights | `naps` | `ilotulitus` |
| **day/night** toggle | slow sky cross-fade; sun↔moon; stars fade in/out | `pyyh` (soft sweep) | — |
| **kokoelma** button | cross-fade to museum | `naps` | `kokoelma` |
| a museum **slot** (found) | slot lifts a touch, name shows big | `naps` | `<nimi>` |
| **takaisin** (museum) | cross-fade back | `naps` | — |
| **koti** | return to hub | `naps` | — |

---

## 4. Object library — the launchables (26) with Finnish names

Each sprite is a `<g id="obj-*">` in the shared **object space `0 0 100 100`**, centred at
**(50,50)**, within ~r40 so it can spin in flight without clipping. The engine launches a
random one on each eruption, shows its **name** big (lowercase, warm), and files it in the
museum. Short, readable, funny. (★ = rarer / extra-funny — engine may weight down.)

| # | id | nimi | what |
|---|---|---|---|
| 1 | obj-saapas | **saapas** | rubber boot |
| 2 | obj-kana | **kana** | hen |
| 3 | obj-kala | **kala** | fish |
| 4 | obj-kello | **kello** | alarm clock |
| 5 | obj-porkkana | **porkkana** | carrot |
| 6 | obj-harja | **hammasharja** | toothbrush |
| 7 | obj-sukka | **sukka** | sock |
| 8 | obj-banaani | **banaani** | banana |
| 9 | obj-ankka | **ankka** | rubber duck |
| 10 | obj-omena | **omena** | apple |
| 11 | obj-tahti | **tähti** | star |
| 12 | obj-sydan | **sydän** | heart |
| 13 | obj-kuppi | **kuppi** | mug |
| 14 | obj-hattu | **hattu** | top hat |
| 15 | obj-avain | **avain** | key |
| 16 | obj-pallo | **pallo** | ball |
| 17 | obj-kukka | **kukka** | flower |
| 18 | obj-kirja | **kirja** | book |
| 19 | obj-makkara | **makkara** | sausage |
| 20 | obj-etana | **etana** | snail ★ |
| 21 | obj-sammakko | **sammakko** | frog ★ |
| 22 | obj-luu | **luu** | bone |
| 23 | obj-kivi | **kivi** | rock |
| 24 | obj-raketti | **raketti** | rocket |
| 25 | obj-dino | **dino** | little dino ★ |
| 26 | obj-aarre | **aarre** | gem / treasure ★ |

Themed on purpose for this player: **luu, dino, kivi, raketti, tähti** (dinos / rocks / space)
plus the daft ones (**makkara, etana, sammakko, sukka**) for the giggles.

---

## 5. Eruption types (selected by the lever/valve)

All four still launch a random object; the **type** only changes the particle look + sound.
Particles are engine-drawn on the canvas, **capped ≤24**, time-based, soft arcs, hard-stopped.
Icons for the chips are in `art/icons.svg`.

| type | nimi (chip word) | particle spec (for engine) | sound |
|---|---|---|---|
| lava | **laava** | 18–24 blobs, colours ember `#ff8a4c` / amber `#ffb43d` / lava `#e8452f` / gold `#ffd264`; up-arc then gravity; fade over ~2.2 s | `jyrina` + low `pamaus` |
| smoke rings | **savurenkaat** | 4–6 slow rising ring puffs, stone `#7a6f86`/`#4a4150`, grow + fade, ~3 s; very calm | soft `huu` air-puff |
| rocks | **kivet** | 10–16 tumbling rock chunks, rock-dark `#4a4150`/stone `#7a6f86`, heavier arcs, small bounce on land | `jyrina` + `rojaus` tumble |
| fireworks | **ilotulitus** | 2–3 soft bursts of ≤8 sparks each (total ≤24), star `#cfe8ff`/gold `#ffd264`/teal `#46c4a8`/ember `#ff8a4c`; **gentle fade, NO strobe** | soft `pling` sparkle |

The lever visually points to the selected chip (the "valve" feel); the 4 chips carry the
reading practice (four new words). Default = **laava**.

---

## 6. Critters (the scene reacts) — ids in `scene.svg`

Little friends around the volcano base, each marked for a soft reaction on eruption (engine,
time-based, bounded):

| id | who | idle | on eruption |
|---|---|---|---|
| `critter-dino` | small green dino (left) | tiny breathing bob | **ducks** down behind its rock, pops back up after |
| `critter-bird` | bird on a rock (right) | — | **flaps up** a few px, settles |
| `critter-peek` | baby dino peeking behind a rock | — | **pops higher** to look, then hides |
| `critter-etana` | snail on a foreground stone | — | reacts **late & slowly** (the running gag) |

Funny bonus (engine): sometimes the launched object briefly lands **on a critter's head**
before sliding off.

---

## 7. Day ↔ night toggle (calm)

A sun/moon button (top-right). The child controls it — it never auto-cycles. On toggle:
slow 400 ms cross-fade of the **one** `sky` linearGradient's stops (day: day-sky `#a5d8ff` →
sky-accent; night: night-mid `#342a4e` → night-deep `#241a33`), `scene-sun` ↔ `scene-moon`
swap, `scene-stars` group fades in at night (static, no twinkle), hills tint darker. The crater
glow reads cosier at night. Pure mood variety, no gameplay change.

---

## 8. Kokoelma (collection / little museum) — replay without scores

- **26 slots** on a shelf wall (`art/museum.svg`). Each eruption that launches a **new**
  object fills its slot (colour sprite + name); unfound slots are a soft grey silhouette.
- Gentle progress line *"N / 26 löydetty"* — a count, never a score or timer.
- Browse any time; tap a found slot to hear/read its name big.
- **Replay engine:** random object × 4 eruption types × day/night → always something to see,
  and "find the ones you're missing" is a calm, open-ended goal. No levels, no speed.
- **Complete easter-egg:** when all 26 are found, the volcano wears a tiny party hat
  (`volc-partyhat`, hidden until then) — a soft once-off reward.

Persistence: save the found-set to `localStorage` if the 4.1 WebView allows; else per-session
is fine (finding still celebrates).

---

## 9. Audio cue list (small reusable set · 22050 Hz PCM WAV)

| name | one-line description |
|---|---|
| `toks` | pehmeä tömäys — soi joka painalluksesta (+ engine raises pitch with pressure) |
| `jyrina` | matala suodatettu kohina-jyrinä — purkauksen pohja (laava & kivet) |
| `pamaus` | pehmeä matala "pam" — purkauksen aloitus |
| `viuh` | nopea nouseva vihellys — esine sinkoaa ilmaan |
| `kops` | pehmeä kopsahdus — esine laskeutuu maahan |
| `huu` | pehmeä ilmahenkäys — savurenkaat-purkaus |
| `rojaus` | kevyt kivien kolina — kivet-purkaus |
| `pling` | lempeä kimalle-helinä — ilotulitus-purkaus |
| `loyto` | iloinen nouseva kilahdus — uusi esine kokoelmaan |
| `pyyh` | pehmeä pyyhkäisy — yö/päivä-vaihto |
| `fanfaari` | = jaettu `success.wav` — uuden löydön juhla |

Small and reusable: poke, three eruption beds (jyrina/huu/rojaus) + launch/land, plus the
three UI blips. All gentle, none harsh.

---

## 10. Funny beats (specific gags)

- **Silly cargo.** makkara, etana, sammakko, sukka, a lone boot sailing out of a volcano — the
  absurd objects are the core joke, amplified by the big readable name.
- **The slow snail.** `critter-etana` reacts a beat too late, every time — a reliable gag.
- **Object-on-head.** An object occasionally lands on a critter's head, teeters, slides off.
- **Smoke-ring peekaboo.** In savurenkaat, a critter pokes its head through a drifting ring.
- **Startled bird.** Flaps straight up and settles with a little wobble.
- **Volcano burp.** A rare tiny pre-eruption puff + a soft `huu` "burp" when poked near full —
  a cheeky tease before the real thing.
- **Party-hat volcano** once the museum is complete.

---

## 11. Success / celebrate moments

The celebrate is **finding a new object**: shared `celebrate()` (≤24-particle confetti burst,
rotating Finnish praise banner, `success.wav`) + the object dropping into its museum slot and
the banner reading **"Löysit uuden!"** / **"Hieno!"** / **"Hassu!"**. Always available by just
playing; rewards discovery, never winning.

---

## 12. Hub door

`art/door.svg` (viewBox `0 0 240 240`): wood-framed night tile (matching the set) with a chunky
**erupting volcano** — brown cone, amber/ember lava arc, a couple of soft sparks and a little
star — instantly "the volcano game" to a 5-year-old. Flat fills, thick rounded outlines,
palette only, no filters.

---

## 13. Performance budget (within device caps)

- **scene.svg** ≈ 90 nodes (volcano, sky, sun+moon+stars, hills, ground, 4 critters, rocks,
  gauge). One `linearGradient` (`sky`) only — **the single gradient in the whole game**; lava &
  everything else are flat fills. Under the ~160-node cap with headroom for the launched object
  + name text the engine adds.
- **objects.svg** 26 sprites, each 3–8 nodes; only ONE is ever in the scene at a time.
- **museum.svg** shelf frame ≈ 40 nodes; the engine clones object sprites into slots (26 ×
  ~5 = ~130) only on the museum screen, which has nothing else — acceptable, and can be paged
  if needed.
- **No filters, no feGaussianBlur, no masks, no blurred shadows.** Crater glow and the stage
  light-pool are low-opacity **solid** shapes. Particles are canvas, **≤24**, time-based, hard
  cleared (the POC's proven pattern + `celebrate.js` hardClear).
- Animation is the engine's and bounded: poke shudder (one transform ~90 ms), gauge fill
  tween, eruption burst ≤24, object arc, critter reactions, day/night 400 ms cross-fade. No
  infinite rAF.
- **Flag:** the only place approaching the node cap is the **museum screen** (26 sprites at
  once). It's a static screen with no particles/volcano, so it's fine on the SGX531; if a
  frame hitches on scroll, page it 13+13. Nothing else is a concern.
