/* Seikkailuhuone engine - animation: ONE time-based loop, tweens, capped particles.
   Time-based (Date.now delta) so it looks the same at any frame rate, and the loop
   HARD-STOPS when idle so a stalled rAF can never freeze a frame (old-WebView bug).
   Attaches to window.Seik.anim. */
(function () {
  "use strict";
  window.Seik = window.Seik || {};

  var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
            function (cb) { return setTimeout(function () { cb(); }, 16); };
  function now() { return (window.Date && Date.now) ? Date.now() : (+new Date()); }

  /* registry of active updaters: fn(dtMs, elapsedMs) -> false to unregister */
  var jobs = [], running = false, lastT = 0;

  function loop() {
    if (!jobs.length) { running = false; return; }   /* idle -> stop the loop */
    var t = now(), dt = t - lastT; lastT = t;
    if (dt > 100) dt = 100;                            /* clamp after a stall/tab-switch */
    var i = 0;
    while (i < jobs.length) {
      var j = jobs[i];
      j.elapsed += dt;
      var keep = true;
      try { keep = j.fn(dt, j.elapsed) !== false; } catch (e) { keep = false; }
      if (keep) { i++; } else { jobs.splice(i, 1); }
    }
    raf(loop);
  }
  function add(fn) {
    var j = { fn: fn, elapsed: 0 };
    jobs.push(j);
    if (!running) { running = true; lastT = now(); raf(loop); }
    return { stop: function () { for (var k = 0; k < jobs.length; k++) { if (jobs[k] === j) { jobs.splice(k, 1); break; } } } };
  }

  /* ---- easing ---- */
  var ease = {
    linear: function (t) { return t; },
    inOut: function (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    outCubic: function (t) { var u = 1 - t; return 1 - u * u * u; },
    outBack: function (t) { var c = 1.70158; var u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; },
    outBounce: function (t) {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75; }
      if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375; }
      t -= 2.625 / 2.75; return 7.5625 * t * t + 0.984375;
    }
  };

  /* ---- tween a numeric value over a wall-clock duration ---- */
  function tween(o) {
    var from = (o.from == null ? 0 : o.from), to = (o.to == null ? 1 : o.to);
    var dur = o.duration || 400, fn = ease[o.ease] || ease.inOut;
    var span = to - from, done = false;
    var h = add(function (dt, el) {
      var p = el / dur; if (p >= 1) p = 1;
      var v = from + span * fn(p);
      if (o.onUpdate) o.onUpdate(v, p);
      if (p >= 1) { done = true; if (o.onDone) o.onDone(); return false; }
    });
    return { cancel: function () { if (!done) h.stop(); } };
  }

  /* ---- Particles: a cheap, capped, self-cleaning canvas layer ----
     Reused by volcano eruption, potion burst, rocket flame, sparkles.
     The canvas lives over the stage; when no particle is alive the layer
     is cleared AND hidden (display:none) so nothing can linger - then the
     loop goes idle. Default cap 24 keeps the weak GPU happy. */
  function Particles(opts) {
    opts = opts || {};
    var cap = opts.cap || 24;
    var gravity = (opts.gravity == null ? 0.18 : opts.gravity);
    var parent = opts.parent || document.body;
    var cv = document.createElement("canvas");
    cv.width = opts.w || 1024; cv.height = opts.h || 600;
    var s = cv.style;
    s.position = "absolute"; s.left = "0"; s.top = "0";
    s.width = "100%"; s.height = "100%"; s.pointerEvents = "none";
    s.display = "none";
    (opts.zIndex != null) && (s.zIndex = opts.zIndex);
    parent.appendChild(cv);
    var ctx = cv.getContext("2d");
    var ps = [], job = null, lastWipe = null;

    function spawn(x, y, o) {
      if (ps.length >= cap) return;
      o = o || {};
      var ang = (o.angle == null ? Math.random() * Math.PI * 2 : o.angle);
      var spd = (o.speed == null ? 3 + Math.random() * 6 : o.speed);
      ps.push({
        x: x, y: y,
        vx: Math.cos(ang) * spd + (o.vx || 0),
        vy: Math.sin(ang) * spd + (o.vy || 0),
        life: o.life || (700 + Math.random() * 500),
        age: 0,
        size: o.size || (6 + Math.random() * 7),
        color: o.color || "#ff8a4c",
        shape: o.shape || "rect",
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.5,
        g: (o.gravity == null ? gravity : o.gravity)
      });
    }
    function ensureRunning() {
      if (job) return;
      cv.style.display = "block";
      if (lastWipe) { clearTimeout(lastWipe); lastWipe = null; }
      job = Seik.anim.add(function (dt) {
        ctx.clearRect(0, 0, cv.width, cv.height);
        var i = 0;
        while (i < ps.length) {
          var p = ps[i]; p.age += dt;
          if (p.age >= p.life) { ps.splice(i, 1); continue; }
          p.vy += p.g * (dt / 16); p.x += p.vx * (dt / 16); p.y += p.vy * (dt / 16); p.rot += p.vr;
          var a = 1 - p.age / p.life;
          ctx.save(); ctx.globalAlpha = a < 0 ? 0 : a;
          ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
          if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
          else { ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); }
          ctx.restore();
          i++;
        }
        if (!ps.length) {
          job = null;
          /* hard-clear + hide shortly after, even if the loop hiccups */
          lastWipe = setTimeout(function () {
            try { ctx.clearRect(0, 0, cv.width, cv.height); cv.style.display = "none"; } catch (e) {}
          }, 60);
          return false;
        }
      });
    }

    return {
      /* emit n particles from (x,y); call repeatedly for a continuous emitter */
      emit: function (x, y, n, o) { for (var i = 0; i < (n || 1); i++) spawn(x, y, o); ensureRunning(); },
      canvas: cv,
      destroy: function () { try { if (job) job.stop(); parent.removeChild(cv); } catch (e) {} }
    };
  }

  window.Seik.anim = { add: add, tween: tween, ease: ease, Particles: Particles, now: now };
})();
