#!/usr/bin/env python3
"""Build games/muna.html from games/muna.template.html by injecting:
  <!--SCENE_BG-->     inner of scene.svg (nest cave + #cave gradient + #warm-glow/#hearth)
  <!--EGG_INLINE-->   inner of egg.svg, ids kept (single egg, referenced directly)
  <!--KIRJA_BG-->     inner of kirja.svg (book + 12 cards)
  <!--DRAGONSHEET-->  dragon.svg top-level groups, ids prefixed d- (cloned + recoloured per hatch)
  <!--FOODSHEET-->    foods.svg groups, ids prefixed f-
No deps. Usage: python3 tools/build_muna.py
"""
import os, re, shutil

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(HERE, "design", "muna", "art")
TEMPLATE = os.path.join(HERE, "games", "muna.template.html")
OUT = os.path.join(HERE, "games", "muna.html")


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
    egg = svg_inner(read(os.path.join(ART, "egg.svg")))
    kirja = svg_inner(read(os.path.join(ART, "kirja.svg")))

    dragon = "\n".join(top_level_groups(read(os.path.join(ART, "dragon.svg"))))
    dragon = re.sub(r'id="([^"]+)"', r'id="d-\1"', dragon)

    foods = "\n".join(top_level_groups(read(os.path.join(ART, "foods.svg"))))
    foods = re.sub(r'id="([^"]+)"', r'id="f-\1"', foods)

    html = read(TEMPLATE)
    for m in ("<!--SCENE_BG-->", "<!--EGG_INLINE-->", "<!--KIRJA_BG-->", "<!--DRAGONSHEET-->", "<!--FOODSHEET-->"):
        assert m in html, "missing marker " + m
    html = html.replace("<!--SCENE_BG-->", scene).replace("<!--EGG_INLINE-->", egg)
    html = html.replace("<!--KIRJA_BG-->", kirja).replace("<!--DRAGONSHEET-->", dragon).replace("<!--FOODSHEET-->", foods)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)

    svgdir = os.path.join(HERE, "assets", "svg")
    if not os.path.isdir(svgdir):
        os.makedirs(svgdir)
    shutil.copy(os.path.join(ART, "door.svg"), os.path.join(svgdir, "door-muna.svg"))

    print("wrote %s" % OUT)
    print("  dragon groups: %d  foods: %d" % (dragon.count('id="d-') - dragon.count('id="d-dragon-eyes-open'), foods.count('id="f-food-')))


if __name__ == "__main__":
    main()
