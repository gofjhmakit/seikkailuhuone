#!/usr/bin/env python3
"""Build games/hirviopaja.html from games/hirviopaja.template.html by injecting:
  - <!--PARTSHEET-->  : every top-level <g id="..."> from the design part SVGs,
                        with all ids prefixed `p-` (so getElementById('p-'+id) works
                        and nothing collides with the live DOM),
  - <!--WORKSHOP_BG-->: the inner content of workshop.svg (defs + scene).

Keeps the hand-written HTML/JS in the template; this only bundles the art, so it's
re-runnable whenever the designer updates the SVGs. No deps.
Usage: python3 tools/build_hirviopaja.py
"""
import os, re, shutil

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(HERE, "design", "hirviopaja", "art")
TEMPLATE = os.path.join(HERE, "games", "hirviopaja.template.html")
OUT = os.path.join(HERE, "games", "hirviopaja.html")

PART_FILES = ["base", "wings", "tails", "legs", "horns", "bodies", "patterns", "heads", "hats"]


def read(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


def svg_inner(text):
    """Everything between the opening <svg ...> and the final </svg>."""
    start = text.index(">", text.index("<svg")) + 1
    end = text.rindex("</svg>")
    return text[start:end]


def top_level_groups(text):
    """Return each top-level <g ...>...</g> (with nested children) inside the <svg>."""
    body = svg_inner(text)
    groups, depth, gstart = [], 0, None
    for m in re.finditer(r"<g\b[^>]*>|</g>", body):
        if m.group().startswith("</g"):
            depth -= 1
            if depth == 0 and gstart is not None:
                groups.append(body[gstart:m.end()])
                gstart = None
        else:
            if depth == 0:
                gstart = m.start()
            depth += 1
    return groups


def main():
    # 1. collect all part groups
    groups = []
    for name in PART_FILES:
        groups += top_level_groups(read(os.path.join(ART, name + ".svg")))
    sheet = "\n".join(groups)
    # prefix every id in the sheet with p- (parts contain no internal url(#) refs)
    sheet = re.sub(r'id="([^"]+)"', r'id="p-\1"', sheet)

    ids = re.findall(r'id="(p-[a-z-]+)"', sheet)
    toplevel = [i for i in ids if re.match(r"p-(base-shadow|head|body|tail|wing|horn|leg|pat|hat)-?", i)]

    # 2. workshop background
    workshop = svg_inner(read(os.path.join(ART, "workshop.svg")))

    # 3. inject into the template
    html = read(TEMPLATE)
    assert "<!--PARTSHEET-->" in html and "<!--WORKSHOP_BG-->" in html, "template markers missing"
    html = html.replace("<!--WORKSHOP_BG-->", workshop)
    html = html.replace("<!--PARTSHEET-->", sheet)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)

    # 4. copy the door tile for the hub
    svgdir = os.path.join(HERE, "assets", "svg")
    if not os.path.isdir(svgdir):
        os.makedirs(svgdir)
    shutil.copy(os.path.join(ART, "door.svg"), os.path.join(svgdir, "door-hirviopaja.svg"))

    print("wrote %s" % OUT)
    print("  part groups bundled: %d  (%d total ids)" % (len(groups), len(ids)))
    print("  workshop bg: %d chars" % len(workshop))


if __name__ == "__main__":
    main()
