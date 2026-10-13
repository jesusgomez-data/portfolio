"""Banda sonora original del promo JGStudio (120 BPM, Re menor, 38 s).

Sintetizada con numpy/scipy: sin samples ni licencias de terceros.
Uso: python music.py salida.wav
"""
import sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
DUR = 38.5
N = int(SR * DUR)
rng = np.random.default_rng(7)


# ---------- utilidades ----------
def buf():
    return np.zeros((N, 2))


def stereo(x, pan=0.0):
    if x.ndim == 2:
        return x
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1) * 1.414


def place(dst, x, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i < 0:
        return
    x = stereo(x, pan)
    n = min(len(x), N - i)
    dst[i:i + n] += x[:n] * gain


def filt(x, kind, fc, order=2):
    sos = signal.butter(order, fc, kind, fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def noise(dur):
    return rng.standard_normal(int(dur * SR))


# ---------- instrumentos ----------
def kick(dur=0.45, soft=False):
    t = tt(dur)
    f = 44 + 115 * np.exp(-t / 0.034)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.17)
    click = filt(noise(dur) * np.exp(-t / 0.003), 'high', 2500) * 0.25
    x = np.tanh((x + (0 if soft else click)) * 1.7)
    return filt(x, 'low', 180) if soft else x


def clap():
    t = tt(0.35)
    x = np.zeros_like(t)
    for off in (0, 0.011, 0.022):
        i = int(off * SR)
        x[i:] += noise(0.35)[:len(t) - i] * np.exp(-t[:len(t) - i] / 0.012)
    x += noise(0.35) * np.exp(-t / 0.09) * 0.5
    return filt(x, 'band', [900, 4200]) * 0.6


def hat(decay=0.028):
    t = tt(decay * 6)
    return filt(noise(decay * 6) * np.exp(-t / decay), 'high', 7500, 4)


def snare():
    t = tt(0.2)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04)
    return body * 0.5 + filt(noise(0.2) * np.exp(-t / 0.06), 'high', 1800) * 0.5


def thud(f0=95, f1=48, dur=0.5):
    t = tt(dur)
    f = f1 + (f0 - f1) * np.exp(-t / 0.05)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.14)


def tick():
    t = tt(0.12)
    return (np.sin(2 * np.pi * 2100 * t) + 0.5 * np.sin(2 * np.pi * 3170 * t)) * np.exp(-t / 0.012)


def pluck(f, dur=0.4, bright=1.0):
    t = tt(dur)
    x = np.zeros_like(t)
    for h in range(1, 14):
        if f * h > 9500:
            break
        x += np.sin(2 * np.pi * f * h * t) / h * np.exp(-t * (3.0 + h * 2.4 / bright))
    return x * (1 - np.exp(-t / 0.002))


def bass_note(f, dur=0.24):
    t = tt(dur)
    saw = 2 * ((f * t) % 1) - 1 + 0.6 * (2 * ((f * 1.006 * t + 0.3) % 1) - 1)
    x = filt(saw, 'low', 420, 4) * 0.7 + np.sin(2 * np.pi * f * t) * 0.9
    env = (1 - np.exp(-t / 0.004)) * np.exp(-t / 0.16)
    return np.tanh(x * env * 1.4)


def pad_chord(notes, dur, cutoff):
    t = tt(dur)
    out = np.zeros((len(t), 2))
    for m in notes:
        f = midi(m)
        for k, cents in enumerate((-13, -6, 0, 7, 12)):
            fk = f * 2 ** (cents / 1200)
            s = 2 * ((fk * t + rng.random()) % 1) - 1
            out[:, k % 2] += s
            out[:, (k + 1) % 2] += s * 0.35
    out = filt(out, 'low', cutoff, 4)
    a, r = int(0.35 * SR), int(0.7 * SR)
    env = np.ones(len(t))
    env[:a] = np.linspace(0, 1, a) ** 1.5
    env[-r:] = np.linspace(1, 0, r) ** 1.5
    return out * env[:, None] / (len(notes) * 3)


def whoosh(dur=0.7, fc=(600, 3500)):
    t = tt(dur)
    env = np.exp(-((t - dur * 0.62) / (dur * 0.2)) ** 2)
    x = filt(noise(dur), 'band', list(fc), 2) * env
    pan = np.linspace(-0.8, 0.8, len(t))
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)


def riser(dur):
    t = tt(dur)
    p = t / dur
    n = noise(dur)
    x = (filt(n, 'low', 900) * (1 - p) + filt(n, 'band', [1800, 6000]) * p
         + filt(n, 'high', 8000) * p ** 2 * 1.5) * p ** 2
    f = 180 * 2 ** (3.2 * p)
    x += np.sin(2 * np.pi * np.cumsum(f) / SR) * p ** 3 * 0.25
    return x


def crash(dur=1.6):
    t = tt(dur)
    return filt(noise(dur), 'high', 4500, 2) * np.exp(-t / 0.42)


def impact():
    t = tt(1.8)
    f = 30 + 55 * np.exp(-t / 0.09)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5)
    burst = filt(noise(1.8) * np.exp(-t / 0.12), 'low', 3200) * 0.6
    return np.tanh((boom + burst) * 1.5)


# ---------- armonía ----------
# i - VI - III - VII en Re menor, un acorde por compás (2 s)
CHORDS = [
    (38, [62, 65, 69, 74]),   # Dm
    (34, [58, 62, 65, 70]),   # Bb
    (41, [60, 65, 69, 72]),   # F
    (36, [60, 64, 67, 72]),   # C
]
ARP = [0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2, 3, 1, 2]
LEAD = {
    13: [77, 74, 70, 74, 77, 74, 82, 81],
    14: [81, 77, 72, 77, 81, 84, 81, 77],
    15: [79, 76, 72, 76, 79, 84, 88, 91],
}

drums, bass, pad, arp, lead, fx, wet = buf(), buf(), buf(), buf(), buf(), buf(), buf()

# ---------- pad (toda la pieza) ----------
for bar in range(16):
    cut = [350, 480, 700, 1000][bar] if bar < 4 else 1900
    place(pad, pad_chord(CHORDS[bar % 4][1], 2.7, cut), bar * 2 - 0.15 if bar else 0, 0.9 if bar >= 4 else 0.6 + bar * 0.1)
place(pad, pad_chord(CHORDS[0][1] + [77, 81], 6.2, 1600), 31.85, 1.0)

# ---------- intro 0-8 ----------
for i, tb in enumerate((0.5, 0.58, 1.0, 1.5, 2.0, 2.08, 2.5, 2.58)):
    place(fx, tick(), tb, 0.16 if i in (1, 5, 7) else 0.3, pan=(-0.5, 0.5)[i % 2])
    place(wet, tick(), tb, 0.12)
place(fx, impact(), 0.0, 0.45)
for tb in (0, 1, 2, 3):
    place(drums, kick(soft=True), tb, 0.55)
place(fx, whoosh(0.6, (900, 5000)), 3.0 - 0.37, 0.5)
place(fx, thud(), 3.0, 0.7)
place(fx, whoosh(0.8), 4.0 - 0.5, 0.6)
place(fx, impact(), 4.0, 0.5)
for i in range(4):                       # filas de fricciones
    place(fx, thud(110 - i * 6, 50), 4.0 + i * 0.5 + 0.02, 0.75)
    place(fx, tick(), 4.0 + i * 0.5 + 0.02, 0.18, pan=0.4)
    place(fx, whoosh(0.3, (1500, 7000)), 6.2 + i * 0.15 - 0.19, 0.3)   # tachados
for i in range(8):
    place(drums, kick(soft=True), 4.0 + i * 0.5, 0.5 + i * 0.05)
for bar in (2, 3):                       # arpegio filtrado entrando
    for s in range(16):
        g = ((bar - 2) * 16 + s) / 32
        note = pluck(midi(CHORDS[bar % 4][1][ARP[s]] + 12), 0.3, 0.35 + g * 0.5)
        place(arp, note, bar * 2 + s * 0.125, 0.25 + g * 0.6, pan=(-0.4, 0.4)[s % 2])
place(fx, riser(2.6), 5.4, 0.42)
for s in range(8):
    place(drums, snare(), 7.0 + s * 0.125, 0.12 + s * 0.035)
for s in range(8):
    place(drums, snare(), 7.5 + s * 0.0625, 0.3 + s * 0.03)
rc = crash(1.5)[::-1]
place(fx, rc, 8.0 - 1.5, 0.3)

# ---------- drop 8-32 ----------
kicks = [8 + i * 0.5 for i in range(48) if 8 + i * 0.5 not in (17.5, 25.5, 31.5)]
for tk in kicks:
    place(drums, kick(), tk, 0.95)
for bar in range(5, 16):
    for b in (0.5, 1.5):
        c = clap()
        place(drums, c, bar * 2 + b, 0.5)
        place(wet, c, bar * 2 + b, 0.25)
    for s in range(16):
        place(drums, hat(), bar * 2 + s * 0.125, (0.2, 0.07, 0.13, 0.07)[s % 4], pan=0.25)
    if bar >= 9:
        for b in range(4):
            place(drums, hat(0.09), bar * 2 + b * 0.5 + 0.25, 0.13, pan=-0.3)
for tf in (17.5, 25.5):                  # redobles de transición
    for s in range(4):
        place(drums, snare(), tf + s * 0.125, 0.3 + s * 0.08)
for s in range(8):
    place(drums, snare(), 31.0 + s * 0.0625, 0.2 + s * 0.035)
for s in range(8):
    place(drums, snare(), 31.5 + s * 0.0625, 0.45 + s * 0.04)

for bar in range(4, 16):
    root, notes = CHORDS[bar % 4]
    f = midi(root)
    for s in (1, 3, 5, 7):               # bajo a contratiempo
        place(bass, bass_note(f), bar * 2 + s * 0.25, 0.8)
    place(bass, bass_note(f * 2, 0.12), bar * 2 + 1.875, 0.45)
    if bar >= 5:
        for s in range(16):
            place(arp, pluck(midi(notes[ARP[s]] + 12), 0.34, 1.0), bar * 2 + s * 0.125,
                  (1.0, 0.55, 0.75, 0.55)[s % 4], pan=(-0.45, 0.45)[s % 2])
    if bar in LEAD:
        for s, m in enumerate(LEAD[bar]):
            place(lead, pluck(midi(m), 0.6, 1.6), bar * 2 + s * 0.25, 0.9, pan=(0.2, -0.2)[s % 2])

for tc in (10, 14, 18, 22, 26, 30):      # barridos en cada corte
    place(fx, whoosh(0.9), tc - 0.56, 0.55)
for tc in (8, 10, 18, 26):
    place(fx, crash(), tc, 0.3)
    place(wet, crash(), tc, 0.15)
place(fx, impact(), 8.0, 0.95)
place(wet, impact(), 8.0, 0.4)
for i in range(4):                       # golpes de los 4 datos
    place(fx, thud(120, 55, 0.4), 30 + i * 0.5, 0.6)
    place(fx, tick(), 30 + i * 0.5, 0.25)
place(fx, riser(2.0), 30.0, 0.4)
place(fx, crash(1.5)[::-1], 32.0 - 1.5, 0.3)

# ---------- final 32-38 ----------
place(drums, kick(), 32.0, 1.0)
place(fx, impact(), 32.0, 1.0)
place(wet, impact(), 32.0, 0.5)
place(fx, crash(2.4), 32.0, 0.4)
place(wet, crash(2.4), 32.0, 0.25)
for s in range(16):
    m = [62, 65, 69, 74, 77, 74, 69, 65][s % 8] + 12
    place(arp, pluck(midi(m), 0.6, 1.0 - s * 0.045), 32.25 + s * 0.25, 0.8 * (1 - s / 17), pan=(-0.45, 0.45)[s % 2])

# ---------- sidechain, delay, reverb ----------
sc = np.ones(N)
m = int(0.42 * SR)
seg = 1 - 0.78 * np.exp(-np.arange(m) / (0.1 * SR))
for tk in kicks:
    i = int(tk * SR)
    sc[i:i + m] = np.minimum(sc[i:i + m], seg[:len(sc[i:i + m])])
for b in (pad, bass, arp, lead):
    b *= sc[:, None]


def pingpong(x, time=0.375, fb=0.42, reps=5):
    out = np.zeros_like(x)
    d = int(time * SR)
    for k in range(1, reps + 1):
        sh = np.zeros_like(x)
        sh[k * d:] = x[:-k * d]
        out += (sh[:, ::-1] if k % 2 else sh) * fb ** k
    return out


arp += pingpong(arp) * 0.7
lead += pingpong(lead, 0.375, 0.5) * 0.9

t_ir = tt(2.8)
ir = np.stack([rng.standard_normal(len(t_ir)), rng.standard_normal(len(t_ir))], 1) * np.exp(-t_ir / 0.75)[:, None]
ir = filt(ir, 'high', 350)
send = wet + pad * 0.5 + arp * 0.45 + lead * 0.6 + fx * 0.25
rev = np.stack([signal.fftconvolve(send[:, c], ir[:, c])[:N] for c in (0, 1)], 1)
rev /= np.abs(rev).max() + 1e-9

mix = (drums * 0.9 + bass * 0.5 + pad * 0.55 + arp * 0.2 + lead * 0.17 + fx * 0.6 + rev * 0.33)
mix = filt(mix, 'high', 28)
mix = np.tanh(mix * 1.15)
fade = int(1.3 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
mix = mix / np.abs(mix).max() * 0.9

out = sys.argv[1] if len(sys.argv) > 1 else 'music.wav'
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print('ok', out, round(len(mix) / SR, 2), 's')
