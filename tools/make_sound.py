#!/usr/bin/env python3
"""Generate Seikkailuhuone sound effects as tiny 22050 Hz, 16-bit mono PCM WAVs.
No dependencies (wave + struct + math). HTML5 Audio plays these on the Acer's
Android 4.1 WebView (format confirmed in the sibling opijapelaa project).

Usage:  python3 tools/make_sound.py          # writes assets/audio/*.wav
Add a new sound by adding an entry to SOUNDS; keep each short + calm (no harsh
transients, no strobey sweeps) to match the no-flash / cosy design rules.
"""
import wave, struct, math, os, random

SR = 22050
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(HERE, "assets", "audio")


# ---------- synthesis primitives (each returns a list of float samples) ----------
def _osc(t, freq, kind):
    p = 2 * math.pi * freq * t
    if kind == "sine":
        return math.sin(p)
    if kind == "square":
        return 1.0 if math.sin(p) >= 0 else -1.0
    if kind == "saw":
        x = freq * t
        return 2.0 * (x - math.floor(x + 0.5))
    if kind == "tri":
        x = freq * t
        return 2.0 * abs(2.0 * (x - math.floor(x + 0.5))) - 1.0
    return math.sin(p)


def tone(f0, f1, dur, amp=0.3, kind="sine", decay=5.0, harm=0.0):
    """A tone that glides f0->f1 over dur, exponential decay. harm adds an octave."""
    n = int(SR * dur)
    out = []
    for i in range(n):
        t = i / SR
        f = f0 + (f1 - f0) * (i / n)
        env = math.exp(-decay * t)
        s = amp * env * (_osc(t, f, kind) + harm * _osc(t, 2 * f, kind))
        out.append(s)
    return out


def noise(dur, amp=0.3, decay=6.0, lp=0.3):
    """Decaying noise through a one-pole low-pass (lp in 0..1; smaller = duller)."""
    n = int(SR * dur)
    out = []
    y = 0.0
    for i in range(n):
        t = i / SR
        x = (random.random() * 2 - 1)
        y = y + lp * (x - y)
        out.append(amp * math.exp(-decay * t) * y)
    return out


def silence(dur):
    return [0.0] * int(SR * dur)


def mix(*layers):
    n = max(len(l) for l in layers)
    out = [0.0] * n
    for l in layers:
        for i in range(len(l)):
            out[i] += l[i]
    return out


def seq(*parts):
    out = []
    for p in parts:
        out += p
    return out


# ---------- the sound set (name -> builder) ----------
def s_click():   return tone(420, 240, 0.05, 0.22, "square", 10)
def s_tap():     return tone(560, 520, 0.04, 0.18, "sine", 12)
def s_chime():   return seq(tone(880, 880, 0.12, 0.22, "sine", 5, 0.3), tone(1320, 1320, 0.18, 0.18, "sine", 4, 0.3))
def s_ding():    return tone(988, 988, 0.30, 0.24, "sine", 3.0, 0.4)
def s_pop():     return tone(300, 820, 0.09, 0.26, "sine", 9)
def s_boom():    return mix(tone(150, 48, 0.45, 0.35, "saw", 4), noise(0.4, 0.3, 5, 0.12))
def s_rumble():  return mix(tone(95, 60, 0.6, 0.26, "saw", 3), noise(0.6, 0.18, 3.5, 0.08))
def s_whoosh():  return noise(0.4, 0.26, 4.5, 0.5)
def s_fizz():    return noise(0.5, 0.16, 2.2, 0.85)
def s_glug():    return seq(tone(240, 150, 0.08, 0.3, "sine", 7), tone(210, 140, 0.08, 0.26, "sine", 7))
def s_bubble():  return tone(520, 880, 0.10, 0.22, "sine", 8)
def s_sparkle(): return seq(tone(1320, 1320, 0.07, 0.16, "sine", 8), tone(1760, 1760, 0.07, 0.14, "sine", 8), tone(2100, 2100, 0.1, 0.12, "sine", 7))
def s_roar():    return mix(tone(300, 110, 0.32, 0.34, "saw", 3), noise(0.3, 0.14, 5, 0.25))
def s_chomp():   return seq(tone(200, 90, 0.05, 0.3, "square", 12), silence(0.03), tone(180, 80, 0.05, 0.26, "square", 12))
def s_burp():    return tone(170, 70, 0.26, 0.3, "saw", 3.5, 0.2)
def s_meow():    return seq(tone(520, 760, 0.12, 0.26, "saw", 5), tone(760, 430, 0.14, 0.22, "saw", 5))
def s_cuckoo():  return seq(tone(790, 790, 0.14, 0.26, "sine", 5), silence(0.05), tone(620, 620, 0.18, 0.24, "sine", 5))
def s_creak():   return tone(150, 85, 0.42, 0.2, "saw", 2.5)
def s_hoot():    return seq(tone(430, 400, 0.16, 0.24, "sine", 4, 0.2), tone(400, 360, 0.2, 0.2, "sine", 4, 0.2))
def s_twinkle(): return tone(1760, 2640, 0.14, 0.16, "sine", 6)
def s_ribbit():  return seq(tone(300, 180, 0.09, 0.3, "saw", 6), tone(260, 150, 0.1, 0.26, "saw", 6))
def s_dig():     return noise(0.18, 0.22, 7, 0.22)
def s_reveal():  return seq(tone(660, 660, 0.09, 0.2, "sine", 6, 0.3), tone(990, 990, 0.16, 0.18, "sine", 5, 0.3))
def s_note_lo(): return tone(392, 392, 0.22, 0.24, "tri", 3.5, 0.2)
def s_note_mid():return tone(523, 523, 0.22, 0.24, "tri", 3.5, 0.2)
def s_note_hi(): return tone(659, 659, 0.22, 0.24, "tri", 3.5, 0.2)

# --- hirviopaja (monster maker) effects ---
def s_naps():     return tone(640, 420, 0.045, 0.2, "square", 11)          # soft tick on part swap
def s_pulp():     return tone(240, 560, 0.1, 0.24, "sine", 8)              # soft plop, new part appears
def s_taika():    return seq(tone(660, 660, 0.06, 0.16, "sine", 7), tone(880, 880, 0.06, 0.15, "sine", 7), tone(1180, 1180, 0.1, 0.14, "sine", 6))  # surprise shimmer
def s_tallenna(): return seq(tone(660, 660, 0.1, 0.2, "sine", 5, 0.3), tone(990, 990, 0.18, 0.2, "sine", 4, 0.3))  # saved! two notes up
def s_fiuh():     return noise(0.3, 0.12, 5, 0.45)                          # soft wing breath
def s_poo():      return tone(220, 90, 0.26, 0.26, "saw", 3)               # funny low "poo" easter-egg

# --- tulivuori (volcano) ---
def s_toks():    return tone(300, 170, 0.07, 0.24, "sine", 10)             # soft poke thud
def s_jyrina():  return mix(tone(92, 55, 0.6, 0.24, "saw", 3), noise(0.6, 0.18, 3.2, 0.08))  # low rumble
def s_pamaus():  return mix(tone(150, 52, 0.34, 0.3, "saw", 4), noise(0.3, 0.22, 5, 0.12))    # soft low boom
def s_viuh():    return tone(480, 1400, 0.3, 0.14, "sine", 3)              # object whistles up
def s_kops():    return tone(210, 120, 0.08, 0.24, "sine", 11)            # object lands
def s_huu():     return noise(0.35, 0.12, 4, 0.42)                         # smoke-ring air puff
def s_rojaus():  return noise(0.32, 0.18, 5.5, 0.28)                       # rock tumble
def s_pling():   return seq(tone(1046, 1046, 0.07, 0.14, "sine", 8), tone(1318, 1318, 0.07, 0.13, "sine", 8), tone(1568, 1568, 0.1, 0.12, "sine", 7))  # firework sparkle
def s_loyto():   return seq(tone(660, 660, 0.1, 0.18, "sine", 5, 0.3), tone(990, 990, 0.16, 0.16, "sine", 4, 0.3))  # new find chime
def s_pyyh():    return noise(0.3, 0.1, 4, 0.35)                           # day/night sweep

# --- muna (dragon egg) ---
def s_lampo():   return tone(300, 400, 0.25, 0.14, "sine", 2.2, 0.3)       # warm rising hmm
def s_halkee():  return seq(tone(420, 200, 0.05, 0.24, "square", 10), noise(0.12, 0.18, 6, 0.3))  # shell cracks open
def s_karjaisu():return tone(300, 520, 0.26, 0.18, "saw", 3)               # cute baby roar
def s_liekki():  return noise(0.25, 0.12, 5, 0.5)                          # flame puff
def s_nam():     return seq(tone(200, 90, 0.05, 0.26, "square", 12), silence(0.03), tone(180, 80, 0.05, 0.24, "square", 12))  # chomp
def s_hik():     return tone(300, 540, 0.14, 0.2, "saw", 5)                # hiccup burp
def s_kehraa():  return tone(120, 110, 0.4, 0.12, "saw", 1.6, 0.2)         # purr
def s_kasva():   return seq(tone(880, 880, 0.07, 0.14, "sine", 7), tone(1180, 1180, 0.1, 0.12, "sine", 6))  # grow sparkle
def s_uni():     return tone(500, 300, 0.3, 0.12, "sine", 2)               # sleepy down
def s_heraa():   return tone(420, 700, 0.18, 0.14, "sine", 4)              # wake up

# --- taikapata (potion pot) ---
def s_hoyry():   return noise(0.42, 0.11, 2.8, 0.6)                         # steam hiss
def s_kvak():    return seq(tone(300, 180, 0.08, 0.26, "saw", 6), silence(0.04), tone(280, 170, 0.09, 0.24, "saw", 6))  # frog
def s_kimallus():return seq(tone(1046, 1046, 0.07, 0.14, "sine", 8), tone(1318, 1318, 0.07, 0.13, "sine", 8), tone(1760, 1760, 0.1, 0.12, "sine", 7))  # magic shimmer
def s_sateenkaari(): return tone(400, 920, 0.42, 0.14, "sine", 2, 0.3)     # gentle rainbow glide up
def s_kutistu(): return tone(720, 240, 0.32, 0.16, "sine", 2)              # shrink down-glide
def s_jaa():     return seq(tone(1568, 1568, 0.08, 0.12, "sine", 8), tone(2093, 2093, 0.1, 0.1, "sine", 7))  # ice crystal
def s_poh():     return tone(200, 88, 0.26, 0.26, "saw", 3)                # funny stink "poh"
def s_kolise():  return seq(tone(900, 900, 0.05, 0.2, "square", 10), tone(1200, 1200, 0.07, 0.18, "square", 9))  # coin clink
def s_tyhjenna():return mix(tone(500, 120, 0.3, 0.14, "saw", 3), noise(0.3, 0.1, 4, 0.3))  # slurp empty

# --- luut (dino dig) ---
def s_brush():   return noise(0.26, 0.14, 6, 0.3)                           # sandy brush sweep
def s_clink():   return tone(1200, 1650, 0.06, 0.16, "square", 8)           # small stony tap
def s_duck():    return seq(tone(650, 520, 0.08, 0.22, "saw", 6), silence(0.03), tone(560, 440, 0.08, 0.2, "saw", 6))  # rubber-duck honk
def s_page():    return noise(0.2, 0.08, 5, 0.4)                            # soft paper/book turn

# --- tahdet (constellations) ---
def s_line():    return tone(520, 780, 0.1, 0.14, "sine", 6)                # a connecting line grows
def s_kokeile(): return tone(360, 300, 0.14, 0.1, "sine", 4)               # gentle "try again" (not negative)
def s_shoot():   return noise(0.3, 0.08, 4, 0.55)                          # shooting-star whoosh
def s_seuraava():return tone(600, 920, 0.12, 0.14, "sine", 5)              # next figure

# --- raketti (rocket workshop) ---
def s_clunk():   return tone(260, 150, 0.07, 0.2, "square", 9)              # part snaps on
def s_cluck():   return seq(tone(500, 380, 0.06, 0.2, "saw", 6), silence(0.03), tone(460, 340, 0.06, 0.18, "saw", 6))  # chicken cluck

# --- salahuone (10-room house) ---
def s_rustle():  return noise(0.22, 0.1, 6, 0.35)                           # leafy/papery puff
def s_snore():   return seq(tone(120, 190, 0.3, 0.11, "sine", 1.5), tone(190, 110, 0.26, 0.1, "sine", 2))  # slow snore
def s_horse():   return tone(420, 250, 0.3, 0.16, "saw", 3)                # playful neigh
def s_musicbox():return seq(tone(1046, 1046, 0.1, 0.12, "sine", 6), tone(1318, 1318, 0.1, 0.11, "sine", 6), tone(1568, 1568, 0.1, 0.1, "sine", 6), tone(1046, 1046, 0.12, 0.1, "sine", 6))  # tiny melody
def s_fire():    return noise(0.4, 0.08, 1.8, 0.25)                        # gentle crackle
def s_unlock():  return seq(tone(300, 200, 0.06, 0.2, "square", 8), silence(0.04), tone(480, 720, 0.1, 0.16, "square", 6))  # clunk + turn
def s_boil():    return noise(0.4, 0.07, 1.6, 0.5)                         # watery bubbling
def s_whistle(): return tone(700, 1320, 0.34, 0.12, "sine", 2)            # rising kettle whistle
def s_drip():    return tone(950, 520, 0.08, 0.18, "sine", 9)             # water drop plink
def s_clatter(): return seq(noise(0.06, 0.14, 8, 0.2), silence(0.02), noise(0.08, 0.12, 8, 0.2))  # wooden tumble
def s_gear():    return seq(tone(200, 160, 0.05, 0.16, "square", 10), silence(0.03), tone(200, 160, 0.05, 0.16, "square", 10))  # naks-naks
def s_beep():    return seq(tone(880, 880, 0.06, 0.16, "square", 8), silence(0.03), tone(1100, 1100, 0.07, 0.14, "square", 7))  # robot beep
def s_rattle():  return seq(noise(0.04, 0.1, 10, 0.6), silence(0.02), noise(0.04, 0.1, 10, 0.6), silence(0.02), noise(0.04, 0.1, 10, 0.6))  # bony rattle
def s_whir():    return tone(300, 300, 0.3, 0.1, "saw", 2)                # spinning whir

VOICE_TIMBRE = {"head": "saw", "body": "tri", "tail": "square"}
VOICE_HZ = {
    "head-liekki": 392, "head-narsku": 262, "head-tuijo": 440, "head-nokka": 523,
    "head-kurno": 196, "head-moly": 330, "head-piip": 659, "head-napse": 349,
    "body-potko": 196, "body-pallo": 220, "body-nukka": 165, "body-muna": 247,
    "body-okki": 208, "body-kuori": 147, "body-mohko": 175, "body-tolkki": 233,
    "tail-piikki": 587, "tail-pompo": 440, "tail-sakara": 523, "tail-kiemu": 494,
    "tail-viuhka": 659, "tail-topo": 392, "tail-nuija": 330, "tail-suti": 698,
}  # mirrors content/logic.js hirviopaja.voiceHz

def _voice_builder(part_id):
    slot = part_id.split("-")[0]
    hz = VOICE_HZ[part_id]
    kind = VOICE_TIMBRE[slot]
    if slot == "body":
        f0, f1, dur = hz * 0.9, hz, 0.20     # body note slides gently UP
    else:
        f0, f1, dur = hz, hz * 0.85, 0.18 if slot == "head" else 0.22  # head/tail slide down
    return lambda: tone(f0, f1, dur, 0.26, kind, 4.5, 0.15)


def s_success():
    parts = []
    for f, d in [(523.25, 0.11), (659.25, 0.11), (783.99, 0.11), (1046.5, 0.16)]:
        parts.append(tone(f, f, d, 0.32, "sine", 6, 0.3))
    chord = mix(tone(1046.5, 1046.5, 0.34, 0.12, "sine", 4.5),
                tone(1318.5, 1318.5, 0.34, 0.1, "sine", 4.5),
                tone(1568.0, 1568.0, 0.34, 0.1, "sine", 4.5))
    return seq(*parts) + chord


SOUNDS = {
    "click": s_click, "tap": s_tap, "chime": s_chime, "ding": s_ding, "pop": s_pop,
    "boom": s_boom, "rumble": s_rumble, "whoosh": s_whoosh, "fizz": s_fizz,
    "glug": s_glug, "bubble": s_bubble, "sparkle": s_sparkle, "roar": s_roar,
    "chomp": s_chomp, "burp": s_burp, "meow": s_meow, "cuckoo": s_cuckoo,
    "creak": s_creak, "hoot": s_hoot, "twinkle": s_twinkle, "ribbit": s_ribbit,
    "dig": s_dig, "reveal": s_reveal,
    "note_lo": s_note_lo, "note_mid": s_note_mid, "note_hi": s_note_hi,
    "naps": s_naps, "pulp": s_pulp, "taika": s_taika, "tallenna": s_tallenna,
    "fiuh": s_fiuh, "poo": s_poo,
    "toks": s_toks, "jyrina": s_jyrina, "pamaus": s_pamaus, "viuh": s_viuh, "kops": s_kops,
    "huu": s_huu, "rojaus": s_rojaus, "pling": s_pling, "loyto": s_loyto, "pyyh": s_pyyh,
    "lampo": s_lampo, "halkee": s_halkee, "karjaisu": s_karjaisu, "liekki": s_liekki,
    "nam": s_nam, "hik": s_hik, "kehraa": s_kehraa, "kasva": s_kasva, "uni": s_uni, "heraa": s_heraa,
    "hoyry": s_hoyry, "kvak": s_kvak, "kimallus": s_kimallus, "sateenkaari": s_sateenkaari,
    "kutistu": s_kutistu, "jaa": s_jaa, "poh": s_poh, "kolise": s_kolise, "tyhjenna": s_tyhjenna,
    "brush": s_brush, "clink": s_clink, "duck": s_duck, "page": s_page,
    "line": s_line, "kokeile": s_kokeile, "shoot": s_shoot, "seuraava": s_seuraava,
    "clunk": s_clunk, "cluck": s_cluck,
    "rustle": s_rustle, "snore": s_snore, "horse": s_horse, "musicbox": s_musicbox,
    "fire": s_fire, "unlock": s_unlock, "boil": s_boil, "whistle": s_whistle, "drip": s_drip,
    "clatter": s_clatter, "gear": s_gear, "beep": s_beep, "rattle": s_rattle, "whir": s_whir,
    "success": s_success,
}

# pre-baked monster voice notes (device has no WebAudio) -> voice_<part>.wav
for _pid in VOICE_HZ:
    SOUNDS["voice_" + _pid] = _voice_builder(_pid)


def write_wav(path, samples):
    w = wave.open(path, "w")
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    frames = bytearray()
    for s in samples:
        v = int(max(-1.0, min(1.0, s)) * 32767)
        frames += struct.pack("<h", v)
    w.writeframes(bytes(frames))
    w.close()
    return len(frames)


def main():
    random.seed(7)  # deterministic noise so rebuilds are reproducible
    if not os.path.isdir(OUTDIR):
        os.makedirs(OUTDIR)
    total = 0
    for name in sorted(SOUNDS):
        path = os.path.join(OUTDIR, name + ".wav")
        size = write_wav(path, SOUNDS[name]())
        total += size
        print("  %-10s %6.1f KB" % (name, size / 1024.0))
    print("wrote %d sounds, %.1f KB total -> %s" % (len(SOUNDS), total / 1024.0, OUTDIR))


if __name__ == "__main__":
    main()
