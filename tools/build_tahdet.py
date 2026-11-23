#!/usr/bin/env python3
"""Build games/tahdet.html by injecting the two backgrounds (the puzzle stars,
lines and mini figures are drawn in code from content/logic.js coords):
  <!--SKY_BG-->     inner of sky.svg (night sky + #bg-stars + #owl/#owl-head + #shoot)
  <!--KARTTA_BG-->  inner of kartta.svg (8 window slots)
No deps. Usage: python3 tools/build_tahdet.py
"""
import os, shutil

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(HERE, "design", "tahdet", "art")
TEMPLATE = os.path.join(HERE, "games", "tahdet.template.html")
OUT = os.path.join(HERE, "games", "tahdet.html")


def read(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


def svg_inner(text):
    return text[text.index(">", text.index("<svg")) + 1: text.rindex("</svg>")]


def main():
    sky = svg_inner(read(os.path.join(ART, "sky.svg")))
    kartta = svg_inner(read(os.path.join(ART, "kartta.svg")))
    html = read(TEMPLATE)
    for m in ("<!--SKY_BG-->", "<!--KARTTA_BG-->"):
        assert m in html, "missing marker " + m
    html = html.replace("<!--SKY_BG-->", sky).replace("<!--KARTTA_BG-->", kartta)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)
    svgdir = os.path.join(HERE, "assets", "svg")
    if not os.path.isdir(svgdir):
        os.makedirs(svgdir)
    shutil.copy(os.path.join(ART, "door.svg"), os.path.join(svgdir, "door-tahdet.svg"))
    print("wrote %s" % OUT)


if __name__ == "__main__":
    main()
