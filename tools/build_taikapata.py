#!/usr/bin/env python3
"""Build games/taikapata.html from its template by injecting:
  <!--SCENE_BG-->    inner of scene.svg (lab + cauldron + #liquid/#surface/#fire)
  <!--KIRJA_BG-->    inner of kirja.svg (book + 14 slots)
  <!--INGSHEET-->    9 ingredient groups, ids prefixed i-
  <!--RESULTSHEET--> 14 result groups, ids prefixed r-
No deps. Usage: python3 tools/build_taikapata.py
"""
import os, re, shutil

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(HERE, "design", "taikapata", "art")
TEMPLATE = os.path.join(HERE, "games", "taikapata.template.html")
OUT = os.path.join(HERE, "games", "taikapata.html")


def read(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


def svg_inner(text):
    return text[text.index(">", text.index("<svg")) + 1: text.rindex("</svg>")]


def top_level_groups(text):
    body = svg_inner(text)
    groups, depth, gstart = [], 0, None
    for m in re.finditer(r"<g\b[^>]*>|</g>", body):
        if m.group().startswith("</g"):
            depth -= 1
            if depth == 0 and gstart is not None:
                groups.append(body[gstart:m.end()]); gstart = None
        else:
            if depth == 0:
                gstart = m.start()
            depth += 1
    return groups


def main():
    scene = svg_inner(read(os.path.join(ART, "scene.svg")))
    kirja = svg_inner(read(os.path.join(ART, "kirja.svg")))
    ings = re.sub(r'id="([^"]+)"', r'id="i-\1"', "\n".join(top_level_groups(read(os.path.join(ART, "ingredients.svg")))))
    res = re.sub(r'id="([^"]+)"', r'id="r-\1"', "\n".join(top_level_groups(read(os.path.join(ART, "results.svg")))))

    html = read(TEMPLATE)
    for m in ("<!--SCENE_BG-->", "<!--KIRJA_BG-->", "<!--INGSHEET-->", "<!--RESULTSHEET-->"):
        assert m in html, "missing marker " + m
    html = html.replace("<!--SCENE_BG-->", scene).replace("<!--KIRJA_BG-->", kirja)
    html = html.replace("<!--INGSHEET-->", ings).replace("<!--RESULTSHEET-->", res)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)

    svgdir = os.path.join(HERE, "assets", "svg")
    if not os.path.isdir(svgdir):
        os.makedirs(svgdir)
    shutil.copy(os.path.join(ART, "door.svg"), os.path.join(svgdir, "door-taikapata.svg"))

    print("wrote %s" % OUT)
    print("  ingredients: %d  results: %d" % (ings.count('id="i-ing-'), res.count('id="r-result-')))


if __name__ == "__main__":
    main()
