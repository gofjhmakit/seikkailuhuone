#!/usr/bin/env python3
"""Build games/tulivuori.html from games/tulivuori.template.html by injecting:
  <!--SCENE_BG-->   inner of scene.svg   (volcano scene + #sky gradient + hooks)
  <!--MUSEUM_BG-->  inner of museum.svg  (shelf wall + slot discs)
  <!--OBJSHEET-->   26 obj-* groups, ids prefixed p-   (cloned one at a time)
  <!--ICONSHEET-->  8 icon-* groups, ids prefixed pi-  (cloned into chips/buttons)
Scene/museum ids stay unprefixed (single instance, referenced directly). No deps.
Usage: python3 tools/build_tulivuori.py
"""
import os, re, shutil

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(HERE, "design", "tulivuori", "art")
TEMPLATE = os.path.join(HERE, "games", "tulivuori.template.html")
OUT = os.path.join(HERE, "games", "tulivuori.html")


def read(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


def svg_inner(text):
    start = text.index(">", text.index("<svg")) + 1
    return text[start:text.rindex("</svg>")]


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
    museum = svg_inner(read(os.path.join(ART, "museum.svg")))

    objs = "\n".join(top_level_groups(read(os.path.join(ART, "objects.svg"))))
    objs = re.sub(r'id="([^"]+)"', r'id="p-\1"', objs)

    icons = "\n".join(top_level_groups(read(os.path.join(ART, "icons.svg"))))
    icons = re.sub(r'id="([^"]+)"', r'id="pi-\1"', icons)

    html = read(TEMPLATE)
    for marker in ("<!--SCENE_BG-->", "<!--MUSEUM_BG-->", "<!--OBJSHEET-->", "<!--ICONSHEET-->"):
        assert marker in html, "missing marker " + marker
    html = html.replace("<!--SCENE_BG-->", scene)
    html = html.replace("<!--MUSEUM_BG-->", museum)
    html = html.replace("<!--OBJSHEET-->", objs)
    html = html.replace("<!--ICONSHEET-->", icons)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)

    svgdir = os.path.join(HERE, "assets", "svg")
    if not os.path.isdir(svgdir):
        os.makedirs(svgdir)
    shutil.copy(os.path.join(ART, "door.svg"), os.path.join(svgdir, "door-tulivuori.svg"))

    print("wrote %s" % OUT)
    print("  objects: %d  icons: %d" % (objs.count('id="p-obj-'), icons.count('id="pi-icon-')))


if __name__ == "__main__":
    main()
