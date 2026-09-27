#!/usr/bin/env python3
"""
Cut the TikTok clips (tools/tiktok): 1080x1920, 30 fps, H.264, under 9 MB.

    python3 tools/tiktok/cut.py <clip name|all>

Footage comes from film.mjs (recorded match scenes played back on the game,
render/<shot>/f####.jpg), stepper.mjs captures of the screens (pack, watch)
and live.mjs (whole builds, for the before/after). The sound is the game's
own: every kick, net, whistle and roar is rendered offline by sound.mjs from
the cues the sim raised in that very footage, plus the game's commentary
clips (assets/voice/us). No music. The hook sits at the top in the first
seconds, the end card says where to play.
"""
import json, os, subprocess, sys

W = 'tests/tmp/tiktok'
OUT = os.path.join(W, 'out')
FPS = 30
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
os.makedirs(OUT, exist_ok=True)
VOICE = 'assets/voice/us'
MAX_BYTES = 8.2 * 1024 * 1024        # the cap is 9 MB (read as 9,000,000 bytes): keep a margin under it


def ff(*args):
    subprocess.run([FF, '-y', '-loglevel', 'error', *args], check=True)


def node(*args):
    subprocess.run(['node', *args], check=True)


GRADE = 'eq=contrast=1.06:saturation=1.12,unsharp=5:5:0.3'
MID = ['-c:v', 'libx264', '-preset', 'fast', '-crf', '13', '-pix_fmt', 'yuv420p', '-r', str(FPS)]


class Clip:
    """A clip: picture segments one after another (hard cuts), overlays on top, a sound timeline under it."""

    def __init__(self, name):
        self.name = name
        self.dir = os.path.join(W, 'build', name)
        os.makedirs(self.dir, exist_ok=True)
        self.segs = []
        self.t = 0.0                       # running length, seconds
        self.over = []                     # (png, start, end)
        self.events = [[0, 'startCrowd'], [0, 'setCrowd', 0.4]]
        self.voices = []                   # (t, file, gain)

    def _seg(self, args, vf, frames):
        out = os.path.join(self.dir, f'{len(self.segs):02d}.mp4')
        ff(*args, '-vf', f'{vf},trim=end_frame={frames},setpts=PTS-STARTPTS', '-frames:v', str(frames), *MID, out)
        self.segs.append(out)
        start = self.t
        self.t += frames / FPS
        return start

    def footage(self, shot, start=0, frames=None, grade=True, scene=None, scene_from=0, slow=1, crowd=True, vf=''):
        """Frames start..start+frames of render/<shot>; with `scene`, the sim's cues for them go on the sound timeline."""
        d = os.path.join(W, 'render', shot)
        n = len([f for f in os.listdir(d) if f.endswith('.jpg')])
        frames = min(frames or n - start, n - start)
        chain = 'scale=1080:1920:flags=lanczos' + (',' + GRADE if grade else '') + (',' + vf if vf else '')
        t0 = self._seg(['-start_number', str(start), '-framerate', str(FPS), '-i', os.path.join(d, 'f%04d.jpg')], chain, frames)
        if scene:
            self.scene_sound(scene, scene_from + start / slow, frames / slow, t0, slow, crowd)
        return t0

    def frames(self, d, start, frames, vf='scale=1080:1920:flags=lanczos', pattern='f%04d.jpg'):
        return self._seg(['-start_number', str(start), '-framerate', str(FPS), '-i', os.path.join(d, pattern)], vf, frames)

    def still(self, png, frames, vf='scale=1080:1920'):
        return self._seg(['-loop', '1', '-framerate', str(FPS), '-i', png], vf, frames)

    def overlay(self, png, start, end):
        self.over.append((png, start, end))

    def voice(self, t, clip, gain=1.0):
        self.voices.append((t, clip, gain))

    def scene_sound(self, scene, frm, count, t0, slow=1, crowd=True):
        """The sim's own cues over recorded frames [frm, frm+count), as they sounded in the game."""
        F = json.load(open(scene))['frames']
        i0 = int(round(frm)); i1 = min(len(F), int(round(frm + count)))
        goal_seen = any(f['ph'] == 'goal' for f in F[:i0])
        for i in range(i0, i1):
            t = t0 + (i - frm) / FPS * slow
            for c in F[i].get('cu', []):
                self.events.append([round(t, 4), 'sfx', *c])
            if crowd and i % 3 == 0:
                bx = F[i]['b'][0]
                near = min(bx, 105 - bx) / 52.5
                lvl = 1 if F[i]['ph'] == 'goal' else min(1, 0.3 + (1 - near) * 0.5)
                self.events.append([round(t, 4), 'setCrowd', round(lvl, 3)])
            if F[i]['ph'] == 'goal' and not goal_seen:
                goal_seen = True
                self.events.append([round(t, 4), 'chant', 'goal', 1])

    # ---------------------------------------------------------------- output
    def render(self):
        # picture
        lst = os.path.join(self.dir, 'list.txt')
        with open(lst, 'w') as f:
            for s in self.segs:
                f.write(f"file '{os.path.abspath(s)}'\n")
        joined = os.path.join(self.dir, 'joined.mp4')
        ff('-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', joined)
        dur = self.t
        args = ['-i', joined]
        fc = []
        last = '[0:v]'
        for k, (png, a, b) in enumerate(self.over):
            args += ['-loop', '1', '-framerate', str(FPS), '-t', f'{dur:.3f}', '-i', png]
            nxt = f'[o{k}]'
            fc.append(f"{last}[{k + 1}:v]overlay=0:0:enable='between(t,{a:.3f},{b - 0.001:.3f})'{nxt}")
            last = nxt
        video = os.path.join(self.dir, 'video.mp4')
        if fc:
            ff(*args, '-filter_complex', ';'.join(fc), '-map', last, '-t', f'{dur:.3f}', *MID, video)
        else:
            video = joined
        # sound: the game's synthesis offline, then the commentary on top
        tl = os.path.join(self.dir, 'timeline.json')
        json.dump({'dur': dur + 0.5, 'events': sorted(self.events, key=lambda e: e[0])}, open(tl, 'w'))
        game = os.path.join(self.dir, 'game.wav')
        node('tools/tiktok/sound.mjs', f'{tl}:{game}')
        a_in = ['-i', game]
        fc = ['[0:a]volume=1.0[g]']
        mix = ['[g]']
        for k, (t, clip, g) in enumerate(self.voices):
            a_in += ['-i', os.path.join(VOICE, clip)]
            ms = int(t * 1000)
            fc.append(f'[{k + 1}:a]aresample=48000,pan=stereo|c0=c0|c1=c0,volume={g * 1.6},adelay={ms}|{ms}[v{k}]')
            mix.append(f'[v{k}]')
        fc.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0,atrim=0:{dur:.3f},afade=t=out:st={max(0, dur - 0.6):.3f}:d=0.6,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
        audio = os.path.join(self.dir, 'audio.wav')
        ff(*a_in, '-filter_complex', ';'.join(fc), '-map', '[a]', '-ar', '48000', '-ac', '2', audio)
        # two-pass to a bitrate that lands under the cap
        a_kbps = 128
        v_kbps = int(MAX_BYTES * 8 / 1000 / dur - a_kbps - 40)
        out = os.path.join(OUT, f'{self.name}.mp4')
        log = os.path.join(self.dir, 'x264')
        common = ['-i', video, '-c:v', 'libx264', '-preset', 'slow', '-b:v', f'{v_kbps}k', '-maxrate', f'{int(v_kbps * 1.6)}k', '-bufsize', f'{v_kbps * 2}k',
                  '-pix_fmt', 'yuv420p', '-r', str(FPS), '-profile:v', 'high', '-passlogfile', log]
        ff(*common, '-pass', '1', '-an', '-f', 'mp4', os.devnull)
        ff(*common[:2], '-i', audio, *common[2:], '-pass', '2', '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', f'{a_kbps}k',
           '-shortest', '-movflags', '+faststart', out)
        size = os.path.getsize(out)
        print(f'✔ {out}: {dur:.1f} s, {size / 1024 / 1024:.2f} MB ({v_kbps} kbps video)')
        assert size < 9_000_000, 'over the 9 MB cap'
        return out


def end_card(c, frames=66):
    """The last two seconds: where to play."""
    c.still(os.path.join(W, 'text', 'end.png'), frames)
    c.events.append([c.t - frames / FPS, 'setCrowd', 0.25])


CLIPS = {}


def clip(fn):
    CLIPS[fn.__name__] = fn
    return fn


if __name__ == '__main__':
    import clips  # noqa: F401  (the clips register themselves — on the imported `cut`, not on this __main__)
    import cut
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    for name, fn in cut.CLIPS.items():
        if which in ('all', name):
            fn()
