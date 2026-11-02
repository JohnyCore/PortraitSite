# one-off: build the 1200x630 link-preview card -> public/og.png
# rerun after editing the copy below:  python make_og.py
import random
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
INK = (5, 5, 5)
BONE = (232, 226, 214)
EMBER = (255, 122, 60)
GLYPHS = "01<>/\\{}[]#*+~"
BOLD = r"C:\Windows\Fonts\consolab.ttf"
REG = r"C:\Windows\Fonts\consola.ttf"

img = Image.new("RGB", (W, H), INK)
d = ImageDraw.Draw(img)

# glyph dust — right third plus a bottom strip, kept off the copy
g = ImageFont.truetype(REG, 22)
random.seed(7)
for _ in range(110):
    x = random.randint(560, W - 40)
    y = random.randint(40, H - 40)
    d.text((x, y), random.choice(GLYPHS), font=g, fill=(44, 42, 38))
for _ in range(30):
    x = random.randint(60, 520)
    y = random.randint(578, H - 40)
    d.text((x, y), random.choice(GLYPHS), font=g, fill=(34, 33, 30))

# fog blobs
fog = Image.new("L", (W, H), 0)
fd = ImageDraw.Draw(fog)
fd.ellipse((80, 120, 700, 520), fill=60)
fd.ellipse((600, 260, 1180, 660), fill=45)
fog = fog.filter(__import__("PIL.ImageFilter", fromlist=["GaussianBlur"]).GaussianBlur(90))
img = Image.composite(Image.new("RGB", (W, H), (210, 205, 195)), img, fog.point(lambda v: v // 3))
d = ImageDraw.Draw(img)

# ember signal bar
d.rectangle((0, 0, W, 5), fill=EMBER)

# dim monogram filling the right side
d.text((690, 250), "JC", font=ImageFont.truetype(BOLD, 230), fill=(30, 29, 27))

# copy
d.text((90, 150), "WHO ARE YOU?", font=ImageFont.truetype(REG, 34), fill=EMBER)
d.text((86, 200), "JOHNNY CORE", font=ImageFont.truetype(BOLD, 108), fill=BONE)
d.text((90, 340), "computer engineering student, iran.", font=ImageFont.truetype(REG, 30), fill=(150, 145, 137))
d.text((90, 384), "python / javascript / c++", font=ImageFont.truetype(REG, 30), fill=(150, 145, 137))
d.text((90, 500), "github.com/JohnyCore", font=ImageFont.truetype(REG, 26), fill=(120, 116, 110))
d.text((90, 536), "t.me/Johny_Core   instagram.com/johny._.core", font=ImageFont.truetype(REG, 26), fill=(120, 116, 110))

img.save("public/og.png")
print("public/og.png", img.size)