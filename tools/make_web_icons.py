#!/usr/bin/env python3
"""Generate Seikkailuhuone's app icons (indigo backdrop + wooden arched door with
a gold knob and a few star dots), no external dependencies. Writes icons/icon-<n>.png.

Deliberately different from the sibling opijapelaa icon (pink square + yellow star):
here it's the "adventure room" door motif on the app's own indigo room colour.

Full-bleed square (opaque) so iOS/Android can apply their own mask/rounding.
Keep the shapes in sync with icons/favicon.svg (same geometry, 64-unit grid).
Run from anywhere: python3 tools/make_web_icons.py
"""
import zlib, struct, math, os

# palette (matches the hub)
BG    = (52, 42, 78)     # #342a4e  indigo room
FRAME = (94, 61, 28)     # #5e3d1c  dark wood frame
WOOD  = (138, 90, 43)    # #8a5a2b  door
GOLD  = (255, 210, 100)  # #ffd264  knob + star
CYAN  = (207, 232, 255)  # #cfe8ff  star

SS = 3                       # supersampling for anti-aliasing
SIZES = [32, 180, 192, 512]  # 32 = tab favicon, 180 = apple-touch, 192/512 = manifest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "icons")

# geometry on a 64-unit grid (scaled by S/64 at render time) -------------------
# door silhouette = a rectangle with a semicircular (arched) top.
DOOR = dict(cx=32.0, r=14.0, arch=24.0, bot=54.0)   # outer (frame)
INND = dict(cx=32.0, r=11.0, arch=25.0, bot=51.0)   # inner (wood), inset
KNOB = (40.0, 39.0, 2.8)                            # gold doorknob
DOTS = [(13.0, 15.0, 2.0, GOLD), (51.0, 19.0, 1.8, CYAN), (22.0, 10.5, 1.4, GOLD)]


def in_disc(x, y, cx, cy, r):
    dx = x - cx; dy = y - cy
    return dx * dx + dy * dy <= r * r


def in_door(x, y, d):
    """inside the arched-door silhouette (rect body + semicircle cap)."""
    x0 = d["cx"] - d["r"]; x1 = d["cx"] + d["r"]
    if d["arch"] <= y <= d["bot"] and x0 <= x <= x1:
        return True
    if y < d["arch"] and in_disc(x, y, d["cx"], d["arch"], d["r"]):
        return True
    return False


def colour_at(ux, uy):
    """colour for a point in 64-unit space."""
    if in_door(ux, uy, DOOR):
        if in_disc(ux, uy, KNOB[0], KNOB[1], KNOB[2]):
            return GOLD
        return WOOD if in_door(ux, uy, INND) else FRAME
    for (dx, dy, dr, col) in DOTS:
        if in_disc(ux, uy, dx, dy, dr):
            return col
    return BG


def render(size):
    S = size * SS
    scale = 64.0 / S
    hi = [[colour_at((x + 0.5) * scale, (y + 0.5) * scale) for x in range(S)]
          for y in range(S)]
    out = bytearray()
    n = SS * SS
    for y in range(size):
        out.append(0)  # PNG filter type 0 per scanline
        for x in range(size):
            r_ = g_ = b_ = 0
            for dy in range(SS):
                for dx in range(SS):
                    pr, pg, pb = hi[y * SS + dy][x * SS + dx]
                    r_ += pr; g_ += pg; b_ += pb
            out += bytes((r_ // n, g_ // n, b_ // n))  # opaque RGB
    return bytes(out)


def write_png(path, size, raw):
    def chunk(typ, data):
        return (struct.pack(">I", len(data)) + typ + data +
                struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff))
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)  # colour type 2 = RGB
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", ihdr))
        f.write(chunk(b"IDAT", zlib.compress(raw, 9)))
        f.write(chunk(b"IEND", b""))


def main():
    if not os.path.isdir(OUT):
        os.makedirs(OUT)
    for s in SIZES:
        write_png(os.path.join(OUT, "icon-%d.png" % s), s, render(s))
        print("wrote icons/icon-%d.png" % s)


if __name__ == "__main__":
    main()
