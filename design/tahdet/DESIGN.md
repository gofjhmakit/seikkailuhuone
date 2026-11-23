# 04 · Tähtikuvio / Tähdet — DESIGN

*Game UX Designer B · design + content + SVG art. Logic/HTML/animation are the lead engineer's.
Same shared rules, palette, perf caps, 1024×600 stage, inline-SVG, no-flash / no-speed /
no-lose, simple Finnish as rounds 1–4.*

A calm night sky. The child connects the **numbered stars in order (1 → N)**; each tap lights a
star and grows a gold line to the next, until a **figure lights up** and gets its **Finnish
name** big. A wrong tap is a gentle *"kokeile tähteä X"* — never a penalty. **8 figures**, each
with its own star layout; pick one per visit or press **seuraava** → replay. Discovered figures
fill the **tähtikartta**. An occasional **slow shooting star** drifts by; an **owl hoots** on
completion. No timer, no fail, self-paced.

The POC (`poc/04-tahtitaivas.html`): one dragon, 7 stars, and **46 CSS-animated bg stars**
(the heaviness). This adds 8 figures + a collection and **caps the decorative sky at ~16 slow
stars**.

> DEVICE NOTE (the POC's weight): `sky.svg` has **16** decorative bg stars marked for a slow
> ~4 s twinkle (no flash) — engine may twinkle only a subset, or keep them static. The numbered
> **puzzle stars are separate** (one lightweight sprite cloned at the coords below).

---

## 1. Core loop

1. A figure's **numbered stars** appear (grey, with a small gold number). Tap **star 1**.
2. Correct tap → star turns **gold** (`twinkle`); from the 2nd on, a gold **line grows** from
   the previous star (`line`). Hint: *"hyvä! seuraava on X"*.
3. Wrong tap → the tapped star twinkles politely, hint *"kokeile tähteä X"*, soft tone. No
   penalty, no progress lost.
4. Last star → the **figure glows** gently (a soft wide line under the lines; NO flash), the
   **owl hoots**, the **name** shows big, **celebrate** fires, and it's added to the
   **tähtikartta**.
5. **seuraava** (or tapping the sky) loads the next figure (random or in order).

Replay = 8 figures to find + the tähtikartta to fill. No levels, no scores, no time.

---

## 2. Screens / states + transitions (calm)

- **A · Taivas (sky):** the night sky, one figure's numbered stars at a time, a hill +
  **owl** silhouette at the bottom, a crescent moon. Buttons: **koti** (top-left),
  **seuraava** (bottom-right), **tähtikartta** (top-right).
- **B · Tähtikartta:** 8 sky-window slots; discovered figures show their mini line-art + name,
  undiscovered are a soft "?". **takaisin** returns.

Transitions: 250 ms cross-fade between figures and screens. Line growth, star light, shooting
star, owl head-turn — all soft easing, **no flash/blink/strobe**. Decorative twinkle is a slow
4 s opacity ease (0.4↔1), never a flash. Nothing loops forever (bounded; shooting star is a
one-shot drift every ~9 s).

---

## 3. The 8 figures — star coordinates (1024×600), connect order, finished art

Coordinates are **(x,y) in the 1024×600 stage**, listed **in tap order 1→N**. `closed:true`
means the engine draws a final line **N→1** on completion (to close the outline); `open` figures
stop at N. The engine draws the number label near each star (e.g. at (x+18, y−30)).

### 1 · lohikäärme (dragon) — 7 stars · open
`1(770,175) 2(685,215) 3(590,235) 4(515,160) 5(465,290) 6(360,335) 7(270,300)`
Finished: a long dragon — head/jaw upper-right (1–3), a raised wing point (4), body dipping
through the belly (5), hind leg (6), tail tip left (7).

### 2 · dino (long-neck dinosaur) — 8 stars · closed
`1(180,370) 2(320,280) 3(450,245) 4(575,170) 5(620,205) 6(510,300) 7(455,440) 8(290,435)`
Finished: tail tip (1) up the back (2) to the neck (3), head + snout (4–5), down the throat
(6), front leg (7), hind leg (8); closes along the belly back to the tail.

### 3 · raketti (rocket) — 8 stars · closed
`1(512,150) 2(558,250) 3(612,385) 4(548,365) 5(512,425) 6(476,365) 7(412,385) 8(466,250)`
Finished: nose (1), right body (2), right fin tip (3), right base (4), flame tip (5), left base
(6), left fin tip (7), left body (8); closes to the nose — a rocket with two fins + a flame.

### 4 · laiva (sailboat) — 6 stars · closed
`1(350,410) 2(500,420) 3(650,410) 4(605,365) 5(500,180) 6(395,365)`
Finished: hull bottom (1–3), up to the right deck (4), the mast/sail peak (5), the left deck
(6); closes across the deck — hull + a big triangular sail.

### 5 · kissa (cat face) — 7 stars · closed
`1(410,175) 2(465,215) 3(560,215) 4(615,175) 5(600,300) 6(512,350) 7(425,300)`
Finished: left ear (1–2), across to the right ear (3–4), right cheek (5), chin (6), left cheek
(7); closes to the left ear — a cat face with two pointy ears.

### 6 · kala (fish) — 6 stars · closed
`1(360,290) 2(470,245) 3(600,215) 4(560,290) 5(600,365) 6(470,335)`
Finished: nose (1), back (2), tail top (3), tail notch (4), tail bottom (5), belly (6); closes
to the nose — a fish with a forked tail.

### 7 · talo (house) — 7 stars · closed
`1(410,430) 2(614,430) 3(614,315) 4(650,315) 5(512,215) 6(374,315) 7(410,315)`
Finished: floor (1–2), right wall (3), right eave (4), roof peak (5), left eave (6), left wall
(7); closes to the floor — a house with an overhanging roof.

### 8 · sydän (heart) — 8 stars · closed
`1(512,440) 2(425,360) 3(372,292) 4(425,232) 5(512,285) 6(599,232) 7(652,292) 8(599,360)`
Finished: bottom point (1), up the left side (2–3), left bump (4), centre dip (5), right bump
(6), down the right side (7–8); closes to the point — a heart.

**Totals:** 8 figures · **57 puzzle stars** (7+8+8+6+7+6+7+8). All within the safe area
(x≈180–770, y≈150–440), leaving the top for title/hint and the bottom edge for the hill/owl.

---

## 4. Tähtikartta (collection) — replay without scores

- `art/kartta.svg`: 8 sky-window slots. Each discovered figure shows its mini line-art + its
  **name** (reading); undiscovered = soft "?".
- Gentle line *"N / 8 löydetty"* — a count, never a score.
- Tap a found slot to see it big + hear its name. Replay: find the ones you're missing; press
  **seuraava** for another. No timers/levels.

Persistence: `localStorage` if the 4.1 WebView allows; else per-session.

---

## 5. Audio cue list (small reusable set · 22050 Hz PCM WAV)

| name | one-line description |
|---|---|
| `twinkle` | lyhyt kirkas helinä — tähti syttyy |
| `line` | pehmeä nouseva sävel (nousee tähti tähdeltä) — viiva kasvaa |
| `kokeile` | lempeä matala "pim" — väärä tähti (ei rangaistus) |
| `hoot` | pöllön huhuilu (kaksi pehmeää nuottia) — kuvio valmis |
| `shoot` | hyvin pehmeä laskeva viuhahdus — tähdenlento |
| `seuraava` | kevyt pyyhkäisy — seuraava kuvio |
| `fanfaari` | = jaettu `success.wav` — uusi tähtikuvio löytyi |

Small & reusable: twinkle/line/kokeile for the puzzle, hoot + fanfare for completion, shoot +
seuraava for ambience/flow.

---

## 6. Funny beats (specific gags)

- **The owl.** Sits on a branch at the bottom; on completion it **hoots** and **turns its
  head** (engine). Rarely blinks while you play.
- **Slow shooting star.** Drifts across every ~9 s; occasionally a slightly bigger one.
- **Polite wrong tap.** A wrong star gives a gentle twinkle + *"kokeile tähteä X"* — friendly,
  never a buzzer.
- **Completion sparkle wave.** When done, the stars sparkle in sequence (a gentle wave, not a
  flash).
- **Figure flourish.** On completion the engine may give a tiny thematic wink — the dragon
  puffs one star, the fish wiggles a line, the rocket's flame-star pulses once (soft).
- **Sleepy star.** Idle, a decorative star rarely dims to a slow "yawn" and brightens again.

---

## 7. Success / celebrate moments

Completing a figure fires the shared `celebrate()` (≤24-particle confetti, rotating Finnish
praise banner, `success.wav`) + the owl hoot + the **name** big (*"lohikäärme!"*), and the
figure drops into its tähtikartta slot, banner reading **"Löysit tähtikuvion!"** / **"Hieno!"**.
Always reachable by connecting the dots; rewards finishing, never winning.

---

## 8. Hub door

`art/door.svg` (viewBox `0 0 240 240`): wood-framed night tile (matching the set) with a little
**constellation** — 5 gold stars joined by thin lines into a tiny figure, plus a big star and a
crescent moon. Flat fills, thick rounded outlines, palette only, no filters. Instantly "the
star game" to a 5-year-old.

---

## 9. Performance budget (within device caps)

- **sky.svg** ≈ 30 nodes: one `linearGradient` (`#sky`) only; **16** decorative bg stars
  (slow twinkle or static), a crescent moon, a hill + owl silhouette, one shooting-star
  element. Well under the ~160 cap.
- **Puzzle layer:** at most ONE figure at a time = N star sprites (6–8 × ~2 nodes) + up to N
  grown lines (`<line>`, 1 node each) + the finished glow line ≈ **≤20 nodes**. Scene total
  (sky + one figure) ≈ **50 nodes**.
- **figures.svg** holds all 8 finished line-arts (~73 nodes total) but only one group is ever
  shown; the tähtikartta clones 8 **minis** (~8 × ~9 = ~72) on its own screen — fine.
- **No filters, no feGaussianBlur, no masks, no clipPath, no blurred shadows.** The "glow" on a
  finished figure and on the shooting star is a **low-opacity solid** wide line / shape, not a
  blur. Confetti is the shared canvas burst (≤24, time-based, hard-cleared).
- Animation is the engine's and bounded: star light (opacity/scale), line grow (one tween per
  line), slow twinkle (opacity ease), shooting-star one-shot drift, owl head-turn. **No 46-star
  rAF storm** (the POC's problem) — decorative stars ≤16, slow, CSS/opacity only.
- **Flag:** the one thing to watch is decorative stars — kept at **16** and slow by design.
  Nothing else is a concern (this game is light).
