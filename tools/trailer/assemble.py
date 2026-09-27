#!/usr/bin/env python3
"""
Cut the trailer (tools/trailer): 60 s, 1920x1080, 30 fps.

    python3 tools/trailer/assemble.py [work dir=tests/tmp/trailer] [out=trailer.mp4]

Reads the filmed shots (film.mjs -> render/<shot>/f####.jpg), the cards and
captions (cards.mjs -> cards/<name>/), the screen stills (ui.mjs -> ui/), the
music bed (the game's own highlights track, recorded) and the commentary clips
(assets/voice/us). Every cut sits on the music's bar (57 frames = 1.9 s).
"""
import os, subprocess, sys, shutil

W = sys.argv[1] if len(sys.argv) > 1 else 'tests/tmp/trailer'
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(W, 'apex-xi-trailer.mp4')
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
SEG = os.path.join(W, 'segs'); os.makedirs(SEG, exist_ok=True)
FPS = 30

def ff(*args):
    subprocess.run([FF, '-y', '-loglevel', 'error', *args], check=True)

GRADE = 'eq=contrast=1.07:saturation=1.14:brightness=0.005,unsharp=5:5:0.35,vignette=angle=PI/5.5'
ENC = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', str(FPS)]

def cap_input(cap, offset):
    return ['-framerate', str(FPS), '-i', os.path.join(W, 'cards', cap, 'f%04d.png')], offset

def shot(name, frames, cap=None, cap_at=0, grade=True):
    """Footage from film.mjs (first `frames` frames), graded, a caption over it."""
    src = os.path.join(W, 'render', name, 'f%04d.jpg')
    out = os.path.join(SEG, f'{len(segs):02d}-{name}.mp4')
    args = ['-framerate', str(FPS), '-i', src]
    vf = f'[0:v]scale=1920:1080:flags=lanczos,{GRADE if grade else "null"},trim=end_frame={frames},setpts=PTS-STARTPTS[v]'
    if cap:
        args += ['-framerate', str(FPS), '-i', os.path.join(W, 'cards', cap, 'f%04d.png')]
        vf += f';[1:v]setpts=PTS+{cap_at / FPS}/TB[c];[v][c]overlay=0:0:eof_action=pass[o]'
        m = '[o]'
    else:
        m = '[v]'
    ff(*args, '-filter_complex', vf, '-map', m, '-frames:v', str(frames), *ENC, out)
    segs.append(out)

def card(name, frames):
    out = os.path.join(SEG, f'{len(segs):02d}-{name}.mp4')
    ff('-framerate', str(FPS), '-i', os.path.join(W, 'cards', name, 'f%04d.jpg'), '-frames:v', str(frames), '-vf', 'scale=1920:1080', *ENC, out)
    segs.append(out)

def still(img, frames, cap=None, zoom=0.05):
    """A screen still with a slow push in (rendered at 2x, so the move is smooth)."""
    out = os.path.join(SEG, f'{len(segs):02d}-{os.path.basename(img)}.mp4')
    z = f"zoompan=z='1+{zoom}*on/{frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s=1920x1080:fps={FPS}"
    args = ['-i', os.path.join(W, 'ui', img)]
    vf = f'[0:v]scale=3840:2160:flags=lanczos,{z},eq=saturation=1.06[v]'
    m = '[v]'
    if cap:
        args += ['-framerate', str(FPS), '-i', os.path.join(W, 'cards', cap, 'f%04d.png')]
        vf += ';[v][1:v]overlay=0:0:eof_action=pass[o]'; m = '[o]'
    ff(*args, '-filter_complex', vf, '-map', m, '-frames:v', str(frames), *ENC, out)
    segs.append(out)

segs = []
# ---- act one: a night at the stadium -------------------------------------
shot('A-crane', 114, cap='cap-stadium', cap_at=12)
shot('C-cross', 57)
shot('D-net', 57)
shot('E-celeb', 57)
card('title', 57)
# ---- act two: any weather -------------------------------------------------
shot('B-carry', 57, cap='cap-weather', cap_at=4)
shot('H-net', 57)
shot('I-save', 57)
shot('K-snow', 57)
shot('L-snowcross', 57)
shot('J-card', 57)
card('line-build', 57)
# ---- act three: the game around the match -------------------------------
still('02-menu.jpg', 57, cap='cap-menu')
still('03-squad.jpg', 57, cap='cap-squad')
# the pack, the burst as it rips, the card
still('06-pack.jpg', 19, cap='cap-pack', zoom=0.03)
still('07-reveal-00.jpg', 19, zoom=0.03)
still('07-reveal-02.jpg', 19, zoom=0.03)
still('04-division.jpg', 57, cap='cap-division')
still('08-kit.jpg', 57, cap='cap-kit')
still('09-career.jpg', 57, cap='cap-career')
still('10-cup.jpg', 57, cap='cap-cup')
still('11-street.jpg', 57, cap='cap-street')
# ---- act four: the montage, then the big one ------------------------------
for s in ['M1-daynet', 'M2-dayceleb', 'M3-dusk', 'M4-dusknet', 'M5-snownet', 'M6-tight', 'M7-strike', 'M8-net']:
    shot(s, 29)
shot('P2-cross', 57)
shot('P3-net', 57)
shot('P4-celeb', 71)
card('end', 186)

# ---- picture: join --------------------------------------------------------
lst = os.path.join(SEG, 'list.txt')
with open(lst, 'w') as f:
    for s in segs: f.write(f"file '{os.path.abspath(s)}'\n")
video = os.path.join(W, 'video.mp4')
ff('-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', video)

# ---- sound ----------------------------------------------------------------
V = 'assets/voice/us'
LINES = [  # (seconds, clip, gain)
    (5.85, 'pbp-goal-2.mp3', 1.0), (8.0, 'co-goal-1.mp3', 0.95),
    (13.65, 'pbp-goal-6.mp3', 1.0), (16.15, 'pbp-save-1.mp3', 1.0),
    (20.3, 'pbp-header-1.mp3', 1.0), (21.9, 'pbp-card-0.mp3', 0.95),
    (48.95, 'pbp-goal-7.mp3', 1.0), (51.2, 'co-goal-4.mp3', 0.95),
]
ROARS = [6.05, 13.8, 20.65, 40.5, 43.2, 44.3, 47.1, 49.1]
OOH = [16.3]
inputs = ['-i', os.path.join(W, 'music-bed.wav')]
for _, clip, _ in LINES: inputs += ['-i', os.path.join(V, clip)]
fc = []
# music: the bed, trimmed to the minute, faded, levelled
fc.append('[0:a]atrim=0:60,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.4,afade=t=out:st=57.2:d=2.8,volume=2.1[mus]')
# the crowd: brown noise shaped into a stadium murmur; quieter under the cards and the screens
crowd_vol = "if(between(t,9.5,11.4)+between(t,22.8,24.7),0.45,if(between(t,24.7,39.9),0.12,if(gt(t,53.8),max(0.08,1-(t-53.8)/2),1)))"
fc.append(f"anoisesrc=color=brown:amplitude=0.6:duration=60:seed=7,highpass=f=180,lowpass=f=2600,tremolo=f=0.35:d=0.25,volume='{crowd_vol}':eval=frame,volume=0.55[crowd]")
# roars: pink noise swells at each goal
roar_parts = []
for i, t in enumerate(ROARS + OOH):
    ooh = t in OOH
    fc.append(f"anoisesrc=color=pink:amplitude=0.5:duration=3.2:seed={11 + i},highpass=f=260,lowpass=f={1800 if ooh else 3600},afade=t=in:st=0:d={0.12 if not ooh else 0.25},afade=t=out:st={0.6 if ooh else 1.1}:d={1.2 if ooh else 2.0},volume={0.55 if ooh else 0.95},adelay={int(t * 1000)}|{int(t * 1000)},apad=whole_dur=60[r{i}]")
    roar_parts.append(f'[r{i}]')
# commentary
voice_parts = []
for i, (t, clip, g) in enumerate(LINES):
    fc.append(f"[{i + 1}:a]aresample=48000,pan=stereo|c0=c0|c1=c0,volume={g * 2.2},adelay={int(t * 1000)}|{int(t * 1000)},apad=whole_dur=60[v{i}]")
    voice_parts.append(f'[v{i}]')
fc.append(f"{''.join(voice_parts)}amix=inputs={len(voice_parts)}:normalize=0[voice]")
fc.append('[voice]asplit=2[voice1][vkey]')
# duck the music under the voices
fc.append('[mus][vkey]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[musd]')
fc.append(f"[crowd]{''.join(roar_parts)}amix=inputs={1 + len(roar_parts)}:normalize=0,volume=0.8[crowdall]")
fc.append('[musd][crowdall][voice1]amix=inputs=3:normalize=0,atrim=0:60,loudnorm=I=-15:TP=-1.2:LRA=9[aout]')
audio = os.path.join(W, 'audio.wav')
ff(*inputs, '-filter_complex', ';'.join(fc), '-map', '[aout]', '-ar', '48000', '-ac', '2', audio)

# ---- mux --------------------------------------------------------------------
ff('-i', video, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', OUT)
print('✔', OUT)
