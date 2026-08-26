"""Grade an engine frame into the menu key art."""
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageChops
import sys, math

src = Image.open(sys.argv[1]).convert('RGB')
OUTW, OUTH = 2560, 1440

# crop: keep the low sweep of the circle and the lit stand, drop dead turf
w, h = src.size
cx0, cy0, cw, ch = w * 0.02, h * 0.06, w * 0.96, h * 0.96 * (OUTH / OUTW) / (h / w) * (h / w)
# tighter crop: the near player and the ball carry the frame, so give them
# more of it and cut the empty turf along the bottom edge
im = src.crop((int(w * 0.10), int(h * 0.06), int(w * 0.92), int(h * 0.92)))
im = im.resize((OUTW, OUTH), Image.LANCZOS)

# night grade: pull the mid greens down, cool the shadows, keep the lights hot
im = ImageEnhance.Color(im).enhance(1.02)
im = ImageEnhance.Contrast(im).enhance(1.20)
im = ImageEnhance.Brightness(im).enhance(0.86)
r, g, b = im.split()
r = r.point(lambda v: int(v * 0.90))
g = g.point(lambda v: min(255, int(v * 1.03)))
b = b.point(lambda v: int(v * 0.94 + 10))
im = Image.merge('RGB', (r, g, b))

# bloom: screened, not blended — blending the blur over the whole frame lifts
# the blacks and the grass goes milky. Screen only adds light where light is.
hi = im.point(lambda v: 0 if v < 200 else int((v - 200) * 2.2))
hi = hi.filter(ImageFilter.GaussianBlur(30))
im = ImageChops.screen(im, hi)

d = ImageDraw.Draw(im, 'RGBA')

# brand streaks — the same diagonals the app draws on its tiles, kept sparse
fx = Image.new('RGBA', (OUTW, OUTH), (0, 0, 0, 0))
fd = ImageDraw.Draw(fx)
for x, wd, a in [(0.06, 6, 150), (0.10, 20, 58), (0.88, 7, 165), (0.93, 24, 62), (0.40, 3, 70)]:
    ax = OUTW * x
    fd.polygon([(ax, -100), (ax + wd, -100), (ax + wd + OUTH * 0.62, OUTH + 100),
                (ax + OUTH * 0.62, OUTH + 100)], fill=(96, 240, 152, a))
fx = fx.filter(ImageFilter.GaussianBlur(9))
im = Image.alpha_composite(im.convert('RGBA'), fx).convert('RGB')

# scrims: dark at the top for the title, dark at the bottom for the tiles
scrim = Image.new('RGBA', (OUTW, OUTH), (0, 0, 0, 0))
sd = ImageDraw.Draw(scrim)
for i in range(OUTH):
    t = i / OUTH
    # the menu puts its tiles across the middle and its small print along the
    # bottom, so the lower half is scrimmed hard: art the UI cannot sit on is
    # not art, it is noise
    a = int(180 * max(0.0, (0.22 - t) / 0.22) ** 1.25 + 225 * max(0.0, (t - 0.34) / 0.66) ** 1.35)
    sd.line([(0, i), (OUTW, i)], fill=(4, 7, 12, min(a, 232)))
im = Image.alpha_composite(im.convert('RGBA'), scrim).convert('RGB')

# vignette
vig = Image.new('L', (OUTW, OUTH), 0)
ImageDraw.Draw(vig).ellipse([-OUTW * 0.22, -OUTH * 0.38, OUTW * 1.22, OUTH * 1.42], fill=255)
vig = vig.filter(ImageFilter.GaussianBlur(240))
im = Image.composite(im, Image.new('RGB', (OUTW, OUTH), (3, 5, 11)), vig)

# grain, so a 2560-wide gradient does not band
grain = Image.effect_noise((OUTW, OUTH), 12).convert('L').point(lambda v: 128 + (v - 128) * 0.3)
im = Image.blend(im, Image.merge('RGB', (grain, grain, grain)), 0.035)

out = sys.argv[2] if len(sys.argv) > 2 else '/home/user/fc27/assets/keyart.jpg'
im.save(out, 'JPEG', quality=87, optimize=True, progressive=True)
print('wrote', out, im.size)
