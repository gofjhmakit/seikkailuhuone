#!/usr/bin/env python3
"""Build games/salahuone.html. All 10 room SVGs are injected as hidden, id-prefixed
<svg class="room" id="scene-<slug>"> elements (the engine shows one at a time, so only
one room ever paints). Sprite + treasure atlases are injected as hidden sheets.
Each room's ids AND url(#...) refs are prefixed with "<slug>-" to avoid collisions.
No deps. Usage: python3 tools/build_salahuone.py
"""
import os, re, shutil

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(HERE, "design", "salahuone", "art")
TEMPLATE = os.path.join(HERE, "games", "salahuone.template.html")
OUT = os.path.join(HERE, "games", "salahuone.html")

ROOMS = [
    ("eteinen", "room01-eteinen.svg"), ("keittio", "room02-keittio.svg"),
    ("olohuone", "room03-olohuone.svg"), ("kirjasto", "room04-kirjasto.svg"),
    ("kasvihuone", "room05-kasvihuone.svg"), ("paja", "room06-paja.svg"),
    ("ullakko", "room07-ullakko.svg"), ("luuhuone", "room08-luuhuone.svg"),
    ("kellari", "room09-kellari.svg"), ("tahtitorni", "room10-tahtitorni.svg"),
]


def read(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


def svg_inner(text):
    return text[text.index(">", text.index("<svg")) + 1: text.rindex("</svg>")]


def prefix(text, p):
    text = re.sub(r'id="([^"]+)"', lambda m: 'id="%s-%s"' % (p, m.group(1)), text)
    text = re.sub(r'url\(#([^)]+)\)', lambda m: 'url(#%s-%s)' % (p, m.group(1)), text)
    return text


def main():
    rooms_html = []
    for slug, fn in ROOMS:
        inner = prefix(svg_inner(read(os.path.join(ART, fn))), slug)
        rooms_html.append(
            '<svg class="room" id="scene-%s" viewBox="0 0 1024 600" width="1024" height="600" '
            'stroke-linejoin="round" stroke-linecap="round" style="display:none">%s</svg>' % (slug, inner))
    rooms_html = "\n".join(rooms_html)

    spr = prefix(svg_inner(read(os.path.join(ART, "sprites.svg"))), "sp")
    tr = prefix(svg_inner(read(os.path.join(ART, "treasures.svg"))), "tr")

    html = read(TEMPLATE)
    for m in ("<!--ROOMS-->", "<!--SPRSHEET-->", "<!--TRSHEET-->"):
        assert m in html, "missing marker " + m
    html = html.replace("<!--ROOMS-->", rooms_html).replace("<!--SPRSHEET-->", spr).replace("<!--TRSHEET-->", tr)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)

    svgdir = os.path.join(HERE, "assets", "svg")
    if not os.path.isdir(svgdir):
        os.makedirs(svgdir)
    shutil.copy(os.path.join(ART, "door.svg"), os.path.join(svgdir, "door-salahuone.svg"))

    print("wrote %s" % OUT)
    print("  rooms: %d  sprites: %s  treasures: %d" % (len(ROOMS), spr.count('id="sp-spr_'), tr.count('id="tr-tr_')))


if __name__ == "__main__":
    main()
