#!/usr/bin/env python3
"""Gera a arte provisória do jogo (SVG), 100% original e livre para uso no projeto.

Uso, a partir da pasta CaminhosDaFe:
    python3 tools/gerar_arte.py

Substitua os arquivos em assets/ por ilustrações definitivas quando tiver. Mantendo
os mesmos nomes, o jogo usa a arte nova sem mudar nenhuma linha de código.
"""
from pathlib import Path
import math
import random

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"

PAPER = "#fbf5e6"
INK = "#3a2e28"
BLUE = "#2e4f8f"
GOLD = "#d9a03a"


def svg(w, h, body, scale=2, view=None):
    vb = view or f"0 0 {w} {h}"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w*scale}" height="{h*scale}" '
            f'viewBox="{vb}">\n{body}\n</svg>\n')


def write(rel, content):
    path = ASSETS / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print("  ", path.relative_to(ROOT))


# ---------------------------------------------------------------- cenário

def tree(x, y, s=1.0, apples=False, tone="#6f9a4f"):
    trunk = f'<rect x="{x-5*s:.1f}" y="{y-6*s:.1f}" width="{10*s:.1f}" height="{30*s:.1f}" rx="{3*s:.1f}" fill="#8a5d3b"/>'
    crown = (f'<circle cx="{x:.1f}" cy="{y-24*s:.1f}" r="{26*s:.1f}" fill="{tone}"/>'
             f'<circle cx="{x-16*s:.1f}" cy="{y-12*s:.1f}" r="{18*s:.1f}" fill="{tone}"/>'
             f'<circle cx="{x+17*s:.1f}" cy="{y-13*s:.1f}" r="{18*s:.1f}" fill="{tone}"/>'
             f'<circle cx="{x-6*s:.1f}" cy="{y-34*s:.1f}" r="{12*s:.1f}" fill="#ffffff" opacity="0.12"/>')
    fruit = ""
    if apples:
        rnd = random.Random(int(x * 7 + y))
        for _ in range(6):
            ax = x + rnd.uniform(-26, 26) * s
            ay = y - 20 * s + rnd.uniform(-18, 14) * s
            fruit += f'<circle cx="{ax:.1f}" cy="{ay:.1f}" r="{4.2*s:.1f}" fill="#c8453b"/>'
    return f'<g>{trunk}{crown}{fruit}</g>'


def house(x, y, w, h, wall, roof, door="#7a4e32", damaged=False, chimney=False, windows=1):
    rx = x - w / 2
    parts = []
    if chimney:
        parts.append(f'<rect x="{rx + w*0.68:.1f}" y="{y - h - w*0.42:.1f}" width="{w*0.12:.1f}" height="{w*0.32:.1f}" fill="#9a6a52"/>')
        parts.append(f'<circle cx="{rx + w*0.74:.1f}" cy="{y - h - w*0.5:.1f}" r="7" fill="#ffffff" opacity="0.55"/>')
        parts.append(f'<circle cx="{rx + w*0.8:.1f}" cy="{y - h - w*0.62:.1f}" r="9" fill="#ffffff" opacity="0.4"/>')
    parts.append(f'<rect x="{rx:.1f}" y="{y-h:.1f}" width="{w}" height="{h}" fill="{wall}"/>')
    parts.append(f'<path d="M{rx-10:.1f},{y-h:.1f} L{x:.1f},{y-h-w*0.42:.1f} L{rx+w+10:.1f},{y-h:.1f} Z" fill="{roof}"/>')
    if damaged:
        parts.append(f'<path d="M{x+4:.1f},{y-h-w*0.3:.1f} l18,8 l-6,14 l-16,-4 Z" fill="#4a3a33"/>')
        parts.append(f'<path d="M{x-30:.1f},{y-h-w*0.12:.1f} l14,3 l-4,9 l-13,-2 Z" fill="#4a3a33"/>')
    dw = w * 0.2
    parts.append(f'<path d="M{x-dw/2:.1f},{y:.1f} v-{h*0.5:.1f} a{dw/2:.1f},{dw/2:.1f} 0 0 1 {dw:.1f},0 v{h*0.5:.1f} Z" fill="{door}"/>')
    for i in range(windows):
        wx = rx + w * (0.12 if i == 0 else 0.68)
        parts.append(f'<rect x="{wx:.1f}" y="{y-h*0.72:.1f}" width="{w*0.2:.1f}" height="{h*0.3:.1f}" rx="3" fill="#f6dfa0" stroke="#7a4e32" stroke-width="3"/>')
    return "<g>" + "".join(parts) + "</g>"


def chapel(x, y):
    w, h = 130, 96
    rx = x - w / 2
    p = []
    # torre
    p.append(f'<rect x="{x-22}" y="{y-h-92}" width="44" height="92" fill="#f4ede0"/>')
    p.append(f'<path d="M{x-30},{y-h-92} L{x},{y-h-132} L{x+30},{y-h-92} Z" fill="#a4553f"/>')
    p.append(f'<path d="M{x-11},{y-h-60} a11,11 0 0 1 22,0 v16 h-22 Z" fill="#5b4334"/>')
    p.append(f'<circle cx="{x}" cy="{y-h-52}" r="5" fill="{GOLD}"/>')
    # cruz discreta no alto da torre
    p.append(f'<rect x="{x-2.5}" y="{y-h-158}" width="5" height="28" rx="1.5" fill="{GOLD}"/>')
    p.append(f'<rect x="{x-10}" y="{y-h-150}" width="20" height="5" rx="1.5" fill="{GOLD}"/>')
    # nave
    p.append(f'<rect x="{rx}" y="{y-h}" width="{w}" height="{h}" fill="#f8f2e6"/>')
    p.append(f'<path d="M{rx-10},{y-h} L{x},{y-h-46} L{rx+w+10},{y-h} Z" fill="#b5604a"/>')
    p.append(f'<path d="M{x-16},{y} v-40 a16,16 0 0 1 32,0 v40 Z" fill="#6d4a35"/>')
    p.append(f'<circle cx="{x}" cy="{y-h+24}" r="11" fill="#f3d27a" stroke="#a4553f" stroke-width="3"/>')
    for wx in (rx + 14, rx + w - 34):
        p.append(f'<path d="M{wx},{y-22} v-30 a10,10 0 0 1 20,0 v30 Z" fill="#9cc3d8" stroke="#8a6a4f" stroke-width="2.5"/>')
    return "<g>" + "".join(p) + "</g>"


def well(x, y):
    return (f'<g><ellipse cx="{x}" cy="{y+10}" rx="40" ry="14" fill="#000" opacity="0.08"/>'
            f'<rect x="{x-34}" y="{y-24}" width="68" height="34" rx="8" fill="#b9a891"/>'
            f'<path d="M{x-34},{y-10} h68 M{x-34},{y+2} h68" stroke="#9c8c76" stroke-width="2"/>'
            f'<rect x="{x-30}" y="{y-70}" width="6" height="48" fill="#7a4e32"/>'
            f'<rect x="{x+24}" y="{y-70}" width="6" height="48" fill="#7a4e32"/>'
            f'<path d="M{x-44},{y-66} L{x},{y-92} L{x+44},{y-66} Z" fill="#a4553f"/>'
            f'<rect x="{x-4}" y="{y-58}" width="8" height="12" fill="#5b4334"/></g>')


def bunting(x1, y1, x2, y2, sag=26):
    colors = [GOLD, "#ffffff", BLUE, "#c8453b", "#6f9a4f"]
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + sag
    out = [f'<path d="M{x1},{y1} Q{mx},{my+sag/2} {x2},{y2}" fill="none" stroke="#7a6a5c" stroke-width="2"/>']
    n = 9
    for i in range(1, n):
        t = i / n
        px = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t ** 2 * x2
        py = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * (my + sag / 2) + t ** 2 * y2
        out.append(f'<path d="M{px-8:.1f},{py:.1f} h16 l-8,16 Z" fill="{colors[i % len(colors)]}"/>')
    return "".join(out)


def garden(x, y):
    p = []
    for r in range(3):
        for c in range(3):
            bx, by = x - 84 + c * 58, y - 54 + r * 40
            p.append(f'<rect x="{bx}" y="{by}" width="50" height="30" rx="6" fill="#9a6b45"/>')
            for k in range(3):
                p.append(f'<circle cx="{bx+11+k*14}" cy="{by+14}" r="6.5" fill="#7fb05a"/>')
    p.append(f'<path d="M{x-110},{y+36} C{x-40},{y+50} {x+40},{y+20} {x+110},{y+40}" stroke="#7fb6d6" stroke-width="9" fill="none" stroke-linecap="round"/>')
    return "<g>" + "".join(p) + "</g>"


def background():
    W, H = 720, 1280
    rnd = random.Random(7)
    b = []
    b.append('<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">'
             '<stop offset="0" stop-color="#f3d39c"/><stop offset="0.6" stop-color="#fbeed3"/>'
             '<stop offset="1" stop-color="#fbf5e6"/></linearGradient>'
             '<radialGradient id="sun"><stop offset="0" stop-color="#fff3c9"/>'
             '<stop offset="1" stop-color="#fff3c9" stop-opacity="0"/></radialGradient></defs>')
    b.append(f'<rect width="{W}" height="{H}" fill="url(#sky)"/>')
    b.append('<circle cx="580" cy="130" r="130" fill="url(#sun)"/><circle cx="580" cy="130" r="46" fill="#ffe7a3"/>')
    b.append('<path d="M0,330 C120,250 230,300 330,262 C450,215 560,280 720,240 V420 H0 Z" fill="#b9cf9a"/>')
    b.append('<path d="M0,372 C150,320 260,350 360,330 C480,300 600,350 720,318 V1280 H0 Z" fill="#a6c47e"/>')
    # textura do campo
    for _ in range(70):
        x, y = rnd.uniform(0, W), rnd.uniform(400, H)
        b.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{rnd.uniform(18,46):.0f}" ry="{rnd.uniform(5,11):.0f}" fill="#bcd595" opacity="0.55"/>')
    # riacho à direita
    b.append('<path d="M760,760 C690,820 700,900 650,980 C610,1040 640,1140 600,1300" stroke="#8fc1db" stroke-width="34" fill="none" stroke-linecap="round"/>')
    b.append('<path d="M760,760 C690,820 700,900 650,980 C610,1040 640,1140 600,1300" stroke="#bfe0ee" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.8"/>')
    # caminhos
    path = "#ead6a9"
    for d in ["M360,1300 C350,1150 380,900 360,720",
              "M360,720 C330,640 220,640 194,570",
              "M360,720 C400,640 520,620 547,545",
              "M360,720 C310,780 220,800 194,870",
              "M360,720 C420,790 500,820 533,880",
              "M360,720 C360,600 340,480 360,325",
              "M360,330 C420,300 470,280 504,236"]:
        b.append(f'<path d="{d}" stroke="{path}" stroke-width="30" fill="none" stroke-linecap="round"/>')
    # praça
    b.append('<ellipse cx="360" cy="722" rx="120" ry="62" fill="#e8d8b4"/>')
    b.append('<ellipse cx="360" cy="722" rx="120" ry="62" fill="none" stroke="#d8c398" stroke-width="4" stroke-dasharray="10 8"/>')
    b.append(bunting(250, 640, 470, 640))
    # árvores de fundo
    for x, y, s in [(70, 420, 0.9), (120, 470, 0.8), (640, 420, 0.85), (40, 700, 1.0), (680, 640, 0.9),
                    (90, 1040, 1.1), (300, 1120, 0.9), (440, 1170, 0.8), (690, 1190, 0.9), (60, 1220, 0.9)]:
        b.append(tree(x, y, s, tone=rnd.choice(["#6f9a4f", "#628c45", "#7aa55a"])))
    b.append(chapel(360, 330))
    b.append(house(504, 240, 74, 54, "#f4e6c8", "#9d5a44", windows=1))
    b.append(house(194, 572, 118, 82, "#f1dcb6", "#b5604a", damaged=True, chimney=True, windows=2))
    for x, y in [(512, 520), (566, 506), (538, 556), (592, 548)]:
        b.append(tree(x, y, 0.85, apples=True, tone="#5f8d43"))
    b.append(well(360, 728))
    b.append(house(194, 880, 150, 92, "#efe0c4", "#9d5a44", windows=2))
    b.append(garden(533, 900))
    # cerca e flores
    for x in range(20, 700, 34):
        b.append(f'<rect x="{x}" y="1236" width="8" height="36" rx="2" fill="#c2a27c"/>')
    b.append('<rect x="0" y="1248" width="720" height="6" fill="#c2a27c"/><rect x="0" y="1262" width="720" height="6" fill="#c2a27c"/>')
    for _ in range(40):
        x, y = rnd.uniform(10, 710), rnd.uniform(980, 1230)
        c = rnd.choice(["#f2c14e", "#ffffff", "#e8879a", "#b9a0e0"])
        b.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rnd.uniform(3,5):.1f}" fill="{c}"/>')
    write("backgrounds/vila_vale_sereno.svg", svg(W, H, "\n".join(b)))


def world_map():
    W, H = 720, 1280
    rnd = random.Random(3)
    b = [f'<rect width="{W}" height="{H}" fill="#f6ecd2"/>']
    for _ in range(26):
        x, y = rnd.uniform(0, W), rnd.uniform(0, H)
        b.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rnd.uniform(40,110):.0f}" fill="#efe1bf" opacity="0.6"/>')
    b.append('<path d="M-20,1010 C150,960 260,1040 420,990 C560,946 640,990 760,960 V1300 H-20 Z" fill="#cfe0b0"/>')
    b.append('<path d="M-20,260 C120,300 200,220 330,250 C470,282 560,210 760,250 V-20 H-20 Z" fill="#d7e6ee"/>')
    for x, y in [(110, 380), (600, 300), (90, 700), (630, 860), (520, 1120)]:
        b.append(f'<path d="M{x-46},{y+20} L{x},{y-40} L{x+46},{y+20} Z" fill="#c9b48c"/><path d="M{x-14},{y-22} L{x},{y-40} L{x+14},{y-22} Z" fill="#fbf5e6"/>')
    b.append('<path d="M216,998 C300,920 470,840 490,718 C510,600 300,560 259,435" stroke="#b08a55" stroke-width="7" fill="none" stroke-dasharray="4 16" stroke-linecap="round"/>')
    b.append('<rect x="18" y="18" width="684" height="1244" rx="26" fill="none" stroke="#c9ad7a" stroke-width="4"/>')
    b.append('<rect x="30" y="30" width="660" height="1220" rx="20" fill="none" stroke="#e1cfa6" stroke-width="2"/>')
    # rosa dos ventos
    cx, cy = 600, 1150
    b.append(f'<circle cx="{cx}" cy="{cy}" r="44" fill="none" stroke="#b08a55" stroke-width="2"/>')
    b.append(f'<path d="M{cx},{cy-52} L{cx+9},{cy} L{cx},{cy+52} L{cx-9},{cy} Z" fill="#b08a55"/>')
    b.append(f'<path d="M{cx-52},{cy} L{cx},{cy+9} L{cx+52},{cy} L{cx},{cy-9} Z" fill="#d6bd8d"/>')
    write("backgrounds/mapa.svg", svg(W, H, "\n".join(b)))


# ---------------------------------------------------------------- personagens

def portrait(name, bg, skin, hair, clothes, extra_back="", extra_front="", hair_front=None, mouth="smile"):
    b = [f'<circle cx="128" cy="128" r="124" fill="{bg}"/>',
         '<clipPath id="c"><circle cx="128" cy="128" r="124"/></clipPath><g clip-path="url(#c)">',
         extra_back,
         f'<path d="M36,262 C40,196 80,176 128,176 C176,176 216,196 220,262 Z" fill="{clothes}"/>',
         f'<rect x="112" y="150" width="32" height="34" rx="12" fill="{skin}"/>',
         f'<ellipse cx="128" cy="112" rx="52" ry="58" fill="{skin}"/>',
         f'<ellipse cx="78" cy="118" rx="9" ry="13" fill="{skin}"/><ellipse cx="178" cy="118" rx="9" ry="13" fill="{skin}"/>',
         hair_front if hair_front is not None else f'<path d="M74,104 C74,52 182,52 182,104 C170,80 140,74 128,74 C110,74 86,82 74,104 Z" fill="{hair}"/>',
         '<ellipse cx="108" cy="116" rx="6" ry="7.5" fill="#2b211c"/><ellipse cx="148" cy="116" rx="6" ry="7.5" fill="#2b211c"/>',
         '<circle cx="110" cy="113" r="2" fill="#fff"/><circle cx="150" cy="113" r="2" fill="#fff"/>',
         '<ellipse cx="96" cy="136" rx="10" ry="6" fill="#e58a7a" opacity="0.35"/><ellipse cx="160" cy="136" rx="10" ry="6" fill="#e58a7a" opacity="0.35"/>']
    if mouth == "smile":
        b.append('<path d="M112,140 Q128,154 144,140" stroke="#7a3b2e" stroke-width="4" fill="none" stroke-linecap="round"/>')
    else:
        b.append('<path d="M116,144 Q128,138 140,144" stroke="#7a3b2e" stroke-width="4" fill="none" stroke-linecap="round"/>')
    b.append(extra_front)
    b.append('</g>')
    write(f"characters/{name}.svg", svg(256, 256, "\n".join(b), scale=1))


def characters():
    portrait("marta", "#dfe8f6", "#c98e64", "#3d2a20", "#2e4f8f",
             extra_back='<circle cx="128" cy="58" r="24" fill="#3d2a20"/>',
             extra_front='<path d="M128,186 v26 M118,196 h20" stroke="#d9a03a" stroke-width="5" stroke-linecap="round"/>')
    portrait("bento", "#f6e7cf", "#f0c8a4", "#8b8178", "#f7f3ea",
             hair_front='<path d="M70,82 C70,40 186,40 186,82 L182,96 L74,96 Z" fill="#ffffff" stroke="#e2dbcf" stroke-width="3"/>'
                        '<path d="M64,92 h128 v14 h-128 Z" fill="#ffffff" stroke="#e2dbcf" stroke-width="3"/>',
             extra_front='<path d="M106,134 Q128,126 150,134 Q140,142 128,138 Q116,142 106,134 Z" fill="#8b8178"/>'
                         '<path d="M92,200 h72 v62 h-72 Z" fill="#ffffff" opacity="0.9"/>')
    portrait("lucia", "#e6efdc", "#e8b98f", "#cfcac3", "#5f8a4a",
             extra_back='<circle cx="128" cy="56" r="26" fill="#cfcac3"/>',
             extra_front='<circle cx="108" cy="116" r="14" fill="none" stroke="#6b4f3a" stroke-width="3.5"/>'
                         '<circle cx="148" cy="116" r="14" fill="none" stroke="#6b4f3a" stroke-width="3.5"/>'
                         '<path d="M122,116 h12" stroke="#6b4f3a" stroke-width="3.5"/>'
                         '<path d="M60,196 C100,230 156,230 196,196 L206,262 H50 Z" fill="#7aa05f"/>')
    portrait("tome", "#fbe9c6", "#8d5a3b", "#1f1714", "#e8b33a",
             hair_front='<g fill="#1f1714">' + "".join(
                 f'<circle cx="{80+i*16}" cy="{78 + (6 if i in (0,6) else 0)}" r="15"/>' for i in range(7)) + '</g>',
             mouth="worried")
    portrait("joaquim", "#efe6d2", "#d9a27a", "#f2efe8", "#8a6a4f",
             hair_front='<ellipse cx="128" cy="76" rx="96" ry="18" fill="#e3c27a"/>'
                        '<path d="M84,76 C88,34 168,34 172,76 Z" fill="#e8ca86"/>'
                        '<rect x="86" y="62" width="84" height="10" fill="#a4553f"/>',
             extra_front='<path d="M84,128 C88,186 168,186 172,128 C160,150 146,146 128,150 C110,146 96,150 84,128 Z" fill="#f2efe8"/>'
                         '<path d="M112,140 Q128,150 144,140" stroke="#7a3b2e" stroke-width="4" fill="none" stroke-linecap="round"/>')
    portrait("peregrino", "#f3e2c0", "#b98060", "#5a3d2b", "#c08a3e",
             extra_back='<path d="M58,170 C40,90 80,36 128,36 C176,36 216,90 198,170 Z" fill="#9a6a3a"/>',
             extra_front='<path d="M84,190 L110,262 M172,190 L146,262" stroke="#6b4a2b" stroke-width="8"/>')
    # narrador: um livro aberto
    b = ['<circle cx="128" cy="128" r="124" fill="#efe3c6"/>',
         '<path d="M48,92 C80,80 110,84 128,98 C146,84 176,80 208,92 V182 C176,170 146,174 128,188 C110,174 80,170 48,182 Z" fill="#fffaf0" stroke="#b08a55" stroke-width="5" stroke-linejoin="round"/>',
         '<path d="M128,98 V188" stroke="#b08a55" stroke-width="4"/>',
         '<path d="M66,112 h44 M66,130 h44 M66,148 h36 M146,112 h44 M146,130 h44 M146,148 h36" stroke="#d6c39c" stroke-width="5" stroke-linecap="round"/>',
         f'<path d="M150,80 v42 l9,-8 l9,8 v-42 Z" fill="{BLUE}"/>']
    write("characters/narrador.svg", svg(256, 256, "\n".join(b), scale=1))
    # personagem jogável (corpo inteiro, visto no mapa da vila)
    b = ['<ellipse cx="40" cy="116" rx="24" ry="6" fill="#000" opacity="0.15"/>',
         '<path d="M66,22 L64,116" stroke="#7a4e32" stroke-width="5" stroke-linecap="round"/>',
         '<path d="M18,112 C18,64 26,46 40,46 C54,46 62,64 62,112 Z" fill="#c08a3e"/>',
         '<path d="M22,60 C24,40 56,40 58,60 C50,54 30,54 22,60 Z" fill="#9a6a3a"/>',
         '<circle cx="40" cy="34" r="16" fill="#b98060"/>',
         '<path d="M22,34 C20,10 60,10 58,34 C54,22 26,22 22,34 Z" fill="#9a6a3a"/>',
         '<circle cx="34" cy="35" r="2.2" fill="#2b211c"/><circle cx="46" cy="35" r="2.2" fill="#2b211c"/>',
         '<path d="M35,42 Q40,46 45,42" stroke="#7a3b2e" stroke-width="2" fill="none" stroke-linecap="round"/>',
         '<rect x="12" y="62" width="12" height="30" rx="5" fill="#6b4a2b"/>']
    write("characters/jogador.svg", svg(80, 124, "\n".join(b), scale=2))


# ---------------------------------------------------------------- ícones (brancos, coloridos no jogo)

ICONS = {
    "church": '<path d="M48,8 v16 M40,15 h16"/><path d="M28,44 L48,26 L68,44"/><path d="M32,42 V86 H64 V42"/><path d="M42,86 V70 a6,6 0 0 1 12,0 V86"/>',
    "bread": '<path d="M14,58 C14,34 82,34 82,58 C82,66 76,70 70,70 H26 C20,70 14,66 14,58 Z"/><path d="M34,46 l6,12 M48,44 l6,12 M62,46 l6,12"/>',
    "apple": '<path d="M48,30 C36,20 16,26 16,50 C16,72 32,86 42,84 C46,83 50,83 54,84 C64,86 80,72 80,50 C80,26 60,20 48,30 Z"/><path d="M48,30 C48,20 52,14 58,10"/>',
    "house": '<path d="M14,46 L48,16 L82,46"/><path d="M22,40 V84 H74 V40"/><path d="M40,84 V62 H56 V84"/>',
    "sprout": '<path d="M48,86 V44"/><path d="M48,56 C48,36 30,28 16,30 C16,46 30,56 48,56 Z"/><path d="M48,46 C48,26 66,16 82,18 C82,36 66,46 48,46 Z"/>',
    "well": '<path d="M22,58 H74 V82 H22 Z"/><path d="M26,58 V30 M70,30 V58"/><path d="M16,32 L48,14 L80,32"/><path d="M48,30 V44"/>',
    "book": '<path d="M48,24 C38,16 22,16 12,20 V78 C22,74 38,74 48,82 C58,74 74,74 84,78 V20 C74,16 58,16 48,24 Z"/><path d="M48,24 V82"/>',
    "map": '<path d="M12,22 L36,14 L60,22 L84,14 V74 L60,82 L36,74 L12,82 Z"/><path d="M36,14 V74 M60,22 V82"/>',
    "star": '<path d="M48,10 L58,36 L86,38 L64,56 L72,84 L48,68 L24,84 L32,56 L10,38 L38,36 Z"/>',
    "back": '<path d="M58,18 L28,48 L58,78"/>',
    "settings": '<circle cx="48" cy="48" r="12"/><path d="M48,10 V22 M48,74 V86 M10,48 H22 M74,48 H86 M21,21 L30,30 M66,66 L75,75 M21,75 L30,66 M66,30 L75,21"/>',
    "check": '<path d="M16,50 L38,72 L80,26"/>',
    "lock": '<rect x="22" y="44" width="52" height="40" rx="8"/><path d="M32,44 V32 a16,16 0 0 1 32,0 V44"/>',
    "puzzle": '<path d="M18,30 H38 a8,8 0 1 1 16,0 H74 V50 a8,8 0 1 0 0,16 V82 H54 a8,8 0 1 0 -16,0 H18 V62 a8,8 0 1 1 0,-16 Z"/>',
    "hint": '<path d="M36,70 H60 M40,82 H56"/><path d="M48,12 C30,12 20,26 22,40 C24,52 34,56 36,66 H60 C62,56 72,52 74,40 C76,26 66,12 48,12 Z"/>',
    "blanket": '<rect x="14" y="22" width="68" height="52" rx="8"/><path d="M14,38 H82 M14,58 H82 M34,22 V74 M62,22 V74"/>',
    "soup": '<path d="M14,44 H82 C82,66 68,80 48,80 C28,80 14,66 14,44 Z"/><path d="M36,34 C32,26 40,22 36,14 M52,34 C48,26 56,22 52,14"/>',
    "wood": '<path d="M14,40 L76,22 M20,62 L82,44 M14,80 L76,62"/><circle cx="14" cy="40" r="6"/><circle cx="20" cy="62" r="6"/><circle cx="14" cy="80" r="6"/>',
    "globe": '<circle cx="48" cy="48" r="34"/><path d="M14,48 H82 M48,14 C32,30 32,66 48,82 M48,14 C64,30 64,66 48,82"/>',
    "close": '<path d="M24,24 L72,72 M72,24 L24,72"/>',
    "plus": '<path d="M48,22 V74 M22,48 H74"/>',
    "minus": '<path d="M22,48 H74"/>',
    "person": '<circle cx="48" cy="30" r="14"/><path d="M20,84 C20,60 32,50 48,50 C64,50 76,60 76,84"/>',
    "heart": '<path d="M48,80 C20,60 12,44 14,32 C16,18 34,12 48,28 C62,12 80,18 82,32 C84,44 76,60 48,80 Z"/>',
}


def icons():
    for name, body in ICONS.items():
        content = (f'<g fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" '
                   f'stroke-linejoin="round">{body}</g>')
        write(f"icons/{name}.svg", svg(96, 96, content, scale=1))
    # ícone do app
    b = ['<rect width="512" height="512" rx="112" fill="#2e4f8f"/>',
         '<circle cx="256" cy="300" r="150" fill="#3d63a8"/>',
         '<path d="M150,330 A106,106 0 0 1 362,330 Z" fill="#f3c55e"/>',
         '<path d="M0,330 H512 V512 H0 Z" fill="#2e4f8f"/>',
         '<path d="M0,340 C120,300 200,350 290,320 C380,290 440,320 512,300 V512 H0 Z" fill="#5f8a4a"/>',
         '<path d="M196,512 C210,440 300,420 270,340" stroke="#fbf5e6" stroke-width="34" fill="none" stroke-linecap="round"/>',
         '<rect x="248" y="150" width="16" height="84" rx="5" fill="#fbf5e6"/>',
         '<rect x="226" y="172" width="60" height="16" rx="5" fill="#fbf5e6"/>']
    write("icons/app_icon.svg", svg(512, 512, "\n".join(b), scale=1))


if __name__ == "__main__":
    print("Gerando arte provisória:")
    background()
    world_map()
    characters()
    icons()
    print("Pronto.")
