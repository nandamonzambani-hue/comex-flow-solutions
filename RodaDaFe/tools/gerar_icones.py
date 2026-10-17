"""Gera os ícones do app (roda colorida com cruz dourada). Rode: python3 tools/gerar_icones.py"""
import math
from PIL import Image, ImageDraw

CORES = ["2f6fb5", "a3243b", "d99a1e", "3c8c4a", "b2652a", "6b4aa8", "f2c94c"]
NOITE = (33, 20, 47, 255)
OURO = (242, 201, 76, 255)


def roda(size, fundo=True, margem=0.08):
    img = Image.new("RGBA", (size, size), NOITE if fundo else (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = size / 2
    r = size * (0.5 - margem)
    d.ellipse([c - r - size * 0.02, c - r - size * 0.02, c + r + size * 0.02, c + r + size * 0.02], fill=OURO)
    n = len(CORES)
    for i, cor in enumerate(CORES):
        a0 = -90 + i * 360 / n
        d.pieslice([c - r, c - r, c + r, c + r], a0, a0 + 360 / n, fill="#" + cor)
        a = math.radians(a0)
        d.line([c, c, c + r * math.cos(a), c + r * math.sin(a)], fill=(255, 255, 255, 230), width=max(2, size // 90))
    rc = r * 0.34
    d.ellipse([c - rc, c - rc, c + rc, c + rc], fill=NOITE)
    w, h = rc * 0.32, rc * 1.4
    d.rectangle([c - w / 2, c - h / 2, c + w / 2, c + h / 2], fill=OURO)
    d.rectangle([c - h * 0.36, c - h * 0.22, c + h * 0.36, c - h * 0.22 + w], fill=OURO)
    return img


roda(512).save("assets/store/app_icon_512.png")
roda(192).save("assets/store/icon_192.png")
roda(432, fundo=False, margem=0.2).save("assets/store/adaptive_fg.png")
Image.new("RGBA", (432, 432), NOITE).save("assets/store/adaptive_bg.png")
print("ícones gerados em assets/store/")
