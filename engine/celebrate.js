/* Seikkailuhuone engine - shared success celebration: fanfare + confetti + Finnish praise.
   Adapted from the device-verified opijapelaa celebrate.js (time-based burst with a
   setTimeout hard-clear that survives an rAF stall). Call Seik.celebrate([message]).
   Attaches window.Seik.celebrate and (compat) window.celebrate. */
(function () {
  "use strict";
  window.Seik = window.Seik || {};

  var PRAISE = [
    "Hienoa!", "Hyvaa tyota!", "Loistavaa!", "Mahtavaa!",
    "Osaat hyvin!", "Upeaa!", "Juuri oikein!", "Jee!",
    "Hyvin tehty!", "Loysit sen!", "Sina osaat!", "Hurraa!",
    "Vau, hienoa!", "Mestari!", "Timanttia!"
  ];
  var COLORS = ["#ffd264", "#ff8a4c", "#e8452f", "#46c4a8", "#7cc0ff", "#3aa64a", "#e64980", "#cfe8ff"];

  var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
            function (cb) { return setTimeout(function () { cb(); }, 16); };
  function now() { return (window.Date && Date.now) ? Date.now() : (+new Date()); }

  var canvas, ctx, parts, animating = false, startT = 0, cleanupTimer = null;
  var DURATION = 1200;

  function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement("canvas");
    var s = canvas.style;
    s.position = "fixed"; s.left = "0"; s.top = "0";
    s.width = "100%"; s.height = "100%";
    s.pointerEvents = "none"; s.zIndex = "9999";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
  }
  function hardClear() {
    animating = false;
    try {
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (canvas) canvas.style.display = "none";
    } catch (e) {}
  }
  function burst() {
    ensureCanvas();
    canvas.style.display = "block";
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    parts = [];
    var cx = canvas.width / 2, cy = canvas.height * 0.32;
    for (var i = 0; i < 60; i++) {
      var ang = Math.random() * Math.PI * 2;
      var spd = 4 + Math.random() * 8;
      parts.push({
        x: cx, y: cy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 5,
        g: 0.16 + Math.random() * 0.14, size: 6 + Math.random() * 9,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.6
      });
    }
    startT = now();
    if (cleanupTimer) clearTimeout(cleanupTimer);
    cleanupTimer = setTimeout(hardClear, DURATION + 400);
    if (!animating) { animating = true; tick(); }
  }
  function tick() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var a = 1 - (now() - startT) / DURATION;
    if (a <= 0) { hardClear(); return; }
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y < canvas.height + 20) {
        ctx.save(); ctx.globalAlpha = a; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    }
    raf(tick);
  }

  var banner, bannerTimer;
  function praise(msg) {
    if (!banner) {
      banner = document.createElement("div");
      var s = banner.style;
      s.position = "fixed"; s.left = "0"; s.right = "0"; s.top = "16%";
      s.textAlign = "center"; s.pointerEvents = "none"; s.zIndex = "10000";
      document.body.appendChild(banner);
    }
    if (!msg) msg = PRAISE[(Math.random() * PRAISE.length) | 0];
    banner.innerHTML =
      '<span style="display:inline-block;background:#fff7e6;color:#e8590c;' +
      'font-family:\'Comic Sans MS\',sans-serif;font-size:42px;font-weight:800;' +
      'padding:14px 30px;border-radius:26px;border:5px solid #ffd264;' +
      '-webkit-box-shadow:0 7px 0 rgba(0,0,0,0.12);box-shadow:0 7px 0 rgba(0,0,0,0.12);">' +
      msg + '</span>';
    banner.style.display = "block";
    if (bannerTimer) clearTimeout(bannerTimer);
    bannerTimer = setTimeout(function () { banner.style.display = "none"; }, 1400);
  }

  function celebrate(msg) {
    try { if (window.Seik.audio) window.Seik.audio.play("success"); } catch (e) {}
    try { burst(); } catch (e) {}
    try { praise(msg); } catch (e) {}
  }
  window.Seik.celebrate = celebrate;
  window.celebrate = celebrate;   /* compat */
})();
