#!/usr/bin/env node
/* Zero-dependency test suite for Seikkailuhuone.
   Runs the SAME content/logic.js that the browser uses, and checks the pure
   generators (correct results, in-range, distinct options). Run: node tests/run-tests.js
   Grows one block per game as games ship. */
"use strict";
var path = require("path");
var logic = require(path.join(__dirname, "..", "content", "logic.js"));

var pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function eq(a, b, msg) { ok(a === b, msg + " (got " + a + ", want " + b + ")"); }

/* ---- shared utils ---- */
(function testUtil() {
  var u = logic.util;
  var i, v;
  for (i = 0; i < 400; i++) { v = u.randInt(3, 7); ok(v >= 3 && v <= 7, "randInt in range"); }
  var arr = [1, 2, 3, 4, 5, 6, 7, 8];
  var sh = u.shuffle(arr);
  eq(sh.length, arr.length, "shuffle keeps length");
  eq(sh.slice().sort(function (a, b) { return a - b; }).join(","), "1,2,3,4,5,6,7,8", "shuffle keeps elements");
  ok(arr.join(",") === "1,2,3,4,5,6,7,8", "shuffle does not mutate input");
  for (i = 0; i < 200; i++) {
    var d = u.pickDistinct(arr, 3);
    eq(d.length, 3, "pickDistinct count");
    ok(d[0] !== d[1] && d[1] !== d[2] && d[0] !== d[2], "pickDistinct distinct");
  }
  eq(u.clamp(12, 0, 10), 10, "clamp hi");
  eq(u.clamp(-4, 0, 10), 0, "clamp lo");
  eq(u.clamp(5, 0, 10), 5, "clamp mid");
})();

/* ---- per-game blocks appended here as each game's logic lands ---- */
if (logic.hirviopaja && logic.hirviopaja.selfTest) { logic.hirviopaja.selfTest(ok, eq); }
if (logic.salahuone && logic.salahuone.selfTest) { logic.salahuone.selfTest(ok, eq); }
if (logic.taikapata && logic.taikapata.selfTest) { logic.taikapata.selfTest(ok, eq); }
if (logic.tulivuori && logic.tulivuori.selfTest) { logic.tulivuori.selfTest(ok, eq); }
if (logic.tahdet && logic.tahdet.selfTest) { logic.tahdet.selfTest(ok, eq); }
if (logic.luut && logic.luut.selfTest) { logic.luut.selfTest(ok, eq); }
if (logic.muna && logic.muna.selfTest) { logic.muna.selfTest(ok, eq); }
if (logic.raketti && logic.raketti.selfTest) { logic.raketti.selfTest(ok, eq); }

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
