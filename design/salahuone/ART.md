# 06 · Salahuone — ART.md

*SVG id → what it is + the motion the engine applies. All motion is time-based
(`Date.now()` delta), eased, capped, and hard-stopped on scene exit. No filters;
every "glow" is a low-opacity solid shape whose opacity the engine tweens. Default
stroke 4, rounded caps/joins (set once on each `<svg>`).*

**Shared conventions (every themed room 02–10):**
- `#navHome` — house button, top-left. Tap → crossfade to `room01-eteinen`.
- Edge nav groups `#navUp` / `#navDown` / `#navLeft` / `#navRight` / `#navBack` —
  tap → crossfade to the room named on the button (targets in the table below).
- `.hot` class = a tappable hotspot. On `:active`, drop opacity to ~0.85 (POC does
  this) for press feedback. Nav crossfade ≈ 400 ms; never a fast slide.
- `#dim` (where present) — full-stage rect; fade opacity 0.45↔0 for light on/off.

## Navigation map (hotspot → target room)

| scene | hotspot | → room |
|---|---|---|
| room01-eteinen | `#doorOlohuone` | room03-olohuone |
| room01-eteinen | `#doorKasvihuone` | room05-kasvihuone |
| room01-eteinen | `#doorKeittio` | room02-keittio |
| room01-eteinen | `#stairsUp` | room04-kirjasto |
| room01-eteinen | `#trapdoor` | room09-kellari |
| room02-keittio | `#navHome` / `#navDown` | eteinen / room09-kellari |
| room03-olohuone | `#navHome` / `#navRight` | eteinen / room05-kasvihuone |
| room04-kirjasto | `#navHome` / `#navUp` / `#navRight` | eteinen / room07-ullakko / room06-paja |
| room05-kasvihuone | `#navHome` / `#navLeft` | eteinen / room03-olohuone |
| room06-paja | `#navHome` / `#navUp` / `#navLeft` | eteinen / room07-ullakko / room04-kirjasto |
| room07-ullakko | `#navHome` / `#navUp` / `#navDown` | eteinen / room10-tahtitorni / room04-kirjasto |
| room08-luuhuone | `#navHome` / `#navBack` | eteinen / room09-kellari |
| room09-kellari | `#navHome` / `#navDown` | eteinen / room08-luuhuone |
| room10-tahtitorni | `#navHome` / `#navDown` | eteinen / room07-ullakko |

---

## door.svg (hub tile, 240×240)
Static. No animation. (If you ever want life: a 2 s ease on the keyhole-glow
opacity 0.28↔0.4 — gentle, no strobe.)

## sprites.svg (overlay atlas — take each `<g id>`, drop its translate, reposition)
| id | what | motion |
|---|---|---|
| `#spr_key` | golden key | fade in at its hiding spot → eased fly to the key pocket |
| `#spr_mouse` | mouse | fade/scale in at a niche; on tap, a small hop (translateY) |
| `#spr_cheese` | cheese wedge | drops in (translateY, ease-out bounce) at 3/3 mice |
| `#spr_star` | star-stone (main collectible) | fade in at a niche; on tap, float to the `tähtikiviä` counter; slow idle twinkle (opacity 0.85↔1) |
| `#spr_smokering` | dragon smoke ring | translateY up ~40 px + opacity 1→0 over ~1.2 s |
| `#spr_cluecard` | clue card (enlarged) | scale 0.9→1 on open; engine draws the Finnish line + drops a clue-icon in the slot |
| `#spr_arrow` | nav arrow button | static; rotate for direction |
| `#spr_home` | home button | static |

## treasures.svg (1 of 8 random, over the open chest)
`#tr_coins #tr_starmap #tr_egg #tr_hat #tr_pearl #tr_ship #tr_candy #tr_wand` —
each: fade in + translateY up ~40 px (rise out of the chest), settle with a tiny
ease. No looping.

## clue-icons.svg (mini icon dropped into the clue card)
`#ic_picture #ic_rug #ic_plant #ic_book #ic_musicbox #ic_horse #ic_barrel #ic_jar`
— static; engine picks the one matching the key spot.

---

## room01-eteinen.svg
| id | motion |
|---|---|
| `#hallLamp` → `#hallGlow` | tap: toggle `#dim` 0.4↔0; `#hallGlow` opacity 0↔0.25 |
| `#taskBoard` | tap: scale 1→1.04 pop; engine overlays goal text + live `0/5` star-stone count |
| `#clueNote` | tap: small lean (rotate ±4°) / swap in `#spr_cluecard`; shows the key hint |
| `#coatrack` → `#hallHat` | tap: `#hallHat` swings (rotate ±10° about its brim), may slide off |
| `#mirror` → `#mirrorStar` | tap: `#mirrorStar` opacity 0→1→0 twinkle |
| `#mat` | tap: fold up a corner (scaleY 1→0.8 + translateY) with a dust puff |
| `#doorOlohuone` `#doorKasvihuone` `#doorKeittio` | nav; door panel eases ajar (rotate ~ -8° about hinge) then crossfade |
| `#stairsUp` | nav (→kirjasto); crossfade |
| `#trapdoor` | nav (→kellari); ring lifts, crossfade |
| `#dim` | hall light overlay |

## room02-keittio.svg
| id | motion |
|---|---|
| `#cupboard` → `#cupDoorL` / `#cupDoorR` | tap: doors swing open (rotate about outer edges, ±70°) |
| `#pot` → `#potBubbles` / `#steam` | tap: `#potBubbles` circles rise+pop (loop ~1 s while "boiling"); `#steam` opacity 0.3↔0.8 drift up |
| `#kettle` → `#kettleSteam` | tap: `#kettleSteam` opacity 0→0.6 + drift up; tiny kettle shake |
| `#faucet` → `#drop` | tap: `#drop` opacity 0→1, translateY 364→430, fade at sink |
| `#fruitbowl` → `#apple` | tap: `#apple` rolls (translateX + rotate), settles |
| `#broom` → `#broomBody` | tap: `#broomBody` tips over (rotate ~70° about its base), slow |
| `#mousehole` → `#mouseK` | tap: `#mouseK` opacity 0→1 + peek up (translateY) then back |
| `#navHome` | → eteinen |
| `#navDown` | → kellari |

## room03-olohuone.svg
| id | motion |
|---|---|
| `#win` / `#winstar` | tap: `#winstar` slow twinkle (opacity/scale 0.9↔1.1); rare shooting-star overlay |
| `#lamp` → `#lampGlow` | tap: toggle `#dim` 0.45↔0; `#lampGlow` opacity 0↔0.25 |
| `#fireplace` → `#flames` / `#marsh` | `#flames` gentle sway (scaleY 0.95↔1.08 about base, + ≤12 time-based embers); after 3 taps `#marsh` opacity 0→1 |
| `#clock` → `#clockDoor` / `#clockBird` | tap: `#clockDoor` slides/rotates open, `#clockBird` opacity 0→1 + out (translateX) then back |
| `#picture` → `#pictureFrame` | tap: `#pictureFrame` rotate ~22° about top-left nail (735,100) |
| `#shelf` → `#book1` | tap: `#book1` slides out+up (translate) + dust puff |
| `#plant` → `#plantLeaves` | tap: `#plantLeaves` sway (rotate ±5° about pot) |
| `#cat` | tap: jump (translateY -40, ease-out, land); rare variant = stretch (scaleX) only |
| `#rug` → `#rugCorner` | tap: `#rugCorner` folds up (rotate about its inner edge) + dust |
| `#navHome` / `#navRight` | → eteinen / kasvihuone |
| `#dim` | room light overlay |

## room04-kirjasto.svg
| id | motion |
|---|---|
| `#shelfBig` → `#book1` | tap: `#book1` slides out + dust |
| `#ladder` | tap: slides along the shelf (translateX ~ +60, ease, back) |
| `#globe` → `#globeBall` | tap: `#globeBall` spins (the continent paths translateX loop ~2 s; or rotate the group) |
| `#owlLib` → `#owlHead` | tap: `#owlHead` rotate ±18°; `#owlEyeL/#owlEyeR` blink (scaleY→0) |
| `#candle` → `#candleFlame` | tap: `#candleFlame` lean (rotate ±6° about wick), gentle, no strobe |
| `#secretShelf` → `#secretPanel` / `#secretBook` / `#secretNiche` | tap `#secretBook`: `#secretPanel` swings aside (rotate ~ -75° about left edge) revealing `#secretNiche` (a star-stone/key niche) |
| `#chair` | tap: cushion (top ellipse) squish (scaleY 0.9↔1) |
| `#navHome` / `#navUp` / `#navRight` | → eteinen / ullakko / paja |

## room05-kasvihuone.svg
| id | motion |
|---|---|
| `#roof` → `#sun` / `#sunGlow` | tap: `#sunGlow` opacity 0.22→0.4, `#sun` scale 1→1.06 (brighten), ease back |
| `#bigPlant` → `#bigLeaves` | tap: `#bigLeaves` sway (rotate ±5°) |
| `#snapPlant` → `#snapMouth` | tap: `#snapMouth` jaws open wide then snap shut once (rotate the two halves), grin |
| `#can` → `#canBody` / `#flowerBloom` | tap: `#canBody` tips (rotate ~ -30° about spout), `#flowerBloom` opacity 0→1 + scale 0.3→1 |
| `#butterfly` | tap: flutters to a new spot (translate along a short arc), wing flap (scaleX) |
| `#pots` | tap: each flower nods (rotate ±8° about stem base, staggered) |
| `#snail` | tap: inches forward *very* slowly (translateX ~ +24 over ~2 s) |
| `#navHome` / `#navLeft` | → eteinen / olohuone |

## room06-paja.svg
| id | motion |
|---|---|
| `#forge` → `#forgeFire` / `#forgeGlow` | tap: `#forgeFire` sway + ≤10 time-based sparks; `#forgeGlow` opacity 0↔0.3 |
| `#gears` → `#gearA` / `#gearB` | tap: `#gearA` rotate +θ, `#gearB` rotate -θ (meshed), ease, loop ~1.5 s |
| `#toolboard` → `#wrench` | tap: `#wrench` swings (rotate ±12° about its top peg) |
| `#robot` → `#robotArm` / `#robotEye` | tap: `#robotEye` opacity pulse (gentle), `#robotArm` waves (rotate ±25° about its shoulder) |
| `#bench` → `#benchDrawer` | tap: `#benchDrawer` slides out (translateX ~ +40) |
| `#hammer` → `#hammerHead` | tap: `#hammerHead` taps (rotate down ~20° about handle base, twice) |
| `#jack` → `#jackLid` / `#jackPop` | tap: `#jackLid` flips open, `#jackPop` opacity 0→1 + spring up (translateY -36, ease-out overshoot) |
| `#navHome` / `#navUp` / `#navLeft` | → eteinen / ullakko / kirjasto |

## room07-ullakko.svg
| id | motion |
|---|---|
| `#porthole` → `#bat` | tap: `#bat` opacity 0→1, slide across (translateX) then out |
| `#owl` → `#owlHead` | tap: `#owlHead` rotate ±18°; eyes blink |
| `#spider` → `#spiderBody` / `#thread` | tap: `#spiderBody` drops (translateY +160 along `#thread`), one leg waves, climbs back |
| `#crates` → `#crateLid` / `#toyPeek` | tap: `#crateLid` tilts up (rotate about left edge), `#toyPeek` opacity 0→1 |
| `#rockhorse` | tap: whole group rocks (rotate ±10° about rocker midpoint ~500,498), eases to rest |
| `#teddy` → `#teddyBody` / `#teddyArm` | tap: `#teddyBody` pops up (translateY -10), `#teddyArm` waves (rotate ±25°) |
| `#musicbox` → `#musicLid` / `#dancer` | tap: `#musicLid` opens (rotate about back edge), `#dancer` opacity 0→1 + slow spin (scaleX loop) |
| `#navHome` / `#navUp` / `#navDown` | → eteinen / tahtitorni / kirjasto |

## room08-luuhuone.svg
| id | motion |
|---|---|
| `#dino` → `#dinoHead` / `#dinoJaw` | tap: `#dinoHead` rotate ±12° about neck top; `#dinoJaw` opens (rotate about hinge) — soft roar |
| `#sandpit` → `#sandTiles` / `#buriedBone` | tap: fade out `#sandTiles` rects one by one (reveal `#buriedBone`); re-cover on re-enter |
| `#fossil` → `#fossilGlow` | tap: `#fossilGlow` opacity 0→0.35→0 |
| `#dinoEgg` → `#eggBody` | tap: `#eggBody` wobble (rotate ±6°), tiny crack |
| `#amber` → `#amberBug` | tap: `#amberBug` wiggles (translate/rotate tiny) |
| `#skull` → `#skullBody` / `#skullJaw` | tap: `#skullBody` quick shiver (translateX ±2 rattle); teeth chatter |
| `#footprint` | tap: dust puff (a particle pop), no transform needed |
| `#navHome` / `#navBack` | → eteinen / kellari |

## room09-kellari.svg
| id | motion |
|---|---|
| `#lantern` → `#lanternGlow` | tap: toggle `#dim` 0.5↔0; `#lanternGlow` opacity 0↔0.28 |
| `#jars` → `#firefly` | tap: jars jiggle (translateX ±2); `#firefly` opacity 0.4↔1 drift |
| `#barrel` → `#barrelLid` / `#frog` | tap: `#barrelLid` pops up, `#frog` opacity 0→1 + spring up (translateY -30), blink, back |
| `#mushrooms` → `#mushGlow` | tap: caps bob (translateY ±3); `#mushGlow` opacity 0.22→0.4 |
| `#dragon` → `#dragonEye` / `#dragonEyeOpen` / `#smokeRing` / `#dragonBelly` | tap: `#dragonBelly` slow breathe (scale 1↔1.03); `#smokeRing` rises+fades; `#dragonEye` hide / `#dragonEyeOpen` opacity 0→1→0 (peek) |
| `#bigchest` → `#chestLid` / `#chestGlow` | locked: `#chestLid` small shiver. With key: `#chestLid` rotate ~ -16° about back edge (432,436), `#chestGlow` opacity 0→0.3, overlay a `treasures.svg` sprite → `celebrate()` |
| `#navHome` / `#navDown` | → eteinen / luuhuone |
| `#dim` | cellar light overlay |

## room10-tahtitorni.svg (FINALE)
| id | motion |
|---|---|
| `#skyDome` → `#domeSlots` / `#domeBurst` | as star-stones are earned, engine drops `#spr_star`s into the 5 `#domeSlots` (fade+snap). With 5/5, tap: `#domeBurst` opacity 0→1 + scale 0.3→1.4 bloom; `#towerDragon` flies up across the sky; ≤24 soft star-fireworks (time-based) → `celebrate()` |
| `#telescope` → `#scope` | tap: `#scope` swings up (rotate ~ -14° about pivot 520,470); a star twinkles in the lens |
| `#moonGlobe` → `#moonGlow` | tap: `#moonGlow` opacity 0.18→0.35, moon scale 1→1.05 |
| `#starJar` | tap: inner stars sparkle (opacity pulse, staggered) |
| `#chart` → `#chartLines` | tap: `#chartLines` strokes opacity 0.5→1 (light up the dragon shape), dots brighten |
| `#rocket` → `#rocketBody` / `#rocketFlame` | tap: `#rocketFlame` opacity 0→1, `#rocketBody` lifts (translateY -40, ease) then settles back |
| `#towerDragon` → `#towerDragonFlame` | tap: wag (rotate ±4°), `#towerDragonFlame` opacity 0→1 puff; at finale it flies up through the dome |
| `#navHome` / `#navDown` | → eteinen / ullakko |

---

## Notes for the engineer
- **Pivots** given as (x,y) in the 1024×600 scene space; set `transform-origin`
  accordingly (or wrap-translate if the old WebKit ignores `transform-origin` on
  SVG — the POC uses `style.transformOrigin` on the element, which worked on 4.1).
- **Hidden overlays baked into scenes** (opacity 0 initially): `#marsh`,
  `#clockBird`, `#bat`, `#toyPeek`, `#dancer`, `#frog`, `#mouseK`, `#jackPop`,
  `#rocketFlame`, `#towerDragonFlame`, `#domeBurst`, `#dragonEyeOpen`,
  `#flowerBloom`, `#chestGlow`, all `*Glow`. Engine tweens their opacity/transform.
- **Key / mouse / star-stone / treasure / clue-icon** are NOT baked into scenes —
  they come from `sprites.svg` / `treasures.svg` / `clue-icons.svg` and the engine
  positions them at the chosen random niches (see DESIGN §4 niches, §9 pools).
- **Light toggles** (`#dim` + `*Glow`) start dim in eteinen/olohuone/kellari.
- Nav `<text>` labels are baked (incl. ä/ö). If you prefer DOM text for fonts,
  ignore the baked `<text>` — the arrow/door shapes still read on their own.
