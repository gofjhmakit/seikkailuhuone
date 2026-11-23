#!/usr/bin/env python3
"""Build games/raketti.html. Three scenes live in one page, so each scene's ids are
prefixed to avoid collisions; the part/destination/extra atlases are injected whole
(ids prefixed) as hidden sheets the engine clones from.
  <!--WORKSHOP_BG-->    workshop.svg inner, ids prefixed ws-
  <!--FLIGHT_BG-->      flight.svg inner, ids prefixed fl-
  <!--MATKAKIRJA_BG-->  matkakirja.svg inner, ids prefixed mk-
  <!--PARTSHEET-->      rocket-parts.svg inner, ids prefixed rp-
  <!--DESTSHEET-->      destinations.svg inner, ids prefixed rd-
  <!--EXTRASHEET-->     extras.svg inner, ids prefixed rx-
No deps. Usage: python3 tools/build_raketti.py
"""
import os, re, shutil

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(HERE, "design", "raketti", "art")
TEMPLATE = os.path.join(HERE, "games", "raketti.template.html")
OUT = os.path.join(HERE, "games", "raketti.html")


def read(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


def inner(text):
    return text[text.index(">", text.index("<svg")) + 1: text.rindex("</svg>")]


def pref(text, p):
    return re.sub(r'id="([^"]+)"', lambda m: 'id="%s-%s"' % (p, m.group(1)), text)


def main():
    parts = {
        "<!--WORKSHOP_BG-->": pref(inner(read(os.path.join(ART, "workshop.svg"))), "ws"),
        "<!--FLIGHT_BG-->": pref(inner(read(os.path.join(ART, "flight.svg"))), "fl"),
        "<!--MATKAKIRJA_BG-->": pref(inner(read(os.path.join(ART, "matkakirja.svg"))), "mk"),
        "<!--PARTSHEET-->": pref(inner(read(os.path.join(ART, "rocket-parts.svg"))), "rp"),
        "<!--DESTSHEET-->": pref(inner(read(os.path.join(ART, "destinations.svg"))), "rd"),
        "<!--EXTRASHEET-->": pref(inner(read(os.path.join(ART, "extras.svg"))), "rx"),
    }
    html = read(TEMPLATE)
    for marker in parts:
        assert marker in html, "missing marker " + marker
        html = html.replace(marker, parts[marker])
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)
    svgdir = os.path.join(HERE, "assets", "svg")
    if not os.path.isdir(svgdir):
        os.makedirs(svgdir)
    shutil.copy(os.path.join(ART, "door.svg"), os.path.join(svgdir, "door-raketti.svg"))
    print("wrote %s" % OUT)
    print("  noses:%d fins:%d dests:%d" % (parts["<!--PARTSHEET-->"].count('id="rp-nose_'), parts["<!--PARTSHEET-->"].count('id="rp-fins_'), parts["<!--DESTSHEET-->"].count('id="rd-dest_')))


if __name__ == "__main__":
    main()
