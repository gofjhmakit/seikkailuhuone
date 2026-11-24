#!/usr/bin/env python3
"""Generate launcher icons (indigo room + wooden arched door with a gold knob and
star dots) with no external dependencies. Writes res/drawable-*/ic_launcher.png.

Same artwork as the web favicon (icons/favicon.svg), on a 64-unit grid.
"""
import zlib, struct, os

# palette (matches the hub)
BG    = (52, 42, 78)     # #342a4e  indigo room
FRAME = (94, 61, 28)     # #5e3d1c  dark wood frame
WOOD  = (138, 90, 43)    # #8a5a2b  door
GOLD  = (255, 210, 100)  # #ffd264  knob + star
CYAN  = (207, 232, 255)  # #cfe8ff  star

SS = 3  # supersampling for anti-aliasing
BUCKETS = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144}

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # app/

# geometry on a 64-unit grid (see icons/favicon.svg)
DOOR = dict(cx=32.0, r=14.0, arch=24.0, bot=54.0)
INND = dict(cx=32.0, r=11.0, arch=25.0, bot=51.0)
KNOB = (40.0, 39.0, 2.8)
DOTS = [(13.0, 15.0, 2.0, GOLD), (51.0, 19.0, 1.8, CYAN), (22.0, 10.5, 1.4, GOLD)]


def in_disc(x, y, cx, cy, r):
    dx = x - cx; dy = y - cy
    return dx * dx + dy * dy <= r * r


def in_door(x, y, d):
    x0 = d["cx"] - d["r"]; x1 = d["cx"] + d["r"]
    if d["arch"] <= y <= d["bot"] and x0 <= x <= x1:
        return True
    if y < d["arch"] and in_disc(x, y, d["cx"], d["arch"], d["r"]):
        return True
    return False


def colour_at(ux, uy):
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
        out.append(0)
        for x in range(size):
            r_ = g_ = b_ = 0
            for dy in range(SS):
                for dx in range(SS):
                    pr, pg, pb = hi[y * SS + dy][x * SS + dx]
                    r_ += pr; g_ += pg; b_ += pb
            out += bytes((r_ // n, g_ // n, b_ // n))
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
    for bucket, size in BUCKETS.items():
        d = os.path.join(HERE, "res", "drawable-" + bucket)
        if not os.path.isdir(d):
            os.makedirs(d)
        write_png(os.path.join(d, "ic_launcher.png"), size, render(size))
        print("wrote res/drawable-%s/ic_launcher.png (%dpx)" % (bucket, size))


if __name__ == "__main__":
    main()
