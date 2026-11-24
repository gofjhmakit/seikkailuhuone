/* Seikkailuhuone - single source of truth for game DATA + pure generators.
   UMD: window.Seik.logic in the browser, module.exports in Node (tests).
   PURE: no DOM, no timers, no audio - so the test suite runs the SAME code.
   Old-WebKit-safe: ES5 only. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;                 /* Node: tests/run-tests.js */
  }
  if (typeof window !== "undefined") {
    window.Seik = window.Seik || {};
    window.Seik.logic = api;              /* Browser: Seik.logic.<game> */
  }
})(this, function () {
  "use strict";

  /* ---------- shared pure utilities (used by every game + the tests) ---------- */
  var util = {
    randInt: function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
    chance: function (p) { return Math.random() < p; },
    pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle: function (arr) {
      var a = arr.slice(), i, j, t;
      for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    },
    pickDistinct: function (arr, n) { return util.shuffle(arr).slice(0, Math.min(n, arr.length)); },
    clamp: function (v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  };

  /* ================= 08 · Hassu hirviopaja (Silly Monster Maker) ================= */
  var hirviopaja = (function () {
    var slots = ["head", "body", "tail", "wing", "horn", "leg", "pat", "hat"];

    /* assembly order, back -> front (base-shadow is a literal part id) */
    var zOrder = ["base-shadow", "wing", "tail", "leg", "horn", "body", "pat", "head", "hat"];

    var options = {
      head: ["head-liekki", "head-narsku", "head-tuijo", "head-nokka", "head-kurno", "head-moly", "head-piip", "head-napse"],
      body: ["body-potko", "body-pallo", "body-nukka", "body-muna", "body-okki", "body-kuori", "body-mohko", "body-tolkki"],
      tail: ["tail-piikki", "tail-pompo", "tail-sakara", "tail-kiemu", "tail-viuhka", "tail-topo", "tail-nuija", "tail-suti"],
      wing: ["wing-none", "wing-nahka", "wing-hoyhen", "wing-perho", "wing-surri", "wing-porro", "wing-pyorre"],
      horn: ["horn-none", "horn-sarvi", "horn-kruunu", "horn-tunto", "horn-torvi", "horn-kohmy", "horn-harja"],
      leg: ["leg-tassu", "leg-toppo", "leg-kavio", "leg-kynsi", "leg-jousi", "leg-pyora"],
      pat: ["pat-none", "pat-pilkku", "pat-raita", "pat-tapla", "pat-tahti", "pat-ruutu", "pat-sydan"],
      hat: ["hat-none", "hat-silinteri", "hat-lippis", "hat-kruunu", "hat-juhla", "hat-kypara", "hat-kukka"]
    };

    /* big readable labels for the slot cyclers */
    var labels = {
      head: "PÄÄ", body: "KEHO", tail: "HÄNTÄ", wing: "SIIVET",
      horn: "SARVET", leg: "JALAT", pat: "KUVIO", hat: "HATTU"
    };

    /* name pieces (compound name = head + body + tail, lowercase) */
    var piece = {
      "head-liekki": "liekki", "head-narsku": "narsku", "head-tuijo": "tuijo", "head-nokka": "nokka",
      "head-kurno": "kurno", "head-moly": "möly", "head-piip": "piip", "head-napse": "napse",
      "body-potko": "pötkö", "body-pallo": "pallo", "body-nukka": "nukka", "body-muna": "muna",
      "body-okki": "okki", "body-kuori": "kuori", "body-mohko": "möhkö", "body-tolkki": "tölkki",
      "tail-piikki": "piikki", "tail-pompo": "pömpö", "tail-sakara": "sakara", "tail-kiemu": "kiemu",
      "tail-viuhka": "viuhka", "tail-topo": "töpö", "tail-nuija": "nuija", "tail-suti": "suti"
    };

    var adjectives = ["iso", "pikku", "super", "hassu", "mahti", "kulta"];

    /* voice: 3 notes, one per head/body/tail, in Hz. Timbre fixed per slot. */
    var voiceHz = {
      "head-liekki": 392, "head-narsku": 262, "head-tuijo": 440, "head-nokka": 523,
      "head-kurno": 196, "head-moly": 330, "head-piip": 659, "head-napse": 349,
      "body-potko": 196, "body-pallo": 220, "body-nukka": 165, "body-muna": 247,
      "body-okki": 208, "body-kuori": 147, "body-mohko": 175, "body-tolkki": 233,
      "tail-piikki": 587, "tail-pompo": 440, "tail-sakara": 523, "tail-kiemu": 494,
      "tail-viuhka": 659, "tail-topo": 392, "tail-nuija": 330, "tail-suti": 698
    };
    var voiceTimbre = { head: "saw", body: "tri", tail: "square" };

    var defaults = {
      head: "head-liekki", body: "body-potko", tail: "tail-piikki", wing: "wing-nahka",
      horn: "horn-sarvi", leg: "leg-tassu", pat: "pat-none", hat: "hat-none"
    };

    function makeName(sel) {
      return (piece[sel.head] || "") + (piece[sel.body] || "") + (piece[sel.tail] || "");
    }
    function randomSel() {
      var s = {}, i;
      for (i = 0; i < slots.length; i++) { s[slots[i]] = util.pick(options[slots[i]]); }
      return s;
    }
    function cycle(slot, id, dir) {
      var arr = options[slot], i = 0, k;
      for (k = 0; k < arr.length; k++) { if (arr[k] === id) { i = k; break; } }
      i = (i + dir + arr.length) % arr.length;
      return arr[i];
    }
    /* the 3-note voice as playable specs (engine turns these into WAV notes / synth) */
    function voice(sel) {
      return [
        { id: sel.head, hz: voiceHz[sel.head], timbre: voiceTimbre.head, dur: 0.18 },
        { id: sel.body, hz: voiceHz[sel.body], timbre: voiceTimbre.body, dur: 0.20 },
        { id: sel.tail, hz: voiceHz[sel.tail], timbre: voiceTimbre.tail, dur: 0.22 }
      ];
    }
    /* HUUDA shout patterns: reorder / repeat the 3 base notes (0=head, 1=body,
       2=tail) at different tempos, so the same monster can shout in several ways.
       The variety is in the PATTERN (which notes fire, order, count, rhythm) — that
       is what's audible on the Acer, whose pre-baked per-part WAVs can't change
       pitch. `gap` is the ms between note onsets for that pattern. */
    var shoutPatterns = [
      { seq: [0, 1, 2],    gap: 185 },   /* perus: pää, keho, häntä */
      { seq: [2, 1, 0],    gap: 185 },   /* takaperin */
      { seq: [0, 0, 1, 2], gap: 125 },   /* änkytys (nopea alku) */
      { seq: [0, 1, 2, 2], gap: 150 },   /* tuplaloppu */
      { seq: [1, 1, 2],    gap: 235 },   /* matala murina */
      { seq: [2, 0, 2, 0], gap: 110 }    /* kikatus */
    ];
    function shout(sel, idx) {
      var base = voice(sel), n = shoutPatterns.length;
      var p = shoutPatterns[((idx % n) + n) % n], out = [], i, b;
      for (i = 0; i < p.seq.length; i++) {
        b = base[p.seq[i]];
        out.push({ id: b.id, hz: b.hz, timbre: b.timbre, dur: b.dur, gap: p.gap });
      }
      return out;
    }

    function selfTest(ok, eq) {
      var s, i, k, arr, name;
      /* option counts match the design */
      eq(options.head.length, 8, "hirvio heads");
      eq(options.body.length, 8, "hirvio bodies");
      eq(options.tail.length, 8, "hirvio tails");
      eq(options.wing.length, 7, "hirvio wings (6+none)");
      eq(options.horn.length, 7, "hirvio horns (6+none)");
      eq(options.leg.length, 6, "hirvio legs");
      eq(options.pat.length, 7, "hirvio patterns (6+none)");
      eq(options.hat.length, 7, "hirvio hats (6+none)");
      /* every head/body/tail has a name piece + a voice pitch */
      for (k = 0; k < 3; k++) {
        arr = options[["head", "body", "tail"][k]];
        for (i = 0; i < arr.length; i++) {
          ok(!!piece[arr[i]], "piece for " + arr[i]);
          ok(voiceHz[arr[i]] > 0, "voiceHz for " + arr[i]);
        }
      }
      /* names are non-empty, lowercase Finnish letters only, reasonable length */
      for (i = 0; i < 300; i++) {
        s = randomSel();
        name = makeName(s);
        ok(name.length >= 8 && name.length <= 26, "name length ok: " + name);
        ok(/^[a-zäöå]+$/.test(name), "name lowercase letters only: " + name);
      }
      /* defaults are valid options */
      for (i = 0; i < slots.length; i++) {
        ok(options[slots[i]].indexOf(defaults[slots[i]]) >= 0, "default valid for " + slots[i]);
      }
      /* cycle wraps correctly */
      eq(cycle("head", options.head[0], -1), options.head[options.head.length - 1], "cycle wraps back");
      eq(cycle("head", options.head[options.head.length - 1], 1), options.head[0], "cycle wraps fwd");
      /* shout: several distinct patterns, each a valid reshuffle of the 3 base notes */
      ok(shoutPatterns.length >= 4, "hirvio has several shout patterns");
      s = randomSel();
      var base = voice(s), si, p, notes, j;
      for (si = 0; si < shoutPatterns.length; si++) {
        p = shoutPatterns[si];
        ok(p.seq.length >= 3, "shout pattern " + si + " has notes");
        ok(p.gap > 0, "shout pattern " + si + " has a tempo");
        notes = shout(s, si);
        eq(notes.length, p.seq.length, "shout " + si + " length matches seq");
        for (j = 0; j < p.seq.length; j++) {
          ok(p.seq[j] >= 0 && p.seq[j] <= 2, "shout " + si + " seq index in range");
          eq(notes[j].id, base[p.seq[j]].id, "shout " + si + " note " + j + " = base note");
          ok(notes[j].hz > 0, "shout " + si + " note " + j + " has pitch");
        }
      }
      /* idx wraps both ways so a random index is always safe */
      eq(shout(s, shoutPatterns.length).length, shout(s, 0).length, "shout idx wraps high");
      eq(shout(s, -1).length, shout(s, shoutPatterns.length - 1).length, "shout idx wraps low");
    }

    return {
      slots: slots, zOrder: zOrder, options: options, labels: labels,
      piece: piece, adjectives: adjectives, voiceHz: voiceHz, voiceTimbre: voiceTimbre,
      defaults: defaults, shoutPatterns: shoutPatterns,
      makeName: makeName, randomSel: randomSel, cycle: cycle, voice: voice, shout: shout,
      selfTest: selfTest
    };
  })();

  /* ===================== 01 · Tulivuori (The Volcano) ===================== */
  var tulivuori = (function () {
    /* 26 launchable objects (id matches obj-* sprite); rare = weighted down */
    var objects = [
      { id: "obj-saapas", nimi: "saapas" }, { id: "obj-kana", nimi: "kana" },
      { id: "obj-kala", nimi: "kala" }, { id: "obj-kello", nimi: "kello" },
      { id: "obj-porkkana", nimi: "porkkana" }, { id: "obj-harja", nimi: "hammasharja" },
      { id: "obj-sukka", nimi: "sukka" }, { id: "obj-banaani", nimi: "banaani" },
      { id: "obj-ankka", nimi: "ankka" }, { id: "obj-omena", nimi: "omena" },
      { id: "obj-tahti", nimi: "tähti" }, { id: "obj-sydan", nimi: "sydän" },
      { id: "obj-kuppi", nimi: "kuppi" }, { id: "obj-hattu", nimi: "hattu" },
      { id: "obj-avain", nimi: "avain" }, { id: "obj-pallo", nimi: "pallo" },
      { id: "obj-kukka", nimi: "kukka" }, { id: "obj-kirja", nimi: "kirja" },
      { id: "obj-makkara", nimi: "makkara" }, { id: "obj-etana", nimi: "etana", rare: true },
      { id: "obj-sammakko", nimi: "sammakko", rare: true }, { id: "obj-luu", nimi: "luu" },
      { id: "obj-kivi", nimi: "kivi" }, { id: "obj-raketti", nimi: "raketti" },
      { id: "obj-dino", nimi: "dino", rare: true }, { id: "obj-aarre", nimi: "aarre", rare: true }
    ];

    var eruptions = [
      { id: "laava", nimi: "laava", icon: "icon-laava" },
      { id: "savu", nimi: "savurenkaat", icon: "icon-savu" },
      { id: "kivet", nimi: "kivet", icon: "icon-kivet" },
      { id: "ilotulitus", nimi: "ilotulitus", icon: "icon-ilotulitus" }
    ];

    /* particle recipe per eruption type (engine-drawn canvas, all <=24, time-based) */
    var particleSpec = {
      laava:      { count: 22, colors: ["#ff8a4c", "#ffb43d", "#e8452f", "#ffd264"], gravity: 0.18, speed: [4, 9], life: [1500, 2200], shape: "circle", spread: 1.1 },
      savu:       { count: 7,  colors: ["#7a6f86", "#4a4150"], gravity: -0.015, speed: [1, 2.5], life: [2600, 3200], shape: "circle", spread: 0.7, size: [18, 26] },
      kivet:      { count: 15, colors: ["#4a4150", "#7a6f86"], gravity: 0.26, speed: [4, 8], life: [1400, 1800], shape: "rect", spread: 1.2 },
      ilotulitus: { count: 24, colors: ["#cfe8ff", "#ffd264", "#46c4a8", "#ff8a4c"], gravity: 0.05, speed: [3, 7], life: [1200, 1600], shape: "circle", spread: 3.14 }
    };

    /* museum slot centres (match museum.svg header) */
    var slotX = [125, 285, 445, 605, 765, 925];
    var slotY = [135, 235, 335, 435, 535];
    function slotCenter(i) { return { x: slotX[i % 6], y: slotY[Math.floor(i / 6)] }; }

    function pickObject() {
      var bag = [], i;
      for (i = 0; i < objects.length; i++) { bag.push(objects[i]); if (!objects[i].rare) { bag.push(objects[i]); bag.push(objects[i]); } }
      return util.pick(bag);
    }
    function byId(id) { for (var i = 0; i < objects.length; i++) { if (objects[i].id === id) return objects[i]; } return null; }

    function selfTest(ok, eq) {
      var i, t;
      eq(objects.length, 26, "tulivuori object count");
      eq(eruptions.length, 4, "tulivuori eruption count");
      for (i = 0; i < objects.length; i++) {
        ok(!!objects[i].nimi && objects[i].nimi.length >= 3, "obj has readable nimi: " + objects[i].id);
        ok(/^obj-[a-z]+$/.test(objects[i].id), "obj id shape: " + objects[i].id);
      }
      for (i = 0; i < eruptions.length; i++) {
        t = particleSpec[eruptions[i].id];
        ok(!!t, "particleSpec for " + eruptions[i].id);
        ok(t.count <= 24, "particle cap <=24 for " + eruptions[i].id + " (" + t.count + ")");
      }
      for (i = 0; i < 100; i++) { ok(byId(pickObject().id) !== null, "pickObject returns a known object"); }
      eq(slotCenter(0).x, 125, "slot0 x"); eq(slotCenter(0).y, 135, "slot0 y");
      eq(slotCenter(25).x, 285, "slot25 x"); eq(slotCenter(25).y, 535, "slot25 y");
    }

    return {
      objects: objects, eruptions: eruptions, particleSpec: particleSpec,
      slotCenter: slotCenter, pickObject: pickObject, byId: byId, selfTest: selfTest
    };
  })();

  /* ================= 02 · Lohikaarmeen muna (The Dragon Egg) ================= */
  var muna = (function () {
    var schemes = {
      punainen:  { main: "#e8452f", belly: "#ff8a4c", dark: "#a82e1e" },
      oranssi:   { main: "#ff8a4c", belly: "#ffd264", dark: "#c75a2a" },
      keltainen: { main: "#ffd264", belly: "#fff7e6", dark: "#c9922f" },
      vihrea:    { main: "#3aa64a", belly: "#f3e7cc", dark: "#2b7d39" },
      turkoosi:  { main: "#46c4a8", belly: "#cfe8ff", dark: "#2e8a76" },
      sininen:   { main: "#7cc0ff", belly: "#cfe8ff", dark: "#3f84c4" },
      valkoinen: { main: "#fff7e6", belly: "#f3e7cc", dark: "#d9c89a" },
      kulta:     { main: "#ffb43d", belly: "#ffd264", dark: "#c77f1e" }
    };
    var colourWord = { punainen: "punainen", oranssi: "oranssi", keltainen: "keltainen",
      vihrea: "vihreä", turkoosi: "turkoosi", sininen: "sininen",
      valkoinen: "valkoinen", kulta: "kulta" };
    var schemeKeys = ["punainen", "oranssi", "keltainen", "vihrea", "turkoosi", "sininen", "valkoinen", "kulta"];
    var horns = ["horn-sarvet", "horn-piikit", "horn-nuppu"];
    var wings = ["wing-nahka", "wing-hoyhen", "wing-pikku"];
    var patterns = ["pat-silea", "pat-pilkut", "pat-raidat"];
    var names = ["Roihu", "Liekki", "Tuli", "Pörö", "Nuppu", "Köpi", "Riku",
      "Pulla", "Myrsky", "Tähti", "Pilvi", "Nalle", "Vilkku", "Tassu"];
    var foods = [
      { id: "food-liha", nimi: "liha" }, { id: "food-kala", nimi: "kala" },
      { id: "food-marja", nimi: "marja" }, { id: "food-keksi", nimi: "keksi" },
      { id: "food-leipa", nimi: "leipä" }, { id: "food-omena", nimi: "omena" }
    ];
    var CRACKS = 5, GROW_EVERY = 4;

    function randomDragon() {
      return { scheme: util.pick(schemeKeys), horn: util.pick(horns),
        wing: util.pick(wings), pat: util.pick(patterns), name: util.pick(names) };
    }
    function label(d) { return d.name + " · " + colourWord[d.scheme]; }

    function selfTest(ok, eq) {
      var i, s;
      eq(schemeKeys.length, 8, "muna 8 schemes");
      for (i = 0; i < schemeKeys.length; i++) {
        s = schemes[schemeKeys[i]];
        ok(s && /^#[0-9a-f]{6}$/.test(s.main) && /^#[0-9a-f]{6}$/.test(s.belly) && /^#[0-9a-f]{6}$/.test(s.dark), "scheme colours " + schemeKeys[i]);
        ok(!!colourWord[schemeKeys[i]], "colour word " + schemeKeys[i]);
      }
      eq(horns.length, 3, "muna horns"); eq(wings.length, 3, "muna wings"); eq(patterns.length, 3, "muna patterns");
      eq(schemeKeys.length * horns.length * wings.length * patterns.length, 216, "muna 216 looks");
      eq(names.length, 14, "muna names"); eq(foods.length, 6, "muna foods");
      for (i = 0; i < 200; i++) {
        var d = randomDragon();
        ok(schemes[d.scheme] && horns.indexOf(d.horn) >= 0 && wings.indexOf(d.wing) >= 0 && patterns.indexOf(d.pat) >= 0 && names.indexOf(d.name) >= 0, "randomDragon valid");
        ok(label(d).indexOf("·") > 0, "label has separator");
      }
    }

    return {
      schemes: schemes, colourWord: colourWord, schemeKeys: schemeKeys,
      horns: horns, wings: wings, patterns: patterns, names: names, foods: foods,
      CRACKS: CRACKS, GROW_EVERY: GROW_EVERY,
      randomDragon: randomDragon, label: label, selfTest: selfTest
    };
  })();

  /* ===================== 05 · Taikapata (The Potion Pot) ===================== */
  var taikapata = (function () {
    var ingredients = [
      { id: "tuli", nimi: "tuli", color: "#ff8a4c" },
      { id: "vesi", nimi: "vesi", color: "#7cc0ff" },
      { id: "myrkky", nimi: "myrkky", color: "#3aa64a" },
      { id: "tahti", nimi: "tähti", color: "#ffd264" },
      { id: "kukka", nimi: "kukka", color: "#e8452f" },
      { id: "sammakko", nimi: "sammakko", color: "#2b7d39" },
      { id: "kivi", nimi: "kivi", color: "#7a6f86" },
      { id: "hunaja", nimi: "hunaja", color: "#ffb43d" },
      { id: "lumi", nimi: "lumi", color: "#cfe8ff" }
    ];
    var NEUTRAL = "#4a4150";

    var results = {
      hoyry:      { nimi: "höyry", msg: "sihisee! höyryä", burst: ["#fff7e6"], snd: "hoyry" },
      pamaus:     { nimi: "pamaus", msg: "PAM! pieni pamaus", burst: ["#ff8a4c"], snd: "pamaus" },
      sammakko:   { nimi: "sammakko", msg: "kvak! sammakko!", burst: ["#3aa64a"], snd: "kvak" },
      sateenkaari:{ nimi: "sateenkaari", msg: "oho! sateenkaari!", burst: ["#e8452f", "#ff8a4c", "#ffd264", "#3aa64a", "#7cc0ff"], snd: "sateenkaari" },
      kukka:      { nimi: "kukka", msg: "kukka puhkesi!", burst: ["#e8452f"], snd: "pop" },
      jaa:        { nimi: "jää", msg: "jäätyi!", burst: ["#cfe8ff"], snd: "jaa" },
      kutistuu:   { nimi: "kutistuu", msg: "pikkuruiseksi!", burst: ["#7cc0ff"], snd: "kutistu" },
      haju:       { nimi: "haju", msg: "PÖH! löyhkä!", burst: ["#2b7d39"], snd: "poh" },
      kimallus:   { nimi: "kimallus", msg: "taikaa! kimalletta", burst: ["#ffd264"], snd: "kimallus" },
      kulta:      { nimi: "kulta", msg: "kultaa!", burst: ["#ffb43d"], snd: "kolise" },
      tahtisade:  { nimi: "tähtisade", msg: "tähtisade!", burst: ["#ffd264"], snd: "kimallus" },
      kupla:      { nimi: "kupla", msg: "iso kupla!", burst: ["#7cc0ff"], snd: "pop" },
      kasvaa:     { nimi: "kasvaa", msg: "se kasvaa isoksi!", burst: ["#46c4a8"], snd: "kasva" },
      fizz:       { nimi: "fizz", msg: "pulp pulp... kuplia", burst: ["#46c4a8"], snd: "pulp" }
    };
    var resultOrder = ["hoyry", "pamaus", "sammakko", "sateenkaari", "kukka", "jaa", "kutistuu",
      "haju", "kimallus", "kulta", "tahtisade", "kupla", "kasvaa", "fizz"];

    function key(arr) { return arr.slice().sort().join("|"); }
    function P(a, b) { return key([a, b]); }

    var pairs = {};
    (function () {
      var def = {
        hoyry: [["tuli", "vesi"], ["tuli", "lumi"]],
        pamaus: [["tuli", "myrkky"], ["tuli", "kivi"]],
        sammakko: [["tuli", "sammakko"], ["vesi", "myrkky"], ["vesi", "sammakko"], ["kukka", "sammakko"], ["sammakko", "kivi"], ["sammakko", "hunaja"]],
        sateenkaari: [["vesi", "tahti"]],
        kukka: [["vesi", "kukka"], ["kukka", "hunaja"]],
        jaa: [["vesi", "lumi"], ["myrkky", "lumi"], ["kukka", "lumi"], ["sammakko", "lumi"], ["hunaja", "lumi"]],
        kutistuu: [["myrkky", "tahti"], ["kivi", "lumi"]],
        haju: [["myrkky", "kukka"], ["myrkky", "kivi"], ["myrkky", "hunaja"]],
        kimallus: [["tahti", "kukka"], ["tahti", "sammakko"], ["tahti", "kivi"]],
        kulta: [["tuli", "hunaja"], ["tahti", "hunaja"]],
        tahtisade: [["tuli", "tahti"], ["tahti", "lumi"]],
        kupla: [["vesi", "kivi"], ["vesi", "hunaja"], ["kivi", "hunaja"]],
        kasvaa: [["tuli", "kukka"], ["myrkky", "sammakko"], ["kukka", "kivi"]]
      };
      for (var res in def) {
        if (!def.hasOwnProperty(res)) continue;
        for (var i = 0; i < def[res].length; i++) { pairs[P(def[res][i][0], def[res][i][1])] = res; }
      }
    })();
    var supers = {};
    supers[key(["tuli", "vesi", "tahti"])] = "sateenkaari";
    supers[key(["tahti", "kukka", "hunaja"])] = "kulta";
    supers[key(["vesi", "lumi", "tahti"])] = "jaa";

    function reaction(sel) {
      if (sel.length === 2) { return pairs[key(sel)] || "fizz"; }
      if (sel.length === 3) { return supers[key(sel)] || "fizz"; }
      return "fizz";
    }
    /* cheap RGB average of ingredient colours -> liquid tint */
    function mixColour(sel) {
      if (!sel.length) return NEUTRAL;
      var r = 0, g = 0, b = 0, i, c;
      for (i = 0; i < sel.length; i++) {
        c = ingById(sel[i]).color;
        r += parseInt(c.substr(1, 2), 16); g += parseInt(c.substr(3, 2), 16); b += parseInt(c.substr(5, 2), 16);
      }
      function h(n) { n = Math.round(n / sel.length).toString(16); return n.length < 2 ? "0" + n : n; }
      return "#" + h(r) + h(g) + h(b);
    }
    function ingById(id) { for (var i = 0; i < ingredients.length; i++) { if (ingredients[i].id === id) return ingredients[i]; } return null; }

    function selfTest(ok, eq) {
      var i, j, n = 0;
      eq(ingredients.length, 9, "taika 9 ingredients");
      eq(resultOrder.length, 14, "taika 14 results");
      for (i = 0; i < resultOrder.length; i++) {
        ok(!!results[resultOrder[i]], "result exists: " + resultOrder[i]);
        ok(results[resultOrder[i]].burst.length >= 1, "result has burst colour: " + resultOrder[i]);
      }
      /* every one of the 36 pairs is mapped (no gaps) */
      for (i = 0; i < ingredients.length; i++) {
        for (j = i + 1; j < ingredients.length; j++) {
          var k = P(ingredients[i].id, ingredients[j].id);
          ok(!!pairs[k], "pair mapped: " + k);
          ok(!!results[pairs[k]], "pair -> valid result: " + k);
          n++;
        }
      }
      eq(n, 36, "taika 36 pairs");
      eq(reaction(["tuli", "vesi"]), "hoyry", "tuli+vesi=hoyry");
      eq(reaction(["vesi", "tuli"]), "hoyry", "order-free");
      eq(reaction(["tuli"]), "fizz", "single=fizz");
      eq(reaction(["tuli", "vesi", "tahti"]), "sateenkaari", "super sateenkaari");
      ok(/^#[0-9a-f]{6}$/.test(mixColour(["tuli", "vesi"])), "mixColour hex");
    }

    return {
      ingredients: ingredients, results: results, resultOrder: resultOrder, NEUTRAL: NEUTRAL,
      reaction: reaction, mixColour: mixColour, ingById: ingById, selfTest: selfTest
    };
  })();

  /* ===================== 03 · Dinon luut (Dino Bones) ===================== */
  var luut = (function () {
    var grid = { cols: 7, rows: 4, x0: 120, y0: 180, tw: 112, th: 85 };
    function tileBox(r, c) { return { x: grid.x0 + grid.tw * c, y: grid.y0 + grid.th * r, w: grid.tw, h: grid.th }; }
    function tileId(r, c) { return "t" + r + "_" + c; }
    function rcOf(id) { var p = id.substr(1).split("_"); return { r: +p[0], c: +p[1] }; }
    function overlaps(a, bx, by, bw, bh) { return a.x < bx + bw && a.x + a.w > bx && a.y < by + bh && a.y + a.h > by; }
    function tilesForZone(bbox) {
      var out = [], r, c;
      for (r = 0; r < grid.rows; r++) { for (c = 0; c < grid.cols; c++) { if (overlaps(tileBox(r, c), bbox[0], bbox[1], bbox[2], bbox[3])) out.push(tileId(r, c)); } }
      return out;
    }

    var skeletons = [
      { id: "tyrannosaurus", nimi: "tyrannosaurus", hasJaw: true, zones: [
        { name: "kallo", bbox: [180, 234, 140, 82] }, { name: "selka", bbox: [300, 248, 270, 90] },
        { name: "kylki", bbox: [356, 286, 145, 125] }, { name: "kasi", bbox: [368, 350, 36, 50] },
        { name: "jalka", bbox: [500, 320, 70, 185] }, { name: "hanta", bbox: [556, 330, 310, 125] } ] },
      { id: "triceratops", nimi: "triceratops", hasJaw: false, zones: [
        { name: "kallo", bbox: [168, 246, 212, 145] }, { name: "selka", bbox: [372, 268, 250, 42] },
        { name: "kylki", bbox: [410, 292, 155, 118] }, { name: "etujalka", bbox: [398, 318, 40, 182] },
        { name: "takajalka", bbox: [596, 312, 42, 188] }, { name: "hanta", bbox: [620, 304, 146, 56] } ] },
      { id: "mammutti", nimi: "mammutti", hasJaw: false, zones: [
        { name: "kallo", bbox: [186, 258, 160, 205] }, { name: "selka", bbox: [320, 232, 305, 60] },
        { name: "kylki", bbox: [376, 280, 185, 140] }, { name: "etujalka", bbox: [372, 298, 24, 200] },
        { name: "takajalka", bbox: [596, 302, 24, 196] } ] },
      { id: "pitkakaula", nimi: "pitkäkaula", hasJaw: false, zones: [
        { name: "kallo", bbox: [160, 208, 58, 40] }, { name: "kaula", bbox: [190, 230, 175, 118] },
        { name: "runko", bbox: [360, 300, 276, 135] }, { name: "jalat", bbox: [400, 336, 230, 166] },
        { name: "hanta", bbox: [636, 322, 252, 54] } ] },
      { id: "raptori", nimi: "raptori", hasJaw: true, zones: [
        { name: "kallo", bbox: [190, 292, 115, 54] }, { name: "selka", bbox: [300, 290, 210, 44] },
        { name: "kylki", bbox: [344, 312, 140, 100] }, { name: "jalka", bbox: [460, 320, 56, 154] },
        { name: "hanta", bbox: [506, 310, 284, 34] } ] }
    ];

    /* atlas-centre of each surprise sprite (its translate + approx local centre) */
    var surprises = [
      { id: "ankka", line: "hihi! kumiankka hiekassa!", snd: "duck", ac: [282, 81] },
      { id: "kivi", line: "vain kivi. ei luu.", snd: "clink", ac: [412, 88] },
      { id: "aarre", line: "oho! aarre!", snd: "clink", ac: [68, 190] },
      { id: "simpukka", line: "simpukka! vanha meri.", snd: "chime", ac: [190, 200] },
      { id: "hammas", line: "iso hammas!", snd: "chime", ac: [310, 191] }
    ];

    function pickSkeleton() { return util.pick(skeletons); }
    function pickSurprises() { return util.pickDistinct(surprises, util.randInt(0, 2)); }
    function byId(id) { for (var i = 0; i < skeletons.length; i++) { if (skeletons[i].id === id) return skeletons[i]; } return null; }

    function selfTest(ok, eq) {
      var i, j, counts = { tyrannosaurus: 6, triceratops: 6, mammutti: 5, pitkakaula: 5, raptori: 5 };
      eq(skeletons.length, 5, "luut 5 skeletons");
      for (i = 0; i < skeletons.length; i++) {
        eq(skeletons[i].zones.length, counts[skeletons[i].id], "zone count " + skeletons[i].id);
        for (j = 0; j < skeletons[i].zones.length; j++) {
          ok(tilesForZone(skeletons[i].zones[j].bbox).length >= 1, "zone has a covering tile: " + skeletons[i].id + "." + skeletons[i].zones[j].name);
        }
      }
      eq(surprises.length, 5, "luut 5 surprises");
      eq(tileId(3, 6), "t3_6", "tileId"); eq(rcOf("t2_4").c, 4, "rcOf c");
    }

    return {
      grid: grid, tileBox: tileBox, tileId: tileId, rcOf: rcOf, tilesForZone: tilesForZone,
      skeletons: skeletons, surprises: surprises, pickSkeleton: pickSkeleton, pickSurprises: pickSurprises,
      byId: byId, selfTest: selfTest
    };
  })();

  /* ===================== 04 · Tahtikuvio / Tahdet (constellations) ===================== */
  var tahdet = (function () {
    var figures = [
      { id: "lohikaarme", nimi: "lohikäärme", closed: false, coords: [[770, 175], [685, 215], [590, 235], [515, 160], [465, 290], [360, 335], [270, 300]] },
      { id: "dino", nimi: "dino", closed: true, coords: [[180, 370], [320, 280], [450, 245], [575, 170], [620, 205], [510, 300], [455, 440], [290, 435]] },
      { id: "raketti", nimi: "raketti", closed: true, coords: [[512, 150], [558, 250], [612, 385], [548, 365], [512, 425], [476, 365], [412, 385], [466, 250]] },
      { id: "laiva", nimi: "laiva", closed: true, coords: [[350, 410], [500, 420], [650, 410], [605, 365], [500, 180], [395, 365]] },
      { id: "kissa", nimi: "kissa", closed: true, coords: [[410, 175], [465, 215], [560, 215], [615, 175], [600, 300], [512, 350], [425, 300]] },
      { id: "kala", nimi: "kala", closed: true, coords: [[360, 290], [470, 245], [600, 215], [560, 290], [600, 365], [470, 335]] },
      { id: "talo", nimi: "talo", closed: true, coords: [[410, 430], [614, 430], [614, 315], [650, 315], [512, 215], [374, 315], [410, 315]] },
      { id: "sydan", nimi: "sydän", closed: true, coords: [[512, 440], [425, 360], [372, 292], [425, 232], [512, 285], [599, 232], [652, 292], [599, 360]] }
    ];
    function byId(id) { for (var i = 0; i < figures.length; i++) { if (figures[i].id === id) return figures[i]; } return null; }
    function selfTest(ok, eq) {
      var i, j, total = 0;
      eq(figures.length, 8, "tahdet 8 figures");
      for (i = 0; i < figures.length; i++) {
        ok(figures[i].coords.length >= 6 && figures[i].coords.length <= 8, "fig N in range: " + figures[i].id);
        total += figures[i].coords.length;
        for (j = 0; j < figures[i].coords.length; j++) {
          var p = figures[i].coords[j];
          ok(p[0] >= 150 && p[0] <= 900 && p[1] >= 140 && p[1] <= 460, "coord in safe area: " + figures[i].id + "#" + j);
        }
        ok(!!figures[i].nimi, "fig has nimi: " + figures[i].id);
      }
      eq(total, 57, "tahdet 57 puzzle stars");
    }
    return { figures: figures, byId: byId, selfTest: selfTest };
  })();

  /* ===================== 07 · Rakettipaja (Rocket Workshop) ===================== */
  var raketti = (function () {
    var noses = [
      { id: "terava", nimi: "terävä" }, { id: "pyorea", nimi: "pyöreä" },
      { id: "littea", nimi: "litteä" }, { id: "kruunu", nimi: "kruunu" }, { id: "tahti", nimi: "tähti" }
    ];
    var colors = [
      { hex: "#e8452f", nimi: "punainen" }, { hex: "#7cc0ff", nimi: "sininen" },
      { hex: "#3aa64a", nimi: "vihreä" }, { hex: "#ffd264", nimi: "keltainen" }, { hex: "#46c4a8", nimi: "turkoosi" }
    ];
    var fins = [
      { id: "kolmio", nimi: "kolmio" }, { id: "pyorea", nimi: "pyöreä" },
      { id: "nuoli", nimi: "nuoli" }, { id: "isot", nimi: "isot" }, { id: "pienet", nimi: "pienet" }
    ];
    /* ac = atlas-centre of each destination sprite (translate + approx local centre) */
    var destinations = [
      { id: "kuu", nimi: "kuu", ac: [100, 60] }, { id: "asteroidit", nimi: "asteroidit", ac: [297, 68] },
      { id: "planeetta", nimi: "planeetta", ac: [498, 62] }, { id: "tahti", nimi: "tähti", ac: [100, 178] },
      { id: "komeetta", nimi: "komeetta", ac: [284, 182] }
    ];
    function randomDestination() { return util.pick(destinations); }
    function selfTest(ok, eq) {
      var i;
      eq(noses.length, 5, "raketti 5 noses"); eq(fins.length, 5, "raketti 5 fins");
      eq(colors.length, 5, "raketti 5 colors"); eq(destinations.length, 5, "raketti 5 destinations");
      eq(noses.length * colors.length * fins.length, 125, "raketti 125 combos");
      for (i = 0; i < colors.length; i++) { ok(/^#[0-9a-f]{6}$/.test(colors[i].hex), "color hex " + colors[i].nimi); }
      for (i = 0; i < destinations.length; i++) { ok(destinations[i].ac.length === 2, "dest ac " + destinations[i].id); }
    }
    return { noses: noses, colors: colors, fins: fins, destinations: destinations, randomDestination: randomDestination, selfTest: selfTest };
  })();

  /* ===================== 06 · Salahuone (10-room point-and-click house) ===================== */
  var salahuone = (function () {
    var rooms = ["eteinen", "keittio", "olohuone", "kirjasto", "kasvihuone", "paja", "ullakko", "luuhuone", "kellari", "tahtitorni"];

    /* navigation: room -> { hotspotBaseId: targetRoom } */
    var nav = {
      eteinen: { doorKeittio: "keittio", doorOlohuone: "olohuone", doorKasvihuone: "kasvihuone", stairsUp: "kirjasto", trapdoor: "kellari" },
      keittio: { navHome: "eteinen", navDown: "kellari" },
      olohuone: { navHome: "eteinen", navRight: "kasvihuone" },
      kasvihuone: { navHome: "eteinen", navLeft: "olohuone" },
      kirjasto: { navHome: "eteinen", navRight: "paja", navUp: "ullakko" },
      paja: { navHome: "eteinen", navLeft: "kirjasto", navUp: "ullakko" },
      ullakko: { navHome: "eteinen", navDown: "kirjasto", navUp: "tahtitorni" },
      luuhuone: { navHome: "eteinen", navBack: "kellari" },
      kellari: { navHome: "eteinen", navDown: "luuhuone" },
      tahtitorni: { navHome: "eteinen", navDown: "ullakko" }
    };

    /* per-object reaction: baseId -> { s: soundName, t: Finnish line } */
    var react = {
      eteinen: { coatrack: { s: "rustle", t: "hattu heiluu." }, mirror: { s: "chime", t: "kuka siellä?" }, mat: { s: "rustle", t: "tervetuloa!" } },
      keittio: { pot: { s: "boil", t: "pata kiehuu: pulp pulp." }, kettle: { s: "whistle", t: "pannu viheltää: tuut!" }, cupboard: { s: "creak", t: "kaappi narahtaa." }, fruitbowl: { s: "tap", t: "omena pyörii." }, faucet: { s: "drip", t: "vesi tippuu: tip." }, broom: { s: "clatter", t: "luuta kaatui: ratsis!" }, mousehole: { s: "chime", t: "piip! hiiri." } },
      olohuone: { win: { s: "chime", t: "tähti tuikkii." }, fireplace: { s: "fire", t: "tuli rätisee." }, clock: { s: "cuckoo", t: "kukkuu! kukkuu." }, picture: { s: "creak", t: "taulu heilahti." }, shelf: { s: "rustle", t: "kirja putosi: kop!" }, plant: { s: "rustle", t: "lehdet kahisee." }, cat: { s: "meow", t: "miau! kissa hyppäsi." }, rug: { s: "rustle", t: "pöly! aptsiu." } },
      kirjasto: { shelfBig: { s: "rustle", t: "kirja: kop!" }, ladder: { s: "creak", t: "tikkaat liukuu." }, globe: { s: "whir", t: "maapallo pyörii." }, owlLib: { s: "hoot", t: "huhuu, sanoo pöllö." }, candle: { s: "fire", t: "kynttilä lepattaa." }, chair: { s: "rustle", t: "pehmeä tuoli." }, secretBook: { s: "creak", t: "salainen kirja!" } },
      kasvihuone: { bigPlant: { s: "rustle", t: "iso kasvi huojuu." }, snapPlant: { s: "chomp", t: "nam! kärpäskasvi." }, can: { s: "drip", t: "kukka kasvaa!" }, butterfly: { s: "tap", t: "perhonen lentää." }, pots: { s: "rustle", t: "kukat nyökkää." }, roof: { s: "chime", t: "aurinko paistaa." }, snail: { s: "tap", t: "etana... niin hidasta." } },
      paja: { gears: { s: "gear", t: "rattaat pyörii: naks." }, robot: { s: "beep", t: "piip piip! robotti." }, forge: { s: "fire", t: "ahjo hehkuu." }, hammer: { s: "gear", t: "vasara: kop kop." }, toolboard: { s: "clatter", t: "työkalu heiluu." }, jack: { s: "musicbox", t: "pöö! yllätys." }, bench: { s: "creak", t: "laatikko aukeaa." } },
      ullakko: { porthole: { s: "whoosh", t: "lepakko lensi ohi." }, owl: { s: "hoot", t: "huhuu, sanoo pöllö." }, spider: { s: "whoosh", t: "hei! sanoo hämähäkki." }, crates: { s: "creak", t: "vanhaa tavaraa." }, rockhorse: { s: "horse", t: "iihaha!" }, teddy: { s: "tap", t: "nalle vilkuttaa: piip!" }, musicbox: { s: "musicbox", t: "soittorasia soi." } },
      luuhuone: { dino: { s: "roar", t: "karjuu: roaar!" }, sandpit: { s: "rustle", t: "harjaa hiekkaa." }, fossil: { s: "chime", t: "kivettymä! löytö." }, dinoEgg: { s: "creak", t: "muna heiluu." }, amber: { s: "tap", t: "ötökkä kivessä!" }, skull: { s: "rattle", t: "kallo kalisee." }, footprint: { s: "rustle", t: "iso jalanjälki!" } },
      kellari: { jars: { s: "chime", t: "purkit kilisee." }, barrel: { s: "ribbit", t: "kvak! sammakko!" }, mushrooms: { s: "chime", t: "sienet hohtaa: pling." }, dragon: { s: "snore", t: "zzz... pöh." } },
      tahtitorni: { telescope: { s: "whir", t: "näen tähden!" }, rocket: { s: "whoosh", t: "pöö! raketti." }, moonGlobe: { s: "chime", t: "kuu hohtaa." }, chart: { s: "chime", t: "lohikäärme tähdissä!" }, starJar: { s: "chime", t: "täynnä tähtösiä." }, towerDragon: { s: "snore", t: "lohikäärme odottaa." } }
    };

    /* light toggles (baseId that flips #dim) per room */
    var lights = { eteinen: "hallLamp", olohuone: "lamp", kellari: "lantern" };

    /* candidate niches where a star-stone may hide: [room, baseId] */
    var starNiches = [
      ["eteinen", "mat"], ["eteinen", "coatrack"], ["eteinen", "mirror"],
      ["keittio", "cupboard"], ["keittio", "broom"],
      ["olohuone", "picture"], ["olohuone", "rug"], ["olohuone", "plant"],
      ["kirjasto", "secretBook"], ["kirjasto", "shelfBig"],
      ["kasvihuone", "bigPlant"], ["kasvihuone", "pots"],
      ["paja", "bench"], ["paja", "forge"],
      ["ullakko", "crates"], ["ullakko", "rockhorse"],
      ["luuhuone", "sandpit"], ["luuhuone", "skull"],
      ["kellari", "barrel"], ["kellari", "jars"],
      ["tahtitorni", "telescope"], ["tahtitorni", "starJar"], ["tahtitorni", "chart"]
    ];
    /* 8 key spots with the hall clue line + matching clue icon */
    var keySpots = [
      { room: "olohuone", id: "picture", clue: "avain on taulun takana.", icon: "ic_picture" },
      { room: "olohuone", id: "rug", clue: "avain on maton alla.", icon: "ic_rug" },
      { room: "kasvihuone", id: "pots", clue: "avain on kukan ruukussa.", icon: "ic_plant" },
      { room: "kirjasto", id: "shelfBig", clue: "avain on kirjan takana.", icon: "ic_book" },
      { room: "ullakko", id: "musicbox", clue: "avain on soittorasiassa.", icon: "ic_musicbox" },
      { room: "ullakko", id: "rockhorse", clue: "avain on keinuhevosen alla.", icon: "ic_horse" },
      { room: "kellari", id: "barrel", clue: "avain on tynnyrissä.", icon: "ic_barrel" },
      { room: "kellari", id: "jars", clue: "avain on purkissa.", icon: "ic_jar" }
    ];
    /* candidate mouse niches */
    var mouseNiches = [
      ["keittio", "mousehole"], ["keittio", "cupboard"], ["olohuone", "shelf"], ["olohuone", "plant"],
      ["kirjasto", "chair"], ["kasvihuone", "pots"], ["paja", "bench"], ["paja", "toolboard"],
      ["ullakko", "crates"], ["luuhuone", "sandpit"], ["kellari", "jars"], ["eteinen", "coatrack"]
    ];
    var treasures = [
      { id: "tr_coins", nimi: "kultakolikot" }, { id: "tr_starmap", nimi: "tähtikartta" },
      { id: "tr_egg", nimi: "lohikäärmeenmuna" }, { id: "tr_hat", nimi: "hassu hattu" },
      { id: "tr_pearl", nimi: "helmi" }, { id: "tr_ship", nimi: "lelulaiva" },
      { id: "tr_candy", nimi: "karkkipussi" }, { id: "tr_wand", nimi: "taikasauva" }
    ];

    function key(room, id) { return room + "/" + id; }
    /* randomly assign the 9 hidden items; returns the plan the engine drives */
    function assignQuest() {
      var assign = {}, i, n;
      function add(room, id, type) { var k = key(room, id); (assign[k] = assign[k] || []).push(type); }
      var stars = util.pickDistinct(starNiches, 5);
      for (i = 0; i < stars.length; i++) { add(stars[i][0], stars[i][1], "star"); }
      var ks = util.pick(keySpots); add(ks.room, ks.id, "key");
      var mice = util.pickDistinct(mouseNiches, 3);
      for (i = 0; i < mice.length; i++) { add(mice[i][0], mice[i][1], "mouse"); }
      return { assign: assign, keyClue: ks.clue, keyIcon: ks.icon, treasure: util.pick(treasures) };
    }

    function selfTest(ok, eq) {
      var i, r, b;
      eq(rooms.length, 10, "salahuone 10 rooms");
      /* every nav target is a real room */
      for (r in nav) { if (!nav.hasOwnProperty(r)) continue; for (b in nav[r]) { if (!nav[r].hasOwnProperty(b)) continue; ok(rooms.indexOf(nav[r][b]) >= 0, "nav target real: " + r + "." + b); } }
      ok(starNiches.length >= 18, ">=18 star niches (" + starNiches.length + ")");
      eq(keySpots.length, 8, "8 key spots");
      ok(mouseNiches.length >= 12, ">=12 mouse niches");
      eq(treasures.length, 8, "8 treasures");
      /* every niche references a room that exists */
      for (i = 0; i < starNiches.length; i++) { ok(rooms.indexOf(starNiches[i][0]) >= 0, "star niche room real: " + starNiches[i][0]); }
      /* assignQuest places exactly 5 stars, 1 key, 3 mice */
      for (i = 0; i < 60; i++) {
        var q = assignQuest(), stars = 0, keys = 0, mice = 0, k;
        for (k in q.assign) { if (!q.assign.hasOwnProperty(k)) continue; var a = q.assign[k], j; for (j = 0; j < a.length; j++) { if (a[j] === "star") stars++; else if (a[j] === "key") keys++; else if (a[j] === "mouse") mice++; } }
        eq(stars, 5, "quest 5 stars"); eq(keys, 1, "quest 1 key"); eq(mice, 3, "quest 3 mice");
        ok(!!q.keyClue && !!q.treasure, "quest has clue + treasure");
      }
    }

    return {
      rooms: rooms, nav: nav, react: react, lights: lights,
      starNiches: starNiches, keySpots: keySpots, mouseNiches: mouseNiches, treasures: treasures,
      key: key, assignQuest: assignQuest, selfTest: selfTest
    };
  })();

  var logic = {
    version: "1.1.0",
    util: util,
    tulivuori: tulivuori, muna: muna, luut: luut, tahdet: tahdet,
    taikapata: taikapata, salahuone: salahuone, raketti: raketti,
    hirviopaja: hirviopaja
  };
  return logic;
});
