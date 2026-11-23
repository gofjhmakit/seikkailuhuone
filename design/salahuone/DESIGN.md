# 06 · Salahuone — DESIGN

*Game UX Designer A · Seikkailuhuone / Adventure Room*
*Flagship point-and-click. Target: Acer Iconia B1 (Android 4.1, PowerVR SGX531) + modern browsers. One codebase, inline SVG on a 1024×600 stage. ONE room's SVG is in the DOM at a time (engine builds/tears down per navigation), so 8–10 rooms cost ~the same memory as one.*

---

## 1. Expanded concept — the baby dragon's secret house

Behind the hub door is not one room but a whole **cosy old house that belongs to a
friendly baby dragon**. You explore it Moomin-style: tap anything and *something
gentle and funny happens* — a sound, a wobble, a reveal. No timer, no score, no
way to lose, nothing to be scared of.

**10 scenes: an entrance hall (hub) + 9 themed rooms**, each its own
self-contained scene SVG:

| # | file | room | Finnish | the boy's loves it hits |
|---|---|---|---|---|
| 01 | `room01-eteinen.svg` | entrance hall / hub | eteinen | cosy landing, the task board, doors to everywhere |
| 02 | `room02-keittio.svg` | kitchen | keittiö | bubbling pot, whistling kettle, poke-and-giggle |
| 03 | `room03-olohuone.svg` | living room | olohuone | fireplace/fire, cat, cuckoo clock |
| 04 | `room04-kirjasto.svg` | library | kirjasto | books, globe, a secret shelf |
| 05 | `room05-kasvihuone.svg` | greenhouse | kasvihuone | a funny snapping plant, butterfly |
| 06 | `room06-paja.svg` | workshop | paja | gears, a silly robot, a glowing forge (fire!) |
| 07 | `room07-ullakko.svg` | attic | ullakko | dusty treasures, friendly spider, rocking horse |
| 08 | `room08-luuhuone.svg` | dino-bone room | luuhuone | **dinosaur skeleton**, dig the sand, fossils |
| 09 | `room09-kellari.svg` | cellar | kellari | the **sleeping baby dragon**, locked treasure chest |
| 10 | `room10-tahtitorni.svg` | observatory tower | tähtitorni | **telescope, stars, rocket**, the grand finale |

The house reads top-to-bottom like a tall cosy tower-cottage: cellar + dino room
below, hall + kitchen + living room + greenhouse on the ground, library + workshop
+ attic up, and the star tower at the very top.

---

## 2. Room graph + navigation (impossible to get lost)

**Hub-and-spoke with neighbours.** The hall (`eteinen`) is the heart. From the
hall you can reach the five main areas directly; the deeper rooms hang off those.
**Every room (except the hall) has a `koti` button — a little house icon, always
top-left — that returns to the hall in one tap.** So the child is never more than
one tap from a known place, and from the hall every area is reachable. No dead
ends, no mazes.

```
                         [10 tähtitorni]        (top of the tower)
                              |  (ladder)
                 [07 ullakko] ----+---- [06 paja]
                      |  (stairs)         |
                 [04 kirjasto] -----------+   (up from the hall)
                      |
   [03 olohuone]--[01 ETEINEN / hall]--[02 keittio]
         |              |                    |
   [05 kasvihuone]      | (trapdoor down)    | (stairs down)
                        |                    |
                   [09 kellari] -------------+
                        |  (tunnel)
                   [08 luuhuone]
```

**Edges (doors / arrows / stairs), with the scene id that triggers them:**

| from room | hotspot id | → goes to | label on it |
|---|---|---|---|
| eteinen | `#doorKeittio` | keittiö | "keittiö" |
| eteinen | `#doorOlohuone` | olohuone | "olohuone" |
| eteinen | `#doorKasvihuone` | kasvihuone | "kasvihuone" |
| eteinen | `#stairsUp` | kirjasto | "yläkerta" |
| eteinen | `#trapdoor` | kellari | "kellari" |
| keittiö | `#navHome` | eteinen | (house icon) |
| keittiö | `#navDown` | kellari | "kellari" |
| olohuone | `#navHome` | eteinen | (house icon) |
| olohuone | `#navRight` | kasvihuone | "kasvihuone" |
| kasvihuone | `#navHome` | eteinen | (house icon) |
| kasvihuone | `#navLeft` | olohuone | "olohuone" |
| kirjasto | `#navHome` | eteinen | (house icon) |
| kirjasto | `#navRight` | paja | "paja" |
| kirjasto | `#navUp` | ullakko | "ullakko" |
| paja | `#navHome` | eteinen | (house icon) |
| paja | `#navLeft` | kirjasto | "kirjasto" |
| paja | `#navUp` | ullakko | "ullakko" |
| ullakko | `#navHome` | eteinen | (house icon) |
| ullakko | `#navDown` | kirjasto | "kirjasto" |
| ullakko | `#navUp` | tähtitorni | "tähtitorni" |
| luuhuone | `#navHome` | eteinen | (house icon) |
| luuhuone | `#navBack` | kellari | "kellari" |
| kellari | `#navHome` | eteinen | (house icon) |
| kellari | `#navDown` | luuhuone | "luuhuone" |
| tähtitorni | `#navHome` | eteinen | (house icon) |
| tähtitorni | `#navDown` | ullakko | "ullakko" |

Navigation visuals: the hall uses illustrated **doors / stairs / trapdoor**; the
other rooms use compact **gold arrow tabs** at the matching screen edge plus the
**house `koti` button**. Each carries a short readable word. Transitions are a
soft ~400 ms crossfade (fade out → engine swaps the scene SVG → fade in); never a
fast slide. A tiny **mini-map** can live on the hall task board (optional, I ship
the board; engine may highlight the current goal room).

---

## 3. The goal (house-spanning) + sub-quests — all calm, no fail

### Main goal — "etsi 5 tähtikiveä" (find 5 star-stones)

The baby dragon has lost its **5 glowing star-stones** (*tähtikivet*). They are
hidden around the house — behind, inside and under things — **random spots each
play**. A gentle counter shows `tähtikiviä 0/5`. Tap a star-stone → a soft chime,
it floats to the counter. When you have all 5, go **up to the tähtitorni**, tap the
**sky-dome** → the 5 stones click into the dome's slots, the dome opens, the baby
dragon flies up into the night sky and gentle **star-fireworks** bloom → shared
**`celebrate()`** (confetti + Finnish praise banner + `fanfare.wav`). Cosy, slow,
no countdown — the "explosion" he loves, but as soft blooming light.

The hall's **task board** (`#taskBoard`) states the goal in big simple words + a
picture of a star-stone + the `0/5` count, so a learning reader can "read" it.

### Sub-quest A — the treasure chest (from the POC, kept + deepened)

In the **kellari** the big **aarrearkku** is locked. The golden **avain** is hidden
in one of 8 random spots across the house; a **clue card** in the hall points to it
in simple Finnish. Find the key → tap the chest → it unlocks (clunk), opens, a
**random treasure** rises out (8-item pool). Small celebration.

### Sub-quest B — "etsi 3 hiirtä" (find 3 mice)

Three little mice hidden in random niches. Counter `hiiret 0/3`. Tap each → squeak.
All 3 → a tiny mouse party (cheese drops, the mice hop, a chime).

All three quests run in parallel, in any order, at the child's own pace. Finding
everything is encouraged but never required; the house is fun just to poke.

---

## 4. Per-room content (object → tap: visual + sound + Finnish line)

Lowercase, short words for a learning reader. `[sound]` names a WAV (§6). Lines
marked *(pool)* pick one at random. Hidden-item **niches** (where a star-stone /
key / mouse may appear this play) are listed per room.

### 01 · ETEINEN (entrance hall / hub)

| id | object | tap → | sound | Finnish |
|---|---|---|---|---|
| `#taskBoard` | dragon's task board | enlarges to read the goal + counts | tap | "etsi 5 tähtikiveä!" |
| `#clueNote` | clue card | leans out, shows the key hint (§5) | tap | e.g. "avain on tynnyrissä." |
| `#coatrack` | coat rack | a hat swings, maybe drops | rustle | "hattu heiluu." |
| `#mirror` | mirror | your reflection sparkles, a star blinks | chime | "kuka siellä?" |
| `#mat` | doormat | lifts with a dust puff | rustle | "tervetuloa!" |
| `#hallLamp` | ceiling lamp | toggles hall light (`#dim`) | tap | "valo syttyi!" / "pimeää." |
| `#doorKeittio` `#doorOlohuone` `#doorKasvihuone` `#stairsUp` `#trapdoor` | the 5 exits | crossfade to that room | creak | labels per §2 |

*Niches:* under the mat · behind the coat rack · behind the mirror.

### 02 · KEITTIÖ (kitchen)

| id | object | tap → | sound | Finnish |
|---|---|---|---|---|
| `#pot` | big pot on the stove | bubbles rise, steam puffs | boil | "pata kiehuu: pulp pulp." |
| `#kettle` | kettle | whistles, a puff of steam | whistle | "pannu viheltää: tuut!" |
| `#cupboard` | cupboard | doors creak open, plates inside | creak | "kaappi narahtaa." |
| `#fruitbowl` | fruit bowl | an apple wobbles and rolls | tap | "omena pyörii." |
| `#faucet` | tap/sink | a drop falls: tip | drip | "vesi tippuu: tip." |
| `#broom` | broom | tips over with a clatter | clatter | *(gag)* "luuta kaatui: ratsis!" |
| `#mousehole` | mouse hole | a mouse peeks out | squeak | "piip! hiiri." |

*Niches:* in the cupboard · behind the pot · the mouse hole (mouse).

### 03 · OLOHUONE (living room)

| id | object | tap → | sound | Finnish |
|---|---|---|---|---|
| `#win` / `#winstar` | window + star | slow twinkle; rarely a shooting star | chime | "tähti tuikkii." · *(pool)* "tähdenlento!" |
| `#fireplace` / `#flames` | fireplace | flames sway, embers warm; 3rd tap → marshmallow | fire | "tuli rätisee." · *(gag)* "nam! vaahtokarkki." |
| `#clock` | cuckoo clock | door opens, bird pops out | cuckoo | "kukkuu! kukkuu." · *(gag)* "käki nukkuu... kuorsaa." |
| `#lamp` | standing lamp | toggles room light (`#dim`) | tap | "valo syttyi!" / "pimeää." |
| `#picture` | wall picture | swings aside | creak | "taulu heilahti." |
| `#shelf` / `#book1` | bookshelf | a book slides out + dust | rustle | "kirja putosi: kop!" · *(gag)* "pöly pöllähti: aptsiu!" |
| `#plant` | potted plant | leaves rustle | rustle | "lehdet kahisee." · *(gag)* "hei! pikku ötökkä." |
| `#cat` | cat | jumps + meow; *(gag)* just stretches | meow | "miau! kissa hyppäsi." · "kissa venyttelee... hrr." |
| `#rug` / `#rugCorner` | rug | corner folds up, dust | rustle | "pöly! aptsiu." |

*Niches:* behind the picture · under the rug · in the plant pot · behind a book.

### 04 · KIRJASTO (library)

| id | object | tap → | sound | Finnish |
|---|---|---|---|---|
| `#shelfBig` / `#book1` | tall bookshelf | a book slides, dust puff | rustle | "kirja: kop!" |
| `#ladder` | sliding ladder | rolls along the shelf | creak | "tikkaat liukuu." |
| `#globe` | globe | spins slowly | whir | "maapallo pyörii." |
| `#owlLib` / `#owlHead` | reading owl | turns its head, blinks | hoot | "huhuu, sanoo pöllö." |
| `#candle` | candle | flame leans gently (no strobe) | fire | "kynttilä lepattaa." |
| `#chair` | comfy chair | cushion puffs, glasses on top | rustle | "pehmeä tuoli." |
| `#secretBook` / `#secretShelf` | secret book | a shelf swings aside, reveals a niche | creak | *(gag)* "salainen kirja!" |

*Niches:* behind the secret shelf · behind a book · on top of the shelf.

### 05 · KASVIHUONE (greenhouse)

| id | object | tap → | sound | Finnish |
|---|---|---|---|---|
| `#bigPlant` / `#bigLeaves` | big leafy plant | leaves sway | rustle | "iso kasvi huojuu." |
| `#snapPlant` / `#snapMouth` | snapping plant | opens wide, chomps once, grins (friendly) | chomp | *(gag)* "nam! kärpäskasvi." |
| `#can` | watering can | tips, pours; a flower blooms | drip | "kukka kasvaa!" |
| `#butterfly` | butterfly | flutters to another flower | tap | "perhonen lentää." |
| `#pots` | row of flowerpots | flowers nod | rustle | "kukat nyökkää." |
| `#roof` / `#sun` | glass roof + sun | sun brightens (fake glow) | chime | "aurinko paistaa." |
| `#snail` | snail | inches along slowly | tap | *(gag)* "etana... niin hidasta." |

*Niches:* behind the big plant · in a flowerpot · under the snail's leaf.

### 06 · PAJA (workshop)

| id | object | tap → | sound | Finnish |
|---|---|---|---|---|
| `#gears` | gear wheels | turn together, naks naks | gear | "rattaat pyörii: naks." |
| `#robot` / `#robotArm` | little robot | beeps, eye lights, arm waves | beep | *(gag)* "piip piip! robotti." |
| `#forge` / `#forgeFire` | forge | fire puffs, glows warm | fire | "ahjo hehkuu." |
| `#hammer` | hammer | taps a nail: kop kop | gear | "vasara: kop kop." |
| `#toolboard` | tool board | a wrench swings | clatter | "työkalu heiluu." |
| `#jack` / `#jackPop` | jack-in-the-box | lid pops, a funny face springs up | musicbox | *(gag)* "pöö! yllätys." |
| `#bench` | workbench drawer | drawer slides out, bits inside | creak | "laatikko aukeaa." |

*Niches:* in the drawer · behind the forge · under the tool board.

### 07 · ULLAKKO (attic)

| id | object | tap → | sound | Finnish |
|---|---|---|---|---|
| `#porthole` / `#bat` | round window | a bat slides past | whoosh | "lepakko lensi ohi." · *(pool)* "kuu paistaa." |
| `#owl` / `#owlHead` | owl on a beam | turns its head, blinks | hoot | "huhuu, sanoo pöllö." |
| `#spider` / `#spiderBody` | spider on a web | drops on its thread, waves, climbs back | whoosh | "hei! sanoo hämähäkki." |
| `#crates` / `#crateLid` | crate stack | lid creaks, a doll peeks | creak | "vanhaa tavaraa." · *(gag)* "oho! nukke." |
| `#rockhorse` | rocking horse | rocks, whinnies | horse | "iihaha!" |
| `#teddy` / `#teddyArm` | teddy in a toy box | pops up and waves | squeak | "nalle vilkuttaa: piip!" |
| `#musicbox` / `#musicLid` / `#dancer` | music box | lid opens, ballerina turns, tune plays | musicbox | "soittorasia soi." |

*Niches:* in the toy box · under the rocking horse · behind the crates.

### 08 · LUUHUONE (dino-bone room)

| id | object | tap → | sound | Finnish |
|---|---|---|---|---|
| `#dino` / `#dinoHead` / `#dinoJaw` | dinosaur skeleton | jaw opens, head turns, gentle roar | roar | "karjuu: roaar!" (hassu, ei pelottava) |
| `#sandpit` / `#sandTiles` | sand pit | brush sand away, a bone appears | rustle | "harjaa hiekkaa." |
| `#fossil` | fossil in rock | glows softly | chime | "kivettymä! löytö." |
| `#dinoEgg` | dino egg | wobbles, a little crack | creak | "muna heiluu." |
| `#amber` | amber with a bug | the bug inside wiggles | tap | *(gag)* "ötökkä kivessä!" |
| `#skull` | skull on a shelf | teeth rattle | rattle | "kallo kalisee." |
| `#footprint` | big footprint | a puff of dust | rustle | "iso jalanjälki!" |

*Niches:* in the sand pit · behind the skeleton's tail · under the footprint.

### 09 · KELLARI (cellar)

| id | object | tap → | sound | Finnish |
|---|---|---|---|---|
| `#lantern` / `#lanternGlow` | lantern | toggles cellar light (`#dim`) | tap | "lyhty syttyi." / "pimeä kellari." |
| `#jars` / `#firefly` | jam jars | clink; a firefly glows in one | clink | "purkit kilisee." · *(gag)* "kiiltomato! pieni valo." |
| `#barrel` / `#barrelLid` / `#frog` | barrel | lid pops, a frog springs out | ribbit | "kvak! sammakko!" |
| `#mushrooms` / `#mushGlow` | glowing mushrooms | caps bob, glow brightens | chime | "sienet hohtaa: pling." |
| `#dragon` / `#dragonEye` / `#smokeRing` | **sleeping baby dragon** | snores, puffs a smoke ring, one eye peeks | snore | "zzz... pöh." · *(gag)* "...lisää makkaraa..." |
| `#bigchest` / `#chestLid` / `#chestGlow` | **treasure chest (sub-goal)** | locked: shivers. with key: unlocks → treasure | creak / unlock → fanfare | "lukossa. tarvitaan avain." · "avain sopii! aarre!" |

*Niches:* in the barrel · behind the jars · under the sleeping dragon's tail.

### 10 · TÄHTITORNI (observatory tower — FINALE)

| id | object | tap → | sound | Finnish |
|---|---|---|---|---|
| `#skyDome` / `#domeSlots` / `#domeOpen` | sky-dome (**main goal**) | with 5 stones: stones click in, dome opens, dragon flies, star-fireworks → celebrate | star → fanfare | "tähtikivet loistaa! katso ylös!" |
| `#telescope` / `#scope` | telescope | swings up, a star twinkles in the lens | whir + chime | "näen tähden!" |
| `#rocket` | model rocket | lifts a little with a soft whoosh, settles | whoosh | *(gag)* "pöö! raketti." |
| `#moonGlobe` | moon globe | glows softly | chime | "kuu hohtaa." |
| `#chart` / `#chartLines` | star chart | lines light up into a dragon shape | chime | "lohikäärme tähdissä!" |
| `#starJar` | jar of little stars | sparkles | chime | "täynnä tähtösiä." |
| `#towerDragon` | the baby dragon (waiting) | wags, puffs a tiny flame | snore/roar | "lohikäärme odottaa." |

*Niches:* behind the telescope · in the star jar · behind the chart. (The dome is
the drop-off / finale, not a niche.)

**Totals:** 10 scenes · **~70 reacting objects** (plus navigation hotspots) ·
**9 hidden items** (5 star-stones + 1 key + 3 mice), all in randomized niches.

---

## 5. Clue card + task board (hall) — content

- **`#taskBoard`** (hall): big simple goal + picture + live count. Line:
  "etsi 5 tähtikiveä!" with a drawn star-stone and `0/5`. Optional mini-map of
  rooms the engine can mark.
- **`#clueNote`** (hall): one short line pointing at the **key** (sub-quest A),
  matching its random spot + a mini-icon so a pre-reader can read it too. One of 8:

| key spot | clue line | mini-icon (`clue-icons.svg`) |
|---|---|---|
| taulun takana (olohuone) | "avain on taulun takana." | picture |
| maton alla (olohuone) | "avain on maton alla." | rug |
| kukkaruukussa (kasvihuone) | "avain on kukan ruukussa." | plant |
| kirjan takana (kirjasto) | "avain on kirjan takana." | book |
| soittorasiassa (ullakko) | "avain on soittorasiassa." | music box |
| keinuhevosen alla (ullakko) | "avain on keinuhevosen alla." | horse |
| tynnyrissä (kellari) | "avain on tynnyrissä." | barrel |
| hillopurkissa (kellari) | "avain on purkissa." | jar |

---

## 6. Audio cue list (reusable, for WAV synthesis, 22050 Hz PCM)

Shared `fanfare.wav` already exists (kids-hub `celebrate()`), reused for every win.
The rest are short, mono, gentle (soft envelopes, no harsh attack). Heavy reuse
keeps the set small across 10 rooms:

| name | one-line description | used by |
|---|---|---|
| `tap` | soft round pop, ~80 ms | generic tap, lamps, apple, butterfly, rocket-settle |
| `creak` | short wood creak | doors, stairs, trapdoor, lids, chests, drawers, crates, egg |
| `chime` | bright 2–3 note sparkle | stars, star-stone found, key, mouse, fossil, mushrooms, moon, chart, mirror |
| `rustle` | soft leafy/papery puff | plants, leaves, rug/sand dust, books, mat, footprint |
| `meow` | friendly cat meow | cat |
| `cuckoo` | two-note kuk-kuu | cuckoo clock |
| `ribbit` | short wet kvak | frog |
| `snore` | slow in-out snore + puff | sleeping dragon, tower dragon |
| `hoot` | soft owl huhuu | both owls |
| `horse` | playful neigh + rocker creak | rocking horse |
| `musicbox` | tiny 4–6 note melody | music box, jack-in-the-box |
| `fire` | gentle low crackle, non-looping | fireplace, forge, candle |
| `unlock` | metal lock clunk + turn | treasure chest win |
| `boil` | soft watery bubbling | pot |
| `whistle` | gentle rising kettle whistle | kettle |
| `drip` | single water drop plink | tap/sink, watering can |
| `clatter` | light wooden tumble | broom, tool board |
| `gear` | soft ratchety naks-naks | gears, hammer |
| `beep` | friendly two-note beep | robot |
| `roar` | small, SOFT dino/dragon roar (funny, not scary) | dino skeleton |
| `rattle` | light bony rattle | skull |
| `chomp` | soft gulp/snap | snapping plant |
| `whir` | soft spinning whir | globe, telescope |
| `whoosh` | gentle air whoosh | spider drop, bat, rocket, dome |

≈24 cues + the shared fanfare. Reuse rules: anything wooden → `creak`; anything
found/sparkly → `chime`; anything dusty/leafy → `rustle`; any flame → `fire`.

---

## 7. Funny beats (specific gags)

1. **Sleeping dragon** (kellari) — snores, puffs a drifting **smoke ring**, one eye
   peeks and shuts; rarely sleep-talks "...lisää makkaraa...".
2. **Friendly spider** (ullakko) — drops on its thread, **waves**, "hei!", climbs
   back. Big smiley eyes, never scary.
3. **Snapping plant** (kasvihuone) — opens wide and **chomps** with a grin, then
   looks pleased with itself: "nam! kärpäskasvi."
4. **Silly robot** (paja) — beeps, its eye lights, it **waves one arm** stiffly.
5. **Jack-in-the-box** (paja) — lid pops and a goofy face **springs up**: "pöö!"
6. **Falling broom** (keittiö) — tap it and it slowly **tips over**: "ratsis!"
7. **Grumpy cuckoo / aloof cat** (olohuone) — sometimes the cuckoo yawns a
   half-"kukku", sometimes the cat just stretches and ignores you.
8. **Marshmallow over the fire** (olohuone) — after a few taps a marshmallow stick
   appears toasting: "nam! vaahtokarkki."
9. **Jack-in-the-barrel frog** (kellari) — the barrel lid pops, a frog springs out
   "kvak!", blinks, drops back in.
10. **Slow snail** (kasvihuone) — inches along *so* slowly: "etana... niin hidasta."
11. **Rattly skull** (luuhuone) — its teeth chatter like it's cold.
12. **Mouse party** — the 3rd mouse makes all three hop in a line, cheese drops in.

---

## 8. Success / celebrate moments

- **FINALE (main goal — tähtitorni dome):** 5 star-stones click into `#domeSlots`
  → `#domeOpen` eases apart → the **baby dragon flies up** across the night sky →
  gentle **star-fireworks** (soft blooming dots, time-based, ≤24, NO strobe) →
  shared **`celebrate()`** (confetti + rotating Finnish praise + `fanfare.wav`).
  Praise pool: "sinä löysit kaikki tähtikivet!", "hienoa!", "mahtavaa!",
  "lohikäärme lentää!".
- **Sub-quest A (chest):** `unlock` → `#chestLid` opens → `#chestGlow` (low-opacity
  gold, no blur) → `#treasure` rises → `celebrate()`. Praise "löysit aarteen!".
- **Sub-quest B (3 mice):** small moment — mice hop, cheese drops, `chime`, banner
  "kolme hiirtä löytyi!". No full confetti (keep the dome + chest as the big ones).
- **Each star-stone found:** `chime`, the stone floats to the `tähtikiviä` counter.

All eased, all time-based, none looping forever (hard-stop on scene exit).

---

## 9. Replayability (no levels, no speed)

1. **5 star-stones** hidden in 5 of **~18 niches** across the 10 rooms — different
   every play. The whole house must be swept, differently each time.
2. **Key** in 1 of **8** spots + matching **clue card** (§5).
3. **3 mice** in 3 of **~12** niches.
4. **Random treasure** in the chest — 1 of **8**: kultakolikot, tähtikartta,
   lohikäärmeenmuna, hassu hattu, helmi, lelulaiva, karkkipussi, taikasauva.
5. **Random reaction variants** (cat, cuckoo, dragon, bookshelf, snail, robot) so
   re-tapping surprises.
6. **A whole house** to roam, light toggles, 10 themed rooms.
7. *(Future, free, engine-side):* wall-palette swap per play (night ↔ dusk ↔ day)
   for a "different day" feel with zero new art.

Rough math: C(18,5) star layouts × 8 key spots × C(12,3) mouse layouts × 8
treasures ≈ **8,568 × 8 × 220 × 8 ≈ 120 million** arrangements — before reaction
variants. Endless, with no levels and no speed.

---

## 10. Hub door look (this game's tile in the main 8-door hub)

`art/door.svg`, viewBox `0 0 240 240`. A cosy **arched wooden door with a big
glowing golden keyhole** and a thin crack of warm light underneath — instantly
says "secret place" to a 5-year-old. Night-mid tile, chunky wood frame, two plank
seams, gold keyhole with a faked soft glow (low-opacity gold disc, no blur), one
storybook star in the corner.

---

## 11. Performance budget (10 scenes, one in the DOM at a time)

Caps per scene: **< ~160 SVG nodes · ≤24 particles · ≤~20 animated elements · NO
filters / feGaussianBlur / masks / blurred shadows · flat fills · fake glows only
(one low-opacity solid shape) · ≤1 gradient**.

| scene | est. nodes | animated groups | particles | glows (faked) |
|---|---|---|---|---|
| room01-eteinen | ~95 | ~6 | 0 | hall lamp |
| room02-keittio | ~110 | ~8 | steam ≤10 | — |
| room03-olohuone | ~140 | ~11 | fire embers ≤12 | lamp |
| room04-kirjasto | ~120 | ~7 | dust ≤8 | candle |
| room05-kasvihuone | ~115 | ~8 | — | sun |
| room06-paja | ~120 | ~8 | forge sparks ≤10 | forge |
| room07-ullakko | ~115 | ~8 | dust ≤8 | — |
| room08-luuhuone | ~120 | ~7 | sand ≤10 | fossil |
| room09-kellari | ~120 | ~9 | smoke ring 1 + sparkle ≤6 | lantern, chest, dragon belly |
| room10-tahtitorni | ~130 | ~9 | star-fireworks ≤24 (finale only) | dome, moon, stars |

Confirmations / flags for you (lead engineer):
- **Every scene is under ~160 nodes.** olohuone is heaviest (~140); trim its
  optional floorboard lines first if you add overlay chrome.
- **Only emitters:** kitchen steam, fireplace embers, forge sparks, dino sand,
  cellar sparkle, and the finale star-fireworks — **all time-based, each ≤ its cap
  above (≤24), hard-stop on scene exit** (per the `celebrate.js` lesson). Smoke
  ring and mushroom/firefly/sun "glow" are single eased **opacity tweens on solid
  shapes**, not emitters.
- **No filters anywhere.** All glows (`#lampGlow`, `#lanternGlow`, `#forgeFire`,
  `#chestGlow`, `#fossil`, `#sun`, keyhole, dome) are low-opacity solid shapes.
- **Gradients:** flat fills throughout; at most one optional sky `linearGradient`
  in tähtitorni/windows if you want it — flat `#241a33` is fine and cheaper.
- **`#dim` overlay:** one rect at ~0.45–0.5 opacity in rooms with a light toggle
  (eteinen, olohuone, kellari). pointer-events none.
- **Crossfade nav:** fade the stage opacity, swap the single scene SVG, fade in —
  don't hold two full scenes in the DOM at once on the Acer.
- **Decision for you:** I assume 10 separate scene SVG files that you swap into one
  `#stage` (matches "one room in the DOM"). Nav labels are baked as SVG `<text>`
  (incl. ä/ö); if you'd rather render nav/hint/counter text as DOM overlay for
  font control, the scene art still works — just ignore the baked `<text>`.

---

## 12. File map

```
design/salahuone/
  DESIGN.md              (this file)
  ART.md                 (every SVG id → motion + nav target)
  art/
    door.svg                 hub tile, 240×240
    room01-eteinen.svg       entrance hall / hub
    room02-keittio.svg       kitchen
    room03-olohuone.svg      living room
    room04-kirjasto.svg      library
    room05-kasvihuone.svg    greenhouse
    room06-paja.svg          workshop
    room07-ullakko.svg       attic
    room08-luuhuone.svg      dino-bone room
    room09-kellari.svg       cellar
    room10-tahtitorni.svg    observatory tower (finale)
    sprites.svg              key, mouse, cheese, star-stone, smoke ring, clue card, arrow, home
    treasures.svg            8 chest-treasure sprites
    clue-icons.svg           8 mini clue icons
  (all scenes viewBox "0 0 1024 600"; one is in the DOM at a time)
```
