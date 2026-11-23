# 05 · Taikapata — DESIGN

*Game UX Designer B · design + content + SVG art. Logic/HTML/animation/colour-mix are the lead
engineer's. Same shared rules, palette, perf caps, 1024×600 stage, inline-SVG, no-flash /
no-speed / no-lose, simple Finnish as rounds 1–3.*

A cosy alchemist's cauldron over a little fire. The child drops **readable-Finnish
ingredients** into the pot (the liquid blends colour with a *glug*), presses **sekoita**, and a
**combination-dependent reaction** fizzes, pops, steams, sparkles or hops out — lots of calm,
funny outcomes. **tyhjennä** empties. Every reaction discovered is saved in the
**reseptikirja** (reading + replay). No fail, no timer, self-paced.

The POC (`poc/05-taikapata.html`): 4 ingredients, drop 2, one of ~5 reactions. This expands to
**9 ingredients, a full 36-pair reaction matrix + super-recipes → 14 result types**, a recipe
book, and lots of gags.

> NOTE for engine: the POC used a `clipPath` for the liquid — the shared rules forbid masks/
> clips. My `scene.svg` liquid is a pre-shaped path that already fits the pot interior (no
> clip). Recolour its `fill`; no clipping needed.

---

## 1. Core loop (expanded)

1. **Tap an ingredient** on the shelf → it drops into the pot (`glug`), the **liquid blends
   colour** (engine averages the ingredient RGBs), the level nudges up. Up to **3** at once.
2. **sekoita** → soft bubbling, then the **reaction** for that set: a result sprite pops above
   the pot, a ≤24 particle burst, a message, and a sound. (See the table in §4.)
3. The reaction is logged in the **reseptikirja** (if new, a happy chime + celebrate).
4. **tyhjennä** empties the pot back to neutral. Mix again, forever.

Replay = 36 pairs + supers to discover, the recipe book to fill, and the sheer fun of mixing.
No levels, no scores, no wrong answers (unknown combos give a pleasant fizz).

---

## 2. Screens / states + transitions (calm)

- **A · Paja (lab):** cosy cave lab. Ingredient **shelf across the top** (9 bottles, readable
  names). **Cauldron** centre over a gentle fire. Buttons: **sekoita** (big), **tyhjennä**,
  **reseptikirja**, **koti**.
- **B · Reseptikirja:** a warm book of the 14 reaction types — discovered ones show their
  result sprite + name; undiscovered are a soft grey "?". **takaisin** returns.

Transitions: 250 ms cross-fade. Ingredient drop, liquid colour-blend, bubble rise, result
pop, fire flicker — all soft easing, **no flash/blink/strobe**. The fire flicker is a gentle
bounded sway (engine), never a strobe. Bursts are canvas, ≤24, time-based, hard-cleared.

---

## 3. Ingredients (9) — readable Finnish + mix colour

Each is a shelf bottle/jar sprite with its name. The **colour** is what the engine averages to
tint the liquid (cheap RGB mix). All palette hex.

| id | nimi | container look | mix colour |
|---|---|---|---|
| ing-tuli | **tuli** | bottle, flame inside | ember `#ff8a4c` |
| ing-vesi | **vesi** | bottle, droplet | sky `#7cc0ff` |
| ing-myrkky | **myrkky** | bottle, bubbles | leaf `#3aa64a` |
| ing-tahti | **tähti** | bottle, star | gold `#ffd264` |
| ing-kukka | **kukka** | bottle, flower | lava `#e8452f` |
| ing-sammakko | **sammakko** | jar, frog face | leaf-dark `#2b7d39` |
| ing-kivi | **kivi** | jar, rock | stone `#7a6f86` |
| ing-hunaja | **hunaja** | honey jar, drip | amber `#ffb43d` |
| ing-lumi | **lumi** | bottle, snowflake | star `#cfe8ff` |

Empty-pot base liquid colour: rock-dark `#4a4150` (neutral).

---

## 4. Reaction table (EXPLICIT — order doesn't matter)

**All 36 ingredient pairs are mapped** (no gaps), plus 3 super-recipes. Unknowns (a lone
ingredient, or a 3-set not listed) → **fizz** (the pleasant default). Grouped by **result**:

| result (id) | message | recipes (pairs, order-free) |
|---|---|---|
| **höyry** `result-hoyry` | `sihisee! höyryä` | tuli+vesi · tuli+lumi |
| **pamaus** `result-pamaus` | `PAM! pieni pamaus` | tuli+myrkky · tuli+kivi |
| **sammakko** `result-sammakko` | `kvak! sammakko!` | tuli+sammakko · vesi+myrkky · vesi+sammakko · kukka+sammakko · sammakko+kivi · sammakko+hunaja |
| **sateenkaari** `result-sateenkaari` | `oho! sateenkaari!` | vesi+tähti |
| **kukka** `result-kukka` | `kukka puhkesi!` | vesi+kukka · kukka+hunaja |
| **jää** `result-jaa` | `jäätyi!` | vesi+lumi · myrkky+lumi · kukka+lumi · sammakko+lumi · hunaja+lumi |
| **kutistuu** `result-kutistuu` | `pikkuruiseksi!` | myrkky+tähti · kivi+lumi |
| **haju** `result-haju` | `PÖH! löyhkä!` | myrkky+kukka · myrkky+kivi · myrkky+hunaja |
| **kimallus** `result-kimallus` | `taikaa! kimalletta` | tähti+kukka · tähti+sammakko · tähti+kivi |
| **kulta** `result-kulta` | `kultaa!` | tuli+hunaja · tähti+hunaja |
| **tähtisade** `result-tahtisade` | `tähtisade!` | tuli+tähti · tähti+lumi |
| **kupla** `result-kupla` | `iso kupla!` | vesi+kivi · vesi+hunaja · kivi+hunaja |
| **kasvaa** `result-kasvaa` | `se kasvaa isoksi!` | tuli+kukka · myrkky+sammakko · kukka+kivi |
| **fizz** `result-fizz` | `pulp pulp... kuplia` | *default / unknown* |

**Super-recipes (3 ingredients):** tuli+vesi+tähti → **sateenkaari** · tähti+kukka+hunaja →
**kulta** · vesi+lumi+tähti → **jää** (taikajää).

**Counts:** 9 ingredients · 36 pair recipes + 3 supers = **39 recipes** → **14 result types**.

Each result also gets a **burst colour** for the engine's particles:
hoyry=cream `#fff7e6` · pamaus=ember `#ff8a4c` · sammakko=leaf `#3aa64a` · sateenkaari=multi
(cycle red/orange/gold/green/sky) · kukka=lava `#e8452f` · jää=star `#cfe8ff` · kutistuu=sky
`#7cc0ff` · haju=leaf-dark `#2b7d39` · kimallus=gold `#ffd264` · kulta=amber `#ffb43d` ·
tahtisade=gold `#ffd264` · kupla=sky `#7cc0ff` · kasvaa=teal `#46c4a8` · fizz=teal `#46c4a8`.

---

## 5. Results (14 sprites) — `art/results.svg`

Each pops above the pot (~0.3 s fade-in, soft rise, ~1.8 s hold, fade). Shared box
`0 0 160 160`, centred (80,80).

| id | shows |
|---|---|
| result-hoyry | 3 steam puff clouds rising |
| result-pamaus | soft comic burst ("POW" star) |
| result-sammakko | a happy green frog |
| result-sateenkaari | a 5-band rainbow arc |
| result-kukka | a flower in bloom |
| result-jaa | ice crystal / snowflake |
| result-kutistuu | shrinking rings around a tiny dot |
| result-haju | a green stink cloud + wavy lines + 2 flies |
| result-kimallus | a cluster of sparkles |
| result-kulta | 3 stacked gold coins + sparkle |
| result-tahtisade | falling stars with trails |
| result-kupla | one big shiny bubble |
| result-kasvaa | a sprout growing tall (up-chevrons) |
| result-fizz | rising fizzy bubbles |

---

## 6. Reseptikirja (collection) — replay without scores

- `art/kirja.svg`: a warm book with **14 recipe slots**. Each discovered reaction fills its
  slot with the result sprite + its **name**; undiscovered = soft grey "?".
- Gentle line *"N / 14 löydetty"* — a count, never a score.
- Tap a found slot to read its name big + (optionally) show its recipe hints.
- Replay engine: 39 recipes → lots to discover; "find all 14 reactions" is a calm open goal.

Persistence: `localStorage` if the 4.1 WebView allows; else per-session.

---

## 7. Audio cue list (small reusable set · 22050 Hz PCM WAV)

| name | one-line description |
|---|---|
| `glug` | pehmeä "glug" — aines putoaa pataan |
| `pulp` | matala kupliva poreilu — sekoituksen aloitus |
| `pamaus` | pehmeä matala "pam" + kohina — pamaus |
| `hoyry` | pehmeä sihinä/kohina — höyry |
| `kvak` | kaksi nopeaa "kvak"-nuottia — sammakko |
| `kimallus` | nouseva kirkas helinä — kimallus / tähtisade |
| `sateenkaari` | lempeä nouseva liukusävel — sateenkaari |
| `kasva` / `kutistu` | nouseva / laskeva liukusävel — kasvaa / kutistuu |
| `pop` | pehmeä poksahdus — iso kupla puhkeaa |
| `jaa` | hento kristallikilahdus — jäätyy |
| `poh` | hassu matala "pöh" — löyhkä |
| `kolise` | pieni kolahdus — kulta/kolikot |
| `tyhjenna` | laskeva "slurp" — pata tyhjenee |
| `fanfaari` | = jaettu `success.wav` — uusi resepti löytyi |

Small & reusable: drop/mix, a handful of reaction beds, UI blips, shared fanfare.

---

## 8. Funny beats (specific gags)

- **sammakko** hops out with a "kvak!" (6 recipes make frogs — the most common gag).
- **haju** (PÖH!) spawns a green stink cloud with two little flies buzzing.
- **kutistuu / kasvaa** make the whole pot briefly shrink / grow with a comedic slide-pitch.
- **sateenkaari** arcs out of the pot calmly — pretty, not loud.
- **kulta**: the liquid turns gold and 3 coins plop out (`kolise`).
- **Overfill gag:** tapping a 4th ingredient makes the pot burp a bubble + "pata on täynnä!".
- **tähtisade:** a few stars shoot up and drift down (he loves stars).
- **Random flavour:** engine may vary the message wording slightly for repeats to keep it fresh.

---

## 9. Success / celebrate moments

Discovering a **new** reaction fires the shared `celebrate()` (≤24-particle confetti, rotating
Finnish praise banner, `success.wav`) and drops the result into its reseptikirja slot, banner
reading **"Uusi resepti!"** / **"Taikaa!"**. Always reachable by mixing; rewards curiosity.

---

## 10. Hub door

`art/door.svg` (viewBox `0 0 240 240`): wood-framed night tile (matching the set) with a chunky
**bubbling cauldron** over a little fire, a couple of bubbles and a star — instantly "the
potion game" to a 5-year-old. Flat fills, thick rounded outlines, palette only, no filters.

---

## 11. Performance budget (within device caps)

- **scene.svg** (lab + cauldron + fire) ≈ 45 nodes; one `linearGradient` (`#lab` back wall)
  only — the single gradient in the scene; cauldron glow & fire embers are low-opacity solids.
- **ingredients.svg** 9 sprites (~7 nodes each); the shelf row shows ~9 (~63 nodes) but that's
  the only content up top — fine.
- **results.svg** 14 sprites; only ONE is shown at a time above the pot.
- **kirja.svg** book ≈ 20 nodes; engine clones up to 14 result minis (~14 × ~6 = ~84) on that
  screen only — acceptable.
- **No filters, no feGaussianBlur, no masks, no clipPath, no blurred shadows.** The liquid is a
  pre-shaped path (no clip). Glows/fire/steam bodies are low-opacity solid shapes. Reaction
  bursts & bubbles are canvas, ≤24, time-based, hard-cleared.
- Animation is the engine's and bounded: ingredient drop, colour-blend tween, bubble rise,
  result pop, gentle fire flicker, shrink/grow squash. No infinite rAF.
- **Flag:** nothing heavy. The shelf (9 bottles) and the reseptikirja (14 minis) are the
  busiest, both well under the ~160-node cap and both static. No concern.
