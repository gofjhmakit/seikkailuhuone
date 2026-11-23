#!/usr/bin/env python3
"""Structural sanity check for the POC html files (no browser available).
Verifies: doctype present, balanced html/head/body/style/script/svg tags,
and that every <button>/<svg>/<style>/<script> opener has a matching closer.
This is a coarse check, not a full HTML parser."""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
POC = os.path.join(HERE, "poc")

PAIRS = ["html", "head", "body", "style", "script", "svg", "button", "clipPath", "defs", "g"]

ok = True
for fn in sorted(os.listdir(POC)):
    if not fn.endswith(".html"):
        continue
    path = os.path.join(POC, fn)
    with open(path, encoding="utf-8") as f:
        s = f.read()
    probs = []
    if "<!DOCTYPE html>" not in s and "<!doctype html>" not in s:
        probs.append("missing doctype")
    low = s.lower()
    for tag in PAIRS:
        # count opening tags (<tag> or <tag ...>), self-closing excluded
        opens = len(re.findall(r"<" + tag + r"(\s[^>]*?)?>", low))
        selfc = len(re.findall(r"<" + tag + r"(\s[^>]*?)?/>", low))
        closes = len(re.findall(r"</" + tag + r"\s*>", low))
        opens -= selfc
        if opens != closes:
            probs.append("%s: %d open vs %d close" % (tag, opens, closes))
    # unbalanced parens/braces in the whole file as a loose JS smoke test
    for a, b, name in [("{", "}", "braces"), ("(", ")", "parens")]:
        if s.count(a) != s.count(b):
            probs.append("%s mismatch %d/%d" % (name, s.count(a), s.count(b)))
    size = len(s)
    if probs:
        ok = False
        print("FAIL %-30s %5d B  ->  %s" % (fn, size, "; ".join(probs)))
    else:
        print("OK   %-30s %5d B" % (fn, size))

print("\nALL OK" if ok else "\nPROBLEMS FOUND")
sys.exit(0 if ok else 1)
