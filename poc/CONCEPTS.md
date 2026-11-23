# 8 peli-ideaa — konseptit ja POC-mallit

*Lead Game Designer -kierros: ideointi + klikattavat proto-mallit. Nämä ovat
mielikuvitusluonnoksia isän (asiakkaan) arvioitavaksi — ei vielä valmis peli.*

Kohde: 1 poika, 5–7 v, suomenkielinen, opettelee lukemaan (lukee hitaasti mutta
rakastaa sitä). Lempparit: lohikäärmeet, dinot, tuli, räjähdykset, tulivuoret,
asteroidit, tähdet, avaruus. Lempipelit: vanha NES TMNT ja vanhat Muumi-seikkailupelit
(point-and-click). Tykkää: pulmista, etsimisestä, kokeilemisesta, hassuista jutuista, äänistä.

---

## Design north star

**Rauhallinen näpertely-leikkikalu, ei peli jossa voi "hävitä."** Jokainen idea on
point-and-click / etsi-ja-löydä / hiekkalaatikko Muumi-seikkailun hengessä: lapsi
koskettaa jotain ja *jotain hauskaa tapahtuu* — ääni, liike, paljastus, pamaus. Ei
kelloa, ei kiirettä, ei refleksihaastetta, ei vilkkumista. Sydän on syy-ja-seuraus-ilo
("mitä jos painan tätä?") ja löytämisen riemu, höystettynä hölmöillä hetkillä ja hyvällä
äänellä. Teksti on lyhyttä, isoa ja pienaakkosista — luettavaa, ei seiniä. Toistettavuus
syntyy satunnaisuudesta ja yhdistelmien määrästä, ei tasoista. Taide saa olla
yksinkertaista (SVG, litteä väri) — Muumi-satukirjan lämpö, ei Fortnite.

## Top 3 -suositus

| Sija | Idea | Miksi |
|------|------|-------|
| 1 | **06 · Salahuone** | Suorin osuma siihen genreen jota poika jo rakastaa (Muumi point-and-click + etsiminen). Laajenee moneen huoneeseen → valtava toistettavuus. Ainoa riski on taiteen/työn määrä, mutta tämä on briefin sydän. |
| 2 | **05 · Taikapata** | Paras sekoitus hänen kiinnostuksistaan: kokeileminen ("mitä jos sekoitan nämä?"), hauskat räjähdykset ja höyryt, iso toistettavuus (yhdistelmät), lukuharjoitus ainesten nimistä. Kevyt–keskiraskas rakentaa. |
| 3 | **08 · Hassu hirviöpaja** | Kevyin laitteelle (pelkkä SVG), loputon hauska yhdistelmävalikoima, lohikäärme-/dino-teema, ja hassut nimet (liekkipötköpiikki) ovat mainiota lukuharjoitusta. Halpa S-kokoinen varma voitto. |

*Kunniamaininta: **01 · Tulivuori** — tulivuori on hänen ykkössuosikkiteemansa ja
puhdas syy-seuraus-ilo; loistava pieni lisäpala tai hub-nappula.*

---

## Laitteen reunaehdot (koskee kaikkia — "real build" -muistiinpanot)

Kohde = Acer Iconia B1-A71, Android 4.1.2, vanha WebKit-WebView, 512 MB RAM, heikko
PowerVR SGX531, 1024×600, single-touch, täysin offline SD-kortilta.

Kaikille ideoille pätee sama siirtymä POC → oikea build:

- **ES5 vain**, ei flexbox/grid, `-webkit-`-prefixit, ei emojia käyttöliittymässä
  (POC:t käyttävät emojia hauskoihin esineisiin vain Mac-arviota varten → oikeassa
  buildissa korvataan inline-SVG:llä).
- **Ääni:** POC:t käyttävät WebAudio-syntetisaattoria (klikit, karjunta, pamaus, pulina).
  Oikeassa buildissa kaikki korvataan esigeneroiduilla **PCM WAV** -tiedostoilla
  (`tools/make_sound.py`-tyyliin, 22050 Hz), joiden HTML5 Audio on todettu toimivaksi laitteella.
- **Animaatio aikapohjaisena** (`Date.now()`-delta, ei frame-count) ja **kova
  siivous** (pysäytä silmukka, piilota canvas `display:none`) — vanha WebView voi
  jumittaa `requestAnimationFrame`in kesken (ks. `celebrate.js`). Yksikään silmukka ei
  saa jäädä pyörimään ikuisesti.
- **Partikkelit ja DOM kevyiksi:** hiukkasia ≤ ~24, ei isoja kuvia, ei raskasta DOM:ia,
  canvas halpana. CSS-transitionit ovat ok mutta vältä raskaita box-shadow-kerroksia.
- **Rauhallinen liike vain:** pehmeä easing, ei strobea, ei nopeaa vilkkua.
- **Single source of truth:** sisältödata + generaattorit `logic.js`-tyyliseen UMD-moduuliin
  (`window.Game` selaimessa, `module.exports` Nodessa), sivut ohuina DOM-kääreinä →
  sama koodi testeissä ja laitteella (`tests/run-tests.js`-malli).

POC:t renderöidään 1024×600-näyttämölle, joka skaalautuu keskitettynä tummalla sivulla
(`transform: scale`) — sama letterbox-idea toimii laitteen fullscreen-WebViewissä.

---

## 01 · Tulivuori · *The Volcano*

- **POC:** `01-tulivuori.html`
- **Pitch:** paina tulivuorta monta kertaa → paine nousee → PURKAUS, laava lentää ja
  kraatterista singahtaa hassu esine.
- **Teemat:** tulivuori, tuli, räjähdys.
- **Core loop:** näpäytät vuorta, mittari täyttyy ja hehku kasvaa; täydellä se purkautuu
  (laavahiukkaset + jyrinä), ja ulos lentää satunnainen esine (saapas, kala, kana…).
  Vuori rauhoittuu ja homma alkaa alusta.
- **Miksi sopii (hidas lukija / ei kiirettä / ei vilkku):** ei tekstin lukemista pakollisena
  (pari lyhyttä sanaa: "paina vielä!"); täysin omaan tahtiin; purkaus on pehmeä kaari, ei
  strobe; mittari antaa selkeän syy-seuraus-palautteen ilman sanoja.
- **Hauska / ääni:** matala jyrinä (suodatettu kohina) + pamaus; joka purkauksessa eri
  esine → nauru. Napsahdus joka näpäytyksestä.
- **Toistettavuus:** satunnainen lentävä esine joka kerta; helppo laajentaa (eri
  purkaustyypit: laava / savurenkaat / kivet; esinekirjasto kymmeniä).
- **Device-feasibility:** laavahiukkaset jo aikapohjaisia, ≤30 → laske ~24:ään.
  Emoji-esine → SVG. WebAudio → `rumble.wav`/`boom.wav`. canvas kevyt, ok.
- **Effort:** **M**

## 02 · Lohikäärmeen muna · *The Dragon Egg*

- **POC:** `02-lohikaarmeen-muna.html`
- **Pitch:** silitä munaa kunnes se halkeaa ja kuoriutuu lohikäärmeen vauva, jota ruokit.
- **Teemat:** lohikäärme, tuli, hoivaaminen.
- **Core loop:** näpäytät munaa → se lämpenee (hehku) ja säröt kasvaa; tarpeeksi
  näpäytyksiä → kuoriutuu; sitten "ruoki"-nappi → vauva mutustaa, puhaltaa pikkuliekin ja
  joskus röyhtäisee hassusti.
- **Miksi sopii:** hoiva-tahti on täysin lapsen oma; hyvin vähän tekstiä; kuoriutuminen on
  pehmeä skaalausanimaatio, ei välähdyksiä; selkeä palkinto (vauva!) ilman sääntöjä.
- **Hauska / ääni:** krooh-karjaisu, mutustus, "hik! pikku röyhtäys"; liekkipuffi.
- **Toistettavuus:** eri väriset/lajiset lohikäärmeet joka kuoriutumisella; ruokinta
  kasvattaa; voisi lisätä pieniä hoivatiloja (nukkuu, leikkii).
- **Device-feasibility:** vauvan heiluntasilmukka tehtävä aikapohjaiseksi ja
  **pysäytettäväksi** (ei ikuista rAF:ia). Säröt SVG-opacityllä, halpa. WAV: crack/roar/chomp.
- **Effort:** **M**

## 03 · Dinon luut · *Dino Bones*

- **POC:** `03-dinon-luut.html`
- **Pitch:** harjaa hiekkaa pois ruutu ruudulta ja kaiva esiin dinosauruksen luuranko.
- **Teemat:** dino, etsiminen, kaivaminen.
- **Core loop:** näpäytät hiekkalaatikon ruutuja, ne pyyhkiytyvät pois (harjauksen ääni);
  alta paljastuu luita; jokainen uusi luu antaa kilahduksen ja kasvattaa laskuria (0/5).
  Kaikki löydetty → juhla. Välissä paljastuu hassu kumiankka.
- **Miksi sopii:** klassinen Muumi-tyylinen etsiminen; ei aikarajaa, kaivat rauhassa;
  pehmeä fade-pois, ei strobe; laskuri 0/5 on kevyttä numeroiden lukua.
- **Hauska / ääni:** rapiseva harjaus; kilahdus löydöstä; "hihi! ankka hiekassa!".
- **Toistettavuus:** satunnaista mikä luuranko + yllätysesineet + sijainnit; monta
  kaivuupaikkaa (T-rex, triceratops, mammutti).
- **Device-feasibility:** POC:ssa 60 DOM-ruutua — laitteelle **karkeampi ruudukko ~24–32**
  DOM-keveyden vuoksi. Osumavyöhykkeet jo halpoja. WAV: scrape/chime.
- **Effort:** **S–M**

## 04 · Tähtikuvio · *The Night Sky*

- **POC:** `04-tahtitaivas.html`
- **Pitch:** yhdistä hehkuvat tähdet järjestyksessä ja piirrä taivaalle lohikäärme-kuvio.
- **Teemat:** tähdet, avaruus, pulma / yhdistä pisteet.
- **Core loop:** tähtitaivas tuikkii rauhallisesti; näpäytät numeroidut tähdet
  järjestyksessä 1→7, viivat kasvavat tähdestä toiseen ja muodostavat kuvan; valmis kuvio
  "syttyy". Väärä tähti → lempeä vihje, ei rangaistusta.
- **Miksi sopii:** numerojärjestys on juuri sopivaa lukemisen/numeroiden harjoitusta
  hitaalle lukijalle; omaan tahtiin; tuike on hidas (4 s) ja pehmeä, ei välähdys; kuvan
  paljastuminen palkitsee.
- **Hauska / ääni:** tuike-helinä, viivan kilahdus, tähdenlento liukuu välillä ohi (hidas),
  pöllö huhuilee kun kuvio valmistuu.
- **Toistettavuus:** monta kuviota (lohikäärme, dino, raketti, laiva), satunnainen tausta.
- **Device-feasibility:** POC:ssa 46 CSS-animoitua taustatähteä rasittaa heikkoa GPU:ta →
  laitteelle **~20 tähteä hitaalla tuikkeella** TAI piirrä tähdet yhdelle canvakselle kerran
  (halvempi kuin 46 animoitua DOM-nodea). Viivan kasvu jo aikapohjainen. WAV: twinkle/chime/hoot.
- **Effort:** **M**

## 05 · Taikapata · *The Potion Pot*

- **POC:** `05-taikapata.html`
- **Pitch:** pudota 2 ainesta pataan, sekoita ja katso mitä hassua tapahtuu — pamaus,
  höyry, sammakko, kimalletta.
- **Teemat:** kokeileminen, taika, tuli/räjähdys, hassut reaktiot.
- **Core loop:** valitset aineksia (tuli, vesi, myrkky, tähti), neste pataan sekoittuu
  väriltään; "sekoita" kuplii ja tuottaa yhdistelmästä riippuvan reaktion; "tyhjennä"
  nollaa. Lapsi testaa yhdistelmiä kuin pieni alkemisti.
- **Miksi sopii:** puhdas "kokeile ja katso" -hiekkalaatikko jota hän rakastaa; ei
  oikeaa/väärää; ainesten nimet (tuli, vesi…) ovat lyhyitä luettavia sanoja; reaktiot
  pehmeitä (ei strobe).
- **Hauska / ääni:** glug-kaato, pulina, sihinä/höyry, pamaus, "kvak! sammakko!".
- **Toistettavuus:** POC:ssa 4 ainesta; laajenee helposti 6–8:aan → kymmeniä yhdistelmiä;
  "löydettyjen reaktioiden kirja" kannustaa kokeilemaan kaikki.
- **Device-feasibility:** kuplat ≤ 8, purske ≤ 24 aikapohjaisena. Emoji-tulokset → SVG.
  WAV: glug/bubble/boom/ribbit/fizz. Väriensekoitus on halpaa aritmetiikkaa.
- **Effort:** **M**

## 06 · Salahuone · *The Secret Room*

- **POC:** `06-salahuone.html`
- **Pitch:** tutki kodikas huone Muumi-tyyliin — klikkaa esineitä, ne reagoivat, ja löydä
  taulun takaa piilotettu avain.
- **Teemat:** point-and-click-seikkailu, etsiminen, kodikkuus.
- **Core loop:** huoneessa monta napsautettavaa kohdetta: lamppu (valo päälle/pois), kissa
  (hyppää + miau), käkikello (ovi aukeaa, "kukkuu"), arkku (kansi narahtaa auki), ikkunan
  tähti, ja taulu joka kääntyy sivuun paljastaen avaimen. Tavoite: löydä avain.
- **Miksi sopii:** **suorin Muumi point-and-click -osuma**; etsiminen ja kokeilu ovat
  ydintä; omaan tahtiin; ei aikaa; vihjeteksti lyhyt; kaikki liike pehmeää.
- **Hauska / ääni:** narahdus, miau, kukkuu, kilahdus avaimesta; kissan hyppy naurattaa.
- **Toistettavuus:** monta huonetta (ohuet HTML-sivut hubista), satunnainen avaimen
  piilopaikka, lisää esineitä, kevyt "etsi 3 esinettä" -lista.
- **Device-feasibility:** yksi iso inline-SVG + CSS-transform-kahvat hotspoteille = halpa.
  Monta huonetta omina sivuinaan (talon tyyli). WAV per äänitehoste. Ei flexboxia. **Raskain
  taiteen/sisällön puolesta** — siksi L.
- **Effort:** **M–L**

## 07 · Rakettipaja · *The Rocket Workshop*

- **POC:** `07-rakettipaja.html`
- **Pitch:** rakenna oma raketti (nokka, väri, siivet) ja paina lähtö → se nousee tulen
  kera avaruuteen tähtien läpi.
- **Teemat:** avaruus, raketti, tuli, (asteroidit matkalla).
- **Core loop:** vaihdat osia napeista ja raketti piirtyy uudelleen; iso "lähtö!"-nappi
  sytyttää liekin, raketti nousee pehmeästi ylös tähtien vieriessä alas; joskus sen sijaan
  karkaa hassu kana. Rauhoittuu ja voit rakentaa uuden.
- **Miksi sopii:** rakentaminen + palkintomatka ilman kiirettä; ei lähtölaskenta-stressiä
  (nousu on pehmeä easing); osien nimet luettavaa; liike rauhallista.
- **Hauska / ääni:** whoosh (suodatettu kohina), matala jyrinä, "pöö! kana karkasi!",
  fanfaari perillä.
- **Toistettavuus:** monta osayhdistelmää; eri määränpäät (kuu, asteroidivyö, planeetta)
  joka lennolla; tarra/keräily per planeetta.
- **Device-feasibility:** lennon jatkuva rAF on **suurin riski** vanhalla WebViewillä →
  jo aikapohjainen (`Date.now`) ja **kova pysäytys** lopussa; liekkihiukkaset katossa;
  tähdet yhdellä canvaksella. Emoji-kana → SVG. WAV: whoosh/boom/fanfare.
- **Effort:** **M**

## 08 · Hassu hirviöpaja · *The Silly Monster Maker*

- **POC:** `08-hassu-hirviopaja.html`
- **Pitch:** sekoita pää, keho ja häntä → tee hassu otus joka saa oman nimen ja oman
  äänen; "yllätys" arpoo kaiken.
- **Teemat:** lohikäärmeet/dinot/hirviöt, hassuttelu, rakentelu.
- **Core loop:** vaihdat nuolista päätä/kehoa/häntää (4 vaihtoehtoa kutakin), otus piirtyy
  uudelleen ja saa yhdistelmänimen (liekkipötköpiikki); "huuda" soittaa osien mukaisen
  3-nuottisen äänen; "yllätys" arpoo koko otuksen.
- **Miksi sopii:** loputon hassu kokeilu ilman sääntöjä; yhdistelmänimet ovat **mainiota
  lukuharjoitusta** (lyhyitä tavuja); kaikki pehmeää; omaan tahtiin.
- **Hauska / ääni:** jokainen osa tuottaa nuotin → erikoiset "laulut"; mismatch-otukset
  naurattavat; nimigeneraattori.
- **Toistettavuus:** 4×4×4 = 64 otusta jo POC:ssa, laajenee satoihin; voisi lisätä
  "tallenna otus" -gallerian.
- **Device-feasibility:** **kevyin kaikista** — pelkkä SVG-uudelleenpiirto per muutos, ei
  canvasia. Ääni: WAV-nuotit per osa (tai esigeneroidut lyhyet WAV:t). Ihanteellinen
  heikolle GPU:lle.
- **Effort:** **S**

---

### POC → oikea build, pikakooste

| Idea | POC käyttää | Oikea build vaihtaa |
|------|-------------|---------------------|
| Kaikki | WebAudio-synteesi | esigeneroidut PCM WAV:t |
| Kaikki | moderni CSS, emoji hauskoihin esineisiin | ES5, inline-SVG, ei emojia UI:ssa, `-webkit-` |
| 01, 05, 07 | canvas-hiukkaset | ≤24 hiukkasta, aikapohjainen + kova siivous |
| 02, 07 | `requestAnimationFrame`-silmukka | aikapohjainen + pakko-pysäytys (ei ikuista rAF) |
| 03 | 60 DOM-ruutua | ~24–32 ruutua DOM-keveyden vuoksi |
| 04 | 46 CSS-animoitua tähteä | ~20 tähteä TAI yksi canvas-piirto |
| 06 | yksi sivu, hotspotit | monta huonetta ohuina HTML-sivuina hubista |
