/* Seikkailuhuone engine - core: stage scaling, navigation, tap, storage, SVG helpers.
   Old-WebKit-safe (ES5, -webkit- prefixes, no flex/grid, no CSS vars, no classList on SVG).
   Attaches to window.Seik.core. Load AFTER content/logic.js. */
(function () {
  "use strict";
  window.Seik = window.Seik || {};
  var SVGNS = "http://www.w3.org/2000/svg";

  function $(id) { return document.getElementById(id); }

  function ready(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(fn, 0);
    } else if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", fn, false);
    } else {
      window.onload = fn;  /* ancient fallback */
    }
  }

  /* ---- fixed 1024x600 logical stage, scaled to fit any screen (old + new) ---- */
  var STAGE_W = 1024, STAGE_H = 600;
  function fitStage() {
    var st = $("stage");
    if (!st) return;
    var s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    var t = "translate(-50%,-50%) scale(" + s + ")";
    st.style.webkitTransform = t;
    st.style.transform = t;
  }
  function initStage() {
    fitStage();
    if (window.addEventListener) {
      window.addEventListener("resize", fitStage, false);
      window.addEventListener("orientationchange", fitStage, false);
    } else {
      window.onresize = fitStage;
    }
  }

  /* ---- unified tap: one handler for mouse + touch, de-duped, audio-unlock ---- */
  function tap(el, fn) {
    if (!el) return;
    var touched = false, lastT = 0;
    function fire(ev) {
      if (window.Seik.audio && window.Seik.audio.unlock) { window.Seik.audio.unlock(); }
      fn.call(el, ev);
    }
    if (el.addEventListener) {
      el.addEventListener("touchstart", function (ev) {
        touched = true; lastT = (Date.now ? Date.now() : +new Date());
        /* don't preventDefault globally - lets the stage still scroll-lock via CSS */
        fire(ev);
      }, false);
      el.addEventListener("click", function (ev) {
        var nowT = (Date.now ? Date.now() : +new Date());
        if (touched && (nowT - lastT) < 700) { return; }  /* ignore ghost click */
        touched = false;
        fire(ev);
      }, false);
    } else if (el.attachEvent) {
      el.attachEvent("onclick", function () { fire(window.event); });
    }
  }

  /* ---- navigation between hub and games ---- */
  function go(path) { window.location.href = path; }
  function hub() { window.location.href = "../index.html"; }   /* games live in games/ */

  /* ---- safe localStorage (per-viewer; wrapped so private mode can't throw) ---- */
  var store = {
    get: function (k, dflt) {
      try {
        var v = window.localStorage.getItem(k);
        return v === null ? dflt : JSON.parse(v);
      } catch (e) { return dflt; }
    },
    set: function (k, v) {
      try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
    }
  };

  /* ---- SVG helpers (use setAttribute; NO classList on SVG in old WebKit) ---- */
  function svg(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag), k;
    if (attrs) { for (k in attrs) { if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]); } }
    return e;
  }
  function attr(el, attrs) {
    for (var k in attrs) { if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]); }
    return el;
  }

  /* ---- a standard "back to the Adventure Room" button for game pages ---- */
  function addBackButton() {
    var b = document.createElement("div");
    b.id = "backbtn";
    b.innerHTML = '<span class="backarrow">&#8592;</span> huone';
    document.body.appendChild(b);
    tap(b, function () { hub(); });
    return b;
  }

  /* ---- a standard mute toggle button (top-right) ---- */
  function addMuteButton() {
    var b = document.createElement("div");
    b.id = "mutebtn";
    function refresh() {
      var m = window.Seik.audio && window.Seik.audio.isMuted && window.Seik.audio.isMuted();
      b.innerHTML = m ? "&#128263;" : "&#128266;";  /* speaker off / on */
      b.setAttribute("data-muted", m ? "1" : "0");
    }
    document.body.appendChild(b);
    tap(b, function () {
      if (window.Seik.audio && window.Seik.audio.toggleMute) { window.Seik.audio.toggleMute(); }
      refresh();
    });
    refresh();
    return b;
  }

  window.Seik.core = {
    STAGE_W: STAGE_W, STAGE_H: STAGE_H,
    $: $, ready: ready,
    initStage: initStage, fitStage: fitStage,
    tap: tap, go: go, hub: hub,
    store: store,
    svg: svg, attr: attr,
    addBackButton: addBackButton, addMuteButton: addMuteButton
  };
})();
