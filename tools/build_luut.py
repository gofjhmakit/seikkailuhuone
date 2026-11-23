#!/usr/bin/env python3
"""Build games/luut.html from its template by injecting:
  <!--DIG_BG-->       inner of dig.svg, with all 5 skeletons injected into #digContents
                      (each wrapped <g id="skelwrap-NAME" style="display:none">, ids prefixed NAME-)
  <!--MUSEUM_BG-->    inner of museum.svg (museum's #navHome renamed #navHomeM to avoid a dup id)
  <!--SPRITESHEET-->  sprites.svg groups, ids prefixed sp- (surprise objects)
No deps. Usage: python3 tools/build_luut.py
"""
import os, re, shutil

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(HERE, "design", "luut", "art")
TEMPLATE = os.path.join(HERE, "games", "luut.template.html")
OUT = os.path.join(HERE, "games", "luut.html")
NAMES = ["tyrannosaurus", "triceratops", "mammutti", "pitkakaula", "raptori"]


def read(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


def svg_inner(text):
    return text[text.index(">", text.index("<svg")) + 1: text.rindex("</svg>")]


def top_level_groups(text):
    body = re.sub(r"<!--.*?-->", "", svg_inner(text), flags=re.S)  # drop comments (may contain "<g id>" prose)
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


def first_group(text, wanted_id):
    for g in top_level_groups(text):
        if re.match(r'<g\s+id="%s"' % re.escape(wanted_id), g):
            return g
    raise AssertionError("group %s not found" % wanted_id)


def main():
    dig = svg_inner(read(os.path.join(ART, "dig.svg")))

    skeletons = []
    for name in NAMES:
        g = first_group(read(os.path.join(ART, "skel-%s.svg" % name)), "skeleton")
        g = re.sub(r'id="([^"]+)"', lambda m: 'id="%s-%s"' % (name, m.group(1)), g)
        skeletons.append('<g id="skelwrap-%s" style="display:none">%s</g>' % (name, g))
    assert '<g id="digContents"></g>' in dig, "digContents slot missing"
    dig = dig.replace('<g id="digContents"></g>', '<g id="digContents">' + "\n".join(skeletons) + '</g>')

    museum = svg_inner(read(os.path.join(ART, "museum.svg")))
    museum = museum.replace('id="navHome"', 'id="navHomeM"')

    sprites = re.sub(r'id="([^"]+)"', r'id="sp-\1"', "\n".join(top_level_groups(read(os.path.join(ART, "sprites.svg")))))

    html = read(TEMPLATE)
    for m in ("<!--DIG_BG-->", "<!--MUSEUM_BG-->", "<!--SPRITESHEET-->"):
        assert m in html, "missing marker " + m
    html = html.replace("<!--DIG_BG-->", dig).replace("<!--MUSEUM_BG-->", museum).replace("<!--SPRITESHEET-->", sprites)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)

    svgdir = os.path.join(HERE, "assets", "svg")
    if not os.path.isdir(svgdir):
        os.makedirs(svgdir)
    shutil.copy(os.path.join(ART, "door.svg"), os.path.join(svgdir, "door-luut.svg"))

    print("wrote %s" % OUT)
    print("  skeletons: %d  surprise sprites: %d" % (len(skeletons), sprites.count('id="sp-sfx_')))


if __name__ == "__main__":
    main()
