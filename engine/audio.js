/* Seikkailuhuone engine - audio.
   Primary path (works on the Acer's 4.1 WebView, CONFIRMED): pre-baked PCM WAV via
   HTML5 Audio, small pool per sound for overlap. Dev/modern fallback: a tiny WebAudio
   synth so there's sound before the WAVs are generated (4.1 WebView has no WebAudio,
   but by ship it uses WAVs, so that's fine). Mute persists in localStorage.
   Attaches to window.Seik.audio. */
(function () {
  "use strict";
  window.Seik = window.Seik || {};

  var basePath = "assets/audio/";   /* overridden per page via setBase() */
  var manifest = {};                /* name -> filename.wav */
  var pools = {};                   /* name -> [Audio,...] */
  var POOL = 2;                     /* small: keeps Audio-object count low on 512 MB */
  var unlocked = false;

  var AC = window.AudioContext || window.webkitAudioContext || null;
  var ac = null;

  /* small synth table so DEV has pleasant placeholder sound per cue name */
  var SYNTH = {
    click:   { f0: 420, f1: 260, dur: 0.05, type: "square", vol: 0.10 },
    tap:     { f0: 520, f1: 520, dur: 0.04, type: "sine",   vol: 0.08 },
    chime:   { f0: 880, f1: 1320, dur: 0.22, type: "sine",  vol: 0.14 },
    ding:    { f0: 988, f1: 1480, dur: 0.20, type: "sine",  vol: 0.14 },
    pop:     { f0: 300, f1: 760, dur: 0.08, type: "sine",   vol: 0.12 },
    boom:    { f0: 140, f1: 50,  dur: 0.40, type: "sawtooth", vol: 0.18, noise: true },
    rumble:  { f0: 90,  f1: 60,  dur: 0.55, type: "sawtooth", vol: 0.12, noise: true },
    whoosh:  { f0: 600, f1: 180, dur: 0.35, type: "sine",   vol: 0.10, noise: true },
    fizz:    { f0: 1200, f1: 400, dur: 0.30, type: "sine",  vol: 0.08, noise: true },
    glug:    { f0: 240, f1: 160, dur: 0.14, type: "sine",   vol: 0.12 },
    bubble:  { f0: 500, f1: 820, dur: 0.10, type: "sine",   vol: 0.10 },
    sparkle: { f0: 1320, f1: 2100, dur: 0.18, type: "sine", vol: 0.10 },
    roar:    { f0: 320, f1: 120, dur: 0.30, type: "sawtooth", vol: 0.16 },
    chomp:   { f0: 180, f1: 90,  dur: 0.09, type: "square", vol: 0.12 },
    burp:    { f0: 150, f1: 70,  dur: 0.22, type: "sawtooth", vol: 0.14 },
    meow:    { f0: 520, f1: 760, dur: 0.20, type: "sawtooth", vol: 0.13 },
    cuckoo:  { f0: 780, f1: 620, dur: 0.18, type: "sine",   vol: 0.14 },
    creak:   { f0: 140, f1: 90,  dur: 0.40, type: "sawtooth", vol: 0.09 },
    hoot:    { f0: 420, f1: 360, dur: 0.30, type: "sine",   vol: 0.12 },
    twinkle: { f0: 1760, f1: 2640, dur: 0.14, type: "sine", vol: 0.09 },
    ribbit:  { f0: 300, f1: 180, dur: 0.16, type: "sawtooth", vol: 0.14 },
    success: { f0: 523, f1: 1046, dur: 0.5, type: "sine",   vol: 0.16 }
  };

  function isMuted() {
    try { return window.localStorage.getItem("seik_mute") === "1"; } catch (e) { return false; }
  }
  function setMuted(m) {
    try { window.localStorage.setItem("seik_mute", m ? "1" : "0"); } catch (e) {}
  }
  function toggleMute() { setMuted(!isMuted()); return isMuted(); }

  function setBase(p) { basePath = p; }
  /* convenience: declare just the sounds THIS page needs, by name
     (filename = name + ".wav"). Keeps preloaded Audio objects to a minimum. */
  function setSounds(names) {
    var m = {}, i;
    for (i = 0; i < (names || []).length; i++) { m[names[i]] = names[i] + ".wav"; }
    setManifest(m);
  }
  function setManifest(m) {
    manifest = m || {};
    /* preload pools for declared WAVs */
    for (var name in manifest) {
      if (!manifest.hasOwnProperty(name)) continue;
      pools[name] = [];
      for (var i = 0; i < POOL; i++) {
        try {
          var a = new Audio(basePath + manifest[name]);
          a.preload = "auto"; pools[name].push(a);
        } catch (e) {}
      }
    }
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    /* nudge each preloaded element so mobile lets us play later */
    for (var name in pools) {
      if (!pools.hasOwnProperty(name)) continue;
      var arr = pools[name];
      for (var i = 0; i < arr.length; i++) {
        try { arr[i].load(); } catch (e) {}
      }
    }
    if (AC && !ac) { try { ac = new AC(); } catch (e) { ac = null; } }
    if (ac && ac.state === "suspended") { try { ac.resume(); } catch (e) {} }
  }

  function playWav(name) {
    var arr = pools[name]; if (!arr || !arr.length) return false;
    for (var i = 0; i < arr.length; i++) {
      var a = arr[i];
      if (a.paused || a.ended || a.currentTime === 0) {
        try { a.currentTime = 0; a.play(); return true; } catch (e) {}
      }
    }
    try { arr[0].currentTime = 0; arr[0].play(); return true; } catch (e) {}
    return false;
  }

  function synth(spec) {
    if (!AC) return;
    if (!ac) { try { ac = new AC(); } catch (e) { return; } }
    if (ac.state === "suspended") { try { ac.resume(); } catch (e) {} }
    var t = ac.currentTime, dur = spec.dur || 0.15;
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = spec.type || "sine";
    o.frequency.setValueAtTime(spec.f0 || 440, t);
    try { o.frequency.exponentialRampToValueAtTime(Math.max(1, spec.f1 || spec.f0 || 440), t + dur); } catch (e) {}
    g.gain.setValueAtTime(spec.vol || 0.12, t);
    try { g.gain.exponentialRampToValueAtTime(0.0001, t + dur); } catch (e) {}
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
    if (spec.noise) {                 /* add a short noise burst for booms/whooshes */
      var n = Math.floor(ac.sampleRate * Math.min(dur, 0.3));
      var buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) { d[i] = (Math.random() * 2 - 1) * (1 - i / n); }
      var src = ac.createBufferSource(), ng = ac.createGain();
      src.buffer = buf; ng.gain.setValueAtTime((spec.vol || 0.12) * 0.8, t);
      try { ng.gain.exponentialRampToValueAtTime(0.0001, t + dur); } catch (e) {}
      src.connect(ng); ng.connect(ac.destination); src.start(t);
    }
  }

  function play(name) {
    if (isMuted()) return;
    if (playWav(name)) return;          /* real WAV if we have it */
    if (SYNTH[name]) { synth(SYNTH[name]); }  /* else dev/modern synth */
  }

  /* fire-and-forget a WAV by name WITHOUT a preloaded pool (e.g. the many
     monster-voice notes). Falls back to a synth tone spec if given one. */
  function playOnce(name, fallbackSpec) {
    if (isMuted()) return;
    try {
      var a = new Audio(basePath + name + ".wav");
      a.play();
      return;
    } catch (e) {}
    if (fallbackSpec) { synth(fallbackSpec); }
  }

  window.Seik.audio = {
    setBase: setBase, setManifest: setManifest, setSounds: setSounds,
    unlock: unlock, play: play, playOnce: playOnce,
    isMuted: isMuted, setMuted: setMuted, toggleMute: toggleMute,
    synth: synth
  };
})();
