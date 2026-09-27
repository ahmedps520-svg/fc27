"""
The six clips of TikTok batch 1 (tools/tiktok). cut.py runs them:
    python3 tools/tiktok/cut.py <name|all>
Frame numbers are the recorded scenes' (scenes.mjs, 30 per second); the
renders are film.mjs's (lists: shotsA.json / shotsB.json).
"""
import json, os
from cut import Clip, clip, end_card, W, FPS, GRADE

T = os.path.join(W, 'text')
SC = lambda n: os.path.join(W, 'scenes', f'{n}.json')


def txt(name):
    return os.path.join(T, f'{name}.png')


def goal(c, follow, net, scene, f_from, n_from, line, t_line=0.25, follow_frames=None, net_frames=None, slow=1):
    """A goal: the approach and the strike from behind the play, then a hard cut to behind the net as it bulges."""
    c.footage(follow, frames=follow_frames, scene=SC(scene), scene_from=f_from, slow=slow)
    t = c.footage(net, frames=net_frames, scene=SC(scene), scene_from=n_from, crowd=False)
    c.voice(t + t_line, line)


@clip
def best_goals():
    c = Clip('1-best-goals')
    goal(c, 'g1-follow', 'g1-net', '137-longshot-m14', 160, 187, 'pbp-goal-6.mp3')          # a rocket, into the top half
    goal(c, 'g2-follow', 'g2-net', '195-header-m22', 150, 188, 'pbp-goal-2.mp3')            # cross, header
    goal(c, 'g3-follow', 'g3-net', '121-longshot-m12', 165, 188, 'pbp-goal-0.mp3')          # free kick, top corner
    goal(c, 'g4-high', 'g4-net', '235-longshot-m26', 160, 189, 'pbp-goal-4.mp3')            # 29 metres, along the ground
    # the last one in slow motion from behind the scorer, then the net, then him
    c.footage('w-strike', scene=SC('059-longshot-m6'), scene_from=176, slow=3)
    t = c.footage('g5-net', scene=SC('059-longshot-m6'), scene_from=188, crowd=False)
    c.voice(t + 0.25, 'pbp-goal-7.mp3')
    c.footage('w-celeb', frames=48, scene=SC('059-longshot-m6'), scene_from=235)
    c.overlay(txt('hook1'), 0, 3.2)
    end_card(c)
    c.render()


@clip
def broke_it():
    c = Clip('3-broke-it')
    for shot, scene, frm, lab in [('x-swarm', '037-goal-m4', 100, 'swarm'), ('x-spin', '121-longshot-m12', 100, 'spin'),
                                  ('x-moonwalk', '119-longshot-m12', 100, 'moonwalk'), ('x-moon', '195-header-m22', 140, 'moon'),
                                  ('x-dive', '149-goal-m16', 110, 'dive')]:
        t = c.footage(shot, start=6, frames=78, scene=SC(scene), scene_from=frm)
        c.overlay(txt(f'lab-{lab}'), t, t + 78 / FPS)
    c.overlay(txt('hook3'), 0, c.t)
    end_card(c)
    c.render()


@clip
def worldie_loop():
    """Starts on the strike, ends on the frame before it: played on repeat it never stops."""
    c = Clip('4-worldie-loop')
    s = SC('059-longshot-m6')
    c.footage('w-strike', scene=s, scene_from=176, slow=3)
    # the net from beside the post, a third speed, the in-between frames interpolated
    d = os.path.join(W, 'render', 'g5-net')
    t = c._seg(['-framerate', str(FPS), '-i', os.path.join(d, 'f%04d.jpg')],
               'scale=1080:1920:flags=lanczos,' + GRADE + ',minterpolate=fps=90:mi_mode=mci:mc_mode=aobmc:vsbmc=1,setpts=3*PTS,fps=30', 114)
    c.scene_sound(s, 188, 38, t, slow=3, crowd=False)
    c.voice(t + 0.6, 'pbp-goal-6.mp3')
    c.footage('w-post', scene=s, scene_from=192, slow=3, crowd=False)
    # the scorer, at half speed (each recorded frame twice)
    d = os.path.join(W, 'render', 'w-celeb')
    t = c._seg(['-framerate', str(FPS), '-i', os.path.join(d, 'f%04d.jpg')], 'scale=1080:1920:flags=lanczos,' + GRADE + ',setpts=2.4*PTS,fps=30', 120)
    c.scene_sound(s, 235, 50, t, slow=2.4)
    # the run-up, in real time, into the strike the clip opens on
    t = c.footage('w-build', scene=s, scene_from=56)
    c.overlay(txt('hook4'), 0, 3.0)
    c.overlay(txt('foot4'), t, c.t)
    c.render()


@clip
def pack_opening():
    """The Legends Vault, then the Gold pack, each from the tap to the card: the hold on the first card is cut."""
    c = Clip('5-pack-opening')
    d = os.path.join(W, 'pack2', 'frames')
    log = json.load(open(os.path.join(d, 'sfx.json')))
    c.events = []                                        # a menu has no crowd
    for a, b in [(26, 205), (212, log['frames'])]:
        t = c.frames(d, a, b - a)
        for tt, kind, *args in log['log']:
            if a / FPS <= tt < b / FPS:
                c.events.append([round(t + tt - a / FPS, 4), kind, *args])
    c.overlay(txt('hook5'), 0, 3.0)
    end_card(c)
    c.events = [e for e in c.events if e[1] not in ('setCrowd', 'startCrowd')]
    c.render()


@clip
def watch_app():
    c = Clip('6-watch-app')
    wd = os.path.join(W, 'watch', 'frames')
    ranges = json.load(open(os.path.join(W, 'watch-cut.json')))      # [[first, count], ...] of the kept watch frames
    total = sum(n for _, n in ranges)
    # the phone: the 3D game, the same length as the watch's part
    phone = os.path.join(c.dir, 'phone.mp4')
    shots = [('g2-follow', 0, 50, '195-header-m22', 150), ('g2-net', 0, 34, '195-header-m22', 188),
             ('g3-follow', 0, 36, '121-longshot-m12', 165), ('g3-net', 0, 37, '121-longshot-m12', 188),
             ('g1-follow', 0, 41, '137-longshot-m14', 160), ('g1-net', 0, 38, '137-longshot-m14', 187),
             ('g4-high', 0, 43, '235-longshot-m26', 160), ('g4-net', 0, 33, '235-longshot-m26', 189)]
    from cut import ff, MID
    parts = []
    t = 0.0
    for shot, a, n, scene, frm in shots:
        if t * FPS >= total:
            break
        n = min(n, total - int(round(t * FPS)))
        p = os.path.join(c.dir, f'ph{len(parts)}.mp4')
        ff('-start_number', str(a), '-framerate', str(FPS), '-i', os.path.join(W, 'render', shot, 'f%04d.jpg'),
           '-vf', 'scale=682:1212,crop=560:1212,eq=contrast=1.06:saturation=1.12', '-frames:v', str(n), *MID, p)
        parts.append(p)
        c.scene_sound(SC(scene), frm + a, n, t)
        t += n / FPS
    lst = os.path.join(c.dir, 'phone.txt')
    open(lst, 'w').write(''.join(f"file '{os.path.abspath(p)}'\n" for p in parts))
    ff('-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', phone)
    # the watch: its kept stretches, back to back
    wparts = []
    for k, (a, n) in enumerate(ranges):
        p = os.path.join(c.dir, f'w{k}.mp4')
        ff('-start_number', str(a), '-framerate', str(FPS), '-i', os.path.join(wd, 'f%04d.jpg'), '-vf', 'scale=330:404:flags=lanczos', '-frames:v', str(n), *MID, p)
        wparts.append(p)
    wl = os.path.join(c.dir, 'watch.txt')
    open(wl, 'w').write(''.join(f"file '{os.path.abspath(p)}'\n" for p in wparts))
    watch = os.path.join(c.dir, 'watch.mp4')
    ff('-f', 'concat', '-safe', '0', '-i', wl, '-c', 'copy', watch)
    # both on the desk
    comp = os.path.join(c.dir, 'comp.mp4')
    ff('-loop', '1', '-framerate', str(FPS), '-i', txt('bg6'), '-i', phone, '-i', watch, '-loop', '1', '-framerate', str(FPS), '-i', txt('devices6'),
       '-filter_complex', '[0][1]overlay=90:470:shortest=1[a];[a][2]overlay=660:1060[b];[b][3]overlay=0:0[v]', '-map', '[v]', '-frames:v', str(total), *MID, comp)
    c.segs.append(comp)
    c.t = total / FPS
    c.overlay(txt('hook6'), 0, c.t)
    end_card(c, 84)
    c.render()


@clip
def before_after():
    """The first build in the history (v27) against today's (v136), hard cuts. v27 was landscape only:
    on a phone held upright it asked you to turn it round, so that is what its phone shot is, and its
    match is shown the way it played, 16:9 in the middle of the frame."""
    c = Clip('2-before-after')
    B = os.path.join(W, 'before')
    cues = json.load(open(os.path.join(B, 'cues.json')))
    # v27's footage: letterboxed over a blurred, darkened copy of itself
    box = ('split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:4,eq=brightness=-0.18[bg];'
           '[b]scale=1080:608:flags=lanczos[fg];[bg][fg]overlay=0:656')
    def before(a, n):
        t = c.frames(B, a, n, vf=box)
        c.overlay(txt('lab-before'), t, t + n / FPS)
        for tt, kind, *args in cues:
            if a / FPS <= tt < (a + n) / FPS:
                c.events.append([round(t + tt - a / FPS, 4), kind, *args])
    def now(shot, scene, frm, n, start=0, crowd=True):
        t = c.footage(shot, start=start, frames=n, scene=SC(scene), scene_from=frm, crowd=crowd)
        c.overlay(txt('lab-now'), t, t + n / FPS)
        return t
    # the phone: turn it round / the menu, upright
    t = c.still(os.path.join(W, 'menu-v27.jpg'), 45, vf='scale=1080:1920')
    c.overlay(txt('lab-before'), t, t + 45 / FPS)
    t = c.still(os.path.join(W, 'menu-v136.jpg'), 45, vf='scale=1080:-2,crop=1080:1920:0:0')
    c.overlay(txt('lab-now'), t, t + 45 / FPS)
    # the match
    before(72, 60)
    now('g2-follow', '195-header-m22', 150, 50)
    before(135, 60)
    now('g3-follow', '121-longshot-m12', 165, 36)
    t = now('g3-net', '121-longshot-m12', 188, 37, crowd=False)
    c.voice(t + 0.2, 'pbp-goal-0.mp3')
    before(198, 70)
    now('g4-high', '235-longshot-m26', 160, 43)
    t = now('g4-net', '235-longshot-m26', 189, 33, crowd=False)
    c.voice(t + 0.2, 'pbp-goal-6.mp3')
    c.overlay(txt('hook2'), 0, 3.0)
    end_card(c)
    c.render()
